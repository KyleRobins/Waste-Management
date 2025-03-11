import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Handle email confirmation
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    });
    if (!error) {
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/confirm?token_hash=${token_hash}&type=${type}`
      );
    }
  }

  // Redirect to the home page if no confirmation needed
  return NextResponse.redirect(requestUrl.origin);
}
