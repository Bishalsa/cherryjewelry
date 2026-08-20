import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { bookShadowfaxShipment } from "@/lib/shadowfax";

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

    // Handle payment.captured or order.paid events
    if (event.event === "payment.captured" || event.event === "order.paid") {
      const paymentEntity = event.payload?.payment?.entity || event.payload?.order?.entity;
      const rpOrderId = paymentEntity?.order_id || event.payload?.order?.entity?.id;

      if (rpOrderId) {
        // Find the payment record in our DB
        const payment = await prisma.payment.findFirst({
          where: { gatewayOrderId: rpOrderId },
          include: { order: true },
        });

        if (payment && payment.status !== "PAID") {
          const paymentId = event.payload?.payment?.entity?.id || payment.gatewayPaymentId;

          // Update Payment and Order status
          await prisma.$transaction([
            prisma.payment.update({
              where: { id: payment.id },
              data: {
                status: "PAID",
                ...(paymentId && { gatewayPaymentId: paymentId }),
                paidAt: new Date(),
                metadata: (event.payload?.payment?.entity || event.payload?.order?.entity) as any,
              },
            }),
            prisma.order.update({
              where: { id: payment.orderId },
              data: {
                status: "CONFIRMED",
                paymentStatus: "PAID",
              },
            }),
          ]);

          // Send Order Confirmation Email
          try {
            await sendOrderConfirmationEmail({
              email: payment.order.email,
              orderNumber: payment.order.orderNumber,
              customerName: payment.order.shippingData ? (payment.order.shippingData as any).firstName : "Customer",
              totalAmount: `₹${payment.order.total.toString()}`,
            });
          } catch (emailErr) {
            console.error("Failed to send order confirmation email via webhook:", emailErr);
          }

          console.log(`Order ${payment.order.orderNumber} confirmed and paid via webhook (${event.event}).`);
        }
      }
    }

    // Handle payment.failed event
    if (event.event === "payment.failed") {
      const paymentData = event.payload?.payment?.entity;
      const rpOrderId = paymentData?.order_id;

      if (rpOrderId) {
        const payment = await prisma.payment.findFirst({
          where: { gatewayOrderId: rpOrderId },
        });

        if (payment && payment.status === "PENDING") {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: "FAILED",
              gatewayPaymentId: paymentData?.id || null,
              metadata: paymentData as any,
            },
          });
          console.log(`Payment marked as FAILED for order: ${payment.orderId}`);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
