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
      from: `${APP_NAME} <orders@lumiere.in>`,
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
