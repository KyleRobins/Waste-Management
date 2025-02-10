"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updatePassword } from "@/lib/services/auth.service";
import { createClient } from "@/lib/supabase/client"; // Correct import
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
import { FormEvent } from "react";

const formSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const supabase = createClient();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const token = searchParams.get("token");

  useEffect(() => {
    const handlePasswordReset = async () => {
      try {
        // Get the access token from the URL
        const code = searchParams.get("code");

        if (!code) {
          toast({
            title: "Error",
            description: "Invalid password reset link",
            variant: "destructive",
          });
          router.push("/auth/login");
          return;
        }

        // Verify the password reset code
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          toast({
            title: "Error",
            description: "Invalid or expired password reset link",
            variant: "destructive",
          });
          router.push("/auth/login");
          return;
        }

        setValidSession(true);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Something went wrong",
          variant: "destructive",
        });
        router.push("/auth/login");
      }
    };

    handlePasswordReset();
  }, [searchParams, router, toast]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to reset password");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!validSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Verifying Reset Link</h1>
            <p className="text-muted-foreground">
              Please wait while we verify your password reset link...
            </p>
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
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
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
