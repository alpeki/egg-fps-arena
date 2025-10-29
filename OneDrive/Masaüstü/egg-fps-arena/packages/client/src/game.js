// ✅ Egg-FPS Arena Client with Colyseus Integration (browser-safe version)

const { Client } = window.Colyseus;

class GameClient {
    constructor() {
        this.colyseusClient = null;
        this.room = null;
        this.playerId = null;
        this.game = null;
        this.players = new Map();
        this.lastInputSeq = 0;
        this.inputQueue = [];

        // Input state
        this.keys = { w: false, a: false, s: false, d: false };
        this.mouse = { x: 0, y: 0, down: false };
        this.aimAngle = 0;

        // Game config
        this.config = {
            width: 800,
            height: 600,
            mapSize: 3000,
            playerRadius: 20
        };

        // Visual effects
        this.particles = new Map();
        this.screenShake = { x: 0, y: 0, intensity: 0 };
        
        // Kill feed
        this.killFeed = [];

        // Audio system
        this.audio = new AudioManager();

        // Scoreboard
        this.scoreboard = new Scoreboard();

        // Weapon UI
        this.weaponUI = new WeaponUI();
        this.currentWeapon = 'pistol';

        this.initColyseusClient();
        this.initUI();
        
        // Global reference for menu system
        window.gameClient = this;
    }

    initColyseusClient() {
        this.colyseusClient = new Client("ws://localhost:2567");
        console.log("✅ Colyseus client initialized");
    }

    initUI() {
        window.connectToServer = () => this.connectToServer();
        this.updateStatus('Ready to connect', 'disconnected');
        // Don't auto-connect, wait for user to click connect button
        // or delay the connection to ensure server is ready
        setTimeout(() => {
            console.log("Auto-connecting to server...");
            this.connectToServer();
        }, 1000); // Wait 1 second before connecting
    }

    async connectToServer() {
        try {
            if (this.room) {
                await this.room.leave();
                this.room = null;
            }

            console.log("🔗 Connecting to server at ws://localhost:2567...");
            this.updateStatus('Connecting...', 'warning');

            // Test connection first
            this.room = await this.colyseusClient.joinOrCreate("arena");
            console.log("✅ Joined Arena room successfully!");
            this.updateStatus('Connected', 'connected');
            this.audio.playConnectSound();

            this.playerId = this.room.sessionId;
            document.getElementById('player-id').textContent = this.playerId;

            this.setupRoomHandlers();
        } catch (error) {
            console.error('❌ Connection error:', error);
            console.error('Error details:', error.message);
            this.updateStatus(`Connection Failed: ${error.message}`, 'disconnected');
            
            // Retry after 3 seconds
            console.log('Will retry in 3 seconds...');
            setTimeout(() => {
                console.log('Retrying connection...');
                this.connectToServer();
            }, 3000);
        }
    }

    setupRoomHandlers() {
        if (!this.room) return;

        this.room.onStateChange((state) => {
            this.handleRoomStateChange(state);
        });

        this.room.onMessage("init", (message) => {
            this.handleInitMessage(message);
        });

        this.room.onMessage("playerKilled", (data) => {
            console.log(`💀 ${data.killer} killed ${data.victim}`);
            this.addKillFeedEntry(data.killer, data.victim);
            
            // Screen shake and audio for kills
            if (data.killer === this.playerId) {
                this.addScreenShake(5);
                this.audio.playKillSound();
            } else if (data.victim === this.playerId) {
                this.addScreenShake(8);
                this.audio.playDeathSound();
            }
        });

        this.room.onMessage("playerHit", (data) => {
            // Visual and audio feedback for hits
            if (data.victim === this.playerId) {
                this.addScreenShake(3);
                this.audio.playHitSound();
            }
        });

        this.room.onError((code, message) => {
            console.error("Room error:", code, message);
            this.updateStatus(`Error: ${message}`, 'disconnected');
        });

        this.room.onLeave((code) => {
            console.log("Left room with code:", code);
            this.updateStatus('Disconnected', 'disconnected');
        });
    }

    handleRoomStateChange(state) {
        this.updatePlayersFromState(state.players);

        const playerCount = state.players.size || Object.keys(state.players).length;
        document.getElementById('player-count').textContent = playerCount;

        if (this.playerId && state.players.has(this.playerId)) {
            const player = state.players.get(this.playerId);
            document.getElementById('health').textContent = player.health;
            document.getElementById('score').textContent = player.score;
            
            // Update weapon UI
            if (this.weaponUI) {
                this.weaponUI.updateFromServer(
                    player.weapon,
                    player.ammo,
                    player.maxAmmo,
                    player.isReloading
                );
            }
        }

        // Update scoreboard
        if (this.scoreboard) {
            this.scoreboard.updatePlayers(state.players, this.playerId);
        }
    }

