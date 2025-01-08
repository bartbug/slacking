'use client'

import { Channel } from '@/components/Channel'
import { Auth } from '@/components/Auth'
import { useAuth } from '@/lib/auth'
import { useChannelStore } from '@/lib/stores/channelStore'
import { useEffect } from 'react'

export default function Home() {
  const { user } = useAuth()
  const { 
    currentChannel, 
    setChannels, 
    setCurrentChannel,
    setError 
  } = useChannelStore()

  // Fetch channels when user logs in
  useEffect(() => {
    const fetchChannels = async () => {
      if (!user) return;
      
      try {
        const token = sessionStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/channels`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch channels');
        
        const channels = await response.json();
        setChannels(channels);
        
        // Set the first channel as default if no channel is selected
        if (!currentChannel && channels.length > 0) {
          setCurrentChannel(channels[0]);
        }
      } catch (error) {
        console.error('Error fetching channels:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch channels');
      }
    };

    fetchChannels();
  }, [user, setChannels, setCurrentChannel, setError, currentChannel]);

  // Show loading state
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Auth />
      </div>
    );
  }

  // Show channel if we have one selected
  if (currentChannel) {
    return (
      <Channel 
        channelId={currentChannel.id}
        userId={user.id}
      />
    );
  }

  // Show loading state while fetching channels
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-gray-500">Loading channels...</div>
    </div>
  );
}

