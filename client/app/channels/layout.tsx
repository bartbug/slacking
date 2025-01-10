'use client';

import React from 'react';
import { useAuth } from '@/lib/auth';

interface LayoutProps {
  children: React.ReactNode;
}

export default function ChannelsLayout({ children }: LayoutProps) {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <div>Please log in to view channels</div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {children}
    </div>
  );
} 