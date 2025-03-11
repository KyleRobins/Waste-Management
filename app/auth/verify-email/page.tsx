"use client";

import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Get the email from local storage or session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setEmail(session.user.email);
      }
    };
    getSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        toast.success('Email verified successfully!');
        router.push('/dashboard');
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
          {email && (
            <p className="text-muted-foreground">
              We sent a verification link to <span className="font-medium">{email}</span>
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-4">
            Click the link in your email to verify your account. If you don't see it, check your spam folder.
          </p>
        </div>
      </Card>
    </div>
  );
}
