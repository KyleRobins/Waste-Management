"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const formSchema = z
  .object({
    password: z.string()
      .min(6, "Password must be at least 6 characters")
      .max(72, "Password must be less than 72 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClientComponentClient();
  const searchParams = useSearchParams();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    const verifyResetToken = async () => {
      try {
        const token = searchParams.get("token");
        const type = searchParams.get("type");

        if (!token || !type) {
          throw new Error("Invalid reset link");
        }

        // First exchange the token for a session
        const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(token);
        
        if (sessionError) {
          console.error("Session exchange error:", sessionError);
          throw sessionError;
        }

        // Then verify the recovery token
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token,
          type: 'recovery'
        });

        if (verifyError) {
          console.error("Token verification error:", verifyError);
          throw verifyError;
        }

        setIsValidToken(true);
      } catch (error: any) {
        console.error("Token verification error:", error);
        toast({
          title: "Error",
          description: "Invalid or expired reset link. Please request a new one.",
          variant: "destructive",
        });
        router.push("/auth/forgot-password");
      }
    };

    if (searchParams.get("token")) {
      verifyResetToken();
    }
  }, [searchParams, router, toast, supabase.auth]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: values.password
      });

      if (error) throw error;

      // Show success message
      toast({
        title: "Success",
        description: "Your password has been reset successfully. Please log in with your new password.",
      });

      // Sign out any existing session
      await supabase.auth.signOut();

      // Redirect to login after a short delay to show the success message
      setTimeout(() => {
        router.push("/auth/login?message=Password reset successful. Please log in with your new password.");
      }, 2000);

    } catch (error: any) {
      console.error("Reset password error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while verifying token
  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Verifying Reset Link</h1>
            <p className="text-muted-foreground">Please wait while we verify your reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-muted-foreground">Enter your new password below</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Enter your new password"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Confirm your new password"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Resetting Password..." : "Reset Password"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
