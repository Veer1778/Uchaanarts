import { NextResponse } from "next/server";
import { authLive, wpRequestPasswordReset } from "@/lib/auth";

// POST /api/auth/reset  body: { email }
// Sends a password-reset email via WordPress.
// Always returns 200 to prevent account-enumeration.
export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  if (authLive) {
    await wpRequestPasswordReset(email);
  }
  // Demo mode: pretend an email was sent.
  return NextResponse.json({
    ok: true,
    message: authLive
      ? "If an account with that email exists, a reset link has been sent."
      : "Demo mode: no email is actually sent. Reset only works when WordPress is configured.",
  });
}
