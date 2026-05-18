import { Sequelize } from 'sequelize';
import { config } from '../config';

export const sequelize = new Sequelize(config.databaseUrl, {
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30_000,
    idle: 10_000,
  },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true,
  },
});

export async function pingDatabase(): Promise<void> {
  await sequelize.authenticate();
}

/**
 * Wait for Postgres to become reachable. Useful at boot under Docker Compose,
 * where the database container starts at roughly the same time as the backend
 * and may not be accepting connections for a few seconds.
 */
export async function waitForDatabase(
  options: { retries?: number; delayMs?: number } = {},
): Promise<void> {
  const { retries = 20, delayMs = 1500 } = options;
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await sequelize.authenticate();
      return;
    } catch (err) {
      lastError = err;
      // eslint-disable-next-line no-console
      console.log(
        `[startup] database not ready (attempt ${attempt}/${retries}): ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('database not reachable');
}
