import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query, withTransaction } from '../models/db';
import { cache } from '../models/redis';
import { AppError } from '../utils/errors';
import { auditLog } from '../services/audit.service';

// ── Login ─────────────────────────────────────────────────────────────────
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    // Load user + care home
    const { rows } = await query(
      `SELECT u.id, u.email, u.password_hash, u.role, u.care_home_id,
              u.first_name, u.last_name, u.active, u.deleted_at,
              ch.name AS care_home_name, ch.active AS home_active
       FROM users u
       JOIN care_homes ch ON ch.id = u.care_home_id
       WHERE u.email = $1`,
      [email.toLowerCase().trim()]
    );

    const user = rows[0];
    if (!user || user.deleted_at || !user.active || !user.home_active) {
      throw new AppError(401, 'Invalid email or password');
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new AppError(401, 'Invalid email or password');

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user.id, req);

    // Update last_login
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    await auditLog({
      careHomeId: user.care_home_id,
      actorId: user.id,
      actorName: `${user.first_name} ${user.last_name}`,
      action: 'USER_LOGIN',
      entityType: 'user',
      entityId: user.id,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        careHomeId: user.care_home_id,
        careHomeName: user.care_home_name,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

// ── Refresh access token ──────────────────────────────────────────────────
export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken: token } = req.body;
    if (!token) throw new AppError(400, 'Refresh token required');

    // Hash and look up
    const tokenHash = hashToken(token);
    const { rows } = await query(
      `SELECT rt.user_id, rt.expires_at, rt.revoked,
              u.id, u.email, u.role, u.care_home_id, u.first_name, u.last_name, u.active
       FROM refresh_tokens rt
       JOIN users u ON u.id = rt.user_id
       WHERE rt.token_hash = $1`,
      [tokenHash]
    );

    const record = rows[0];
    if (!record || record.revoked || new Date(record.expires_at) < new Date()) {
      throw new AppError(401, 'Invalid or expired refresh token');
    }
    if (!record.active) throw new AppError(401, 'User deactivated');

    const newAccessToken = generateAccessToken(record);
    const newRefreshToken = await generateRefreshToken(record.user_id, req);

    // Rotate: revoke old refresh token
    await query('UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = $1', [tokenHash]);

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    next(err);
  }
}

// ── Logout ────────────────────────────────────────────────────────────────
export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      // Blacklist the access token for its remaining lifetime
      try {
        const payload: any = jwt.decode(token);
        const ttl = payload?.exp ? payload.exp - Math.floor(Date.now() / 1000) : 900;
        if (ttl > 0) await cache.set(`blacklist:${token}`, true, ttl);
      } catch {}
    }

    // Revoke all refresh tokens for this user
    if (req.user) {
      await query('UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1', [req.user.id]);
      await cache.del(`user:${req.user.id}`);
    }

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

// ── Change password ───────────────────────────────────────────────────────
export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.id;

    const { rows } = await query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!valid) throw new AppError(400, 'Current password is incorrect');

    const hash = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS || '12'));
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, userId]);
    await query('UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1', [userId]);
    await cache.del(`user:${userId}`);

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
}

// ── Token generators ──────────────────────────────────────────────────────
function generateAccessToken(user: any): string {
  return jwt.sign(
    { sub: user.id, role: user.role, careHomeId: user.care_home_id },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
}

async function generateRefreshToken(userId: string, req: Request): Promise<string> {
  const token = uuidv4() + '-' + uuidv4();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, tokenHash, expiresAt, req.ip, req.get('user-agent')]
  );

  return token;
}

function hashToken(token: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(token).digest('hex');
}
