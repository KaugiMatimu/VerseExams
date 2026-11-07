"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="shell error-state">
      <span className="eyebrow">A small pause</span>
      <h1>The journal is taking a moment.</h1>
      <p>We couldn’t load this page. Please try again in a little while.</p>
      <button className="button button-dark" onClick={reset}>Try again</button>
    </section>
  );
}
