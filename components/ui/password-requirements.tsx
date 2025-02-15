import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordRequirementProps {
  password: string;
}

export function PasswordRequirements({ password }: PasswordRequirementProps) {
  const requirements = [
    {
      text: "At least 8 characters",
      validator: (pass: string) => pass.length >= 8,
    },
    {
      text: "Contains uppercase letter",
      validator: (pass: string) => /[A-Z]/.test(pass),
    },
    {
      text: "Contains lowercase letter",
      validator: (pass: string) => /[a-z]/.test(pass),
    },
    {
      text: "Contains number",
      validator: (pass: string) => /[0-9]/.test(pass),
    },
    {
      text: "Contains special character",
      validator: (pass: string) => /[^A-Za-z0-9]/.test(pass),
    },
  ];

  return (
    <div className="text-sm space-y-2 mt-2">
      <p className="text-muted-foreground">Password requirements:</p>
      <div className="space-y-2">
        {requirements.map((requirement, index) => {
          const isMet = requirement.validator(password);
          return (
            <div
              key={index}
              className={cn(
                "flex items-center space-x-2 transition-all duration-300",
                isMet ? "text-green-500" : "text-muted-foreground"
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
                  "transition-all duration-300",
                  isMet && "line-through decoration-green-500"
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
