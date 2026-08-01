import Link from "next/link";
import type { LucideIcon } from "lucide-react";

/**
 * Empty state — used when a list has no results, a wishlist is empty, a search
 * returns nothing, and so on. Always offers a way forward rather than a dead
 * end.
 */
export default function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  body?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="grid place-items-center px-5 py-16 text-center">
      <div className="max-w-sm">
        {Icon && (
          <span className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-full border border-line">
            <Icon size={19} strokeWidth={1.3} />
          </span>
        )}
        <p className="font-display text-[1.4rem] leading-snug">{title}</p>
        {body && (
          <p className="mt-3 text-[13px] leading-relaxed text-muted">{body}</p>
        )}
        {action && (
          <Link
            href={action.href}
            className="btn-accent mt-7 inline-block px-7 py-3 text-[13px]"
          >
            {action.label}
          </Link>
        )}
      </div>
    </div>
  );
}
