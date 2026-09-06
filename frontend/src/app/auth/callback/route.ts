import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/sign-in?error=missing-recovery-code", requestUrl.origin),
    );
  }

  const supabase = await createClient();

  if (!supabase) {
    return NextResponse.redirect(
      new URL("/sign-in?error=authentication-unavailable", requestUrl.origin),
    );
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Supabase auth callback error:", error.message);

    return NextResponse.redirect(
      new URL("/sign-in?error=recovery-link-invalid", requestUrl.origin),
    );
  }

  return NextResponse.redirect(
    new URL("/dashboard/settings?recovery=1", requestUrl.origin),
  );
}
