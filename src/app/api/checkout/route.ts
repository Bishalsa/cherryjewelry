import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import prisma from "@/lib/prisma";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, contactInfo, shippingAddress, paymentMethod, orderNotes } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // 1. Calculate subtotal securely from the database
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      // Fetch fresh product data to prevent price tampering
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true }
      });

      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 404 });
      }

      let price = Number(product.price);
      let variant = null;
      let sku = product.sku;
      let name = product.name;

      if (item.variantId) {
        variant = product.variants.find(v => v.id === item.variantId);
        if (variant) {
          price = Number(variant.price);
          sku = variant.sku;
          name = `${product.name} - ${variant.name}`;
        }
      }

      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product.id,
        variantId: variant?.id || null,
        name: name,
        sku: sku,
        image: "", // You could fetch the first image URL here
        price: price,
        quantity: item.quantity,
        total: itemTotal,
      });
    }

    // 2. Calculate shipping and total
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const total = subtotal + shipping;

    // 3. Generate unique order number
    const orderNumber = `LUM-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    // 4. Create Order in Database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        email: contactInfo.email,
        phone: contactInfo.phone,
        status: "PENDING",
        paymentStatus: "PENDING",
        paymentMethod: paymentMethod === "razorpay" ? "RAZORPAY" : "COD",
        subtotal,
        shipping,
        tax: 0,
        discount: 0,
        total,
        notes: orderNotes,
        shippingData: shippingAddress,
        items: {
          create: orderItems,
        },
      },
    });

    // 5. Handle Payment Method
    if (paymentMethod === "razorpay") {
      try {
        const rpOrder = await razorpay.orders.create({
          amount: Math.round(total * 100), // Razorpay expects amount in paise
          currency: "INR",
          receipt: order.id,
          notes: {
            orderNumber: order.orderNumber,
          },
        });

        // Save the Razorpay Order ID to the DB
        await prisma.payment.create({
          data: {
            orderId: order.id,
            gateway: "razorpay",
            gatewayOrderId: rpOrder.id,
            method: "RAZORPAY",
            status: "PENDING",
            amount: total,
            currency: "INR",
          }
        });

        return NextResponse.json({
          success: true,
          orderId: order.id,
          orderNumber: order.orderNumber,
          payment: {
            provider: "razorpay",
            id: rpOrder.id,
            amount: rpOrder.amount,
            currency: rpOrder.currency,
          }
        });
      } catch (rpError) {
        console.error("Razorpay error:", rpError);
        return NextResponse.json({ error: "Failed to initialize payment gateway" }, { status: 500 });
      }
    } else {
      // COD Logic
      return NextResponse.json({
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        payment: { provider: "cod" }
      });
    }
  } catch (error) {
    console.error("Checkout API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
