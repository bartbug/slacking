'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message, DirectMessage } from './types';

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
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000', {
      withCredentials: true,
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const joinChannel = (channelId: string) => {
    if (socket) {
      socket.emit('join-channel', channelId);
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
      socket.emit('add-reaction', { messageId, emoji, userId });
    }
  };

  const removeReaction = (messageId: string, emoji: string, userId: string) => {
    if (socket) {
      socket.emit('remove-reaction', { messageId, emoji, userId });
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
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

// Custom hooks for specific socket functionalities
export const useChannelMessages = (channelId: string) => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!socket) return;

    // Join the channel
    socket.emit('join-channel', channelId);

    // Handle initial messages
    socket.on('channel-messages', (initialMessages: Message[]) => {
      const messagesWithReactions = initialMessages.map(msg => ({
        ...msg,
        reactions: msg.reactions || []
      }));
      setMessages(sortMessagesByDate(messagesWithReactions));
    });

    // Listen for new messages
    const handleNewMessage = (message: Message) => {
      if (message.channelId === channelId) {
        const messageWithReactions = {
          ...message,
          reactions: message.reactions || []
        };
        setMessages(prev => sortMessagesByDate([...prev, messageWithReactions]));
      }
    };

    // Listen for reaction updates
    const handleReactionUpdate = (updatedMessage: Message) => {
      if (updatedMessage.channelId === channelId) {
        const messageWithReactions = {
          ...updatedMessage,
          reactions: updatedMessage.reactions || []
        };
        setMessages(prev => 
          sortMessagesByDate(
            prev.map(msg => 
              msg.id === updatedMessage.id ? messageWithReactions : msg
            )
          )
        );
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

  return messages;
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