'use client';

import { Button } from '@/components/ui/button';
import { useChannels } from '@/lib/hooks/useChannels';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export function Sidebar() {
  const { channels, isLoading, createChannel } = useChannels();
  const [isCreating, setIsCreating] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDescription, setNewChannelDescription] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    try {
      setIsCreating(true);
      const channel = await createChannel(newChannelName.trim(), newChannelDescription.trim());
      setNewChannelName('');
      setNewChannelDescription('');
      router.push(`/channels/${channel.id}`);
      toast({
        title: 'Channel created',
        description: `#${channel.name} has been created successfully.`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create channel',
        variant: 'destructive'
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="w-64 bg-gray-800 text-white p-4 flex flex-col h-screen">
      <h2 className="text-xl font-bold mb-4">Slack Clone</h2>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Channels</h3>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="h-6 w-6 p-0 bg-transparent hover:bg-gray-700">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new channel</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateChannel} className="space-y-4">
                <div>
                  <Label htmlFor="channelName">Channel name</Label>
                  <Input
                    id="channelName"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    placeholder="e.g. marketing"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="channelDescription">Description (optional)</Label>
                  <Input
                    id="channelDescription"
                    value={newChannelDescription}
                    onChange={(e) => setNewChannelDescription(e.target.value)}
                    placeholder="What's this channel about?"
                  />
                </div>
                <Button type="submit" disabled={isCreating || !newChannelName.trim()}>
                  {isCreating ? 'Creating...' : 'Create Channel'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-1">
          {isLoading ? (
            // Loading skeleton that maintains the same structure
            <>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-full h-9 bg-gray-700/50 rounded animate-pulse"
                />
              ))}
            </>
          ) : (
            channels.map((channel) => (
              <Link 
                key={channel.id} 
                href={`/channels/${channel.id}`} 
                className="block transition-opacity duration-200"
                scroll={false}
              >
                <Button
                  className="w-full justify-start bg-transparent hover:bg-gray-700 text-white"
                >
                  # {channel.name}
                </Button>
              </Link>
            ))
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Direct Messages</h3>
        {/* We'll implement direct messages later */}
      </div>
    </div>
  );
}

