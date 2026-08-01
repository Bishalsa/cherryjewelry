import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import slugify from "slugify";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
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

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("Products GET API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve products" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
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

    // Check if SKU is unique
    const existingProduct = await prisma.product.findUnique({
      where: { sku },
    });
    if (existingProduct) {
      return NextResponse.json(
        { success: false, error: "A product with this SKU already exists" },
        { status: 409 }
      );
    }

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

    // Resolve & validate categoryId to ensure foreign key constraint passes
    let validCategoryId = categoryId;
    let categoryObj = await prisma.category.findUnique({ where: { id: categoryId } });

    if (!categoryObj) {
      // Try finding category by slug or name
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
      // Auto-create or find first category in DB
      categoryObj = (await prisma.category.findFirst()) || (await prisma.category.create({
        data: {
          name: "Rings",
          slug: "rings",
          description: "Exquisite rings",
          position: 1,
        },
      }));
    }

    validCategoryId = categoryObj.id;

    const stockQty = stock !== undefined && stock !== null ? Number(stock) : (initialStock !== undefined ? Number(initialStock) : 10);
    const isProductActive = status ? status === "PUBLISHED" : true;
    const finalDescription = description && description.trim() !== "" ? description : (shortDescription || `${name} - Fine handcrafted jewelry.`);

    // Create product in transaction
    const product = await prisma.$transaction(async (tx) => {
      // 1. Create Product
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
          material: material || "Gold",
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

      // 2. Create Default Variant
      const defaultVariant = await tx.productVariant.create({
        data: {
          productId: newProduct.id,
          name: "Standard",
          sku: `${sku}-STD`,
          price: Number(price),
          compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
          material: material || "Gold",
          weight: weight || null,
          isActive: true,
        },
      });

      // 3. Create Inventory for the variant
      await tx.inventory.create({
        data: {
          variantId: defaultVariant.id,
          warehouseId: warehouse!.id,
          quantity: stockQty,
          lowStockThreshold: lowStockWarning ? Number(lowStockWarning) : 5,
        },
      });

      // 4. Create Product Images if provided
      const imageList: string[] = Array.isArray(images) && images.length > 0
        ? images
        : imageUrl ? [imageUrl] : [];

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

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("Products POST API Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
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

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing product ID" },
        { status: 400 }
      );
    }

    const isProductActive = status ? status === "PUBLISHED" : undefined;

    const product = await prisma.$transaction(async (tx) => {
      // 1. Update Product
      const updatedProduct = await tx.product.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(customSlug && { slug: customSlug }),
          ...(description && { description }),
          ...(shortDescription !== undefined && { shortDescription }),
          ...(price !== undefined && { price: Number(price) }),
          ...(compareAtPrice !== undefined && { compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null }),
          ...(costPrice !== undefined && { costPrice: costPrice ? Number(costPrice) : null }),
          ...(sku && { sku }),
          ...(barcode !== undefined && { barcode }),
          ...(material && { material }),
          ...(weight !== undefined && { weight }),
          ...(purity !== undefined && { purity }),
          ...(stoneType !== undefined && { stoneType }),
          ...(stoneWeight !== undefined && { stoneWeight }),
          ...(dimensions !== undefined && { dimensions }),
          ...(careInstructions !== undefined && { careInstructions }),
          ...(shippingDetails !== undefined && { shippingDetails }),
          ...(warranty !== undefined && { warranty }),
          ...(lowStockWarning !== undefined && { lowStockWarning: Number(lowStockWarning) }),
          ...(status && { status }),
          ...(isProductActive !== undefined && { isActive: isProductActive }),
          ...(categoryId && { categoryId }),
          ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
          ...(isNewArrival !== undefined && { isNewArrival: Boolean(isNewArrival) }),
          ...(isBestSeller !== undefined && { isBestSeller: Boolean(isBestSeller) }),
          ...(tags !== undefined && { tags: Array.isArray(tags) ? tags : [] }),
          ...(metaTitle !== undefined && { metaTitle }),
          ...(metaDescription !== undefined && { metaDescription }),
          ...(ogImage !== undefined && { ogImage }),
          ...(canonicalUrl !== undefined && { canonicalUrl }),
          ...(keywords !== undefined && { keywords: Array.isArray(keywords) ? keywords : [] }),
        },
      });

      // 2. Handle images
      const imageList: string[] = Array.isArray(images) && images.length > 0
        ? images
        : imageUrl ? [imageUrl] : [];

      if (imageList.length > 0) {
        await tx.productImage.deleteMany({
          where: { productId: id },
        });
        for (let i = 0; i < imageList.length; i++) {
          if (imageList[i]) {
            await tx.productImage.create({
              data: {
                productId: id,
                url: imageList[i],
                alt: name || updatedProduct.name || "Product image",
                position: i,
              },
            });
          }
        }
      }

      // 3. Update standard variant and inventory if stock is provided
      const standardVariant = await tx.productVariant.findFirst({
        where: { productId: id, name: "Standard" },
      });

      if (standardVariant) {
        await tx.productVariant.update({
          where: { id: standardVariant.id },
          data: {
            ...(price !== undefined && { price: Number(price) }),
            ...(compareAtPrice !== undefined && { compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null }),
            ...(material && { material }),
            ...(weight !== undefined && { weight }),
          },
        });

        if (stock !== undefined && stock !== null) {
          const inventory = await tx.inventory.findFirst({
            where: { variantId: standardVariant.id },
          });

          if (inventory) {
            await tx.inventory.update({
              where: { id: inventory.id },
              data: { quantity: Number(stock) },
            });
          }
        }
      }

      return updatedProduct;
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("Products PUT API Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing product ID" },
        { status: 400 }
      );
    }

    // Soft delete
    const product = await prisma.product.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product soft-deleted successfully",
      product,
    });
  } catch (error) {
    console.error("Products DELETE API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
