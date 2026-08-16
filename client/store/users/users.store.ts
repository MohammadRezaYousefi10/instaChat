import { create } from "zustand";
import { User } from "@/types";

interface UserState {
  users: User[];

  setUsers(users: User[]): void;

  updateUser(id: string, data: Partial<User>): void;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],

  setUsers(users) {
    set({ users });
  },

  updateUser(id, data) {
    set((state) => ({
      users: state.users.map((user) =>
        user._id === id
          ? {
              ...user,
              ...data,
            }
          : user,
      ),
    }));
  },
}));
