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

  if (!CLIENT_ID) return null;

  return (
    <div className="flex flex-col items-center">
      <div ref={ref} className="min-h-[40px]" />
      {!ready && <span className="text-xs text-faint">Loading Google…</span>}
    </div>
  );
}
