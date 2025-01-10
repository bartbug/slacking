'use client';

import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function ChannelLayout({ children }: LayoutProps) {
  return (
    <div className="h-full">
      {children}
    </div>
  );
} 