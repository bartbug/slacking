export interface User {
  id: string;
  name: string;
  email: string;
  status?: 'online' | 'away' | 'offline';
  lastSeen?: Date;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  members: User[];
}

export interface MessageReaction {
  id: string;
  emoji: string;
  messageId: string;
  userId: string;
  user: User;
  createdAt: string;
}

export interface Message {
  id: string;
  content: string;
  channelId: string;
  user: User;
  createdAt: string;
  reactions: MessageReaction[];
  parentMessageId?: string;
  replyCount?: number;
  lastReplyAt?: string;
}

export interface DirectMessage {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
}

export interface Thread {
  id: string;
  channelId: string;
  parentMessage: Message;
  participantIds: string[];
  messageCount: number;
  lastActivityAt: string;
} 