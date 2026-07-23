/* Server component wrapper.
 *
 * Marking a *client* page as force-dynamic doesn't reliably skip prerender
 * in Next 15 — the compiler still runs the module to collect metadata,
 * which triggers useAuth() outside of AuthProvider. Solution: keep the
 * interactive UI in View.tsx (a client component) and expose it from a
 * server component page that we mark dynamic. This tells Next to render
 * per-request only, so the client tree only mounts in the browser where
 * the provider exists.
 */
export const dynamic = "force-dynamic";
import View from "./View";
export default function Page() {
  return <View />;
}
