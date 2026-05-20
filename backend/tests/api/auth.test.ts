import request from 'supertest';
import { bearer, getTestApp, registerUser } from '../helpers';

describe('Auth API', () => {
  const app = getTestApp();

  it('registers a new viewer', async () => {
    const res = await request(app)
      .post('/v1/auth/register')
      .send({
        full_name: 'New Viewer',
        email: 'viewer@test.local',
        password: 'password123',
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Register successfully');
    expect(res.body.data.access_token).toBeDefined();
    expect(res.body.data.refresh_token).toBeDefined();
    const cookies = res.headers['set-cookie'];
    const cookieHeader = Array.isArray(cookies) ? cookies.join(';') : String(cookies ?? '');
    expect(cookieHeader).toContain('refresh_token=');
  });

  it('rejects duplicate email on register', async () => {
    await registerUser({ email: 'dup@test.local' });
    const res = await request(app)
      .post('/v1/auth/register')
      .send({
        full_name: 'Another',
        email: 'dup@test.local',
        password: 'password123',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/email already taken/i);
  });

  it('logs in and returns session', async () => {
    const { email, tokens } = await registerUser({ email: 'login@test.local' });

    const loginRes = await request(app)
      .post('/v1/auth/login')
      .send({ email, password: 'password123' });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.access_token).toBeDefined();

    const sessionRes = await request(app)
      .get('/v1/auth/session')
      .set(bearer(tokens.access_token));

    expect(sessionRes.status).toBe(200);
    expect(sessionRes.body.data.email).toBe(email.toLowerCase());
    expect(sessionRes.body.data.role).toBe('VIEWER');
  });

  it('refreshes tokens using cookie', async () => {
    const res = await request(app)
      .post('/v1/auth/register')
      .send({
        full_name: 'Refresh User',
        email: 'refresh@test.local',
        password: 'password123',
      });

    const cookie = res.headers['set-cookie'];
    const refreshRes = await request(app)
      .post('/v1/auth/refresh-token')
      .set('Cookie', cookie)
      .send({});

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.data.access_token).toBeDefined();
    expect(refreshRes.body.data.refresh_token).toBeDefined();
  });

  it('logs out successfully', async () => {
    const res = await request(app)
      .post('/v1/auth/register')
      .send({
        full_name: 'Logout User',
        email: 'logout@test.local',
        password: 'password123',
      });

    const tokens = res.body.data;
    const cookie = res.headers['set-cookie'];

    const logoutRes = await request(app)
      .post('/v1/auth/logout')
      .set(bearer(tokens.access_token))
      .set('Cookie', cookie);

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.message).toBe('Logged out successfully');
  });
});
