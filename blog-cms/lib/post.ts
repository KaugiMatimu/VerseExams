import { z } from "zod";

export const postSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters.").max(140),
  slug: z
    .string()
    .trim()
    .min(3, "Slug must be at least 3 characters.")
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only."),
  excerpt: z.string().trim().min(12, "Add a short summary (at least 12 characters).").max(280),
  category: z.string().trim().min(2).max(48),
  body: z.string().trim().min(40, "Article body must be at least 40 characters."),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export type PostInput = z.infer<typeof postSchema>;

export function readPostForm(formData: FormData) {
  return postSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    category: formData.get("category"),
    body: formData.get("body"),
    status: formData.get("status"),
  });
}
