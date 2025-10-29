// Scoreboard System for Egg-FPS Arena

class Scoreboard {
    constructor() {
        this.players = new Map();
        this.visible = false;
        this.createScoreboardUI();
    }

    createScoreboardUI() {
        const scoreboard = document.createElement('div');
        scoreboard.id = 'scoreboard';
        scoreboard.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(10, 10, 10, 0.95);
            border: 3px solid #00ff00;
            border-radius: 12px;
            padding: 20px;
            min-width: 500px;
            max-height: 70vh;
            overflow-y: auto;
            display: none;
            z-index: 1000;
            box-shadow: 0 0 30px rgba(0, 255, 0, 0.5);
        `;

        scoreboard.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #00ff00; margin: 0; font-size: 28px; text-shadow: 0 0 10px rgba(0, 255, 0, 0.8);">
                    🏆 SCOREBOARD
                </h2>
                <p style="color: #888; margin: 5px 0; font-size: 12px;">Press TAB to toggle</p>
            </div>
            <table id="scoreboard-table" style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: rgba(0, 255, 0, 0.1); border-bottom: 2px solid #00ff00;">
                        <th style="padding: 10px; text-align: left; color: #00ff00;">#</th>
                        <th style="padding: 10px; text-align: left; color: #00ff00;">Player</th>
                        <th style="padding: 10px; text-align: center; color: #00ff00;">Score</th>
                        <th style="padding: 10px; text-align: center; color: #00ff00;">Health</th>
                        <th style="padding: 10px; text-align: center; color: #00ff00;">Status</th>
                    </tr>
                </thead>
                <tbody id="scoreboard-body">
                </tbody>
            </table>
        `;

        document.body.appendChild(scoreboard);
        this.scoreboardEl = scoreboard;
        this.tableBody = document.getElementById('scoreboard-body');
    }

    updatePlayers(playersData, currentPlayerId) {
        this.players.clear();
        
        // Convert to array and sort by score
        const playerArray = [];
        if (playersData instanceof Map) {
            playersData.forEach((player, id) => {
                playerArray.push({ id, ...player });
            });
        } else if (typeof playersData === 'object') {
            Object.entries(playersData).forEach(([id, player]) => {
                playerArray.push({ id, ...player });
            });
        }

        // Sort by score descending
        playerArray.sort((a, b) => b.score - a.score);

        // Update table
        this.tableBody.innerHTML = playerArray.map((player, index) => {
            const isCurrentPlayer = player.id === currentPlayerId;
            const isBot = player.isBot;
            const isDead = player.isDead;
            
            const rowStyle = isCurrentPlayer 
                ? 'background: rgba(0, 255, 0, 0.2); font-weight: bold;'
                : index % 2 === 0 
                    ? 'background: rgba(255, 255, 255, 0.05);'
                    : '';

            const playerName = isBot 
                ? `🤖 Bot ${player.id.substring(4, 8)}`
                : isCurrentPlayer
                    ? '👤 You'
                    : `👤 ${player.id.substring(0, 8)}`;

            const statusEmoji = isDead ? '💀' : '✅';
            const healthColor = player.health > 66 ? '#00ff00' : player.health > 33 ? '#ffaa00' : '#ff0000';

            return `
                <tr style="${rowStyle}">
                    <td style="padding: 10px; color: #00ff00; font-size: 18px;">${index + 1}</td>
                    <td style="padding: 10px; color: ${isCurrentPlayer ? '#00ff00' : '#fff'};">
                        ${playerName}
                    </td>
                    <td style="padding: 10px; text-align: center; color: #00ff00; font-size: 18px; font-weight: bold;">
                        ${player.score}
                    </td>
                    <td style="padding: 10px; text-align: center; color: ${healthColor}; font-weight: bold;">
                        ${player.health}
                    </td>
                    <td style="padding: 10px; text-align: center; font-size: 18px;">
                        ${statusEmoji}
                    </td>
                </tr>
            `;
        }).join('');

        this.players = new Map(playerArray.map(p => [p.id, p]));
    }

    toggle() {
        this.visible = !this.visible;
        this.scoreboardEl.style.display = this.visible ? 'block' : 'none';
    }

    show() {
        this.visible = true;
        this.scoreboardEl.style.display = 'block';
    }

    hide() {
        this.visible = false;
        this.scoreboardEl.style.display = 'none';
    }
}

// Export
window.Scoreboard = Scoreboard;
