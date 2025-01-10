'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useChannelStore } from '@/lib/stores/channelStore';
import { useAuth } from '@/lib/auth';

export default function ChannelsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { currentChannel } = useChannelStore();

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    // If there's a current channel, redirect to it
    if (currentChannel) {
      router.push(`/channels/${currentChannel.id}`);
      return;
    }

    // Otherwise, fetch channels and redirect to the first one
    const fetchChannels = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/channels`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch channels');
        
        const channels = await response.json();
        if (channels.length > 0) {
          router.push(`/channels/${channels[0].id}`);
        }
      } catch (error) {
        console.error('Error fetching channels:', error);
      }
    };

    fetchChannels();
  }, [user, currentChannel, router]);

  return (
    <div className="h-full flex items-center justify-center">
      <div>Loading channels...</div>
    </div>
  );
} 