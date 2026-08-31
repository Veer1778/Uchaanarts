"use client";

import { useEffect, useState } from "react";
import { Facebook, MessageCircle, Link2, Check } from "lucide-react";

/**
 * Share buttons for artist and artwork pages.
 *
 * Facebook, WhatsApp and Pinterest, plus copy-link as a fallback. Pinterest is
 * included at the client's request: it drives meaningful traffic for visual
 * work, and it needs an image URL, which is why `image` is required rather
 * than optional.
 *
 * The URL is read on the client because the component has no reliable way to
 * know the deployed origin at build time.
 */
export default function ShareButtons({
  title,
  image,
  description,
}: {
  title: string;
  /** Absolute image URL. Pinterest will not pin without one. */
  image?: string;
  description?: string;
}) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  if (!url) return null;

  const encodedUrl = encodeURIComponent(url);
  const text = encodeURIComponent(title);

  const links = [
    {
      label: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: Facebook,
    },
    {
      label: "Share on WhatsApp",
      href: `https://api.whatsapp.com/send?text=${text}%20${encodedUrl}`,
      icon: MessageCircle,
    },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked; the other buttons still work */
    }
  };

  const btn =
    "grid h-9 w-9 place-items-center rounded border border-line text-muted transition-colors hover:border-signal hover:text-signal";

  return (
    <div className="flex items-center gap-2">
      <span className="mr-1 text-[11px] uppercase tracking-[0.16em] text-faint">
        Share
      </span>

      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={l.label}
          title={l.label}
          className={btn}
        >
          <l.icon size={15} />
        </a>
      ))}

      {/* Pinterest has no lucide icon, so the mark is inlined. */}
      {image && (
        <a
          href={`https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodeURIComponent(
            image
          )}&description=${encodeURIComponent(description ?? title)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Save to Pinterest"
          title="Save to Pinterest"
          className={btn}
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden>
            <path d="M12 0a12 12 0 0 0-4.37 23.17c-.06-.9-.11-2.3.02-3.29.12-.9.79-5.72.79-5.72s-.2-.4-.2-1c0-.94.54-1.64 1.22-1.64.58 0 .86.43.86.95 0 .58-.37 1.45-.56 2.25-.16.68.34 1.23 1 1.23 1.21 0 2.14-1.27 2.14-3.11 0-1.63-1.17-2.77-2.84-2.77-1.93 0-3.07 1.45-3.07 2.95 0 .58.23 1.21.51 1.55.06.07.07.13.05.2l-.19.78c-.03.13-.1.15-.23.09-1.14-.53-1.85-2.2-1.85-3.54 0-2.88 2.09-5.53 6.03-5.53 3.17 0 5.63 2.26 5.63 5.27 0 3.15-1.98 5.68-4.74 5.68-.93 0-1.8-.48-2.1-1.05l-.57 2.18c-.2.79-.76 1.79-1.14 2.4A12 12 0 1 0 12 0z" />
          </svg>
        </a>
      )}

      <button
        type="button"
        onClick={copy}
        aria-label="Copy link"
        title="Copy link"
        className={btn}
      >
        {copied ? <Check size={15} className="text-signal" /> : <Link2 size={15} />}
      </button>
    </div>
  );
}
