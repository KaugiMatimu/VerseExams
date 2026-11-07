import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostForm } from "@/components/post-form";
import { deletePostAction } from "@/app/actions/posts";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Edit a post" };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const post = await db.post.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <section className="editor-page">
      <div className="shell editor-shell">
        <Link href="/admin" className="back-link">← &nbsp; All stories</Link>
        <div className="editor-heading"><span className="eyebrow"><span className="eyebrow-line" /> THE EDITORIAL DESK</span><h1>Shape the story.</h1><p>Editing <strong>{post.title}</strong>. Saving a draft removes it from the public journal.</p></div>
        <PostForm post={post} />
        <details className="delete-panel">
          <summary>Remove this post</summary>
          <p>This permanently deletes the post and its content.</p>
          <form action={deletePostAction}>
            <input type="hidden" name="id" value={post.id} />
            <button type="submit" className="button button-danger">Delete post</button>
          </form>
        </details>
      </div>
    </section>
  );
}
