import { Suspense } from "react";
import { getProducts, getCategories } from "@/lib/db-queries";
import CollectionsClient from "@/components/collections/CollectionsClient";

export const metadata = {
  title: "Collections",
  description:
    "Browse our complete collection of exquisite handcrafted jewelry. Filter by category, material, and price.",
};

interface CollectionsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CollectionsPage({
  searchParams,
}: CollectionsPageProps) {
  const params = await searchParams;

  // Extract filter values from URL search params
  const category =
    typeof params.category === "string" ? params.category : undefined;
  const material =
    typeof params.material === "string" ? params.material : undefined;
  const priceMin =
    typeof params.priceMin === "string"
      ? parseInt(params.priceMin, 10)
      : undefined;
  const priceMax =
    typeof params.priceMax === "string"
      ? parseInt(params.priceMax, 10)
      : undefined;
  const sortBy =
    typeof params.sort === "string" ? params.sort : "newest";
  const page =
    typeof params.page === "string" ? parseInt(params.page, 10) : 1;

  // Fetch data server-side from database (or fallback to sample data)
  const [{ products, total, totalPages }, categories] = await Promise.all([
    getProducts({
      category,
      material,
      priceMin: priceMin !== undefined && !isNaN(priceMin) ? priceMin : undefined,
      priceMax: priceMax !== undefined && !isNaN(priceMax) ? priceMax : undefined,
      sortBy,
      page: !isNaN(page) ? page : 1,
    }),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-b from-champagne-light to-ivory py-16 md:py-20">
        <div className="container-luxury text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-gold-dark mb-3">
            Our Collection
          </p>
          <h1 className="font-heading text-3xl md:text-5xl text-obsidian">
            All Jewelry
          </h1>
          <p className="text-neutral-400 mt-3 text-sm">
            Discover {total} handcrafted pieces
          </p>
        </div>
      </section>

      <div className="container-luxury py-8">
        <Suspense
          fallback={
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/5] bg-neutral-100 rounded-xl animate-pulse"
                />
              ))}
            </div>
          }
        >
          <CollectionsClient
            products={products}
            categories={categories}
            total={total}
            currentPage={page}
            totalPages={totalPages}
            activeCategory={category || null}
            activeMaterial={material || null}
            activePriceMin={
              priceMin !== undefined && !isNaN(priceMin) ? priceMin : null
            }
            activePriceMax={
              priceMax !== undefined && !isNaN(priceMax) ? priceMax : null
            }
            activeSort={sortBy}
          />
        </Suspense>
      </div>
    </div>
  );
}
