import type { Prisma } from "@prisma/client";

export const publicPostCorsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
};

export const publicPostQuery = {
  where: { status: "PUBLISHED" },
  orderBy: [{ publishedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
  take: 50,
  select: {
    title: true,
    slug: true,
    excerpt: true,
    category: true,
  },
} satisfies Prisma.PostFindManyArgs;

export type PublicPostRecord = Prisma.PostGetPayload<typeof publicPostQuery>;

export function serializePublicPosts(posts: PublicPostRecord[]) {
  return posts.map((post) => ({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    category: post.category,
  }));
}
