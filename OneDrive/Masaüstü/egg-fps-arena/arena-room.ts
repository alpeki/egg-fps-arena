import { Room, Client } from "@colyseus/core";
import { type, Schema, MapSchema } from "@colyseus/schema";
import { BotManager, BotInput } from "./packages/shared/index.js";
import { WEAPONS, getWeaponConfig } from "./packages/shared/weapons.js";

// Player state schema - matches our existing types
class PlayerState extends Schema {
  @type("string") id: string = "";
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") vx: number = 0;
  @type("number") vy: number = 0;
  @type("number") aimAngle: number = 0;
  @type("number") health: number = 100;
  @type("number") maxHealth: number = 100;
  @type("string") weapon: string = "pistol";
  @type("number") ammo: number = 12;
  @type("number") maxAmmo: number = 12;
  @type("boolean") isReloading: boolean = false;
  @type("number") lastFireTime: number = 0;
  @type("number") score: number = 0;
  @type("boolean") isDead: boolean = false;
  @type("number") dashCooldown: number = 0;
  @type("number") seq: number = 0;
  @type("boolean") isBot: boolean = false; // Add bot flag
}

// Game state for Arena room
class ArenaState extends Schema {
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
  @type("number") gameTime: number = 0;
  @type("number") matchDuration: number = 300000; // 5 minutes in ms
  @type("boolean") matchActive: boolean = false;
}

// Game constants
const GAME_CONFIG = {
  PLAYER_SPEED: 200,
  PLAYER_RADIUS: 20,
  BULLET_SPEED: 800,
  BULLET_DAMAGE: 25,
  MAX_PLAYERS: 8,
  RESPAWN_TIME: 3000, // 3 seconds
  DASH_SPEED: 400,
  DASH_DURATION: 200, // 0.2 seconds
  DASH_COOLDOWN: 2000, // 2 seconds
  TARGET_BOT_COUNT: 3 // Number of bots to maintain
};

export class ArenaRoom extends Room<ArenaState> {
  maxClients = GAME_CONFIG.MAX_PLAYERS;
  private matchTimer?: NodeJS.Timeout;
  private botManager!: BotManager; // Definite assignment assertion
  private botUpdateTimer?: NodeJS.Timeout;
  private targetBotCount: number = GAME_CONFIG.TARGET_BOT_COUNT;
  
  onCreate(options: any) {
    this.setState(new ArenaState());
    this.botManager = new BotManager();
    
    // Start match timer
    this.matchTimer = setInterval(() => {
      this.state.gameTime += 1000; // 1 second
      if (this.state.gameTime >= this.state.matchDuration) {
        this.endMatch();
      }
    }, 1000);
    
    // Start bot update timer (20Hz)
    this.botUpdateTimer = setInterval(() => {
      this.updateBotAI();
    }, 50);
    
    // Handle player joining
    this.onMessage("join", (client: Client, data: any) => {
      this.handlePlayerJoin(client, data);
    });
    
    // Handle input messages
    this.onMessage("input", (client: Client, input: any) => {
      this.handlePlayerInput(client, input);
    });
    
    // Handle disconnection
    this.onLeave = (client: Client, consented: boolean) => {
      this.handlePlayerLeave(client);
    };
    
    console.log("Arena room created");
    
    // Spawn initial bots
    this.spawnInitialBots();
  }
  
  spawnInitialBots(): void {
    setTimeout(() => {
      for (let i = 0; i < this.targetBotCount; i++) {
        const botId = `bot_${Date.now()}_${i}`;
        this.spawnBot(botId, 'medium');
      }
    }, 2000); // Wait 2 seconds after room creation
  }
  
  spawnBot(botId: string, difficulty: 'easy' | 'medium' | 'hard' | 'expert' = 'medium'): void {
    // Don't spawn if we're at max capacity
    if (this.state.players.size >= this.maxClients) {
      console.log("Room full, cannot spawn bot");
      return;
    }
    
    // Create bot state
    const bot = new PlayerState();
    bot.id = botId;
    bot.x = Math.random() * 2800 + 100; // Random spawn position
    bot.y = Math.random() * 2800 + 100;
    bot.health = 100;
    bot.weapon = "pistol";
    bot.isBot = true;
    bot.seq = 0;
    
    this.state.players.set(botId, bot);
    this.botManager.addBot(botId, difficulty);
    
    console.log(`Bot ${botId} spawned with ${difficulty} difficulty`);
  }
  
  updateBotAI(): void {
    // Extract bot states from all players
    const botStates = new Map<string, PlayerState>();
    for (const [id, player] of this.state.players) {
      if (player.isBot) {
        botStates.set(id, player);
      }
    }
    
    // Update bot AI and get inputs
    // Convert MapSchema to regular Map for bot manager compatibility
    const allPlayersMap = new Map<string, PlayerState>();
    for (const [id, player] of this.state.players) {
      allPlayersMap.set(id, player);
    }
    const botInputs = this.botManager.updateBots(botStates, allPlayersMap, 50);
    
    // Apply bot inputs
    for (const [botId, input] of botInputs) {
      const bot = this.state.players.get(botId);
      if (bot && !bot.isDead) {
        this.applyBotInput(bot, input);
      }
    }
    
    // Maintain bot count
    this.maintainBotCount();
  }
  
