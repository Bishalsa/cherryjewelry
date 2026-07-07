import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { APP_URL } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = APP_URL;

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

  // 2. Define static pages
  const staticRoutes = ["", "/collections", "/about", "/contact", "/faq", "/search"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.6,
  }));

  return [...staticRoutes, ...productEntries];
}
