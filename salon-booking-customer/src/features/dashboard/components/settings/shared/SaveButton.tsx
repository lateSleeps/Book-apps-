'use client';

import { LoadingSpinner } from '@/shared/components/ui/loading-spinner';

interface SaveButtonProps {
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

export function SaveButton({ loading, disabled, onClick, children = 'Simpan Perubahan' }: SaveButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`px-6 py-2.5 rounded-lg font-medium text-[13px] transition-all duration-200 flex items-center gap-2 ${
        loading || disabled
          ? 'bg-[#e0e0e0] text-[#999] cursor-not-allowed'
          : 'bg-[#16a34a] text-white hover:bg-[#15923f] active:scale-95'
      }`}
    >
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  );
}
