"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { Component, ReactNode } from "react";

let convex: ConvexReactClient | null = null;
let convexInitError: string | null = null;

try {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    convexInitError = "NEXT_PUBLIC_CONVEX_URL is not set. Add it to your .env.local file.";
  } else {
    convex = new ConvexReactClient(url);
  }
} catch (e) {
  convexInitError = `Failed to initialize Convex client: ${e instanceof Error ? e.message : String(e)}`;
}

class ConvexErrorBoundary extends Component<
  { children: ReactNode },
  { error: string | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }

  render() {
    if (this.state.error) {
      return <ConvexErrorMessage message={this.state.error} />;
    }
    return this.props.children;
  }
}

function ConvexErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="max-w-md p-6 rounded-lg border border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
          Backend Unavailable
        </h2>
        <p className="text-sm text-red-700 dark:text-red-300 mb-4">
          {message}
        </p>
        <p className="text-xs text-red-600 dark:text-red-400">
          Make sure the Convex dev server is running:{" "}
          <code className="bg-red-100 dark:bg-red-900 px-1.5 py-0.5 rounded">
            npx convex dev
          </code>
        </p>
      </div>
    </div>
  );
}

export { ConvexErrorMessage };

export function Providers({ children }: { children: ReactNode }) {
  if (convexInitError || !convex) {
    return (
      <ClerkProvider>
        <ConvexErrorMessage message={convexInitError ?? "Convex client failed to initialize."} />
      </ClerkProvider>
    );
  }

  return (
    <ClerkProvider>
      <ConvexErrorBoundary>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          {children}
        </ConvexProviderWithClerk>
      </ConvexErrorBoundary>
    </ClerkProvider>
  );
}
