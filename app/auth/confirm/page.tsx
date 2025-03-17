"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

type VerificationStatus = "loading" | "success" | "error";

// Loading component
function LoadingCard() {
  return (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Loading...</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <p className="text-muted-foreground">Verifying your email...</p>
      </CardContent>
    </Card>
  );
}

// Main page component
export default function ConfirmPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Suspense fallback={<LoadingCard />}>
        <ConfirmContent />
      </Suspense>
    </div>
  );
}

// Separate component that uses useSearchParams
function ConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [message, setMessage] = useState<string>("Verifying your email...");
  const supabase = createClient();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token_hash = searchParams.get("token_hash");
        const type = searchParams.get("type");

        console.log("Starting verification process with params:", {
          token_hash,
          type,
        });

        if (!token_hash) {
          setStatus("error");
          setMessage("Invalid verification link. No token hash found.");
          return;
        }

        // Verify the email
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash,
          type: "email",
        });

        if (verifyError) {
          console.error("Verification error:", verifyError);
          setStatus("error");
          setMessage(verifyError.message);
          toast({
            title: "Verification Failed",
            description: verifyError.message,
            variant: "destructive",
          });
          return;
        }

        // Get the session after verification
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          console.error("Session error:", sessionError);
          setStatus("error");
          setMessage("Failed to create user session");
          toast({
            title: "Verification Error",
            description: "Failed to create user session",
            variant: "destructive",
          });
          return;
        }

        // Ensure profile exists
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (profileError && profileError.code === "PGRST116") {
          // Profile doesn't exist, create it
          const userRole = session.user.user_metadata?.role || "customer";
          const { error: createError } = await supabase
            .from("profiles")
            .insert({
              id: session.user.id,
              email: session.user.email,
              role: userRole,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (createError) {
            console.error("Error creating profile:", createError);
            // Continue with metadata role
          }
        }

        setStatus("success");
        setMessage("Email verified successfully! Redirecting...");
        toast({
          title: "Success",
          description: "Email verified successfully!",
        });

        // Redirect based on role
        setTimeout(() => {
          const role =
            profile?.role || session.user.user_metadata?.role || "customer";

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
        toast({
          title: "Verification Failed",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          Email Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        {status === "loading" && (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
        <p
          className={
            status === "error" ? "text-destructive" : "text-muted-foreground"
          }
        >
          {message}
        </p>
      </CardContent>
    </Card>
  );
}
