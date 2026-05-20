import request from 'supertest';
import { getTestApp } from '../helpers';

describe('GET /v1/health', () => {
  const app = getTestApp();

  it('returns envelope health check', async () => {
    const res = await request(app).get('/v1/health/');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      message: 'Health check',
      data: null,
      status_code: 200,
    });
  });

  it('returns plain ok on healthz', async () => {
    const res = await request(app).get('/v1/health/healthz');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
