"use client";

import { UploadSimple } from "@phosphor-icons/react";
import { useState, useRef, useEffect } from "react";
import {
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
} from "@/features/booking/constants/booking.constants";
import { useBookingStore } from "@/features/booking/hooks/use-booking-store";
import { InlineNotice } from "@/shared/components/ui/InlineNotice";
import { cn } from "@/shared/lib/cn";
import { logger } from "@/shared/lib/logger";

/**
 * File uploader for payment proof images
 *
 * Manages blob URL lifecycle:
 * - Creates blob URL on file selection for preview
 * - Revokes previous blob URL before creating new one (prevents leak)
 * - Revokes blob URL on component unmount via cleanup
 * - Stores actual File object in store for upload in StepPayment
 */
export function FileUploader() {
  const { proofImageUrl, setProofImage } = useBookingStore();
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentBlobUrl = useRef<string | null>(null);

  // Cleanup: revoke blob URL on unmount
  useEffect(() => {
    return () => {
      if (currentBlobUrl.current) URL.revokeObjectURL(currentBlobUrl.current);
    };
  }, []);

  function handleFile(file: File) {
    setError(null);
    if (!(ALLOWED_FILE_TYPES as readonly string[]).includes(file.type)) {
      const msg = "Hanya format JPEG dan PNG yang diizinkan.";
      logger.warn("proof upload rejected — invalid type", {
        type: file.type,
        name: file.name,
      });
      setError(msg);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      const msg = "Ukuran file maksimal 5MB.";
      logger.warn("proof upload rejected — file too large", {
        size: file.size,
        name: file.name,
      });
      setError(msg);
      return;
    }
    if (currentBlobUrl.current) URL.revokeObjectURL(currentBlobUrl.current);
    const url = URL.createObjectURL(file);
    currentBlobUrl.current = url;
    logger.log("proof image uploaded", {
      name: file.name,
      size: file.size,
      type: file.type,
    });
    setFileName(file.name);
    setProofImage(url, file);
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
    setFileName(null);
    setProofImage(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      {proofImageUrl ? (
        /* ── Uploaded state ── */
        <div className="space-y-s8">
          {/* Design-system success notice — same component as elsewhere in flow */}
          <InlineNotice
            variant="success"
            title="Bukti pembayaran siap dikirim"
          />

          {/* Thumbnail card — image + metadata + replace action */}
          <div className="bg-bg-card rounded-r20 shadow-card overflow-hidden">
            {/* Preview image — confirmation thumbnail, not a viewer */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={proofImageUrl}
              alt="Bukti pembayaran"
              className="w-full h-36 object-cover"
            />

            {/* File name + replace action */}
            <div className="px-s16 py-s12 flex items-center justify-between gap-s12">
              {fileName && (
                <p className="text-ts-cap1 text-label3 truncate flex-1 min-w-0">
                  {fileName}
                </p>
              )}
              <button
                onClick={handleReplace}
                className="flex-shrink-0 text-ts-cap1 font-semibold text-label2 bg-bg-control border border-sep rounded-rF px-s12 py-[6px] transition-colors active:bg-sep"
              >
                Ganti Foto
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ── Empty state — calm tappable card ── */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "bg-bg-card rounded-r20 shadow-card px-s20 py-s24 flex flex-col items-center gap-s12 cursor-pointer transition-colors active:bg-bg-control",
            error ? "ring-1 ring-red-400" : "",
          )}
        >
          {/* Upload icon */}
          <div className="w-[44px] h-[44px] rounded-full bg-bg-control border border-sep flex items-center justify-center">
            <UploadSimple size={20} weight="regular" className="text-label" />
          </div>

          {/* Text hierarchy: title → instruction → constraint */}
          <div className="text-center">
            <p className="text-ts-sub font-semibold text-label">
              Unggah bukti pembayaran
            </p>
            <p className="text-ts-fn text-label2 mt-s4 leading-snug">
              Tap untuk memilih foto
              <br />
              atau seret file ke sini
            </p>
            <p className="text-ts-cap1 text-label3 mt-s8">
              JPG atau PNG hingga 5 MB
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-ts-cap1 text-red-500 mt-s8 px-s4">{error}</p>
      )}

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
