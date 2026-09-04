import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { hasSupabaseConfig } from "@/lib/supabase/config";

export async function createClient() {
  if (!hasSupabaseConfig) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Cookie writes are handled by the proxy during Server Component renders.
          }
        },
      },
    },
  );
}
