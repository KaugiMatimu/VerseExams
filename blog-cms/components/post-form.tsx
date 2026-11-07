"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useActionState, useRef, useState, type ChangeEvent } from "react";
import { createPostAction, updatePostAction, type PostActionState } from "@/app/actions/posts";
import { slugify } from "@/lib/format";
import { formatMarkdown, insertMarkdownAtSelection, type MarkdownFormat } from "@/lib/markdown-format";
import { MAX_IMAGE_SIZE_BYTES } from "@/lib/media";

type InitialPost = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  body: string;
  status: "DRAFT" | "PUBLISHED";
};

const emptyPost: InitialPost = {
  title: "",
  slug: "",
  excerpt: "",
  category: "Study planning",
  body: "",
  status: "DRAFT",
};

export function PostForm({ post = emptyPost }: { post?: InitialPost }) {
  const update = Boolean(post.id);
  const [state, action, pending] = useActionState(
    update ? updatePostAction : createPostAction,
    {} as PostActionState,
  );
  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [slugEdited, setSlugEdited] = useState(update);
  const [body, setBody] = useState(post.body);
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const selectionRef = useRef({ start: post.body.length, end: post.body.length });
  const titleError = state.fieldErrors?.title?.[0];
  const slugError = state.fieldErrors?.slug?.[0];
  const excerptError = state.fieldErrors?.excerpt?.[0];
  const categoryError = state.fieldErrors?.category?.[0];
  const bodyError = state.fieldErrors?.body?.[0];

  function applyFormat(format: MarkdownFormat) {
    const textarea = bodyRef.current;
    const selection = textarea
      ? { start: textarea.selectionStart, end: textarea.selectionEnd }
      : selectionRef.current;
    const result = formatMarkdown(body, selection.start, selection.end, format);
    selectionRef.current = { start: result.selectionStart, end: result.selectionEnd };
    setBody(result.text);
    requestAnimationFrame(() => {
      bodyRef.current?.focus();
      bodyRef.current?.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setUploadError("Choose an image no larger than 5 MiB.");
      return;
    }

    setUploading(true);
    setUploadError("");
    setUploadStatus("Uploading image…");
    try {
      const payload = new FormData();
      payload.set("file", file);
      const response = await fetch("/api/media", {
        method: "POST",
        body: payload,
        credentials: "same-origin",
      });
      const result = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !result.url) {
        throw new Error(result.error || "Image upload failed. Try again.");
      }

      const altText = file.name
        .replace(/\.[^.]+$/, "")
        .replace(/[\r\n]/g, " ")
        .replaceAll("\\", "\\\\")
        .replaceAll("[", "\\[")
        .replaceAll("]", "\\]");
      const insertion = `![${altText}](${result.url})`;
      const range = selectionRef.current;
      const edited = insertMarkdownAtSelection(body, range.start, range.end, insertion);
      selectionRef.current = { start: edited.selectionStart, end: edited.selectionEnd };
      setBody(edited.text);
      setPreview(false);
      setUploadStatus("Image uploaded and added to the article.");
      requestAnimationFrame(() => {
        bodyRef.current?.focus();
        bodyRef.current?.setSelectionRange(edited.selectionStart, edited.selectionEnd);
      });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Image upload failed. Try again.");
      setUploadStatus("");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={action} className="editor-form">
      {post.id && <input type="hidden" name="id" value={post.id} />}
      <div className="editor-grid">
        <label className="field field-span">
          <span>Post title</span>
          <input
            name="title"
            value={title}
            onChange={(event) => {
              const nextTitle = event.target.value;
              setTitle(nextTitle);
              if (!slugEdited) setSlug(slugify(nextTitle));
            }}
            required
            minLength={3}
            maxLength={140}
            aria-invalid={Boolean(titleError)}
            aria-describedby={titleError ? "title-error" : undefined}
          />
          {titleError && <small id="title-error" className="field-error">{titleError}</small>}
        </label>
        <label className="field">
          <span>URL slug</span>
          <input
            name="slug"
            value={slug}
            onChange={(event) => {
              setSlug(event.target.value);
              setSlugEdited(true);
            }}
            placeholder="a-clear-post-url"
            required
            minLength={3}
            maxLength={160}
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            aria-invalid={Boolean(slugError)}
            aria-describedby={slugError ? "slug-error" : undefined}
          />
          <small>Lowercase letters, numbers, and hyphens.</small>
          {slugError && <small id="slug-error" className="field-error">{slugError}</small>}
        </label>
        <label className="field">
          <span>Category</span>
          <input name="category" defaultValue={post.category} required minLength={2} maxLength={48} list="post-categories" aria-invalid={Boolean(categoryError)} aria-describedby={categoryError ? "category-error" : undefined} />
          <datalist id="post-categories">
            <option value="Study planning" />
            <option value="Practice" />
            <option value="Revision" />
            <option value="Resources" />
            <option value="Exam prep" />
          </datalist>
          {categoryError && <small id="category-error" className="field-error">{categoryError}</small>}
        </label>
        <label className="field field-span">
          <span>Short summary</span>
          <textarea name="excerpt" defaultValue={post.excerpt} required rows={3} minLength={12} maxLength={280} aria-invalid={Boolean(excerptError)} aria-describedby={excerptError ? "excerpt-error" : undefined} />
          <small>Up to 280 characters. Used on the public journal.</small>
          {excerptError && <small id="excerpt-error" className="field-error">{excerptError}</small>}
        </label>
        <div className="field field-span">
          <label htmlFor="post-body">Article body <span className="field-hint">Markdown supported · raw HTML is disabled</span></label>
          <div className="markdown-toolbar" aria-label="Article formatting">
            <div className="toolbar-group" role="group" aria-label="Inline formatting">
              <button type="button" className="toolbar-button" onClick={() => applyFormat("bold")} disabled={uploading} aria-label="Bold" title="Bold"><strong>B</strong></button>
              <button type="button" className="toolbar-button" onClick={() => applyFormat("italic")} disabled={uploading} aria-label="Italic" title="Italic"><em>I</em></button>
              <button type="button" className="toolbar-button toolbar-code" onClick={() => applyFormat("inlineCode")} disabled={uploading} aria-label="Inline code" title="Inline code">{`</>`}</button>
              <button type="button" className="toolbar-button" onClick={() => applyFormat("link")} disabled={uploading} aria-label="Insert link" title="Insert link">↗</button>
            </div>
            <div className="toolbar-group" role="group" aria-label="Block formatting">
              <button type="button" className="toolbar-button" onClick={() => applyFormat("heading2")} disabled={uploading} aria-label="Heading 2" title="Heading 2">H2</button>
              <button type="button" className="toolbar-button" onClick={() => applyFormat("heading3")} disabled={uploading} aria-label="Heading 3" title="Heading 3">H3</button>
              <button type="button" className="toolbar-button" onClick={() => applyFormat("blockquote")} disabled={uploading} aria-label="Blockquote" title="Blockquote">❝</button>
              <button type="button" className="toolbar-button" onClick={() => applyFormat("bulletedList")} disabled={uploading} aria-label="Bulleted list" title="Bulleted list">• List</button>
              <button type="button" className="toolbar-button" onClick={() => applyFormat("numberedList")} disabled={uploading} aria-label="Numbered list" title="Numbered list">1. List</button>
              <button type="button" className="toolbar-button toolbar-code" onClick={() => applyFormat("codeBlock")} disabled={uploading} aria-label="Code block" title="Code block">{`{ }`}</button>
              <button type="button" className="toolbar-button" onClick={() => applyFormat("horizontalRule")} disabled={uploading} aria-label="Horizontal rule" title="Horizontal rule">―</button>
            </div>
            <div className="toolbar-group toolbar-group-end" role="group" aria-label="Image and preview">
              <button type="button" className="toolbar-button toolbar-upload" onClick={() => fileRef.current?.click()} disabled={uploading} aria-label="Upload image" title="Upload image">
                {uploading ? "Uploading…" : "＋ Image"}
              </button>
              <input ref={fileRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={uploadImage} aria-label="Choose an article image" tabIndex={-1} />
              <button type="button" className="toolbar-button toolbar-preview" onClick={() => setPreview(!preview)} disabled={uploading} aria-pressed={preview} aria-label={preview ? "Edit Markdown" : "Preview article"} title={preview ? "Edit Markdown" : "Preview article"}>
                {preview ? "Edit" : "Preview"}
              </button>
            </div>
          </div>
          <p className="upload-hint">JPEG, PNG, GIF, or WebP · up to 5 MiB. Images are stored with this site.</p>
          {uploadStatus && <small className="upload-status" role="status" aria-live="polite">{uploadStatus}</small>}
          {uploadError && <small className="field-error" role="alert">{uploadError}</small>}
          {preview ? (
            <>
              <div className="markdown-preview markdown-body" role="region" aria-label="Article preview">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
              </div>
              <input type="hidden" name="body" value={body} />
            </>
          ) : (
            <textarea
              ref={bodyRef}
              id="post-body"
              className="body-input"
              name="body"
              value={body}
              onChange={(event) => {
                setBody(event.target.value);
                selectionRef.current = {
                  start: event.target.selectionStart,
                  end: event.target.selectionEnd,
                };
              }}
              onSelect={(event) => {
                selectionRef.current = {
                  start: event.currentTarget.selectionStart,
                  end: event.currentTarget.selectionEnd,
                };
              }}
              readOnly={uploading}
              required={!preview}
              minLength={40}
              rows={20}
              aria-invalid={Boolean(bodyError)}
              aria-describedby={bodyError ? "body-error" : undefined}
            />
          )}
          <small>Use headings, lists, links, and emphasis to structure the article.</small>
          {bodyError && <small id="body-error" className="field-error">{bodyError}</small>}
        </div>
        <label className="field">
          <span>Visibility</span>
          <select name="status" defaultValue={post.status}>
            <option value="DRAFT">Draft — only visible to admins</option>
            <option value="PUBLISHED">Published — visible to everyone</option>
          </select>
        </label>
      </div>
      {state.error && <p className="form-error" role="alert">{state.error}</p>}
      <div className="form-actions">
        <a className="button button-quiet" href="/admin">Cancel</a>
        <button className="button button-dark" type="submit" disabled={pending}>
          {pending ? "Saving…" : update ? "Save changes" : "Create post"}
        </button>
      </div>
    </form>
  );
}
