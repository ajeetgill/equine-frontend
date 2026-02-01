"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "./ui/button";

export const LoginBtn = () => {
  return (
    <Button asChild size="sm" variant={"outline"}>
      <Link href="/sign-in">Sign in</Link>
    </Button>
  );
};

export const SignUpBtn = () => {
  return (
    <Button asChild size="sm" variant={"default"}>
      <Link href="/sign-up">Sign up</Link>
    </Button>
  );
};

export default function HeaderAuth() {
  return (
    <>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
      <SignedOut>
        <div className="flex gap-2">
          <LoginBtn />
          <SignUpBtn />
        </div>
      </SignedOut>
    </>
  );
}
