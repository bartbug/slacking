import React from 'react';
import { cn } from '@/lib/utils';
import { User } from '@/lib/types';

interface PresenceIndicatorProps {
  user: User;
  showText?: boolean;
  className?: string;
}

export function PresenceIndicator({ user, showText = false, className }: PresenceIndicatorProps) {
  // Add debug log when component renders
  React.useEffect(() => {
    console.log('PresenceIndicator rendered for user:', {
      userId: user.id,
      status: user.status,
      lastSeen: user.lastSeen
    });
  }, [user.id, user.status, user.lastSeen]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'away':
        return 'Away';
      case 'offline':
        if (user.lastSeen) {
          const lastSeen = new Date(user.lastSeen);
          const now = new Date();
          const diffMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));
          
          if (diffMinutes < 1) return 'Just now';
          if (diffMinutes < 60) return `${diffMinutes}m ago`;
          if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
          return lastSeen.toLocaleDateString();
        }
        return 'Offline';
      default:
        return 'Offline';
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn(
        'w-2 h-2 rounded-full',
        getStatusColor(user.status),
        'ring-2 ring-white'
      )} />
      {showText && (
        <span className="text-xs text-gray-500">
          {getStatusText(user.status)}
        </span>
      )}
    </div>
  );
} 