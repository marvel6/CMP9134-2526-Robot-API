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
): Promise<AuditLog> {
  return AuditLog.create({
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

export async function getAllAuditLogs(
  page: number,
  limit: number,
): Promise<PaginatorResult<AuditLogResponseEntry>> {
  const result = await paginate(AuditLog, {
    page,
    limit,
    findOptions: {
      include: [{ model: User, as: 'user', required: false }],
      order: [['created_at', 'DESC']],
    },
  });

  const mapped: AuditLogResponseEntry[] = result.results.map((entry) => {
    const user = (entry as unknown as { user?: User }).user ?? null;
    return {
      id: entry.id,
      created_at: entry.created_at.toISOString(),
      updated_at: entry.updated_at.toISOString(),
      action: entry.action,
      navigation_direction: entry.navigation_direction,
      user_id: entry.user_id,
      user: {
        id: entry.user_id,
        full_name: user?.full_name ?? null,
      },
    };
  });

  return { results: mapped, meta: result.meta };
}
