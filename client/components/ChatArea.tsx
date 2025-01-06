import { ScrollArea } from '@/components/ui/scroll-area'

interface Message {
  id: number
  user: string
  content: string
  timestamp: string
}

interface ChatAreaProps {
  messages: Message[]
}

export function ChatArea({ messages }: ChatAreaProps) {
  return (
    <ScrollArea className="flex-grow p-4">
      {messages.map((message) => (
        <div key={message.id} className="mb-4">
          <div className="font-bold">{message.user}</div>
          <div>{message.content}</div>
          <div className="text-xs text-gray-500">{message.timestamp}</div>
        </div>
      ))}
    </ScrollArea>
  )
}

