import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  publicPostCorsHeaders,
  publicPostQuery,
  serializePublicPosts,
} from "@/lib/public-posts";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const posts = await db.post.findMany(publicPostQuery);
    return NextResponse.json(
      { posts: serializePublicPosts(posts) },
      { headers: publicPostCorsHeaders },
    );
  } catch (error) {
    console.error("Failed to load public journal posts:", error);
    return NextResponse.json(
      { error: "The public journal is temporarily unavailable." },
      {
        status: 503,
        headers: { ...publicPostCorsHeaders, "Cache-Control": "no-store" },
      },
    );
  }
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: publicPostCorsHeaders });
}
