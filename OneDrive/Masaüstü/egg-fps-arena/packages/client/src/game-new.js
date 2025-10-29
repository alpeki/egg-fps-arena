// EGG ARENA - Roguelike Wave Shooter
// Complete rewrite for proper gameplay

class GameState {
    constructor() {
        // Player stats
        this.player = {
            x: 600,
            y: 400,
            health: 100,
            maxHealth: 100,
            speed: 200,
            level: 1,
            xp: 0,
            xpToNext: 100,
            totalXP: 0,
            weapon: 'pistol',
            damage: 1.0,
            fireRate: 1.0,
            range: 1.0,
            pierce: 0,
            multishot: 1,
            critChance: 0,
            lifesteal: 0,
            regen: 0,
            pickupRange: 50,
            explosiveKills: false
        };

        // Game state
        this.wave = 1;
        this.kills = 0;
        this.gameTime = 0;
        this.isPaused = false;
        this.isGameOver = false;
        this.isLevelingUp = false;

        // Entities
        this.enemies = [];
        this.bullets = [];
        this.xpDrops = [];
        this.itemDrops = [];
        this.particles = [];
        
        // Buffs
        this.damageBoostTimer = 0;
        this.xpBoostTimer = 0;
        this.xpBoostMultiplier = 1.0;

        // Wave management
        this.waveActive = false;
        this.enemiesThisWave = 0;
        this.enemiesKilledThisWave = 0;
        this.waveTimer = 0;
        this.spawnTimer = 0;
    }

    startWave() {
        this.waveActive = true;
        this.enemiesThisWave = 5 + (this.wave * 2);
        this.enemiesKilledThisWave = 0;
        this.spawnTimer = 0;
        console.log(`🌊 Wave ${this.wave} started! Enemies: ${this.enemiesThisWave}`);
    }

    endWave() {
        this.waveActive = false;
        this.wave++;
        
        // Boss wave every 10
        if (this.wave % 10 === 0) {
            this.showBossReward();
        } else {
            setTimeout(() => this.startWave(), 3000);
        }
    }

    addXP(amount) {
        amount *= this.xpBoostMultiplier;
        this.player.xp += amount;
        this.player.totalXP += amount;
        
        if (this.player.xp >= this.player.xpToNext) {
            this.levelUp();
        }
    }

    levelUp() {
        this.player.level++;
        this.player.xp -= this.player.xpToNext;
        // XP scaling: 100, 250, 450, 700, 1000...
        this.player.xpToNext = Math.floor(100 * Math.pow(this.player.level, 1.5));
        this.isLevelingUp = true;
        this.isPaused = true;
        console.log(`⬆️ Level up! Now level ${this.player.level}`);
        
        // Show upgrade screen with wave info for rarity
        if (window.upgradeSystem) {
            window.upgradeSystem.show(this.player, this.wave, () => {
                this.isLevelingUp = false;
                this.isPaused = false;
            });
        }
    }
    
    showBossReward() {
        this.isPaused = true;
        if (window.bossRewardSystem) {
            window.bossRewardSystem.show(this.player, () => {
                this.isPaused = false;
                setTimeout(() => this.startWave(), 1000);
            });
        }
    }

    damagePlayer(amount) {
        this.player.health -= amount;
        if (this.player.health <= 0) {
            this.player.health = 0;
            this.gameOver();
        }
    }

    healPlayer(amount) {
        this.player.health = Math.min(this.player.health + amount, this.player.maxHealth);
    }

    gameOver() {
        this.isGameOver = true;
        console.log(`💀 Game Over! Wave: ${this.wave}, Kills: ${this.kills}`);
        
        // Show game over screen
        if (window.showGameOver) {
            window.showGameOver(this.wave, this.kills, this.player.level, this.gameTime);
        }
    }
}

class Enemy {
    constructor(type, x, y, wave) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.wave = wave;
        
        // Colored egg enemies
        const types = {
            green: { hp: 20, speed: 80, damage: 5, xp: 10, color: 0x00ff00, size: 20 },
            yellow: { hp: 15, speed: 120, damage: 4, xp: 15, color: 0xffff00, size: 18 },
            red: { hp: 30, speed: 60, damage: 8, xp: 25, color: 0xff0000, size: 22 },
            blue: { hp: 50, speed: 50, damage: 10, xp: 40, color: 0x0088ff, size: 26 },
            purple: { hp: 80, speed: 70, damage: 12, xp: 60, color: 0xff00ff, size: 28 }
        };

