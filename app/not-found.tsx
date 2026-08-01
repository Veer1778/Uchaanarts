import Link from "next/link";

/** 404 — offers routes onward rather than a dead end. */
export default function NotFound() {
  return (
    <main className="grid min-h-[70vh] place-items-center px-5 text-center">
      <div className="max-w-md">
        <p className="font-display text-[3.5rem] leading-none text-line">404</p>
        <h1 className="mt-4 font-display text-[2rem] leading-tight">
          This page isn&apos;t here.
        </h1>
        <p className="mt-4 text-[13px] leading-relaxed text-muted">
          It may have moved, or the work may no longer be available.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/art-gallery" className="btn-accent px-7 py-3 text-[13px]">
            Browse artworks
          </Link>
          <Link href="/" className="btn-outline px-7 py-3 text-[13px]">
            Back to home
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 border-t border-line pt-6 text-[12.5px] text-muted">
          {[
            { href: "/artists", label: "Artists" },
            { href: "/exhibitions", label: "Exhibitions" },
            { href: "/blog", label: "Journal" },
            { href: "/about", label: "About" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-ink">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
