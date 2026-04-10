import { getAuth } from "@clerk/express";
import Show from "../models/Show.js";
import Booking from "../models/Booking.js";
import Stripe from "stripe";

const checkSeatsAvailability = async (showId, selectedSeats) => {
  try {
    const showData = await Show.findById(showId);
    if (!showData) return false;
    const occupiedSeats = showData.occupiedSeats || [];
    const isAnySeatTaken = selectedSeats.some((seat) => occupiedSeats[seat]);
    return !isAnySeatTaken;
  } catch (error) {
    console.log(error.message);
    return false;
  }
};

export const createBooking = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { showId, selectedSeats } = req.body;
    const { origin } = req.headers;
    const isAvailable = await checkSeatsAvailability(showId, selectedSeats);
    if (!isAvailable) {
      return res
        .status(400)
        .json({ success: false, message: "Selected seats are not available" });
    }
    const showData = await Show.findById(showId).populate("movie");
    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount: selectedSeats.length * showData.showPrice,
      bookedSeats: selectedSeats,
    });
    selectedSeats.map((seat) => {
      showData.occupiedSeats[seat] = userId;
    });
    showData.markModified("occupiedSeats");
    await showData.save();
    // Stripe Payment
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const line_items = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: showData.movie.title,
          },
          unit_amount: booking.amount * 100,
        },
        quantity: 1,
      },
    ];
    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${origin}/loading/my-bookings`,
      cancel_url: `${origin}/my-bookings`,
      metadata: {
        bookingId: booking._id.toString(),
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });
    booking.paymentLink = session.url;
    await booking.save();
    res.status(201).json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOccupiedSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    const showData = await Show.findById(showId);
    const occupiedSeats = Object.keys(showData.occupiedSeats);
    res.status(200).json({ success: true, occupiedSeats });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
