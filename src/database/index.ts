import { connect, Connection } from "mongoose";
import { config } from "../config";

export default async function connectDB(): Promise<Connection> {
  try {
    const mongoose = await connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    mongoose.connection.on("error", (error) => {
      console.error("Error de conexión a MongoDB:", error);
    });

    console.log("Todo ok Jose Luis");
    return mongoose.connection;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
