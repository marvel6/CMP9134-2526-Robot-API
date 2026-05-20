import http from 'http';
import { WebSocketServer } from 'ws';
import { createApp } from './app';
import { config } from './config';
import { waitForMongo, closeMongo } from './db/connection';
import { ensureDefaultCommander } from './db/seed';
import { waitForRedis, closeRedis } from './cache/redis';
import { connect, disconnect } from './socket/manager';
import { startRobotTelemetry, stopRobotTelemetry } from './modules/robot/robot.gateway';

async function main(): Promise<void> {
  await waitForMongo();

  await ensureDefaultCommander();

  try {
    await waitForRedis();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      '[startup] redis not reachable, continuing without it:',
      err instanceof Error ? err.message : err,
    );
  }

  const app = createApp();
  const server = http.createServer(app);

  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const url = request.url ?? '';
    if (url === '/v1/robot' || url === '/v1/robot/' || url.startsWith('/v1/robot?')) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on('connection', (ws) => {
    const id = connect('robot', ws);

    ws.on('close', () => {
      disconnect('robot', id);
    });

    ws.on('message', () => undefined);
  });

  startRobotTelemetry();

  server.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[startup] ${config.appName} listening on :${config.port}`);
    // eslint-disable-next-line no-console
    console.log(
      `[startup] default commander email: ${config.defaultCommander.email}`,
    );
  });

  const shutdown = async (signal: string) => {
    // eslint-disable-next-line no-console
    console.log(`[shutdown] received ${signal}, closing`);
    await stopRobotTelemetry();
    wss.close();
    server.close();
    await closeRedis();
    await closeMongo();
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
