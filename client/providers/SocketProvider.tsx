import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  ReactNode,
} from "react";

import { useAuth } from "@clerk/expo";

import { socketService } from "@/services/socket";
import {
  SOCKET_RECONNECT_INITIAL_DELAY,
  SOCKET_RECONNECT_MAX_DELAY,
} from "@/services/socket";
import { useConnectionStore } from "@/store/connectionStore";
import { dispatchSocketEvent } from "@/services/socket/socket.dispatcher";
import { SocketConnectionStatus } from "@/services/socket/socket.connection";
import { retryManager } from "@/services/socket/retry.manager";

interface SocketContextType {
  sendWsEvent(data: object): void;

  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({} as SocketContextType);

interface Props {
  children: ReactNode;

  wsUrl: string;
}

export function SocketProvider({
  children,

  wsUrl,
}: Props) {
  const { isSignedIn, getToken } = useAuth();

  const reconnectDelay = useRef(SOCKET_RECONNECT_INITIAL_DELAY);

  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  const getTokenRef = useRef(getToken);

  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  useEffect(() => {
    if (!isSignedIn) {
      socketService.disconnect();

      return;
    }

    let cancelled = false;

    const connect = async () => {
      try {
        const token = await getToken();

        if (!token || cancelled) return;

        socketService.connect(`${wsUrl}/ws?token=${token}`);
      } catch (e) {
        console.log("Error socket service", e);
        //scheduleReconnect();
        //socketService.reconnect(`${wsUrl}/ws?token=${token}`)
      }
    };

 /*    const scheduleReconnect = () => {
      if (!mounted.current || cancelled) return;

      if (reconnectTimeout.current) return;

      reconnectTimeout.current = setTimeout(
        () => {
          reconnectDelay.current = Math.min(
            reconnectDelay.current * 2,

            SOCKET_RECONNECT_MAX_DELAY,
          );

          connect();
        },

        reconnectDelay.current,
      );
    }; */

    /*   const setStatus = useConnectionStore.getState().setStatus;
            const unsubscribeConnection = socketService.subscribeConnection(setStatus);
            reconnectDelay.current = SOCKET_RECONNECT_INITIAL_DELAY;

        const unsubscribe =  socketService.subscribe(dispatchSocketEvent); */
    /* const handleConnectionStatus = async (status: SocketConnectionStatus) => {
      useConnectionStore.getState().setStatus(status);
      // اگه وصل شد، delay رو ریست کن
      if (status === SocketConnectionStatus.CONNECTED) {
        console.log("status ", status);
        reconnectDelay.current = SOCKET_RECONNECT_INITIAL_DELAY;
        retryManager.start();
      } else {
        console.log("user not connected try to reconnect");
        const token = await getToken();
        socketService.reconnect(`${wsUrl}/ws?token=${token}`);
        retryManager.stop();

      }
    }; */
    const handleConnectionStatus = async (status: SocketConnectionStatus) => {
      useConnectionStore.getState().setStatus(status);

      switch (status) {
        case SocketConnectionStatus.CONNECTED:
          reconnectDelay.current = SOCKET_RECONNECT_INITIAL_DELAY;

          retryManager.start();

          break;

        case SocketConnectionStatus.DISCONNECTED:
          retryManager.stop();
          const token = await getToken()
          socketService.reconnect(`${wsUrl}/ws?token=${token}`);

          break;

        default:
          break;
      }
    };

    const unsubscribeConnection = socketService.subscribeConnection(
      handleConnectionStatus,
    );

    // ۲. subscribe به رویدادهای واقعی سوکت (message, typing, presence, ...)
    const unsubscribe = socketService.subscribe(dispatchSocketEvent);

    connect();

    return () => {
      cancelled = true;

      unsubscribe();
      unsubscribeConnection();

      socketService.disconnect();

      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
      }
    };
  }, [isSignedIn, wsUrl]);

  const value = useMemo(
    () => ({
      sendWsEvent: socketService.send.bind(socketService),

      connected: socketService.isConnected,
    }),

    [],
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used inside AppProvider");
  return ctx;
}
