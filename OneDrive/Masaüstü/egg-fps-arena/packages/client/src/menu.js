// Menu System for Egg-FPS Arena

class MenuSystem {
    constructor() {
        this.currentMenu = null;
        this.gameStarted = false;
        this.createMainMenu();
        this.createPauseMenu();
        this.createSettingsMenu();
        this.createGameOverMenu();
    }

    createMainMenu() {
        const menu = document.createElement('div');
        menu.id = 'main-menu';
        menu.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            display: none;
        `;

        menu.innerHTML = `
            <h1 style="color: #00ff00; font-size: 64px; text-shadow: 0 0 20px rgba(0, 255, 0, 0.8); margin-bottom: 50px;">
                🥚 EGG-FPS ARENA
            </h1>
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <button class="menu-btn" onclick="menuSystem.startGame()" style="
                    padding: 20px 60px;
                    font-size: 24px;
                    background: linear-gradient(135deg, #00ff00, #00aa00);
                    color: #000;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.3s;
                    box-shadow: 0 4px 15px rgba(0, 255, 0, 0.4);
                ">
                    ▶ START GAME
                </button>
                <button class="menu-btn" onclick="menuSystem.showSettings()" style="
                    padding: 15px 50px;
                    font-size: 20px;
                    background: rgba(0, 255, 0, 0.2);
                    color: #00ff00;
                    border: 2px solid #00ff00;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.3s;
                ">
                    ⚙ SETTINGS
                </button>
            </div>
            <div style="position: absolute; bottom: 30px; color: #666; font-size: 14px;">
                Press ESC to pause during game
            </div>
        `;

        document.body.appendChild(menu);
        this.mainMenu = menu;
    }

    createPauseMenu() {
        const menu = document.createElement('div');
        menu.id = 'pause-menu';
        menu.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: none;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;

        menu.innerHTML = `
            <h2 style="color: #00ff00; font-size: 48px; margin-bottom: 40px;">PAUSED</h2>
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <button class="menu-btn" onclick="menuSystem.resumeGame()" style="
                    padding: 15px 50px;
                    font-size: 20px;
                    background: linear-gradient(135deg, #00ff00, #00aa00);
                    color: #000;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                ">
                    ▶ RESUME
                </button>
                <button class="menu-btn" onclick="menuSystem.showSettings()" style="
                    padding: 15px 50px;
                    font-size: 20px;
                    background: rgba(0, 255, 0, 0.2);
                    color: #00ff00;
                    border: 2px solid #00ff00;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                ">
                    ⚙ SETTINGS
                </button>
                <button class="menu-btn" onclick="menuSystem.quitToMenu()" style="
                    padding: 15px 50px;
                    font-size: 20px;
                    background: rgba(255, 0, 0, 0.2);
                    color: #ff0000;
                    border: 2px solid #ff0000;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                ">
                    ✕ QUIT TO MENU
                </button>
            </div>
        `;

        document.body.appendChild(menu);
        this.pauseMenu = menu;
    }

    createSettingsMenu() {
        const menu = document.createElement('div');
        menu.id = 'settings-menu';
        menu.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(10, 10, 10, 0.98);
            border: 3px solid #00ff00;
            border-radius: 12px;
            padding: 40px;
            z-index: 2100;
            display: none;
            min-width: 500px;
        `;

        menu.innerHTML = `
            <h2 style="color: #00ff00; margin-bottom: 30px; text-align: center;">⚙ SETTINGS</h2>
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <label style="color: #fff; font-size: 18px;">Master Volume</label>
                    <input type="range" id="volume-slider" min="0" max="100" value="30" style="width: 200px;">
                    <span id="volume-value" style="color: #00ff00; width: 50px;">30%</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <label style="color: #fff; font-size: 18px;">Sound Effects</label>
                    <input type="checkbox" id="sfx-toggle" checked style="width: 30px; height: 30px;">
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <label style="color: #fff; font-size: 18px;">Show FPS</label>
                    <input type="checkbox" id="fps-toggle" style="width: 30px; height: 30px;">
                </div>
            </div>
            <button onclick="menuSystem.closeSettings()" style="
                margin-top: 30px;
                width: 100%;
                padding: 15px;
                font-size: 18px;
                background: linear-gradient(135deg, #00ff00, #00aa00);
                color: #000;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
            ">
                ✓ APPLY & CLOSE
            </button>
        `;

        document.body.appendChild(menu);
        this.settingsMenu = menu;
        this.setupSettingsHandlers();
    }

    createGameOverMenu() {
        const menu = document.createElement('div');
        menu.id = 'gameover-menu';
        menu.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            display: none;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;

        menu.innerHTML = `
            <h1 id="gameover-title" style="color: #00ff00; font-size: 64px; margin-bottom: 30px;">GAME OVER</h1>
            <div id="gameover-stats" style="
                background: rgba(0, 255, 0, 0.1);
                border: 2px solid #00ff00;
                border-radius: 12px;
                padding: 30px 60px;
                margin-bottom: 40px;
            ">
                <div style="color: #fff; font-size: 24px; text-align: center;">
                    <div style="margin: 10px 0;">Final Score: <span id="final-score" style="color: #00ff00; font-weight: bold;">0</span></div>
                    <div style="margin: 10px 0;">Kills: <span id="final-kills" style="color: #00ff00; font-weight: bold;">0</span></div>
                    <div style="margin: 10px 0;">Deaths: <span id="final-deaths" style="color: #00ff00; font-weight: bold;">0</span></div>
                    <div style="margin: 10px 0;">K/D Ratio: <span id="final-kd" style="color: #00ff00; font-weight: bold;">0.00</span></div>
                </div>
            </div>
            <div style="display: flex; gap: 20px;">
                <button onclick="menuSystem.playAgain()" style="
                    padding: 20px 50px;
                    font-size: 22px;
                    background: linear-gradient(135deg, #00ff00, #00aa00);
                    color: #000;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                ">
                    🔄 PLAY AGAIN
                </button>
                <button onclick="menuSystem.quitToMenu()" style="
                    padding: 20px 50px;
                    font-size: 22px;
                    background: rgba(255, 0, 0, 0.2);
                    color: #ff0000;
                    border: 2px solid #ff0000;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                ">
                    ✕ MAIN MENU
                </button>
            </div>
        `;

        document.body.appendChild(menu);
        this.gameOverMenu = menu;
    }

    setupSettingsHandlers() {
        const volumeSlider = document.getElementById('volume-slider');
        const volumeValue = document.getElementById('volume-value');
        
        volumeSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            volumeValue.textContent = value + '%';
            if (window.gameClient && window.gameClient.audio) {
                window.gameClient.audio.setVolume(value / 100);
            }
        });

        const sfxToggle = document.getElementById('sfx-toggle');
        sfxToggle.addEventListener('change', (e) => {
            if (window.gameClient && window.gameClient.audio) {
                window.gameClient.audio.enabled = e.target.checked;
            }
        });
    }

