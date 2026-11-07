"use server";

import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { adminEmail, clearAdminSession, setAdminSession, verifyPasswordHashConfigured } from "@/lib/auth";
import { db } from "@/lib/db";

export type LoginState = { error?: string };

const credentialsSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(200).refine((value) => Buffer.byteLength(value, "utf8") <= 72),
});

export async function loginAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Enter a valid email address and password." };

  const expectedEmail = adminEmail();
  const passwordHash = verifyPasswordHashConfigured();
  const email = parsed.data.email.toLowerCase();
  const throttleId = createHash("sha256").update(expectedEmail).digest("hex");
  const record = await db.loginThrottle.findUnique({ where: { id: throttleId } });
  const now = new Date();
  if (record?.lockedUntil && record.lockedUntil > now) {
    return { error: "Too many unsuccessful attempts. Try again in 15 minutes." };
  }

  const passwordMatches = await bcrypt.compare(parsed.data.password, passwordHash);
  if (email !== expectedEmail || !passwordMatches) {
    const failedAttempt = await db.loginThrottle.upsert({
      where: { id: throttleId },
      create: { id: throttleId, attempts: 1 },
      update: { attempts: { increment: 1 } },
    });
    if (failedAttempt.attempts >= 8) {
      await db.loginThrottle.update({
        where: { id: throttleId },
        data: { lockedUntil: new Date(now.getTime() + 15 * 60 * 1000) },
      });
    }
    return { error: "Email or password is incorrect." };
  }

  await db.loginThrottle.deleteMany({ where: { id: throttleId } });
  await setAdminSession(expectedEmail);
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}
