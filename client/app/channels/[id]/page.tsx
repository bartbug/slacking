import { Suspense } from 'react';
import { ChannelPageClient } from './ChannelPageClient';

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ChannelPage({ params }: PageProps) {
  const { id } = await params;
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChannelPageClient channelId={id} />
    </Suspense>
  );
} 