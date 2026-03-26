import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Connection to Database succeeded!🟢");
    });

    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    console.error("Error connecting to Database:🔴", error);
    process.exit(1); // Exit the process with failure
  }
};

export default connectDB;
