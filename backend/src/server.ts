import 'reflect-metadata';
import http from 'http';
import { WebSocketServer } from 'ws';
import { createApp } from './app';
import { config } from './config';
import { waitForDatabase } from './db/sequelize';
import { ensureSchema } from './db/initSchema';
import { waitForRedis, closeRedis } from './cache/redis';
import { socketManager } from './socket/manager';
import { startRobotTelemetry, stopRobotTelemetry } from './modules/robot/robot.gateway';

async function main(): Promise<void> {
  await waitForDatabase();
  // eslint-disable-next-line no-console
  console.log('[startup] database connection OK');

  await ensureSchema();
  // eslint-disable-next-line no-console
  console.log('[startup] schema ready');

  try {
    await waitForRedis();
    // eslint-disable-next-line no-console
    console.log('[startup] redis connection OK');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[startup] redis not reachable, continuing:', err instanceof Error ? err.message : err);
  }

  const app = createApp();
  const server = http.createServer(app);

  // Single WebSocket server handling browser clients on /v1/robot/.
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const url = request.url ?? '';
    // Accept both `/v1/robot` and `/v1/robot/` for client compatibility.
    if (url === '/v1/robot' || url === '/v1/robot/' || url.startsWith('/v1/robot?')) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on('connection', (ws) => {
    const id = socketManager.connect('robot', ws);

    ws.on('close', () => {
      socketManager.disconnect('robot', id);
    });

    // Ignore client messages — broadcasting is driven by the upstream gateway.
    ws.on('message', () => undefined);
  });

  startRobotTelemetry();

  server.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[startup] ${config.appName} listening on :${config.port}`);
  });

  const shutdown = async (signal: string) => {
    // eslint-disable-next-line no-console
    console.log(`[shutdown] received ${signal}, closing`);
    await stopRobotTelemetry();
    wss.close();
    server.close();
    await closeRedis();
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[startup] fatal:', err);
  process.exit(1);
});
