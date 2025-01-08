import { create } from 'zustand';
import { StateCreator } from 'zustand';
import { Channel, Message } from '@/lib/types';

type State = {
  channels: Channel[];
  currentChannel: Channel | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
};

type Actions = {
  setChannels: (channels: Channel[]) => void;
  setCurrentChannel: (channel: Channel | null) => void;
  addChannel: (channel: Channel) => void;
  removeChannel: (channelId: string) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
};

type ChannelStore = State & Actions;

export const useChannelStore = create<ChannelStore>((set) => ({
  channels: [],
  currentChannel: null,
  messages: [],
  isLoading: false,
  error: null,

  setChannels: (channels) => set({ channels }),
  setCurrentChannel: (channel) => set({ currentChannel: channel }),
  addChannel: (channel) => set((state) => ({ 
    channels: [...state.channels, channel] 
  })),
  removeChannel: (channelId) => set((state) => ({
    channels: state.channels.filter(c => c.id !== channelId)
  })),

  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  clearMessages: () => set({ messages: [] }),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error })
})); 