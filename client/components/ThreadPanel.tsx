'use client'

import { useThreadStore } from '@/lib/stores/threadStore'
import { useSocket } from '@/lib/socket'
import { useAuth } from '@/lib/auth'
import { Button } from './ui/button'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function ThreadPanel() {
  const { user } = useAuth()
  const { socket } = useSocket()
  const { 
    activeThread,
    threadMessages,
    isLoading,
    clearThread,
    setThreadMessages,
    addThreadMessage 
  } = useThreadStore()

  const [newReply, setNewReply] = useState('')

  useEffect(() => {
    if (!socket || !activeThread) return

    // Join thread room
    socket.emit('thread:join', activeThread.id)

    // Fetch thread messages
    const fetchThreadMessages = async () => {
      try {
        const token = sessionStorage.getItem('token')
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/threads/${activeThread.id}/messages`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!response.ok) throw new Error('Failed to fetch thread messages')
        
        const messages = await response.json()
        setThreadMessages(messages)
      } catch (error) {
        console.error('Error fetching thread messages:', error)
      }
    }

    fetchThreadMessages()

    // Listen for new thread messages
    socket.on('thread:message', (message) => {
      addThreadMessage(message)
    })

    return () => {
      socket.emit('thread:leave', activeThread.id)
      socket.off('thread:message')
    }
  }, [socket, activeThread, addThreadMessage, setThreadMessages])

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newReply.trim() || !socket || !activeThread || !user) return

    try {
      const message = {
        content: newReply,
        channelId: activeThread.channelId,
        parentMessageId: activeThread.id,
        userId: user.id,
      }

      socket.emit('thread:message', message)
      setNewReply('')
    } catch (error) {
      console.error('Error sending reply:', error)
    }
  }

  if (!activeThread) return null

  return (
    <div className={cn(
      "fixed inset-y-0 right-0 w-[45%] bg-white border-l shadow-lg",
      "transform transition-transform duration-300 ease-in-out",
      activeThread ? "translate-x-0" : "translate-x-full"
    )}>
      {/* Header */}
      <div className="px-6 py-4 border-b flex items-center justify-between bg-white/50 backdrop-blur-sm">
        <div>
          <h3 className="text-lg font-semibold">Thread</h3>
          <p className="text-sm text-gray-500">
            {activeThread.parentMessage.user.name} started this thread
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={clearThread}
          className="hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Thread Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Parent Message */}
        <div className="pb-6 border-b">
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">
              {activeThread.parentMessage.user.name[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">
                  {activeThread.parentMessage.user.name}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(activeThread.parentMessage.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <p className="mt-1 text-gray-800">
                {activeThread.parentMessage.content}
              </p>
            </div>
          </div>
        </div>

        {/* Replies */}
        {threadMessages.map((message) => (
          <div key={message.id} className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">
              {message.user.name[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{message.user.name}</span>
                <span className="text-xs text-gray-400">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <p className="mt-1 text-gray-800">{message.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="px-6 py-4 border-t bg-white/50 backdrop-blur-sm">
        <form onSubmit={handleSendReply} className="flex space-x-3">
          <input
            type="text"
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            placeholder="Reply to thread..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button type="submit">Reply</Button>
        </form>
      </div>
    </div>
  )
} 