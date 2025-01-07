'use client';

import { Channel } from '@/components/Channel';
import { useAuth } from '@/lib/auth';

export default function ChannelPage({
  params,
}: {
  params: { id: string };
}) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Channel 
      channelId={params.id}
      userId={user.id}
    />
  );
} 