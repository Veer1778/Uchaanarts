import Link from "next/link";

export default function NotFound() {
  return (
    <section className="relative mx-auto flex min-h-[50vh] max-w-6xl flex-col items-center justify-center px-5 text-center">
      <div className="aura left-1/2 top-1/3 h-72 w-72 -translate-x-1/2" />
      <h1 className="relative font-display text-6xl">
        4<span className="text-signal">0</span>4
      </h1>
      <p className="relative mt-4 text-sm text-muted">
        This canvas is blank — the page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="relative mt-8 border border-ink px-8 py-3 text-[11px] uppercase tracking-[0.2em] hover:border-signal hover:text-signal"
      >
        Back to the gallery
      </Link>
    </section>
  );
}
