import assert from "node:assert/strict";
import test from "node:test";
import { MAX_IMAGE_SIZE_BYTES, validateImageUpload } from "../lib/media";

const pngSignature = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const jpegSignature = Uint8Array.from([0xff, 0xd8, 0xff, 0x00]);
const gifSignature = new TextEncoder().encode("GIF89a");
const webpSignature = Uint8Array.from([
  0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
]);

test("accepts each supported raster image when its signature matches", () => {
  assert.equal(validateImageUpload("image/png", pngSignature.length, pngSignature).ok, true);
  assert.equal(validateImageUpload("image/jpeg", jpegSignature.length, jpegSignature).ok, true);
  assert.equal(validateImageUpload("image/gif", gifSignature.length, gifSignature).ok, true);
  assert.equal(validateImageUpload("image/webp", webpSignature.length, webpSignature).ok, true);
});

test("rejects SVG, unknown MIME types, and MIME/signature mismatches", () => {
  const svg = new TextEncoder().encode("<svg xmlns='http://www.w3.org/2000/svg'></svg>");
  assert.equal(validateImageUpload("image/svg+xml", svg.length, svg).ok, false);
  assert.equal(validateImageUpload("application/octet-stream", pngSignature.length, pngSignature).ok, false);
  assert.equal(validateImageUpload("image/jpeg", pngSignature.length, pngSignature).ok, false);
});

test("accepts the exact five MiB size boundary and rejects larger or inconsistent files", () => {
  const atLimit = new Uint8Array(MAX_IMAGE_SIZE_BYTES);
  atLimit.set(pngSignature);
  assert.equal(validateImageUpload("image/png", MAX_IMAGE_SIZE_BYTES, atLimit).ok, true);
  assert.equal(validateImageUpload("image/png", MAX_IMAGE_SIZE_BYTES + 1, atLimit).ok, false);
  assert.equal(validateImageUpload("image/png", 1, pngSignature).ok, false);
});
