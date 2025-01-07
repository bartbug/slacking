'use client'

import { Channel } from '@/components/Channel'
import { useAuth } from '@/lib/auth'

// For testing purposes, using the same hardcoded values
const DEFAULT_CHANNEL_ID = 'cm5lkwfgq0002cuirtyfkqtu4';

export default function Home() {
  const { user } = useAuth()

  if (!user) return null;

  return (
    <Channel 
      channelId={DEFAULT_CHANNEL_ID}
      userId={user.id}
    />
  );
}

