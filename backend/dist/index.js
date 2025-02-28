"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const ws_1 = __importDefault(require("ws"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const wss = new ws_1.default.Server({ server });
// Basic route
app.get("/", (req, res) => {
    res.send("WebSocket server is running");
});
// WebSocket connection
wss.on("connection", (ws) => {
    console.log("Client connected");
    // Listen for messages from clients
    ws.on("message", (message) => {
        const parsedMessage = message.toString(); // Ensure the message is a string
        console.log("Received:", parsedMessage);
        // Broadcast the message to all clients
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === ws_1.default.OPEN) {
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
