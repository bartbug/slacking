import { create } from 'zustand';
import { StateCreator } from 'zustand';
import { User } from '../types';

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

  setOnlineUsers: (users) => {
    console.log('Setting online users:', users);
    set({ onlineUsers: users });
  },
  
  addOnlineUser: (user) => {
    console.log('Adding online user:', user);
    set((state) => ({
      onlineUsers: [...state.onlineUsers, user]
    }));
  },
  
  removeOnlineUser: (userId) => {
    console.log('Removing user:', userId);
    set((state) => ({
      onlineUsers: state.onlineUsers.filter(u => u.id !== userId)
    }));
  },
  
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