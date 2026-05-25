'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/shared/lib/cn';
import { useBookingStore } from '@/features/booking/hooks/use-booking-store';
import { logger } from '@/shared/lib/logger';
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '@/features/booking/constants/booking.constants';

export function FileUploader() {
  const { proofImageUrl, setProofImage } = useBookingStore();
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentBlobUrl = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (currentBlobUrl.current) URL.revokeObjectURL(currentBlobUrl.current);
    };
  }, []);

  function handleFile(file: File) {
    setError(null);
    if (!(ALLOWED_FILE_TYPES as readonly string[]).includes(file.type)) {
      const msg = 'Hanya format JPEG dan PNG yang diizinkan.';
      logger.warn('proof upload rejected — invalid type', { type: file.type, name: file.name });
      setError(msg);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      const msg = 'Ukuran file maksimal 5MB.';
      logger.warn('proof upload rejected — file too large', { size: file.size, name: file.name });
      setError(msg);
      return;
    }
    if (currentBlobUrl.current) URL.revokeObjectURL(currentBlobUrl.current);
    const url = URL.createObjectURL(file);
    currentBlobUrl.current = url;
    logger.log('proof image uploaded', { name: file.name, size: file.size, type: file.type });
    setProofImage(url);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function handleReplace() {
    if (currentBlobUrl.current) {
      URL.revokeObjectURL(currentBlobUrl.current);
      currentBlobUrl.current = null;
    }
    setProofImage(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="mt-s16">
      <p className="text-t14 font-semibold text-label mb-s12">Unggah Bukti Pembayaran</p>

      {proofImageUrl ? (
        <div className="relative rounded-r16 overflow-hidden border border-sep">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={proofImageUrl} alt="Bukti pembayaran" className="w-full h-48 object-cover" />
          <button
            onClick={handleReplace}
            className="absolute top-s8 right-s8 bg-white/90 text-label text-t12 px-s8 py-s4 rounded-rF border border-sep"
          >
            Ganti
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex flex-col items-center justify-center h-36 rounded-r16 border-2 border-dashed cursor-pointer transition-colors',
            error ? 'border-red-400 bg-red-50' : 'border-sep bg-bg hover:border-accent hover:bg-accent-soft'
          )}
        >
          <span className="text-3xl mb-s8">📎</span>
          <p className="text-t14 text-label2 text-center">
            Tap atau seret file ke sini<br />
            <span className="text-t12 text-label3">JPEG, PNG · maks 5MB</span>
          </p>
        </div>
      )}

      {error && <p className="text-t12 text-red-500 mt-s8">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
