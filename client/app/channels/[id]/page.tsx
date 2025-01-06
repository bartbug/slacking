'use client';

import { Channel } from '../../../components/Channel';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function ChannelPage({
  params,
}: {
  params: { id: string };
}) {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <div className="h-screen">
      <Channel 
        channelId={params.id}
        channelName="general"
        userId={user.id}
      />
    </div>
  );
} 