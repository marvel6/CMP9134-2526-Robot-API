import { api } from '../client'
import { accessTokenCookie } from '../../utils/cookies'

export interface TokenData {
  access_token: string
  refresh_token: string
}

export type UserRole = 'VIEWER' | 'COMMANDER'

export interface SessionData {
  id: string
  full_name: string | null
  email: string
  role: UserRole
}

export function getSessionV1(): Promise<SessionData> {
  return api.get<SessionData>('/v1/auth/session')
}

export function loginV1(email: string, password: string): Promise<TokenData> {
  return api.post<TokenData>('/v1/auth/login', { email, password })
}

export function registerV1(
  full_name: string,
  email: string,
  password: string,
): Promise<TokenData> {
  return api.post<TokenData>('/v1/auth/register', {
    full_name,
    email,
    password,
  })
}

export function refreshTokenV1(): Promise<TokenData> {
  return api.post<TokenData>('/v1/auth/refresh-token')
}

export async function logoutV1(): Promise<void> {
  await api.post<null>('/v1/auth/logout')
  accessTokenCookie.remove()
  localStorage.removeItem('refresh_token')
}
