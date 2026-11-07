import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "VersaExam Journal", template: "%s · VersaExam Journal" },
  description: "Practical ideas for planning, practice, revision, and exam preparation.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <header className="site-header">
          <div className="shell header-inner">
            <Link href="/blog" className="wordmark" aria-label="VersaExam Journal home">
              <span className="wordmark-mark" aria-hidden="true">V</span>
              <span>Versa<span className="wordmark-light">Exam</span><small>THE STUDY JOURNAL</small></span>
            </Link>
            <nav aria-label="Main navigation">
              <Link href="/blog" className="nav-link">Journal</Link>
              <Link href="/admin/login" className="nav-admin">Editorial sign in <span aria-hidden="true">↗</span></Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="shell footer-inner">
            <Link href="/blog" className="footer-mark">VersaExam <span>Journal</span></Link>
            <p>Thoughtful study, one session at a time.</p>
            <span className="footer-note">Independent editorial content</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
