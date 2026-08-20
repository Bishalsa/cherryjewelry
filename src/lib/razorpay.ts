import Razorpay from "razorpay";

export function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error("Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are missing.");
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_live_TS9MnP4nZCgaNM",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "kLeJ1C4nV19Xx7fI6cks0ME6",
});
