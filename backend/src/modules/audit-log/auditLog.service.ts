import { AuditLog, type ActionEnum } from '../../db/models/AuditLog';
import { User } from '../../db/models/User';
import { paginate, type PaginatorResult } from '../../common/paginator';

export interface CreateAuditLogInput {
  action: ActionEnum;
  navigation_direction?: string | null;
}

export async function createAuditLog(
  userId: string,
  input: CreateAuditLogInput,
): Promise<void> {
  await AuditLog.create({
    action: input.action,
    navigation_direction: input.navigation_direction ?? null,
    user_id: userId,
  });
}

export interface AuditLogResponseUser {
  id: string;
  full_name: string | null;
}

export interface AuditLogResponseEntry {
  id: string;
  created_at: string;
  updated_at: string;
  action: ActionEnum;
  navigation_direction: string | null;
  user_id: string;
  user: AuditLogResponseUser;
}

interface RawAuditLog {
  _id: { toString(): string };
  action: ActionEnum;
  navigation_direction: string | null;
  user_id: { toString(): string };
  created_at: Date;
  updated_at: Date;
}

export async function getAllAuditLogs(
  page: number,
  limit: number,
): Promise<PaginatorResult<AuditLogResponseEntry>> {
  const result = await paginate(AuditLog, {
    page,
    limit,
    sort: { created_at: -1 },
  });

  const rows = result.results as RawAuditLog[];
  const userIds = Array.from(
    new Set(rows.map((row) => row.user_id?.toString()).filter(Boolean) as string[]),
  );

  const users = userIds.length
    ? await User.find({ _id: { $in: userIds } })
        .select({ _id: 1, full_name: 1 })
        .lean()
    : [];
  const userById = new Map<string, { full_name: string | null }>();
  for (const u of users) {
    userById.set((u._id as { toString(): string }).toString(), {
      full_name: (u as { full_name?: string | null }).full_name ?? null,
    });
  }

  const mapped: AuditLogResponseEntry[] = rows.map((row) => {
    const userId = row.user_id?.toString() ?? '';
    const populated = userById.get(userId);
    return {
      id: row._id.toString(),
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString(),
      action: row.action,
      navigation_direction: row.navigation_direction,
      user_id: userId,
      user: { id: userId, full_name: populated?.full_name ?? null },
    };
  });

  return { results: mapped, meta: result.meta };
}
