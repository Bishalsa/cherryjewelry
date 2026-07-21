import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { position: "asc" } },
        variants: { include: { inventory: true } },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { action } = await req.json();

    if (action === "duplicate") {
      const original = await prisma.product.findUnique({
        where: { id },
        include: { images: true, variants: { include: { inventory: true } } },
      });

      if (!original) {
        return NextResponse.json(
          { success: false, error: "Original product not found" },
          { status: 404 }
        );
      }

      const timestamp = Date.now().toString().slice(-4);
      const newSku = `${original.sku}-COPY-${timestamp}`;
      const newSlug = `${original.slug}-copy-${timestamp}`;
      const newName = `${original.name} (Copy)`;

      const duplicated = await prisma.product.create({
        data: {
          name: newName,
          slug: newSlug,
          description: original.description,
          shortDescription: original.shortDescription,
          price: original.price,
          compareAtPrice: original.compareAtPrice,
          costPrice: original.costPrice,
          sku: newSku,
          barcode: original.barcode,
          material: original.material,
          weight: original.weight,
          purity: original.purity,
          stoneType: original.stoneType,
          stoneWeight: original.stoneWeight,
          dimensions: original.dimensions,
          careInstructions: original.careInstructions,
          shippingDetails: original.shippingDetails,
          warranty: original.warranty,
          lowStockWarning: original.lowStockWarning,
          status: "DRAFT",
          categoryId: original.categoryId,
          tags: original.tags,
          metaTitle: original.metaTitle,
          metaDescription: original.metaDescription,
          ogImage: original.ogImage,
          canonicalUrl: original.canonicalUrl,
          keywords: original.keywords,
          isFeatured: false,
          isNewArrival: true,
          isBestSeller: false,
          isActive: true,
        },
      });

      // Duplicate images
      if (original.images.length > 0) {
        await prisma.productImage.createMany({
          data: original.images.map((img) => ({
            productId: duplicated.id,
            url: img.url,
            alt: img.alt,
            position: img.position,
          })),
        });
      }

      // Duplicate variant & inventory
      const defaultVariant = original.variants[0];
      const newVariant = await prisma.productVariant.create({
        data: {
          productId: duplicated.id,
          name: defaultVariant?.name || "Standard",
          sku: `${newSku}-STD`,
          price: defaultVariant?.price || original.price,
          compareAtPrice: defaultVariant?.compareAtPrice || original.compareAtPrice,
          material: original.material,
          weight: original.weight,
          isActive: true,
        },
      });

      const warehouse = await prisma.warehouse.findFirst({ where: { isDefault: true } });
      if (warehouse) {
        const origInv = defaultVariant?.inventory?.[0]?.quantity || 10;
        await prisma.inventory.create({
          data: {
            variantId: newVariant.id,
            warehouseId: warehouse.id,
            quantity: origInv,
            lowStockThreshold: 5,
          },
        });
      }

      return NextResponse.json({ success: true, product: duplicated });
    }

    if (action === "restore") {
      const restored = await prisma.product.update({
        where: { id },
        data: {
          deletedAt: null,
          isActive: true,
          status: "PUBLISHED",
        },
      });
      return NextResponse.json({ success: true, product: restored });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Operation failed" },
      { status: 500 }
    );
  }
}
