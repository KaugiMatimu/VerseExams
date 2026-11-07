import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { isSupportedImageMimeType } from "@/lib/media";

export const runtime = "nodejs";

const imageIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!imageIdPattern.test(id)) return new NextResponse(null, { status: 404 });

  const media = await db.media.findUnique({
    where: { id },
    select: { mimeType: true, data: true },
  });
  if (!media || !isSupportedImageMimeType(media.mimeType)) {
    return new NextResponse(null, { status: 404 });
  }

  const body = new ArrayBuffer(media.data.byteLength);
  const bytes = new Uint8Array(body);
  bytes.set(media.data);
  return new NextResponse(body, {
    headers: {
      "Content-Type": media.mimeType,
      "Content-Length": String(bytes.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
