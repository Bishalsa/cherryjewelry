import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not defined");
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    // Handle payment.captured event
    if (event.event === "payment.captured") {
      const paymentData = event.payload.payment.entity;
      const rpOrderId = paymentData.order_id;

      // Find the payment record in our DB
      const payment = await prisma.payment.findFirst({
        where: { gatewayOrderId: rpOrderId },
        include: { order: true },
      });

      if (!payment) {
        console.error(`Payment record not found for Razorpay Order ID: ${rpOrderId}`);
        return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
      }

      // Update Payment and Order status
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "PAID",
            gatewayPaymentId: paymentData.id,
            paidAt: new Date(),
            metadata: paymentData as any,
          },
        }),
        prisma.order.update({
          where: { id: payment.orderId },
          data: {
            status: "CONFIRMED",
            paymentStatus: "PAID",
          },
        })
      ]);

      // Send Order Confirmation Email
      await sendOrderConfirmationEmail({
        email: payment.order.email,
        orderNumber: payment.order.orderNumber,
        customerName: payment.order.shippingData ? (payment.order.shippingData as any).firstName : "Customer",
        totalAmount: `₹${payment.order.total.toString()}`,
      });
      
      console.log(`Order ${payment.order.orderNumber} confirmed and paid successfully.`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
