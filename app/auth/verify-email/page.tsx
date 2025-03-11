"use client";

import { Card } from "@/components/ui/card";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        toast.success("Email verified successfully!");
        router.push("/dashboard");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-4">
        <div className="text-center space-y-2">
          <Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" />
          <h1 className="text-2xl font-semibold">Check your email</h1>
          <p className="text-muted-foreground">
            We sent you a verification link. Please check your email and click
            the link to verify your account.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Once verified, you will be automatically redirected to the
            dashboard.
          </p>
        </div>
      </Card>
    </div>
  );
}
