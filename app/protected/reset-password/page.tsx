"use client";

import { UserProfile } from "@clerk/nextjs";

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-medium mb-4">Account Settings</h1>
      <UserProfile />
    </div>
  );
}
