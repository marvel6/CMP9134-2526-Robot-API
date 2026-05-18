import { api } from '../client'

export interface AuditLogUserV1 {
  id: string
  full_name: string | null
}

export interface AuditLogEntryV1 {
  id: string
  created_at: string
  updated_at: string
  user_id: string
  user: AuditLogUserV1
  action: string
  navigation_direction: string | null
}

export interface AuditLogMetaV1 {
  total: number
  per_page: number
  last_page: number
  current_page: number
  prev: number | null
  next: number | null
}

export interface AuditLogDataV1 {
  results: AuditLogEntryV1[]
  meta: AuditLogMetaV1
}

export interface GetAuditLogsParamsV1 {
  page?: number
  limit?: number
}

export function getAuditLogsV1(
  params: GetAuditLogsParamsV1 = {},
): Promise<AuditLogDataV1> {
  const { page = 1, limit = 10 } = params
  return api.get<AuditLogDataV1>(`/v1/audit-log/?page=${page}&limit=${limit}`)
}

export interface UpdateUserRoleV1 {
  role: 'VIEWER' | 'COMMANDER'
}

export function updateUserRoleV1(userId: string, body: UpdateUserRoleV1): Promise<null> {
  return api.post<null>(`/v1/admin/user/${userId}/role`, body)
}
