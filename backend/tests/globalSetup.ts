import { MongoMemoryServer } from 'mongodb-memory-server';

declare global {
  // eslint-disable-next-line no-var
  var __MONGO_INSTANCE__: MongoMemoryServer;
}

export default async function globalSetup(): Promise<void> {
  const instance = await MongoMemoryServer.create();
  global.__MONGO_INSTANCE__ = instance;
  process.env.MONGODB_URI = instance.getUri();
  process.env.JWT_SECRET_KEY = process.env.JWT_SECRET_KEY ?? 'test-jwt-secret-key';
  process.env.REDIS_URL = process.env.REDIS_URL ?? 'redis://127.0.0.1:6379';
  process.env.BASE_ROBOT_API_URL = process.env.BASE_ROBOT_API_URL ?? 'http://127.0.0.1:5555';
  process.env.NODE_ENV = 'test';
}
