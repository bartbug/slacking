'use client';

import React, { useState, useLayoutEffect, useEffect } from 'react';
import { useSocket, useChannelMessages } from '../lib/socket';
import { Message, Channel as ChannelType, MessageReaction, Thread } from '../lib/types';
import { useAuth } from '@/lib/auth';
import { ReactionPicker } from './ReactionPicker';
import { Button } from './ui/button';
import { useChannelStore } from '@/lib/stores/channelStore';
import { useUserStore } from '@/lib/stores/userStore';
import { useThreadStore } from '@/lib/stores/threadStore';
import { ThreadPanel } from './ThreadPanel';

interface ChannelProps {
  channelId: string;
  userId: string;
}

export function Channel({ channelId, userId }: ChannelProps) {
  const { user } = useAuth();
  const { 
    messages, 
    currentChannel,
    isLoading,
    error,
    setMessages,
    addMessage,
    setCurrentChannel,
    setError,
    setLoading 
  } = useChannelStore();
  
  const { 
    userTyping,
    setUserTyping,
    clearUserTyping 
  } = useUserStore();

  const [newMessage, setNewMessage] = useState('');
  const { socket, isConnected, sendChannelMessage, addReaction, removeReaction } = useSocket();
  const { setActiveThread } = useThreadStore();

  useEffect(() => {
    if (!socket || !user) return;

    const token = localStorage.getItem('token');
    if (token) {
      socket.auth = { token };
      socket.connect();
    }
  }, [socket, user]);

  useLayoutEffect(() => {
    setLoading(true);
    const fetchChannel = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channelId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch channel');
        }

        const data = await response.json();
        setCurrentChannel(data);
      } catch (error) {
        console.error('Error fetching channel:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch channel');
      } finally {
        setLoading(false);
      }
    };

    if (channelId) {
      fetchChannel();
    }

    return () => {
      setLoading(true);
    };
  }, [channelId, setLoading, setCurrentChannel, setError]);

  useEffect(() => {
    if (!socket) return;

    socket.emit('join-channel', channelId);

    socket.on('channel-messages', (initialMessages: Message[]) => {
      setMessages(initialMessages.map(msg => ({
        ...msg,
        reactions: msg.reactions || []
      })));
    });

    const handleNewMessage = (message: Message) => {
      if (message.channelId === channelId) {
        addMessage({
          ...message,
          reactions: message.reactions || []
        });
      }
    };

    socket.on('new-channel-message', handleNewMessage);

    return () => {
      socket.off('channel-messages');
      socket.off('new-channel-message', handleNewMessage);
      socket.emit('leave-channel', channelId);
    };
  }, [socket, channelId, setMessages, addMessage]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && isConnected) {
      sendChannelMessage(newMessage, channelId, userId);
      setNewMessage('');
    }
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    if (user) {
      addReaction(messageId, emoji, user.id);
    }
  };

  const handleRemoveReaction = (messageId: string, emoji: string) => {
    if (user) {
      removeReaction(messageId, emoji, user.id);
    }
  };

  const hasUserReacted = (reaction: MessageReaction) => {
    return user ? reaction.users.some(u => u.id === user.id) : false;
  };

  const handleThreadClick = async (message: Message) => {
    const thread: Thread = {
      id: message.id,
      channelId,
      parentMessage: message,
      participantIds: [message.user.id],
      messageCount: message.replyCount || 0,
      lastActivityAt: message.lastReplyAt || message.createdAt
    };
    setActiveThread(thread);
  };

  if (isLoading || !currentChannel) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-6 py-4 border-b bg-white/50 backdrop-blur-sm flex-shrink-0">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex-1 min-h-0"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b bg-white/50 backdrop-blur-sm flex-shrink-0">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <span className="text-gray-400">#</span>
          {currentChannel.name}
        </h2>
        {currentChannel.description && (
          <p className="text-sm text-gray-500 mt-1.5">{currentChannel.description}</p>
        )}
        <div className="text-xs mt-2 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-gray-500">{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-6 pb-4">
        {messages.map((message: Message) => (
          <div 
            key={message.id} 
            className="group flex items-start space-x-3 hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-all duration-200 ease-in-out"
          >
            <div className="flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium shadow-sm">
                {message.user.name[0].toUpperCase()}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">{message.user.name}</span>
                <span className="text-xs text-gray-400 group-hover:text-gray-500 transition-colors duration-200">
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-gray-800 mt-1 break-words">{message.content}</p>
              
              <div className="mt-2 flex flex-wrap gap-1 items-center">
                {message.reactions?.map((reaction) => (
                  <Button
                    key={reaction.emoji}
                    className={`h-6 px-2 gap-1 text-xs ${
                      hasUserReacted(reaction) 
                        ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => 
                      hasUserReacted(reaction) 
                        ? handleRemoveReaction(message.id, reaction.emoji)
                        : handleAddReaction(message.id, reaction.emoji)
                    }
                  >
                    <span>{reaction.emoji}</span>
                    <span>{reaction.users.length}</span>
                  </Button>
                ))}
                <ReactionPicker 
                  onSelect={(emoji) => handleAddReaction(message.id, emoji)} 
                />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleThreadClick(message)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  {message.replyCount ? (
                    <span>{message.replyCount} replies</span>
                  ) : (
                    <span>Reply in thread</span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="sticky bottom-0 px-6 py-4 border-t bg-white/50 backdrop-blur-sm">
        <div className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message #${currentChannel?.name}`}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
          />
          <button
            type="submit"
            disabled={!isConnected}
            className="px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Send
          </button>
        </div>
      </form>

      <ThreadPanel />
    </div>
  );
} 