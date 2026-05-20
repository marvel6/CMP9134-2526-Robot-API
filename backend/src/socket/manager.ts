import { v4 as uuidv4 } from 'uuid';
import type { WebSocket } from 'ws';

export type Channel = 'robot';

export const WsMessageType = {
  TELEMETRY: 'TELEMETRY',
  ERROR: 'ERROR',
} as const;

export type WsMessageType = (typeof WsMessageType)[keyof typeof WsMessageType];

export interface WsMessage<T> {
  type: WsMessageType;
  data: T;
}

interface Connection {
  id: string;
  socket: WebSocket;
}

const connections = new Map<Channel, Connection[]>();

export function connect(channel: Channel, socket: WebSocket): string {
  const id = uuidv4();
  const existing = connections.get(channel) ?? [];
  existing.push({ id, socket });
  connections.set(channel, existing);
  return id;
}

export function disconnect(channel: Channel, id: string): void {
  const existing = connections.get(channel);
  if (!existing) return;
  connections.set(
    channel,
    existing.filter((conn) => conn.id !== id),
  );
}

export function broadcast<T>(channel: Channel, message: WsMessage<T>): void {
  const payload = JSON.stringify(message);
  for (const conn of connections.get(channel) ?? []) {
    if (conn.socket.readyState === conn.socket.OPEN) {
      try {
        conn.socket.send(payload);
      } catch {
        // socket closed mid-flight — ignore
      }
    }
  }
}
