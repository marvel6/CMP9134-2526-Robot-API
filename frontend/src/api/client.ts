import axios, { type AxiosInstance } from 'axios'
import { accessTokenCookie } from '../utils/cookies'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly data?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Standard envelope returned by the Node.js backend.
 *   { message, data, status_code }
 */
export interface ApiEnvelope<T> {
  message: string
  data: T
  status_code: number
}

const client: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Cookies (e.g. refresh_token) need to be sent on auth requests.
  withCredentials: true,
})

client.interceptors.request.use((config) => {
  const token = accessTokenCookie.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status ?? 500
    const data = error.response?.data
    const message =
      data?.message ??
      data?.detail ??
      error.message ??
      `HTTP ${status}`
    throw new ApiError(status, message, data?.data ?? null)
  },
)

async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const res = await promise
  return res.data.data
}

export const api = {
  /** Returns the unwrapped `data` field from the standard envelope. */
  get: <T>(path: string) => unwrap<T>(client.get<ApiEnvelope<T>>(path)),
  post: <T>(path: string, body?: unknown) =>
    unwrap<T>(client.post<ApiEnvelope<T>>(path, body ?? {})),
}
