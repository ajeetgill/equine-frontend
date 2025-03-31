import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import logo from "@/assets/logo-small.png";
import Link from "next/link";
import "./globals.css";
import Image from "next/image";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Horse C.O.P. Reports",
  description:
    "The Website to download the reports generated from accompanying mobile app.",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col items-center">
            <div className="flex-1 w-full flex flex-col gap-20 items-center">
              <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
                <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                  <Link
                    href={"/"}
                    className="flex items-center text-lg font-black"
                  >
                    <Image
                      src={logo}
                      className="w-auto max-w-[35px]"
                      alt="Logo for Horse Assessment Report Downloading WebApp"
                    />
                    C.O.P
                  </Link>
                  <div className="flex">
                    <HeaderAuth />
                    <ThemeSwitcher />
                  </div>
                </div>
              </nav>
              {children}
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
