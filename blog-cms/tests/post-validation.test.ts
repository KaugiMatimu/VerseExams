import assert from "node:assert/strict";
import test from "node:test";
import { postSchema, readPostForm } from "../lib/post";
import { formatDate } from "../lib/format";

const validPost = {
  title: "A useful study plan",
  slug: "a-useful-study-plan",
  excerpt: "A practical summary for planning your next study session.",
  category: "Study planning",
  body: "A short article body that is long enough to meet the editor requirements.",
  status: "DRAFT",
};

test("accepts a complete post with a normalized slug", () => {
  assert.equal(postSchema.safeParse(validPost).success, true);
});

test("rejects unsafe slugs and unknown publication states", () => {
  assert.equal(postSchema.safeParse({ ...validPost, slug: "../private" }).success, false);
  assert.equal(postSchema.safeParse({ ...validPost, status: "PUBLIC" }).success, false);
});

test("returns field validation errors for incomplete forms", () => {
  const form = new FormData();
  form.set("title", "A useful study plan");
  form.set("slug", "a-useful-study-plan");

  const result = readPostForm(form);
  assert.equal(result.success, false);
  if (!result.success) {
    assert.ok(result.error.flatten().fieldErrors.excerpt);
    assert.ok(result.error.flatten().fieldErrors.body);
  }
});

test("does not invent a publication date for undated seed posts", () => {
  assert.equal(formatDate(null), "Date not specified");
});
