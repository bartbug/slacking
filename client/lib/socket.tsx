'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message, DirectMessage, User } from './types';
import { useUserStore } from './stores/userStore';
import Cookies from 'js-cookie';

// Add interface for presence update
interface PresenceUpdate {
  userId: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: Date;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinChannel: (channelId: string) => void;
  leaveChannel: (channelId: string) => void;
  joinDirectMessage: (userId: string) => void;
  sendChannelMessage: (content: string, channelId: string, userId: string) => void;
  sendDirectMessage: (content: string, senderId: string, receiverId: string) => void;
  addReaction: (messageId: string, emoji: string, userId: string) => void;
  removeReaction: (messageId: string, emoji: string, userId: string) => void;
  setStatus: (status: 'online' | 'away' | 'offline') => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  joinChannel: () => {},
  leaveChannel: () => {},
  joinDirectMessage: () => {},
  sendChannelMessage: () => {},
  sendDirectMessage: () => {},
  addReaction: () => {},
  removeReaction: () => {},
  setStatus: () => {},
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { setOnlineUsers, addOnlineUser, removeOnlineUser } = useUserStore();

  useEffect(() => {
    const token = Cookies.get('token');
    console.log('Socket init - token exists:', !!token);
    if (!token) return;

    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000', {
      autoConnect: false,
      auth: { token }
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected with ID:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
      setOnlineUsers([]); // Clear online users on disconnect
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Handle presence events with logging
    socketInstance.on('presence:update', (update: PresenceUpdate) => {
      console.log('Received presence update:', update);
      if (update.status === 'offline') {
        removeOnlineUser(update.userId);
      } else {
        addOnlineUser({
          id: update.userId,
          status: update.status,
          lastSeen: update.lastSeen
        } as User);
      }
    });

    socketInstance.on('presence:list', (users: PresenceUpdate[]) => {
      console.log('Received presence list:', users);
      setOnlineUsers(users.map((user: PresenceUpdate) => ({
        id: user.userId,
        status: user.status,
        lastSeen: user.lastSeen
      } as User)));
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [setOnlineUsers, addOnlineUser, removeOnlineUser]);

  const joinChannel = (channelId: string) => {
    if (socket) {
      socket.emit('join-channel', { channelId });
    }
  };

  const leaveChannel = (channelId: string) => {
    if (socket) {
      socket.emit('leave-channel', channelId);
    }
  };

  const joinDirectMessage = (userId: string) => {
    if (socket) {
      socket.emit('join-dm', userId);
    }
  };

  const sendChannelMessage = (content: string, channelId: string, userId: string) => {
    if (socket) {
      socket.emit('channel-message', { content, channelId, userId });
    }
  };

  const sendDirectMessage = (content: string, senderId: string, receiverId: string) => {
    if (socket) {
      socket.emit('direct-message', { content, senderId, receiverId });
    }
  };

  const addReaction = (messageId: string, emoji: string, userId: string) => {
    if (socket) {
      console.log('Emitting add-reaction:', { messageId, emoji, userId });
      socket.emit('add-reaction', { messageId, emoji, userId });
    }
  };

  const removeReaction = (messageId: string, emoji: string, userId: string) => {
    if (socket) {
      console.log('Emitting remove-reaction:', { messageId, emoji, userId });
      socket.emit('remove-reaction', { messageId, emoji, userId });
    }
  };

  const setStatus = (status: 'online' | 'away' | 'offline') => {
    if (socket) {
      socket.emit('presence:status', status);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinChannel,
        leaveChannel,
        joinDirectMessage,
        sendChannelMessage,
        sendDirectMessage,
        addReaction,
        removeReaction,
        setStatus,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

// Custom hooks for specific socket functionalities
export const useChannelMessages = (channelId: string): { 
  messages: Message[]; 
  isLoading: boolean; 
  error: string | null; 
  hasMore: boolean; 
  isLoadingMore: boolean;
  loadMore: () => Promise<void>;
} => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Join the channel
    socket.emit('join-channel', { channelId });

    // Handle initial messages
    socket.on('channel-messages', (response: { messages: Message[]; nextCursor: string | null; hasMore: boolean }) => {
      const messagesWithReactions = response.messages.map((msg: Message) => ({
        ...msg,
        reactions: msg.reactions || []
      }));
      setMessages(messagesWithReactions);
      setNextCursor(response.nextCursor);
      setHasMore(response.hasMore);
      setIsLoading(false);
    });

    // Listen for new messages
    const handleNewMessage = (message: Message) => {
      if (message.channelId === channelId) {
        const messageWithReactions = {
          ...message,
          reactions: message.reactions || []
        };
        setMessages(prev => [...prev, messageWithReactions]);
      }
    };

    // Listen for reaction updates
    const handleReactionUpdate = (updatedMessage: Message) => {
      console.log('Handling reaction update:', JSON.stringify(updatedMessage, null, 2));
      if (updatedMessage.channelId === channelId) {
        setMessages(prevMessages => {
          // Find the message and update its reactions
          const messageIndex = prevMessages.findIndex(msg => msg.id === updatedMessage.id);
          if (messageIndex === -1) return prevMessages;

          // Create a new array with the updated message
          const newMessages = [...prevMessages];
          newMessages[messageIndex] = {
            ...updatedMessage,
            reactions: updatedMessage.reactions || []
          };
          
          console.log('Updated message reactions:', newMessages[messageIndex].reactions);
          return newMessages;
        });
      }
    };

    socket.on('new-channel-message', handleNewMessage);
    socket.on('reaction-updated', handleReactionUpdate);

    // Cleanup
    return () => {
      socket.off('channel-messages');
      socket.off('new-channel-message', handleNewMessage);
      socket.off('reaction-updated', handleReactionUpdate);
      socket.emit('leave-channel', channelId);
    };
  }, [socket, channelId]);

  const loadMore = async () => {
    if (!socket || !nextCursor) return;

    setIsLoadingMore(true);

    try {
      socket.emit('load-more-messages', { channelId, cursor: nextCursor });
      // Response will be handled by the channel-messages event listener
    } catch (err) {
      console.error('Error loading more messages:', err);
      setError('Error loading more messages');
    } finally {
      setIsLoadingMore(false);
    }
  };

  return { 
    messages, 
    isLoading, 
    error, 
    hasMore, 
    isLoadingMore, 
    loadMore 
  };
};

// Helper function to sort messages by date
const sortMessagesByDate = (messages: Message[]): Message[] => {
  return [...messages].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
};

export const useDirectMessages = (otherUserId: string) => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState<DirectMessage[]>([]);

  useEffect(() => {
    if (!socket) return;

    // Join the DM room
    socket.emit('join-dm', otherUserId);

    // Listen for new messages
    const handleNewMessage = (message: DirectMessage) => {
      if (message.senderId === otherUserId || message.receiverId === otherUserId) {
        setMessages(prev => [...prev, message]);
      }
    };

    socket.on('new-direct-message', handleNewMessage);

    // Cleanup
    return () => {
      socket.off('new-direct-message', handleNewMessage);
    };
  }, [socket, otherUserId]);

  return messages;
}; 