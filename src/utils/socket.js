import { getCookie } from "@/utils/cookies";
import { io } from "socket.io-client";
import { baseURL } from './BaseURL';
import { getToken } from "./storage";

const getAuthToken = () => {
  if (typeof window === 'undefined') return "";
  const token = getCookie("PharmacyAdmin") || getToken() || "";
  return token;
};

export const socket = io(baseURL, {
  reconnectionDelayMax: 10000,
  withCredentials: true,
  transports: ["websocket", "polling"],
  path: "/socket.io", // Default path, can be changed if needed
  auth: {
    token: getAuthToken()
  },
  extraHeaders: {
    "Authorization": getAuthToken() ? `Bearer ${getAuthToken()}` : ""
  },
  query: {
    token: getAuthToken()
  },
  reconnection: true,
  reconnectionAttempts: 15,
  reconnectionDelay: 1000,
  timeout: 30000,
  autoConnect: true,
});


socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("❌ Socket connection error:", error.message);
});

socket.on("disconnect", (reason) => {
  console.log("🔌 Socket disconnected:", reason);
  if (reason === "io server disconnect") {
    // the disconnection was initiated by the server, you need to reconnect manually
    socket.connect();
  }
});

// Debug: listen to all events
socket.onAny((eventName, ...args) => {
  console.log(`📩 Received event: ${eventName}`, args);
});

export const socketForNotification = () => {
  // This function stays for backward compatibility but isn't strictly needed 
  // if you use the export const socket above
  if (!socket.connected) socket.connect();

  const handler = (data) => {
    console.log("new notification received 📡", data);
  };

  socket.on(`notification`, handler);

  return () => {
    socket.off(`notification`, handler);
  };
};
