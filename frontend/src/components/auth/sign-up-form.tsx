"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useState } from "react";

import { routes } from "@/lib/routes";
import { createClient } from "@/lib/supabase/browser";

export function SignUpForm() {
  const [step, setStep] = useState<"profile" | "verify" | "complete">("profile");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function persistProfile(
    userId: string,
    displayName: string,
    profileImage: File | null,
  ) {
    const supabase = createClient();
    if (!supabase) return;

    let avatarPath: string | undefined;
    if (profileImage) {
      const extension = profileImage.name.split(".").pop() || "jpg";
      avatarPath = `${userId}/profile.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(avatarPath, profileImage, { upsert: true });
      if (uploadError) {
        setMessage(
          `Profile created, but the picture could not be uploaded: ${uploadError.message}`,
        );
      }
    }

    await supabase.auth.updateUser({
      data: { display_name: displayName, avatar_path: avatarPath },
    });
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const form = new FormData(event.currentTarget);
    const displayName = String(form.get("name") ?? "");
    const nextEmail = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    if (avatar && avatar.size > 2_000_000) {
      setMessage("Choose a profile picture smaller than 2 MB.");
      return;
    }

    setLoading(true);
    setEmail(nextEmail);
    const supabase = createClient();

    if (!supabase) {
      setStep("verify");
      setMessage("Demo mode: enter any six digits to preview verification.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: nextEmail,
      password,
      options: { data: { display_name: displayName } },
    });
    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (data.user && data.session) {
      await persistProfile(data.user.id, displayName, avatar);
      setStep("complete");
    } else {
      sessionStorage.setItem("sentinelpay-signup-name", displayName);
      setStep("verify");
      setMessage("Enter the six-digit code sent to your email.");
    }
    setLoading(false);
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const token = Array.from({ length: 6 }, (_, index) =>
      String(form.get(`digit-${index}`) ?? ""),
    ).join("");
    const supabase = createClient();

    if (!supabase) {
      setStep("complete");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "signup",
    });
    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await persistProfile(
        data.user.id,
        sessionStorage.getItem("sentinelpay-signup-name") || "SentinelPay user",
        avatar,
      );
      sessionStorage.removeItem("sentinelpay-signup-name");
    }
    setStep("complete");
    setLoading(false);
  }

  if (step === "verify") {
    return (
      <form className="auth-form" onSubmit={handleVerify}>
        <div className="form-message" role="status">
          {message}
        </div>
        <div className="field">
          <span className="field-label">Verification code</span>
          <div className="otp-inputs">
            {Array.from({ length: 6 }, (_, index) => (
              <input
                key={index}
                name={`digit-${index}`}
                inputMode="numeric"
                maxLength={1}
                aria-label={`Digit ${index + 1}`}
                required
              />
            ))}
          </div>
          <span className="field-help">
            Verification happens only for first-time account creation.
          </span>
        </div>
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Verifying…" : "Verify email"}
        </button>
      </form>
    );
  }

  if (step === "complete") {
    return (
      <div className="auth-form">
        <div className="form-message form-message-success">
          Your profile is ready. You can now sign in.
        </div>
        <Link className="button" href={routes.signIn}>
          Continue to sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <form className="auth-form" onSubmit={handleCreate}>
        <div className="avatar-field">
          <span className="avatar-preview">
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt="Profile preview"
                width={58}
                height={58}
                unoptimized
              />
            ) : (
              "SP"
            )}
          </span>
          <div>
            <label className="file-trigger">
              Choose profile picture
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => {
                  const nextAvatar = event.target.files?.[0] ?? null;
                  setAvatar(nextAvatar);
                  setAvatarPreview(
                    nextAvatar ? URL.createObjectURL(nextAvatar) : "",
                  );
                }}
              />
            </label>
            <p className="field-help">PNG, JPEG, or WebP · up to 2 MB</p>
          </div>
        </div>
        <div className="field">
          <label htmlFor="name">Desired name</label>
          <input id="name" name="name" autoComplete="name" required />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
          </div>
          <div className="field">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required />
          </div>
        </div>
        {message && (
          <div className="form-message form-message-error" role="alert">
            {message}
          </div>
        )}
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Creating profile…" : "Create profile"}
        </button>
      </form>
      <p className="auth-switch">
        Already have a profile? <Link href={routes.signIn}>Sign in</Link>
      </p>
    </>
  );
}
