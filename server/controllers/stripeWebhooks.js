import stripe from "stripe";
import Booking from "../models/Booking.js";

export const stripeWebhooks = async (req, res) => {
  console.log(">>> Webhook Handler: Start");
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let rawBody;

  // 1. Try to get body from where Vercel/Express might have already put it
  if (req.body && (Buffer.isBuffer(req.body) || typeof req.body === "string")) {
    console.log(">>> Body already present as Buffer/String");
    rawBody = req.body;
  } else if (req.body && typeof req.body === "object") {
    // If it's an object, we must stringify it to verify. 
    // Note: This can fail verification if formatting differs from raw.
    console.log(">>> Body already present as Object");
    rawBody = JSON.stringify(req.body);
  } else {
    // 2. Fallback: Manually collect from stream (only if body is empty)
    console.log(">>> Body is empty, collecting from stream...");
    try {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      rawBody = Buffer.concat(chunks);
    } catch (streamErr) {
      console.error(">>> Stream Collection Error:", streamErr.message);
      return res.status(400).send("Stream error");
    }
  }

  console.log(">>> Raw Body length:", rawBody?.length || 0);

  if (!rawBody || rawBody.length === 0) {
    console.error(">>> Error: Raw Body is empty after all attempts");
    return res.status(400).send("Empty body received");
  }

  let event;
  try {
    event = stripeInstance.webhooks.constructEvent(
      rawBody,
      sig,
      webhookSecret,
    );
    console.log(">>> Event Verified:", event.type);
  } catch (err) {
    console.error(">>> Verification Failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { bookingId } = session.metadata;

      if (bookingId) {
        console.log(">>> Updating DB for Booking ID:", bookingId);
        await Booking.findByIdAndUpdate(bookingId, {
          isPaid: true,
          paymentLink: "",
        });
        console.log(">>> DB Updated Successfully 🟢");
      }
    }
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error(">>> Processing Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
