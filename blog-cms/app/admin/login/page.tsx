import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = { title: "Editorial sign in" };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <section className="auth-page">
      <div className="auth-note">
        <Link href="/blog" className="eyebrow"><span className="eyebrow-line" /> BACK TO THE JOURNAL</Link>
        <h1>A quiet place<br /><em>to put words in order.</em></h1>
        <p>The editorial desk is for VersaExam contributors. Sign in to manage published stories and drafts.</p>
        <span className="auth-note-mark">VE&nbsp; / &nbsp;EDITORIAL DESK</span>
      </div>
      <div className="auth-card">
        <span className="eyebrow"><span className="eyebrow-line" /> EDITORIAL DESK</span>
        <h2>Welcome back.</h2>
        <p>Sign in with the administrator account configured for this installation.</p>
        <LoginForm />
      </div>
    </section>
  );
}
