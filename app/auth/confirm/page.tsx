"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { EmailOtpType } from "@supabase/supabase-js";

// Separate component that uses useSearchParams
function ConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [message, setMessage] = useState("Verifying your email...");
  const supabase = createClient();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token_hash = searchParams.get("token_hash");
        const type = searchParams.get("type");
        const next = searchParams.get("next") ?? "/auth/login";

        console.log("Starting verification process with params:", {
          token_hash,
          type,
          next,
        });

        if (!token_hash) {
          console.error("No token_hash found in URL");
          setStatus("error");
          setMessage("Invalid verification link. No token hash found.");
          return;
        }

        // First verify the OTP
        console.log("Attempting to verify OTP...");
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash,
          type: type === "email" ? "email" : "signup",
        });

        if (verifyError) {
          console.error("Verification error:", verifyError);
          setStatus("error");
          setMessage(verifyError.message);
          toast.error("Failed to verify email");
          return;
        }

        if (!data.user) {
          console.error("No user data returned from verification");
          setStatus("error");
          setMessage("Verification failed: No user data found");
          toast.error("Verification failed");
          return;
        }

        // Get the session to ensure we're properly authenticated
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          setStatus("error");
          setMessage("Failed to get user session");
          toast.error("Verification error");
          return;
        }

        if (!session) {
          // If no session, try to sign in with the OTP
          const { error: signInError } = await supabase.auth.verifyOtp({
            token_hash,
            type: "email",
          });

          if (signInError) {
            console.error("Sign in error:", signInError);
            setStatus("error");
            setMessage("Failed to sign in after verification");
            toast.error("Verification error");
            return;
          }
        }

        // Fetch the user's profile
        console.log("Fetching user profile...");
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          // If profile doesn't exist, try to create it
          if (data.user && data.user.email) {
            const { error: insertError } = await supabase
              .from("profiles")
              .insert({
                id: data.user.id,
                email: data.user.email,
                role: data.user.user_metadata?.role || "customer",
              });

            if (insertError) {
              console.error("Error creating profile:", insertError);
              setStatus("error");
              setMessage("Failed to create user profile");
              toast.error("Profile creation failed");
              return;
            }
          }
        }

        setStatus("success");
        setMessage("Email verified successfully! Redirecting...");
        toast.success("Email verified successfully!");

        // Redirect based on role
        setTimeout(() => {
          const role =
            profile?.role || data.user?.user_metadata?.role || "customer";
          console.log("Redirecting user with role:", role);

          const redirectMap: Record<string, string> = {
            admin: "/dashboard",
            supplier: "/supplier-portal",
            employee: "/employee-portal",
            customer: "/customer-portal",
          };

          router.push(redirectMap[role] || "/customer-portal");
        }, 2000);
      } catch (error) {
        console.error("Unexpected error during verification:", error);
        setStatus("error");
        setMessage("An unexpected error occurred during verification.");
        toast.error("Verification failed");
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="text-center space-y-4">
          {status === "verifying" && (
            <>
              <Loader2 className="animate-spin h-12 w-12 mx-auto text-primary" />
              <h1 className="text-2xl font-semibold">Verifying your email</h1>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle2 className="h-12 w-12 mx-auto text-green-500" />
              <h1 className="text-2xl font-semibold text-green-500">
                Success!
              </h1>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="h-12 w-12 mx-auto text-red-500" />
              <h1 className="text-2xl font-semibold text-red-500">
                Verification Failed
              </h1>
            </>
          )}
          <p className="text-muted-foreground">{message}</p>
        </div>
      </Card>
    </div>
  );
}

// Main page component with Suspense
export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md p-6">
            <div className="text-center space-y-2">
              <Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </Card>
        </div>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}
