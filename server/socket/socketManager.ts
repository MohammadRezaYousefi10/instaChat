import { verifyToken } from "@clerk/express";
import { IncomingMessage } from "http";
import { WebSocket, WebSocketServer } from "ws";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";
import { SocketEventType } from "../types/socket.events.js";


// Map userId -> WebSocket
const onlineUsers = new Map<string , WebSocket>()

// Initialize socket server
export function initSocketServer(server : any ) {
    const wss = new WebSocketServer({server , path: "/ws"})
    
    wss.on("connection" , async (ws: WebSocket , req : IncomingMessage) => {
        console.log("Client connected");

        // Extract token from query string: /ws?token=...
        const url = new URL(req.url! , `http://${req.headers.host}`);
        const token = url.searchParams.get("token");

        if(!token) {
            ws.close(1008 , "No token");
            return;
        }
        let userId : string;
        try {
            const decoded = await verifyToken(token , { 
                secretKey: process.env.CLERK_SECRET_KEY
            });
            userId = decoded.sub;
        } catch (error) {
            console.error("WS verification error" , error);
            ws.close(1008 , "Invalid token");
            return;
        }
        //console.log("Client connected" , userId);
        // Register user as online 
        onlineUsers.set(userId , ws);
        await User.findByIdAndUpdate(userId , {isOnline:true});
        // broadcast user is online
        broadcastOnlineStatus(userId , true)

        ws.on("message" , async (data: Buffer) => {
            try {
                   //console.log("Client sending message");
                const msg = JSON.parse(data.toString());

                // Forward message to receiver(s)
                if(msg.type === SocketEventType.MESSAGE){
                    const {receiverId , conversationId , payload} = msg;
                    console.log('message received ' , msg)
                    if(conversationId){
                        // Direct message with conversationId
                        handleConversationEvent(userId , conversationId , {type:SocketEventType.MESSAGE , payload})

                    }else if(receiverId) {
                        // Legacy direct message
                        const receiverWs = onlineUsers.get(receiverId);
                        if(receiverWs?.readyState === WebSocket.OPEN){
                            receiverWs.send(JSON.stringify({type:SocketEventType.MESSAGE , payload}))
                        }
                    }
                }
                

                // Forward typing indicator
                 if(msg.type === SocketEventType.TYPING){
                    const {receiverId , conversationId , isTyping} = msg;
                    //console.log('getting msg' , msg)
                    if(conversationId){
                        // Update typing status in conversation
                        handleConversationEvent(userId , conversationId , {type:SocketEventType.TYPING , senderId : userId , 
                            isTyping
                        })
                        //broadcastOnlineStatus(userId , true)
                    }else if(receiverId) {
                        // Legacy direct message
                        const receiverWs = onlineUsers.get(receiverId);
                        if(receiverWs?.readyState === WebSocket.OPEN){
                            receiverWs.send(JSON.stringify({type:SocketEventType.TYPING , senderId : userId ,conversationId , isTyping}))
                            //broadcastOnlineStatus(userId , true)
                        }
                    }
                }

                // Update user's live location (only meaningful while visible on map)
                if(msg.type === SocketEventType.LOCATION){
                    const {latitude , longitude} = msg;

                    if(
                        typeof latitude !== "number" || typeof longitude !== "number" ||
                        latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180
                    ){
                        return;
                    }

                    const updatedUser = await User.findByIdAndUpdate(
                        userId ,
                        {
                            location: {type:"Point" , coordinates:[longitude , latitude]},
                            lastSeen: new Date(),
                        },
                        {new:true}
                    );

                    if(updatedUser?.isVisibleOnMap){
                        broadcastMapUpdate(userId , {latitude , longitude});
                    }
                }

                // Toggle visibility on the map
                if(msg.type === SocketEventType.MAP_VISIBILITY){
                    const {isVisibleOnMap} = msg;

                    if(typeof isVisibleOnMap !== "boolean") return;

                    await User.findByIdAndUpdate(userId , {isVisibleOnMap});
                    broadcastMapUpdate(userId , null , isVisibleOnMap);
                }

                
            } catch (error:any) {
                console.error("Error Processing message:" , error)
            }
        })

        ws.on("close" , async () => {
            console.log('user disconected from ws')
            onlineUsers.delete(userId);
            await User.findByIdAndUpdate(userId ,{isOnline:false , isVisibleOnMap:false , lastSeen : new Date()} );
            // broadcast user becomes offline
            broadcastOnlineStatus(userId , false)
            // also remove from map for everyone currently viewing it
            broadcastMapUpdate(userId , null , false)
        })
    })

    return wss;
}

function broadcastOnlineStatus(userId:string , isOnline: Boolean ){
    //const lastSeen = new Date()
    const payload = JSON.stringify({type:SocketEventType.ONLINE_STATUS , userId , isOnline });
    onlineUsers.forEach((ws) => {
        if(ws.readyState === WebSocket.OPEN){
            ws.send(payload);
        }
    })
}

export async function handleConversationEvent (senderId:string , conversationId: string , event:any){
  try {
    const conversation = await Conversation.findById(conversationId)
    if(!conversation) return;
    const payload = JSON.stringify(event);
    conversation.participants.forEach((pId) => {
        const participantId = String(pId);
        if(participantId === senderId) return; // Don't send back to sender

        const ws = onlineUsers.get(participantId);
        if(ws?.readyState === WebSocket.OPEN) {
            ws.send(payload)
        }
    })
  } catch (error) {
    console.error("Conversation event error" , error)
  }
}


export function broadcastUserUpdate(user : any){
    const payload = JSON.stringify({type:SocketEventType.USER_UPDATE , user});
    onlineUsers.forEach((ws) => {
        if(ws.readyState === WebSocket.OPEN){
            ws.send(payload);
        }
    })
}

// Broadcast a nearby-map user's location or visibility change to everyone
// currently connected (the client filters/uses this only while the Map screen is open)
export function broadcastMapUpdate(
    userId: string ,
    location: {latitude:number , longitude:number} | null ,
    isVisibleOnMap?: boolean
){
    const payload = JSON.stringify({type:SocketEventType.MAP_UPDATE , userId , location , isVisibleOnMap});
    onlineUsers.forEach((ws , id) => {
        if(id === userId) return; // don't send back to the user who moved/toggled
        if(ws.readyState === WebSocket.OPEN){
            ws.send(payload);
        }
    })
}

export {onlineUsers}