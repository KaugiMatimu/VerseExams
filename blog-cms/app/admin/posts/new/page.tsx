import type { Metadata } from "next";
import Link from "next/link";
import { PostForm } from "@/components/post-form";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Write a post" };

export default async function NewPostPage() {
  await requireAdmin();
  return (
    <section className="editor-page">
      <div className="shell editor-shell">
        <Link href="/admin" className="back-link">← &nbsp; All stories</Link>
        <div className="editor-heading"><span className="eyebrow"><span className="eyebrow-line" /> THE EDITORIAL DESK</span><h1>Start a new note.</h1><p>Shape the idea first. You can keep it private as a draft until it’s ready.</p></div>
        <PostForm />
      </div>
    </section>
  );
}
