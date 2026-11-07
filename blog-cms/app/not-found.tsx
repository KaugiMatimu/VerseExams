import Link from "next/link";

export default function NotFound() {
  return (
    <section className="shell error-state">
      <span className="eyebrow">404 · Page not found</span>
      <h1>That page isn’t in this issue.</h1>
      <p>The address may have changed, or this article is not currently published.</p>
      <Link href="/blog" className="button button-dark">Return to the journal</Link>
    </section>
  );
}
