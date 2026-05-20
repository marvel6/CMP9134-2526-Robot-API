import dotenv from 'dotenv';

dotenv.config();

export type EnvironmentType = 'development' | 'production';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const config = {
  appName: 'cmp9134-2526-backend',
  appIss: 'cmp9134-2526-backend',
  appVersion: '0.0.2',
  environment: (process.env.NODE_ENV ?? 'development') as EnvironmentType,

  port: Number.parseInt(optional('PORT', '8000'), 10),

  bcryptSaltRounds: 10,

  jwt: {
    secret: required('JWT_SECRET_KEY'),
    algorithm: 'HS256' as const,
    accessTokenExpiresInSeconds: 60 * 60, // 1 hour
    refreshTokenExpiresInSeconds: 60 * 60 * 24 * 7, // 7 days
    rotateRefreshToken: true,
  },

  mongoUri: required('MONGODB_URI'),

  redisUrl: required('REDIS_URL'),

  corsOrigins: optional('CORS_ORIGINS', '*'),

  baseRobotApiUrl: required('BASE_ROBOT_API_URL'),

  /**
   * On boot we ensure at least one COMMANDER account exists so that the
   * operator can log in immediately. If no record matches the email we
   * create one with the given password.
   */
  defaultCommander: {
    email: optional('DEFAULT_COMMANDER_EMAIL', 'commander@robocontrol.local'),
    password: optional('DEFAULT_COMMANDER_PASSWORD', 'commander123'),
    fullName: optional('DEFAULT_COMMANDER_NAME', 'Default Commander'),
  },
};

export function processCorsOrigins(value: string): string[] | '*' {
  const defaults = [
    'http://localhost',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8080',
  ];

  if (!value) return defaults;
  if (value === '*') return '*';

  if (value.startsWith('[') && value.endsWith(']')) {
    try {
      const parsed = JSON.parse(value) as string[];
      return [...defaults, ...parsed];
    } catch {
      return defaults;
    }
  }

  return [
    ...defaults,
    ...value
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  ];
}
