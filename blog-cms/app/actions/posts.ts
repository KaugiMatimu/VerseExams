"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { readPostForm } from "@/lib/post";

export type PostActionState = { error?: string; fieldErrors?: Record<string, string[]> };

function isDuplicateSlug(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function createPostAction(
  _previous: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  await requireAdmin();
  const parsed = readPostForm(formData);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  try {
    await db.post.create({
      data: {
        ...parsed.data,
        publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null,
      },
    });
  } catch (error) {
    if (isDuplicateSlug(error)) return { error: "That slug is already in use. Choose another." };
    return { error: "The post could not be saved. Check the database connection and try again." };
  }

  revalidatePath("/blog");
  redirect("/admin?notice=created");
}

export async function updatePostAction(
  _previous: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return { error: "This post could not be found." };
  const parsed = readPostForm(formData);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  try {
    const current = await db.post.findUnique({ where: { id }, select: { publishedAt: true, status: true } });
    if (!current) return { error: "This post could not be found." };
    await db.post.update({
      where: { id },
      data: {
        ...parsed.data,
        publishedAt:
          parsed.data.status === "DRAFT"
            ? null
            : current.status === "PUBLISHED" && current.publishedAt
              ? current.publishedAt
              : new Date(),
      },
    });
  } catch (error) {
    if (isDuplicateSlug(error)) return { error: "That slug is already in use. Choose another." };
    return { error: "The post could not be saved. Check the database connection and try again." };
  }

  revalidatePath("/blog");
  revalidatePath("/admin");
  redirect("/admin?notice=updated");
}

export async function deletePostAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) redirect("/admin?notice=missing");
  try {
    await db.post.delete({ where: { id } });
  } catch {
    redirect("/admin?notice=delete-error");
  }
  revalidatePath("/blog");
  revalidatePath("/admin");
  redirect("/admin?notice=deleted");
}
