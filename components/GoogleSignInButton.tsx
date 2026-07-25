"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Google Identity Services sign-in button. Loads the GIS script client-side,
 * renders Google's own button (safer + accessible), and calls `onCredential`
 * with the ID token the server then verifies.
 *
 * If NEXT_PUBLIC_GOOGLE_CLIENT_ID isn't set, the button silently hides —
 * the parent still shows the email/password form.
 */

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (opts: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            use_fedcm_for_prompt?: boolean;
          }) => void;
          renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function GoogleSignInButton({
  onCredential,
  label = "signin_with",
}: {
  onCredential: (credential: string) => void;
  label?: "signin_with" | "signup_with";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID) return;

    const render = () => {
      if (!window.google || !ref.current) return;
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (r) => onCredential(r.credential),
      });
      window.google.accounts.id.renderButton(ref.current, {
        theme: "outline",
        size: "large",
        width: 320,
        text: label,
        shape: "rectangular",
        logo_alignment: "left",
      });
      setReady(true);
    };

    if (window.google) {
      render();
      return;
    }

    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = render;
    document.head.appendChild(s);
    return () => {
      s.onload = null;
    };
  }, [onCredential, label]);

  // Without credentials we still render the control, so the flow reads
  // correctly in review builds; it explains itself rather than silently
  // disappearing.
  if (!CLIENT_ID) {
    return (
      <div className="w-full">
        <button
          type="button"
          onClick={() => setNotice(true)}
          className="flex w-full items-center justify-center gap-3 border border-line px-5 py-3 text-sm transition-colors hover:border-ink"
        >
          <GoogleMark />
          Continue with Google
        </button>
        {notice && (
          <p className="mt-2 text-center text-xs text-faint">
            Google sign-in activates once the client ID is configured. Use email
            and password for now.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center">
      <div ref={ref} className="min-h-[44px]" />
      {!ready && (
        <div className="flex w-full items-center justify-center gap-3 border border-line px-5 py-3 text-sm text-muted">
          <GoogleMark />
          Continue with Google
        </div>
      )}
    </div>
  );
}

/** Google "G", drawn inline so no brand asset or icon package is needed. */
function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.2-.4-4.7H24v8.9h11.8c-.5 2.7-2 5-4.4 6.6v5.5h7.1c4.2-3.8 6.6-9.5 6.6-16.3z" />
      <path fill="#34A853" d="M24 46c6 0 11-2 14.6-5.4l-7.1-5.5c-2 1.3-4.5 2.1-7.5 2.1-5.8 0-10.6-3.9-12.4-9.1H4.3v5.7C7.9 41.1 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.6 28.1c-.5-1.3-.7-2.7-.7-4.1s.3-2.8.7-4.1v-5.7H4.3C2.8 17.1 2 20.4 2 24s.8 6.9 2.3 9.8l7.3-5.7z" />
      <path fill="#EA4335" d="M24 10.8c3.3 0 6.2 1.1 8.5 3.3l6.3-6.3C35 4.1 30 2 24 2 15.4 2 7.9 6.9 4.3 14.2l7.3 5.7c1.8-5.2 6.6-9.1 12.4-9.1z" />
    </svg>
  );
}
