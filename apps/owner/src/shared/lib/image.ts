// Client-side only — uses browser Canvas API.
// Do NOT import in Server Components or API routes.

const DEFAULT_MAX_DIMENSION = 1200;
const DEFAULT_QUALITY = 0.8;
const DEFAULT_MAX_BYTES = 300_000; // 300 KB

export interface ImageConvertOptions {
  /** Max width or height in pixels. Default: 1200 */
  maxDimension?: number;
  /** WebP quality 0–1. Default: 0.8 */
  quality?: number;
  /** Target max size in bytes. Default: 300 000 */
  maxBytes?: number;
}

function loadImg(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('toBlob returned null'))),
      type,
      quality
    );
  });
}

/**
 * Convert any raster image (PNG/JPG/WebP) to WebP.
 * Resizes if either dimension exceeds `maxDimension`.
 * Re-compresses if result exceeds `maxBytes`.
 */
export async function convertToWebp(file: File, opts: ImageConvertOptions = {}): Promise<File> {
  const maxDim = opts.maxDimension ?? DEFAULT_MAX_DIMENSION;
  const quality = opts.quality ?? DEFAULT_QUALITY;
  const maxBytes = opts.maxBytes ?? DEFAULT_MAX_BYTES;

  const img = await loadImg(file);

  let { width, height } = img;
  if (width > maxDim || height > maxDim) {
    const ratio = Math.min(maxDim / width, maxDim / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);

  let blob = await canvasToBlob(canvas, 'image/webp', quality);

  // Re-compress proportionally if still over budget
  if (blob.size > maxBytes) {
    const reduced = quality * (maxBytes / blob.size) * 0.9;
    blob = await canvasToBlob(canvas, 'image/webp', Math.max(0.1, reduced));
  }

  const name = file.name.replace(/\.[^.]+$/, '.webp');
  return new File([blob], name, { type: 'image/webp' });
}

/**
 * Compress an image without changing its format.
 * Internally converts to WebP regardless of input format.
 */
export async function compressImage(file: File, opts?: ImageConvertOptions): Promise<File> {
  return convertToWebp(file, opts);
}

/**
 * Main entry point for form uploads.
 * Run this before uploading to storage — converts to WebP, resizes, compresses.
 *
 * Usage:
 *   const webpFile = await prepareUploadImage(rawFile);
 *   const url = URL.createObjectURL(webpFile); // preview
 *   // ... later: upload webpFile to storage
 */
export async function prepareUploadImage(file: File, opts?: ImageConvertOptions): Promise<File> {
  return convertToWebp(file, opts);
}
