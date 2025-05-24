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

const app = express();
const server = http.createServer(app);

const corsOptions: cors.CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    const allowedOrigins: string[] = [
      "http://localhost:3001",
      config.prodFrontendUrl,
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

async function startServer() {
  try {
    await connectDB();
    app.use(cookieParser());
    app.use(sessionMiddleware);
    app.use(cors(corsOptions));
    app.options("*", cors(corsOptions));
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
