"use client";

// Error boundary for collection [slug] pages
// Catches unexpected runtime errors during SSR / client navigation

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home } from "lucide-react";

export default function CollectionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to monitoring (e.g. Sentry) in production
    console.error("Collection page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-5xl mb-6">😔</p>
        <h1 className="font-heading text-2xl text-deep-plum mb-3">
          Something went wrong
        </h1>
        <p className="text-sm text-neutral-400 mb-8 leading-relaxed">
          We couldn&apos;t load this collection right now. This is likely a
          temporary issue — please try again.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-6 py-3 bg-rose-gold text-white rounded-full text-sm font-medium hover:bg-rose-gold-dark transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/collections"
            className="flex items-center gap-2 px-6 py-3 border border-neutral-200 text-neutral-600 rounded-full text-sm font-medium hover:border-rose-gold hover:text-rose-gold transition-colors"
          >
            <Home className="w-4 h-4" />
            All Collections
          </Link>
        </div>
      </div>
    </div>
  );
}
