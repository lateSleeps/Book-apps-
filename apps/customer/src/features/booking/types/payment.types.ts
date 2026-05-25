import type { PaymentType } from './booking.types';

/** Payment option display */
export interface PaymentOption {
  type: PaymentType;
  label: string;
  description: string;
  amount: number;
  isRecommended: boolean;
}

/** File upload state */
export interface FileUploadState {
  file: File | null;
  previewUrl: string | null;
  error: string | null;
  isUploading: boolean;
}
