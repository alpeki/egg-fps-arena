// Simple Audio System for Egg-FPS Arena
// Uses Web Audio API for sound generation

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.3;
        this.enabled = true;
        this.init();
    }

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log("✅ Audio system initialized");
        } catch (e) {
            console.warn("⚠️ Web Audio API not supported");
            this.enabled = false;
        }
    }

    playShootSound() {
        if (!this.enabled || !this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Shoot sound: quick high-pitched beep
        oscillator.frequency.setValueAtTime(800, now);
        oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.1);
        
        gainNode.gain.setValueAtTime(this.masterVolume * 0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        oscillator.start(now);
        oscillator.stop(now + 0.1);
    }

    playHitSound() {
        if (!this.enabled || !this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Hit sound: sharp impact
        oscillator.frequency.setValueAtTime(300, now);
        oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.15);
        
        gainNode.gain.setValueAtTime(this.masterVolume * 0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        oscillator.start(now);
        oscillator.stop(now + 0.15);
    }

    playKillSound() {
        if (!this.enabled || !this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        // Multi-tone kill sound
        for (let i = 0; i < 3; i++) {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            const freq = 400 - (i * 100);
            oscillator.frequency.setValueAtTime(freq, now + (i * 0.05));
            oscillator.frequency.exponentialRampToValueAtTime(freq * 0.5, now + (i * 0.05) + 0.2);
            
            gainNode.gain.setValueAtTime(this.masterVolume * 0.3, now + (i * 0.05));
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + (i * 0.05) + 0.2);
            
            oscillator.start(now + (i * 0.05));
            oscillator.stop(now + (i * 0.05) + 0.2);
        }
    }

    playDeathSound() {
        if (!this.enabled || !this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Death sound: descending tone
        oscillator.frequency.setValueAtTime(600, now);
        oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.5);
        
        gainNode.gain.setValueAtTime(this.masterVolume * 0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        
        oscillator.start(now);
        oscillator.stop(now + 0.5);
    }

    playRespawnSound() {
        if (!this.enabled || !this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Respawn sound: ascending tone
        oscillator.frequency.setValueAtTime(200, now);
        oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.3);
        
        gainNode.gain.setValueAtTime(this.masterVolume * 0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        oscillator.start(now);
        oscillator.stop(now + 0.3);
    }

    playConnectSound() {
        if (!this.enabled || !this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        // Two-tone connect sound
        [400, 600].forEach((freq, i) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(freq, now + (i * 0.1));
            
            gainNode.gain.setValueAtTime(this.masterVolume * 0.3, now + (i * 0.1));
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + (i * 0.1) + 0.15);
            
            oscillator.start(now + (i * 0.1));
            oscillator.stop(now + (i * 0.1) + 0.15);
        });
    }

    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

// Export for use in game.js
window.AudioManager = AudioManager;
