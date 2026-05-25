'use client';

interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

export function ErrorAlert({
  message,
  onDismiss,
  actionLabel = 'Tutup',
  onAction,
}: ErrorAlertProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-s16 bg-red-50 border-b border-red-200">
      <div className="max-w-2xl mx-auto flex items-start gap-s12">
        <div className="text-2xl flex-shrink-0">⚠️</div>
        <div className="flex-1">
          <p className="text-sm text-red-900 font-medium">{message}</p>
        </div>
        <div className="flex gap-s8 flex-shrink-0">
          {onAction && (
            <button
              onClick={onAction}
              className="text-sm font-semibold text-red-900 hover:text-red-700 px-s12 py-s8 rounded hover:bg-red-100 transition-colors"
            >
              {actionLabel}
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-lg text-red-400 hover:text-red-600 px-s8 py-s4"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
