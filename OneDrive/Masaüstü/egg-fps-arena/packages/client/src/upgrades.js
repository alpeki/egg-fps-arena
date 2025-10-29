// Upgrade System for Level-Ups

class UpgradeSystem {
    constructor() {
        this.upgrades = this.defineUpgrades();
        this.createUpgradeUI();
    }

    defineUpgrades() {
        return {
            // Common (Green) - Basic upgrades
            damage: {
                name: "Damage Boost",
                description: "+10% weapon damage",
                icon: "⚔️",
                rarity: 'common',
                apply: (player) => {
                    player.damage *= 1.1;
                }
            },
            fireRate: {
                name: "Faster Shooting",
                description: "+15% fire rate",
                icon: "⚡",
                rarity: 'common',
                apply: (player) => {
                    player.fireRate *= 1.15;
                }
            },
            maxHealth: {
                name: "Max Health",
                description: "+20 maximum HP",
                icon: "❤️",
                rarity: 'common',
                apply: (player) => {
                    player.maxHealth += 20;
                    player.health += 20;
                }
            },
            speed: {
                name: "Movement Speed",
                description: "+10% move speed",
                icon: "👟",
                rarity: 'common',
                apply: (player) => {
                    player.speed *= 1.1;
                }
            },
            
            // Rare (Blue)
            range: {
                name: "Extended Range",
                description: "+20% bullet range",
                icon: "🎯",
                rarity: 'rare',
                apply: (player) => {
                    player.range *= 1.2;
                }
            },
            pierce: {
                name: "Piercing Shots",
                description: "Bullets pierce +1 enemy",
                icon: "🔫",
                rarity: 'rare',
                apply: (player) => {
                    player.pierce = (player.pierce || 0) + 1;
                }
            },
            regen: {
                name: "HP Regeneration",
                description: "+1 HP per second",
                icon: "💚",
                rarity: 'rare',
                apply: (player) => {
                    player.regen = (player.regen || 0) + 1;
                }
            },
            pickupRange: {
                name: "Pickup Magnet",
                description: "+50% pickup range",
                icon: "🧲",
                rarity: 'rare',
                apply: (player) => {
                    player.pickupRange = (player.pickupRange || 30) * 1.5;
                }
            },
            
            // Epic (Purple)
            crit: {
                name: "Critical Hits",
                description: "+5% crit chance (2x damage)",
                icon: "💥",
                rarity: 'epic',
                apply: (player) => {
                    player.critChance = (player.critChance || 0) + 0.05;
                }
            },
            lifesteal: {
                name: "Lifesteal",
                description: "+2% damage heals you",
                icon: "🩸",
                rarity: 'epic',
                apply: (player) => {
                    player.lifesteal = (player.lifesteal || 0) + 0.02;
                }
            },
            multishot: {
                name: "Multishot",
                description: "+1 projectile per shot",
                icon: "🎆",
                rarity: 'epic',
                apply: (player) => {
                    player.multishot = (player.multishot || 1) + 1;
                }
            },
            
            // Legendary (Gold)
            explosion: {
                name: "Explosive Kills",
                description: "Enemies explode on death",
                icon: "💣",
                rarity: 'legendary',
                apply: (player) => {
                    player.explosiveKills = true;
                }
            }
        };
    }