    show(menuName) {
        this.hideAll();
        const menu = this[menuName + 'Menu'];
        if (menu) {
            menu.style.display = 'flex';
            this.currentMenu = menuName;
        }
    }

    hideAll() {
        this.mainMenu.style.display = 'none';
        this.pauseMenu.style.display = 'none';
        this.settingsMenu.style.display = 'none';
        this.gameOverMenu.style.display = 'none';
        this.currentMenu = null;
    }

    startGame() {
        this.hideAll();
        this.gameStarted = true;
        if (window.gameClient) {
            window.gameClient.connectToServer();
        }
    }

    resumeGame() {
        this.hideAll();
    }

    showSettings() {
        this.settingsMenu.style.display = 'block';
    }

    closeSettings() {
        this.settingsMenu.style.display = 'none';
    }

    quitToMenu() {
        this.hideAll();
        this.show('main');
        this.gameStarted = false;
        // Disconnect from server
        if (window.gameClient && window.gameClient.room) {
            window.gameClient.room.leave();
        }
    }

    showGameOver(stats) {
        document.getElementById('final-score').textContent = stats.score || 0;
        document.getElementById('final-kills').textContent = stats.kills || 0;
        document.getElementById('final-deaths').textContent = stats.deaths || 0;
        const kd = stats.deaths > 0 ? (stats.kills / stats.deaths).toFixed(2) : stats.kills.toFixed(2);
        document.getElementById('final-kd').textContent = kd;
        this.show('gameOver');
    }

    playAgain() {
        this.hideAll();
        if (window.gameClient) {
            window.gameClient.connectToServer();
        }
    }

    togglePause() {
        if (!this.gameStarted) return;
        
        if (this.currentMenu === 'pause') {
            this.resumeGame();
        } else {
            this.show('pause');
        }
    }
}

// Create global instance
window.menuSystem = new MenuSystem();

// ESC key handler
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        window.menuSystem.togglePause();
    }
});
