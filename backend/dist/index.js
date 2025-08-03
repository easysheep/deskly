"use strict";
// import express from "express";
// import http from "http";
// import WebSocket from "ws";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const app = express();
// const server = http.createServer(app);
// const wss = new WebSocket.Server({ server });
// // Basic route
// app.get("/", (req, res) => {
//   res.send("WebSocket server is running");
// });
// // WebSocket connection
// wss.on("connection", (ws: WebSocket) => {
//   console.log("Client connected");
//   // Listen for messages from clients
//   ws.on("message", (message: WebSocket.Data) => {
//     const parsedMessage = message.toString(); // Ensure the message is a string
//     console.log("Received:", parsedMessage);
//     // Broadcast the message to all clients
//     wss.clients.forEach((client) => {
//       if (client !== ws && client.readyState === WebSocket.OPEN) {
//         client.send(parsedMessage); // Send stringified data
//       }
//     });
//   });
//   // Handle client disconnect
//   ws.on("close", () => {
//     console.log("Client disconnected");
//   });
// });
// // Start the server on dynamic port (Render supplies PORT)
// const port = parseInt(process.env.PORT || "5000", 10);
// server.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const ws_1 = __importDefault(require("ws"));
const app = (0, express_1.default)();
const port = parseInt(process.env.PORT || "5000", 10);
const server = http_1.default.createServer(app);
// HTTP test route
app.get("/", (req, res) => {
    res.send("WebSocket server is running. Try connecting to /ws via WebSocket.");
});
// WebSocket server without direct server binding
const wss = new ws_1.default.Server({ noServer: true });
// Handle upgrade requests for /ws
server.on("upgrade", (req, socket, head) => {
    if (req.url === "/ws") {
        wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit("connection", ws, req);
        });
    }
    else {
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
            if (client !== ws && client.readyState === ws_1.default.OPEN) {
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
