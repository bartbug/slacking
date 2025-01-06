'use client';

import React, { useState, useEffect } from 'react';
import { useSocket, useChannelMessages } from '../lib/socket';
import { Message } from '../lib/types';

interface ChannelProps {
  channelId: string;
  channelName: string;
  userId: string;
}

export const Channel: React.FC<ChannelProps> = ({ channelId, channelName, userId }) => {
  const [newMessage, setNewMessage] = useState('');
  const { sendChannelMessage, isConnected } = useSocket();
  const messages = useChannelMessages(channelId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendChannelMessage(newMessage, channelId, userId);
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold"># {channelName}</h2>
        <div className="text-sm text-gray-500">
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message: Message) => (
          <div key={message.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                {message.user.name[0]}
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{message.user.name}</span>
                <span className="text-xs text-gray-500">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-gray-800">{message.content}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message #${channelName}`}
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!isConnected}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}; 