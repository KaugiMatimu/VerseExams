export type MarkdownFormat =
  | "bold"
  | "italic"
  | "inlineCode"
  | "link"
  | "heading2"
  | "heading3"
  | "blockquote"
  | "bulletedList"
  | "numberedList"
  | "codeBlock"
  | "horizontalRule";

export type MarkdownEdit = {
  text: string;
  selectionStart: number;
  selectionEnd: number;
};

export function insertMarkdownAtSelection(
  text: string,
  selectionStart: number,
  selectionEnd: number,
  insertion: string,
): MarkdownEdit {
  const nextText = text.slice(0, selectionStart) + insertion + text.slice(selectionEnd);
  const cursor = selectionStart + insertion.length;
  return { text: nextText, selectionStart: cursor, selectionEnd: cursor };
}

function wrapSelection(
  text: string,
  start: number,
  end: number,
  prefix: string,
  suffix: string,
  placeholder: string,
): MarkdownEdit {
  const selected = text.slice(start, end);
  const content = selected || placeholder;
  const nextText = `${text.slice(0, start)}${prefix}${content}${suffix}${text.slice(end)}`;
  const selectionStart = start + prefix.length;
  const selectionEnd = selectionStart + content.length;
  return {
    text: nextText,
    selectionStart: selected ? selectionEnd : selectionStart,
    selectionEnd,
  };
}

function prefixLines(
  text: string,
  start: number,
  end: number,
  getPrefix: (lineIndex: number) => string,
): MarkdownEdit {
  const blockStart = text.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
  const nextNewline = text.indexOf("\n", end);
  const blockEnd = nextNewline === -1 ? text.length : nextNewline;
  const block = text.slice(blockStart, blockEnd);
  const nextBlock = block
    .split("\n")
    .map((line, index) => `${getPrefix(index)}${line}`)
    .join("\n");
  const nextText = `${text.slice(0, blockStart)}${nextBlock}${text.slice(blockEnd)}`;
  const addedPrefixLength = nextBlock.length - block.length;
  return {
    text: nextText,
    selectionStart: start + getPrefix(0).length,
    selectionEnd: end + addedPrefixLength,
  };
}

export function formatMarkdown(
  text: string,
  start: number,
  end: number,
  format: MarkdownFormat,
): MarkdownEdit {
  switch (format) {
    case "bold":
      return wrapSelection(text, start, end, "**", "**", "strong text");
    case "italic":
      return wrapSelection(text, start, end, "*", "*", "emphasized text");
    case "inlineCode":
      return wrapSelection(text, start, end, "`", "`", "code");
    case "link":
      return wrapSelection(text, start, end, "[", "](https://example.com)", "link text");
    case "heading2":
      return prefixLines(text, start, end, () => "## ");
    case "heading3":
      return prefixLines(text, start, end, () => "### ");
    case "blockquote":
      return prefixLines(text, start, end, () => "> ");
    case "bulletedList":
      return prefixLines(text, start, end, () => "- ");
    case "numberedList":
      return prefixLines(text, start, end, (lineIndex) => `${lineIndex + 1}. `);
    case "codeBlock":
      return wrapSelection(text, start, end, "```\n", "\n```", "code");
    case "horizontalRule":
      return insertMarkdownAtSelection(text, start, end, "\n---\n");
  }
}
