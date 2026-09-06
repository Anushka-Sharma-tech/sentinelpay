import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = { title: "Create a profile" };

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create a profile"
      description="Create your SentinelPay analyst account with an email address and password."
    >
      <SignUpForm />
    </AuthShell>
  );
}