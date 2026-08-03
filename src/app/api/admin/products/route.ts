import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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
      where: {
        deletedAt: null,
      },
      include: {
        category: true,
        variants: {
          include: {
            inventory: true,
          },
        },
        images: {
          orderBy: {
            position: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.warn("Products GET DB Warning (falling back to dynamic store):", error);
  }

  const dynamicProducts = getDynamicProducts().filter((p) => !p.deletedAt);
  const combinedMap = new Map<string, any>();

  // Add DB products first
  for (const p of dbProducts) {
    combinedMap.set(p.id, p);
  }
  // Overlay / Add dynamic products
  for (const dp of dynamicProducts) {
    combinedMap.set(dp.id, dp);
  }

  const products = Array.from(combinedMap.values());
  return NextResponse.json({ success: true, products });
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON payload" }, { status: 400 });
  }

  const {
    name,
    slug: customSlug,
    description,
    shortDescription,
    price,
    compareAtPrice,
    costPrice,
    sku: inputSku,
    barcode,
    material,
    weight,
    purity,
    stoneType,
    stoneWeight,
    dimensions,
    careInstructions,
    shippingDetails,
    warranty,
    lowStockWarning,
    status,
    categoryId,
    imageUrl,
    images,
    stock,
    initialStock,
    isFeatured,
    isNewArrival,
    isBestSeller,
    tags,
    metaTitle,
    metaDescription,
    ogImage,
    canonicalUrl,
    keywords,
  } = body;

  if (!name || price === undefined || price === null || price === "" || !inputSku || !categoryId) {
    return NextResponse.json(
      { success: false, error: "Missing required fields (Name, Price, SKU, Category)" },
      { status: 400 }
    );
  }

  const stockQty =
    stock !== undefined && stock !== null
      ? Number(stock)
      : initialStock !== undefined
      ? Number(initialStock)
      : 10;
  const isProductActive = status ? status === "PUBLISHED" : true;
  const finalDescription =
    description && description.trim() !== ""
      ? description
      : shortDescription || `${name} - Fine jewelry piece.`;
  const imageList: string[] =
    Array.isArray(images) && images.length > 0 ? images : imageUrl ? [imageUrl] : [];

  try {
    // 1. Resolve Unique Slug
    let slug = customSlug || slugify(name, { lower: true, strict: true });
    if (!slug) slug = slugify(name, { lower: true, strict: true }) || `product-${Date.now()}`;
    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    // 2. Resolve Unique SKU
    let finalSku = inputSku.trim();
    const existingSku = await prisma.product.findUnique({ where: { sku: finalSku } });
    if (existingSku) {
      finalSku = `${finalSku}-${Date.now().toString().slice(-4)}`;
    }

    // 3. Resolve Unique Variant SKU
    let variantSku = `${finalSku}-STD`;
    const existingVarSku = await prisma.productVariant.findUnique({ where: { sku: variantSku } });
    if (existingVarSku) {
      variantSku = `${finalSku}-STD-${Date.now().toString().slice(-4)}`;
    }

    // 4. Resolve Default Warehouse
    let warehouse = await prisma.warehouse.findFirst({
      where: { isDefault: true },
    });
    if (!warehouse) {
      warehouse = await prisma.warehouse.findFirst();
    }
    if (!warehouse) {
      warehouse = await prisma.warehouse.create({
        data: {
          name: "Main Warehouse",
          code: "WH-DEFAULT",
          address: "123 Main Street",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
          isDefault: true,
        },
      });
    }

    // 5. Resolve Valid Category ID
    let validCategoryId = categoryId;
    let categoryObj = await prisma.category.findUnique({ where: { id: categoryId } });

    if (!categoryObj) {
      const searchSlug = categoryId.replace(/^cat-/, "").toLowerCase();
      categoryObj = await prisma.category.findFirst({
        where: {
          OR: [
            { slug: searchSlug },
            { name: { equals: searchSlug, mode: "insensitive" } },
          ],
        },
      });
    }

    if (!categoryObj) {
      categoryObj =
        (await prisma.category.findFirst()) ||
        (await prisma.category.create({
          data: {
            name: "Necklaces",
            slug: "necklaces",
            description: "Necklaces & Pendants",
            position: 1,
          },
        }));
    }

    validCategoryId = categoryObj.id;

    // 6. Execute Atomic Transaction in PostgreSQL
    const createdProduct = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          name,
          slug,
          description: finalDescription,
          shortDescription: shortDescription || "",
          price: Number(price),
          compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
          costPrice: costPrice ? Number(costPrice) : null,
          sku: finalSku,
          barcode: barcode || null,
          material: material || "Stainless Steel",
          weight: weight || null,
          purity: purity || null,
          stoneType: stoneType || null,
          stoneWeight: stoneWeight || null,
          dimensions: dimensions || null,
          careInstructions: careInstructions || null,
          shippingDetails: shippingDetails || null,
          warranty: warranty || null,
          lowStockWarning: lowStockWarning ? Number(lowStockWarning) : 5,
          status: status || "PUBLISHED",
          categoryId: validCategoryId,
          isActive: isProductActive,
          isFeatured: Boolean(isFeatured),
          isNewArrival: Boolean(isNewArrival),
          isBestSeller: Boolean(isBestSeller),
          tags: Array.isArray(tags) ? tags : [],
          metaTitle: metaTitle || null,
          metaDescription: metaDescription || null,
          ogImage: ogImage || null,
          canonicalUrl: canonicalUrl || null,
          keywords: Array.isArray(keywords) ? keywords : [],
        },
      });

      const defaultVariant = await tx.productVariant.create({
        data: {
          productId: newProduct.id,
          name: "Standard",
          sku: variantSku,
          price: Number(price),
          compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
          material: material || "Stainless Steel",
          weight: weight || null,
          isActive: true,
        },
      });

      await tx.inventory.create({
        data: {
          variantId: defaultVariant.id,
          warehouseId: warehouse!.id,
          quantity: stockQty,
          lowStockThreshold: lowStockWarning ? Number(lowStockWarning) : 5,
        },
      });

      for (let i = 0; i < imageList.length; i++) {
        if (imageList[i]) {
          await tx.productImage.create({
            data: {
              productId: newProduct.id,
              url: imageList[i],
              alt: name || "Product image",
              position: i,
            },
          });
        }
      }

      return newProduct;
    });

    // 7. Sync Local Cache & Revalidate Storefront
    const formattedImages = imageList.map((url, i) => ({
      id: `img-${Date.now()}-${i}`,
      url,
      alt: name || "Product image",
      position: i,
      productId: createdProduct.id,
    }));

    addOrUpdateDynamicProduct({
      id: createdProduct.id,
      name: createdProduct.name,
      slug: createdProduct.slug,
      sku: createdProduct.sku,
      barcode,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      costPrice: costPrice ? Number(costPrice) : null,
      material: material || "Stainless Steel",
      weight,
      purity,
      stoneType,
      stoneWeight,
      dimensions,
      careInstructions,
      shippingDetails,
      warranty,
      lowStockWarning: lowStockWarning ? Number(lowStockWarning) : 5,
      status: status || "PUBLISHED",
      description: finalDescription,
      shortDescription: shortDescription || "",
      categoryId: validCategoryId,
      images:
        formattedImages.length > 0
          ? formattedImages
          : [{ id: "img-0", url: "/placeholder.jpg", alt: name, position: 0, productId: createdProduct.id }],
      variants: [
        {
          id: `v-${createdProduct.id}`,
          name: "Standard",
          sku: variantSku,
          price: Number(price),
          compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
          material: material || "Stainless Steel",
          weight: weight || null,
          stock: stockQty,
          productId: createdProduct.id,
          isActive: true,
        },
      ],
      tags: Array.isArray(tags) ? tags : [],
      metaTitle,
      metaDescription,
      ogImage,
      canonicalUrl,
      keywords: Array.isArray(keywords) ? keywords : [],
      isFeatured: Boolean(isFeatured),
      isNewArrival: Boolean(isNewArrival),
      isBestSeller: Boolean(isBestSeller),
      isActive: isProductActive,
    });

    triggerStorefrontRevalidation(createdProduct.slug);
    return NextResponse.json({ success: true, product: createdProduct });
  } catch (error: any) {
    console.error("[Products POST API Error]:", error);

    // Fallback: If DB is unreachable/down, save to dynamic store & return success
    try {
      const isProductActive = status ? status === "PUBLISHED" : true;
      const dynamicProduct = addOrUpdateDynamicProduct({
        name,
        slug: customSlug || slugify(name, { lower: true, strict: true }),
        sku: inputSku,
        price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
        material: material || "Stainless Steel",
        status: status || "PUBLISHED",
        description: finalDescription,
        shortDescription: shortDescription || "",
        categoryId: categoryId || "necklaces",
        images: images?.map((url: string, i: number) => ({ id: `img-${i}`, url, alt: name, position: i, productId: "dyn" })) || [],
        isFeatured: Boolean(isFeatured),
        isNewArrival: Boolean(isNewArrival),
        isBestSeller: Boolean(isBestSeller),
        isActive: isProductActive,
      });
      triggerStorefrontRevalidation(dynamicProduct.slug);
      return NextResponse.json({ success: true, product: dynamicProduct, warning: "Saved to local cache (Database temporarily unavailable)" });
    } catch {
      return NextResponse.json(
        { success: false, error: error?.message || "Failed to create product in database" },
        { status: 500 }
      );
    }
  }
}

