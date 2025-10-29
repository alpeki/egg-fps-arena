// Client-side weapon system

const WEAPONS = {
  pistol: {
    name: "Pistol",
    damage: 25,
    fireRate: 300,
    magazineSize: 12,
    key: "1"
  },
  shotgun: {
    name: "Shotgun",
    damage: 15,
    fireRate: 800,
    magazineSize: 6,
    key: "2"
  },
  rifle: {
    name: "Rifle",
    damage: 20,
    fireRate: 150,
    magazineSize: 30,
    key: "3"
  },
  sniper: {
    name: "Sniper",
    damage: 80,
    fireRate: 1200,
    magazineSize: 5,
    key: "4"
  },
  smg: {
    name: "SMG",
    damage: 12,
    fireRate: 100,
    magazineSize: 25,
    key: "5"
  }
};

class WeaponUI {
    constructor() {
        this.currentWeapon = "pistol";
        this.ammo = 12;
        this.maxAmmo = 12;
        this.isReloading = false;
        this.createWeaponUI();
    }

    createWeaponUI() {
        const weaponPanel = document.createElement('div');
        weaponPanel.id = 'weapon-panel';
        weaponPanel.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(10, 10, 10, 0.9);
            border: 2px solid #00ff00;
            border-radius: 8px;
            padding: 15px 25px;
            z-index: 100;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        `;

        weaponPanel.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="text-align: center;">
                    <div id="weapon-name" style="color: #00ff00; font-size: 18px; font-weight: bold;">PISTOL</div>
                    <div id="ammo-display" style="color: #fff; font-size: 24px; font-weight: bold; margin-top: 5px;">
                        <span id="current-ammo">12</span> / <span id="max-ammo">12</span>
                    </div>
                    <div id="reload-status" style="color: #ffaa00; font-size: 12px; margin-top: 5px; display: none;">
                        RELOADING...
                    </div>
                </div>
            </div>
            <div id="weapon-selector" style="display: flex; gap: 10px;">
                ${Object.entries(WEAPONS).map(([key, weapon]) => `
                    <div class="weapon-slot" data-weapon="${key}" style="
                        padding: 8px 12px;
                        background: rgba(50, 50, 50, 0.8);
                        border: 2px solid #666;
                        border-radius: 4px;
                        cursor: pointer;
                        transition: all 0.2s;
                        text-align: center;
                    ">
                        <div style="color: #00ff00; font-size: 12px; font-weight: bold;">${weapon.key}</div>
                        <div style="color: #fff; font-size: 10px;">${weapon.name}</div>
                    </div>
                `).join('')}
            </div>
        `;

        document.body.appendChild(weaponPanel);
        this.weaponPanel = weaponPanel;
        this.setupWeaponSlots();
    }

    setupWeaponSlots() {
        const slots = document.querySelectorAll('.weapon-slot');
        slots.forEach(slot => {
            slot.addEventListener('click', () => {
                const weapon = slot.dataset.weapon;
                this.selectWeapon(weapon);
            });
        });
    }

    selectWeapon(weaponName) {
        if (WEAPONS[weaponName]) {
            this.currentWeapon = weaponName;
            this.updateUI();
            this.highlightSelectedWeapon();
        }
    }

    updateUI() {
        const weapon = WEAPONS[this.currentWeapon];
        document.getElementById('weapon-name').textContent = weapon.name.toUpperCase();
        document.getElementById('current-ammo').textContent = this.ammo;
        document.getElementById('max-ammo').textContent = this.maxAmmo;
        
        const reloadStatus = document.getElementById('reload-status');
        reloadStatus.style.display = this.isReloading ? 'block' : 'none';
        
        // Color code ammo
        const ammoDisplay = document.getElementById('ammo-display');
        if (this.ammo === 0) {
            ammoDisplay.style.color = '#ff0000';
        } else if (this.ammo < this.maxAmmo * 0.3) {
            ammoDisplay.style.color = '#ffaa00';
        } else {
            ammoDisplay.style.color = '#fff';
        }
    }

    highlightSelectedWeapon() {
        const slots = document.querySelectorAll('.weapon-slot');
        slots.forEach(slot => {
            if (slot.dataset.weapon === this.currentWeapon) {
                slot.style.borderColor = '#00ff00';
                slot.style.background = 'rgba(0, 255, 0, 0.2)';
            } else {
                slot.style.borderColor = '#666';
                slot.style.background = 'rgba(50, 50, 50, 0.8)';
            }
        });
    }

    updateFromServer(weapon, ammo, maxAmmo, isReloading) {
        this.currentWeapon = weapon;
        this.ammo = ammo;
        this.maxAmmo = maxAmmo;
        this.isReloading = isReloading;
        this.updateUI();
        this.highlightSelectedWeapon();
    }
}

// Export
window.WeaponUI = WeaponUI;
window.WEAPONS_CONFIG = WEAPONS;
