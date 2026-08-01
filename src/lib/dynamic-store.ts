// ============================================
// Cherry Jewelry — Persistent Local Product Store
// Saves and loads user products from src/data/products.json
// ============================================

import fs from "fs";
import path from "path";

export interface DynamicProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  barcode?: string | null;
  price: number;
  compareAtPrice: number | null;
  costPrice?: number | null;
  material: string;
  weight: string | null;
  purity: string | null;
  stoneType?: string | null;
  stoneWeight?: string | null;
  dimensions?: string | null;
  careInstructions?: string | null;
  shippingDetails?: string | null;
  warranty?: string | null;
  lowStockWarning?: number | null;
  status: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    parentId: string | null;
    position: number;
    isActive: boolean;
  };
  images: { id: string; url: string; alt: string; position: number; productId: string }[];
  variants: {
    id: string;
    name: string;
    sku: string;
    price: number;
    compareAtPrice: number | null;
    material: string;
    size?: string | null;
    weight: string | null;
    stock: number;
    productId: string;
    isActive: boolean;
  }[];
  tags: string[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  keywords: string[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

const JSON_FILE_PATH = path.join(process.cwd(), "src", "data", "products.json");

// Global memory cache retained across requests during runtime
const globalStore = globalThis as unknown as {
  __dynamicProductsStore?: DynamicProduct[];
};

function loadProductsFromFile(): DynamicProduct[] {
  try {
    if (fs.existsSync(JSON_FILE_PATH)) {
      const fileData = fs.readFileSync(JSON_FILE_PATH, "utf-8");
      return JSON.parse(fileData);
    }
  } catch (err) {
    console.warn("Failed to load products from file:", err);
  }
  return [];
}

function saveProductsToFile(products: DynamicProduct[]) {
  try {
    const dir = path.dirname(JSON_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(products, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to save products to file:", err);
  }
}

export function getDynamicProducts(): DynamicProduct[] {
  if (!globalStore.__dynamicProductsStore || globalStore.__dynamicProductsStore.length === 0) {
    globalStore.__dynamicProductsStore = loadProductsFromFile();
  }
  return globalStore.__dynamicProductsStore || [];
}

export function addOrUpdateDynamicProduct(productData: Partial<DynamicProduct>): DynamicProduct {
  const store = getDynamicProducts();
  const now = new Date().toISOString();

  const id = productData.id || `prod-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const slug =
    productData.slug ||
    (productData.name
      ? productData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      : `product-${Date.now()}`);

  const imageList =
    productData.images && productData.images.length > 0
      ? productData.images
      : [{ id: `img-${Date.now()}-0`, url: "/placeholder.jpg", alt: productData.name || "Product", position: 0, productId: id }];

  const existingIndex = store.findIndex((p) => p.id === id || p.sku === productData.sku);

  const categoryName =
    productData.categoryId === "cat-1" || productData.categoryId === "rings"
      ? "Rings"
      : productData.categoryId === "cat-2" || productData.categoryId === "necklaces"
      ? "Necklaces"
      : productData.categoryId === "cat-3" || productData.categoryId === "earrings"
      ? "Earrings"
      : productData.categoryId === "cat-4" || productData.categoryId === "bracelets"
      ? "Bracelets"
      : productData.categoryId === "cat-5" || productData.categoryId === "pendants"
      ? "Pendants"
      : productData.categoryId === "cat-6" || productData.categoryId === "bangles"
      ? "Bangles"
      : "Necklaces";

  const categorySlug = categoryName.toLowerCase();

  const categoryObj = productData.category || {
    id: productData.categoryId || "cat-2",
    name: categoryName,
    slug: categorySlug,
    description: `${categoryName} collection`,
    image: null,
    parentId: null,
    position: 1,
    isActive: true,
  };

  const newProduct: DynamicProduct = {
    id,
    name: productData.name || "Jewelry Piece",
    slug,
    sku: productData.sku || `CJ-${Math.floor(100000 + Math.random() * 900000)}`,
    barcode: productData.barcode || null,
    price: Number(productData.price || 0),
    compareAtPrice: productData.compareAtPrice ? Number(productData.compareAtPrice) : null,
    costPrice: productData.costPrice ? Number(productData.costPrice) : null,
    material: productData.material || "Stainless Steel",
    weight: productData.weight || null,
    purity: productData.purity || null,
    stoneType: productData.stoneType || null,
    stoneWeight: productData.stoneWeight || null,
    dimensions: productData.dimensions || null,
    careInstructions: productData.careInstructions || null,
    shippingDetails: productData.shippingDetails || null,
    warranty: productData.warranty || null,
    lowStockWarning: productData.lowStockWarning ? Number(productData.lowStockWarning) : 5,
    status: productData.status || "PUBLISHED",
    description: productData.description || `${productData.name} - Fashion jewelry piece.`,
    shortDescription: productData.shortDescription || "",
    categoryId: productData.categoryId || "cat-2",
    category: categoryObj,
    images: imageList,
    variants: [
      {
        id: `var-${id}-std`,
        name: "Standard",
        sku: `${productData.sku || id}-STD`,
        price: Number(productData.price || 0),
        compareAtPrice: productData.compareAtPrice ? Number(productData.compareAtPrice) : null,
        material: productData.material || "Stainless Steel",
        size: null,
        weight: productData.weight || null,
        stock: Number(productData.variants?.[0]?.stock ?? 10),
        productId: id,
        isActive: true,
      },
    ],
    tags: Array.isArray(productData.tags) ? productData.tags : [],
    metaTitle: productData.metaTitle || null,
    metaDescription: productData.metaDescription || null,
    ogImage: productData.ogImage || null,
    canonicalUrl: productData.canonicalUrl || null,
    keywords: Array.isArray(productData.keywords) ? productData.keywords : [],
    isFeatured: Boolean(productData.isFeatured),
    isNewArrival: productData.isNewArrival !== undefined ? Boolean(productData.isNewArrival) : true,
    isBestSeller: Boolean(productData.isBestSeller),
    isActive: productData.status ? productData.status === "PUBLISHED" : true,
    averageRating: productData.averageRating || 5.0,
    reviewCount: productData.reviewCount || 1,
    createdAt: existingIndex >= 0 ? store[existingIndex].createdAt : now,
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    store[existingIndex] = newProduct;
  } else {
    store.unshift(newProduct);
  }

  globalStore.__dynamicProductsStore = store;
  saveProductsToFile(store);

  return newProduct;
}

export function softDeleteDynamicProduct(id: string): boolean {
  const store = getDynamicProducts();
  const product = store.find((p) => p.id === id);
  if (product) {
    product.isActive = false;
    product.status = "ARCHIVED";
    product.deletedAt = new Date().toISOString();
    globalStore.__dynamicProductsStore = store;
    saveProductsToFile(store);
    return true;
  }
  return false;
}
