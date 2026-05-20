import request from 'supertest';
import { AuditLog } from '../../src/db/models/AuditLog';
import { bearer, getTestApp, registerCommander, registerUser } from '../helpers';

describe('Audit log API', () => {
  const app = getTestApp();

  it('forbids viewers from listing audit logs', async () => {
    const { tokens } = await registerUser();

    const res = await request(app)
      .get('/v1/audit-log/')
      .set(bearer(tokens.access_token));

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/COMMANDER/i);
  });

  it('returns paginated audit logs for commanders', async () => {
    const { tokens, userId } = await registerCommander();

    await AuditLog.create({
      action: 'LOGIN',
      navigation_direction: null,
      user_id: userId,
    });
    await AuditLog.create({
      action: 'COMMAND',
      navigation_direction: 'UP',
      user_id: userId,
    });

    const res = await request(app)
      .get('/v1/audit-log/?page=1&limit=10')
      .set(bearer(tokens.access_token));

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Get all Audit Logs');
    expect(res.body.data.results).toHaveLength(2);
    expect(res.body.data.meta.total).toBe(2);
    expect(res.body.data.results[0].user.full_name).toBe('Test Operator');
    expect(res.body.data.results.some((e: { action: string }) => e.action === 'COMMAND')).toBe(
      true,
    );
  });

  it('requires authentication', async () => {
    const res = await request(app).get('/v1/audit-log/');
    expect(res.status).toBe(401);
  });
});
