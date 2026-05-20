import request from 'supertest';
import type { Express } from 'express';
import { createApp } from '../src/app';
import { User } from '../src/db/models/User';
import type { TokenSchema } from '../src/token/tokens';

let cachedApp: Express | null = null;

export function getTestApp(): Express {
  if (!cachedApp) {
    cachedApp = createApp();
  }
  return cachedApp;
}

export interface RegisteredUser {
  email: string;
  tokens: TokenSchema;
  userId: string;
}

export async function registerUser(
  overrides: Partial<{ email: string; full_name: string; password: string }> = {},
): Promise<RegisteredUser> {
  const app = getTestApp();
  const email = overrides.email ?? `user-${Date.now()}-${Math.random().toString(36).slice(2)}@test.local`;
  const res = await request(app)
    .post('/v1/auth/register')
    .send({
      full_name: overrides.full_name ?? 'Test Operator',
      email,
      password: overrides.password ?? 'password123',
    });

  expect(res.status).toBe(200);
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new Error('User not found after register');

  return {
    email,
    tokens: res.body.data as TokenSchema,
    userId: user._id.toString(),
  };
}

export async function registerCommander(
  overrides: Partial<{ email: string }> = {},
): Promise<RegisteredUser> {
  const registered = await registerUser(overrides);
  await User.findByIdAndUpdate(registered.userId, { role: 'COMMANDER' });
  return registered;
}

export function bearer(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}
