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
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Auth />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex-grow flex flex-col bg-white shadow-xl">
        <header className="h-12 border-b flex items-center px-4 justify-between">
          <div className="flex items-center gap-2">
            <ProfileMenu />
          </div>
        </header>
        {children}
      </div>
      <Toaster />
    </div>
  );
} 