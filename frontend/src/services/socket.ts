const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "ws://localhost:5000/ws";

let socket: WebSocket | null = null;

/**
 * Initializes and returns the WebSocket client instance.
 */
export const getSocket = (): WebSocket => {
  if (!socket) {
    socket = new WebSocket(SOCKET_URL);

    // Optional: Add event listeners for debugging
    socket.onopen = () => {
      console.log("Connected to server");
    };

    socket.onclose = () => {
      console.log("Disconnected from server");
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onmessage = (event: MessageEvent) => {
      // Convert Buffer to string if necessary
      const message =
        event.data instanceof Buffer ? event.data.toString() : event.data;
      console.log("Received message:", message);
    };
  }

  return socket;
};

/**
 * Sends a message to the WebSocket server.
 */
export const sendMessage = (message: string) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(message);
  } else {
    console.error("WebSocket is not connected.");
  }
};

/**
 * Disconnects the WebSocket client.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
    console.log("WebSocket disconnected");
  }
};
