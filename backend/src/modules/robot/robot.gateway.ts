import WebSocket from 'ws';
import { config } from '../../config';
import { socketManager, WsMessageType } from '../../socket/manager';

function toWebSocketUrl(url: string): string {
  if (url.startsWith('https://')) return url.replace(/^https:\/\//, 'wss://');
  if (url.startsWith('http://')) return url.replace(/^http:\/\//, 'ws://');
  return url;
}

interface TelemetryDataPayload {
  position: { x: number; y: number };
  battery: number;
  status: string;
  sensors: { N: number; S: number; E: number; W: number; lidar: number[] };
}

let active = false;
let stopped = false;

export function startRobotTelemetry(): void {
  if (active) return;
  active = true;
  stopped = false;
  void connectLoop();
}

export async function stopRobotTelemetry(): Promise<void> {
  stopped = true;
}

async function connectLoop(): Promise<void> {
  while (!stopped) {
    try {
      await runConnection();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Telemetry error:', err instanceof Error ? err.message : err);
      socketManager.broadcast('robot', { type: WsMessageType.ERROR, data: null });
    }
    await sleep(1_000);
  }
}

function runConnection(): Promise<void> {
  return new Promise((resolve, reject) => {
    const upstreamUrl = `${toWebSocketUrl(config.baseRobotApiUrl)}/ws/telemetry`;
    const upstream = new WebSocket(upstreamUrl);

    upstream.on('open', () => {
      // eslint-disable-next-line no-console
      console.log('[telemetry] connected to', upstreamUrl);
    });

    upstream.on('message', (raw) => {
      try {
        const parsed = JSON.parse(raw.toString()) as TelemetryDataPayload;
        socketManager.broadcast('robot', {
          type: WsMessageType.TELEMETRY,
          data: parsed,
        });
      } catch {
        // ignore malformed frames
      }
    });

    upstream.on('error', (err) => {
      reject(err);
    });

    upstream.on('close', () => {
      resolve();
    });
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
