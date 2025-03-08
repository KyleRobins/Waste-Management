import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    
    try {
      await supabase.auth.exchangeCodeForSession(code);
      
      // Get the user's session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Create or update profile
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            email: session.user.email,
            role: session.user.user_metadata.role || 'customer',
            updated_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error('Error updating profile:', profileError);
        }
      }
    } catch (error) {
      console.error('Error in auth callback:', error);
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/login?error=Could not authenticate user`
      );
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL(next, request.url));
}