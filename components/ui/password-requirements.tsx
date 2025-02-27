"use client";

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
    <div className="space-y-2 transition-all duration-200 ease-in-out">
      <p className="text-sm font-medium text-muted-foreground">
        Password requirements:
      </p>
      <ul className="text-sm space-y-1">
        {requirements.map((requirement, index) => (
          <li
            key={index}
            className={cn(
              "flex items-center gap-2",
              requirement.validator(password || "")
                ? "text-green-600"
                : "text-muted-foreground"
            )}
          >
            {requirement.validator(password || "") ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {requirement.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
