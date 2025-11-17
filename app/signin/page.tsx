'use client';

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function SignIn() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-zinc-900">
        <h1 className="mb-6 text-center text-2xl font-bold text-black dark:text-white">
          Sign In
        </h1>
        <button
          onClick={() =>
            signIn("github", {
              callbackUrl,
              redirect: true,
            })
          }
          className="w-full rounded-lg bg-black px-4 py-3 font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Sign in with GitHub
        </button>
      </div>
    </div>
  );
}
