import { z } from 'zod';

/**
 * Upload contract — presigned URL pattern for all file uploads.
 *
 * Flow:
 *   1. Client calls tRPC upload mutation with metadata (bucket, fileName, contentType, size)
 *   2. Server validates the request (type, size) and returns a presigned URL
 *   3. Client uploads the file directly to Supabase Storage via PUT
 *   4. Client calls the follow-up tRPC mutation to persist the public URL in DB
 *
 * This pattern keeps file bytes out of the tRPC handler and the service_role_key
 * out of the browser.
 *
 * Implementation note: presigned URLs for Supabase Storage require the
 * supabaseAdmin client (service_role_key). This will be wired up when Sprint 4
 * introduces the admin client. Until then, the upload mutation stubs exist in
 * the router but return NOT_IMPLEMENTED.
 */

// ── Bucket registry ───────────────────────────────────────────────────────────

export const STORAGE_BUCKETS = {
  logo: 'salon-logos',
  cover: 'salon-covers',
  qris: 'qris-images',
  avatar: 'staff-avatars',
  product: 'product-images',
  bundle: 'bundle-covers',
} as const;

export type UploadBucket = keyof typeof STORAGE_BUCKETS;

// ── File constraints ──────────────────────────────────────────────────────────

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

/** Max file size in bytes, per bucket */
export const MAX_FILE_SIZES: Record<UploadBucket, number> = {
  logo: 2 * 1024 * 1024, // 2 MB
  cover: 5 * 1024 * 1024, // 5 MB
  qris: 5 * 1024 * 1024, // 5 MB
  avatar: 2 * 1024 * 1024, // 2 MB
  product: 3 * 1024 * 1024, // 3 MB
  bundle: 3 * 1024 * 1024, // 3 MB
};

// ── Request / response types ──────────────────────────────────────────────────

/** What the client sends to request a presigned URL */
export interface UploadRequest {
  bucket: UploadBucket;
  /** Original filename — used to generate the storage path */
  fileName: string;
  contentType: AllowedImageType;
  /** File size in bytes — server validates against MAX_FILE_SIZES */
  fileSizeBytes: number;
}

/** What the server returns after validating the request */
export interface UploadResult {
  /** Presigned URL — client uses this with a PUT request to upload the file */
  uploadUrl: string;
  /** Public URL — persist this in DB after upload succeeds */
  publicUrl: string;
  /** ISO timestamp when the presigned URL expires */
  expiresAt: string;
}

// ── Zod schemas ───────────────────────────────────────────────────────────────

export const uploadBucketSchema = z.enum(['logo', 'cover', 'qris', 'avatar', 'product', 'bundle']);

export const uploadRequestSchema = z.object({
  bucket: uploadBucketSchema,
  fileName: z.string().min(1).max(255),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  fileSizeBytes: z.number().int().positive(),
});

// ── Validation ────────────────────────────────────────────────────────────────

/**
 * Validate an upload request before issuing a presigned URL.
 * Returns an error string if invalid, null if valid.
 */
export function validateUploadRequest(req: UploadRequest): string | null {
  const maxBytes = MAX_FILE_SIZES[req.bucket];

  if (req.fileSizeBytes > maxBytes) {
    const maxMb = maxBytes / (1024 * 1024);
    return `File too large for ${req.bucket} uploads (max: ${maxMb}MB)`;
  }

  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(req.contentType)) {
    return `Content type ${req.contentType} is not allowed. Use JPEG, PNG, or WebP.`;
  }

  if (!/^[\w\-. ]+$/.test(req.fileName)) {
    return 'File name contains invalid characters';
  }

  return null;
}

/**
 * Build the storage path for a file upload.
 * Format: {bucket}/{salonId}/{timestamp}-{sanitised-filename}
 */
export function buildStoragePath(bucket: UploadBucket, salonId: string, fileName: string): string {
  const ext = fileName.split('.').pop() ?? 'jpg';
  const sanitised = fileName.replace(/[^a-zA-Z0-9.-]/g, '_').slice(0, 64);
  const timestamp = Date.now();
  return `${STORAGE_BUCKETS[bucket]}/${salonId}/${timestamp}-${sanitised}.${ext}`;
}
