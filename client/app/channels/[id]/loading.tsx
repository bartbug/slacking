'use client';

export default function Loading() {
  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b bg-white/50 backdrop-blur-sm flex-shrink-0">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="flex-1 min-h-0 p-6 space-y-6">
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
    </div>
  );
} 