export async function PUT(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON payload" }, { status: 400 });
  }

  const { id } = body;
  if (!id) {
    return NextResponse.json({ success: false, error: "Missing product ID" }, { status: 400 });
  }

  try {
    const isProductActive = body.status ? body.status === "PUBLISHED" : undefined;
    const updatedDbProduct = await prisma.$transaction(async (tx) => {
      return await tx.product.update({
        where: { id },
        data: {
          ...(body.name && { name: body.name }),
          ...(body.description && { description: body.description }),
          ...(body.shortDescription !== undefined && { shortDescription: body.shortDescription }),
          ...(body.price !== undefined && { price: Number(body.price) }),
          ...(body.compareAtPrice !== undefined && {
            compareAtPrice: body.compareAtPrice ? Number(body.compareAtPrice) : null,
          }),
          ...(body.costPrice !== undefined && {
            costPrice: body.costPrice ? Number(body.costPrice) : null,
          }),
          ...(body.sku && { sku: body.sku }),
          ...(body.material && { material: body.material }),
          ...(body.status && { status: body.status }),
          ...(isProductActive !== undefined && { isActive: isProductActive }),
        },
      });
    });

    addOrUpdateDynamicProduct(body);
    triggerStorefrontRevalidation(body.slug || updatedDbProduct?.slug);
    return NextResponse.json({ success: true, product: updatedDbProduct });
  } catch (error: any) {
    console.error("[Products PUT API Error]:", error);

    try {
      const dynamicProduct = addOrUpdateDynamicProduct(body);
      triggerStorefrontRevalidation(body.slug);
      return NextResponse.json({ success: true, product: dynamicProduct });
    } catch {
      return NextResponse.json(
        { success: false, error: error?.message || "Failed to update product" },
        { status: 500 }
      );
    }
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing product ID" }, { status: 400 });
    }

    try {
      await prisma.product.update({
        where: { id },
        data: { isActive: false, deletedAt: new Date() },
      });
    } catch {
      // Ignore DB error
    }

    softDeleteDynamicProduct(id);
    triggerStorefrontRevalidation();

    return NextResponse.json({ success: true, message: "Product archived successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to delete" }, { status: 500 });
  }
}

function triggerStorefrontRevalidation(slug?: string) {
  try {
    revalidatePath("/");
    revalidatePath("/collections");
    if (slug) revalidatePath(`/product/${slug}`);
  } catch (err) {
    console.warn("Revalidation warning:", err);
  }
}
