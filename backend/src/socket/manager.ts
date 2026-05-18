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

class SocketConnectionManager {
  private readonly connections = new Map<Channel, Connection[]>();

  connect(channel: Channel, socket: WebSocket): string {
    const id = uuidv4();
    const existing = this.connections.get(channel) ?? [];
    existing.push({ id, socket });
    this.connections.set(channel, existing);
    return id;
  }

  disconnect(channel: Channel, id: string): void {
    const existing = this.connections.get(channel);
    if (!existing) return;
    this.connections.set(
      channel,
      existing.filter((conn) => conn.id !== id),
    );
  }

  broadcast<T>(channel: Channel, message: WsMessage<T>): void {
    const payload = JSON.stringify(message);
    for (const conn of this.connections.get(channel) ?? []) {
      if (conn.socket.readyState === conn.socket.OPEN) {
        try {
          conn.socket.send(payload);
        } catch {
          // socket closed mid-flight — ignore
        }
      }
    }
  }
}

export const socketManager = new SocketConnectionManager();
