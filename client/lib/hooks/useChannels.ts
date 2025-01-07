import { useState, useEffect } from 'react';
import { Channel } from '../types';
import { useAuth } from '../auth';

export function useChannels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchChannels = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/channels`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch channels');
        }

        const data = await response.json();
        setChannels(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch channels');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannels();
  }, [user]);

  const createChannel = async (name: string, description?: string, isPrivate: boolean = false) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/channels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description, isPrivate }),
      });

      if (!response.ok) {
        throw new Error('Failed to create channel');
      }

      const newChannel = await response.json();
      setChannels(prev => [...prev, newChannel]);
      return newChannel;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create channel');
    }
  };

  return {
    channels,
    isLoading,
    error,
    createChannel,
  };
} 