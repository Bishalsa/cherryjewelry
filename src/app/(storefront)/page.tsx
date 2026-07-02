import prisma from "@/lib/prisma";
import { sampleProducts, sampleCategories } from "@/lib/sample-data";
import HomePageClient from "@/components/home/HomePageClient";
import type { Product, Category } from "@/types";

export default async function HomePage() {
  let categories: Category[] = [];
  let bestSellers: Product[] = [];
  let newArrivals: Product[] = [];
  let usingFallback = false;

  try {
    // Try to fetch from database
    const dbCategories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
      take: 6,
    });
    
    const dbBestSellers = await prisma.product.findMany({
      where: { isActive: true, isBestSeller: true },
      include: { variants: true, images: true },
      take: 4,
    });
    
    const dbNewArrivals = await prisma.product.findMany({
      where: { isActive: true, isNewArrival: true },
      include: { variants: true, images: true },
      orderBy: { createdAt: 'desc' },
      take: 4,
    });

    if (dbCategories.length > 0) {
      categories = dbCategories as unknown as Category[];
      bestSellers = dbBestSellers as unknown as Product[];
      newArrivals = dbNewArrivals as unknown as Product[];
    } else {
      usingFallback = true;
    }
  } catch {
    // Database not available — fall back to sample data
    usingFallback = true;
  }

  if (usingFallback) {
    categories = sampleCategories.slice(0, 6);
    bestSellers = sampleProducts.filter((p) => p.isBestSeller).slice(0, 4);
    newArrivals = sampleProducts.filter((p) => p.isNewArrival).slice(0, 4);
  }

  return (
    <HomePageClient
      categories={categories}
      bestSellers={bestSellers}
      newArrivals={newArrivals}
    />
  );
}
