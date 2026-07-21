// 404 page for unknown collection slugs
// e.g. /collections/xyz → shown when slug not in COLLECTION_CONFIGS

import Link from "next/link";
import { ALL_COLLECTION_SLUGS, getCollectionConfig } from "@/lib/collection-meta";

export default function CollectionNotFound() {
  // Show a few valid collections as suggestions
  const suggestions = ["rings", "necklaces", "earrings", "best-sellers", "new-arrivals"];

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <p className="text-6xl mb-6">🔍</p>
        <h1 className="font-heading text-3xl text-deep-plum mb-3">
          Collection Not Found
        </h1>
        <p className="text-sm text-neutral-400 mb-8 leading-relaxed">
          We couldn&apos;t find the collection you&apos;re looking for. It may
          have been moved or the URL may be incorrect.
        </p>

        {/* Suggestions */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-neutral-400 mb-4">
            Browse our collections
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((slug) => {
              const config = getCollectionConfig(slug);
              if (!config) return null;
              return (
                <Link
                  key={slug}
                  href={`/collections/${slug}`}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white border border-neutral-200 hover:border-rose-gold hover:text-rose-gold rounded-full text-sm transition-all duration-300"
                >
                  <span>{config.emoji}</span>
                  {config.heading}
                </Link>
              );
            })}
          </div>
        </div>

        <Link
          href="/collections"
          className="inline-flex items-center gap-2 bg-deep-plum text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-deep-plum-dark transition-colors"
        >
          View All Collections
        </Link>
      </div>
    </div>
  );
}
