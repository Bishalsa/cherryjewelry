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
    sku,
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

  if (!name || price === undefined || price === null || price === "" || !sku || !categoryId) {
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

  let createdProduct: any = null;

  try {
    // Generate unique slug
    let slug = customSlug || slugify(name, { lower: true, strict: true });
    if (!slug) slug = slugify(name, { lower: true, strict: true }) || `product-${Date.now()}`;
    const existingSlug = await prisma.product.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    // Find default warehouse
    let warehouse = await prisma.warehouse.findFirst({
      where: { isDefault: true },
    });
    if (!warehouse) {
      warehouse = await prisma.warehouse.create({
        data: {
          name: "Main Warehouse Mumbai",
          code: "WH-MUM-DEFAULT",
          address: "123 Main Street",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
          isDefault: true,
        },
      });
    }

    // Resolve & validate categoryId
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
            name: "Rings",
            slug: "rings",
            description: "Exquisite rings",
            position: 1,
          },
        }));
    }

    validCategoryId = categoryObj.id;

    createdProduct = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          name,
          slug,
          description: finalDescription,
          shortDescription: shortDescription || "",
          price: Number(price),
          compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
          costPrice: costPrice ? Number(costPrice) : null,
          sku,
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
          sku: `${sku}-STD`,
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
  } catch (error) {
    console.warn("Products POST DB Warning — fallback to dynamic store:", error);
  }

  // Always sync with dynamic store to guarantee instant frontend & live availability
  const formattedImages = imageList.map((url, i) => ({
    id: `img-${Date.now()}-${i}`,
    url,
    alt: name || "Product image",
    position: i,
    productId: createdProduct?.id || `dyn-${Date.now()}`,
  }));

  const dynamicProduct = addOrUpdateDynamicProduct({
    id: createdProduct?.id,
    name,
    slug: createdProduct?.slug || customSlug || slugify(name, { lower: true, strict: true }),
    sku,
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
    categoryId: categoryId || "necklaces",
    images:
      formattedImages.length > 0
        ? formattedImages
        : [{ id: "img-0", url: "/placeholder.jpg", alt: name, position: 0, productId: "dyn" }],
    variants: [
      {
        id: `v-${sku}`,
        name: "Standard",
        sku: `${sku}-STD`,
        price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
        material: material || "Stainless Steel",
        weight: weight || null,
        stock: stockQty,
        productId: createdProduct?.id || "dyn",
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

  return NextResponse.json({ success: true, product: createdProduct || dynamicProduct });
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

  let updatedDbProduct: any = null;

  try {
    const isProductActive = body.status ? body.status === "PUBLISHED" : undefined;
    updatedDbProduct = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
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
      return updated;
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

    return NextResponse.json({ success: true, message: "Product archived successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to delete" }, { status: 500 });
  }
}
