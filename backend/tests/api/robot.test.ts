import request from 'supertest';
import { bearer, getTestApp, registerCommander, registerUser } from '../helpers';

const mockSet = jest.fn().mockResolvedValue('OK');
const mockDel = jest.fn().mockResolvedValue(1);

jest.mock('../../src/cache/redis', () => ({
  getRedis: () => ({
    set: mockSet,
    del: mockDel,
  }),
}));

jest.mock('axios', () => ({
  get: jest.fn().mockResolvedValue({ data: { position: { x: 5, y: 5 } } }),
  post: jest.fn().mockResolvedValue({ data: {} }),
}));

describe('Robot API', () => {
  const app = getTestApp();

  beforeEach(() => {
    mockSet.mockClear();
    mockDel.mockClear();
  });

  it('forbids viewers from moving the robot', async () => {
    const { tokens } = await registerUser();

    const res = await request(app)
      .post('/v1/robot/move/')
      .set(bearer(tokens.access_token))
      .send({ navigation: 'UP' });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/COMMANDER/i);
  });

  it('allows commanders to move the robot', async () => {
    const { tokens } = await registerCommander();

    const res = await request(app)
      .post('/v1/robot/move/')
      .set(bearer(tokens.access_token))
      .send({ navigation: 'RIGHT' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Move Robot');
    expect(mockSet).toHaveBeenCalled();
  });
});
