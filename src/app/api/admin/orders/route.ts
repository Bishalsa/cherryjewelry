import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { sendShippingConfirmationEmail } from "@/lib/email";
import { getDynamicOrders, updateDynamicOrder } from "@/lib/dynamic-store";

export async function GET() {
  let dbOrders: any[] = [];
  try {
    dbOrders = await prisma.order.findMany({
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.warn("Orders GET DB Warning (falling back to dynamic store):", error);
  }

  const dynamicOrders = getDynamicOrders();
  const orderMap = new Map<string, any>();

  // Add DB orders
  for (const o of dbOrders) {
    orderMap.set(o.orderNumber || o.id, o);
  }
  // Overlay dynamic orders (if any punched recently)
  for (const doItem of dynamicOrders) {
    if (!orderMap.has(doItem.orderNumber) && !orderMap.has(doItem.id)) {
      orderMap.set(doItem.orderNumber || doItem.id, doItem);
    }
  }

  const orders = Array.from(orderMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json({ success: true, orders });
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, status, paymentStatus, courierName, trackingNumber, trackingUrl } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing order ID" },
        { status: 400 }
      );
    }

    const dataToUpdate: Record<string, unknown> = {};
    if (status) dataToUpdate.status = status as OrderStatus;
    if (paymentStatus) dataToUpdate.paymentStatus = paymentStatus as PaymentStatus;

    if (courierName !== undefined) dataToUpdate.courierName = courierName;
    if (trackingNumber !== undefined) dataToUpdate.trackingNumber = trackingNumber;
    if (trackingUrl !== undefined) dataToUpdate.trackingUrl = trackingUrl;

    // Update timestamp based on status transitions
    if (status === "SHIPPED") {
      dataToUpdate.shippedAt = new Date();
    } else if (status === "DELIVERED") {
      dataToUpdate.deliveredAt = new Date();
      dataToUpdate.paymentStatus = "PAID" as PaymentStatus; // automatically mark paid on delivery
    } else if (status === "CANCELLED") {
      dataToUpdate.cancelledAt = new Date();
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: dataToUpdate,
      include: {
        items: true,
      },
    });

    // Send shipping confirmation email if order was marked as SHIPPED
    if (status === "SHIPPED") {
      try {
        const customerName = updatedOrder.shippingData
          ? (updatedOrder.shippingData as any).firstName || "Customer"
          : "Customer";

        await sendShippingConfirmationEmail({
          email: updatedOrder.email,
          orderNumber: updatedOrder.orderNumber,
          customerName,
          courierName: updatedOrder.courierName || "Shiprocket",
          trackingNumber: updatedOrder.trackingNumber || "N/A",
          trackingUrl: updatedOrder.trackingUrl || undefined,
        });
      } catch (emailErr) {
        console.error("Failed to send shipping confirmation email:", emailErr);
      }
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Orders PUT API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order" },
      { status: 500 }
    );
  }
}