    updatePlayersFromState(playersData) {
        const newPlayers = new Map();

        if (playersData instanceof Map) {
            playersData.forEach((player, id) => newPlayers.set(id, player));
        } else if (typeof playersData === 'object') {
            Object.entries(playersData).forEach(([id, player]) => newPlayers.set(id, player));
        }

        for (const [id] of this.players) {
            if (!newPlayers.has(id)) {
                this.removePlayerSprite(id);
            }
        }

        this.players = newPlayers;
        this.players.forEach((player, id) => this.updatePlayerSprite(id, player));
    }

    handleInitMessage(message) {
        if (message.playerId) {
            this.playerId = message.playerId;
            document.getElementById('player-id').textContent = this.playerId;
        }

        if (message.gameState) {
            this.updatePlayersFromState(message.gameState.players);
        }
    }

    sendInput() {
        if (!this.room || !this.playerId) return;
        const moveX = (this.keys.d ? 1 : 0) - (this.keys.a ? 1 : 0);
        const moveY = (this.keys.s ? 1 : 0) - (this.keys.w ? 1 : 0);

        const wasFiring = this.wasFiring || false;
        const isFiring = this.mouse.down;
        
        // Trigger muzzle flash and sound on fire start
        if (isFiring && !wasFiring && this.game) {
            this.createMuzzleFlash();
            this.audio.playShootSound();
        }
        
        this.wasFiring = isFiring;

        this.room.send("input", {
            moveX,
            moveY,
            aimAngle: this.aimAngle,
            fire: this.mouse.down,
            reload: this.keys.r || false,
            switchWeapon: this.switchWeaponRequest || null
        });
        
        this.switchWeaponRequest = null;
    }

    createMuzzleFlash() {
        if (!this.game || !this.playerId) return;
        const player = this.players.get(this.playerId);
        if (!player) return;

        // Create muzzle flash particle effect
        const particles = this.game.add.particles(player.x, player.y, 'particle', {
            speed: { min: 50, max: 150 },
            scale: { start: 0.3, end: 0 },
            blendMode: 'ADD',
            lifespan: 200,
            quantity: 8,
            tint: 0xffaa00
        });

        this.game.time.delayedCall(250, () => particles.destroy());
        
        // Screen shake
        this.addScreenShake(2);
    }

    addScreenShake(intensity) {
        this.screenShake.intensity = Math.max(this.screenShake.intensity, intensity);
    }

    updateScreenShake() {
        if (this.screenShake.intensity > 0) {
            this.screenShake.x = (Math.random() - 0.5) * this.screenShake.intensity;
            this.screenShake.y = (Math.random() - 0.5) * this.screenShake.intensity;
            this.screenShake.intensity *= 0.9;
            
            if (this.screenShake.intensity < 0.1) {
                this.screenShake.intensity = 0;
                this.screenShake.x = 0;
                this.screenShake.y = 0;
            }
        }
    }

    addKillFeedEntry(killer, victim) {
        this.killFeed.unshift({ killer, victim, time: Date.now() });
        if (this.killFeed.length > 5) this.killFeed.pop();
        this.updateKillFeedUI();
    }

    updateKillFeedUI() {
        const feedEl = document.getElementById('kill-feed');
        if (!feedEl) return;
        
        feedEl.innerHTML = this.killFeed.map(entry => {
            const age = Date.now() - entry.time;
            const opacity = Math.max(0, 1 - age / 5000);
            return `<div style="opacity: ${opacity}">${entry.killer} ☠️ ${entry.victim}</div>`;
        }).join('');
    }

    updatePlayerSprite(playerId, player) {
        let sprite = this.players.get(playerId);

        if (!sprite) {
            sprite = this.game.add.circle(
                player.x / (3000 / this.config.width),
                player.y / (3000 / this.config.height),
                this.config.playerRadius / (3000 / this.config.width),
                playerId === this.playerId ? 0x00ff00 : 0xff0000
            );

            const label = this.game.add.text(
                player.x / (3000 / this.config.width),
                player.y / (3000 / this.config.height),
                player.score.toString(),
                { fontSize: '12px', color: '#ffffff' }
            );
            label.setOrigin(0.5);

            sprite.label = label;
            this.players.set(playerId, sprite);
        }

        const x = player.x / (3000 / this.config.width);
        const y = player.y / (3000 / this.config.height);

        sprite.setPosition(x, y);
        sprite.label.setPosition(x, y - 30);
        sprite.label.setText(`${player.score} HP:${player.health}`);
    }

    removePlayerSprite(playerId) {
        const sprite = this.players.get(playerId);
        if (sprite) {
            sprite.destroy();
            sprite.label.destroy();
            this.players.delete(playerId);
        }
    }

    updateStatus(text, className) {
        const statusEl = document.getElementById('status-text');
        const containerEl = document.getElementById('connection-status');
        statusEl.textContent = text;
        containerEl.className = `status ${className}`;
    }
}

