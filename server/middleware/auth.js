import { clerkClient, getAuth } from "@clerk/express";

export const protectAdmin = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    const user = await clerkClient.users.getUser(userId);
    if (user.privateMetadata.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Access Forbidden" });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Unauthorized access" });
  }
};

