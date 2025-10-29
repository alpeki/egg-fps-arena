// Enhanced Audio System with Weapon-Specific Sounds

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

    // Weapon-specific sounds
    playWeaponSound(weaponType) {
        if (!this.enabled || !this.audioContext) return;

        switch (weaponType) {
            case 'pistol':
                this.playPistolSound();
                break;
            case 'shotgun':
                this.playShotgunSound();
                break;
            case 'smg':
                this.playSMGSound();
                break;
            case 'rifle':
                this.playRifleSound();
                break;
            case 'sniper':
                this.playSniperSound();
                break;
            default:
                this.playPistolSound();
        }
    }

    playPistolSound() {
        // Sharp "pew" sound
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
        
        gain.gain.setValueAtTime(this.masterVolume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        
        osc.start(now);
        osc.stop(now + 0.08);
    }

    playShotgunSound() {
        // Deep "boom" with echo
        const now = this.audioContext.currentTime;
        
        // Main boom
        const osc1 = this.audioContext.createOscillator();
        const gain1 = this.audioContext.createGain();
        
        osc1.connect(gain1);
        gain1.connect(this.audioContext.destination);
        
        osc1.frequency.setValueAtTime(150, now);
        osc1.frequency.exponentialRampToValueAtTime(50, now + 0.2);
        
        gain1.gain.setValueAtTime(this.masterVolume * 0.5, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        osc1.start(now);
        osc1.stop(now + 0.2);
        
        // Echo
        const osc2 = this.audioContext.createOscillator();
        const gain2 = this.audioContext.createGain();
        
        osc2.connect(gain2);
        gain2.connect(this.audioContext.destination);
        
        osc2.frequency.setValueAtTime(100, now + 0.1);
        osc2.frequency.exponentialRampToValueAtTime(40, now + 0.3);
        
        gain2.gain.setValueAtTime(this.masterVolume * 0.2, now + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        osc2.start(now + 0.1);
        osc2.stop(now + 0.3);
    }

    playSMGSound() {
        // Rapid "tat" sound
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.05);
        
        gain.gain.setValueAtTime(this.masterVolume * 0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        
        osc.start(now);
        osc.stop(now + 0.05);
    }

    playRifleSound() {
        // Crisp "crack" sound
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.frequency.setValueAtTime(1000, now);
        osc.frequency.exponentialRampToValueAtTime(250, now + 0.1);
        
        gain.gain.setValueAtTime(this.masterVolume * 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.start(now);
        osc.stop(now + 0.1);
    }

    playSniperSound() {
        // Loud "bang" with reverb
        const now = this.audioContext.currentTime;
        
        // Main bang
        const osc1 = this.audioContext.createOscillator();
        const gain1 = this.audioContext.createGain();
        
        osc1.connect(gain1);
        gain1.connect(this.audioContext.destination);
        
        osc1.frequency.setValueAtTime(1200, now);
        osc1.frequency.exponentialRampToValueAtTime(100, now + 0.3);
        
        gain1.gain.setValueAtTime(this.masterVolume * 0.6, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        osc1.start(now);
        osc1.stop(now + 0.3);
        
        // Reverb tail
        for (let i = 0; i < 3; i++) {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            const delay = 0.1 + (i * 0.08);
            osc.frequency.setValueAtTime(800 - (i * 200), now + delay);
            osc.frequency.exponentialRampToValueAtTime(100, now + delay + 0.2);
            
            gain.gain.setValueAtTime(this.masterVolume * 0.15, now + delay);
            gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.2);
            
            osc.start(now + delay);
            osc.stop(now + delay + 0.2);
        }
    }

    // Game sounds
    playHitSound() {
        if (!this.enabled || !this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
        
        gain.gain.setValueAtTime(this.masterVolume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.start(now);
        osc.stop(now + 0.1);
    }

    playKillSound() {
        if (!this.enabled || !this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        for (let i = 0; i < 3; i++) {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            const freq = 500 - (i * 100);
            osc.frequency.setValueAtTime(freq, now + (i * 0.05));
            osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + (i * 0.05) + 0.15);
            
            gain.gain.setValueAtTime(this.masterVolume * 0.25, now + (i * 0.05));
            gain.gain.exponentialRampToValueAtTime(0.01, now + (i * 0.05) + 0.15);
            
            osc.start(now + (i * 0.05));
            osc.stop(now + (i * 0.05) + 0.15);
        }
    }

    playLevelUpSound() {
        if (!this.enabled || !this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        // Ascending chime
        const notes = [400, 500, 600, 800];
        notes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.frequency.setValueAtTime(freq, now + (i * 0.1));
            
            gain.gain.setValueAtTime(this.masterVolume * 0.3, now + (i * 0.1));
            gain.gain.exponentialRampToValueAtTime(0.01, now + (i * 0.1) + 0.3);
            
            osc.start(now + (i * 0.1));
            osc.stop(now + (i * 0.1) + 0.3);
        });
    }

    playPickupSound() {
        if (!this.enabled || !this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
        
        gain.gain.setValueAtTime(this.masterVolume * 0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.start(now);
        osc.stop(now + 0.1);
    }

    playDamageSound() {
        if (!this.enabled || !this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
        
        gain.gain.setValueAtTime(this.masterVolume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        osc.start(now);
        osc.stop(now + 0.2);
    }

    playWaveStartSound() {
        if (!this.enabled || !this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        // Horn sound
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.setValueAtTime(400, now + 0.1);
        osc.frequency.setValueAtTime(300, now + 0.2);
        
        gain.gain.setValueAtTime(this.masterVolume * 0.4, now);
        gain.gain.setValueAtTime(this.masterVolume * 0.4, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        
        osc.start(now);
        osc.stop(now + 0.4);
    }

    playGameOverSound() {
        if (!this.enabled || !this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        // Descending tone
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 1.0);
        
        gain.gain.setValueAtTime(this.masterVolume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);
        
        osc.start(now);
        osc.stop(now + 1.0);
    }

    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }

    toggle() {
        this.enabled = !this.enabled;
    }
}

// Create global instance
window.audioManager = new AudioManager();
