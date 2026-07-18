import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Shadowfax Webhook Payload:", body);

    const { client_order_number, awb, status } = body;

    if (!client_order_number) {
      return NextResponse.json({ error: "Missing client_order_number" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber: client_order_number },
    });

    if (!order) {
      console.warn(`Order not found for client_order_number: ${client_order_number}`);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Map Shadowfax delivery statuses to database OrderStatus enum
    let newStatus = order.status;
    const lowerStatus = status?.toLowerCase();

    if (lowerStatus === "picked_up" || lowerStatus === "in_transit") {
      newStatus = "SHIPPED";
    } else if (lowerStatus === "out_for_delivery") {
      newStatus = "OUT_FOR_DELIVERY";
    } else if (lowerStatus === "delivered") {
      newStatus = "DELIVERED";
    } else if (lowerStatus === "cancelled") {
      newStatus = "CANCELLED";
    } else if (lowerStatus === "returned" || lowerStatus === "rto") {
      newStatus = "RETURNED";
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: newStatus,
        trackingNumber: order.trackingNumber || awb || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Shadowfax Webhook Handler Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
