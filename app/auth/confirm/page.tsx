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
        const type = searchParams.get("type") || "signup";

        if (!token_hash) {
          setStatus("error");
          setMessage("Invalid verification link");
          return;
        }

        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as any,
        });

        if (error) {
          console.error("Verification error:", error);
          setStatus("error");
          setMessage(error.message);
          toast.error("Failed to verify email");
        } else {
          setStatus("success");
          setMessage("Email verified successfully!");
          toast.success("Email verified successfully!");

          // Get the user's role
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", user.id)
              .single();

            // Role-based redirection
            const redirectMap: { [key: string]: string } = {
              admin: "/dashboard",
              customer: "/customer-portal",
              supplier: "/supplier-portal",
              employee: "/employee-portal",
            };

            const redirectPath = profile?.role
              ? redirectMap[profile.role]
              : "/dashboard";

            // Delay redirect to show success message
            setTimeout(() => {
              router.push(redirectPath);
            }, 2000);
          }
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage("An unexpected error occurred");
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
