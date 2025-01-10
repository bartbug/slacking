import { useState, useEffect, useCallback } from 'react';
import { Message } from '../types';
import { useSocket } from '../socket';

interface MessagesResponse {
  messages: Message[];
  nextCursor: string | null;
  hasMore: boolean;
}

export function useChannelMessages(channelId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || !channelId) return;

    setIsLoading(true);
    setMessages([]);
    setNextCursor(null);
    setHasMore(false);

    socket.emit('join-channel', { channelId });

    const handleInitialMessages = (response: MessagesResponse) => {
      console.log('Initial messages received:', response.messages);
      setMessages(response.messages);
      setNextCursor(response.nextCursor);
      setHasMore(response.hasMore);
      setIsLoading(false);
    };

    const handleNewMessage = (message: Message) => {
      console.log('New message received:', message);
      setMessages(prev => [...prev, message]);
    };

    const handleReactionUpdate = (updatedMessage: Message) => {
      console.log('Reaction update received:', updatedMessage);
      console.log('Current messages:', messages);
      setMessages(prev => {
        const updated = prev.map(msg => 
          msg.id === updatedMessage.id ? updatedMessage : msg
        );
        console.log('Updated messages:', updated);
        return updated;
      });
    };

    socket.on('channel-messages', handleInitialMessages);
    socket.on('new-channel-message', handleNewMessage);
    socket.on('reaction-updated', handleReactionUpdate);

    return () => {
      socket.off('channel-messages', handleInitialMessages);
      socket.off('new-channel-message', handleNewMessage);
      socket.off('reaction-updated', handleReactionUpdate);
      socket.emit('leave-channel', channelId);
    };
  }, [socket, channelId]);

  const loadMore = useCallback(async () => {
    if (!socket || !channelId || !nextCursor || isLoadingMore) return;

    setIsLoadingMore(true);
    
    return new Promise<void>((resolve, reject) => {
      const handleMoreMessages = (response: MessagesResponse) => {
        setMessages(prev => [...response.messages, ...prev]);
        setNextCursor(response.nextCursor);
        setHasMore(response.hasMore);
        setIsLoadingMore(false);
        resolve();
      };

      const handleError = () => {
        setIsLoadingMore(false);
        setError('Failed to load more messages');
        reject(new Error('Failed to load more messages'));
      };

      socket.once('more-messages', handleMoreMessages);
      socket.emit('load-more-messages', { channelId, cursor: nextCursor });

      // Add timeout to handle case where server doesn't respond
      setTimeout(() => {
        if (isLoadingMore) {
          socket.off('more-messages', handleMoreMessages);
          handleError();
        }
      }, 5000);
    });
  }, [socket, channelId, nextCursor, isLoadingMore]);

  return {
    messages,
    isLoading,
    error,
    hasMore,
    isLoadingMore,
    loadMore
  };
} 