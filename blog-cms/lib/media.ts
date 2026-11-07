export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_MULTIPART_BODY_BYTES = MAX_IMAGE_SIZE_BYTES + 64 * 1024;

export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

export type SupportedImageMimeType = (typeof IMAGE_MIME_TYPES)[number];

const signatures: Record<SupportedImageMimeType, (bytes: Uint8Array) => boolean> = {
  "image/jpeg": (bytes) =>
    bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  "image/png": (bytes) =>
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a,
  "image/gif": (bytes) =>
    bytes.length >= 6 &&
    String.fromCharCode(...bytes.subarray(0, 6)) === "GIF87a" ||
    bytes.length >= 6 &&
    String.fromCharCode(...bytes.subarray(0, 6)) === "GIF89a",
  "image/webp": (bytes) =>
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.subarray(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.subarray(8, 12)) === "WEBP",
};

export type ImageValidation =
  | { ok: true; mimeType: SupportedImageMimeType }
  | { ok: false; error: string };

export function validateImageUpload(
  mimeType: string,
  declaredSize: number,
  bytes: Uint8Array,
): ImageValidation {
  if (!IMAGE_MIME_TYPES.includes(mimeType as SupportedImageMimeType)) {
    return { ok: false, error: "Choose a JPEG, PNG, GIF, or WebP image." };
  }
  if (
    !Number.isSafeInteger(declaredSize) ||
    declaredSize <= 0 ||
    declaredSize > MAX_IMAGE_SIZE_BYTES ||
    bytes.byteLength !== declaredSize
  ) {
    return { ok: false, error: "Image must be no larger than 5 MiB." };
  }
  const supportedType = mimeType as SupportedImageMimeType;
  if (!signatures[supportedType](bytes)) {
    return { ok: false, error: "The image contents do not match the selected file type." };
  }
  return { ok: true, mimeType: supportedType };
}

export function isSupportedImageMimeType(value: string): value is SupportedImageMimeType {
  return IMAGE_MIME_TYPES.includes(value as SupportedImageMimeType);
}
