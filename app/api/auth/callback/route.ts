import { handleAuth, handleCallback } from "@auth0/nextjs-auth0";
import { NextResponse } from "next/server";
import { syncAuth0ToSupabase } from "@/lib/services/auth0.service";
import { auth0Config } from "@/app/auth/auth0-config";

export const GET = handleAuth({
  ...auth0Config,
  callback: async (req, res) => {
    try {
      // Handle the Auth0 callback first
      const response = await handleCallback(req, res, auth0Config);

      // Sync the user data to Supabase
      await syncAuth0ToSupabase(req, res);

      // Get the intended destination from the state parameter or use a default
      const url = new URL(req.url);
      const state = url.searchParams.get("state");
      const decodedState = state
        ? JSON.parse(Buffer.from(state, "base64").toString())
        : {};
      const returnTo = decodedState.returnTo || "/dashboard";

      // Redirect to the appropriate page
      return NextResponse.redirect(new URL(returnTo, req.url));
    } catch (error) {
      console.error("Auth callback error:", error);
      return NextResponse.redirect(
        new URL("/auth/login?error=Authentication failed", req.url)
      );
    }
  },
});
