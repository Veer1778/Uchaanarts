/**
 * Skeleton primitives for loading states.
 *
 * `Skeleton` is the base shimmer block; the named helpers compose it into the
 * shapes used most often, so loading.tsx files stay one-liners.
 */

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse bg-line/60 ${className}`}
    />
  );
}

/** Artwork card: image plate, artist, title, meta, price. */
export function SkeletonCard() {
  return (
    <div>
      <Skeleton className="aspect-[4/5] w-full" />
      <Skeleton className="mt-3.5 h-3.5 w-2/3" />
      <Skeleton className="mt-2 h-3.5 w-1/2" />
      <Skeleton className="mt-3 h-3 w-3/4" />
      <Skeleton className="mt-1.5 h-3 w-1/3" />
      <Skeleton className="mt-3 h-3.5 w-1/4" />
    </div>
  );
}

/** A grid of artwork cards. */
export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/** Paragraph-shaped text placeholder. */
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3 ${i === lines - 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  );
}
