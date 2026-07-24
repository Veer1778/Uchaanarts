import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/**
 * Circular badge with text running around the rim and a red disc in the
 * middle — the "buy now / tickets" device from the reference, reused here
 * to point at the gallery.
 *
 * The rim rotates; the disc stays still so the icon reads clearly.
 */
export default function RotatingBadge({
  text = "explore the collection · view artworks · ",
  href = "/art-gallery",
  size = 132,
}: {
  text?: string;
  href?: string;
  size?: number;
}) {
  return (
    <Link
      href={href}
      aria-label="Explore the collection"
      className="group relative inline-grid place-items-center"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="badge-spin absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <path
            id="badge-circle"
            d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
            fill="none"
          />
        </defs>
        <text className="fill-ink" style={{ fontSize: "8.4px", letterSpacing: "0.14em" }}>
          <textPath href="#badge-circle" startOffset="0">
            {text.toUpperCase()}
          </textPath>
        </text>
      </svg>

      <span className="grid h-11 w-11 place-items-center rounded-full bg-signal text-paper transition-transform duration-300 group-hover:scale-110">
        <ArrowUpRight size={18} strokeWidth={2} />
      </span>
    </Link>
  );
}
