import { io } from "socket.io-client";

const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const socket = io(socketUrl, {
  autoConnect: true,
  auth: (cb) => {
    cb({
      token: localStorage.getItem("token") || ""
    });
  }
});

// Reconnect with new token after login
export const connectSocket = () => {
  const token = localStorage.getItem("token");
  if (token) {
    socket.auth = { token };
    if (!socket.connected) {
      socket.connect();
    }
  }
};

export default socket;