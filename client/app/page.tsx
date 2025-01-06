'use client'

import { useState } from 'react'
import { Auth } from '@/components/Auth'
import { Sidebar } from '@/components/Sidebar'
import { Channel } from '@/components/Channel'
import { useAuth } from '@/lib/auth'

// For testing purposes, using the same hardcoded values
const DEFAULT_CHANNEL_ID = 'cm5lkwfgq0002cuirtyfkqtu4';

export default function Home() {
  const [user, setUser] = useState<string | null>(null)
  const { user: authUser } = useAuth()

  const handleLogin = (username: string) => {
    setUser(username)
  }

  if (!user || !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Auth onLogin={(username: string) => handleLogin(username)} />
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-grow flex flex-col">
        <Channel 
          channelId={DEFAULT_CHANNEL_ID}
          channelName="general"
          userId={authUser.id}
        />
      </div>
    </div>
  )
}

