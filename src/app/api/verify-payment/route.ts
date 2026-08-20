import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId } = body;

    // 1. Missing fields check: return 400
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required fields: razorpay_payment_id, razorpay_order_id, and razorpay_signature are required" },
        { status: 400 }
      );
    }

    // 2. Secret check
    const secret = process.env.RAZORPAY_KEY_SECRET || "kLeJ1C4nV19Xx7fI6cks0ME6";

    // 3. Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(text)
      .digest("hex");

    // 4. Compare generated signature with razorpay_signature
    if (generatedSignature !== razorpay_signature) {
      // Signature mismatch: return 400, do NOT mark as paid
      return NextResponse.json(
        { success: false, error: "Payment verification failed: Signature mismatch" },
        { status: 400 }
      );
    }

    // 5. If an internal database order is associated, update database
    if (orderId) {
      try {
        const order = await prisma.order.findUnique({
          where: { id: orderId },
        });

        if (order) {
          const payment = await prisma.payment.findFirst({
            where: {
              orderId: order.id,
              gatewayOrderId: razorpay_order_id,
            },
          });

          if (payment && payment.status !== "PAID") {
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
          }

          // Trigger confirmation email
          try {
            await sendOrderConfirmationEmail({
              email: order.email,
              orderNumber: order.orderNumber,
              customerName: order.shippingData ? (order.shippingData as any).firstName : "Customer",
              totalAmount: `₹${order.total.toString()}`,
            });
          } catch (emailErr) {
            console.error("Failed to send verification email:", emailErr);
          }
        }
      } catch (dbError) {
        console.warn("Database update during payment verification skipped/errored:", dbError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
    });
  } catch (error: any) {
    console.error("Verify Payment API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error during verification" },
      { status: 500 }
    );
  }
}
