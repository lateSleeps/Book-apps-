'use client';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function BookingError({ error, reset }: ErrorPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-s24 text-center">
      <div className="text-4xl mb-s16">⚠️</div>
      <h2 className="text-xl font-bold text-label mb-s8">Terjadi Kesalahan</h2>
      <p className="text-sm text-label2 mb-s24">{error.message}</p>
      <button
        onClick={reset}
        className="px-s24 py-s12 bg-accent text-white rounded-rF text-sm font-semibold"
      >
        Coba Lagi
      </button>
    </div>
  );
}
