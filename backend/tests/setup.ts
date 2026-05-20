import mongoose from 'mongoose';
import { connectMongo, closeMongo } from '../src/db/connection';

beforeAll(async () => {
  await connectMongo();
});

afterEach(async () => {
  const { collections } = mongoose.connection;
  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({})),
  );
});

afterAll(async () => {
  await closeMongo();
});
