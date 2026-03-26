import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "./src/inngest/index.js";

const app = express();
const PORT = process.env.PORT || 3000;
await connectDB();
app.use(express.json());
app.use(clerkMiddleware());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.use("/api/inngest", serve({ client: inngest, functions }));

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

export default app;
