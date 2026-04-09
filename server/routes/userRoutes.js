import express from "express";
import {
  getUserBookings,
  updateFavourite,
  getFavourites,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/bookings", getUserBookings);
router.post("/update-favourite", updateFavourite);
router.get("/favourites", getFavourites);

export default router;
