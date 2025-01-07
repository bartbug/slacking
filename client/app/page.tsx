'use client'

import { Channel } from '@/components/Channel'
import { Auth } from '@/components/Auth'
import { useAuth } from '@/lib/auth'

// For testing purposes, using the same hardcoded values
const DEFAULT_CHANNEL_ID = 'cm5lkwfgq0002cuirtyfkqtu4';

export default function Home() {
  const { user, isLoading } = useAuth()

  // Show loading state
  if (isLoading) {
    return <div>Loading...</div>
  }

  // Show auth page if not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Auth />
      </div>
    );
  }

  // Show channel if logged in
  return (
    <Channel 
      channelId={DEFAULT_CHANNEL_ID}
      userId={user.id}
    />
  );
}

