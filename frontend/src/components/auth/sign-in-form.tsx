"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { createClient } from "@/lib/supabase/browser";
import { routes } from "@/lib/routes";

export function SignInForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const supabase = createClient();

    if (!supabase) {
      setMessage("Demo mode active. Opening the demonstration console.");
      window.setTimeout(() => router.push(routes.dashboard), 500);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    router.push(routes.dashboard);
    router.refresh();
  }

  return (
    <>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        <div className="auth-options">
          <Link href={routes.forgotPassword}>Forgot password?</Link>
        </div>
        {message && (
          <div className="form-message" role="status">
            {message}
          </div>
        )}
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="auth-switch">
        New to SentinelPay? <Link href={routes.signUp}>Create a profile</Link>
      </p>
    </>
  );
}
