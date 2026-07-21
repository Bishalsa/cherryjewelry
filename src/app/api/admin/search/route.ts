import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        products: [],
        orders: [],
        customers: [],
        categories: [],
      });
    }

    const [products, orders, customers, categories] = await Promise.all([
      prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { sku: { contains: query, mode: "insensitive" } },
            { material: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
        include: { images: true, category: true },
      }),
      prisma.order.findMany({
        where: {
          OR: [
            { orderNumber: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { phone: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { phone: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
      prisma.category.findMany({
        where: {
          name: { contains: query, mode: "insensitive" },
        },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      success: true,
      products,
      orders,
      customers,
      categories,
    });
  } catch (error: any) {
    console.error("Global Admin Search Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Search failed" },
      { status: 500 }
    );
  }
}
