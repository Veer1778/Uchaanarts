"use client";

import { useState } from "react";

/**
 * Artist biography with a real expand control.
 *
 * The previous version used a CSS line-clamp with no way to read the rest, so
 * bios cut off mid-sentence and looked broken rather than deliberate.
 */
export default function ExpandableBio({
  text,
  clampLines = 10,
}: {
  text: string;
  clampLines?: number;
}) {
  const [open, setOpen] = useState(false);

  if (!text) return null;

  // Only offer the control when there is meaningfully more to read; roughly
  // 65 characters per clamped line.
  const needsToggle = text.length > clampLines * 65;

  return (
    <div>
      <p
        className="mt-2 text-[13px] leading-relaxed text-muted"
        style={
          open || !needsToggle
            ? undefined
            : {
                display: "-webkit-box",
                WebkitLineClamp: clampLines,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
        }
      >
        {text}
      </p>

      {needsToggle && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-2 text-xs text-signal transition-opacity hover:opacity-70"
        >
          {open ? "Read less" : "Read more"}
        </button>
      )}
    </div>
  );
}
