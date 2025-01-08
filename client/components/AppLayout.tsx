'use client';

import { Sidebar } from './Sidebar';
import { useAuth } from '@/lib/auth';
import { Auth } from './Auth';
import { Toaster } from './ui/toaster';
import { ProfileMenu } from "@/components/ProfileMenu";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Auth />
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-12 border-b flex items-center px-4 justify-between">
          <div className="flex items-center gap-2">
            <ProfileMenu />
          </div>
        </header>
        {children}
      </main>
      <Toaster />
    </div>
  );
} 