// 🎮 Phaser oyun sahnesi
class ArenaScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ArenaScene' });
        this.client = null;
    }

    preload() {
        // Create particle texture
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(8, 8, 8);
        graphics.generateTexture('particle', 16, 16);
        graphics.destroy();
    }

    create() {
        // Background
        this.add.rectangle(400, 300, 800, 600, 0x111111);

        // Grid
        for (let x = 0; x <= 800; x += 40)
            this.add.line(0, 0, x, 0, x, 600, 0x333333).setOrigin(0);

        for (let y = 0; y <= 600; y += 40)
            this.add.line(0, 0, 0, y, 800, y, 0x333333).setOrigin(0);

        // Add obstacles/cover
        this.addMapObstacles();

        // Crosshair
        this.crosshair = this.add.circle(400, 300, 3, 0x00ff00, 0.8);
        this.crosshairRing = this.add.circle(400, 300, 15, 0x00ff00, 0);
        this.crosshairRing.setStrokeStyle(2, 0x00ff00, 0.6);

        this.client = new GameClient();
        this.client.game = this;

        this.setupInput();

        // Input sending
        this.time.addEvent({
            delay: 50,
            callback: () => this.client.sendInput(),
            loop: true
        });

        // Kill feed update
        this.time.addEvent({
            delay: 100,
            callback: () => this.client.updateKillFeedUI(),
            loop: true
        });
    }

    update() {
        // Update screen shake
        if (this.client) {
            this.client.updateScreenShake();
            this.cameras.main.setScroll(
                this.client.screenShake.x,
                this.client.screenShake.y
            );
        }

        // Update crosshair position
        const pointer = this.input.activePointer;
        this.crosshair.setPosition(pointer.x, pointer.y);
        this.crosshairRing.setPosition(pointer.x, pointer.y);

        // Calculate aim angle
        if (this.client && this.client.playerId) {
            const player = this.client.players.get(this.client.playerId);
            if (player) {
                const dx = pointer.x - player.x;
                const dy = pointer.y - player.y;
                this.client.aimAngle = Math.atan2(dy, dx);
            }
        }
    }

    addMapObstacles() {
        // Central large cover
        this.add.rectangle(400, 300, 100, 100, 0x444444).setStrokeStyle(2, 0x666666);
        
        // Corner covers
        this.add.rectangle(150, 150, 80, 80, 0x444444).setStrokeStyle(2, 0x666666);
        this.add.rectangle(650, 150, 80, 80, 0x444444).setStrokeStyle(2, 0x666666);
        this.add.rectangle(150, 450, 80, 80, 0x444444).setStrokeStyle(2, 0x666666);
        this.add.rectangle(650, 450, 80, 80, 0x444444).setStrokeStyle(2, 0x666666);
        
        // Side walls
        this.add.rectangle(200, 300, 60, 150, 0x444444).setStrokeStyle(2, 0x666666);
        this.add.rectangle(600, 300, 60, 150, 0x444444).setStrokeStyle(2, 0x666666);
        this.add.rectangle(400, 150, 150, 60, 0x444444).setStrokeStyle(2, 0x666666);
        this.add.rectangle(400, 450, 150, 60, 0x444444).setStrokeStyle(2, 0x666666);
    }

    setupInput() {
        // Keyboard
        this.input.keyboard.on('keydown-W', () => this.client.keys.w = true);
        this.input.keyboard.on('keyup-W', () => this.client.keys.w = false);
        this.input.keyboard.on('keydown-A', () => this.client.keys.a = true);
        this.input.keyboard.on('keyup-A', () => this.client.keys.a = false);
        this.input.keyboard.on('keydown-S', () => this.client.keys.s = true);
        this.input.keyboard.on('keyup-S', () => this.client.keys.s = false);
        this.input.keyboard.on('keydown-D', () => this.client.keys.d = true);
        this.input.keyboard.on('keyup-D', () => this.client.keys.d = false);

        // TAB for scoreboard
        this.input.keyboard.on('keydown-TAB', (event) => {
            event.preventDefault();
            this.client.scoreboard.toggle();
        });

        // R for reload
        this.input.keyboard.on('keydown-R', () => this.client.keys.r = true);
        this.input.keyboard.on('keyup-R', () => this.client.keys.r = false);

        // Number keys for weapon switching
        this.input.keyboard.on('keydown-ONE', () => this.client.switchWeaponRequest = 'pistol');
        this.input.keyboard.on('keydown-TWO', () => this.client.switchWeaponRequest = 'shotgun');
        this.input.keyboard.on('keydown-THREE', () => this.client.switchWeaponRequest = 'rifle');
        this.input.keyboard.on('keydown-FOUR', () => this.client.switchWeaponRequest = 'sniper');
        this.input.keyboard.on('keydown-FIVE', () => this.client.switchWeaponRequest = 'smg');

        // Mouse
        this.input.on('pointerdown', () => this.client.mouse.down = true);
        this.input.on('pointerup', () => this.client.mouse.down = false);
    }
}

window.addEventListener('load', () => {
    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: 'game-container',
        scene: ArenaScene,
        backgroundColor: '#111111'
    };

    new Phaser.Game(config);
});
