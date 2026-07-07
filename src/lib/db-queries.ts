// ============================================
// Cherry Jewelry — Data Access Layer
// Shared Prisma queries with graceful fallback
// to sample data when DB is unavailable.
// ============================================

import prisma from "@/lib/prisma";
import { sampleProducts, sampleCategories } from "@/lib/sample-data";
import type { Product, Category, ProductVariant } from "@/types";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";

// ============================================
// Type helpers — convert Prisma Decimals to numbers
// ============================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : Number(value);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toNumberOrNull(value: any): number | null {
  if (value === null || value === undefined) return null;
  return typeof value === "number" ? value : Number(value);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeProduct(dbProduct: any): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    slug: dbProduct.slug,
    description: dbProduct.description,
    shortDescription: dbProduct.shortDescription || "",
    price: toNumber(dbProduct.price),
    compareAtPrice: toNumberOrNull(dbProduct.compareAtPrice),
    costPrice: toNumberOrNull(dbProduct.costPrice),
    sku: dbProduct.sku,
    material: dbProduct.material,
    weight: dbProduct.weight || "",
    purity: dbProduct.purity || null,
    categoryId: dbProduct.categoryId,
    category: dbProduct.category
      ? normalizeCategory(dbProduct.category)
      : undefined,
    images: (dbProduct.images || []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (img: any) => ({
        id: img.id,
        url: img.url,
        alt: img.alt || "",
        position: img.position || 0,
        productId: img.productId,
      })
    ),
    variants: (dbProduct.variants || []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (v: any) => normalizeVariant(v)
    ),
    reviews: dbProduct.reviews || [],
    tags: dbProduct.tags || [],
    metaTitle: dbProduct.metaTitle || null,
    metaDescription: dbProduct.metaDescription || null,
    isFeatured: dbProduct.isFeatured ?? false,
    isNewArrival: dbProduct.isNewArrival ?? false,
    isBestSeller: dbProduct.isBestSeller ?? false,
    isActive: dbProduct.isActive ?? true,
    averageRating: toNumber(dbProduct.averageRating),
    reviewCount: dbProduct.reviewCount ?? 0,
    createdAt: new Date(dbProduct.createdAt),
    updatedAt: new Date(dbProduct.updatedAt),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeVariant(v: any): ProductVariant {
  return {
    id: v.id,
    name: v.name,
    sku: v.sku,
    price: toNumber(v.price),
    compareAtPrice: toNumberOrNull(v.compareAtPrice),
    material: v.material,
    size: v.size || null,
    weight: v.weight || null,
    stock: v.stock ?? v.inventory?.[0]?.quantity ?? 0,
    productId: v.productId,
    isActive: v.isActive ?? true,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeCategory(c: any): Category {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description || null,
    image: c.image || null,
    parentId: c.parentId || null,
    position: c.position ?? 0,
    isActive: c.isActive ?? true,
  };
}

// ============================================
// Product Filters Interface
// ============================================

export interface ProductFilters {
  category?: string; // category slug
  material?: string;
  priceMin?: number;
  priceMax?: number;
  sortBy?: string; // "newest" | "price_asc" | "price_desc" | "rating"
  page?: number;
  limit?: number;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
}

export interface ProductsResult {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

// ============================================
// Query: Get Categories
// ============================================

export async function getCategories(): Promise<Category[]> {
  try {
    const dbCategories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { position: "asc" },
    });

    if (dbCategories.length > 0) {
      return dbCategories.map(normalizeCategory);
    }
  } catch {
    // Database not available
  }

  // Fallback to sample data
  return sampleCategories;
}

// ============================================
// Query: Get Products (Paginated + Filtered)
// ============================================

export async function getProducts(
  filters: ProductFilters = {}
): Promise<ProductsResult> {
  const {
    category,
    material,
    priceMin,
    priceMax,
    sortBy = "newest",
    page = 1,
    limit = PRODUCTS_PER_PAGE,
    isFeatured,
    isNewArrival,
    isBestSeller,
  } = filters;

  try {
    // Build the where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { isActive: true };

    if (category) {
      where.category = { slug: category };
    }
    if (material) {
      where.material = { contains: material, mode: "insensitive" };
    }
    if (priceMin !== undefined || priceMax !== undefined) {
      where.price = {};
      if (priceMin !== undefined) where.price.gte = priceMin;
      if (priceMax !== undefined) where.price.lte = priceMax;
    }
    if (isFeatured !== undefined) where.isFeatured = isFeatured;
    if (isNewArrival !== undefined) where.isNewArrival = isNewArrival;
    if (isBestSeller !== undefined) where.isBestSeller = isBestSeller;

    // Build the orderBy clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orderBy: any = { createdAt: "desc" };
    switch (sortBy) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "rating":
        orderBy = { averageRating: "desc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    const skip = (page - 1) * limit;

    const [dbProducts, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { position: "asc" } },
          variants: true,
          category: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    if (dbProducts.length > 0 || total > 0) {
      return {
        products: dbProducts.map(normalizeProduct),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }
  } catch {
    // Database not available
  }

  // Fallback to sample data with client-side filtering
  let filtered = sampleProducts.filter((p) => p.isActive);

  if (category) {
    const cat = sampleCategories.find((c) => c.slug === category);
    if (cat) filtered = filtered.filter((p) => p.categoryId === cat.id);
  }
  if (material) {
    filtered = filtered.filter((p) =>
      p.material.toLowerCase().includes(material.toLowerCase())
    );
  }
  if (priceMin !== undefined) {
    filtered = filtered.filter((p) => p.price >= priceMin);
  }
  if (priceMax !== undefined) {
    filtered = filtered.filter((p) => p.price <= priceMax);
  }
  if (isFeatured !== undefined) {
    filtered = filtered.filter((p) => p.isFeatured === isFeatured);
  }
  if (isNewArrival !== undefined) {
    filtered = filtered.filter((p) => p.isNewArrival === isNewArrival);
  }
  if (isBestSeller !== undefined) {
    filtered = filtered.filter((p) => p.isBestSeller === isBestSeller);
  }

  // Sort
  switch (sortBy) {
    case "price_asc":
      filtered.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      filtered.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      filtered.sort((a, b) => b.averageRating - a.averageRating);
      break;
    case "newest":
    default:
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  return {
    products: paginated,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

// ============================================
// Query: Get Product by Slug
// ============================================

export async function getProductBySlug(
  slug: string
): Promise<Product | null> {
  try {
    const dbProduct = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { position: "asc" } },
        variants: true,
        category: true,
      },
    });

    if (dbProduct) {
      return normalizeProduct(dbProduct);
    }
  } catch {
    // Database not available
  }

  // Fallback to sample data
  const sample = sampleProducts.find((p) => p.slug === slug);
  return sample || null;
}

// ============================================
// Query: Get Related Products
// ============================================

export async function getRelatedProducts(
  productId: string,
  categoryId: string,
  limit: number = 4
): Promise<Product[]> {
  try {
    const dbProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        id: { not: productId },
        categoryId,
      },
      include: {
        images: { orderBy: { position: "asc" } },
        variants: true,
      },
      take: limit,
    });

    if (dbProducts.length > 0) {
      return dbProducts.map(normalizeProduct);
    }
  } catch {
    // Database not available
  }

  // Fallback
  return sampleProducts
    .filter((p) => p.id !== productId)
    .slice(0, limit);
}

