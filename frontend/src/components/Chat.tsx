import React, { useState, useEffect, useRef } from "react";
import { getSocket, sendMessage, disconnectSocket } from "../services/socket";
import CIcon from "@coreui/icons-react";
import { cilZoom, cilChevronCircleRightAlt } from "@coreui/icons";
import { toast } from "react-hot-toast";

interface ChatProps {
  projectId: string;
}

interface Message {
  text: string;
  username: string;
  isSent: boolean;
  time: string;
}

const Chat = ({ projectId }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const formatTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  useEffect(() => {
    const socket = getSocket();

    socket.onmessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      setMessages((prev) => [
        ...prev,
        { ...message, isSent: false, time: formatTime() },
      ]);
    };

    return () => {
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages?projectId=${projectId}`);

        if (response.ok) {
          const fetchedMessages = await response.json();
          const loggedInUsername = localStorage.getItem("username");

          const updatedMessages = fetchedMessages.map((msg: any) => {
            const formattedTime = new Date(msg.time).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            });

            return {
              ...msg,
              isSent: msg.username === loggedInUsername,
              time: formattedTime,
            };
          });

          setMessages(updatedMessages);
        } else {
          console.error("Failed to fetch messages from backend.");
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [projectId]);

  const handleSendMessage = async () => {
    const username = localStorage.getItem("username") || "Anonymous";
    const message = { text: input, username, isSent: true, time: formatTime() };

    sendMessage(JSON.stringify(message));

    setMessages((prev) => [...prev, message]);

    const backendMessage = {
      text: input,
      username,
      time: new Date().toISOString(),
      projectId,
    };

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(backendMessage),
      });
      console.log(backendMessage);

      if (response.ok) {
        console.log("Message saved to database.");
      } else {
        console.error("Failed to save message.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }

    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim() !== "") {
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const userRole = localStorage.getItem("role");

  const isAuthorized = userRole === "admin" || userRole === "employee";

  const handleUnauthorizedAction = () => {
    toast.error(
      <div className="text-red-500 font-bold text-center">
        Access Denied! <br />
        Only Admins & Employees can send messages.
      </div>,
      { duration: 3000 }
    );
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-lg">
      <div className="bg-white px-3 py-1 border-b border-gray-300 sticky top-0 z-10">
        <h2 className="text-lg font-semibold text-gray-800 font-playfair">
          Project Chat
        </h2>
      </div>

      <div className="flex-1 max-h-[80vh] overflow-y-auto p-4 bg-gray-50 rounded-t-lg">
        <ul className="space-y-4">
          {messages.map((msg, index) => (
            <li
              key={index}
              className={`flex items-start ${
                msg.isSent ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`relative max-w-[300px] px-2 py-1 font-spaceGrotesk  text-sm rounded-lg shadow ${
                  msg.isSent ? "bg-zz text-white" : "bg-[#FFEDFB] text-black"
                }`}
              >
                {!msg.isSent && (
                  <p className="font-semibold text-xs text-gray-500 mb-1">
                    {msg.username} • {msg.time}
                  </p>
                )}
                {msg.isSent && (
                  <p className="text-xs text-gray-300 mb-1 text-right">
                    {msg.time}
                  </p>
                )}
                <p className="text-sm">{msg.text}</p>
              </div>
            </li>
          ))}
          <div ref={messagesEndRef} />
        </ul>
      </div>

      <div className="p-2 bg-white border-t flex space-x-2 rounded-b-lg">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={isAuthorized ? handleKeyDown : handleUnauthorizedAction}
          placeholder="Type a message"
          className="text-black flex-1 p-2 text-sm border border-gray-900 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!isAuthorized}
        />
        <button
          onClick={isAuthorized ? handleSendMessage : handleUnauthorizedAction}
          className={`p-2 text-lg rounded-lg shadow-md transition duration-200 relative flex items-center justify-center ${
            isAuthorized
              ? "bg-zz text-white hover:bg-black"
              : "bg-gray-400 text-gray-600 cursor-not-allowed"
          }`}
          disabled={!isAuthorized}
        >
          <CIcon icon={cilChevronCircleRightAlt} className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default Chat;
