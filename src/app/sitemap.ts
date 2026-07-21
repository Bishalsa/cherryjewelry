import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { APP_URL } from "@/lib/constants";
import { CATEGORIES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = APP_URL;
  const now = new Date();

  // 1. Fetch active products dynamically
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    productEntries = products.map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Sitemap generation database query error:", error);
  }

  // 2. Static top-level pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/collections`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/search`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/shipping-policy`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/returns`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.2 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.2 },
  ];

  // 3. Collection pages (high SEO value for category-level queries)
  const collectionRoutes: MetadataRoute.Sitemap = [
    "new-arrivals",
    "best-sellers",
    ...CATEGORIES.map((c) => c.slug),
  ].map((slug) => ({
    url: `${baseUrl}/collections/${slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.85,
  }));

  return [...staticRoutes, ...collectionRoutes, ...productEntries];
}
