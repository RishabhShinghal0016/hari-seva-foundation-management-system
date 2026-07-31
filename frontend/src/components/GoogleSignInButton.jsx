import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

function loadGoogleScript() {
  return new Promise((resolve) => {
    if (window.google?.accounts?.id) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Renders Google's own "Sign in with Google" button, with a small "or"
 * divider beneath it. Renders nothing at all (button AND divider) if the
 * backend hasn't been given a GOOGLE_CLIENT_ID yet, so the page never shows
 * a dangling divider with no button above it.
 *
 * `role` (optional) is only used the first time a brand-new Google account
 * signs in, to decide which role to create the account as (donor by default).
 */
export default function GoogleSignInButton({ role, dividerLabel = "or", onSuccess, onError }) {
  const { loginWithGoogle } = useAuth();
  const [clientId, setClientId] = useState(null);
  const [ready, setReady] = useState(false);
  const buttonRef = useRef(null);

  useEffect(() => {
    api.get("/auth/config").then((cfg) => setClientId(cfg.googleClientId)).catch(() => setClientId(null));
  }, []);

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;

    loadGoogleScript().then((loaded) => {
      if (cancelled || !loaded || !buttonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            const user = await loginWithGoogle(response.credential, role);
            onSuccess?.(user);
          } catch (err) {
            onError?.(err.message);
          }
        },
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        width: 320,
      });
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [clientId, role]);

  if (!clientId) return null;

  return (
    <div>
      <div className="flex flex-col items-center gap-1">
        <div ref={buttonRef} />
        {!ready && <span className="text-xs text-[var(--color-ink-soft)]">Loading Google sign-in...</span>}
      </div>
      {dividerLabel && (
        <div className="thali-divider my-5">
          <span className="font-mono-num text-xs uppercase tracking-widest text-[var(--color-ink-soft)]">{dividerLabel}</span>
        </div>
      )}
    </div>
  );
}
