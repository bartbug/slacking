'use client';

import { AppLayout } from '@/components/AppLayout';

export default function Loading() {
  return (
    <AppLayout>
      <div className="flex flex-col h-full animate-pulse">
        <div className="px-6 py-4 border-b bg-white/50">
          <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-96 bg-gray-200 rounded"></div>
        </div>

        <div className="flex-1 p-6 space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3">
              <div className="w-9 h-9 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t bg-white/50">
          <div className="flex space-x-3">
            <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
            <div className="w-20 h-10 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 