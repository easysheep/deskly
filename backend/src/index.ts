import express from "express";
import http from "http";
import WebSocket from "ws";

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Basic route
app.get("/", (req, res) => {
  res.send("WebSocket server is running");
});

// WebSocket connection
wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected");

  // Listen for messages from clients
  ws.on("message", (message: WebSocket.Data) => {
    const parsedMessage = message.toString(); // Ensure the message is a string
    console.log("Received:", parsedMessage);

    // Broadcast the message to all clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(parsedMessage); // Send stringified data
      }
    });
  });

  // Handle client disconnect
  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

// Start the server on port 5000
server.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});
