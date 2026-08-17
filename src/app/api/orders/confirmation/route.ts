import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getDynamicOrders } from "@/lib/dynamic-store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Missing Order ID parameter" },
        { status: 400 }
      );
    }

    // Try DB first
    let order: any = null;
    try {
      order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
          orderNumber: true,
          createdAt: true,
          paymentMethod: true,
          total: true,
          email: true,
          phone: true,
          status: true,
          paymentStatus: true,
        },
      });
    } catch (dbErr) {
      console.warn("Order confirmation DB error:", dbErr);
    }

    // Fallback to dynamic orders store
    if (!order) {
      const dynamicOrders = getDynamicOrders();
      const dynamicMatch = dynamicOrders.find(
        (o) => o.id === orderId || o.orderNumber === orderId
      );
      if (dynamicMatch) {
        order = {
          orderNumber: dynamicMatch.orderNumber,
          createdAt: dynamicMatch.createdAt,
          paymentMethod: dynamicMatch.paymentMethod,
          total: dynamicMatch.total,
          email: dynamicMatch.email,
          phone: dynamicMatch.phone,
          status: dynamicMatch.status,
          paymentStatus: dynamicMatch.paymentStatus,
        };
      }
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Order Confirmation GET API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve order confirmation details" },
      { status: 500 }
    );
  }
}
