import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function findPublishedPost(slug: string) {
  return db.post.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { title: true, slug: true, excerpt: true, category: true, body: true, publishedAt: true },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await findPublishedPost(slug);
  if (!post) return { title: "Article not found" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.excerpt },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await findPublishedPost(slug);
  if (!post) notFound();

  return (
    <article className="article-page">
      <div className="shell">
        <nav className="article-crumb" aria-label="Breadcrumb">
          <Link href="/blog">The journal</Link><span aria-hidden="true">/</span><span>{post.category}</span>
        </nav>
        <header className="article-header">
          <span className="eyebrow"><span className="eyebrow-line" /> {post.category}</span>
          <h1>{post.title}</h1>
          <p className="article-deck">{post.excerpt}</p>
          <div className="article-byline">
            <span className="byline-seal" aria-hidden="true">V</span>
            <span>VersaExam editorial</span>
            <i aria-hidden="true">·</i>
            <time dateTime={post.publishedAt?.toISOString()}>{formatDate(post.publishedAt)}</time>
            <span className="article-issue">STUDY JOURNAL&nbsp; / &nbsp;01</span>
          </div>
        </header>
        <div className={`article-art art-${post.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} aria-hidden="true">
          <span className="article-art-label">A FIELD NOTE FOR LEARNERS</span>
          <span className="article-art-circle" />
          <span className="article-art-sheet"><i /><i /><i /><i /><b /></span>
          <span className="article-art-foot">{post.category.toUpperCase()} &nbsp; · &nbsp; VERSAEXAM</span>
        </div>
        <div className="article-layout">
          <aside className="article-aside">
            <span className="eyebrow">IN THIS NOTE</span>
            <span className="aside-rule" />
            <span className="aside-mark">V<br />✳</span>
          </aside>
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
            <p className="editorial-credit">A note from the VersaExam editorial team.</p>
            <Link className="back-link" href="/blog">← &nbsp; Back to all notes</Link>
          </div>
        </div>
      </div>
    </article>
  );
}
