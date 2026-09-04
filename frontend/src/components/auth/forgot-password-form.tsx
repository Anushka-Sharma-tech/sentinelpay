"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { routes } from "@/lib/routes";
import { createClient } from "@/lib/supabase/browser";

export function ForgotPasswordForm() {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const supabase = createClient();

    if (!supabase) {
      setSent(true);
      setMessage(
        "Demo mode: no email was sent. Connect Supabase to enable password recovery.",
      );
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}${routes.settings}`,
    });
    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }
    setSent(true);
    setMessage("Check your inbox for a secure password-reset link.");
    setLoading(false);
  }

  return (
    <>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">Account email</label>
          <input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        {message && (
          <div
            className={`form-message ${sent ? "form-message-success" : "form-message-error"}`}
            role="status"
          >
            {message}
          </div>
        )}
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>
      <p className="auth-switch">
        Remembered your password? <Link href={routes.signIn}>Return to sign in</Link>
      </p>
    </>
  );
}
