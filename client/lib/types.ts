export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Message {
  id: string;
  content: string;
  userId: string;
  channelId: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface DirectMessage {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  updatedAt: string;
  sender: User;
  receiver: User;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  members: ChannelMember[];
}

export interface ChannelMember {
  id: string;
  userId: string;
  channelId: string;
  role: 'admin' | 'member';
  joinedAt: string;
  user: User;
} 