"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function ConfirmEmail() {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the URL parameters
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const type = params.get("type");

        if (token && type === "signup") {
          toast({
            title: "Success",
            description: "Email confirmed successfully",
          });
          router.push("/auth/login");
        }
      } catch (error) {
        console.error("Confirmation error:", error);
        toast({
          title: "Error",
          description: "Failed to confirm email",
          variant: "destructive",
        });
      }
    };

    handleEmailConfirmation();
  }, [router, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold">Confirming your email...</h1>
        <p className="text-muted-foreground">Please wait while we verify your email address.</p>
      </div>
    </div>
  );
}
