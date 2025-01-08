import { create } from 'zustand'
import { Message, Thread } from '../types'

interface ThreadState {
  activeThread: Thread | null
  threadMessages: Message[]
  isLoading: boolean
  error: string | null
  
  // Actions
  setActiveThread: (thread: Thread | null) => void
  setThreadMessages: (messages: Message[]) => void
  addThreadMessage: (message: Message) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearThread: () => void
}

export const useThreadStore = create<ThreadState>((set) => ({
  activeThread: null,
  threadMessages: [],
  isLoading: false,
  error: null,

  setActiveThread: (thread) => set({ activeThread: thread }),
  setThreadMessages: (messages) => set({ threadMessages: messages }),
  addThreadMessage: (message) => 
    set((state) => ({ 
      threadMessages: [...state.threadMessages, message] 
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearThread: () => set({ 
    activeThread: null, 
    threadMessages: [], 
    error: null 
  }),
})) 