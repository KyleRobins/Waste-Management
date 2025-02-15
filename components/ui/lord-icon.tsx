"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

interface LordIconProps {
  src: string;
  trigger?: "hover" | "click" | "loop" | "loop-on-hover" | "morph" | "morph-two-way";
  size?: number;
  colors?: {
    primary?: string;
    secondary?: string;
  };
}

export function LordIcon({ src, trigger = "hover", size = 250, colors }: LordIconProps) {
  const iconRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Apply colors if provided
    if (colors && iconRef.current) {
      if (colors.primary) {
        iconRef.current.setAttribute('colors', `primary:${colors.primary}`);
      }
      if (colors.secondary) {
        iconRef.current.setAttribute('colors', `secondary:${colors.secondary}`);
      }
    }
  }, [colors]);

  return (
    <>
      <Script src="https://cdn.lordicon.com/lordicon.js" />
      <lord-icon
        ref={iconRef}
        src={src}
        trigger={trigger}
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    </>
  );
} 