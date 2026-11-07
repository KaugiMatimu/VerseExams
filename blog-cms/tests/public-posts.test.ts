import assert from "node:assert/strict";
import test from "node:test";
import {
  publicPostCorsHeaders,
  publicPostQuery,
  serializePublicPosts,
  type PublicPostRecord,
} from "../lib/public-posts";

test("public feed permits anonymous cross-origin reads without credentials", () => {
  assert.equal(publicPostCorsHeaders["Access-Control-Allow-Origin"], "*");
  assert.equal(publicPostCorsHeaders["Access-Control-Allow-Methods"], "GET, OPTIONS");
  assert.equal("Access-Control-Allow-Credentials" in publicPostCorsHeaders, false);
});

test("public post query only selects published posts and preview fields", () => {
  assert.deepEqual(publicPostQuery.where, { status: "PUBLISHED" });
  assert.deepEqual(publicPostQuery.select, {
    title: true,
    slug: true,
    excerpt: true,
    category: true,
  });
  assert.equal(publicPostQuery.take, 50);
});

test("public serialization returns only preview fields", () => {
  const record: PublicPostRecord & { body: string; status: "PUBLISHED"; id: string } = {
    id: "private-id",
    title: "A useful study plan",
    slug: "a-useful-study-plan",
    excerpt: "Plan the week around realistic study sessions.",
    category: "Study planning",
    body: "This private full article body must not appear in the preview.",
    status: "PUBLISHED",
  };

  assert.deepEqual(serializePublicPosts([record]), [{
    title: record.title,
    slug: record.slug,
    excerpt: record.excerpt,
    category: record.category,
  }]);
});
