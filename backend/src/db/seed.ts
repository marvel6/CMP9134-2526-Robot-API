import bcrypt from 'bcryptjs';
import { config } from '../config';
import { User } from './models/User';

/**
 * Ensure a COMMANDER account exists so the operator can always log in.
 *
 * - If the configured email is missing, we create the account.
 * - If it exists but isn't a COMMANDER, we upgrade it to COMMANDER.
 * - The password is only set the first time we create the user. We never
 *   silently overwrite a password that's already set in the database.
 */
export async function ensureDefaultCommander(): Promise<void> {
  const { email, password, fullName } = config.defaultCommander;
  if (!email || !password) return;

  const normalisedEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: normalisedEmail });

  if (!existing) {
    const hashed = bcrypt.hashSync(password, config.bcryptSaltRounds);
    await User.create({
      email: normalisedEmail,
      full_name: fullName,
      password: hashed,
      role: 'COMMANDER',
      is_active: true,
      is_super_admin: true,
    });
    // eslint-disable-next-line no-console
    console.log(`[seed] created default COMMANDER ${normalisedEmail}`);
    return;
  }

  if (existing.role !== 'COMMANDER' || !existing.is_active) {
    existing.role = 'COMMANDER';
    existing.is_active = true;
    await existing.save();
    // eslint-disable-next-line no-console
    console.log(`[seed] promoted ${normalisedEmail} to COMMANDER`);
  }
}