// ============================================
// Query: Get All Product Slugs (for generateStaticParams)
// ============================================

export async function getAllProductSlugs(): Promise<string[]> {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true },
    });

    if (products.length > 0) {
      return products.map((p) => p.slug);
    }
  } catch {
    // Database not available
  }

  // Fallback
  return sampleProducts.map((p) => p.slug);
}

// ============================================
// Query: Search Products
// ============================================

export async function searchProducts(
  query: string,
  sortBy: string = "relevance",
  limit: number = 24
): Promise<Product[]> {
  if (!query || query.length < 2) return [];

  try {
    const dbProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { material: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { tags: { has: query.toLowerCase() } },
        ],
      },
      include: {
        images: { orderBy: { position: "asc" } },
        variants: true,
      },
      take: limit,
    });

    if (dbProducts.length > 0) {
      const products = dbProducts.map(normalizeProduct);
      return sortSearchResults(products, sortBy);
    }
  } catch {
    // Database not available
  }

  // Fallback to sample data
  const lowerQuery = query.toLowerCase();
  const results = sampleProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.material.toLowerCase().includes(lowerQuery) ||
      p.tags.some((t) => t.toLowerCase().includes(lowerQuery))
  );

  return sortSearchResults(results, sortBy);
}

function sortSearchResults(
  products: Product[],
  sortBy: string
): Product[] {
  const sorted = [...products];
  switch (sortBy) {
    case "price_asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "newest":
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
    case "relevance":
    default:
      break; // keep DB ordering
  }
  return sorted;
}

// ============================================
// Query: Check Stock for Cart Items
// ============================================

export interface StockCheckItem {
  productId: string;
  variantId?: string | null;
  quantity: number;
}

export interface StockCheckResult {
  available: boolean;
  unavailableItems: {
    productId: string;
    variantId?: string | null;
    name: string;
    requested: number;
    available: number;
  }[];
}

export async function checkStock(
  items: StockCheckItem[]
): Promise<StockCheckResult> {
  const unavailableItems: StockCheckResult["unavailableItems"] = [];

  try {
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: { include: { inventory: true } } },
      });

      if (!product) {
        unavailableItems.push({
          productId: item.productId,
          variantId: item.variantId,
          name: "Unknown product",
          requested: item.quantity,
          available: 0,
        });
        continue;
      }

      if (item.variantId) {
        const variant = product.variants.find(
          (v) => v.id === item.variantId
        );
        if (!variant) {
          unavailableItems.push({
            productId: item.productId,
            variantId: item.variantId,
            name: product.name,
            requested: item.quantity,
            available: 0,
          });
          continue;
        }

        // Calculate available stock across all warehouses
        const totalAvailable = variant.inventory.reduce(
          (sum, inv) => sum + (inv.quantity - inv.reserved),
          0
        );

        if (totalAvailable < item.quantity) {
          unavailableItems.push({
            productId: item.productId,
            variantId: item.variantId,
            name: `${product.name} - ${variant.name}`,
            requested: item.quantity,
            available: Math.max(0, totalAvailable),
          });
        }
      }
    }
  } catch {
    // If DB is unavailable, skip stock check (allow checkout)
    return { available: true, unavailableItems: [] };
  }

  return {
    available: unavailableItems.length === 0,
    unavailableItems,
  };
}

// ============================================
// Mutation: Reserve Inventory after Order
// ============================================

export async function reserveInventory(
  items: StockCheckItem[]
): Promise<void> {
  try {
    for (const item of items) {
      if (!item.variantId) continue;

      // Reserve in the first warehouse that has stock
      const inventory = await prisma.inventory.findFirst({
        where: {
          variantId: item.variantId,
          quantity: { gt: 0 },
        },
        orderBy: { quantity: "desc" },
      });

      if (inventory) {
        await prisma.inventory.update({
          where: { id: inventory.id },
          data: { reserved: { increment: item.quantity } },
        });
      }
    }
  } catch {
    // If DB is unavailable, silently skip reservation
    console.warn("Could not reserve inventory — database unavailable");
  }
}
