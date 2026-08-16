import { create } from "zustand";
import type { UserPresence } from "../types";


interface PresenceStore {

    presence: Record<string, UserPresence>;

    setOnline: (
        userId: string
    ) => void;

    setOffline: (
        userId: string,
        lastSeen?: string
    ) => void;

    updatePresence: (
        userId: string,
        presence: UserPresence
    ) => void;

    removePresence: (
        userId: string
    ) => void;

    clear: () => void;

}

export const usePresenceStore =
create<PresenceStore>((set)=>({

    presence:{},

    setOnline:(userId)=>

        

        set(state=>({

            presence:{

                ...state.presence,

                [userId]:{

                    online:true,

                    lastSeen:
                        state.presence[userId]?.lastSeen

                }

            }

        })),

    setOffline:(userId,lastSeen)=>

        set(state=>({

            presence:{

                ...state.presence,

                [userId]:{

                    online:false,

                    lastSeen

                }

            }

        })),

    updatePresence:(userId,presence)=>

        set(state=>({

            presence:{

                ...state.presence,

                [userId]:presence

            }

        })),

    removePresence:(userId)=>

        set(state=>{

            const next={...state.presence};

            delete next[userId];

            return{

                presence:next

            }

        }),

    clear:()=>

        set({

            presence:{}

        })

}));