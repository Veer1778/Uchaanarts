"use client";

/**
 * Last-resort boundary: catches errors thrown in the root layout itself, where
 * the normal error.tsx cannot render because the layout never mounted. It must
 * supply its own <html> and <body>.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#fbf8f3",
          color: "#1f1d1a",
          fontFamily: "Georgia, serif",
          textAlign: "center",
          padding: "1.5rem",
        }}
      >
        <div style={{ maxWidth: "26rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 400, margin: 0 }}>
            Something went wrong.
          </h1>
          <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#6d675f" }}>
            Please refresh the page. If it keeps happening, contact
            info@uchaanarts.com.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "1.75rem",
              background: "#b0482b",
              color: "#fff",
              border: 0,
              padding: "0.8rem 1.8rem",
              fontSize: "0.85rem",
              cursor: "pointer",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
