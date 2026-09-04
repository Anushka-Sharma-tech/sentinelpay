"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { FormEvent, useState } from "react";

import { Icon } from "@/components/ui/icon";
import { Status } from "@/components/ui/status";
import { routes } from "@/lib/routes";
import { createClient } from "@/lib/supabase/browser";
import { initials } from "@/lib/utils";

export function SettingsForm({
  initialName,
  email,
  verified,
  demoMode,
}: {
  initialName: string;
  email: string;
  verified: boolean;
  demoMode: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (avatar && avatar.size > 2_000_000) {
      setMessage("Choose a profile picture smaller than 2 MB.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setMessage("Demo profile saved for this preview.");
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setMessage("Your session has expired. Sign in again to save changes.");
      setLoading(false);
      return;
    }

    let avatarPath = user.user_metadata.avatar_path as string | undefined;
    if (avatar) {
      const extension = avatar.name.split(".").pop() || "jpg";
      avatarPath = `${user.id}/profile.${extension}`;
      const { error } = await supabase.storage
        .from("avatars")
        .upload(avatarPath, avatar, { upsert: true });
      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }
    }

    const { error } = await supabase.auth.updateUser({
      data: { display_name: name, avatar_path: avatarPath },
    });
    setMessage(error ? error.message : "Profile saved.");
    setLoading(false);
    if (!error) router.refresh();
  }

  async function signOut() {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    router.push(routes.signIn);
    router.refresh();
  }

  return (
    <div className="settings-layout">
      <section className="settings-section">
        <header className="settings-section-header">
          <h2>Profile</h2>
          <p>Manage the identity shown to analysts in this workspace.</p>
        </header>
        <form className="settings-form" onSubmit={handleSave}>
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
                initials(name)
              )}
            </span>
            <div>
              <label className="file-trigger">
                Change profile picture
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
                User-scoped avatar storage · PNG, JPEG, or WebP
              </p>
            </div>
          </div>
          <div className="field">
            <label htmlFor="display-name">Desired display name</label>
            <input
              id="display-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="account-email">Email</label>
            <input id="account-email" value={email} readOnly />
            <span className="field-help">
              Email changes are managed through the authentication provider.
            </span>
          </div>
          {message && (
            <div className="form-message" role="status">
              {message}
            </div>
          )}
          <div className="settings-form-actions">
            <button className="button" type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save profile"}
            </button>
          </div>
        </form>
      </section>
      <section className="settings-section">
        <header className="settings-section-header">
          <h2>Account security</h2>
          <p>Current authentication and session state.</p>
        </header>
        <div className="security-list">
          <div className="security-item">
            <div>
              <strong>Email verification</strong>
              <span>
                {demoMode
                  ? "Unavailable in demo mode"
                  : verified
                    ? "Verified"
                    : "Verification required"}
              </span>
            </div>
            <Status level={verified ? "LOW" : "NEUTRAL"}>
              {verified ? "Verified" : "Not connected"}
            </Status>
          </div>
          <div className="security-item">
            <div>
              <strong>Password account</strong>
              <span>Email and password authentication</span>
            </div>
            <Icon name="shield" width={18} height={18} />
          </div>
          <div className="security-item">
            <div>
              <strong>Current session</strong>
              <span>{demoMode ? "Local demonstration access" : "Cookie-based SSR session"}</span>
            </div>
            <button className="button button-secondary button-small" type="button" onClick={signOut}>
              Sign out
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
