import { create } from "zustand";

import { SocketConnectionStatus }
from "@/services/socket/socket.connection";

interface ConnectionStore{

    status:SocketConnectionStatus;

    setStatus:(

        status:SocketConnectionStatus

    )=>void;

}

export const useConnectionStore=

create<ConnectionStore>((set)=>({

    status:

    SocketConnectionStatus.DISCONNECTED,

    setStatus:(status)=>

        set({status})

}));