    createUpgradeUI() {
        const container = document.createElement('div');
        container.id = 'upgrade-screen';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 3000;
        `;

        container.innerHTML = `
            <div style="text-align: center;">
                <h1 style="color: #00ff00; font-size: 64px; margin-bottom: 20px; text-shadow: 0 0 20px rgba(0, 255, 0, 0.8);">
                    ⬆️ LEVEL UP!
                </h1>
                <p style="color: #fff; font-size: 24px; margin-bottom: 50px;">
                    Choose your upgrade
                </p>
                <div id="upgrade-options" style="display: flex; gap: 30px; justify-content: center;">
                    <!-- Upgrade cards will be inserted here -->
                </div>
            </div>
        `;

        document.body.appendChild(container);
        this.upgradeScreen = container;
    }

    show(player, wave, callback) {
        // Wave-based rarity chances
        let rarityChances;
        if (wave <= 5) {
            rarityChances = { common: 0.9, rare: 0.1, epic: 0, legendary: 0 };
        } else if (wave <= 10) {
            rarityChances = { common: 0.7, rare: 0.25, epic: 0.05, legendary: 0 };
        } else if (wave <= 20) {
            rarityChances = { common: 0.5, rare: 0.35, epic: 0.13, legendary: 0.02 };
        } else {
            rarityChances = { common: 0.3, rare: 0.4, epic: 0.25, legendary: 0.05 };
        }
        
        // Select 3 upgrades based on rarity
        const selected = [];
        const allUpgrades = Object.entries(this.upgrades);
        
        for (let i = 0; i < 3; i++) {
            const roll = Math.random();
            let targetRarity;
            
            if (roll < rarityChances.legendary) targetRarity = 'legendary';
            else if (roll < rarityChances.legendary + rarityChances.epic) targetRarity = 'epic';
            else if (roll < rarityChances.legendary + rarityChances.epic + rarityChances.rare) targetRarity = 'rare';
            else targetRarity = 'common';
            
            // Get upgrades of target rarity
            const rarityUpgrades = allUpgrades.filter(([key, up]) => 
                up.rarity === targetRarity && !selected.includes(key)
            );
            
            if (rarityUpgrades.length > 0) {
                const [key] = rarityUpgrades[Math.floor(Math.random() * rarityUpgrades.length)];
                selected.push(key);
            } else {
                // Fallback to any available upgrade
                const available = allUpgrades.filter(([key]) => !selected.includes(key));
                if (available.length > 0) {
                    const [key] = available[Math.floor(Math.random() * available.length)];
                    selected.push(key);
                }
            }
        }

        // Create upgrade cards
        const optionsContainer = document.getElementById('upgrade-options');
        optionsContainer.innerHTML = '';

        selected.forEach(upgradeKey => {
            const upgrade = this.upgrades[upgradeKey];
            const card = this.createUpgradeCard(upgrade, () => {
                upgrade.apply(player);
                this.hide();
                callback();
                
                if (window.audioManager) {
                    window.audioManager.playLevelUpSound();
                }
            });
            optionsContainer.appendChild(card);
        });

        this.upgradeScreen.style.display = 'flex';
    }

    createUpgradeCard(upgrade, onClick) {
        // Rarity colors
        const rarityColors = {
            common: { border: '#00ff00', bg: 'rgba(0, 100, 0, 0.3)', text: '#00ff00', glow: 'rgba(0, 255, 0, 0.3)' },
            rare: { border: '#0088ff', bg: 'rgba(0, 50, 150, 0.3)', text: '#0088ff', glow: 'rgba(0, 136, 255, 0.3)' },
            epic: { border: '#ff00ff', bg: 'rgba(100, 0, 100, 0.3)', text: '#ff00ff', glow: 'rgba(255, 0, 255, 0.3)' },
            legendary: { border: '#ffaa00', bg: 'rgba(150, 80, 0, 0.3)', text: '#ffaa00', glow: 'rgba(255, 170, 0, 0.3)' }
        };
        
        const colors = rarityColors[upgrade.rarity] || rarityColors.common;
        
        const card = document.createElement('div');
        card.style.cssText = `
            width: 300px;
            padding: 30px;
            background: linear-gradient(135deg, ${colors.bg}, rgba(0, 0, 0, 0.5));
            border: 3px solid ${colors.border};
            border-radius: 15px;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 0 20px ${colors.glow};
        `;

        card.innerHTML = `
            <div style="font-size: 64px; margin-bottom: 15px;">${upgrade.icon}</div>
            <h3 style="color: ${colors.text}; font-size: 24px; margin-bottom: 10px;">${upgrade.name}</h3>
            <p style="color: #ccc; font-size: 16px;">${upgrade.description}</p>
            <p style="color: ${colors.text}; font-size: 14px; margin-top: 10px; font-weight: bold; text-transform: uppercase;">${upgrade.rarity}</p>
        `;

        card.addEventListener('mouseenter', () => {
            card.style.transform = 'scale(1.05) translateY(-10px)';
            card.style.boxShadow = `0 10px 40px ${colors.glow.replace('0.3', '0.8')}`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'scale(1) translateY(0)';
            card.style.boxShadow = `0 0 20px ${colors.glow}`;
        });

        card.addEventListener('click', onClick);

        return card;
    }

    hide() {
        this.upgradeScreen.style.display = 'none';
    }
}

// Boss reward system
class BossRewardSystem {
    constructor() {
        this.rewards = this.defineRewards();
        this.createRewardUI();
    }

    defineRewards() {
        return {
            unlockShotgun: {
                name: "Unlock Shotgun",
                description: "Close-range devastation",
                icon: "🔫",
                condition: (player) => player.level >= 3,
                apply: (player) => {
                    player.unlockedWeapons = player.unlockedWeapons || ['pistol'];
                    if (!player.unlockedWeapons.includes('shotgun')) {
                        player.unlockedWeapons.push('shotgun');
                    }
                }
            },
            unlockSMG: {
                name: "Unlock SMG",
                description: "Rapid-fire madness",
                icon: "🔫",
                condition: (player) => player.level >= 6,
                apply: (player) => {
                    player.unlockedWeapons = player.unlockedWeapons || ['pistol'];
                    if (!player.unlockedWeapons.includes('smg')) {
                        player.unlockedWeapons.push('smg');
                    }
                }
            },
            unlockRifle: {
                name: "Unlock Rifle",
                description: "Balanced firepower",
                icon: "🔫",
                condition: (player) => player.level >= 10,
                apply: (player) => {
                    player.unlockedWeapons = player.unlockedWeapons || ['pistol'];
                    if (!player.unlockedWeapons.includes('rifle')) {
                        player.unlockedWeapons.push('rifle');
                    }
                }
            },
            unlockSniper: {
                name: "Unlock Sniper",
                description: "One-shot eliminator",
                icon: "🔫",
                condition: (player) => player.level >= 15,
                apply: (player) => {
                    player.unlockedWeapons = player.unlockedWeapons || ['pistol'];
                    if (!player.unlockedWeapons.includes('sniper')) {
                        player.unlockedWeapons.push('sniper');
                    }
                }
            },
            permanentDamage: {
                name: "Permanent Damage",
                description: "+25% all damage forever",
                icon: "⚔️",
                apply: (player) => {
                    player.damage *= 1.25;
                }
            },
            permanentHealth: {
                name: "Permanent Health",
                description: "+50 max HP forever",
                icon: "❤️",
                apply: (player) => {
                    player.maxHealth += 50;
                    player.health += 50;
                }
            },
            dashAbility: {
                name: "Dash Ability",
                description: "Press SPACE to dash",
                icon: "💨",
                apply: (player) => {
                    player.hasDash = true;
                    player.dashCooldown = 0;
                }
            },
            shieldAbility: {
                name: "Shield Ability",
                description: "Absorb 3 hits per wave",
                icon: "🛡️",
                apply: (player) => {
                    player.shield = 3;
                }
            }
        };
    }

    createRewardUI() {
        const container = document.createElement('div');
        container.id = 'boss-reward-screen';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 3000;
        `;

        container.innerHTML = `
            <div style="text-align: center;">
                <h1 style="color: #ff0000; font-size: 72px; margin-bottom: 20px; text-shadow: 0 0 30px rgba(255, 0, 0, 0.8);">
                    👑 BOSS DEFEATED!
                </h1>
                <p style="color: #fff; font-size: 28px; margin-bottom: 50px;">
                    Choose your permanent reward
                </p>
                <div id="boss-reward-options" style="display: flex; gap: 30px; justify-content: center;">
                    <!-- Reward cards will be inserted here -->
                </div>
            </div>
        `;

        document.body.appendChild(container);
        this.rewardScreen = container;
    }

