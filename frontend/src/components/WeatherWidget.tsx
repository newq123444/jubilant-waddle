// src/components/WeatherWidget.tsx - Beautiful weather widget with care-relevant alerts
import React, { useState, useEffect, useMemo } from 'react';

interface WeatherDay {
  day: string;
  temp: number;
  low: number;
  condition: 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'stormy';
  humidity: number;
  wind: number;
  icon: string;
}

interface CareAlert {
  type: 'cold' | 'heat' | 'uv' | 'wind' | 'ice' | 'rain';
  message: string;
  severity: 'info' | 'warning' | 'urgent';
  icon: string;
}

export default function WeatherWidget() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Simulated Salford, UK weather data
  const currentWeather = useMemo(() => {
    const month = currentTime.getMonth();
    // Seasonal temperature simulation for Salford
    const baseTemps: Record<number, number> = {
      0: 5, 1: 6, 2: 8, 3: 11, 4: 14, 5: 17,
      6: 19, 7: 19, 8: 16, 9: 12, 10: 8, 11: 6
    };
    const conditions: Array<'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'stormy'> = ['cloudy', 'partly-cloudy', 'rainy', 'sunny', 'stormy'];
    const conditionIndex = month >= 10 || month <= 2 ? 0 : month >= 5 && month <= 8 ? 1 : 2;
    return {
      temp: baseTemps[month] + Math.round((Math.sin(currentTime.getHours() / 3.8) * 3)),
      feelsLike: baseTemps[month] + Math.round((Math.sin(currentTime.getHours() / 3.8) * 3)) - 2,
      humidity: 72 + Math.round(Math.sin(currentTime.getDate()) * 10),
      wind: 8 + Math.round(Math.cos(currentTime.getDate()) * 5),
      condition: conditions[conditionIndex],
      pressure: 1013 + Math.round(Math.sin(currentTime.getDate() / 3) * 8),
      visibility: 'Good',
      uvIndex: month >= 5 && month <= 8 ? 5 : 1,
    };
  }, [currentTime]);

  const forecast: WeatherDay[] = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = currentTime.getDay();
    return [
      { day: 'Today', temp: currentWeather.temp, low: currentWeather.temp - 4, condition: currentWeather.condition, humidity: currentWeather.humidity, wind: currentWeather.wind, icon: currentWeather.condition === 'sunny' ? '☀️' : currentWeather.condition === 'partly-cloudy' ? '⛅' : currentWeather.condition === 'rainy' ? '🌧️' : '☁️' },
      { day: days[(today + 1) % 7], temp: currentWeather.temp + 1, low: currentWeather.temp - 3, condition: 'partly-cloudy', humidity: 68, wind: 12, icon: '⛅' },
      { day: days[(today + 2) % 7], temp: currentWeather.temp - 1, low: currentWeather.temp - 5, condition: 'rainy', humidity: 82, wind: 15, icon: '🌧️' },
    ];
  }, [currentWeather, currentTime]);

  const careAlerts: CareAlert[] = useMemo(() => {
    const alerts: CareAlert[] = [];
    if (currentWeather.temp <= 5) {
      alerts.push({ type: 'cold', message: 'Cold weather protocol active. Check heating in all rooms and ensure residents have warm clothing.', severity: 'warning', icon: '🥶' });
    }
    if (currentWeather.temp <= 2) {
      alerts.push({ type: 'ice', message: 'Potential ice on paths. Salt walkways and advise residents to avoid outdoor areas.', severity: 'urgent', icon: '🧊' });
    }
    if (currentWeather.temp >= 25) {
      alerts.push({ type: 'heat', message: 'High temperature alert. Increase fluid rounds and close blinds in south-facing rooms.', severity: 'warning', icon: '🌡️' });
    }
    if (currentWeather.uvIndex >= 4) {
      alerts.push({ type: 'uv', message: 'High UV levels today. Residents should wear hats and sunscreen if going outdoors.', severity: 'info', icon: '☀️' });
    }
    if (currentWeather.wind >= 15) {
      alerts.push({ type: 'wind', message: 'Strong winds expected. Secure garden furniture and consider keeping residents indoors.', severity: 'info', icon: '💨' });
    }
    if (currentWeather.condition === 'rainy') {
      alerts.push({ type: 'rain', message: 'Wet conditions. Ensure non-slip mats at all entrances and dry floors promptly.', severity: 'info', icon: '🌧️' });
    }
    if (alerts.length === 0) {
      alerts.push({ type: 'info' as any, message: 'No weather-related care concerns today. Conditions suitable for outdoor activities.', severity: 'info', icon: '✅' });
    }
    return alerts;
  }, [currentWeather]);

  const getGradient = () => {
    const hour = currentTime.getHours();
    if (hour >= 6 && hour < 12) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    if (hour >= 12 && hour < 17) return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
    if (hour >= 17 && hour < 20) return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
    return 'linear-gradient(135deg, #0c3483 0%, #a2b6df 100%)';
  };

  const getConditionIcon = () => {
    const hour = currentTime.getHours();
    if (currentWeather.condition === 'rainy') return '🌧️';
    if (currentWeather.condition === 'stormy') return '⛈️';
    if (currentWeather.condition === 'cloudy') return '☁️';
    if (hour >= 20 || hour < 6) return '🌙';
    if (currentWeather.condition === 'sunny') return '☀️';
    return '⛅';
  };

  const getSeverityStyle = (severity: string) => {
    if (severity === 'urgent') return { bg: '#fef2f2', border: '#fecaca', color: '#dc2626' };
    if (severity === 'warning') return { bg: '#fffbeb', border: '#fde68a', color: '#d97706' };
    return { bg: '#eff6ff', border: '#bfdbfe', color: '#2563eb' };
  };

  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,.08)' }}>
      {/* Main Weather Display */}
      <div style={{ background: getGradient(), padding: '20px 24px', color: '#fff', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.85, letterSpacing: 0.5 }}>SALFORD, GREATER MANCHESTER</div>
            <div style={{ fontSize: 42, fontWeight: 900, lineHeight: 1.1, marginTop: 4 }}>
              {currentWeather.temp}°C
            </div>
            <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
              Feels like {currentWeather.feelsLike}°C
            </div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2, textTransform: 'capitalize' }}>
              {currentWeather.condition.replace('-', ' ')}
            </div>
          </div>
          <div style={{ fontSize: 52, textShadow: '0 2px 10px rgba(0,0,0,.2)' }}>
            {getConditionIcon()}
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ display: 'flex', gap: 16, marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,.2)' }}>
          <div style={{ fontSize: 11, opacity: 0.9 }}>
            <span style={{ opacity: 0.7 }}>Humidity</span>
            <div style={{ fontWeight: 700 }}>{currentWeather.humidity}%</div>
          </div>
          <div style={{ fontSize: 11, opacity: 0.9 }}>
            <span style={{ opacity: 0.7 }}>Wind</span>
            <div style={{ fontWeight: 700 }}>{currentWeather.wind} mph</div>
          </div>
          <div style={{ fontSize: 11, opacity: 0.9 }}>
            <span style={{ opacity: 0.7 }}>Pressure</span>
            <div style={{ fontWeight: 700 }}>{currentWeather.pressure} hPa</div>
          </div>
          <div style={{ fontSize: 11, opacity: 0.9 }}>
            <span style={{ opacity: 0.7 }}>UV Index</span>
            <div style={{ fontWeight: 700 }}>{currentWeather.uvIndex}</div>
          </div>
        </div>
      </div>

      {/* 3-Day Forecast */}
      <div style={{ padding: '14px 24px', background: '#fff', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, letterSpacing: 0.5 }}>3-DAY FORECAST</div>
        <div style={{ display: 'flex', gap: 0 }}>
          {forecast.map((day, i) => (
            <div key={day.day} style={{ flex: 1, textAlign: 'center', padding: '8px 4px', borderRight: i < forecast.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>{day.day}</div>
              <div style={{ fontSize: 22, margin: '4px 0' }}>{day.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>{day.temp}°</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{day.low}°</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{day.wind}mph</div>
            </div>
          ))}
        </div>
      </div>

      {/* Care-Relevant Alerts */}
      <div style={{ padding: '14px 24px 16px', background: '#fafafa' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, letterSpacing: 0.5 }}>CARE ALERTS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {careAlerts.map((alert, i) => {
            const style = getSeverityStyle(alert.severity);
            return (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 8, background: style.bg, border: `1px solid ${style.border}`, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{alert.icon}</span>
                <div style={{ fontSize: 12, color: style.color, fontWeight: 500, lineHeight: 1.4 }}>
                  {alert.message}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
