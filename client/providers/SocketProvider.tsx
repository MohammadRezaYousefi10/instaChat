import React , {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    ReactNode,
} from "react";

import { useAuth } from "@clerk/clerk-expo";

import { socketService } from "@/services/socket";
import {
    SOCKET_RECONNECT_INITIAL_DELAY,
    SOCKET_RECONNECT_MAX_DELAY,
} from "@/services/socket";
import { useConnectionStore } from "@/store/connectionStore";

interface SocketContextType {

    sendWsEvent(
        data: object
    ): void;

    connected: boolean;

}

const SocketContext =
createContext<SocketContextType>(
    {} as SocketContextType
);

interface Props {

    children: ReactNode;

    wsUrl: string;

}

export function SocketProvider({

    children,

    wsUrl,

}: Props) {

    const {

        isSignedIn,

        getToken,

    } = useAuth();

    const reconnectDelay =
        useRef(
            SOCKET_RECONNECT_INITIAL_DELAY
        );

    const reconnectTimeout =
        useRef<
            ReturnType<typeof setTimeout> | null
        >(null);

    const mounted =
        useRef(true);

    useEffect(() => {

        mounted.current = true;

        return () => {

            mounted.current = false;

        };

    }, []);

    useEffect(() => {

        if (!isSignedIn) {

            socketService.disconnect();

            return;

        }

        let cancelled = false;

        const connect = async () => {

            try {

                const token =
                    await getToken();

                if (
                    !token ||
                    cancelled
                ) return;

                socketService.connect(
                    `${wsUrl}/?token=${token}`
                );

            }

            catch (e) {

                scheduleReconnect();

            }

        };

        const scheduleReconnect =
            () => {

                if (
                    !mounted.current ||
                    cancelled
                ) return;

                reconnectTimeout.current =
                    setTimeout(() => {

                        reconnectDelay.current =
                            Math.min(

                                reconnectDelay.current * 2,

                                SOCKET_RECONNECT_MAX_DELAY

                            );

                        connect();

                    },

                    reconnectDelay.current);

            };

        const unsubscribe =
            socketService.subscribe(() => {


            const setStatus = useConnectionStore.getState().setStatus;

            const unsubscribeConnection = socketService.subscribeConnection(setStatus);

                
                reconnectDelay.current =
                    SOCKET_RECONNECT_INITIAL_DELAY;

            });

        connect();

        return () => {

            cancelled = true;

            unsubscribe();

            socketService.disconnect();

            if (

                reconnectTimeout.current

            ) {

                clearTimeout(

                    reconnectTimeout.current

                );

            }

        };

    }, [

        isSignedIn,

        wsUrl,

        getToken,

    ]);

 

    const value =
        useMemo(

            () => ({

                sendWsEvent:

                    socketService.send.bind(socketService),

                connected:

                    socketService.isConnected,

            }),

            []

        );

    return (

        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>

    );

}

export function useSocket() {

    const ctx = useContext(SocketContext);
    if (!ctx) throw new Error("useSocket must be used inside AppProvider")
        return ctx;

}