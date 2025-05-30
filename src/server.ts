import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import { config } from "./config";
import connectDB from "./database";
import sessionMiddleware from "./middlewares/session";
import socketConfig from "./sockets/config";
import router from "./routes";

const allowedOrigins = ["http://localhost:3001", config.prodFrontendUrl];

const app = express();
const server = http.createServer(app);
const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

async function startServer() {
  try {
    await connectDB();
    app.use(cookieParser());
    app.use(sessionMiddleware);
    app.use(cors(corsOptions));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.set("trust proxy", 1);

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
