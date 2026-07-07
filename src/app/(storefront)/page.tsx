import { getProducts, getCategories } from "@/lib/db-queries";
import HomePageClient from "@/components/home/HomePageClient";

export default async function HomePage() {
  // Fetch data from database (automatically falls back to sample data)
  const [categories, bestSellersResult, newArrivalsResult] = await Promise.all([
    getCategories(),
    getProducts({ isBestSeller: true, limit: 4 }),
    getProducts({ isNewArrival: true, sortBy: "newest", limit: 4 }),
  ]);

  return (
    <HomePageClient
      categories={categories.slice(0, 6)}
      bestSellers={bestSellersResult.products}
      newArrivals={newArrivalsResult.products}
    />
  );
}
