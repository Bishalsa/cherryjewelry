import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { bookShadowfaxShipment } from "@/lib/shadowfax";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId } = body;

    // 1. Missing fields: return 400
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !orderId) {
      return NextResponse.json(
        { error: "Missing required verification fields" },
        { status: 400 }
      );
    }

    // 2. Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error("RAZORPAY_KEY_SECRET is not defined");
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(text)
      .digest("hex");

    // 3. Compare generated signature with razorpay_signature
    if (generatedSignature !== razorpay_signature) {
      // Signature mismatch: return 400, do NOT mark as paid
      return NextResponse.json(
        { error: "Payment verification failed (Signature mismatch)" },
        { status: 400 }
      );
    }

    // 4. Retrieve order and verify it exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Find the associated payment record
    const payment = await prisma.payment.findFirst({
      where: {
        orderId: order.id,
        gatewayOrderId: razorpay_order_id,
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }

    // If order or payment is already marked as PAID (e.g. if webhook fired first), return success
    if (payment.status === "PAID" || order.paymentStatus === "PAID") {
      return NextResponse.json({ success: true, message: "Payment already processed" });
    }

    // 5. Update Database within a transaction
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "PAID",
          gatewayPaymentId: razorpay_payment_id,
          signature: razorpay_signature,
          paidAt: new Date(),
        },
      }),
      prisma.order.update({
        where: { id: order.id },
        data: {
          status: "CONFIRMED",
          paymentStatus: "PAID",
        },
      }),
    ]);

    // 5b. Shipments will be manually created on Shiprocket after receiving orders.

    // 6. Send Order Confirmation Email
    try {
      await sendOrderConfirmationEmail({
        email: order.email,
        orderNumber: order.orderNumber,
        customerName: order.shippingData ? (order.shippingData as any).firstName : "Customer",
        totalAmount: `₹${order.total.toString()}`,
      });
    } catch (emailErr) {
      // Log email error but do not fail the request
      console.error("Failed to send verification email:", emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify Payment API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
