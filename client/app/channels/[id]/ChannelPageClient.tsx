'use client';

import React, { Suspense } from 'react';
import { Channel } from '@/components/Channel';
import { useAuth } from '@/lib/auth';

interface ChannelPageClientProps {
  channelId: string;
}

function ChannelContent({ channelId, userId }: { channelId: string; userId: string }) {
  return <Channel channelId={channelId} userId={userId} />;
}

export function ChannelPageClient({ channelId }: ChannelPageClientProps) {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="h-full flex items-center justify-center">
        <div>Loading channel...</div>
      </div>
    }>
      <ChannelContent channelId={channelId} userId={user.id} />
    </Suspense>
  );
} 