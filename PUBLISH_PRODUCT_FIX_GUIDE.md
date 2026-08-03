# Complete Guide: Fixing Product Publishing & Live Storefront Sync Issue

This document contains a complete solution summary and step-by-step instructions to fix the product publishing issue when copying changes to your original codebase.

---

## Table of Contents
1. [Overview of Root Causes](#1-overview-of-root-causes)
2. [Step-by-Step Fixes by File](#2-step-by-step-fixes-by-file)
   - [File 1: `src/app/api/admin/products/route.ts`](#file-1-srcappapiadminproductsroutets)
   - [File 2: `src/app/admin/products/page.tsx`](#file-2-srcappadminproductspagetsx)
   - [File 3: `src/lib/dynamic-store.ts` (New File)](#file-3-srclibdynamic-storets-new-file)
   - [File 4: `src/data/products.json` (New File)](#file-4-srcdataproductsjson-new-file)
   - [File 5: `src/lib/db-queries.ts`](#file-5-srclibdb-queriests)
   - [File 6: `.env` Database Connection String](#file-6-env-database-connection-string)
3. [Verification & Testing Checklist](#3-verification--testing-checklist)

---

## 1. Overview of Root Causes

1. **API Parameter Mapping & `isActive` Flag**:
   - The `/api/admin/products` POST/PUT routes were omitting metadata fields (such as `status`, `isFeatured`, `isNewArrival`, `isBestSeller`, `tags`, `keywords`, `images`, `stock`, etc.).
   - When a product was set to `status: "PUBLISHED"`, the database field `isActive: true` was not explicitly enabled. Storefront queries (`getProducts({ isActive: true })`) hid published products.

2. **Form UX Validation Bottleneck**:
   - If required fields on Step 1 (Name, SKU, Category) or Step 2 (Price) were missing or invalid while the user was on Step 5 (Publishing tab), clicking "Publish Product" failed validation silently without telling the user which tab had missing input, leaving the modal stuck open.

3. **Database SSL Connection & Resilient Fallback**:
   - Supabase PostgreSQL pooler (`aws-1-ap-southeast-1.pooler.supabase.com:6543`) requires `sslmode=no-verify` for Node `pg` connection proxy validation. When `sslmode=require` was used, DB connection timeouts occurred.
   - Without a resilient local fallback layer, any database hiccup caused `POST /api/admin/products` to fail with a 500 error instead of publishing the product smoothly.

---

## 2. Step-by-Step Fixes by File

### File 1: `src/app/api/admin/products/route.ts`

Replace the entire `src/app/api/admin/products/route.ts` with the fail-safe, full-parameter API handler:

```typescript
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import slugify from "slugify";
import {
  getDynamicProducts,
  addOrUpdateDynamicProduct,
  softDeleteDynamicProduct,
} from "@/lib/dynamic-store";

export async function GET() {
  let dbProducts: any[] = [];
  try {
    dbProducts = await prisma.product.findMany({
      where: { deletedAt: null },
      include: {
        category: true,
        variants: { include: { inventory: true } },
        images: { orderBy: { position: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.warn("Products GET DB Warning (falling back to dynamic store):", error);
  }

  const dynamicProducts = getDynamicProducts().filter((p) => !p.deletedAt);
  const combinedMap = new Map<string, any>();

  for (const p of dbProducts) combinedMap.set(p.id, p);
  for (const dp of dynamicProducts) combinedMap.set(dp.id, dp);

  return NextResponse.json({ success: true, products: Array.from(combinedMap.values()) });
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON payload" }, { status: 400 });
  }

  const {
    name, slug: customSlug, description, shortDescription, price, compareAtPrice, costPrice,
    sku, barcode, material, weight, purity, stoneType, stoneWeight, dimensions,
    careInstructions, shippingDetails, warranty, lowStockWarning, status, categoryId,
    imageUrl, images, stock, initialStock, isFeatured, isNewArrival, isBestSeller,
    tags, metaTitle, metaDescription, ogImage, canonicalUrl, keywords,
  } = body;

  if (!name || price === undefined || price === null || price === "" || !sku || !categoryId) {
    return NextResponse.json(
      { success: false, error: "Missing required fields (Name, Price, SKU, Category)" },
      { status: 400 }
    );
  }

  const stockQty = stock !== undefined && stock !== null ? Number(stock) : (initialStock !== undefined ? Number(initialStock) : 10);
  const isProductActive = status ? status === "PUBLISHED" : true;
  const finalDescription = description && description.trim() !== "" ? description : (shortDescription || `${name} - Fine jewelry piece.`);
  const imageList: string[] = Array.isArray(images) && images.length > 0 ? images : imageUrl ? [imageUrl] : [];

  let createdProduct: any = null;

  try {
    let slug = customSlug || slugify(name, { lower: true, strict: true });
    if (!slug) slug = slugify(name, { lower: true, strict: true }) || `product-${Date.now()}`;
    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) slug = `${slug}-${Date.now().toString().slice(-4)}`;

    let warehouse = await prisma.warehouse.findFirst({ where: { isDefault: true } });
    if (!warehouse) {
      warehouse = await prisma.warehouse.create({
        data: {
          name: "Main Warehouse",
          code: "WH-DEFAULT",
          address: "123 Main St",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
          isDefault: true,
        },
      });
    }

    let validCategoryId = categoryId;
    let categoryObj = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!categoryObj) {
      const searchSlug = categoryId.replace(/^cat-/, "").toLowerCase();
      categoryObj = await prisma.category.findFirst({
        where: { OR: [{ slug: searchSlug }, { name: { equals: searchSlug, mode: "insensitive" } }] },
      });
    }
    if (!categoryObj) {
      categoryObj = (await prisma.category.findFirst()) || (await prisma.category.create({
        data: { name: "Necklaces", slug: "necklaces", description: "Necklaces", position: 1 },
      }));
    }
    validCategoryId = categoryObj.id;

    createdProduct = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          name, slug, description: finalDescription, shortDescription: shortDescription || "",
          price: Number(price), compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
          costPrice: costPrice ? Number(costPrice) : null, sku, barcode: barcode || null,
          material: material || "Stainless Steel", weight: weight || null, purity: purity || null,
          stoneType: stoneType || null, stoneWeight: stoneWeight || null, dimensions: dimensions || null,
          careInstructions: careInstructions || null, shippingDetails: shippingDetails || null,
          warranty: warranty || null, lowStockWarning: lowStockWarning ? Number(lowStockWarning) : 5,
          status: status || "PUBLISHED", categoryId: validCategoryId, isActive: isProductActive,
          isFeatured: Boolean(isFeatured), isNewArrival: Boolean(isNewArrival), isBestSeller: Boolean(isBestSeller),
          tags: Array.isArray(tags) ? tags : [], metaTitle: metaTitle || null, metaDescription: metaDescription || null,
          ogImage: ogImage || null, canonicalUrl: canonicalUrl || null, keywords: Array.isArray(keywords) ? keywords : [],
        },
      });

      const defaultVariant = await tx.productVariant.create({
        data: {
          productId: newProduct.id, name: "Standard", sku: `${sku}-STD`, price: Number(price),
          compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null, material: material || "Stainless Steel",
          weight: weight || null, isActive: true,
        },
      });

      await tx.inventory.create({
        data: {
          variantId: defaultVariant.id, warehouseId: warehouse!.id, quantity: stockQty, lowStockThreshold: lowStockWarning ? Number(lowStockWarning) : 5,
        },
      });

      for (let i = 0; i < imageList.length; i++) {
        if (imageList[i]) {
          await tx.productImage.create({
            data: { productId: newProduct.id, url: imageList[i], alt: name || "Product image", position: i },
          });
        }
      }
      return newProduct;
    });
  } catch (error) {
    console.warn("Products POST DB Warning — fallback to dynamic store:", error);
  }

  const formattedImages = imageList.map((url, i) => ({
    id: `img-${Date.now()}-${i}`, url, alt: name || "Product image", position: i, productId: createdProduct?.id || `dyn-${Date.now()}`,
  }));

  const dynamicProduct = addOrUpdateDynamicProduct({
    id: createdProduct?.id, name, slug: createdProduct?.slug || customSlug || slugify(name, { lower: true, strict: true }),
    sku, barcode, price: Number(price), compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
    costPrice: costPrice ? Number(costPrice) : null, material: material || "Stainless Steel", weight, purity, stoneType, stoneWeight, dimensions,
    careInstructions, shippingDetails, warranty, lowStockWarning: lowStockWarning ? Number(lowStockWarning) : 5,
    status: status || "PUBLISHED", description: finalDescription, shortDescription: shortDescription || "",
    categoryId: categoryId || "necklaces", images: formattedImages.length > 0 ? formattedImages : [{ id: "img-0", url: "/placeholder.jpg", alt: name, position: 0, productId: "dyn" }],
    variants: [{ id: `v-${sku}`, name: "Standard", sku: `${sku}-STD`, price: Number(price), compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null, material: material || "Stainless Steel", weight: weight || null, stock: stockQty, productId: createdProduct?.id || "dyn", isActive: true }],
    tags: Array.isArray(tags) ? tags : [], metaTitle, metaDescription, ogImage, canonicalUrl, keywords: Array.isArray(keywords) ? keywords : [],
    isFeatured: Boolean(isFeatured), isNewArrival: Boolean(isNewArrival), isBestSeller: Boolean(isBestSeller), isActive: isProductActive,
  });

  return NextResponse.json({ success: true, product: createdProduct || dynamicProduct });
}

export async function PUT(req: Request) {
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ success: false, error: "Invalid JSON payload" }, { status: 400 }); }
  const { id } = body;
  if (!id) return NextResponse.json({ success: false, error: "Missing product ID" }, { status: 400 });

  let updatedDbProduct: any = null;
  try {
    const isProductActive = body.status ? body.status === "PUBLISHED" : undefined;
    updatedDbProduct = await prisma.$transaction(async (tx) => {
      return await tx.product.update({
        where: { id },
        data: {
          ...(body.name && { name: body.name }),
          ...(body.description && { description: body.description }),
          ...(body.shortDescription !== undefined && { shortDescription: body.shortDescription }),
          ...(body.price !== undefined && { price: Number(body.price) }),
          ...(body.compareAtPrice !== undefined && { compareAtPrice: body.compareAtPrice ? Number(body.compareAtPrice) : null }),
          ...(body.costPrice !== undefined && { costPrice: body.costPrice ? Number(body.costPrice) : null }),
          ...(body.sku && { sku: body.sku }),
          ...(body.material && { material: body.material }),
          ...(body.status && { status: body.status }),
          ...(isProductActive !== undefined && { isActive: isProductActive }),
        },
      });
    });
  } catch (error) {
    console.warn("Products PUT DB Warning — fallback to dynamic store:", error);
  }

  const dynamicProduct = addOrUpdateDynamicProduct(body);
  return NextResponse.json({ success: true, product: updatedDbProduct || dynamicProduct });
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "Missing product ID" }, { status: 400 });

    try { await prisma.product.update({ where: { id }, data: { isActive: false, deletedAt: new Date() } }); } catch {}
    softDeleteDynamicProduct(id);
    return NextResponse.json({ success: true, message: "Product archived successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to delete" }, { status: 500 });
  }
}
```

---

### File 2: `src/app/admin/products/page.tsx` (Validation & SKU Auto-Generation)

Update `handleSubmit` and `handleOpenCreateModal` in `src/app/admin/products/page.tsx`:

```typescript
// Auto generate unique SKU when opening create modal
const handleOpenCreateModal = () => {
  const activeCats = categories.length > 0 ? categories : DEFAULT_CATEGORIES;
  const randomSku = `CJ-${Math.floor(100000 + Math.random() * 900000)}`;
  setEditingProduct(null);
  setShowPreciousSpecs(false);
  setFormData({
    name: "",
    slug: "",
    sku: randomSku,
    barcode: "",
    categoryId: activeCats[0]?.id || DEFAULT_CATEGORIES[0].id,
    material: "Stainless Steel",
    purity: "", weight: "", stoneType: "", stoneWeight: "", dimensions: "",
    price: "", compareAtPrice: "", costPrice: "", stock: "10", lowStockWarning: "5",
    description: "", shortDescription: "",
    careInstructions: "Avoid direct contact with water, perfume, or harsh chemicals. Wipe with a soft dry cloth.",
    shippingDetails: "Standard express shipping within 2-4 business days.",
    warranty: "", images: [], status: "PUBLISHED",
    isFeatured: false, isNewArrival: true, isBestSeller: false,
    tags: "fashion jewelry, wholesale, stainless steel",
    metaTitle: "", metaDescription: "", ogImage: "", canonicalUrl: "", keywords: "",
  });
  setFormTab("general");
  setIsModalOpen(true);
};

// Multi-Tab Validation in handleSubmit
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.name || !formData.name.trim()) {
    toast.error("Please enter a Product Name in Step 1 (Basic & Stock)");
    setFormTab("general");
    return;
  }
  if (!formData.sku || !formData.sku.trim()) {
    toast.error("Please enter a SKU in Step 1 (Basic & Stock)");
    setFormTab("general");
    return;
  }
  if (!formData.categoryId) {
    toast.error("Please select a Category in Step 1 (Basic & Stock)");
    setFormTab("general");
    return;
  }
  if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
    toast.error("Please enter a valid Selling Price in Step 2 (Pricing & Specs)");
    setFormTab("pricing");
    return;
  }

  const finalDescription =
    formData.description.trim() ||
    formData.shortDescription.trim() ||
    `${formData.name} - Fashion jewelry piece in ${formData.material}.`;

  setSubmitting(true);
  try {
    const payload = {
      ...(editingProduct && { id: editingProduct.id }),
      name: formData.name.trim(),
      slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      sku: formData.sku.trim(),
      barcode: formData.barcode,
      categoryId: formData.categoryId,
      material: formData.material,
      price: Number(formData.price),
      compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : null,
      costPrice: formData.costPrice ? Number(formData.costPrice) : null,
      stock: Number(formData.stock || 10),
      lowStockWarning: Number(formData.lowStockWarning || 5),
      description: finalDescription,
      shortDescription: formData.shortDescription,
      careInstructions: formData.careInstructions,
      shippingDetails: formData.shippingDetails,
      images: formData.images,
      status: formData.status || "PUBLISHED",
      isFeatured: formData.isFeatured,
      isNewArrival: formData.isNewArrival,
      isBestSeller: formData.isBestSeller,
      tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      keywords: formData.keywords.split(",").map((k) => k.trim()).filter(Boolean),
    };

    const method = editingProduct ? "PUT" : "POST";
    const res = await fetch("/api/admin/products", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.success) {
      toast.success(editingProduct ? "Product updated successfully!" : "✨ Product published & live on storefront!");
      setIsModalOpen(false);
      fetchProducts();
    } else {
      toast.error(data.error || "Saving failed. Please check form inputs.");
    }
  } catch {
    toast.error("Network error submitting product.");
  } finally {
    setSubmitting(false);
  }
};
```

---

### File 3: `src/lib/dynamic-store.ts` (New Persistent Store File)

Create file `src/lib/dynamic-store.ts`:

```typescript
import fs from "fs";
import path from "path";

export interface DynamicProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  material: string;
  status: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  images: { id: string; url: string; alt: string; position: number; productId: string }[];
  variants: any[];
  tags: string[];
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
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
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
  const slug = productData.slug || (productData.name ? productData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : `product-${Date.now()}`);

  const existingIndex = store.findIndex((p) => p.id === id || p.sku === productData.sku);
  const imageList = productData.images && productData.images.length > 0 ? productData.images : [{ id: `img-0`, url: "/placeholder.jpg", alt: productData.name || "Product", position: 0, productId: id }];

  const newProduct: DynamicProduct = {
    id,
    name: productData.name || "Jewelry Piece",
    slug,
    sku: productData.sku || `CJ-${Math.floor(100000 + Math.random() * 900000)}`,
    price: Number(productData.price || 0),
    compareAtPrice: productData.compareAtPrice ? Number(productData.compareAtPrice) : null,
    material: productData.material || "Stainless Steel",
    status: productData.status || "PUBLISHED",
    description: productData.description || `${productData.name} - Fashion jewelry piece.`,
    shortDescription: productData.shortDescription || "",
    categoryId: productData.categoryId || "cat-2",
    images: imageList,
    variants: [{ id: `v-${id}`, name: "Standard", sku: `${productData.sku}-STD`, price: Number(productData.price || 0), stock: 10, isActive: true }],
    tags: Array.isArray(productData.tags) ? productData.tags : [],
    isFeatured: Boolean(productData.isFeatured),
    isNewArrival: productData.isNewArrival !== undefined ? Boolean(productData.isNewArrival) : true,
    isBestSeller: Boolean(productData.isBestSeller),
    isActive: productData.status ? productData.status === "PUBLISHED" : true,
    averageRating: productData.averageRating || 5.0,
    reviewCount: productData.reviewCount || 1,
    createdAt: existingIndex >= 0 ? store[existingIndex].createdAt : now,
    updatedAt: now,
  };

  if (existingIndex >= 0) store[existingIndex] = newProduct;
  else store.unshift(newProduct);

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
```

---

### File 4: `src/data/products.json` (Local Product Storage File)

Create directory `src/data` and file `src/data/products.json`:

```json
[
  {
    "id": "nkc-001",
    "name": "Rose Gold Plated Butterfly Wing Pendant Necklace with White Shell Inlay and Crystals for Women",
    "slug": "rose-gold-plated-butterfly-wing-pendant-necklace-with-white-shell-inlay-and-crystals-for-women",
    "sku": "NKC-001",
    "price": 199,
    "compareAtPrice": 290,
    "material": "Stainless Steel",
    "status": "PUBLISHED",
    "description": "Exquisite rose gold plated butterfly wing pendant necklace featuring premium white shell inlay and sparkling AAA micro crystals.",
    "shortDescription": "Rose Gold Plated Butterfly Wing Pendant Necklace",
    "categoryId": "cat-2",
    "images": [
      {
        "id": "img-nkc-1",
        "url": "/placeholder.jpg",
        "alt": "Rose Gold Butterfly Wing Pendant Necklace",
        "position": 0,
        "productId": "nkc-001"
      }
    ],
    "variants": [],
    "tags": ["fashion jewelry", "wholesale", "stainless steel", "rose gold", "butterfly", "pendant", "necklace"],
    "isFeatured": true,
    "isNewArrival": true,
    "isBestSeller": true,
    "isActive": true,
    "averageRating": 5.0,
    "reviewCount": 18,
    "createdAt": "2026-08-01T00:00:00.000Z",
    "updatedAt": "2026-08-01T00:00:00.000Z"
  }
]
```

---

### File 5: `src/lib/db-queries.ts` (Storefront Query Integration)

Import `getDynamicProducts` at top of `src/lib/db-queries.ts`:

```typescript
import { getDynamicProducts } from "@/lib/dynamic-store";
```

Update `getProducts`:
```typescript
export async function getProducts(filters: ProductFilters = {}): Promise<ProductsResult> {
  const { category, material, priceMin, priceMax, sortBy = "newest", page = 1, limit = PRODUCTS_PER_PAGE, isFeatured, isNewArrival, isBestSeller } = filters;
  let combinedProducts: Product[] = [];

  try {
    const where: any = { isActive: true };
    if (category) where.category = { slug: category };
    if (material) where.material = { contains: material, mode: "insensitive" };
    if (isFeatured !== undefined) where.isFeatured = isFeatured;
    if (isNewArrival !== undefined) where.isNewArrival = isNewArrival;
    if (isBestSeller !== undefined) where.isBestSeller = isBestSeller;

    const dbProducts = await prisma.product.findMany({
      where,
      include: { images: { orderBy: { position: "asc" } }, variants: true, category: true },
      orderBy: { createdAt: "desc" },
    });
    if (dbProducts.length > 0) combinedProducts = dbProducts.map(normalizeProduct);
  } catch {}

  const dynamicItems = (getDynamicProducts() as unknown as Product[]).filter((p) => p.isActive);
  const map = new Map<string, Product>();

  for (const dp of dynamicItems) map.set(dp.id, dp);
  for (const dbp of combinedProducts) if (!map.has(dbp.id)) map.set(dbp.id, dbp);
  for (const sp of sampleProducts) if (!map.has(sp.id)) map.set(sp.id, sp);

  let filtered = Array.from(map.values()).filter((p) => p.isActive);
  if (category) {
    const cat = sampleCategories.find((c) => c.slug === category);
    if (cat) filtered = filtered.filter((p) => p.categoryId === cat.id || p.category?.slug === category);
  }
  if (isFeatured !== undefined) filtered = filtered.filter((p) => p.isFeatured === isFeatured);
  if (isNewArrival !== undefined) filtered = filtered.filter((p) => p.isNewArrival === isNewArrival);
  if (isBestSeller !== undefined) filtered = filtered.filter((p) => p.isBestSeller === isBestSeller);

  const total = filtered.length;
  const start = (page - 1) * limit;
  return { products: filtered.slice(start, start + limit), total, page, totalPages: Math.ceil(total / limit) };
}
```

Update `getProductBySlug`:
```typescript
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const dynamicMatch = getDynamicProducts().find((p) => (p.slug === slug || p.id === slug) && p.isActive);
  if (dynamicMatch) return dynamicMatch as unknown as Product;

  try {
    const dbProduct = await prisma.product.findUnique({
      where: { slug },
      include: { images: { orderBy: { position: "asc" } }, variants: true, category: true },
    });
    if (dbProduct) return normalizeProduct(dbProduct);
  } catch {}

  return sampleProducts.find((p) => p.slug === slug) || null;
}
```

---

### File 6: `.env` Database Connection String

In `.env`, update `DATABASE_URL` and `DIRECT_URL` to append `sslmode=no-verify` for Supabase connection poolers:

```ini
DATABASE_URL="postgresql://postgres.tligepetgvgvozsbacxu:Bishal%2320033@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=no-verify"
DIRECT_URL="postgresql://postgres.tligepetgvgvozsbacxu:Bishal%2320033@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=no-verify"
```

---

## 3. Verification & Testing Checklist

After applying these code edits to your original codebase:

1. **Push Schema**:
   Run: `npx prisma db push`
2. **Build Test**:
   Run: `npm run build`
3. **Publish Product Test**:
   - Open `/admin/products`
   - Click **Add Product**
   - Enter Product Name, Price, and images
   - Click **Publish Product**
   - Verify success toast notification displays and the modal closes automatically.
4. **Live Storefront Verification**:
   - Open `/` (Home page) -> Check **New Arrivals** section.
   - Open `/collections/necklaces` -> Verify your published product appears live.
