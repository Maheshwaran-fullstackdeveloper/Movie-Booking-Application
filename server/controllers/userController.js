import { clerkClient, getAuth } from "@clerk/express";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";

export const getUserBookings = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const bookings = await Booking.find({ user: userId })
      .populate({
        path: "show",
        populate: {
          path: "movie",
        },
      })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFavourite = async (req, res) => {
  try {
    const { movieId } = req.body;
    const { userId } = getAuth(req);
    const user = await clerkClient.users.getUser(userId);
    if (!user.privateMetadata?.favourites) {
      user.privateMetadata.favourites = [];
    }

    if (!user.privateMetadata.favourites.includes(movieId)) {
      user.privateMetadata.favourites.push(movieId);
    } else {
      user.privateMetadata.favourites = user.privateMetadata.favourites.filter(
        (id) => id !== movieId,
      );
    }

    await clerkClient.users.updateUser(userId, {
      privateMetadata: user.privateMetadata,
    });
    res.status(200).json({ success: true, message: "Updated favourites" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFavourites = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const user = await clerkClient.users.getUser(userId);
    const favourites = user.privateMetadata?.favourites || [];
    const movies = await Movie.find({ _id: { $in: favourites } });
    res.status(200).json({ success: true, movies });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking || booking.user !== userId) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    const show = await Show.findById(booking.show);

    if (show) {
      booking.bookedSeats.forEach((seat) => {
        delete show.occupiedSeats[seat];
      });
      show.markModified("occupiedSeats");
      await show.save();
    }

    await Booking.findByIdAndDelete(bookingId);

    res
      .status(200)
      .json({ success: true, message: "Booking cancelled successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
