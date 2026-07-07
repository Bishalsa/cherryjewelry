import { Suspense } from "react";
import { searchProducts } from "@/lib/db-queries";
import SearchClient from "@/components/search/SearchClient";

export const metadata = {
  title: "Search",
  description:
    "Search our entire collection of handcrafted jewelry — rings, necklaces, earrings, bracelets, and more.",
};

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  const query = typeof params.q === "string" ? params.q : "";
  const sortBy = typeof params.sort === "string" ? params.sort : "relevance";

  // Server-side search from database (or fallback to sample data)
  const results = await searchProducts(query, sortBy);

  return (
    <div className="min-h-screen">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-pulse text-neutral-400">Searching...</div>
          </div>
        }
      >
        <SearchClient
          initialQuery={query}
          results={results}
          sortBy={sortBy}
        />
      </Suspense>
    </div>
  );
}
