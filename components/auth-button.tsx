"use client";

import React from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { cn } from "@/lib/utils";

type AuthButtonProps = {
  isLoggedIn: boolean;
  className?: string;
  children?: React.ReactNode;
};

export default function AuthButton({
  isLoggedIn,
  className,
  children,
}: AuthButtonProps) {
  if (isLoggedIn) {
    return (
      <Link
        href="/trips"
        className={cn(
          "inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium",
          className
        )}
      >
        {children ?? "Go to Trips"}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void signIn("github", { callbackUrl: "/" })}
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium",
        className
      )}
    >
      {children ?? "Sign in"}
    </button>
  );
}
