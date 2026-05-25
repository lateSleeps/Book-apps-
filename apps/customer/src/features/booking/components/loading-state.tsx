'use client';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingState({
  message = 'Memproses...',
  fullScreen = false,
}: LoadingStateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-s20">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-gray-900 animate-spin"></div>
      </div>
      {message && <p className="text-center text-gray-600 font-medium">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-s40">{content}</div>;
}

// Skeleton loader for content
export function SkeletonLoader({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-s16">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse space-y-s12">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      ))}
    </div>
  );
}
