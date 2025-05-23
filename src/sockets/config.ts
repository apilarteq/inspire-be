import type { Socket } from "socket.io";
import { Server as SocketServer } from "socket.io";
import { messageHandler } from "./handlers/message-handler";

export default function socketConfig(io: SocketServer) {
  // io.use((socket, next) => {
  //   const req = socket.request as express.Request;
  //   if (req.session?.id) {
  //     socket.data.sessionId = req.session.id;
  //     req.session.save((err) => {
  //       if (err) return next(err);
  //       next();
  //     });
  //   } else {
  //     next(new Error("Unauthorized"));
  //   }
  // });

  const onConnection = (socket: Socket) => {
    console.log("a user connected", socket.request.sessionID);
    socket.on("disconnect", () => {
      console.log("a user disconnected");
    });
    messageHandler(socket);
  };

  io.on("connection", (socket: Socket) => {
    onConnection(socket);
  });
}
