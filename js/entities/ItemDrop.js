class ItemDrop extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type, itemData = null) {
        super(scene, x, y, 'item_texture'); // Use item_texture

        this.itemType = type; // 'weapon' or 'shield'
        this.auraParticles = null;

        // Initialize Item Data
        if (itemData) {
            this.itemData = itemData;
        } else {
            // Generate Random Stats if no data provided
            const rarityRoll = Phaser.Math.Between(0, 100);
            let rarity = RARITY.NORMAL;
            if (rarityRoll > 95) rarity = RARITY.LEGENDARY; // 5%
            else if (rarityRoll > 80) rarity = RARITY.EPIC; // 15%
            else if (rarityRoll > 50) rarity = RARITY.RARE; // 30%

            // Select Random ID
            let typeId;
            let baseStats;

            if (type === 'weapon') {
                const ids = Object.keys(WEAPON_TYPES);
                typeId = ids[Phaser.Math.Between(0, ids.length - 1)];
                baseStats = WEAPON_TYPES[typeId];
            } else {
                const ids = Object.keys(SHIELD_TYPES);
                typeId = ids[Phaser.Math.Between(0, ids.length - 1)];
                baseStats = SHIELD_TYPES[typeId];
            }

            this.itemData = {
                id: Date.now() + Math.random().toString(36).substr(2, 9),
                typeId: typeId,
                type: type,
                rarity: rarity,
                name: this.generateName(baseStats.name, rarity),
                attackPower: type === 'weapon' ? Math.floor(baseStats.baseAttack * (1 + rarity * 0.5) + Phaser.Math.Between(0, 3)) : 0,
                attackSpeed: type === 'weapon' ? parseFloat((baseStats.baseSpeed + (rarity * 0.1)).toFixed(2)) : 0,
                size: type === 'weapon' ? parseFloat((baseStats.baseSize + (rarity * 0.1)).toFixed(2)) : 1.0,
                options: []
             };

            if (type === 'shield') {
                // Base stats
                let hardness = baseStats.baseHardness;
                let thickness = baseStats.baseThickness;
                let weight = baseStats.baseWeight;

                // Rarity bonus (random variance increasing with rarity)
                const bonusMin = rarity; 
                const bonusMax = rarity * 2 + 1;

                hardness += Phaser.Math.Between(bonusMin, bonusMax);
                thickness += Phaser.Math.Between(bonusMin, bonusMax);
                weight += Phaser.Math.Between(bonusMin, bonusMax);

                this.itemData.hardness = hardness;
                this.itemData.thickness = thickness;
                this.itemData.weight = weight;
            }

            const countRoll = () => {
                if (this.itemData.rarity === RARITY.NORMAL) {
                    return Phaser.Math.Between(0, 100) < 30 ? 1 : 0;
                } else if (this.itemData.rarity === RARITY.RARE) {
                    return Phaser.Math.Between(0, 100) < 30 ? 2 : 1;
                } else if (this.itemData.rarity === RARITY.EPIC) {
                    return Phaser.Math.Between(0, 100) < 30 ? 3 : 2;
                } else {
                    const r = Phaser.Math.Between(1, 100);
                    if (r <= 5) return 4;
                    if (r <= 15) return 3;
                    if (r <= 40) return 2;
                    return 1;
                }
            };
            const optCount = countRoll();
            const pool = [
                { key: 'attackPower', label: 'ちから', unit: '', type: 'weapon' },                 // 1: 1-10
                { key: 'attackSpeed', label: 'そくど', unit: '', type: 'weapon' },                 // 2: -2.0 - 2.0
                { key: 'size', label: 'でかさ', unit: '', type: 'weapon' },                        // 3: -2.0 - 2.0
                { key: 'attackSpCostReduction', label: '攻撃SP消費率', unit: '%', type: 'any' },   // 4: 1-10 (表示は-)
                { key: 'spDamagePlus', label: 'SPダメージ', unit: '', type: 'any' },               // 5: 1-10
                { key: 'critChanceBonus', label: 'クリティカル発生率', unit: '%', type: 'any' },   // 6: 5-15
                { key: 'critDamageBonus', label: 'クリティカルダメージ', unit: '%', type: 'any' }, // 7: 5-15
                { key: 'hpBonus', label: 'HP', unit: '', type: 'any' },                            // 8: 1-50
                { key: 'staminaBonus', label: 'SP', unit: '', type: 'any' },                       // 9: 1-10
                { key: 'knockbackBonus', label: 'ノックバック', unit: '', type: 'weapon' },          // 10: 1-10
                { key: 'moveSpeedBonus', label: 'いどうそくど', unit: '%', type: 'any' },          // 11: 5-15
                { key: 'dashCostReduction', label: 'ダッシュSP消費', unit: '%', type: 'any' },      // 12: 5-15 (表示は-)
                { key: 'staminaRegenBonus', label: 'SPかいふく', unit: '%', type: 'any' }          // 13: 5-15
            ].filter(p => p.type === 'any' || p.type === this.itemData.type);
            const ranges = (key) => {
                if (key === 'attackPower') return [1, 10];
                if (key === 'attackSpeed') return [-2.0, 2.0];
                if (key === 'size') return [-0.5, 2.0];
                if (key === 'attackSpCostReduction') return [1, 10];
                if (key === 'spDamagePlus') return [1, 10];
                if (key === 'critChanceBonus') return [5, 15];
                if (key === 'critDamageBonus') return [5, 15];
                if (key === 'hpBonus') return [1, 50];
                if (key === 'staminaBonus') return [1, 10];
                if (key === 'knockbackBonus') return [1, 10];
                if (key === 'moveSpeedBonus') return [5, 15];
                if (key === 'dashCostReduction') return [5, 15];
                if (key === 'staminaRegenBonus') return [5, 15];
                return [1, 1];
            };
            const used = new Set();
            for (let i = 0; i < optCount && pool.length > 0; i++) {
                let index = Phaser.Math.Between(0, pool.length - 1);
                let tryCount = 0;
                while (used.has(pool[index].key) && tryCount < 10) {
                    index = Phaser.Math.Between(0, pool.length - 1);
                    tryCount++;
                }
                used.add(pool[index].key);
                const p = pool[index];
                const [min, max] = ranges(p.key);
                let val;
                if (p.unit === '%') {
                    val = Math.floor(Phaser.Math.FloatBetween(min, max));
                } else if (p.key === 'attackSpeed' || p.key === 'size') {
                    val = parseFloat(Phaser.Math.FloatBetween(min, max).toFixed(2));
                } else {
                    val = Math.floor(Phaser.Math.FloatBetween(min, max));
                }
                this.itemData.options.push({ key: p.key, label: p.label, value: val, unit: p.unit });
                if (p.key === 'attackPower') {
                    this.itemData.attackPower += val;
                } else if (p.key === 'attackSpeed') {
                    this.itemData.attackSpeed = parseFloat((this.itemData.attackSpeed + val).toFixed(2));
                } else if (p.key === 'size') {
                    this.itemData.size = parseFloat((this.itemData.size + val).toFixed(2));
                } else if (p.key === 'critChanceBonus') {
                    this.itemData.critChanceBonus = (this.itemData.critChanceBonus || 0) + val;
                } else if (p.key === 'critDamageBonus') {
                    this.itemData.critDamageBonus = (this.itemData.critDamageBonus || 0) + val;
                } else if (p.key === 'knockbackBonus') {
                    this.itemData.knockbackBonus = (this.itemData.knockbackBonus || 0) + val;
                } else if (p.key === 'hpBonus') {
                    this.itemData.hpBonus = (this.itemData.hpBonus || 0) + val;
                } else if (p.key === 'staminaBonus') {
                    this.itemData.staminaBonus = (this.itemData.staminaBonus || 0) + val;
                } else if (p.key === 'moveSpeedBonus') {
                    this.itemData.moveSpeedBonus = (this.itemData.moveSpeedBonus || 0) + val;
                } else if (p.key === 'attackSpCostReduction') {
                    this.itemData.attackSpCostReduction = (this.itemData.attackSpCostReduction || 0) + val;
                } else if (p.key === 'dashCostReduction') {
                    this.itemData.dashCostReduction = (this.itemData.dashCostReduction || 0) + val;
                } else if (p.key === 'spDamagePlus') {
                    this.itemData.spDamagePlus = (this.itemData.spDamagePlus || 0) + val;
                } else if (p.key === 'staminaRegenBonus') {
                    this.itemData.staminaRegenBonus = (this.itemData.staminaRegenBonus || 0) + val;
                }
            }
        }

        this.name = this.itemData.name;
        if (this.itemData && this.itemData.type === 'weapon') {
            const candidate = WEAPON_TYPES[this.itemData.typeId]?.texture;
            if (candidate && scene.textures.exists(candidate)) {
                this.setTexture(candidate);
            }
        } else if (this.itemData && this.itemData.type === 'shield') {
            const shieldDef = SHIELD_TYPES[this.itemData.typeId];
            const shieldTexture = shieldDef && shieldDef.texture;
            if (shieldTexture && scene.textures.exists(shieldTexture)) {
                this.setTexture(shieldTexture);
            }
        }

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Physics Properties for Bouncing
        if (this.body) {
            this.body.setBounce(0.6);
            this.body.setDrag(100); // Stop eventually
            this.body.setCollideWorldBounds(true);
            // Radius 40 (Diameter 80) -> Expanded to 60 (Diameter 120) for easier pickup
            // Offset: Center(16,16) - Center(30,30) = (-14, -14)
            // Adjusted for visual centering (smaller circle)
            // Radius 25 (Diameter 50)
            // Previous Offset: 12, -2 (Center 37,23)
            // New Offset: 12, 5 (Shifted +7 down) -> Center at 37,30
            this.body.setCircle(25, 12, 5); 

            // Initial random push to separate if spawned together
            this.setVelocity(Phaser.Math.Between(-50, 50), Phaser.Math.Between(-50, 50));
        }

        this.setDepth(25);
        this.setScale(0.8);

        if (this.itemData && this.itemData.type === 'weapon') {
            const outlinedKey = getOutlinedWeaponTextureKey(scene, this.texture.key, this.itemData.rarity, true);
            if (outlinedKey && scene.textures.exists(outlinedKey)) {
                this.setTexture(outlinedKey);
            }
            this.clearTint();
        } else if (this.itemData && this.itemData.type === 'shield' && this.itemData.rarity >= RARITY.RARE) {
            const outlinedKey = getOutlinedShieldTextureKey(scene, this.texture.key, this.itemData.rarity, true);
            if (outlinedKey && scene.textures.exists(outlinedKey)) {
                this.setTexture(outlinedKey);
            }
            this.clearTint();
        } else if (this.itemData && this.itemData.rarity !== undefined && RARITY_COLORS[this.itemData.rarity]) {
            this.setTint(RARITY_COLORS[this.itemData.rarity]);
        }

        if (scene.textures.exists('spark')) {
            const auraColor = RARITY_COLORS[this.itemData?.rarity] ?? 0xffffff;
            const rarityVal = this.itemData?.rarity ?? 0;
            // Scale particle count by rarity: Normal(0): 4, Rare(1): 8, Epic(2): 12, Legendary(3): 16
            const particleQty = 4 + (rarityVal * 4);

            this.auraParticles = scene.add.particles(this.x, this.y, 'spark', {
                speedX: { min: -5, max: 5 },
                speedY: { min: -40, max: -20 },
                scale: { start: 0.4, end: 0 },
                alpha: { start: 0.4, end: 0 },
                lifespan: { min: 400, max: 700 },
                frequency: 40,
                quantity: particleQty,
                blendMode: 'ADD',
                tint: auraColor,
                emitZone: { type: 'random', source: new Phaser.Geom.Rectangle(-12, -12, 24, 24) }
            });
            this.auraParticles.setDepth(this.depth - 1);
            this.once(Phaser.GameObjects.Events.DESTROY, () => {
                if (this.auraParticles) {
                    this.auraParticles.destroy();
                    this.auraParticles = null;
                }
            });
        }

        // Bobbing animation
        this.bobTween = scene.tweens.add({
            targets: this,
            y: y - 5,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        // Interaction: Click to pickup
        this.setInteractive();
        this.on('pointerdown', () => {
            if (scene.physics.overlap(this, scene.player)) {
                if (scene.player.addToInventory(this.itemData)) {
                    this.destroy();
                }
            }
        });
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (this.auraParticles) {
            this.auraParticles.setPosition(this.x, this.y);
        }
    }

    onFatalTimeStopStart() {
        if (this.bobTween) {
            this.bobTween.pause();
        }
        if (this.auraParticles) {
            this.auraParticles.setVisible(false);
        }
    }

    onFatalTimeStopEnd() {
        if (this.bobTween) {
            this.bobTween.resume();
        }
        if (this.auraParticles) {
            this.auraParticles.setVisible(true);
        }
    }

    generateName(baseName, rarity) {
        return baseName;
    }

    playDropEffect() {
        // 敵がドロップしたときの演出
        // 武器の場合、レア度に応じた色のパーティクルを中央から拡散させる
        if (this.itemType !== 'weapon' || !this.itemData) return;

        const rarity = this.itemData.rarity ?? 0;
        const color = RARITY_COLORS[rarity] ?? 0xffffff;

        // レア度が高いほどパーティクルを増やす
        // Normal(0): 10, Rare(1): 20, Epic(2): 30, Legendary(3): 40
        const particleCount = (rarity + 1) * 10; 

        // 一旦非表示にする
        this.setVisible(false);
        this.setAlpha(0);
        if (this.auraParticles) this.auraParticles.setVisible(false);

        if (this.scene.textures.exists('spark')) {
            const emitter = this.scene.add.particles(this.x, this.y, 'spark', {
                speed: { min: 50, max: 150 },
                angle: { min: 0, max: 360 },
                scale: { start: 4, end: 0 }, // Scale increased for better visibility
                alpha: { start: 1, end: 0 },
                lifespan: 1000, // Slightly longer lifespan
                tint: color,
                blendMode: 'ADD',
                quantity: particleCount,
                emitting: false // Manual emit
            });

            emitter.explode(particleCount);

            // 少し遅れて武器を表示（出現演出）
            this.scene.time.delayedCall(200, () => {
                this.setVisible(true);
                if (this.auraParticles) this.auraParticles.setVisible(true);

                this.setScale(0); // 小さい状態から

                this.scene.tweens.add({
                    targets: this,
                    alpha: 1,
                    scale: 0.8, // 元のサイズに戻す
                    duration: 300,
                    ease: 'Back.out'
                });
            });

            // Cleanup
            this.scene.time.delayedCall(1200, () => {
                emitter.destroy();
            });
        } else {
            this.setVisible(true);
            this.setAlpha(1);
            if (this.auraParticles) this.auraParticles.setVisible(true);
        }
    }
}
