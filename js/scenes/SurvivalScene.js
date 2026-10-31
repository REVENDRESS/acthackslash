class SurvivalScene extends Phaser.Scene {
    constructor() {
        super('SurvivalScene');
        this.slotIndex = 0;
    }

    init(data) {
        this.slotIndex = data?.slotIndex ?? 0;
        this.isGameOver = false;
        this.isHitStopping = false;
    }

    preload() {
        this.load.image('shield_texture', 'assets/images/shield.PNG');
    }

    create() {
        const WORLD_W = 2560, WORLD_H = 2560;
        this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);
        this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);

        // Required textures for Player/Enemy (created if not already loaded)
        if (!this.textures.exists('item_texture')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0xcc88ff, 1); g.fillRect(0, 0, 32, 32);
            g.generateTexture('item_texture', 32, 32); g.destroy();
        }
        if (!this.textures.exists('blood')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0xaa0000, 1); g.fillRect(0, 0, 4, 4);
            g.generateTexture('blood', 4, 4); g.destroy();
        }
        if (!this.textures.exists('spark')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0xffff00, 1); g.fillCircle(3, 3, 3);
            g.generateTexture('spark', 6, 6); g.destroy();
        }
        if (!this.textures.exists('gold_small')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0xffcc00, 1); g.fillRect(0, 0, 4, 4);
            g.generateTexture('gold_small', 4, 4); g.destroy();
        }

        // Physics groups — same structure as MainScene
        this.items     = this.physics.add.group({ classType: ItemDrop, runChildUpdate: true });
        this.enemies   = this.physics.add.group({ classType: Enemy,    runChildUpdate: true });
        this.chests    = this.physics.add.group({ classType: Chest,    runChildUpdate: true });
        this.gores     = this.physics.add.group();
        this.bloodDrops= this.add.group({ classType: BloodDrop, runChildUpdate: true });
        this.sparks    = this.add.group({ classType: Spark, runChildUpdate: true, maxSize: 50 });
        this.arrows    = this.physics.add.group({ classType: Arrow,  runChildUpdate: true });
        this.portals   = this.physics.add.group({ classType: Portal, runChildUpdate: true });
        this.goldDrops = this.add.group({ classType: GoldDrop, runChildUpdate: true, maxSize: 100 });
        this.walls       = this.physics.add.staticGroup();
        this.forestWalls = this.physics.add.staticGroup(); // empty — Enemy LOS check needs it
        this.gold = 0; this.displayGold = 0; this.level = 1;
        this.goreStains = []; this.isHitStopping = false;

        // Map
        this._buildMap(WORLD_W, WORLD_H);

        // Enemy textures — pre-create so real sprites appear (not white boxes)
        createRatTextures(this);
        createCrowTexture(this);
        createPoisonMushroomTexture(this, 'poison_mushroom');
        createCursedStagTextures(this);
        createExiledSoldierTextures(this);

        // Weapon/shield textures — pre-create so equipped items appear in HUD hotbar
        createWeaponTextures(this);
        createShieldTextures(this);

        // Player (real Player class — loaded from save data)
        this.player = new Player(this, WORLD_W / 2, WORLD_H / 2);
        this.player.setDepth(2002);

        // HUD (real HUD class)
        this.hud = new HUD(this, this.player);

        // Load save
        this.loadGame();

        // Camera follows player
        this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

        // Item popup stub (no comparison popup in survival)
        this.createItemPopups();

        // Colliders
        this.physics.add.collider(this.player, this.walls);
        this.physics.add.collider(this.enemies, this.walls);
        this.physics.add.collider(this.items, this.walls);
        this.physics.add.collider(this.arrows, this.walls, (arrow) => {
            if (arrow && arrow.active) arrow.destroy();
        });

        // 近接攻撃ヒット判定
        this.physics.add.overlap(this.player.attackHitboxes, this.enemies, (hitbox, enemy) => {
            if (!hitbox.body.enable || enemy.invulnerable) return;
            let baseDmg = 5;
            if (this.player.equippedWeapon && this.player.equippedWeapon.attackPower) {
                baseDmg = this.player.equippedWeapon.attackPower;
            }
            const variance = Math.floor(baseDmg * 0.1) + 1;
            let dmg = Math.floor(baseDmg + Phaser.Math.Between(-variance, variance));
            if (dmg < 1) dmg = 1;
            if (this.player.isEmpowered) dmg = Math.floor(dmg * 1.5);
            const critChance = typeof this.player.critChance === 'number' ? this.player.critChance : 0.1;
            const isCrit = Math.random() < critChance;
            if (isCrit) dmg = Math.floor(dmg * 1.5 * (1 + (this.player.critDamageBonus || 0) / 100));
            const attackType = hitbox.attackType || this.player.attackType || 'light';
            const customHitStop = hitbox.hitStopDuration || 0;
            enemy.takeDamage(dmg, attackType, customHitStop, isCrit);
            enemy.invulnerable = true;
            this.time.delayedCall(300, () => { if (enemy.active) enemy.invulnerable = false; });
            if (enemy.body) {
                const ang = Phaser.Math.Angle.Between(this.player.x, this.player.y, enemy.x, enemy.y);
                enemy.takeKnockback(Math.cos(ang) * 300, Math.sin(ang) * 300, 250);
            }
            const dropCount = Phaser.Math.Between(6, 12);
            for (let i = 0; i < dropCount; i++) {
                const drop = this.bloodDrops.get(enemy.x, enemy.y, 'blood');
                if (drop) drop.launch(enemy.x, enemy.y, Phaser.Math.FloatBetween(0, Math.PI * 2), Phaser.Math.Between(10, 60), Phaser.Math.Between(30, 100));
            }
        });

        // Survival state
        this.survXp = 0;
        this.survLevel = 1;
        this.survXpToNext = 20;
        this.survKillCount = 0;
        this.survWaveCount = 0;
        this.survWaveInterval = 9000;
        this.survWaveTimer = this.survWaveInterval - 4000; // first wave ~4s in
        this.survTotalTime = 180;
        this.survRemainingTime = 180;
        this.isLevelingUp = false;
        this.isVictory = false;
        this.survRegenAccum = 0;
        this.survivorLifesteal = false;
        this.survivorRegen = 0;
        this.lvupCards = null;
        this.appliedPowerups = {};

        this.POWERUPS = [
            { id: 'atk',      name: '攻撃力強化',   desc: '武器攻撃力 +25%' },
            { id: 'maxhp',    name: '体力強化',     desc: 'HP最大値 +40・即時回復' },
            { id: 'speed',    name: '俊足',         desc: '移動速度 +25' },
            { id: 'heal',     name: '応急処置',     desc: 'HP 50% 回復' },
            { id: 'shield',   name: '鉄壁',         desc: '盾の硬さ +12' },
            { id: 'lifesteal',name: '吸血',         desc: '敵撃破時 HP+5' },
            { id: 'atkspd',   name: '連撃',         desc: '武器速度 x1.3' },
            { id: 'stamina',  name: 'スタミナ強化', desc: 'SP最大値 +30・回復速度UP' },
            { id: 'regen',    name: '自然回復',     desc: '毎秒 2HP 回復' },
            { id: 'potion',   name: 'ポーション補給', desc: 'ポーション +2個' },
        ];

        // Survival HUD overlay
        this._buildSurvivalHUD();

        // Input
        this.prevConfirm = undefined;
        this.prevCancel = undefined;
        this.prevCurLeft = false; this.prevCurRight = false;
        this.prevPadLeft = false; this.prevPadRight = false;
        this.prevResultConfirm = false;
        this.keyZ     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.keyEsc   = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.keyLeft  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

        // 1-second countdown timer
        this.time.addEvent({
            delay: 1000, repeat: this.survTotalTime - 1,
            callback: () => {
                if (this.isLevelingUp || this.isGameOver || this.isVictory) return;
                this.survRemainingTime = Math.max(0, this.survRemainingTime - 1);
                this._updateTimerHUD();
                if (this.survRemainingTime <= 0) this._victory();
            }
        });

        this._showBanner('サバイバルモード開始！\n3分間生き残れ！', '#ffff44');
    }

    // ── Map ─────────────────────────────────────────────────────
    _buildMap(ww, wh) {
        if (!this.textures.exists('surv_floor')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0x2d4a1e, 1); g.fillRect(0, 0, 32, 32);
            g.lineStyle(1, 0x1e3314, 0.4); g.strokeRect(0, 0, 32, 32);
            g.fillStyle(0x334d20, 0.4); g.fillRect(4, 4, 6, 3); g.fillRect(18, 20, 5, 3);
            g.generateTexture('surv_floor', 32, 32); g.destroy();
        }
        if (!this.textures.exists('surv_wall')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0x1a3a08, 1); g.fillRect(0, 0, 32, 32);
            g.fillStyle(0x2a5010, 1); g.fillCircle(16, 13, 11);
            g.fillStyle(0x3a6a18, 1); g.fillCircle(12, 10, 7); g.fillCircle(21, 11, 6);
            g.fillStyle(0x5a3010, 1); g.fillRect(12, 22, 8, 10);
            g.generateTexture('surv_wall', 32, 32); g.destroy();
        }
        const floor = this.add.tileSprite(0, 0, ww, wh, 'surv_floor').setOrigin(0, 0).setDepth(0);
        floor.setTint(0xddffcc);
        const T = 32, mw = ww / T, mh = wh / T;
        const cx = mw / 2, cy = mh / 2;
        for (let ty = 1; ty < mh - 1; ty++) {
            for (let tx = 1; tx < mw - 1; tx++) {
                if (Math.abs(tx - cx) < 8 && Math.abs(ty - cy) < 8) continue;
                const h = ((Math.sin(tx * 127.1 + ty * 311.7) * 43758.5453) % 1 + 1) % 1;
                if (h < 0.06) {
                    const w = this.walls.create(tx * T + T / 2, ty * T + T / 2, 'surv_wall');
                    w.setDepth(2).refreshBody();
                }
            }
        }
    }

    // ── Survival HUD ─────────────────────────────────────────────
    _buildSurvivalHUD() {
        const W = this.scale.width, H = this.scale.height, SF = 0, D = 110;
        this.survTimerTxt = this.add.text(W / 2, 8, '3:00', {
            fontFamily: 'x10y12pxDonguriDuel', fontSize: '30px', fontStyle: 'bold',
            color: '#ffffff', stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5, 0).setDepth(D + 5).setScrollFactor(SF);

        this.survKillTxt = this.add.text(W - 12, 50, '撃破: 0', {
            fontFamily: 'x10y12pxDonguriDuel', fontSize: '16px',
            color: '#ffaa44', stroke: '#000000', strokeThickness: 2
        }).setOrigin(1, 0).setDepth(D + 5).setScrollFactor(SF);

        this.survWaveTxt = this.add.text(W / 2, 48, '', {
            fontFamily: 'x10y12pxDonguriDuel', fontSize: '18px',
            color: '#ff8888', stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5, 0).setDepth(D + 5).setScrollFactor(SF);

        this.survXpBg  = this.add.rectangle(0, H - 18, W, 18, 0x002200).setOrigin(0, 0).setDepth(D).setScrollFactor(SF);
        this.survXpBar = this.add.rectangle(0, H - 18, 0, 18, 0x44ff88).setOrigin(0, 0).setDepth(D + 1).setScrollFactor(SF);
        this.survXpLvl = this.add.text(W / 2, H - 9, 'Lv.1', {
            fontFamily: 'x10y12pxDonguriDuel', fontSize: '13px', color: '#ffffff'
        }).setOrigin(0.5).setDepth(D + 2).setScrollFactor(SF);
    }

    _updateSurvivalHUD() {
        const xpPct = Math.min(1, this.survXp / this.survXpToNext);
        this.survXpBar.setSize(this.scale.width * xpPct, 18);
        this.survXpLvl.setText(`Lv.${this.survLevel}  XP ${this.survXp}/${this.survXpToNext}`);
        this.survKillTxt.setText(`撃破: ${this.survKillCount}`);
    }

    _updateTimerHUD() {
        const t = Math.max(0, this.survRemainingTime);
        const m = Math.floor(t / 60), s = t % 60;
        this.survTimerTxt.setText(`${m}:${s.toString().padStart(2, '0')}`);
        this.survTimerTxt.setColor(t <= 30 ? '#ff4444' : '#ffffff');
    }

    // ── Wave spawning ─────────────────────────────────────────────
    _spawnWave() {
        this.survWaveCount++;
        const count = 3 + (this.survWaveCount - 1) * 2;
        const types = this._waveTypes();
        for (let i = 0; i < count; i++) {
            const pos = this._edgeSpawnPos();
            this.spawnEnemy(pos.x, pos.y, Phaser.Utils.Array.GetRandom(types));
        }
        this.survWaveTxt.setText(`Wave ${this.survWaveCount}`);
        this.time.delayedCall(2000, () => { if (this.survWaveTxt) this.survWaveTxt.setText(''); });
    }

    _waveTypes() {
        const w = this.survWaveCount;
        if (w <= 2)  return ['tiny'];
        if (w <= 4)  return ['tiny', 'crow'];
        if (w <= 7)  return ['tiny', 'crow', 'poison_mushroom'];
        if (w <= 10) return ['crow', 'poison_mushroom', 'cursed_stag'];
        return ['crow', 'poison_mushroom', 'cursed_stag', 'normal'];
    }

    _edgeSpawnPos() {
        const cam = this.cameras.main;
        const margin = 90;
        const side = Phaser.Math.Between(0, 3);
        const cx = cam.scrollX + cam.width / 2;
        const cy = cam.scrollY + cam.height / 2;
        const hw = cam.width / 2 + margin, hh = cam.height / 2 + margin;
        let x, y;
        if (side === 0)      { x = cx + Phaser.Math.FloatBetween(-hw, hw); y = cy - hh; }
        else if (side === 1) { x = cx + hw; y = cy + Phaser.Math.FloatBetween(-hh, hh); }
        else if (side === 2) { x = cx + Phaser.Math.FloatBetween(-hw, hw); y = cy + hh; }
        else                 { x = cx - hw; y = cy + Phaser.Math.FloatBetween(-hh, hh); }
        return { x: Phaser.Math.Clamp(x, 40, 2520), y: Phaser.Math.Clamp(y, 40, 2520) };
    }

    // ── XP / Level-up ─────────────────────────────────────────────
    registerEnemyKill() {
        this.survKillCount++;
        this.survXp += 10;
        this._updateSurvivalHUD();
        if (this.survXp >= this.survXpToNext) {
            this.survXp -= this.survXpToNext;
            this.survLevel++;
            this.survXpToNext = Math.floor(this.survXpToNext * 1.35 + 15);
            this.time.delayedCall(50, () => this._levelUp());
        }
    }

    registerEnemyDamage() {}
    registerPlayerDamageTaken() {}

    _levelUp() {
        if (this.isGameOver || this.isVictory || this.isLevelingUp) return;
        this.isLevelingUp = true;
        this.physics.pause();
        const unused = this.POWERUPS.filter(p => !this.appliedPowerups[p.id]);
        const pool = [...unused, ...this.POWERUPS];
        const choices = [];
        for (const p of pool) {
            if (!choices.find(c => c.id === p.id)) {
                choices.push(p);
                if (choices.length === 3) break;
            }
        }
        this._showLevelUpUI(choices);
    }

    _showLevelUpUI(choices) {
        const W = this.scale.width, H = this.scale.height;
        const overlay = this.add.rectangle(0, 0, W, H, 0x000000, 0.78)
            .setOrigin(0, 0).setDepth(200).setScrollFactor(0);
        const title = this.add.text(W / 2, H / 2 - 145, `レベルアップ！ Lv.${this.survLevel}`, {
            fontFamily: 'x10y12pxDonguriDuel', fontSize: '28px', fontStyle: 'bold',
            color: '#ffff44', stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setDepth(201).setScrollFactor(0);
        const hint = this.add.text(W / 2, H / 2 + 108, '← → で選択、Z / A で決定', {
            fontFamily: 'x10y12pxDonguriDuel', fontSize: '14px', color: '#aaaaaa'
        }).setOrigin(0.5).setDepth(201).setScrollFactor(0);

        const cardW = 190, cardH = 110, gap = 24;
        const totalW = choices.length * cardW + (choices.length - 1) * gap;
        const startX = (W - totalW) / 2;
        this.lvupCards = choices.map((choice, i) => {
            const cx = startX + i * (cardW + gap) + cardW / 2;
            const cy = H / 2 - 10;
            const bg = this.add.rectangle(cx, cy, cardW, cardH, 0x222244).setDepth(201).setScrollFactor(0);
            bg.setStrokeStyle(2, 0x4444aa);
            const nm = this.add.text(cx, cy - 26, choice.name, {
                fontFamily: 'x10y12pxDonguriDuel', fontSize: '18px', fontStyle: 'bold', color: '#ffffff'
            }).setOrigin(0.5).setDepth(202).setScrollFactor(0);
            const ds = this.add.text(cx, cy + 14, choice.desc, {
                fontFamily: 'x10y12pxDonguriDuel', fontSize: '14px', color: '#aaaaff',
                wordWrap: { width: cardW - 20 }, align: 'center'
            }).setOrigin(0.5).setDepth(202).setScrollFactor(0);
            return { bg, nm, ds, choice };
        });
        this.lvupUiObjs = [overlay, title, hint];
        this.lvupIndex = 0;
        this._updateLvupVisual();
        this.prevCurLeft = true; this.prevCurRight = true; this.prevConfirm = true;
        this.prevPadLeft = true; this.prevPadRight = true;
    }

    _updateLvupVisual() {
        this.lvupCards.forEach((c, i) => {
            const sel = i === this.lvupIndex;
            c.bg.setFillStyle(sel ? 0x334488 : 0x222244);
            c.bg.setStrokeStyle(sel ? 3 : 2, sel ? 0xffff44 : 0x4444aa);
            c.nm.setColor(sel ? '#ffff44' : '#ffffff');
        });
    }

    _lvupMove(dir) {
        this.lvupIndex = (this.lvupIndex + dir + this.lvupCards.length) % this.lvupCards.length;
        this._updateLvupVisual();
    }

    _lvupSelect() {
        if (!this.lvupCards) return;
        const chosen = this.lvupCards[this.lvupIndex].choice;
        this._applyPowerup(chosen);
        this.lvupUiObjs.forEach(o => o.destroy());
        this.lvupCards.forEach(c => { c.bg.destroy(); c.nm.destroy(); c.ds.destroy(); });
        this.lvupCards = null; this.lvupUiObjs = null;
        this.isLevelingUp = false;
        this.physics.resume();
        this.prevCurLeft = true; this.prevCurRight = true; this.prevConfirm = true;
        this.prevPadLeft = true; this.prevPadRight = true;
        this._showBanner(`${chosen.name} を獲得！`, '#88ffaa');
    }

    _applyPowerup(pu) {
        const p = this.player;
        this.appliedPowerups[pu.id] = (this.appliedPowerups[pu.id] || 0) + 1;
        switch (pu.id) {
            case 'atk':
                if (p.equippedWeapon) { p.equippedWeapon.attackPower = Math.round((p.equippedWeapon.attackPower || 10) * 1.25); p.applyEquippedWeapon(); }
                break;
            case 'maxhp':
                p.baseMaxHp = (p.baseMaxHp || 100) + 40;
                if (p.applyEquipmentBonuses) p.applyEquipmentBonuses();
                p.hp = Math.min(p.maxHp, p.hp + 40);
                break;
            case 'speed':
                p.baseSpeed = (p.baseSpeed || 160) + 25;
                p.speed = (p.speed || 160) + 25;
                break;
            case 'heal':
                p.hp = Math.min(p.maxHp, p.hp + Math.round(p.maxHp * 0.5));
                break;
            case 'shield':
                if (p.equippedShield) { p.equippedShield.hardness = (p.equippedShield.hardness || 0) + 12; if (p.applyEquipmentBonuses) p.applyEquipmentBonuses(); }
                break;
            case 'lifesteal':
                this.survivorLifesteal = true;
                break;
            case 'atkspd':
                if (p.equippedWeapon) { p.equippedWeapon.attackSpeed = Math.min(3.5, (p.equippedWeapon.attackSpeed || 1.0) * 1.3); p.applyEquippedWeapon(); }
                break;
            case 'stamina':
                p.maxStamina = (p.maxStamina || 100) + 30;
                p.stamina = Math.min(p.maxStamina, (p.stamina || 100) + 30);
                p.staminaRegenRate = (p.staminaRegenRate || 0.5) + 0.2;
                break;
            case 'regen':
                this.survivorRegen += 2;
                break;
            case 'potion':
                p.potions = (p.potions || 0) + 2;
                break;
        }
    }

    // ── Win / Lose ─────────────────────────────────────────────────
    onPlayerDead() {
        if (this.isVictory) return;
        this.isGameOver = true;
        this.physics.world.pause();
        this._showResult(false);
    }

    _victory() {
        if (this.isGameOver || this.isVictory) return;
        this.isVictory = true;
        this.physics.world.pause();
        this._showResult(true);
    }

    _showResult(win) {
        const W = this.scale.width, H = this.scale.height;
        const D = 3000; // depth above player(2002) and enemies(2002)

        // 全体を暗くするオーバーレイ（プレイヤー・敵も含む）
        this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.82)
            .setDepth(D).setScrollFactor(0);

        // タイトル
        const titleColor = win ? '#ffff44' : '#ff4444';
        const titleBg = win ? 0x443300 : 0x440000;
        this.add.rectangle(W / 2, H / 2 - 130, 420, 60, titleBg, 0.9)
            .setDepth(D + 1).setScrollFactor(0);
        this.add.text(W / 2, H / 2 - 130, win ? '🎉  生存成功！' : '💀  ゲームオーバー', {
            fontFamily: 'x10y12pxDonguriDuel', fontSize: '38px', fontStyle: 'bold',
            color: titleColor, stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5).setDepth(D + 2).setScrollFactor(0);

        // 区切り線
        this.add.rectangle(W / 2, H / 2 - 95, 360, 2, 0x666666)
            .setDepth(D + 1).setScrollFactor(0);

        // スタッツパネル
        const panelBg = this.add.rectangle(W / 2, H / 2 - 20, 340, 120, 0x111122, 0.95)
            .setDepth(D + 1).setScrollFactor(0);
        panelBg.setStrokeStyle(1, 0x444466);
        const elapsed = this.survTotalTime - this.survRemainingTime;
        const em = Math.floor(elapsed / 60), es = elapsed % 60;
        [
            ['撃破数',   `${this.survKillCount} 体`],
            ['到達Lv',   `Lv. ${this.survLevel}`],
            ['生存時間', `${em}:${es.toString().padStart(2, '0')}`],
        ].forEach(([label, val], i) => {
            const y = H / 2 - 65 + i * 38;
            this.add.text(W / 2 - 90, y, label, {
                fontFamily: 'x10y12pxDonguriDuel', fontSize: '18px', color: '#aaaacc'
            }).setOrigin(0, 0.5).setDepth(D + 2).setScrollFactor(0);
            this.add.text(W / 2 + 90, y, val, {
                fontFamily: 'x10y12pxDonguriDuel', fontSize: '18px', fontStyle: 'bold', color: '#ffffff'
            }).setOrigin(1, 0.5).setDepth(D + 2).setScrollFactor(0);
        });

        // 戻るボタン
        const btn = this.add.text(W / 2, H / 2 + 85, '　拠点に戻る　', {
            fontFamily: 'x10y12pxDonguriDuel', fontSize: '22px', fontStyle: 'bold',
            color: '#ffffff', backgroundColor: win ? '#224422' : '#442222',
            padding: { x: 28, y: 12 }
        }).setOrigin(0.5).setDepth(D + 2).setScrollFactor(0).setInteractive({ useHandCursor: true });
        btn.on('pointerover', () => btn.setStyle({ color: '#ffff44', backgroundColor: win ? '#335533' : '#553333' }));
        btn.on('pointerout',  () => btn.setStyle({ color: '#ffffff', backgroundColor: win ? '#224422' : '#442222' }));
        btn.on('pointerdown', () => this._returnToBase());

        this.add.text(W / 2, H / 2 + 132, 'Z / Enter / ESC でも戻れます', {
            fontFamily: 'x10y12pxDonguriDuel', fontSize: '12px', color: '#666688'
        }).setOrigin(0.5).setDepth(D + 2).setScrollFactor(0);

        this.prevResultConfirm = true;
    }

    _returnToBase() {
        this.scene.start('BaseMenuScene', { slotIndex: this.slotIndex });
    }

    _showBanner(text, color) {
        const W = this.scale.width, H = this.scale.height;
        const t = this.add.text(W / 2, H / 2 - 80, text, {
            fontFamily: 'x10y12pxDonguriDuel', fontSize: '22px', fontStyle: 'bold',
            color: color || '#ffffff', stroke: '#000000', strokeThickness: 4, align: 'center'
        }).setOrigin(0.5).setDepth(150).setScrollFactor(0);
        this.tweens.add({ targets: t, y: t.y - 50, alpha: 0, duration: 1800, onComplete: () => t.destroy() });
    }

    // ── Methods required by Player / Enemy ────────────────────────
    showDamagePopup(x, y, damage, color) {
        const t = this.add.text(x, y, damage.toString(), {
            fontFamily: 'x10y12pxDonguriDuel', fontSize: '20px', fontStyle: 'bold', fill: color
        }).setOrigin(0.5).setDepth(9999);
        this.tweens.add({ targets: t, y: y - 50, alpha: 0, duration: 800, ease: 'Power1', onComplete: () => t.destroy() });
    }

    hitStop(duration) {
        if (this.isHitStopping) return;
        this.isHitStopping = true;
        this.physics.world.pause(); this.tweens.pauseAll(); this.anims.pauseAll();
        setTimeout(() => {
            if (!this.sys || !this.sys.isActive()) return;
            if (this.isLevelingUp || this.isGameOver || this.isVictory) { this.isHitStopping = false; return; }
            this.physics.world.resume(); this.tweens.resumeAll(); this.anims.resumeAll();
            this.isHitStopping = false;
        }, duration);
    }

    spawnGore(x, y, color, scale = 1.0, bloodColor = 0xcc0000) {
        this.spawnGorePieces(x, y, color, scale);
        this.spawnBloodStains(x, y, bloodColor, 6);
        if (this.survivorLifesteal && this.player) {
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + 5);
        }
    }

    spawnGorePieces(x, y, color, scale = 1.0) {
        for (let i = 0; i < 10; i++) {
            let size = Math.floor(Phaser.Math.Between(4, 10) * scale);
            if (size < 2) size = 2;
            const key = `gore_${size}_${color.toString(16)}`;
            if (!this.textures.exists(key)) {
                const g = this.make.graphics({ x: 0, y: 0, add: false });
                g.fillStyle(color, 1); g.fillRect(0, 0, size, size);
                g.generateTexture(key, size, size); g.destroy();
            }
            const gore = this.physics.add.sprite(x, y, key);
            this.gores.add(gore); gore.setDepth(5);
            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const spd = Phaser.Math.Between(50, 280);
            gore.setVelocity(Math.cos(angle) * spd, Math.sin(angle) * spd);
            gore.setAngularVelocity(Phaser.Math.Between(-360, 360));
            gore.setDrag(Phaser.Math.Between(100, 300));
            this.time.delayedCall(900, () => {
                if (gore.active) { gore.setVelocity(0); gore.setAngularVelocity(0); if (gore.body) gore.body.enable = false; }
            });
        }
    }

    spawnBloodStains(x, y, color, count = 6) {
        if (!this.goreStains) this.goreStains = [];
        for (let i = 0; i < count; i++) {
            const stain = this.add.image(x + Phaser.Math.Between(-20, 20), y + Phaser.Math.Between(-20, 20), 'blood');
            stain.setScale(Phaser.Math.FloatBetween(2.0, 4.0)).setAlpha(0.8)
                .setTint(color).setDepth(1).setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2));
            this.goreStains.push(stain);
        }
    }

    spawnGold(x, y, amount) { /* no-op in survival mode */ }
    addGold(amount) { this.gold = (this.gold || 0) + amount; }

    createItemPopups() {
        const stub = {
            setVisible: () => {}, setPosition: () => {},
            titleNameText: { setText: () => {} },
            titleRarityText: { setText: () => {} },
            lineTexts: []
        };
        this.itemPopupContainer = stub;
        this.equippedPopupContainer = stub;
        this.itemPopupText = stub.titleNameText;
    }

    spawnEnemy(x, y, type = 'normal') {
        const enemy = new Enemy(this, x, y, this.player, type);
        enemy.state = 'CHASE'; // サバイバルモードでは即追跡
        this.enemies.add(enemy);
    }

    loadGame() {
        const dataStr = localStorage.getItem('rogueSaveData');
        if (dataStr) {
            try {
                const data = JSON.parse(dataStr);
                this.level = data.level || 1;
                this.gold = data.gold || 0;
                this.displayGold = this.gold;
                if (data.player) {
                    if (data.player.hp)        this.player.hp        = data.player.hp;
                    if (data.player.maxHp)     this.player.maxHp     = data.player.maxHp;
                    if (data.player.stamina)   this.player.stamina   = data.player.stamina;
                    if (data.player.maxStamina)this.player.maxStamina= data.player.maxStamina;
                    this.player.potions = data.player.potions ?? 3;
                    if (Array.isArray(data.player.inventory)) this.player.inventory = data.player.inventory;
                    if (data.player.equippedWeapon) this.player.equippedWeapon = data.player.equippedWeapon;
                    if (data.player.equippedShield) this.player.equippedShield = data.player.equippedShield;
                }
                if (data.warehouse) WAREHOUSE[this.slotIndex] = data.warehouse;
            } catch (e) { console.error('SurvivalScene loadGame error', e); }
        }
        // 何も装備していない場合は初期装備を持たせる
        if (!this.player.equippedWeapon) {
            this.player.equippedWeapon = {
                id: 'starter_iron_sword', typeId: 2, type: 'weapon', rarity: RARITY.NORMAL,
                name: WEAPON_TYPES[2].name, attackPower: WEAPON_TYPES[2].baseAttack,
                attackSpeed: WEAPON_TYPES[2].baseSpeed, size: WEAPON_TYPES[2].baseSize
            };
        }
        if (!this.player.equippedShield) {
            this.player.equippedShield = {
                id: 'starter_iron_shield', typeId: 1, type: 'shield', rarity: RARITY.NORMAL,
                name: SHIELD_TYPES[1].name, hardness: SHIELD_TYPES[1].baseHardness,
                thickness: SHIELD_TYPES[1].baseThickness, weight: SHIELD_TYPES[1].baseWeight
            };
        }
        this.player.applyEquippedWeapon();
        this.player.applyEquippedShield();
        if (this.hud) this.hud.update(0);
    }

    // ── Update ────────────────────────────────────────────────────
    update(time, delta) {
        if (this.isGameOver || this.isVictory) {
            this._inputResult(); return;
        }
        if (this.isLevelingUp) {
            this._inputLevelUp(); return;
        }

        const pad = this.input.gamepad.getPad();
        if (this.hud.isInventoryOpen && pad) this.hud.handleGamepadInput(pad);
        this.hud.update();
        this.player.update(time, delta);

        if (!this.isHitStopping) {
            this.survWaveTimer += delta;
            if (this.survWaveTimer >= this.survWaveInterval) {
                this.survWaveTimer -= this.survWaveInterval;
                this.survWaveInterval = Math.max(4000, this.survWaveInterval - 300);
                this._spawnWave();
            }

            if (this.survivorRegen > 0) {
                this.survRegenAccum += this.survivorRegen * (delta / 1000);
                if (this.survRegenAccum >= 1) {
                    const heal = Math.floor(this.survRegenAccum);
                    this.survRegenAccum -= heal;
                    if (this.player) this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
                }
            }
        }

        this._updateSurvivalHUD();
    }

    _inputLevelUp() {
        if (!this.lvupCards) return;
        const pad = this.input.gamepad?.getPad?.();
        const ax = pad?.axes[0]?.getValue() || 0;
        const left = this.keyLeft.isDown || !!pad?.left || ax < -0.4;
        const right = this.keyRight.isDown || !!pad?.right || ax > 0.4;
        const confirm = this.keyZ.isDown || this.keyEnter.isDown || !!pad?.A || !!pad?.X;
        if (left && !this.prevCurLeft) this._lvupMove(-1);
        if (right && !this.prevCurRight) this._lvupMove(1);
        const select = confirm && !this.prevConfirm;
        this.prevCurLeft = left; this.prevCurRight = right; this.prevConfirm = confirm;
        if (select) this._lvupSelect();
    }

    _inputResult() {
        const pad = this.input.gamepad?.getPad?.();
        const confirm = this.keyZ.isDown || this.keyEnter.isDown || this.keyEsc.isDown || !!pad?.A || !!pad?.B;
        const select = confirm && !this.prevResultConfirm;
        this.prevResultConfirm = confirm;
        if (select) this._returnToBase();
    }

}
