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
      description,
      shortDescription,
      price,
      compareAtPrice,
      sku,
      material,
      weight,
      purity,
      categoryId,
      imageUrl,
      initialStock = 10,
    } = body;

    if (!name || !price || !sku || !categoryId || !material) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
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
    let slug = slugify(name, { lower: true, strict: true });
    // Check if slug is unique
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

    // Create product in transaction
    const product = await prisma.$transaction(async (tx) => {
      // 1. Create Product
      const newProduct = await tx.product.create({
        data: {
          name,
          slug,
          description,
          shortDescription: shortDescription || "",
          price: Number(price),
          compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
          sku,
          material,
          weight: weight || null,
          purity: purity || null,
          categoryId,
          isActive: true,
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
          material,
          weight: weight || null,
          isActive: true,
        },
      });

      // 3. Create Inventory for the variant
      await tx.inventory.create({
        data: {
          variantId: defaultVariant.id,
          warehouseId: warehouse!.id,
          quantity: Number(initialStock),
          lowStockThreshold: 5,
        },
      });

      // 4. Create Product Image if URL provided
      if (imageUrl) {
        await tx.productImage.create({
          data: {
            productId: newProduct.id,
            url: imageUrl,
            alt: name,
            position: 0,
          },
        });
      }

      return newProduct;
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Products POST API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
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
      description,
      shortDescription,
      price,
      compareAtPrice,
      sku,
      material,
      weight,
      purity,
      categoryId,
      imageUrl,
      stock,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing product ID" },
        { status: 400 }
      );
    }

    const product = await prisma.$transaction(async (tx) => {
      // 1. Update Product
      const updatedProduct = await tx.product.update({
        where: { id },
        data: {
          name,
          description,
          shortDescription,
          price: price ? Number(price) : undefined,
          compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
          sku,
          material,
          weight,
          purity,
          categoryId,
        },
      });

      // 2. If image is updated, update or create it
      if (imageUrl) {
        const existingImage = await tx.productImage.findFirst({
          where: { productId: id },
        });

        if (existingImage) {
          await tx.productImage.update({
            where: { id: existingImage.id },
            data: { url: imageUrl, alt: name || "" },
          });
        } else {
          await tx.productImage.create({
            data: { productId: id, url: imageUrl, alt: name || "", position: 0 },
          });
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
            price: price ? Number(price) : undefined,
            compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
          },
        });

        if (stock !== undefined) {
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
  } catch (error) {
    console.error("Products PUT API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
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
