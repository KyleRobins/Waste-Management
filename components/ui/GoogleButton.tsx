"use client";

import { Button } from "@/components/ui/button";
import { handleOAuthSignIn } from "@/lib/auth-helpers";
import { useState } from "react";

interface GoogleButtonProps {
  mode: "login" | "register";
  role?: string;
  isFirstUser?: boolean;
}

export function GoogleButton({ mode, role, isFirstUser }: GoogleButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await handleOAuthSignIn("google", mode, { role, isFirstUser });
    } catch (error) {
      console.error("Google sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGoogleSignIn}
      variant="outline"
      className="w-full flex items-center justify-center gap-2"
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v8" />
          <path d="M8 12h8" />
        </svg>
      )}
      Continue with Google
    </Button>
  );
}