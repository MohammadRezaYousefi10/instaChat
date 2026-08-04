import {
  AuthState,
  Conversation,
  User,
  UserStory,
} from "@/types";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { WS_URL } from "@/constants/config";
import { useAuth, useUser } from "@clerk/expo";
import { useMessageStore } from "@/store/messageStore";
import { useConversationStore } from "@/store/conversationStore";
import { SocketProvider } from "@/providers/SocketProvider";
import { retryManager } from "@/services/socket/retry.manager";
import { usePendingStore } from "@/store/pendingStore";
import { socketService } from "@/services/socket";
import { api } from "@/services/api/api";


const _tokenRef = { current: null as string | null };

interface AppContextType {
  auth: AuthState;
  logout: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;

  userStories: UserStory[];
  setUserStories: React.Dispatch<React.SetStateAction<UserStory[]>>;

  conversations: Conversation[];
  //setConversations : React.Dispatch<React.SetStateAction<Conversation[]>>
  setConversations: (items: Conversation[]) => void;
  //selectedConversation: Conversation | null;
  //setSelectedConversation: (c: Conversation | null) => void

  setSelectedConversation: (conversation: Conversation | null) => void;

  //messages: Message[];
  //setMessages : React.Dispatch<React.SetStateAction<Message[]>>

  fetchStories: () => Promise<void>;
  //typingUsers: Record<string , boolean>;
  //sendWsEvent: (data : object) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    token: null,
    user: null,
    loading: true,
  });
  const [users, setUsers] = useState<User[]>([]);

  const { getToken, isLoaded: authLoaded, isSignedIn, signOut } = useAuth();
  const { user: clerkUser, isLoaded: userLoaded } = useUser();

  //const [conversations , setConversations] = useState<Conversation[]>([])
  const conversations = useConversationStore((state) => state.conversations);

  const setConversations = useConversationStore(
    (state) => state.setConversations,
  );

  const selectedConversation = useConversationStore(
    (state) => state.selectedConversation,
  );

  const setSelectedConversation = useConversationStore(
    (state) => state.setSelectedConversation,
  );

  const {
    setMessages,
    addMessage,
    getConversationMessages,
    clearConversation,
  } = useMessageStore();

  //const [selectedConversation , setSelectedConversation] = useState<Conversation | null>(null)
  const store = useConversationStore.getState();
  const conversationStore = useConversationStore.getState();

  //const [messages , setMessages] = useState<Message[]>([])
  const [userStories, setUserStories] = useState<UserStory[]>([]);
  //const [typingUsers , setTypingUsers] = useState<Record<string , boolean>>({})
  //const wsRef = useRef<WebSocket | null>(null)

  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  // attach clerk token on every request
  useEffect(() => {
    const interceptor = api.interceptors.request.use(async (config) => {
      try {
        if (isSignedIn) {
          const token = await getTokenRef.current();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            _tokenRef.current = token;
          }
        }
      } catch (err) {
        console.error("Axios interceptor error", err);
      }
      return config;
    });
    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, [isSignedIn]);

  // keep local AuthState in sync with Clerk profile state
  useEffect(() => {
    if (!authLoaded || !userLoaded) return;
    if (isSignedIn) {
      fetchCurrentUser();

      /* const mappedUser : User = {
                _id : clerkUser.id,
                name: clerkUser.fullName || "Anonymous",
                email: clerkUser.primaryEmailAddress?.emailAddress || "",
                handle: clerkUser.username || clerkUser.primaryEmailAddress?.emailAddress.split("@")[0] || 
                clerkUser.id,
                avatar: clerkUser.imageUrl || "" ,
                bio: (clerkUser.publicMetadata?.bio as string) || "Hey there! I am using InstaChat.",
                isOnline: true,
                lastSeen: new Date().toISOString()
            }
           
            setAuth({token: _tokenRef.current , user: mappedUser , loading:false})  */
    } else {
      setAuth({ token: null, user: null, loading: false });
    }
  }, [isSignedIn, authLoaded, userLoaded, clerkUser]);

  const fetchCurrentUser = async () => {
    //console.log('hello')
    try {
      const { data } = await api.get("/api/users/profile");
      //console.log('we getting user' , data);

      setAuth({
        token: _tokenRef.current,
        user: data.user,
        loading: false,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const logout = useCallback(async () => {
    _tokenRef.current = null;
    //wsRef.current?.close();
    await signOut();
    setAuth({ token: null, user: null, loading: false });
    setConversations([]);
    //setMessages([])
    clearConversation(selectedConversation!._id);
    setSelectedConversation(null);
    retryManager.stop();
    usePendingStore.getState().clear();
    socketService.disconnect();
  }, [signOut]);

  const updateUser = useCallback(async (user: User) => {
    setAuth((prev) => ({ ...prev, user }));
  }, []);

  const fetchStories = useCallback(async () => {
    try {
      const { data } = await api.get("/api/stories");
      if (data.success) setUserStories(data.stories);
    } catch (error) {
      setTimeout(() => {
        fetchStories();
      }, 1000);
    }
  }, []);

  /* const sendWsEvent = useCallback( (data:object) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(data))
        }
    } , []) */

  // websocket lifecycle secured with dynamic Clerk token

  return (
    <AppContext.Provider
      value={{
        auth,
        logout,
        updateUser,
        users,
        setUsers,
        conversations,
        setConversations,
        //selectedConversation,
        setSelectedConversation,
        //messages,
        //setMessages,
        userStories,
        setUserStories,
        fetchStories,
        //typingUsers,
        //sendWsEvent
      }}
    >
      <SocketProvider wsUrl={WS_URL}>{children}</SocketProvider>
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
