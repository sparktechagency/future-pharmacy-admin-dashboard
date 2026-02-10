import { getCookie } from "@/utils/cookies";
import { io } from "socket.io-client";
import { baseURL } from './BaseURL';
export const socket = io(baseURL, {
  reconnectionDelayMax: 10000,
  withCredentials: true,
  extraHeaders: {
    "Authorization": typeof window !== 'undefined' ? `Bearer ${getCookie("PharmacyAdmin")}` : ""
  },
  transports: ["websocket"],
  query: {
    token: typeof window !== 'undefined' ? getCookie("PharmacyAdmin") : ""
  },
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  autoConnect: true,
});


export const socketForNotification = () => {
  socket.connect();
  socket.on(`notification`, (data) => {
    console.log("new notification received 📡", data);
  });
  return () => {
    socket.off(`notification`);
    socket.disconnect();
  };
};