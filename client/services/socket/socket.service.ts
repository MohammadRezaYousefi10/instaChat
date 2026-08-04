import { SocketEvent } from "./socket.types";
import {
  SOCKET_HEARTBEAT_INTERVAL,
  SOCKET_MAX_QUEUE_SIZE,
  SOCKET_RECONNECT_INITIAL_DELAY,
  SOCKET_RECONNECT_MAX_DELAY,
} from "./socket.constants";
import { SocketConnectionStatus } from "./socket.connection";
import { SocketEventType } from "./socket.events";

type Listener = (event: SocketEvent) => void;

class SocketService {
  private ws: WebSocket | null = null;

  private listeners = new Set<Listener>();

  private queue: SocketEvent[] = [];

  private connected = false;

  private connecting = false;

  private connectionId = 0;

  currentId = 0;

  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  private reconnectDelay = SOCKET_RECONNECT_INITIAL_DELAY;

  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  private connectionStatus = SocketConnectionStatus.DISCONNECTED;

  private url: string | null = null;

  private connectionListeners = new Set<
    (status: SocketConnectionStatus) => void
  >();

  connect(url: string) {
    //if (!this.connecting) return;

    this.connecting = true;

    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.emitConnection(SocketConnectionStatus.CONNECTING);

    this.ws = new WebSocket(url);

    this.attachEvents();

    this.connectionId++;
    this.currentId = this.connectionId;
  }

  disconnect() {
    console.log('user disconected web socket ')
    this.connected = false;

    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws.close();
      this.ws = null;
    }
    this.emitConnection(SocketConnectionStatus.DISCONNECTED);

    //this.ws?.close();

    //this.ws = null;
  }

  reconnect(url: string) {

    if (!url) return;
    
    if (this.reconnectTimer) return;

    this.emitConnection(SocketConnectionStatus.RECONNECTING);

    this.reconnectTimer = setTimeout(
      () => {
        this.reconnectTimer = null;

        console.log('time to call connect ')
        this.connect(url);

        this.reconnectDelay = Math.min(
          this.reconnectDelay * 2,

          SOCKET_RECONNECT_MAX_DELAY,
        );
      },

      this.reconnectDelay,
    );
  }

  private startHeartbeat() {
    this.stopHeartbeat();

    this.heartbeatTimer = setInterval(
      () => {
        this.send({
          type: SocketEventType.PING,
        });
      },

      SOCKET_HEARTBEAT_INTERVAL,
    );
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);

      this.heartbeatTimer = null;
    }
  }

  send(data: SocketEvent) {
    if (this.connected && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));

      return;
    }

    if (this.queue.length > SOCKET_MAX_QUEUE_SIZE) {
      this.queue.shift();
    }
    this.queue.push(data);
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(event: SocketEvent) {
    this.listeners.forEach((listener) => {
      listener(event);
    });
  }

  private flushQueue() {
    if (!this.ws) return;

    while (
      this.status === SocketConnectionStatus.CONNECTED &&
      this.queue.length
    ) {
      const data = this.queue.shift();

      if (!data) continue;

      this.ws.send(JSON.stringify(data));
    }
  }

  private attachEvents() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log("currentId ", this.currentId);
      console.log("connectionId ", this.connectionId);
      this.reconnectDelay = SOCKET_RECONNECT_INITIAL_DELAY;
      this.startHeartbeat();
      if (this.currentId !== this.connectionId) {
        this.ws?.close();
        return;
      }

      this.connecting = false;

      //this.connected = true;
      this.connected = true;

      this.emitConnection(SocketConnectionStatus.CONNECTED);

      this.flushQueue();
    };

    this.ws.onclose = () => {
      this.stopHeartbeat();
      this.connecting = false;
      this.connected = false;

      this.emitConnection(SocketConnectionStatus.DISCONNECTED);
    };

    this.ws.onerror = () => {
      this.stopHeartbeat();
      this.connecting = false;
      this.connected = false;

      this.emitConnection(SocketConnectionStatus.DISCONNECTED);
    };

    this.ws.onmessage = (e) => {
      const event = JSON.parse(e.data) as SocketEvent;

      this.emit(event);
    };
  }

  get isConnected() {
    return this.connected;
  }

  subscribeConnection(listener: (status: SocketConnectionStatus) => void) {
    this.connectionListeners.add(listener);

    listener(this.connectionStatus);

    return () => {
      this.connectionListeners.delete(listener);
    };
  }

  private emitConnection(status: SocketConnectionStatus) {
    this.connectionStatus = status;

    this.connectionListeners.forEach((listener) => listener(status));
  }

  get status() {
    return this.connectionStatus;
  }
}

export const socketService = new SocketService();
