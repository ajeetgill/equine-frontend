import AuthButton from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Info } from "lucide-react";

export default async function Home() {
  return (
    <>
      <main className="flex-1 flex flex-col gap-6 px-4">
        <h2 className="font-medium text-xl mb-4">Next steps</h2>
        <p>
          Create account using <b>"Sign Up"</b>, if you do not have an account.
          <br />
          OR <b>"Sign in"</b> if you already have an account
        </p>
        <AuthButton />

        <div className="flex">
          <p>Other than that, you can use </p>
          <p className="relative -top-1">
            <ThemeSwitcher />
          </p>

          <p>
            <b>(top-right)</b> of screen to switch between DARK/LIGHT themes.
          </p>
        </div>
        <small>
          <Info className="inline size-4 mb-1" /> If neither work, contact the
          developer
        </small>
      </main>
    </>
  );
}
