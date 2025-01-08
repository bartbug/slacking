export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  members: User[];
}

export interface MessageReaction {
  emoji: string;
  users: User[];
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