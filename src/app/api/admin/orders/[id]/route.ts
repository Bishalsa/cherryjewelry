import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { OrderStatus, PaymentStatus } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        shippingAddress: true,
        billingAddress: true,
        items: {
          include: {
            product: {
              include: { images: true },
            },
          },
        },
        payments: true,
        shippingLabels: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, paymentStatus, trackingNumber, courierName, trackingUrl, notes } = body;

    const updateData: any = {};
    if (status) updateData.status = status as OrderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus as PaymentStatus;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
    if (courierName !== undefined) updateData.courierName = courierName;
    if (trackingUrl !== undefined) updateData.trackingUrl = trackingUrl;
    if (notes !== undefined) updateData.notes = notes;

    if (status === "SHIPPED") updateData.shippedAt = new Date();
    if (status === "DELIVERED") updateData.deliveredAt = new Date();
    if (status === "CANCELLED") updateData.cancelledAt = new Date();

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
        user: true,
      },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error("Order PUT Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}
