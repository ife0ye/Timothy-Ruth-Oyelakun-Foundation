// Phone photos of certificates are often 3–6 MB. Re-encoding them at a sensible size keeps every
// page perfectly readable while letting a whole application fit in one upload.

const MAX_EDGE = 2000;
const QUALITY = 0.82;
const LEAVE_ALONE_BELOW = 350_000;

export async function shrinkImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.size < LEAVE_ALONE_BELOW) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    // Formats the browser can't decode (e.g. HEIC outside Safari) are sent as they are.
    return file;
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) {
    bitmap.close();
    return file;
  }
  // White behind transparent PNGs, so they don't turn black as JPEGs.
  context.fillStyle = '#fff';
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALITY));
  if (!blob || blob.size >= file.size) return file;
  const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
  return new File([blob], name, { type: 'image/jpeg', lastModified: file.lastModified });
}