        const base = types[type] || types.green;
        
        // Scale with wave
        this.maxHealth = base.hp * (1 + wave * 0.15);
        this.health = this.maxHealth;
        this.speed = base.speed * (1 + wave * 0.05);
        this.damage = base.damage * (1 + wave * 0.1);
        this.xpValue = base.xp;
        this.color = base.color;
        this.size = base.size;
        
        this.vx = 0;
        this.vy = 0;
        this.sprite = null;
    }

    update(playerX, playerY, delta) {
        // Move towards player
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            this.vx = (dx / dist) * this.speed;
            this.vy = (dy / dist) * this.speed;
        }
        
        this.x += this.vx * delta;
        this.y += this.vy * delta;
    }

    takeDamage(amount) {
        this.health -= amount;
        return this.health <= 0;
    }
}

class Bullet {
    constructor(x, y, angle, weapon, damage, pierce) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.weapon = weapon;
        this.damage = damage;
        this.speed = 500;
        this.lifetime = 2000;
        this.pierce = pierce || 0;
        this.hitEnemies = [];
        this.sprite = null;
    }

    update(delta) {
        this.x += Math.cos(this.angle) * this.speed * delta;
        this.y += Math.sin(this.angle) * this.speed * delta;
        this.lifetime -= delta * 1000;
        return this.lifetime <= 0;
    }
}

class XPDrop {
    constructor(enemyType, x, y, amount) {
        this.enemyType = enemyType;
        this.x = x;
        this.y = y;
        this.amount = amount;
        this.lifetime = 15000;
        this.sprite = null;
        this.text = null;
        
        // Color matches enemy type
        const colors = {
            green: 0x00ff00,
            yellow: 0xffff00,
            red: 0xff0000,
            blue: 0x0088ff,
            purple: 0xff00ff
        };
        this.color = colors[enemyType] || 0x00ff00;
    }

    update(delta, playerX, playerY, pickupRange) {
        this.lifetime -= delta * 1000;
        
        // Magnetic pull
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < pickupRange) {
            const pullSpeed = 300;
            this.x += (dx / dist) * pullSpeed * delta;
            this.y += (dy / dist) * pullSpeed * delta;
        }
        
        return this.lifetime <= 0;
    }
}

class ItemDrop {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.lifetime = 12000;
        this.sprite = null;
        this.textObj = null;
        
        const items = {
            health: { color: 0x00ff00, icon: '❤️', size: 12 },
            xpBoost: { color: 0x00ffff, icon: '⭐', size: 12 },
            damageBoost: { color: 0xff6600, icon: '⚔️', size: 12 },
            bomb: { color: 0xff0000, icon: '💣', size: 12 },
            magnet: { color: 0xffff00, icon: '🧲', size: 12 }
        };
        
        const item = items[type] || items.health;
        this.color = item.color;
        this.icon = item.icon;
        this.size = item.size;
    }

    update(delta, playerX, playerY, pickupRange) {
        this.lifetime -= delta * 1000;
        
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < pickupRange * 0.8) {
            const pullSpeed = 200;
            this.x += (dx / dist) * pullSpeed * delta;
            this.y += (dy / dist) * pullSpeed * delta;
        }
        
        return this.lifetime <= 0;
    }
}

