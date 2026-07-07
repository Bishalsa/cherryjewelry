import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch all users
    const users = await prisma.user.findMany({
      include: {
        orders: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Fetch all orders where email is not tied to a registered User (Guest customers)
    const guestOrders = await prisma.order.findMany({
      where: {
        userId: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const customersMap = new Map<string, {
      id: string;
      name: string;
      email: string;
      phone: string;
      ordersCount: number;
      totalSpent: number;
      role: string;
      isGuest: boolean;
      createdAt: Date;
    }>();

    // 1. Process registered users
    for (const u of users) {
      const paidOrders = u.orders.filter((o) => o.paymentStatus === "PAID");
      const totalSpent = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);

      customersMap.set(u.email.toLowerCase(), {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone || "N/A",
        ordersCount: u.orders.length,
        totalSpent,
        role: u.role,
        isGuest: false,
        createdAt: u.createdAt,
      });
    }

    // 2. Process guest customers (from orders that have no userId)
    for (const o of guestOrders) {
      const emailLower = o.email.toLowerCase();
      const orderTotal = o.paymentStatus === "PAID" ? Number(o.total) : 0;

      let name = o.email;
      if (o.shippingData && typeof o.shippingData === "object") {
        const data = o.shippingData as Record<string, unknown>;
        if (data.firstName && data.lastName) {
          name = `${data.firstName} ${data.lastName}`;
        } else if (data.firstName) {
          name = String(data.firstName);
        }
      }

      if (customersMap.has(emailLower)) {
        // If they already exist under users or guest, just increment count & spend
        const existing = customersMap.get(emailLower)!;
        existing.ordersCount += 1;
        existing.totalSpent += orderTotal;
      } else {
        customersMap.set(emailLower, {
          id: o.id,
          name,
          email: o.email,
          phone: o.phone || "N/A",
          ordersCount: 1,
          totalSpent: orderTotal,
          role: "CUSTOMER",
          isGuest: true,
          createdAt: o.createdAt,
        });
      }
    }

    const customers = Array.from(customersMap.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    return NextResponse.json({ success: true, customers });
  } catch (error) {
    console.error("Customers GET Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve customers list" },
      { status: 500 }
    );
  }
}
