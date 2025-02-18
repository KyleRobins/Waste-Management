import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface PasswordRequirementProps {
  password: string;
  confirmPassword?: string;
}

interface Requirement {
  text: string;
  validator: (pass: string) => boolean;
  isVisible: boolean;
}

export function PasswordRequirements({
  password,
  confirmPassword,
}: PasswordRequirementProps) {
  const [requirements, setRequirements] = useState<Requirement[]>([
    {
      text: "At least 8 characters",
      validator: (pass: string) => pass.length >= 8,
      isVisible: true,
    },
    {
      text: "Contains uppercase letter",
      validator: (pass: string) => /[A-Z]/.test(pass),
      isVisible: true,
    },
    {
      text: "Contains lowercase letter",
      validator: (pass: string) => /[a-z]/.test(pass),
      isVisible: true,
    },
    {
      text: "Contains number",
      validator: (pass: string) => /[0-9]/.test(pass),
      isVisible: true,
    },
    {
      text: "Contains special character",
      validator: (pass: string) => /[^A-Za-z0-9]/.test(pass),
      isVisible: true,
    },
    {
      text: "Passwords match",
      validator: (pass: string) => {
        if (confirmPassword === undefined) return true;
        if (confirmPassword === "") return true;
        return pass === confirmPassword;
      },
      isVisible: confirmPassword !== undefined && confirmPassword !== "",
    },
  ]);

  useEffect(() => {
    requirements.forEach((requirement, index) => {
      const isMet = requirement.validator(password || "");

      // Unified animation handling for all requirements
      if (isMet && requirement.isVisible) {
        setTimeout(() => {
          setRequirements((prev) =>
            prev.map((req, i) =>
              i === index ? { ...req, isVisible: false } : req
            )
          );
        }, 1000);
      } else if (!isMet && !requirement.isVisible) {
        setRequirements((prev) =>
          prev.map((req, i) =>
            i === index ? { ...req, isVisible: true } : req
          )
        );
      }
    });
  }, [password, confirmPassword]);

  return (
    <div className="text-sm space-y-2 mt-2">
      <p className="text-muted-foreground">Password requirements:</p>
      <div className="space-y-2">
        {requirements.map((requirement, index) => {
          const isMet = requirement.validator(password || "");
          if (!requirement.isVisible) return null;

          return (
            <div
              key={index}
              className={cn(
                "flex items-center space-x-2 transition-all duration-300",
                isMet ? "text-green-500" : "text-muted-foreground",
                "animate-in fade-in-0 slide-in-from-left-5"
              )}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                {isMet ? (
                  <Check className="w-4 h-4 animate-in fade-in-50" />
                ) : (
                  <X className="w-4 h-4" />
                )}
              </div>
              <span
                className={cn(
                  "transition-all duration-300 relative",
                  isMet && "line-through"
                )}
              >
                {requirement.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
