import { Order } from "@prisma/client";

const isConfigured =
  (!!process.env.SHADOWFAX_TOKEN || (!!process.env.SHADOWFAX_CLIENT_ID && !!process.env.SHADOWFAX_CLIENT_SECRET)) &&
  !!process.env.SHADOWFAX_API_BASE_URL;

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

export async function getShadowfaxAuthHeader(): Promise<string> {
  if (process.env.SHADOWFAX_TOKEN) {
    return `Token ${process.env.SHADOWFAX_TOKEN}`;
  }

  if (!isConfigured) {
    return "Token mock_token";
  }

  if (cachedToken && Date.now() < tokenExpiry) {
    return `Bearer ${cachedToken}`;
  }

  try {
    const res = await fetch(`${process.env.SHADOWFAX_API_BASE_URL}/oauth/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.SHADOWFAX_CLIENT_ID,
        client_secret: process.env.SHADOWFAX_CLIENT_SECRET,
        grant_type: "client_credentials",
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch OAuth token: ${res.statusText}`);
    }

    const data = await res.json();
    cachedToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return `Bearer ${cachedToken!}`;
  } catch (error) {
    console.error("Shadowfax authentication error:", error);
    throw error;
  }
}

export async function checkShadowfaxServiceability(pincode: string): Promise<{ serviceable: boolean; tat_days?: number }> {
  if (!isConfigured) {
    console.warn("Shadowfax is not configured. Falling back to mock serviceability.");
    // Simulate some unserviceable pincodes for testing (e.g. 000000 or anything starting with 999)
    if (pincode === "000000" || pincode.startsWith("999")) {
      return { serviceable: false };
    }
    return { serviceable: true, tat_days: 3 };
  }

  try {
    const authHeader = await getShadowfaxAuthHeader();
    const res = await fetch(
      `${process.env.SHADOWFAX_API_BASE_URL}/api/v2/serviceability?pincode=${pincode}`,
      {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Serviceability check failed: ${res.statusText}`);
    }

    const data = await res.json();
    return {
      serviceable: !!data.serviceable,
      tat_days: data.tat_days || data.tat,
    };
  } catch (error) {
    console.error("Shadowfax serviceability check error:", error);
    // In production, we'll default to serviceable to avoid blocking valid checkouts due to temporary api errors.
    return { serviceable: true, tat_days: 4 };
  }
}

export interface ShadowfaxBookingResult {
  awb_number: string;
  tracking_url: string;
  label_url?: string;
}

export async function bookShadowfaxShipment(order: Order): Promise<ShadowfaxBookingResult> {
  if (!isConfigured) {
    console.warn(`Shadowfax is not configured. Booking mock shipment for order ${order.orderNumber}.`);
    const randomAwb = `SFX${Math.floor(100000000 + Math.random() * 900000000)}`;
    return {
      awb_number: randomAwb,
      tracking_url: `https://track.shadowfax.in/track?awb=${randomAwb}`,
      label_url: "https://shadowfax360.in/labels/mock-label.pdf",
    };
  }

  try {
    const authHeader = await getShadowfaxAuthHeader();
    const shippingAddress = order.shippingData as any;

    if (!shippingAddress) {
      throw new Error("Missing shipping details on order");
    }

    const payload = {
      client_order_number: order.orderNumber,
      pickup_address_code: process.env.SHADOWFAX_WAREHOUSE_CODE || "DEFAULT",
      delivery_name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
      delivery_phone: order.phone,
      delivery_email: order.email,
      delivery_address: `${shippingAddress.addressLine1} ${shippingAddress.addressLine2 || ""}`,
      delivery_city: shippingAddress.city,
      delivery_state: shippingAddress.state,
      delivery_pincode: shippingAddress.pincode,
      cod_value: order.paymentMethod === "COD" ? Number(order.total) : 0,
      payment_mode: order.paymentMethod === "COD" ? "COD" : "Prepaid",
      actual_weight: 0.1, // Default 100g for jewellery
      length: 10,
      width: 10,
      height: 5,
    };

    const res = await fetch(`${process.env.SHADOWFAX_API_BASE_URL}/api/v2/orders/`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Shadowfax booking returned status ${res.status}: ${errText}`);
    }

    const data = await res.json();
    return {
      awb_number: data.awb_number || data.awb,
      tracking_url: data.tracking_url || `https://track.shadowfax.in/track?awb=${data.awb_number}`,
      label_url: data.label_url,
    };
  } catch (error) {
    console.error("Shadowfax shipment booking error:", error);
    throw error;
  }
}
