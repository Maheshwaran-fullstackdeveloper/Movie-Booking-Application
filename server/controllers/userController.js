import { clerkClient, getAuth } from "@clerk/express";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";

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

