import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  MAX_IMAGE_SIZE_BYTES,
  MAX_MULTIPART_BODY_BYTES,
  validateImageUpload,
} from "@/lib/media";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function readBoundedBody(request: NextRequest) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("empty-body");

  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_MULTIPART_BODY_BYTES) {
        await reader.cancel();
        throw new Error("body-too-large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const bodyBuffer = new ArrayBuffer(body.byteLength);
  new Uint8Array(bodyBuffer).set(body);
  return bodyBuffer;
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return jsonError("Authentication required.", 401);
  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return jsonError("Upload must come from this site.", 403);
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("multipart/form-data;")) {
    return jsonError("Use a multipart image upload.", 415);
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_MULTIPART_BODY_BYTES) {
    return jsonError("Request is too large.", 413);
  }

  let body: ArrayBuffer;
  let formData: FormData;
  try {
    body = await readBoundedBody(request);
    const headers = new Headers(request.headers);
    headers.delete("content-length");
    formData = await new Request(request.url, {
      method: "POST",
      headers,
      body,
    }).formData();
  } catch (error) {
    if (error instanceof Error && error.message === "body-too-large") {
      return jsonError("Request is too large.", 413);
    }
    return jsonError("Could not read the image upload.", 400);
  }

  const file = formData.get("file");
  if (!(file instanceof File)) return jsonError("Choose an image file to upload.", 400);
  if (file.size > MAX_IMAGE_SIZE_BYTES) return jsonError("Image must be no larger than 5 MiB.", 413);

  const bytes = new Uint8Array(await file.arrayBuffer());
  const validation = validateImageUpload(file.type, file.size, bytes);
  if (!validation.ok) return jsonError(validation.error, 415);

  const id = randomUUID();
  await db.media.create({
    data: {
      id,
      mimeType: validation.mimeType,
      data: Buffer.from(bytes),
    },
    select: { id: true },
  });

  return NextResponse.json(
    { id, url: `/api/media/${id}` },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
}
