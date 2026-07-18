import { Resend } from "resend";
import { APP_NAME } from "@/lib/constants";

const resendApiKey = process.env.RESEND_API_KEY;
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

if (!resendApiKey) {
  console.warn("RESEND_API_KEY is missing. Emails will not be sent.");
}

export async function sendOrderConfirmationEmail({
  email,
  orderNumber,
  customerName,
  totalAmount,
}: {
  email: string;
  orderNumber: string;
  customerName: string;
  totalAmount: string;
}) {
  if (!resend) {
    console.log("Mock Email Sent: Order Confirmation to", email);
    return;
  }

  try {
    await resend.emails.send({
      from: `${APP_NAME} <orders@cherryjewelry.in>`,
      to: email,
      subject: `Order Confirmation - ${orderNumber}`,
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
          <h2>Thank you for your order, ${customerName}!</h2>
          <p>We have received your order <strong>${orderNumber}</strong> and are getting it ready for shipment.</p>
          <p><strong>Total Amount:</strong> ${totalAmount}</p>
          <p>You will receive another email once your order has shipped.</p>
          <br/>
          <p>Warm regards,</p>
          <p>The ${APP_NAME} Team</p>
        </div>
      `,
    });
    console.log("Order confirmation email sent to", email);
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
  }
}

export async function sendShippingConfirmationEmail({
  email,
  orderNumber,
  customerName,
  courierName,
  trackingNumber,
  trackingUrl,
}: {
  email: string;
  orderNumber: string;
  customerName: string;
  courierName: string;
  trackingNumber: string;
  trackingUrl?: string;
}) {
  if (!resend) {
    console.log("Mock Email Sent: Shipping Confirmation to", email, "via", courierName, "tracking:", trackingNumber);
    return;
  }

  try {
    await resend.emails.send({
      from: `${APP_NAME} <orders@cherryjewelry.in>`,
      to: email,
      subject: `Your order has shipped! - ${orderNumber}`,
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #1f2937;">
          <h2 style="color: #d4af37;">Your order is on the way, ${customerName}!</h2>
          <p>We are excited to let you know that your order <strong>${orderNumber}</strong> has been shipped via <strong>${courierName}</strong>.</p>
          
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Shipping Details:</strong></p>
            <p style="margin: 5px 0;"><strong>Courier:</strong> ${courierName}</p>
            <p style="margin: 5px 0;"><strong>Tracking Number:</strong> ${trackingNumber}</p>
            ${
              trackingUrl
                ? `<p style="margin: 15px 0 0 0;"><a href="${trackingUrl}" style="background-color: #1f2937; color: white; padding: 8px 16px; border-radius: 4px; text-decoration: none; display: inline-block; font-size: 14px;">Track Package</a></p>`
                : ""
            }
          </div>
          
          <p>If you have any questions about your delivery, feel free to reply to this email.</p>
          <br/>
          <p>Warm regards,</p>
          <p>The ${APP_NAME} Team</p>
        </div>
      `,
    });
    console.log("Shipping confirmation email sent to", email);
  } catch (error) {
    console.error("Failed to send shipping confirmation email:", error);
  }
}
