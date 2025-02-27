"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "your-toast-library";

export default function ConfirmEmail() {
  const router = useRouter();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the URL parameters
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const type = params.get("type");

        if (token && type === "signup") {
          toast.success("Email confirmed successfully");
          router.push("/login");
        }
      } catch (error) {
        console.error("Confirmation error:", error);
        toast.error("Failed to confirm email");
      }
    };

    handleEmailConfirmation();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div>Confirming your email...</div>
    </div>
  );
}
