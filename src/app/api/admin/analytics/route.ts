import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - 7 * 86400000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Revenue calculations
    const todayOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startOfToday },
        paymentStatus: "PAID",
      },
    });
    const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total), 0);

    const weekOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startOfWeek },
        paymentStatus: "PAID",
      },
    });
    const weeklyRevenue = weekOrders.reduce((sum, o) => sum + Number(o.total), 0);

    const monthOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startOfMonth },
        paymentStatus: "PAID",
      },
    });
    const monthlyRevenue = monthOrders.reduce((sum, o) => sum + Number(o.total), 0);

    // 2. Total orders and AOV
    const allPaidOrders = await prisma.order.findMany({
      where: { paymentStatus: "PAID" },
    });
    const totalOrdersCount = await prisma.order.count();
    const totalPaidRevenue = allPaidOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const averageOrderValue = allPaidOrders.length > 0 ? totalPaidRevenue / allPaidOrders.length : 0;

    // 3. Low stock inventory alerts
    const lowStockItems = await prisma.inventory.findMany({
      where: {
        quantity: { lte: 5 },
      },
      include: {
        variant: {
          include: {
            product: {
              include: { images: true },
            },
          },
        },
      },
      take: 10,
    });

    // 4. Pending orders count
    const pendingOrdersCount = await prisma.order.count({
      where: { status: "PENDING" },
    });

    // 5. Best-selling products
    const bestSellers = await prisma.product.findMany({
      where: { isBestSeller: true },
      include: {
        images: true,
        category: true,
      },
      take: 5,
    });

    // 6. Recent orders
    const recentOrders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: true,
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      metrics: {
        todayRevenue,
        weeklyRevenue,
        monthlyRevenue,
        totalOrdersCount,
        averageOrderValue,
        pendingOrdersCount,
        estimatedVisitors: 1420,
        conversionRate: 3.4,
      },
      lowStockItems,
      bestSellers,
      recentOrders,
    });
  } catch (error: any) {
    console.error("Analytics GET Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to calculate analytics" },
      { status: 500 }
    );
  }
}