    show(player, callback) {
        // Get available rewards
        const availableRewards = Object.keys(this.rewards).filter(key => {
            const reward = this.rewards[key];
            return !reward.condition || reward.condition(player);
        });

        // Select 3 random rewards
        const selected = [];
        for (let i = 0; i < Math.min(3, availableRewards.length); i++) {
            const index = Math.floor(Math.random() * availableRewards.length);
            selected.push(availableRewards[index]);
            availableRewards.splice(index, 1);
        }

        // Create reward cards
        const optionsContainer = document.getElementById('boss-reward-options');
        optionsContainer.innerHTML = '';

        selected.forEach(rewardKey => {
            const reward = this.rewards[rewardKey];
            const card = this.createRewardCard(reward, () => {
                reward.apply(player);
                this.hide();
                callback();
            });
            optionsContainer.appendChild(card);
        });

        this.rewardScreen.style.display = 'flex';
    }

    createRewardCard(reward, onClick) {
        const card = document.createElement('div');
        card.style.cssText = `
            width: 320px;
            padding: 40px;
            background: linear-gradient(135deg, rgba(100, 0, 0, 0.4), rgba(50, 0, 0, 0.4));
            border: 4px solid #ff0000;
            border-radius: 15px;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 0 30px rgba(255, 0, 0, 0.4);
        `;

        card.innerHTML = `
            <div style="font-size: 72px; margin-bottom: 20px;">${reward.icon}</div>
            <h3 style="color: #ff0000; font-size: 26px; margin-bottom: 15px;">${reward.name}</h3>
            <p style="color: #ccc; font-size: 18px;">${reward.description}</p>
        `;

        card.addEventListener('mouseenter', () => {
            card.style.transform = 'scale(1.08) translateY(-15px)';
            card.style.boxShadow = '0 15px 50px rgba(255, 0, 0, 0.7)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'scale(1) translateY(0)';
            card.style.boxShadow = '0 0 30px rgba(255, 0, 0, 0.4)';
        });

        card.addEventListener('click', onClick);

        return card;
    }

    hide() {
        this.rewardScreen.style.display = 'none';
    }
}

// Create global instances
window.upgradeSystem = new UpgradeSystem();
window.bossRewardSystem = new BossRewardSystem();
