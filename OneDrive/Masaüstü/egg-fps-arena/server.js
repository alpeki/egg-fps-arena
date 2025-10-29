// Simple Colyseus server for Egg-FPS Arena
import { Server } from "colyseus";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { Room } from "colyseus";
import http from "http";

class ArenaRoom extends Room {
  onCreate() {
    console.log("ArenaRoom created");
    this.state = { players: {} };

    this.onMessage("input", (client, data) => {
      const player = this.state.players[client.sessionId];
      if (!player) return;

      player.x += (data.moveX || 0) * 10;
      player.y += (data.moveY || 0) * 10;
      player.angle = data.aimAngle;
      this.broadcast("player_update", { id: client.sessionId, ...player });
    });
  }

  onJoin(client) {
    console.log(client.sessionId, "joined!");
    this.state.players[client.sessionId] = { x: 400, y: 300, angle: 0, health: 100, score: 0 };
    client.send("init", { playerId: client.sessionId, gameState: this.state });
  }

  onLeave(client) {
    console.log(client.sessionId, "left!");
    delete this.state.players[client.sessionId];
  }
}

const port = 2567;
const server = http.createServer();
const gameServer = new Server({
  transport: new WebSocketTransport({ server }),
});

gameServer.define("arena", ArenaRoom);
gameServer.listen(port);

console.log(`✅ Egg-FPS Arena server running at ws://localhost:${port}`);
