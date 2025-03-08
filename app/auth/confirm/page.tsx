"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { verifyEmail } from "@/lib/auth-helpers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LordIcon } from "@/components/ui/lord-icon";

export default function ConfirmPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmContent />
    </Suspense>
  );
}

function ConfirmContent() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the URL parameters
        const token = searchParams.get("token");
        const type = searchParams.get("type");

        if (!token) {
          setStatus("error");
          setErrorMessage("No verification token found");
          return;
        }

        if (type === "signup" || type === "email") {
          const { data, error } = await verifyEmail(token);
          
          if (error) {
            setStatus("error");
            setErrorMessage(error.message);
            toast({
              title: "Error",
              description: error.message || "Failed to confirm email",
              variant: "destructive",
            });
            return;
          }
          
          setStatus("success");
          toast({
            title: "Success",
            description: "Email confirmed successfully",
          });
        } else {
          setStatus("error");
          setErrorMessage("Invalid verification type");
        }
      } catch (error) {
        console.error("Confirmation error:", error);
        setStatus("error");
        setErrorMessage((error as Error).message || "Failed to confirm email");
        toast({
          title: "Error",
          description: "Failed to confirm email",
          variant: "destructive",
        });
      }
    };

    handleEmailConfirmation();
  }, [router, toast, searchParams]);

  const handleContinue = () => {
    router.push("/auth/login?message=Email confirmed successfully. Please log in.");
  };

  const handleRetry = () => {
    router.push("/auth/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === "loading" && (
              <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-primary"></div>
            )}
            {status === "success" && (
              <LordIcon
                src="https://cdn.lordicon.com/yqzmiobz.json"
                trigger="loop"
                size={80}
                colors={{
                  primary: "#16a34a",
                  secondary: "#22c55e",
                }}
              />
            )}
            {status === "error" && (
              <LordIcon
                src="https://cdn.lordicon.com/tdrtiskw.json"
                trigger="loop"
                size={80}
                colors={{
                  primary: "#ef4444",
                  secondary: "#f87171",
                }}
              />
            )}
          </div>
          <CardTitle className="text-2xl font-semibold">
            {status === "loading" && "Confirming your email..."}
            {status === "success" && "Email Confirmed!"}
            {status === "error" && "Confirmation Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {status === "loading" && (
            <p className="text-muted-foreground">Please wait while we verify your email address.</p>
          )}
          
          {status === "success" && (
            <>
              <p className="text-muted-foreground">
                Your email has been successfully confirmed. You can now log in to your account.
              </p>
              <Button onClick={handleContinue} className="w-full">
                Continue to Login
              </Button>
            </>
          )}
          
          {status === "error" && (
            <>
              <p className="text-muted-foreground">
                {errorMessage || "We couldn't confirm your email. The link may have expired or is invalid."}
              </p>
              <Button onClick={handleRetry} className="w-full">
                Return to Login
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}