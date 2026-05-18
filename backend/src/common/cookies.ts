import type { Request, RequestHandler } from 'express';

export function parseCookies(header: string | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (!header) return result;

  for (const part of header.split(';')) {
    const eqIndex = part.indexOf('=');
    if (eqIndex === -1) continue;
    const key = part.slice(0, eqIndex).trim();
    const value = part.slice(eqIndex + 1).trim();
    if (!key) continue;
    try {
      result[key] = decodeURIComponent(value);
    } catch {
      result[key] = value;
    }
  }

  return result;
}

declare module 'express-serve-static-core' {
  interface Request {
    appCookies?: Record<string, string>;
  }
}

export function getCookies(req: Request): Record<string, string> {
  return req.appCookies ?? {};
}

export const cookieParserMiddleware: RequestHandler = (req: Request, _res, next) => {
  req.appCookies = parseCookies(req.headers.cookie);
  next();
};
