'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900">Something went wrong!</h2>
        <p className="mt-2 text-sm text-gray-500">{error.message}</p>
        <button
          onClick={reset}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
} 