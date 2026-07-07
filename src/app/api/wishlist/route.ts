import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

async function getAuthUserId() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("user_session");
  return sessionCookie?.value || null;
}

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ success: true, items: [] });
    }

    const dbItems = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: { orderBy: { position: "asc" } },
            variants: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Normalize products to client types
    const items = dbItems.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      price: Number(item.product.price),
      compareAtPrice: item.product.compareAtPrice ? Number(item.product.compareAtPrice) : null,
      sku: item.product.sku,
      material: item.product.material,
      images: item.product.images.map((img) => ({ url: img.url, alt: img.alt })),
      variants: item.product.variants.map((v) => ({ id: v.id, name: v.name, price: Number(v.price) })),
      isActive: item.product.isActive,
    }));

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("Wishlist GET Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ success: false, error: "Missing Product ID" }, { status: 400 });
    }

    const item = await prisma.wishlistItem.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      update: {},
      create: {
        userId,
        productId,
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Wishlist POST Error:", error);
    return NextResponse.json({ success: false, error: "Failed to add to wishlist" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ success: false, error: "Missing Product ID" }, { status: 400 });
    }

    await prisma.wishlistItem.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    return NextResponse.json({ success: true, message: "Removed from wishlist successfully" });
  } catch (error) {
    console.error("Wishlist DELETE Error:", error);
    return NextResponse.json({ success: false, error: "Failed to remove from wishlist" }, { status: 500 });
  }
}
