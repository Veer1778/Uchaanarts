import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  AUTH_COOKIE,
  DEMO_PROFILE_COOKIE,
  authLive,
  cookieOptions,
  decodeDemoProfile,
  encodeDemoProfile,
  parseSession,
  wcCustomer,
  wcUpdateCustomer,
  wpMe,
} from "@/lib/auth";

// GET /api/account/profile -> profile
export async function GET() {
  const jar = await cookies();
  const session = parseSession(jar.get(AUTH_COOKIE)?.value);

  if (session.kind === "demo") {
    const demo = decodeDemoProfile(jar.get(DEMO_PROFILE_COOKIE)?.value);
    return NextResponse.json({
      user: {
        id: 0,
        email: demo.email ?? session.email,
        name: demo.name ?? session.name,
        demo: true,
        billing: demo.billing ?? {},
        shipping: demo.shipping ?? {},
      },
    });
  }

  if (session.kind === "jwt" && authLive && session.token) {
    const me = await wpMe(session.token);
    if (!me) return NextResponse.json({ user: null }, { status: 401 });
    const full = await wcCustomer(me.id);
    return NextResponse.json({ user: full ?? me });
  }

  return NextResponse.json({ user: null }, { status: 401 });
}

// PATCH /api/account/profile  body: { name?, email?, billing?, shipping? }
export async function PATCH(req: Request) {
  const patch = await req.json();
  const jar = await cookies();
  const session = parseSession(jar.get(AUTH_COOKIE)?.value);

  if (session.kind === "demo") {
    const current = decodeDemoProfile(jar.get(DEMO_PROFILE_COOKIE)?.value);
    const next = { ...current, ...patch };
    jar.set(DEMO_PROFILE_COOKIE, encodeDemoProfile(next), cookieOptions);
    return NextResponse.json({ ok: true });
  }

  if (session.kind === "jwt" && authLive && session.token) {
    const me = await wpMe(session.token);
    if (!me) return NextResponse.json({ error: "Session expired." }, { status: 401 });

    // Woo expects first_name/last_name, split from a single "name" if given.
    const wcPatch: Record<string, unknown> = {};
    if (typeof patch.name === "string") {
      const [first, ...rest] = patch.name.trim().split(/\s+/);
      wcPatch.first_name = first ?? "";
      wcPatch.last_name = rest.join(" ");
    }
    if (patch.email) wcPatch.email = patch.email;
    if (patch.billing) wcPatch.billing = patch.billing;
    if (patch.shipping) wcPatch.shipping = patch.shipping;

    const result = await wcUpdateCustomer(me.id, wcPatch);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Not signed in." }, { status: 401 });
}
