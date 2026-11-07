import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Editorial dashboard" };

type SearchParams = Promise<{ notice?: string }>;

const notices: Record<string, string> = {
  created: "Your post has been created.",
  updated: "Your changes have been saved.",
  deleted: "The post has been deleted.",
  missing: "That post could not be found.",
  "delete-error": "The post could not be deleted. Try again.",
};

export default async function AdminDashboard({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const { notice } = await searchParams;
  const posts = await db.post.findMany({
    orderBy: [{ updatedAt: "desc" }],
    select: { id: true, title: true, slug: true, category: true, status: true, updatedAt: true, publishedAt: true },
  });
  const published = posts.filter((post) => post.status === "PUBLISHED").length;
  return (
    <section className="admin-page">
      <div className="shell">
        <div className="admin-topline">
          <div><span className="eyebrow"><span className="eyebrow-line" /> THE EDITORIAL DESK</span><h1>Your notebook.</h1></div>
          <div className="admin-top-actions"><Link href="/blog" className="button button-quiet">View journal ↗</Link><LogoutButton /></div>
        </div>
        {notice && notices[notice] && <p className={notice.endsWith("error") || notice === "missing" ? "notice notice-error" : "notice"} role="status">{notices[notice]}</p>}
        <div className="admin-stats">
          <div><span>ALL POSTS</span><strong>{posts.length}</strong></div>
          <div><span>PUBLISHED</span><strong>{published}</strong></div>
          <div><span>IN DRAFT</span><strong>{posts.length - published}</strong></div>
          <Link className="button button-dark" href="/admin/posts/new">＋ &nbsp; Write a post</Link>
        </div>
        <div className="admin-list-heading"><div><span className="eyebrow">YOUR WORKING FILES</span><h2>Stories &amp; notes</h2></div><span>{posts.length} TOTAL</span></div>
        {posts.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Last updated</th><th><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td><Link className="admin-post-title" href={`/admin/posts/${post.id}/edit`}>{post.title}</Link><span className="admin-slug">/blog/{post.slug}</span></td>
                    <td>{post.category}</td>
                    <td><span className={`status-pill status-${post.status.toLowerCase()}`}><i />{post.status === "PUBLISHED" ? "Published" : "Draft"}</span></td>
                    <td>{formatDate(post.updatedAt)}</td>
                    <td className="table-actions"><Link href={`/admin/posts/${post.id}/edit`}>Edit ↗</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty"><span className="empty-number">01</span><div><h3>The notebook is still blank.</h3><p>Start with a draft. You can edit it before it goes public.</p></div><Link href="/admin/posts/new" className="text-link">Write your first post ↗</Link></div>
        )}
      </div>
    </section>
  );
}
