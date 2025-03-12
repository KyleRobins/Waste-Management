"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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

        // First, check if we can access the auth user
        const {
          data: { user: currentUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Error getting user:", userError);
        } else {
          console.log("Current user state:", currentUser);
        }

        console.log("Attempting to verify OTP...");
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: "email",
        });

        console.log("Verification response:", { data, error });

        if (error) {
          console.error("Verification error:", error);
          setStatus("error");
          setMessage(error.message);
          toast.error("Failed to verify email");

          setTimeout(() => {
            router.push("/auth/login");
          }, 3000);
          return;
        }

        if (!data.user) {
          console.error("No user data returned from verification");
          setStatus("error");
          setMessage("Verification failed: No user data found");
          toast.error("Verification failed");

          setTimeout(() => {
            router.push("/auth/login");
          }, 3000);
          return;
        }

        console.log("Fetching user profile...");
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          // Continue with default role handling
        } else {
          console.log("User profile:", profile);
        }

        setStatus("success");
        setMessage("Email verified successfully! Redirecting...");
        toast.success("Email verified successfully!");

        // Redirect based on role or to default path
        setTimeout(() => {
          const role = profile?.role || "customer";
          console.log("Redirecting user with role:", role);

          if (role === "admin") {
            router.push("/dashboard");
          } else if (role === "supplier") {
            router.push("/supplier-portal");
          } else if (role === "employee") {
            router.push("/employee-portal");
          } else {
            router.push("/customer-portal");
          }
        }, 2000);
      } catch (error) {
        console.error("Unexpected error during verification:", error);
        setStatus("error");
        setMessage("An unexpected error occurred during verification.");
        toast.error("Verification failed");

        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
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
