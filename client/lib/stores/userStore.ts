import { create } from 'zustand';
import { StateCreator } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  status?: 'online' | 'offline' | 'away';
}

type State = {
  onlineUsers: User[];
  userTyping: { [channelId: string]: string[] };
};

type Actions = {
  setOnlineUsers: (users: User[]) => void;
  addOnlineUser: (user: User) => void;
  removeOnlineUser: (userId: string) => void;
  setUserTyping: (channelId: string, userId: string) => void;
  clearUserTyping: (channelId: string, userId: string) => void;
};

type UserStore = State & Actions;

export const useUserStore = create<UserStore>((set) => ({
  onlineUsers: [],
  userTyping: {},

  setOnlineUsers: (users) => set({ onlineUsers: users }),
  addOnlineUser: (user) => set((state) => ({
    onlineUsers: [...state.onlineUsers, user]
  })),
  removeOnlineUser: (userId) => set((state) => ({
    onlineUsers: state.onlineUsers.filter(u => u.id !== userId)
  })),
  
  setUserTyping: (channelId, userId) => set((state) => ({
    userTyping: {
      ...state.userTyping,
      [channelId]: [...(state.userTyping[channelId] || []), userId]
    }
  })),
  
  clearUserTyping: (channelId, userId) => set((state) => ({
    userTyping: {
      ...state.userTyping,
      [channelId]: state.userTyping[channelId]?.filter(id => id !== userId) || []
    }
  }))
})); 