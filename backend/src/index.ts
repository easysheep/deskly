import express from "express";
import http from "http";
import WebSocket from "ws";

const app = express();
const port = parseInt(process.env.PORT || "5000", 10);
const server = http.createServer(app);

// HTTP test route
app.get("/", (req, res) => {
  res.send("WebSocket server is running. Try connecting to /ws via WebSocket.");
});

// WebSocket server without direct server binding
const wss = new WebSocket.Server({ noServer: true });

// Handle upgrade requests for /ws
server.on("upgrade", (req, socket, head) => {
  if (req.url === "/ws") {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  } else {
    socket.destroy();
  }
});

// WebSocket logic
wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    const parsed = message.toString();
    console.log("Received:", parsed);

    // Broadcast to other clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(parsed);
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

// Start the server
server.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
