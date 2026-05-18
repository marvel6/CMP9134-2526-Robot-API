export type ErrorData = string | Record<string, unknown> | unknown[] | null | undefined;

export class HttpException extends Error {
  readonly statusCode: number;
  readonly data: ErrorData;

  constructor(statusCode: number, message: string, data: ErrorData = null) {
    super(message);
    this.name = 'HttpException';
    this.statusCode = statusCode;
    this.data = data;
  }
}

export class BadRequestException extends HttpException {
  constructor(message: string, data: ErrorData = null) {
    super(400, message, data);
    this.name = 'BadRequestException';
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: string, data: ErrorData = null) {
    super(401, message, data);
    this.name = 'UnauthorizedException';
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string, data: ErrorData = null) {
    super(403, message, data);
    this.name = 'ForbiddenException';
  }
}

export class NotFoundException extends HttpException {
  constructor(message: string, data: ErrorData = null) {
    super(404, message, data);
    this.name = 'NotFoundException';
  }
}

export class ServiceUnavailableException extends HttpException {
  constructor(message: string, data: ErrorData = null) {
    super(503, message, data);
    this.name = 'ServiceUnavailableException';
  }
}

export class TokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TokenError';
  }
}

export class TokenBackendError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TokenBackendError';
  }
}
