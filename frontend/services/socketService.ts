import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("✅ Conectado ao WebSocket:", socket.id);
});

socket.on("disconnect", () => {
  console.log("❌ Desconectado do WebSocket");
});

export default socket;
