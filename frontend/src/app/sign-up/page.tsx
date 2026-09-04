import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = { title: "Create a profile" };

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create a profile"
      description="Set up your analyst identity. Email verification is required only during first-time registration."
    >
      <SignUpForm />
    </AuthShell>
  );
}
