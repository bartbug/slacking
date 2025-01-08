import { useState, useEffect } from 'react';
import { Channel } from '../types';
import { useAuth } from '../auth';
import { TokenService } from '../services/token';

export function useChannels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchChannels = async () => {
      try {
        const token = TokenService.get();
        if (!token) {
          throw new Error('No authentication token found');
        }

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
      const token = TokenService.get();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/channels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description, isPrivate }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create channel');
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