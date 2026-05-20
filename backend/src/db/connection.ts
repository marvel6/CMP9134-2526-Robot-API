import mongoose from 'mongoose';
import { config } from '../config';

mongoose.set('strictQuery', true);

let connected = false;

export async function connectMongo(): Promise<typeof mongoose> {
  if (connected) return mongoose;

  await mongoose.connect(config.mongoUri, {
    serverSelectionTimeoutMS: 5_000,
    autoIndex: true,
  });

  connected = true;
  // eslint-disable-next-line no-console
  console.log('[startup] mongodb connection OK');
  return mongoose;
}

export async function waitForMongo(
  options: { retries?: number; delayMs?: number } = {},
): Promise<void> {
  const { retries = 20, delayMs = 1500 } = options;
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await connectMongo();
      return;
    } catch (err) {
      lastError = err;
      // eslint-disable-next-line no-console
      console.log(
        `[startup] mongodb not ready (attempt ${attempt}/${retries}): ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('mongodb not reachable');
}

export async function closeMongo(): Promise<void> {
  if (!connected) return;
  await mongoose.disconnect();
  connected = false;
}
