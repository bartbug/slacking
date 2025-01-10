'use client';

import React, { useState, useLayoutEffect, useEffect, useRef } from 'react';
import { useSocket } from '../lib/socket';
import { useChannelMessages } from '../lib/hooks/useChannelMessages';
import { Message, Channel as ChannelType, MessageReaction, Thread } from '../lib/types';
import { useAuth } from '@/lib/auth';
import { ReactionPicker } from './ReactionPicker';
import { Button } from './ui/button';
import { useChannelStore } from '@/lib/stores/channelStore';
import { useUserStore } from '@/lib/stores/userStore';
import { useThreadStore } from '@/lib/stores/threadStore';
import { ThreadPanel } from './ThreadPanel';
import { PresenceIndicator } from './PresenceIndicator';
import Cookies from 'js-cookie';

interface ChannelProps {
  channelId: string;
  userId: string;
}

export function Channel({ channelId, userId }: ChannelProps) {
  const { user } = useAuth();
  const { 
    currentChannel,
    isLoading,
    error,
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const {
    messages,
    isLoading: isLoadingMessages,
    hasMore,
    isLoadingMore,
    loadMore
  } = useChannelMessages(channelId);

  useEffect(() => {
    if (!socket || !user) return;

    const token = Cookies.get('token');
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

  // Scroll to bottom only for initial load and new messages
  useEffect(() => {
    if (messagesEndRef.current && shouldScrollToBottom) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, shouldScrollToBottom]);

  // Handle new messages
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Check if we're near bottom before a new message arrives
    const handleScroll = () => {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      setShouldScrollToBottom(isNearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle loading more messages
  const handleLoadMore = async () => {
    if (!messagesContainerRef.current) return;
    
    const container = messagesContainerRef.current;
    const scrollHeight = container.scrollHeight;
    
    await loadMore();
    
    // After loading, restore scroll position
    requestAnimationFrame(() => {
      const newScrollHeight = container.scrollHeight;
      const scrollDiff = newScrollHeight - scrollHeight;
      container.scrollTop = scrollDiff;
    });
  };

  // Initial scroll to bottom
  useEffect(() => {
    if (!isLoadingMessages && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView();
    }
  }, [isLoadingMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && isConnected) {
      sendChannelMessage(newMessage, channelId, userId);
      setNewMessage('');
    }
  };

  const handleReactionClick = (messageId: string, emoji: string) => {
    if (!user) return;
    // Simply emit the intent to add a reaction
    // Let the server handle the logic of removing old reactions
    addReaction(messageId, emoji, user.id);
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    if (!user) return;
    // Same simplified approach for adding reactions from picker
    addReaction(messageId, emoji, user.id);
  };

  // Simplified reaction rendering logic
  const renderReactions = (message: Message) => {
    if (!message.reactions?.length) return null;

    // Create a clean mapping of reactions
    const reactionMap = message.reactions.reduce((acc, reaction) => {
      if (!reaction?.emoji) return acc;
      
      // Each emoji should only appear once with a Set of user IDs
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = new Set();
      }
      
      // Add the user ID from this reaction
      if (reaction.userId) {
        acc[reaction.emoji].add(reaction.userId);
      }
      
      return acc;
    }, {} as Record<string, Set<string>>);

    return (
      <div className="flex flex-wrap gap-1">
        {Object.entries(reactionMap).map(([emoji, userIds]) => (
          <Button
            key={`${message.id}-${emoji}`}
            className={`h-6 px-2 gap-1 text-xs ${
              user && userIds.has(user.id)
                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => handleReactionClick(message.id, emoji)}
          >
            <span>{emoji}</span>
            <span>{userIds.size}</span>
          </Button>
        ))}
      </div>
    );
  };

  // Memoize hasUserReacted to prevent recalculation during render
  const hasUserReacted = React.useCallback((reaction: MessageReaction) => {
    if (!user || !reaction) {
      return false;
    }
    return reaction.userId === user.id;
  }, [user]);

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

  // Add debug logging for reactions
  useEffect(() => {
    messages.forEach(message => {
      if (message.reactions?.length > 0) {
        console.log(`Message ${message.id} reactions:`, message.reactions);
      }
    });
  }, [messages]);

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
    <div className="h-full flex">
      <div className="flex-1 flex flex-col min-w-0">
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

        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto min-h-0 p-6 space-y-6 pb-4"
        >
          {isLoadingMore && (
            <div className="text-center py-4">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-500 border-r-transparent"></div>
            </div>
          )}

          {isLoadingMessages ? (
            <div className="flex justify-center items-center h-full">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            </div>
          ) : (
            <>
              {hasMore && !isLoadingMore && (
                <button
                  onClick={handleLoadMore}
                  className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Load more messages
                </button>
              )}
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
                      <PresenceIndicator user={message.user} showText />
                      <span className="text-xs text-gray-400 group-hover:text-gray-500 transition-colors duration-200">
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-gray-800 mt-1 break-words">{message.content}</p>
                    
                    <div className="mt-2 flex flex-col gap-2">
                      {renderReactions(message)}
                      
                      <div className="flex items-center gap-2">
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
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
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
          </div>
        </form>
      </div>
      <ThreadPanel />
    </div>
  );
} 