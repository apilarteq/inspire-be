import { Socket } from "socket.io";
import { SocketErrorResponse } from "../../types/error";

const emitError = (socket: Socket, error: SocketErrorResponse) => {
  try {
    const success = socket.emit("error", error);

    if (!success) {
      console.warn(
        `[Socket] El cliente ${socket.data.sessionId} no recibió el error.`
      );
    }
  } catch (error) {
    console.error(`[Socket] Error al emitir el error: ${error}`);
  }
};

export default async function handleSocketOperation<T>(
  socket: Socket,
  errorMessage: string,
  promise: Promise<T>
): Promise<T | null> {
  try {
    return await promise;
  } catch (error) {
    emitError(socket, {
      code: "",
      message: errorMessage,
      details: error,
    });
    return null;
  }
}
