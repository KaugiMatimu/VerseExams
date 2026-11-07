import assert from "node:assert/strict";
import test from "node:test";
import { formatMarkdown, insertMarkdownAtSelection } from "../lib/markdown-format";

test("wraps an existing selection for inline formatting", () => {
  assert.deepEqual(formatMarkdown("Read this", 0, 4, "bold"), {
    text: "**Read** this",
    selectionStart: 6,
    selectionEnd: 6,
  });
  assert.equal(formatMarkdown("count", 0, 5, "inlineCode").text, "`count`");
  assert.equal(formatMarkdown("site", 0, 4, "link").text, "[site](https://example.com)");
});

test("inserts accessible placeholders when there is no selection", () => {
  const result = formatMarkdown("Start", 5, 5, "italic");
  assert.equal(result.text, "Start*emphasized text*");
  assert.equal(result.selectionStart, 6);
  assert.equal(result.selectionEnd, 21);
});

test("prefixes selected lines and increments numbered list markers", () => {
  assert.equal(formatMarkdown("First\nSecond", 0, 12, "numberedList").text, "1. First\n2. Second");
  assert.equal(formatMarkdown("A thought", 0, 9, "blockquote").text, "> A thought");
  assert.equal(formatMarkdown("Section", 0, 7, "heading2").text, "## Section");
  assert.equal(formatMarkdown("Subsection", 0, 10, "heading3").text, "### Subsection");
  assert.equal(formatMarkdown("first\nsecond", 0, 12, "bulletedList").text, "- first\n- second");
});

test("adds fenced code and horizontal-rule blocks", () => {
  assert.equal(formatMarkdown("run()", 0, 5, "codeBlock").text, "```\nrun()\n```");
  assert.equal(formatMarkdown("BeforeAfter", 6, 6, "horizontalRule").text, "Before\n---\nAfter");
});

test("inserts an image at the current selection and replaces selected text", () => {
  assert.deepEqual(insertMarkdownAtSelection("before after", 7, 12, "![chart](/api/media/id)"), {
    text: "before ![chart](/api/media/id)",
    selectionStart: 30,
    selectionEnd: 30,
  });
});
