"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function ConfirmEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Get all search params
        const params = Object.fromEntries(searchParams.entries());
        console.log("Confirmation params:", params);

        // Check if we have a token in the URL
        const token = searchParams.get("token");
        const type = searchParams.get("type");

        if (!token) {
          setStatus("error");
          setMessage("No confirmation token found in the URL");
          return;
        }

        // Verify the email
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "email",
        });

        if (error) {
          console.error("Verification error:", error);
          throw error;
        }

        setStatus("success");
        setMessage("Email confirmed successfully! You can now log in.");

        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      } catch (error) {
        console.error("Email confirmation error:", error);
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Failed to confirm email. Please try again or contact support."
        );
      }
    };

    confirmEmail();
  }, [searchParams, router, supabase.auth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Confirm Email</CardTitle>
          <CardDescription>
            {status === "loading" && "Confirming your email..."}
            {status === "success" && "Email Confirmed"}
            {status === "error" && "Confirmation Failed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "loading" && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}

          {status === "success" && (
            <div className="text-center space-y-4">
              <p className="text-green-600">{message}</p>
              <p className="text-sm text-muted-foreground">
                Redirecting to login page...
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="text-center space-y-4">
              <p className="text-red-600">{message}</p>
              <Button
                onClick={() => router.push("/auth/login")}
                className="w-full"
              >
                Return to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
