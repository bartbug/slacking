import { Message, DirectMessage } from '@prisma/client';

interface PresenceUpdate {
  userId: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: Date;
}

export interface ServerToClientEvents {
  'error': (error: { message: string; details?: string; errorCode?: string }) => void;
  'channel-messages': (data: { messages: Message[]; nextCursor: string | null; hasMore: boolean }) => void;
  'new-channel-message': (message: Message) => void;
  'new-direct-message': (message: DirectMessage) => void;
  'thread:messages': (messages: Message[]) => void;
  'thread:message': (message: Message) => void;
  'thread:updated': (data: { threadId: string; messageId: string; content: string; user: any }) => void;
  'more-messages': (data: { messages: Message[]; nextCursor: string | null; hasMore: boolean }) => void;
  'reaction-updated': (message: Message & { reactions?: any[] }) => void;
  'presence:update': (update: PresenceUpdate) => void;
  'presence:list': (users: PresenceUpdate[]) => void;
}

export interface ClientToServerEvents {
  'join-channel': (data: { channelId: string; cursor?: string; limit?: number }) => void;
  'leave-channel': (channelId: string) => void;
  'join-dm': (userId: string) => void;
  'channel-message': (message: { content: string; channelId: string; userId: string }) => void;
  'direct-message': (message: { content: string; senderId: string; receiverId: string }) => void;
  'thread:join': (threadId: string) => void;
  'thread:leave': (threadId: string) => void;
  'thread:message': (message: { content: string; channelId: string; parentMessageId: string; userId: string }) => void;
  'load-more-messages': (data: { channelId: string; cursor: string; limit?: number }) => void;
  'add-reaction': (data: { messageId: string; emoji: string; userId: string }) => void;
  'remove-reaction': (data: { messageId: string; emoji: string; userId: string }) => void;
  'presence:status': (status: 'online' | 'away' | 'offline') => void;
} 