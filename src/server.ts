import express from "express";
import http from "http";
import cors, { CorsOptions } from "cors";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import { config } from "./config";
import connectDB from "./database";
import sessionMiddleware from "./middlewares/session";
import setHeaders from "./middlewares/set-headers";
import socketConfig from "./sockets/config";
import router from "./routes";

const app = express();
const server = http.createServer(app);
const corsOptions: CorsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? config.prodFrontendUrl
      : "http://localhost:3001",
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

async function startServer() {
  try {
    await connectDB();
    app.use(setHeaders);
    app.set("trust proxy", 1);
    app.use(cors(corsOptions));
    app.use(cookieParser());
    app.use(sessionMiddleware);
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    const io = new Server(server, {
      cors: corsOptions,
    });

    io.engine.use(sessionMiddleware);
    router(app);
    socketConfig(io);

    server.listen(config.port, () => {
      console.log(`Server listening on port ${config.port}`);
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

startServer();
