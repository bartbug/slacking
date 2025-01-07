import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/lib/auth'
import { SocketProvider } from '@/lib/socket'
import { AppLayout } from '@/components/AppLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Slack Clone',
  description: 'A real-time chat application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <AuthProvider>
          <SocketProvider>
            <AppLayout>
              {children}
            </AppLayout>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

