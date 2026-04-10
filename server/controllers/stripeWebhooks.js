import stripe from "stripe";
import Booking from "../models/Booking.js";

export const stripeWebhooks = async (req, res) => {
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.log(`Webhook signature verification failed: ${err.message}`);
    try {
      switch (event.type) {
        case "payment_intent.succeeded": {
          const paymentIntent = event.data.object;
          const sessionList = await stripeInstance.checkout.sessions.list({
            payment_intent: paymentIntent.id,
          });
          const session = sessionList.data[0];
          const { bookingId } = session.metadata;
          await Booking.findByIdAndUpdate(bookingId, {
            isPaid: true,
            paymentLink: "",
          });
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
      return res.status(200).json({ success: true });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};