  applyBotInput(bot: PlayerState, input: BotInput): void {
    this.updatePlayerMovement(bot, input);
    this.updatePlayerAim(bot, input);
    this.handlePlayerActions(bot, input);
    bot.seq = input.seq;
  }
  
  maintainBotCount(): void {
    const currentBotCount = Array.from(this.state.players.values()).filter(p => p.isBot).length;
    
    if (currentBotCount < this.targetBotCount && this.state.players.size < this.maxClients) {
      const neededBots = this.targetBotCount - currentBotCount;
      const availableSlots = this.maxClients - this.state.players.size;
      const botsToSpawn = Math.min(neededBots, availableSlots);
      
      for (let i = 0; i < botsToSpawn; i++) {
        const botId = `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.spawnBot(botId, 'medium');
      }
    } else if (currentBotCount > this.targetBotCount) {
      // Remove extra bots
      const botsToRemove = currentBotCount - this.targetBotCount;
      let removed = 0;
      
      for (const [id, player] of this.state.players) {
        if (player.isBot && removed < botsToRemove) {
          this.state.players.delete(id);
          this.botManager.removeBot(id);
          removed++;
        }
      }
    }
  }
  
  handlePlayerJoin(client: Client, data: any) {
    const playerId = client.sessionId;
    
    // Don't allow joining if room is full
    if (this.state.players.size >= this.maxClients) {
      client.send("error", { message: "Room is full" });
      return;
    }
    
    // Create player state
    const player = new PlayerState();
    player.id = playerId;
    player.x = Math.random() * 2800 + 100; // Random spawn position
    player.y = Math.random() * 2800 + 100;
    player.health = 100;
    player.weapon = "pistol";
    player.isBot = false;
    
    this.state.players.set(playerId, player);
    
    // Send initial state to client
    client.send("init", {
      playerId,
      gameState: this.state.toJSON()
    });
    
    console.log(`Player ${playerId} joined`);
    
    // Start match if not active
    if (!this.state.matchActive && this.state.players.size >= 1) {
      this.startMatch();
    }
  }
  
  handlePlayerInput(client: Client, input: any) {
    const player = this.state.players.get(client.sessionId);
    if (!player || player.isDead || player.isBot) return;
    
    // Update player based on input
    this.updatePlayerMovement(player, input);
    this.updatePlayerAim(player, input);
    this.handlePlayerActions(player, input);
    
    // Store latest sequence number for reconciliation
    player.seq = input.seq;
  }
  
  updatePlayerMovement(player: PlayerState, input: any) {
    const speed = GAME_CONFIG.PLAYER_SPEED;
    
    // Calculate movement
    const moveX = input.moveX * speed * (1000 / 20); // Normalize for 20Hz
    const moveY = input.moveY * speed * (1000 / 20);
    
    // Update position
    player.x += moveX;
    player.y += moveY;
    
    // Clamp to map bounds
    player.x = Math.max(20, Math.min(2980, player.x));
    player.y = Math.max(20, Math.min(2980, player.y));
    
    // Update velocity
    player.vx = moveX;
    player.vy = moveY;
  }
  
  updatePlayerAim(player: PlayerState, input: any) {
    player.aimAngle = input.aimAngle;
  }
  
  handlePlayerActions(player: PlayerState, input: any) {
    const now = Date.now();
    const weaponConfig = getWeaponConfig(player.weapon);
    
    // Handle weapon switching (1-5 keys)
    if (input.switchWeapon) {
      this.switchWeapon(player, input.switchWeapon);
    }
    
    // Handle reload
    if (input.reload && !player.isReloading && player.ammo < player.maxAmmo) {
      this.startReload(player);
    }
    
    // Handle firing
    if (input.fire && !player.isReloading && player.ammo > 0) {
      const timeSinceLastShot = now - player.lastFireTime;
      if (timeSinceLastShot >= weaponConfig.fireRate) {
        this.processShot(player);
        player.lastFireTime = now;
        player.ammo--;
        
        // Auto-reload when empty
        if (player.ammo === 0) {
          this.startReload(player);
        }
      }
    }
    
    // Handle dash
    if (input.dash && player.dashCooldown <= 0) {
      this.processDash(player);
    }
    
    // Update cooldowns
    if (player.dashCooldown > 0) {
      player.dashCooldown -= 50; // 20Hz tick
    }
  }
  
  switchWeapon(player: PlayerState, weaponName: string) {
    if (WEAPONS[weaponName]) {
      player.weapon = weaponName;
      const config = getWeaponConfig(weaponName);
      player.maxAmmo = config.magazineSize;
      player.ammo = config.magazineSize;
      player.isReloading = false;
    }
  }
  
  startReload(player: PlayerState) {
    player.isReloading = true;
    const weaponConfig = getWeaponConfig(player.weapon);
    
    setTimeout(() => {
      if (this.state.players.has(player.id)) {
        player.ammo = player.maxAmmo;
        player.isReloading = false;
      }
    }, weaponConfig.reloadTime);
  }
  
  processShot(player: PlayerState) {
    const weaponConfig = getWeaponConfig(player.weapon);
    const baseAngle = player.aimAngle;
    
    // Fire multiple bullets for shotgun
    for (let i = 0; i < weaponConfig.bulletsPerShot; i++) {
      // Add spread
      const spreadRad = (weaponConfig.spread * Math.PI / 180) * (Math.random() - 0.5);
      const angle = baseAngle + spreadRad;
      
      const bulletX = player.x + Math.cos(angle) * 30;
      const bulletY = player.y + Math.sin(angle) * 30;
      
      // Raycast hit detection
      for (const [id, otherPlayer] of this.state.players) {
        if (id !== player.id && !otherPlayer.isDead) {
          const dx = otherPlayer.x - bulletX;
          const dy = otherPlayer.y - bulletY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Check if within range and hit radius
          if (distance < weaponConfig.range && distance < 25) {
            this.damagePlayer(otherPlayer, weaponConfig.damage, player.id);
            player.score += 10;
            
            // Broadcast hit event
            this.broadcast("playerHit", {
              shooter: player.id,
              victim: id,
              damage: weaponConfig.damage,
              weapon: player.weapon,
              killed: otherPlayer.health <= 0
            });
            
            console.log(`Player ${player.id} hit ${id} with ${player.weapon}`);
            break; // One bullet can only hit one target
          }
        }
      }
    }
  }
  
  processDash(player: PlayerState) {
    const angle = player.aimAngle;
    player.vx = Math.cos(angle) * GAME_CONFIG.DASH_SPEED;
    player.vy = Math.sin(angle) * GAME_CONFIG.DASH_SPEED;
    player.dashCooldown = GAME_CONFIG.DASH_COOLDOWN;
    
    if (player.isBot) {
      console.log(`Bot ${player.id} dashed`);
    }
  }
  
  damagePlayer(player: PlayerState, damage: number, shooterId?: string) {
    player.health -= damage;
    
    if (player.health <= 0) {
      this.killPlayer(player, shooterId);
    }
  }
  
  killPlayer(player: PlayerState, killerId?: string) {
    player.isDead = true;
    player.health = 0;
    
    // Broadcast kill event
    if (killerId) {
      this.broadcast("playerKilled", {
        killer: killerId,
        victim: player.id
      });
    }
    
    // Schedule respawn
    setTimeout(() => {
      if (this.state.players.has(player.id)) {
        this.respawnPlayer(player);
      }
    }, GAME_CONFIG.RESPAWN_TIME);
    
    if (player.isBot) {
      console.log(`Bot ${player.id} died`);
    } else {
      console.log(`Player ${player.id} died`);
    }
  }
  
  respawnPlayer(player: PlayerState) {
    player.x = Math.random() * 2800 + 100;
    player.y = Math.random() * 2800 + 100;
    player.health = player.maxHealth;
    player.isDead = false;
    player.dashCooldown = 0;
    
    if (player.isBot) {
      console.log(`Bot ${player.id} respawned`);
    } else {
      console.log(`Player ${player.id} respawned`);
    }
  }
  
  handlePlayerLeave(client: Client) {
    const playerId = client.sessionId;
    this.state.players.delete(playerId);
    
    // If a real player left, maintain bot count
    if (!this.state.players.has(playerId) || !this.state.players.get(playerId)?.isBot) {
      console.log(`Player ${playerId} left`);
      this.maintainBotCount();
    }
    
    // End match if no players
    if (this.state.players.size === 0) {
      this.endMatch();
    }
  }
  
  startMatch() {
    this.state.matchActive = true;
    this.state.gameTime = 0;
    console.log("Match started!");
  }
  
  endMatch() {
    this.state.matchActive = false;
    if (this.matchTimer) {
      clearInterval(this.matchTimer);
    }
    
    console.log("Match ended!");
    
    // Show scores
    const scores = Array.from(this.state.players.values())
      .sort((a, b) => b.score - a.score);
    
    console.log("Final scores:", scores.map(p => `${p.id}: ${p.score} (${p.isBot ? 'Bot' : 'Player'})`));
    
    // Clear all players and restart
    this.state.players.clear();
    this.botManager = new BotManager();
    
    // Respawn bots after delay
    setTimeout(() => {
      this.spawnInitialBots();
    }, 5000); // 5 second delay before next match
  }
  
  onDispose() {
    if (this.matchTimer) {
      clearInterval(this.matchTimer);
    }
    if (this.botUpdateTimer) {
      clearInterval(this.botUpdateTimer);
    }
    console.log("Arena room disposed");
  }
}

// Create and export the room for use in the main server
export default ArenaRoom;
