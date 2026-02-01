import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col min-h-[60vh] items-center justify-center gap-4">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-medium">Reset Password</h1>
        <p className="text-sm text-secondary-foreground mt-2">
          Use the sign-in form below and click &quot;Forgot password?&quot; to reset your password.
        </p>
        <Link className="text-primary underline text-sm" href="/sign-in">
          Back to Sign in
        </Link>
      </div>
      <SignIn routing="hash" />
    </div>
  );
}
