export interface HttpResponseBody<T> {
  message: string;
  data: T;
  status_code: number;
}

export function httpResponse<T>(message: string, data: T, statusCode = 200): HttpResponseBody<T> {
  return { message, data, status_code: statusCode };
}
