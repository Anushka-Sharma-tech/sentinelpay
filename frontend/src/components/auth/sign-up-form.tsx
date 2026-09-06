"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";

import { routes } from "@/lib/routes";
import { createClient } from "@/lib/supabase/browser";

export function SignUpForm() {
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
          `Account created, but the profile picture could not be uploaded: ${uploadError.message}`,
        );
      }
    }

    const { error } = await supabase.auth.updateUser({
      data: {
        display_name: displayName,
        avatar_path: avatarPath,
      },
    });

    if (error) {
      setMessage(
        `Account created, but the profile could not be completed: ${error.message}`,
      );
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");

    const form = new FormData(event.currentTarget);

    const displayName = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    if (avatar && avatar.size > 2_000_000) {
      setMessage("Choose a profile picture smaller than 2 MB.");
      return;
    }

    const supabase = createClient();

    if (!supabase) {
      setMessage(
        "Supabase is not configured. Connect Supabase to create a real account.",
      );
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (!data.user || !data.session) {
      setMessage(
        "Account creation requires an immediate Supabase session. Check that email confirmation is disabled in Supabase Authentication settings.",
      );
      setLoading(false);
      return;
    }

    await persistProfile(data.user.id, displayName, avatar);

    setLoading(false);

    if (!message) {
      window.location.href = routes.dashboard;
    }
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

            <p className="field-help">
              PNG, JPEG, or WebP · up to 2 MB
            </p>
          </div>
        </div>

        <div className="field">
          <label htmlFor="name">Desired name</label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="password">Password</label>

            <div className="password-field">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                minLength={8}
                required
              />

              <button
                className="password-toggle"
                type="button"
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                aria-pressed={showPassword}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <div className="field">
            <label htmlFor="confirmPassword">Confirm password</label>

            <div className="password-field">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                minLength={8}
                required
              />

              <button
                className="password-toggle"
                type="button"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                aria-pressed={showConfirmPassword}
                onClick={() =>
                  setShowConfirmPassword((current) => !current)
                }
              >
                {showConfirmPassword ? "🙈" : "👁"}
              </button>
            </div>
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
        Already have a profile?{" "}
        <Link href={routes.signIn}>Sign in</Link>
      </p>
    </>
  );
}