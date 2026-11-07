import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { categorySlug, formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "The study journal",
  description: "Practical ways to plan your revision, learn from practice, and choose study resources.",
};
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ q?: string; category?: string }>;

export default async function BlogIndex({ searchParams }: { searchParams: SearchParams }) {
  const { q = "", category = "" } = await searchParams;
  const term = q.trim().slice(0, 100);
  const posts = await db.post.findMany({
    where: {
      status: "PUBLISHED",
      ...(category ? { category } : {}),
      ...(term
        ? {
            OR: [
              { title: { contains: term, mode: "insensitive" } },
              { excerpt: { contains: term, mode: "insensitive" } },
              { body: { contains: term, mode: "insensitive" } },
              { category: { contains: term, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ publishedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
    select: { id: true, title: true, slug: true, excerpt: true, category: true, publishedAt: true },
  });
  const categories = await db.post.findMany({
    where: { status: "PUBLISHED" },
    distinct: ["category"],
    select: { category: true },
    orderBy: { category: "asc" },
  });
  const categoryIsValid = !category || categories.some((item) => item.category === category);
  const visiblePosts = categoryIsValid ? posts : [];
  const [feature, ...remaining] = visiblePosts;
  const selectedCategory = categoryIsValid ? category : "";

  return (
    <>
      <section className="journal-intro">
        <div className="shell">
          <div className="breadcrumb"><span>HOME</span><i>/</i><span>THE JOURNAL</span></div>
          <div className="intro-grid">
            <div>
              <span className="eyebrow"><span className="eyebrow-line" /> A NOTEBOOK FOR LEARNERS</span>
              <h1>Ideas for your<br /><em>next study session.</em></h1>
            </div>
            <div className="intro-side">
              <p>Clear, useful thinking for the work of learning. Find a way to plan, practise, and prepare that feels like your own.</p>
              <span className="issue-mark">READ · REFLECT · RETURN</span>
            </div>
          </div>
          <div className="intro-rule"><span>VOL. 01</span><span>THE VERSAEXAM STUDY JOURNAL</span><span>AN OPEN NOTEBOOK</span></div>
        </div>
      </section>

      <section className="shell journal-content" aria-labelledby="latest-heading">
        <form className="filter-bar" action="/blog" method="get">
          <div className="filter-categories" aria-label="Filter by category">
            <button type="submit" name="category" value="" className={!selectedCategory ? "filter-chip active" : "filter-chip"} aria-pressed={!selectedCategory}>All notes <span>{categories.length ? visiblePosts.length : 0}</span></button>
            {categories.map(({ category: item }) => (
              <button
                type="submit"
                name="category"
                value={item}
                key={item}
                className={selectedCategory === item ? "filter-chip active" : "filter-chip"}
                aria-pressed={selectedCategory === item}
              >
                {item}
              </button>
            ))}
          </div>
          <label className="search-field">
            <span className="sr-only">Search articles</span>
            <input name="q" type="search" defaultValue={term} placeholder="Search the journal" maxLength={100} />
            <button type="submit" aria-label="Search articles">↗</button>
          </label>
        </form>

        <div className="section-heading">
          <div>
            <span className="eyebrow"><span className="eyebrow-line" /> {term || selectedCategory ? "YOUR READING LIST" : "FRESH PERSPECTIVES"}</span>
            <h2 id="latest-heading">{term ? `Notes for “${term}”` : selectedCategory || "Study smarter, one step at a time"}</h2>
          </div>
          <p>{visiblePosts.length} {visiblePosts.length === 1 ? "article" : "articles"}{selectedCategory ? ` in ${selectedCategory}` : ""}</p>
        </div>

        {feature ? (
          <>
            <article className="feature-story">
              <Link href={`/blog/${feature.slug}`} className={`story-art art-${categorySlug(feature.category)}`} aria-label={`Read ${feature.title}`}>
                <span className="art-index">FIELD NOTE&nbsp; / &nbsp;01</span>
                <span className="art-orbit orbit-one" /><span className="art-orbit orbit-two" />
                <span className="art-sheet"><span className="sheet-line sheet-short" /><span className="sheet-line" /><span className="sheet-line" /><span className="sheet-line sheet-mid" /><span className="sheet-dot" /></span>
                <span className="art-caption">{feature.category.toUpperCase()}</span>
              </Link>
              <div className="feature-copy">
                <span className="feature-tag"><span /> EDITOR’S PICK</span>
                <span className="eyebrow">{feature.category}</span>
                <h3><Link href={`/blog/${feature.slug}`}>{feature.title}</Link></h3>
                <p>{feature.excerpt}</p>
                <div className="feature-bottom">
                  <span>{formatDate(feature.publishedAt)}</span>
                  <Link className="text-link" href={`/blog/${feature.slug}`}>Read the story <span aria-hidden="true">↗</span></Link>
                </div>
              </div>
            </article>
            {remaining.length > 0 && (
              <div className="story-grid">
                {remaining.map((post, index) => (
                  <article className="story-card" key={post.id}>
                    <Link href={`/blog/${post.slug}`} className={`card-art art-${categorySlug(post.category)}`} aria-label={`Read ${post.title}`}>
                      <span className="card-art-index">NOTE / {String(index + 2).padStart(2, "0")}</span>
                      <span className="mini-sheet"><span /><span /><span /><span /></span>
                      <span className="card-art-category">{post.category}</span>
                    </Link>
                    <div className="card-copy">
                      <div className="card-meta"><span>{post.category}</span><span>{formatDate(post.publishedAt)}</span></div>
                      <h3><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3>
                      <p>{post.excerpt}</p>
                      <Link className="text-link" href={`/blog/${post.slug}`}>Continue reading <span aria-hidden="true">↗</span></Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <span className="empty-number">∅</span>
            <div>
              <span className="eyebrow">NOTHING ON THIS PAGE</span>
              <h3>{term || selectedCategory ? "No notes match this search." : "The first notes are on their way."}</h3>
              <p>{term || selectedCategory ? "Try a different phrase, or clear the filters to see every published article." : "Check back soon for thoughtful ideas from the VersaExam editorial team."}</p>
            </div>
            {(term || selectedCategory) && <Link className="text-link" href="/blog">Clear filters <span aria-hidden="true">↗</span></Link>}
          </div>
        )}
      </section>
      <section className="journal-outro">
        <div className="shell outro-inner">
          <span className="outro-index">A SMALL REMINDER&nbsp; / &nbsp;01</span>
          <p>There’s no single right way to learn.<br /><em>Take what helps. Leave what doesn’t.</em></p>
          <span className="outro-stamp">VE<br />✳</span>
        </div>
      </section>
    </>
  );
}