// Main Phaser Scene
class ArenaScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ArenaScene' });
    }

    preload() {
        // Create simple textures
        this.createTextures();
    }

    createTextures() {
        // Player texture (white/gray egg - NOT green!)
        const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        playerGraphics.fillStyle(0xcccccc);
        playerGraphics.fillEllipse(16, 20, 28, 36);
        playerGraphics.fillStyle(0xffffff);
        playerGraphics.fillEllipse(16, 18, 24, 30);
        playerGraphics.generateTexture('player', 32, 40);
        playerGraphics.destroy();

        // Bullet texture
        const bulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        bulletGraphics.fillStyle(0xffff00);
        bulletGraphics.fillCircle(4, 4, 4);
        bulletGraphics.generateTexture('bullet', 8, 8);
        bulletGraphics.destroy();
    }

    create() {
        // Initialize game state
        this.gameState = new GameState();
        
        // Background
        this.add.rectangle(600, 400, 1200, 800, 0x1a1a1a);
        
        // Grid
        this.createGrid();
        
        // Player sprite (white egg)
        this.playerSprite = this.add.graphics();
        this.updatePlayerSprite();
        
        // Input
        this.keys = this.input.keyboard.addKeys({
            w: 'W',
            a: 'A',
            s: 'S',
            d: 'D',
            space: 'SPACE',
            esc: 'ESC'
        });
        
        // UI
        this.createUI();
        
        // Start first wave
        this.gameState.startWave();
        
        // Shooting timer
        this.shootTimer = 0;
        
        console.log('✅ Game initialized!');
    }

    createGrid() {
        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0x333333, 0.3);
        for (let x = 0; x <= 1200; x += 40) graphics.lineBetween(x, 0, x, 800);
        for (let y = 0; y <= 800; y += 40) graphics.lineBetween(0, y, 1200, y);
    }
    
    updatePlayerSprite() {
        const p = this.gameState.player;
        this.playerSprite.clear();
        // White egg body
        this.playerSprite.fillStyle(0xcccccc);
        this.playerSprite.fillEllipse(p.x, p.y, 14, 18);
        // Highlight
        this.playerSprite.fillStyle(0xffffff);
        this.playerSprite.fillEllipse(p.x - 2, p.y - 3, 10, 13);
    }

    createUI() {
        // Health bar
        this.healthBarBg = this.add.rectangle(100, 30, 200, 20, 0x660000);
        this.healthBar = this.add.rectangle(100, 30, 200, 20, 0x00ff00);
        this.healthBar.setOrigin(0, 0.5);
        this.healthBarBg.setOrigin(0, 0.5);
        
        // Text elements
        this.waveText = this.add.text(600, 20, 'Wave: 1', {
            fontSize: '24px',
            color: '#00ff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.healthText = this.add.text(200, 30, '100/100', {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        this.levelText = this.add.text(20, 60, 'Level: 1', {
            fontSize: '20px',
            color: '#00ff00'
        });
        
        this.killsText = this.add.text(20, 90, 'Kills: 0', {
            fontSize: '18px',
            color: '#ffffff'
        });
        
        // XP bar
        this.xpBarBg = this.add.rectangle(600, 770, 1100, 20, 0x333333);
        this.xpBar = this.add.rectangle(50, 770, 0, 20, 0x00aaff);
        this.xpBar.setOrigin(0, 0.5);
        
        this.xpText = this.add.text(600, 770, '0/100', {
            fontSize: '16px', color: '#fff', fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    update(time, delta) {
        if (this.gameState.isPaused || this.gameState.isGameOver) return;
        
        const dt = delta / 1000;
        this.gameState.gameTime += dt;
        
        this.updatePlayer(dt);
        this.updateShooting(dt);
        this.updateEnemies(dt);
        this.updateBullets(dt);
        this.updateXPDrops(dt);
        this.updateItemDrops(dt);
        this.updateWave(dt);
        this.updateBuffs(dt);
        this.updateUI();
    }
    
    updateBuffs(dt) {
        // XP Boost timer
        if (this.gameState.xpBoostTimer > 0) {
            this.gameState.xpBoostTimer -= dt;
            if (this.gameState.xpBoostTimer <= 0) {
                this.gameState.xpBoostMultiplier = 1.0;
            }
        }
        
        // Damage Boost timer
        if (this.gameState.damageBoostTimer > 0) {
            this.gameState.damageBoostTimer -= dt;
            if (this.gameState.damageBoostTimer <= 0) {
                this.gameState.player.damage /= 1.5;
            }
        }
    }

    updatePlayer(dt) {
        const player = this.gameState.player;
        let vx = 0, vy = 0;
        
        if (this.keys.w.isDown) vy -= 1;
        if (this.keys.s.isDown) vy += 1;
        if (this.keys.a.isDown) vx -= 1;
        if (this.keys.d.isDown) vx += 1;
        
        if (vx !== 0 && vy !== 0) {
            vx *= 0.707;
            vy *= 0.707;
        }
        
        player.x += vx * player.speed * dt;
        player.y += vy * player.speed * dt;
        
        player.x = Phaser.Math.Clamp(player.x, 20, 1180);
        player.y = Phaser.Math.Clamp(player.y, 20, 780);
        
        // HP regen
        if (player.regen > 0) {
            this.gameState.healPlayer(player.regen * dt);
        }
        
        this.updatePlayerSprite();
    }

    updateShooting(dt) {
        this.shootTimer -= dt;
        
        if (this.shootTimer <= 0 && this.gameState.enemies.length > 0) {
            this.shoot();
            
            // Fire rate based on weapon
            const fireRates = {
                pistol: 0.5,
                shotgun: 1.0,
                smg: 0.1,
                rifle: 0.3,
                sniper: 1.5
            };
            this.shootTimer = (fireRates[this.gameState.player.weapon] || 0.5) / this.gameState.player.fireRate;
        }
    }

    shoot() {
        const player = this.gameState.player;
        let nearest = null;
        let nearestDist = Infinity;
        
        for (const enemy of this.gameState.enemies) {
            const dist = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = enemy;
            }
        }
        
        if (!nearest) return;
        
        const angle = Math.atan2(nearest.y - player.y, nearest.x - player.x);
        
        // Multishot
        for (let i = 0; i < player.multishot; i++) {
            const spreadAngle = angle + (i - (player.multishot - 1) / 2) * 0.2;
            
            if (player.weapon === 'shotgun') {
                for (let j = 0; j < 6; j++) {
                    const spread = spreadAngle + (Math.random() - 0.5) * 0.4;
                    this.createBullet(spread);
                }
            } else {
                this.createBullet(spreadAngle);
            }
        }
        
        if (window.audioManager) {
            window.audioManager.playWeaponSound(player.weapon);
        }
    }

    createBullet(angle) {
        const player = this.gameState.player;
        
        // Crit chance
        let damage = 15 * player.damage;
        if (Math.random() < player.critChance) {
            damage *= 2;
        }
        
        const bullet = new Bullet(player.x, player.y, angle, player.weapon, damage, player.pierce);
        bullet.sprite = this.add.circle(bullet.x, bullet.y, 4, 0xffff00);
        this.gameState.bullets.push(bullet);
    }

    updateEnemies(dt) {
        const player = this.gameState.player;
        
        for (let i = this.gameState.enemies.length - 1; i >= 0; i--) {
            const enemy = this.gameState.enemies[i];
            enemy.update(player.x, player.y, dt);
            
            if (enemy.sprite) {
                enemy.sprite.x = enemy.x;
                enemy.sprite.y = enemy.y;
            }
            
            // Check collision with player
            const dist = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
            if (dist < 20) {
                this.gameState.damagePlayer(enemy.damage * dt);
            }
        }
    }

    updateBullets(dt) {
        for (let i = this.gameState.bullets.length - 1; i >= 0; i--) {
            const bullet = this.gameState.bullets[i];
            const dead = bullet.update(dt);
            
            if (bullet.sprite) {
                bullet.sprite.x = bullet.x;
                bullet.sprite.y = bullet.y;
            }
            
            if (dead) {
                if (bullet.sprite) bullet.sprite.destroy();
                this.gameState.bullets.splice(i, 1);
                continue;
            }
            
            for (let j = this.gameState.enemies.length - 1; j >= 0; j--) {
                const enemy = this.gameState.enemies[j];
                
                if (bullet.hitEnemies.includes(enemy)) continue;
                
                const dist = Phaser.Math.Distance.Between(bullet.x, bullet.y, enemy.x, enemy.y);
                
                if (dist < enemy.size) {
                    const killed = enemy.takeDamage(bullet.damage);
                    bullet.hitEnemies.push(enemy);
                    
                    if (window.audioManager) {
                        window.audioManager.playHitSound();
                    }
                    
                    if (killed) {
                        this.killEnemy(enemy, j);
                    }
                    
                    if (bullet.pierce <= 0) {
                        if (bullet.sprite) bullet.sprite.destroy();
                        this.gameState.bullets.splice(i, 1);
                        break;
                    } else {
                        bullet.pierce--;
                    }
                }
            }
        }
    }

    killEnemy(enemy, index) {
        this.gameState.kills++;
        this.gameState.enemiesKilledThisWave++;
        
        // Drop XP (color-coded)
        this.createXPDrop(enemy.type, enemy.x, enemy.y, enemy.xpValue);
        
        // Item drops (random)
        const roll = Math.random();
        if (roll < 0.08) this.createItemDrop('health', enemy.x, enemy.y);
        else if (roll < 0.12) this.createItemDrop('xpBoost', enemy.x, enemy.y);
        else if (roll < 0.15) this.createItemDrop('damageBoost', enemy.x, enemy.y);
        else if (roll < 0.17) this.createItemDrop('bomb', enemy.x, enemy.y);
        else if (roll < 0.19) this.createItemDrop('magnet', enemy.x, enemy.y);
        
        // Explosive kills
        if (this.gameState.player.explosiveKills) {
            this.createExplosion(enemy.x, enemy.y);
        }
        
        // Lifesteal
        if (this.gameState.player.lifesteal > 0) {
            this.gameState.healPlayer(enemy.maxHealth * this.gameState.player.lifesteal);
        }
        
        if (enemy.sprite) enemy.sprite.destroy();
        this.gameState.enemies.splice(index, 1);
        
        if (window.audioManager) {
            window.audioManager.playKillSound();
        }
        
        if (this.gameState.enemiesKilledThisWave >= this.gameState.enemiesThisWave) {
            this.gameState.endWave();
        }
    }

    createXPDrop(enemyType, x, y, amount) {
        const xpDrop = new XPDrop(enemyType, x, y, amount);
        xpDrop.sprite = this.add.circle(x, y, 6, xpDrop.color);
        xpDrop.text = this.add.text(x, y, `+${amount}`, {
            fontSize: '12px', color: '#fff', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.gameState.xpDrops.push(xpDrop);
    }

    createItemDrop(type, x, y) {
        const item = new ItemDrop(type, x, y);
        item.sprite = this.add.circle(x, y, item.size, item.color);
        item.textObj = this.add.text(x, y, item.icon, {
            fontSize: '20px'
        }).setOrigin(0.5);
        this.gameState.itemDrops.push(item);
    }

    createExplosion(x, y) {
        const explosionRadius = 80;
        for (const enemy of this.gameState.enemies) {
            const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
            if (dist < explosionRadius) {
                enemy.takeDamage(this.gameState.player.damage * 30);
            }
        }
        
        const circle = this.add.circle(x, y, explosionRadius, 0xff6600, 0.5);
        this.tweens.add({
            targets: circle,
            alpha: 0,
            scale: 1.5,
            duration: 300,
            onComplete: () => circle.destroy()
        });
    }

    updateXPDrops(dt) {
        const player = this.gameState.player;
        
        for (let i = this.gameState.xpDrops.length - 1; i >= 0; i--) {
            const xp = this.gameState.xpDrops[i];
            const dead = xp.update(dt, player.x, player.y, player.pickupRange);
            
            if (xp.sprite) {
                xp.sprite.x = xp.x;
                xp.sprite.y = xp.y;
            }
            if (xp.text) {
                xp.text.x = xp.x;
                xp.text.y = xp.y - 15;
            }
            
            if (dead) {
                if (xp.sprite) xp.sprite.destroy();
                if (xp.text) xp.text.destroy();
                this.gameState.xpDrops.splice(i, 1);
                continue;
            }
            
            const dist = Phaser.Math.Distance.Between(player.x, player.y, xp.x, xp.y);
            if (dist < 25) {
                this.gameState.addXP(xp.amount);
                if (xp.sprite) xp.sprite.destroy();
                if (xp.text) xp.text.destroy();
                this.gameState.xpDrops.splice(i, 1);
                
                if (window.audioManager) {
                    window.audioManager.playPickupSound();
                }
            }
        }
    }

    updateItemDrops(dt) {
        const player = this.gameState.player;
        
        for (let i = this.gameState.itemDrops.length - 1; i >= 0; i--) {
            const item = this.gameState.itemDrops[i];
            const dead = item.update(dt, player.x, player.y, player.pickupRange);
            
            if (item.sprite) {
                item.sprite.x = item.x;
                item.sprite.y = item.y;
            }
            if (item.textObj) {
                item.textObj.x = item.x;
                item.textObj.y = item.y;
            }
            
            if (dead) {
                if (item.sprite) item.sprite.destroy();
                if (item.textObj) item.textObj.destroy();
                this.gameState.itemDrops.splice(i, 1);
                continue;
            }
            
            const dist = Phaser.Math.Distance.Between(player.x, player.y, item.x, item.y);
            if (dist < 30) {
                this.collectItem(item);
                if (item.sprite) item.sprite.destroy();
                if (item.textObj) item.textObj.destroy();
                this.gameState.itemDrops.splice(i, 1);
            }
        }
    }

    collectItem(item) {
        switch (item.type) {
            case 'health':
                this.gameState.healPlayer(30);
                break;
            case 'xpBoost':
                this.gameState.xpBoostTimer = 10;
                this.gameState.xpBoostMultiplier = 2.0;
                break;
            case 'damageBoost':
                this.gameState.damageBoostTimer = 10;
                this.gameState.player.damage *= 1.5;
                break;
            case 'bomb':
                this.createExplosion(this.gameState.player.x, this.gameState.player.y);
                break;
            case 'magnet':
                this.gameState.player.pickupRange = 300;
                setTimeout(() => {
                    this.gameState.player.pickupRange = 50;
                }, 8000);
                break;
        }
        
        if (window.audioManager) {
            window.audioManager.playPickupSound();
        }
    }

    updateWave(dt) {
        if (!this.gameState.waveActive) return;
        
        this.gameState.spawnTimer += dt;
        
        // Spawn enemies periodically
        if (this.gameState.spawnTimer >= 1.0 && this.gameState.enemies.length < this.gameState.enemiesThisWave) {
            this.spawnEnemy();
            this.gameState.spawnTimer = 0;
        }
    }

    spawnEnemy() {
        const wave = this.gameState.wave;
        let type;
        
        // Wave-based enemy selection
        if (wave <= 3) {
            type = 'green';
        } else if (wave <= 7) {
            type = Math.random() < 0.7 ? 'green' : 'yellow';
        } else if (wave <= 12) {
            const roll = Math.random();
            if (roll < 0.4) type = 'green';
            else if (roll < 0.7) type = 'yellow';
            else type = 'red';
        } else if (wave <= 20) {
            const roll = Math.random();
            if (roll < 0.3) type = 'yellow';
            else if (roll < 0.6) type = 'red';
            else type = 'blue';
        } else {
            const roll = Math.random();
            if (roll < 0.2) type = 'red';
            else if (roll < 0.5) type = 'blue';
            else type = 'purple';
        }
        
        // Random edge position
        const edge = Math.floor(Math.random() * 4);
        let x, y;
        
        switch (edge) {
            case 0: x = Math.random() * 1200; y = -20; break;
            case 1: x = 1220; y = Math.random() * 800; break;
            case 2: x = Math.random() * 1200; y = 820; break;
            case 3: x = -20; y = Math.random() * 800; break;
        }
        
        const enemy = new Enemy(type, x, y, wave);
        enemy.sprite = this.add.circle(x, y, enemy.size, enemy.color);
        this.gameState.enemies.push(enemy);
    }

    updateUI() {
        const player = this.gameState.player;
        
        // Health bar
        const healthPercent = player.health / player.maxHealth;
        this.healthBar.scaleX = healthPercent;
        this.healthText.setText(`${Math.ceil(player.health)}/${player.maxHealth}`);
        
        // Wave
        this.waveText.setText(`Wave: ${this.gameState.wave}`);
        
        // Level
        this.levelText.setText(`Level: ${player.level}`);
        
        // Kills
        this.killsText.setText(`Kills: ${this.gameState.kills}`);
        
        // XP bar
        const xpPercent = player.xp / player.xpToNext;
        this.xpBar.scaleX = xpPercent * 11; // Scale to fit 1100px width
        this.xpText.setText(`${Math.floor(player.xp)}/${player.xpToNext}`);
    }
}

// Initialize game
window.addEventListener('load', () => {
    const config = {
        type: Phaser.AUTO,
        width: 1200,
        height: 800,
        parent: 'game-container',
        backgroundColor: '#000000',
        scene: ArenaScene,
        physics: {
            default: 'arcade',
            arcade: {
                debug: false
            }
        }
    };

    const game = new Phaser.Game(config);
    console.log('🎮 Egg Arena started!');
});
