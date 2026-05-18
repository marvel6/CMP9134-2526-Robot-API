import { sequelize } from './sequelize';
// Importing models registers them with Sequelize before sync().
import './models';

/**
 * Creates any missing tables in the database. Intentionally additive (no
 * `force`, no `alter`) so it is safe to re-run on every boot: existing tables
 * are left untouched and only missing ones are created.
 */
export async function ensureSchema(): Promise<void> {
  await sequelize.sync();
}
