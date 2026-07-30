import { SocketEvent } from "./socket.types";
import { SOCKET_MAX_QUEUE_SIZE } from "./socket.constants";
import { SocketConnectionStatus } from "./socket.connection";

type Listener = (event: SocketEvent) => void;

class SocketService {

    private ws: WebSocket | null = null;

    private listeners = new Set<Listener>();

    private queue: object[] = [];

    private connected = false;

    private connectionStatus =
    SocketConnectionStatus.DISCONNECTED;

    private connectionListeners =
    new Set<
        (
            status: SocketConnectionStatus
        )=>void
    >();

    connect(url: string) {

        if (
            this.ws &&
            (
                this.ws.readyState === WebSocket.OPEN ||
                this.ws.readyState === WebSocket.CONNECTING
            )
        ) {
            return;
        }

        this.emitConnection(
    SocketConnectionStatus.CONNECTING
);

        this.ws = new WebSocket(url);

        this.attachEvents();

    }

    disconnect() {

        this.connected = false;

        this.ws?.close();

        this.ws = null;

    }

        send(data: object) {

        if (
            this.connected &&
            this.ws?.readyState === WebSocket.OPEN
        ) {

            this.ws.send(
                JSON.stringify(data)
            );

            return;

        }

        if (
            this.queue.length <
            SOCKET_MAX_QUEUE_SIZE
        ) {

            this.queue.push(data);

        }

    }

    subscribe(listener: Listener) {

        this.listeners.add(listener);

        return () => {

            this.listeners.delete(listener);

        };

    }

    private emit(event: SocketEvent) {

        this.listeners.forEach(listener => {

            listener(event);

        });

    }

    private flushQueue() {

        while (

            this.connected &&

            this.queue.length

        ) {

            const data = this.queue.shift();

            if (!data) continue;

            this.ws?.send(
                JSON.stringify(data)
            );

        }

    }

    private attachEvents() {

        if (!this.ws) return;

        this.ws.onopen = () => {

            //this.connected = true;
        this.connected=true;

        this.emitConnection(

            SocketConnectionStatus.CONNECTED

        );

            this.flushQueue();

        };

        this.ws.onclose = () => {

        this.connected=false;

        this.emitConnection(

            SocketConnectionStatus.DISCONNECTED

        );
        };

        this.ws.onerror = () => {

        this.connected=false;

        this.emitConnection(

            SocketConnectionStatus.DISCONNECTED

        );

        };

        this.ws.onmessage = (e) => {

            const event =
                JSON.parse(e.data) as SocketEvent;

            this.emit(event);

        };

    }

    get isConnected() {

        return this.connected;

    }

    subscribeConnection(

    listener:(
        status:SocketConnectionStatus
    )=>void

){

    this.connectionListeners.add(
        listener
    );

    listener(
        this.connectionStatus
    );

    return ()=>{

        this.connectionListeners.delete(
            listener
        );

    };

}

private emitConnection(

    status:SocketConnectionStatus

){

    this.connectionStatus=status;

    this.connectionListeners.forEach(
        listener=>listener(status)
    );

}

get status(){

    return this.connectionStatus;

}

}

export const socketService =
new SocketService();