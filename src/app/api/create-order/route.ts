import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, currency = "INR", receipt, notes } = body;

    // Validate amount presence
    if (amount === undefined || amount === null || isNaN(Number(amount))) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    const numericAmount = Number(amount);

    // Amount should be at least 100 paise (1 INR)
    if (numericAmount < 100) {
      return NextResponse.json(
        { error: "Amount must be at least 100 paise (1 INR)" },
        { status: 400 }
      );
    }

    // Call Razorpay API to create order
    const order = await razorpay.orders.create({
      amount: Math.round(numericAmount),
      currency: currency || "INR",
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || {},
    });

    return NextResponse.json({
      success: true,
      order_id: order.id,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    });
  } catch (error: any) {
    console.error("Razorpay Create Order Error:", error);

    // Handle authentication failures (401)
    if (
      error?.statusCode === 401 ||
      error?.error?.code === "AUTHENTICATION_ERROR" ||
      error?.message?.includes("Authentication failed")
    ) {
      return NextResponse.json(
        { error: "Payment gateway authentication failed" },
        { status: 401 }
      );
    }

    // Handle Razorpay API errors (500)
    return NextResponse.json(
      {
        error:
          error?.error?.description ||
          error?.message ||
          "Failed to create Razorpay order",
      },
      { status: 500 }
    );
  }
}
