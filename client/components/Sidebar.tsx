import { Button } from '@/components/ui/button'

export function Sidebar() {
  const channels = ['general', 'random', 'announcements']
  const directMessages = ['Alice', 'Bob', 'Charlie']

  return (
    <div className="w-64 bg-gray-800 text-white p-4 flex flex-col h-screen">
      <h2 className="text-xl font-bold mb-4">Slack Clone</h2>
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-2">Channels</h3>
        {channels.map((channel) => (
          <Button key={channel} variant="ghost" className="w-full justify-start">
            # {channel}
          </Button>
        ))}
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2">Direct Messages</h3>
        {directMessages.map((user) => (
          <Button key={user} variant="ghost" className="w-full justify-start">
            @ {user}
          </Button>
        ))}
      </div>
    </div>
  )
}

