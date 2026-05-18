import express, { type Express } from 'express';
import cors from 'cors';
import { config, processCorsOrigins } from './config';
import { cookieParserMiddleware } from './common/cookies';
import { errorHandler } from './common/errorHandler';
import { authRouter } from './modules/auth/auth.routes';
import { healthRouter } from './modules/health/health.routes';
import { mapRouter } from './modules/map/map.routes';
import { robotRouter } from './modules/robot/robot.routes';
import { auditLogRouter } from './modules/audit-log/auditLog.routes';
import { adminRouter } from './modules/admin/admin.routes';

export function createApp(): Express {
  const app = express();

  const origins = processCorsOrigins(config.corsOrigins);
  app.use(
    cors({
      origin: origins === '*' ? true : origins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Authorization', 'Content-Type', 'Cookie'],
    }),
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParserMiddleware);

  app.use('/v1/health', healthRouter);
  app.use('/v1/auth', authRouter);
  app.use('/v1/map', mapRouter);
  app.use('/v1/robot', robotRouter);
  app.use('/v1/audit-log', auditLogRouter);
  app.use('/v1/admin', adminRouter);

  app.use((_req, res) => {
    res.status(404).json({ message: 'Not Found', data: null, status_code: 404 });
  });

  app.use(errorHandler);

  return app;
}
