import { getAuth } from "@clerk/express";
import Show from "../models/Show.js";
import Booking from "../models/Booking.js";

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
    res
      .status(201)
      .json({ success: true, message: "Booked successfully", booking });
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


