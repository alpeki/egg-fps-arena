import { Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { createServer } from "http";
import ArenaRoom from "./arena-room.js";

async function createGameServer() {
  const port = Number(process.env.PORT || 2567);

  const transport = new WebSocketTransport({
    server: createServer(),
  });

  const gameServer = new Server({ transport });
  gameServer.define("arena", ArenaRoom);

  await gameServer.listen(port);
  console.log(`🚀 Game server running on ws://localhost:${port}`);
  console.log(`🎮 Available rooms: arena`);
}

// Bu dosya doğrudan çalıştırılıyorsa sunucuyu başlat
if (process.argv[1].endsWith("server.ts") || process.argv[1].endsWith("server.js")) {
  createGameServer()
    .then(() => console.log("✅ Server started successfully!"))
    .catch((err) => {
      console.error("❌ Failed to start server:", err);
      process.exit(1);
    });
}
