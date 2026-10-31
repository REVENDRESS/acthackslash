class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, player, type = 'normal') {
        let textureKey = 'enemy_texture_white';

        // 敵のグラフィック生成
        if (type === 'normal') {
            createExiledSoldierTextures(scene);

            // Create Animations if not exist
            if (!scene.anims.exists('exiled_idle')) {
                scene.anims.create({
                    key: 'exiled_idle',
                    frames: [
                        { key: 'exiled_idle' }
                    ],
                    frameRate: 1,
                    repeat: -1
                });
            }
            if (!scene.anims.exists('exiled_walk')) {
                scene.anims.create({
                    key: 'exiled_walk',
                    frames: [
                        { key: 'exiled_walk1' },
                        { key: 'exiled_walk2' }
                    ],
                    frameRate: 4,
                    repeat: -1
                });
            }

            textureKey = 'exiled_idle';
        } else if (type === 'ranged') {
            // Generate all 3 states
            createSkeletonTexture(scene, 'skeleton_idle', 'idle');
            createSkeletonTexture(scene, 'skeleton_draw', 'draw');
            createSkeletonTexture(scene, 'skeleton_shoot', 'shoot');

            textureKey = 'skeleton_idle';
        } else if (!scene.textures.exists('enemy_texture_white')) {
            const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
            graphics.fillStyle(0xffffff, 1); // 白
            graphics.fillRect(0, 0, 32, 32);
            graphics.generateTexture('enemy_texture_white', 32, 32);
        }

        super(scene, x, y, textureKey);

        this.scene = scene;
        this.player = player;
        this.type = type;

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setDepth(2002);

        this.setCollideWorldBounds(true);
        this.body.setImmovable(true); // 押されない
        this.setPushable(false); // プレイヤーに押されないようにする

        this.state = 'IDLE'; // IDLE, CHASE, PREPARE, ATTACK, COOLDOWN
        this.attackRange = 80;
        this.detectionRange = 300; // デフォルトの索敵範囲（約9マス）
        this.nextAttackTime = 0;

        // スタミナ関連（Large用）
        this.maxStamina = 100;
        this.stamina = 100;
        this.isGuardBroken = false;
        this.guardBreakTimer = 0;
        this.guardBreakMax = 0;
        this.canBeFatalNow = false;

        if (this.type === 'tiny') {
            if (this.scene.textures.exists('rat_idle_0')) {
                this.setTexture('rat_idle_0');
                this.anims.play('rat_idle', true);
            }
            this.setScale(1.2);
            this.body.setSize(24, 20);
            this.body.setOffset(20, 12);
            this.clearTint();
            this.maxHp = 50;    // 体力半分
            this.hp = 50;
            this.speedMultiplier = 1.2;
        } else if (this.type === 'crow') {
            createCrowTexture(scene);
            this.setTexture('crow_idle_0');
            this.setScale(1.2);
            this.body.setSize(24, 18);
            this.body.setOffset(12, 14);
            this.clearTint();
            this.maxHp = 60;
            this.hp = 60;
            this.speedMultiplier = 1.4;
            this.attackRange = 120;
            this.detectionRange = 360;
            this.orbitRadius = 180;
            this.orbitDir = Math.random() < 0.5 ? 1 : -1;
        } else if (this.type === 'hanged_wisp') {
            createHangedWispTexture(scene, 'hanged_wisp');
            this.setTexture('hanged_wisp');
            this.setScale(1.0);
            this.body.setSize(20, 28);
            this.body.setOffset(12, 12);
            this.clearTint();
            this.maxHp = 70;
            this.hp = 70;
            this.speedMultiplier = 0.6;
            this.attackRange = 140;
            this.detectionRange = 320;
        } else if (this.type === 'mossy_statue') {
            createMossyStatueTexture(scene, 'mossy_statue');
            this.setTexture('mossy_statue');
            this.setScale(1.0);
            this.body.setSize(24, 30);
            this.body.setOffset(8, 18);
            this.clearTint();
            this.maxHp = 260;
            this.hp = 260;
            this.speedMultiplier = 0.35;
            this.attackRange = 140;
            this.detectionRange = 320;
            this.maxStamina = 120;
            this.stamina = 120;
            this.isGuardBroken = false;
            this.guardBreakTimer = 0;
            this.guardBreakMax = 0;
            this.staminaBar = scene.add.graphics();
        } else if (this.type === 'cursed_stag') {
            createCursedStagTextures(scene);
            this.setTexture('cursed_stag_idle_0');
            this.setScale(1.0);
            this.body.setSize(24, 30);
            this.body.setOffset(8, 18);
            this.clearTint();
            this.maxHp = 230;
            this.hp = 230;
            this.speedMultiplier = 0.7;
            this.attackRange = 90;
            this.detectionRange = 340;
            this.maxStamina = 90;
            this.stamina = 90;
            this.isGuardBroken = false;
            this.guardBreakTimer = 0;
            this.guardBreakMax = 0;
            this.staminaBar = scene.add.graphics();
            if (!scene.anims.exists('cursed_stag_idle')) {
                scene.anims.create({
                    key: 'cursed_stag_idle',
                    frames: [{ key: 'cursed_stag_idle_0' }],
                    frameRate: 1,
                    repeat: -1
                });
            }
            if (!scene.anims.exists('cursed_stag_attack')) {
                scene.anims.create({
                    key: 'cursed_stag_attack',
                    frames: [
                        { key: 'cursed_stag_attack_0' },
                        { key: 'cursed_stag_attack_1' }
                    ],
                    frameRate: 10,
                    repeat: 0
                });
            }
            this.anims.play('cursed_stag_idle', true);
        } else if (this.type === 'spearman' || this.type === 'yari_goblin') {
            const isGoblin = this.type === 'yari_goblin';
            const idleTexture = isGoblin ? 'goblin_green_idle_0' : 'goblin_idle_0';
            const idleAnimKey = isGoblin ? 'goblin_green_idle' : 'goblin_idle';
            if (this.scene.textures.exists(idleTexture)) {
                this.setTexture(idleTexture);
                this.anims.play(idleAnimKey, true);
            }
            this.setScale(1.0);
            this.body.setSize(20, 30);
            this.body.setOffset(22, 2);
            this.clearTint();
            this.maxHp = 100;
            this.hp = 100;
            this.speedMultiplier = isGoblin ? 0.55 : 1.1;
            this.attackRange = 90;
            this.detectionRange = isGoblin ? 450 : 500;
        } else if (this.type === 'ranged') {
            this.setScale(1.0);
            // Texture is already colored (Green with Bow)
            this.clearTint(); 
            this.maxHp = 50;
            this.hp = 50;
            this.speedMultiplier = 0.8;
            this.attackRange = 400; // 800 is too far (off-screen), 400 is half screen
            this.detectionRange = 600; 
        } else if (this.type === 'poison_mushroom') {
            createPoisonMushroomTexture(scene, 'poison_mushroom');
            this.setTexture('poison_mushroom');
            this.setScale(1.5);
            this.body.setSize(20, 24);
            this.body.setOffset(6, 8);
            this.clearTint();
            this.maxHp = 80;
            this.hp = 80;
            this.speedMultiplier = 0;
            this.attackRange = 100;
            this.detectionRange = 260;
        } else if (this.type === 'large') {
            // Executioner (Large Axe)
            createExecutionerTexture(scene, 'executioner');
            this.setTexture('executioner');
            createExecutionerAxeTexture(scene, 'executioner_axe');

            // 小の1.5倍 = 1.5 x 1.0 = 1.5 -> Scale 1.0 (64x64 texture)
            this.setScale(1.0); 
            this.clearTint();
            this.body.setSize(40, 50); 
            this.body.setOffset(12, 10);

            this.maxHp = 300; // 体力高め
            this.hp = 300;
            this.speedMultiplier = 0.7; // 遅め
            this.attackRange = 140; // Axe Reach
            this.detectionRange = 500;

            // スタミナゲージの初期化
            this.staminaBar = scene.add.graphics();
        } else if (this.type === 'charger') {
            // Heavy Knight (Heavy Armor, Shield)
            createHeavyKnightTexture(scene, 'heavy_knight');
            this.setTexture('heavy_knight');
            this.clearTint(); // No tint, use texture colors

            this.setScale(1.0); // Texture is 64x64
            this.body.setSize(40, 40); // Larger hitbox
            this.body.setOffset(12, 12); // Center it

            this.maxHp = 250; // High HP
            this.hp = 250;
            this.speedMultiplier = 0.6; // Slow (Heavy)

            // 遠距離の半分の視界(1000/2 = 500)
            this.detectionRange = 500;
            // 突撃距離も半分(800/2 = 400)
            this.attackRange = 400;

            // SPゲージあり（大の敵と同じ仕様）
            this.maxStamina = 100;
            this.stamina = 100;
            this.isGuardBroken = false;
            this.guardBreakTimer = 0;
            this.guardBreakMax = 0;
            this.staminaBar = scene.add.graphics();
        } else if (this.type === 'normal') {
            this.maxHp = 100;
            this.hp = 100;
            this.speedMultiplier = 0.9; // 少し遅く（よろめき歩き）
            this.clearTint();
            this.body.setSize(20, 20); 
            this.anims.play('exiled_idle', true);
        } else {
            this.maxHp = 100;
            this.hp = 100;
            this.speedMultiplier = 1.0;
            this.setTint(0xff0000); // 通常の敵は赤
        }

        // HP Bar
        this.hpBar = scene.add.graphics();
        this.drawHpBar();
        if (this.type === 'large' || this.type === 'charger' || this.type === 'mossy_statue' || this.type === 'cursed_stag') {
            this.drawStaminaBar();
        }

        // 武器ビジュアル (TINY用など)
        this.weapon = scene.add.rectangle(0, 0, 40, 8, 0xffffff);
        this.weapon.setOrigin(0, 0.5);
        this.weapon.setVisible(false);
        this.weapon.setDepth(55); // Enemy(50) < Weapon < HUD

        if (this.type === 'tiny') {
            this.weapon.setScale(1.0); // 0.8 -> 1.0 (長さ40px)
            this.weapon.fillColor = 0xffaaaa; // Body tint
        } else if (this.type === 'normal') {
            this.weapon.destroy(); // Destroy default rect
            createRustySwordTexture(scene);
            this.weapon = scene.add.sprite(0, 0, 'rusty_sword');
            this.weapon.setOrigin(0.5, 1.0); // Grip at bottom
            this.weapon.setVisible(false);
            this.weapon.setDepth(55);
        } else if (this.type === 'large') {
            this.weapon.destroy(); // Destroy default rect
            // Large Enemy Weapon (Executioner's Axe)
            this.weapon = scene.add.sprite(0, 0, 'executioner_axe');
            this.weapon.setOrigin(0.3, 0.8); // Hold near bottom handle
            this.weapon.setVisible(false);
            this.weapon.setDepth(55); 
        } else if (this.type === 'cursed_stag') {
            this.weapon.destroy();
            this.weapon = scene.add.rectangle(0, 0, 36, 8, 0x8d6e63);
            this.weapon.setOrigin(0.2, 0.8);
            this.weapon.setVisible(false);
            this.weapon.setDepth(55);
        }

        // --- Voxel Damage Mask ---
        // マスク用 RenderTexture (Default 32x32, Larger for Heavy Knight)
        let maskSize = 32;
        if (this.type === 'charger') maskSize = 64;

        this.voxelMaskRT = scene.make.renderTexture({ width: maskSize, height: maskSize, add: false });
        this.voxelMaskRT.fill(0xffffff, 1); // Full visible

        // マスクソース用Image
        // シーンに追加(add: true)しないと、座標更新がマスクに反映されない場合がある
        this.voxelMaskImg = scene.make.image({ x: x, y: y, key: this.voxelMaskRT.texture.key, add: true });
        this.voxelMaskImg.setOrigin(0.5);
        this.voxelMaskImg.setVisible(false); // 画面には表示しない

        // BitmapMask作成
        // invertAlpha = false: Default behavior. 
        // Source Alpha 1 (White) -> Visible
        // Source Alpha 0 (Transparent) -> Invisible (Hole)
        this.voxelMask = new Phaser.Display.Masks.BitmapMask(scene, this.voxelMaskImg);
        this.voxelMask.invertAlpha = false;

        // 敵にマスク適用
        this.setMask(this.voxelMask);
    }

    drawHpBar() {
        this.hpBar.clear();
        this.hpBar.setDepth(this.depth);

        let width = 40;
        let height = 6;
        let yOffset = 30;

        if (this.type === 'tiny') {
            width = 24;
            height = 4;
            yOffset = 20;
        } else if (this.type === 'large') {
            width = 60;
            height = 8;
            yOffset = 50;
        } else if (this.type === 'charger') {
            // Heavy Knight: Large Bar
            width = 60;
            height = 8;
            yOffset = 50; 
        }

        // Background
        this.hpBar.fillStyle(0x000000, 1);
        this.hpBar.fillRect(this.x - width / 2, this.y - yOffset, width, height);
        // HP
        const percent = Math.max(0, this.hp / this.maxHp);
        this.hpBar.fillStyle(0xff0000, 1);
        this.hpBar.fillRect(this.x - width / 2, this.y - yOffset, width * percent, height);
    }

    drawStaminaBar() {
        if (!this.staminaBar) return;
        this.staminaBar.clear();
        this.staminaBar.setDepth(this.depth);

        let hpWidth = 40;
        let hpHeight = 6;
        let hpYOffset = 30;
        if (this.type === 'tiny') {
            hpWidth = 24;
            hpHeight = 4;
            hpYOffset = 20;
        } else if (this.type === 'large' || this.type === 'charger') {
            hpWidth = 60;
            hpHeight = 8;
            hpYOffset = 50;
        }
        const width = hpWidth;
        const height = 4;
        const yOffset = hpYOffset - hpHeight;

        this.staminaBar.fillStyle(0x000000, 1);
        this.staminaBar.fillRect(this.x - width / 2, this.y - yOffset, width, height);

        let color = 0x0088ff;
        let percent = Math.max(0, this.stamina / this.maxStamina);

        if (this.isGuardBroken) {
            const total = this.guardBreakMax > 0 ? this.guardBreakMax : 3000;
            const remaining = Math.max(0, this.guardBreakTimer);
            percent = 1.0 - (remaining / total);
            color = 0x0088ff;
        }

        this.staminaBar.fillStyle(color, 1);
        this.staminaBar.fillRect(this.x - width / 2, this.y - yOffset, width * percent, height);
    }

    startBreakEffect() {
        if (this.breakEvent) this.breakEvent.remove();

        // Blinking (Toggle Tint)
        let isBlink = false;
        this.breakEvent = this.scene.time.addEvent({
            delay: 100,
            callback: () => {
                if (!this.active) return;
                isBlink = !isBlink;
                if (isBlink) {
                    this.setTint(0xff0000); // Red Blink for Break
                } else {
                    this.clearTint(); 
                }
            },
            loop: true
        });
    }

    stopBreakEffect() {
        if (this.breakEvent) {
            this.breakEvent.remove();
            this.breakEvent = null;
        }
        this.clearTint();
    }

    update(time, delta) {
        // マスクの位置同期
        if (this.voxelMaskImg) {
            this.voxelMaskImg.setPosition(this.x, this.y);
            this.voxelMaskImg.setRotation(this.rotation);
            this.voxelMaskImg.setScale(this.scaleX, this.scaleY);
        }

        // ゲームオーバー時は停止
        if (this.scene.isGameOver) return;
        if (this.scene.isFatalTimeStop || (this.scene.player && this.scene.player.isFatalAttacking)) {
            if (this.body) this.setVelocity(0);
            if (this.anims && this.anims.isPlaying) {
                this.anims.pause();
            }
            return;
        }

        if (this.forceMoveVelocity) {
            const dt = delta / 1000;
            const nextX = this.x + this.forceMoveVelocity.x * dt;
            const nextY = this.y + this.forceMoveVelocity.y * dt;

            let blocked = false;
            if (this.body) {
                const bw = this.body.width;
                const bh = this.body.height;
                const halfW = bw * 0.5;
                const halfH = bh * 0.5;
                const bounds = new Phaser.Geom.Rectangle(nextX - halfW, nextY - halfH, bw, bh);

                const checkGroup = group => {
                    if (!group) return;
                    let children = null;
                    if (group.getChildren) {
                        children = group.getChildren();
                    } else if (group.children && group.children.entries) {
                        children = group.children.entries;
                    }
                    if (!children) return;
                    for (let i = 0; i < children.length; i++) {
                        const obj = children[i];
                        if (!obj || !obj.active) continue;
                        const wb = obj.getBounds();
                        if (Phaser.Geom.Intersects.RectangleToRectangle(bounds, wb)) {
                            blocked = true;
                            return;
                        }
                    }
                };

                checkGroup(this.scene.walls);
                checkGroup(this.scene.forestWalls);
                checkGroup(this.scene.obstacles);
            }

            if (!blocked) {
                this.x = nextX;
                this.y = nextY;
            } else {
                this.forceMoveVelocity = null;
                if (this.body) this.body.reset(this.x, this.y);
            }

            if (this.forceMoveVelocity) {
                this.forceMoveVelocity.x *= 0.9;
                this.forceMoveVelocity.y *= 0.9;
                if (Math.abs(this.forceMoveVelocity.x) < 10 && Math.abs(this.forceMoveVelocity.y) < 10) {
                    this.forceMoveVelocity = null;
                    if (this.body) this.body.reset(this.x, this.y);
                }
            }
        }

        // Boundary confinement — use physics world bounds (supports large maps)
        const _wb = this.scene.physics.world.bounds;
        const pad = 32;
        this.x = Phaser.Math.Clamp(this.x, _wb.x + pad, _wb.right - pad);
        this.y = Phaser.Math.Clamp(this.y, _wb.y + pad, _wb.bottom - pad);

        if (this.hp <= 0) {
            this.hpBar.destroy();
            if (this.staminaBar) this.staminaBar.destroy();
            return;
        }

        // HPバーの追従
        this.drawHpBar();
        if (this.type === 'large' || this.type === 'charger' || this.type === 'mossy_statue' || this.type === 'cursed_stag') {
            this.drawStaminaBar();
        }

        // ノックバック中は移動処理をスキップ（物理挙動はPhaserに任せる）
        // これをブレイク判定より前に置くことで、ブレイク中でもノックバックするようにする
        if (this.state === 'KNOCKBACK') {
            // 減速処理（擬似摩擦）で「ぼーん！」感を出す
            this.body.velocity.x *= 0.9;
            this.body.velocity.y *= 0.9;
            return;
        }

        // Sprite Flipping Logic (Horizontal)
        if (this.body && Math.abs(this.body.velocity.x) > 10) {
            // Rat/Goblin/Most enemies face RIGHT by default.
            // If moving LEFT (vel < 0), flipX = true.
            // If moving RIGHT (vel > 0), flipX = false.
            this.setFlipX(this.body.velocity.x < 0);
        }

        if (this.isGuardBroken) {
            this.guardBreakTimer -= delta;
            if (this.guardBreakTimer <= 0) {
                this.guardBreakTimer = 0;
                this.isGuardBroken = false;
                this.canBeFatalNow = false;
                this.stopBreakEffect();
                this.stamina = this.maxStamina;
                this.state = 'CHASE'; 
                this.nextAttackTime = time + 500;
            } else {
                this.setVelocity(0);
                return; 
            }
        }

        const dist = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);

        if (this.type === 'tiny') {
            if (this.state === 'IDLE' || this.state === 'COOLDOWN') {
                this.anims.play('rat_idle', true);
            } else if (this.state === 'CHASE') {
                this.anims.play('rat_move', true);
            }

            if (this.body.velocity.x !== 0) {
                this.flipX = this.body.velocity.x < 0;
            } else if (this.player && this.player.active) {
                this.flipX = this.player.x < this.x;
            }
        } else if (this.type === 'crow') {
            const moving = this.body && (Math.abs(this.body.velocity.x) > 5 || Math.abs(this.body.velocity.y) > 5);
            if (moving) {
                if (!this.anims.currentAnim || this.anims.currentAnim.key !== 'crow_fly') {
                    this.anims.play('crow_fly', true);
                }
            } else {
                this.anims.stop();
                this.setTexture('crow_idle_0');
            }
        } else if (this.type === 'hanged_wisp') {
            const bobSpeed = 0.004;
            const bobAmount = 0.04;
            const scaleBase = 1.0;
            const s = scaleBase + Math.sin(time * bobSpeed) * bobAmount;
            this.setScale(s, s);
        } else if (this.type === 'spearman' || this.type === 'yari_goblin') {
            const isGoblin = this.type === 'yari_goblin';
            const idleAnimKey = isGoblin ? 'goblin_green_idle' : 'goblin_idle';
            const moveAnimKey = isGoblin ? 'goblin_green_move' : 'goblin_move';
            if (this.state === 'IDLE' || this.state === 'COOLDOWN') {
                this.anims.play(idleAnimKey, true);
            } else if (this.state === 'CHASE') {
                this.anims.play(moveAnimKey, true);
            }
        } else if (this.type === 'ranged') {
            // Simple bobbing animation for ranged enemy
            const bobSpeed = 0.005;
            const bobAmount = 0.05;
            const scaleBase = 1.0;
            const s = scaleBase + Math.sin(time * bobSpeed) * bobAmount;
            this.setScale(s, s); // Breathing effect
        } else if (this.type === 'poison_mushroom') {
            const pulseSpeed = 0.006;
            const pulseAmount = 0.06;
            const baseScale = 1.5;
            const s = baseScale + Math.sin(time * pulseSpeed) * pulseAmount;
            this.setScale(s, s);
        }

        if (this.type === 'poison_mushroom') {
            if (!this.nextSporeTime || time >= this.nextSporeTime) {
                if (this.scene && typeof this.scene.spawnPoisonSpores === 'function') {
                    this.scene.spawnPoisonSpores(this.x, this.y, 10);
                }
                this.nextSporeTime = time + 1200;
            }
        }

        switch (this.state) {
            case 'IDLE':
                if (dist < this.detectionRange) {
                    this.state = 'CHASE';
                }
                break;

            case 'CHASE':
                if (dist <= this.attackRange) {
                    if (this.body) this.setVelocity(0);
                    if (time > this.nextAttackTime) {
                        this.startAttackSequence();
                    }
                } else {
                    let speed = 100 * (this.speedMultiplier || 1.0);

                    if (this.type === 'normal') {
                        speed *= (0.8 + 0.4 * Math.sin(time * 0.005));
                        this.anims.play('exiled_walk', true);
                        this.scene.physics.moveToObject(this, this.player, speed);
                    } else if (this.type === 'crow') {
                        const centerX = this.player.x;
                        const centerY = this.player.y;
                        const angleToCrow = Phaser.Math.Angle.Between(centerX, centerY, this.x, this.y);
                        const orbitRadius = this.orbitRadius || 180;
                        const dir = this.orbitDir || 1;
                        const tangentAngle = angleToCrow + dir * Math.PI * 0.5;
                        let vx = Math.cos(tangentAngle) * speed;
                        let vy = Math.sin(tangentAngle) * speed;
                        const radiusError = dist - orbitRadius;
                        const adjust = 30;
                        vx += Math.cos(angleToCrow) * (-radiusError) * 0.2;
                        vy += Math.sin(angleToCrow) * (-radiusError) * 0.2;
                        if (this.body) {
                            this.setVelocity(vx, vy);
                        }
                    } else {
                        this.scene.physics.moveToObject(this, this.player, speed);
                    }
                }
                break;

            case 'PREPARE':
                if (this.type === 'normal') {
                    // 亡命兵は予兆中も少し移動する（じりじりと距離を詰める）
                    this.scene.physics.moveToObject(this, this.player, 50);
                    this.anims.play('exiled_walk', true);
                } else {
                    if (this.body) this.setVelocity(0);
                }
                break;

            case 'ATTACK':
                if (this.type === 'charger' || this.type === 'crow') {
                    if (this.player && this.player.active) {
                        const dist = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
                        const hitRange = this.type === 'crow' ? 32 : 40;
                        if (dist < hitRange) {
                            const dmg = this.type === 'crow'
                                ? Phaser.Math.Between(8, 14)
                                : Phaser.Math.Between(15, 25);
                            this.player.takeDamage(dmg, this);
                            this.player.takeKnockback(this.body.velocity.x, this.body.velocity.y, 400);
                            this.setVelocity(0);
                            this.state = 'COOLDOWN';
                        }
                    }
                } else if (this.type === 'normal') {
                    // 亡命兵は攻撃中も踏み込む（移動しながら切りつける）
                    // 速度は徐々に減衰させてもよいが、ここでは一定の踏み込み
                    // (Tween側で制御するならここは不要だが、物理挙動を残す)
                } else if (this.type === 'tiny') {
                    // Rat Lunge Attack (controlled by executeAttack / Tweens)
                    // Do not force stop
                } else {
                    if (this.body) this.setVelocity(0);
                }
                break;

            case 'COOLDOWN':
                if (this.body) this.setVelocity(0);
                break;
        }
    }

    takeKnockback(vx, vy, duration = 200) {
        if (!this.body) return;

        // Large/Charger/Statue/Shield Enemy Logic
        if (this.type === 'large' || this.type === 'charger' || this.type === 'mossy_statue' || this.type === 'cursed_stag') {
            // Super Armor during Attack
            if (this.state === 'PREPARE' || this.state === 'ATTACK') {
                return; // No knockback, no interruption
            }

            // Knockback Resistance (Even when not attacking)
            vx *= 0.3;
            vy *= 0.3;
            duration = 100; // Short stun
        } else {
            // その他の敵（normal, tiny, ranged）もノックバック軽減
            vx *= 0.5;
            vy *= 0.5;
        }

        // 攻撃中なら中断させる
        this.state = 'KNOCKBACK';
        this.setVelocity(vx, vy);

        // 色変更はtakeDamageの白点滅に任せる（黄色が混じらないように削除）

        this.cancelAttack();

        this.scene.time.delayedCall(duration, () => {
            if (!this.active || !this.scene) return;

            // 色戻しもtakeDamageに任せる

            // 生きていればCHASEに戻る
            if (this.hp > 0) {
                this.state = 'CHASE';
                this.setVelocity(0);
            }
        });
    }

    cancelAttack() {
        if (this.attackTween) {
            this.attackTween.stop();
            this.attackTween = null;
        }
        if (this.attackBgGraphics) {
            this.attackBgGraphics.destroy();
            this.attackBgGraphics = null;
        }
        if (this.attackChargeGraphics) {
            this.attackChargeGraphics.destroy();
            this.attackChargeGraphics = null;
        }
    }

    startAttackSequence() {
        this.state = 'PREPARE';
        // 1. 予兆（Telegraph）の表示
        // 背景（薄い赤）
        this.attackBgGraphics = this.scene.add.graphics();
        this.attackBgGraphics.setDepth(10); // 血しぶき(5)や肉片(6)より上
        this.attackBgGraphics.fillStyle(0xff0000, 0.2);

        // チャージ用（濃い赤）
        this.attackChargeGraphics = this.scene.add.graphics();
        this.attackChargeGraphics.setDepth(10); // 血しぶき(5)や肉片(6)より上
        this.attackChargeGraphics.fillStyle(0xff0000, 0.6);

        // プレイヤーの方向
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
        let radius = this.attackRange || 100;
        if (this.type === 'tiny') {
            radius = 90; 
        } else if (this.type === 'spearman' || this.type === 'yari_goblin') {
            radius = 70;
        } else if (this.type === 'normal') {
            radius = 72;
        }

        if (this.type === 'ranged') {
            // 遠距離攻撃の予兆（直線的なライン）
            // アニメーション: 弓を引く
            this.setTexture('skeleton_draw');

            // ユーザー要望に合わせて「薄赤い」色に設定
            this.attackBgGraphics.lineStyle(4, 0xff0000, 0.2);

            // プレイヤーへの直線を描画
            const endX = this.x + Math.cos(angle) * 400;
            const endY = this.y + Math.sin(angle) * 400;

            this.attackBgGraphics.lineBetween(this.x, this.y, endX, endY);
        } else if (this.type === 'normal') {
            // 亡命兵の攻撃予兆
            this.anims.play('exiled_charge', true);

            // 扇形 (Wider for flowing slash)
            this.attackBgGraphics.slice(this.x, this.y, radius, angle - 1.2, angle + 1.2);
            this.attackBgGraphics.fillPath();
        } else if (this.type === 'large') {
            // 強攻撃（斧振り下ろし）の予兆
            // 扇形
            const range = this.attackRange || 140;
            // 広範囲（+/- 1.2ラジアン = 約70度、全体140度）
            this.attackBgGraphics.fillStyle(0xff0000, 0.2);
            this.attackBgGraphics.slice(this.x, this.y, range, angle - 1.2, angle + 1.2);
            this.attackBgGraphics.fillPath();
        } else if (this.type === 'hanged_wisp') {
            const range = this.attackRange || radius;
            const width = 20;
            this.attackBgGraphics.lineStyle(width, 0xff0000, 0.2);
            const endX = this.x + Math.cos(angle) * range;
            const endY = this.y + Math.sin(angle) * range;
            this.attackBgGraphics.lineBetween(this.x, this.y, endX, endY);
        } else if (this.type === 'charger' || this.type === 'crow') {
            const isCrow = this.type === 'crow';
            const baseRange = this.attackRange || (isCrow ? 120 : 400);
            const range = isCrow ? baseRange * 1.5 : baseRange;
            const width = isCrow ? 30 : 60;
            this.attackBgGraphics.lineStyle(width, 0xff0000, 0.2);
            const endX = this.x + Math.cos(angle) * range;
            const endY = this.y + Math.sin(angle) * range;
            this.attackBgGraphics.lineBetween(this.x, this.y, endX, endY);
        } else if (this.type === 'poison_mushroom') {
            const r = this.attackRange || radius;
            this.attackBgGraphics.fillCircle(this.x, this.y, r);
        } else if (this.type === 'mossy_statue') {
            const r = this.attackRange || radius;
            this.attackBgGraphics.fillCircle(this.x, this.y, r);
        } else if (this.type === 'cursed_stag') {
            const r = this.attackRange || radius;
            this.attackBgGraphics.slice(this.x, this.y, r, angle - 0.6, angle + 0.6);
            this.attackBgGraphics.fillPath();
        } else {
            // 円形攻撃範囲（扇形）
            this.attackBgGraphics.slice(this.x, this.y, radius, angle - 0.7, angle + 0.7);
            this.attackBgGraphics.fillPath();
        }

        // チャージアニメーション
        let chargeDuration = 800;
        if (this.type === 'mossy_statue') {
            chargeDuration = 1600;
        } else if (this.type === 'cursed_stag') {
            chargeDuration = 650;
        }
        const chargeObj = { value: 0 };

        this.attackTween = this.scene.tweens.add({
            targets: chargeObj,
            value: 1,
            duration: chargeDuration,
            onUpdate: () => {
                if (!this.attackChargeGraphics || !this.attackChargeGraphics.scene) return;
                this.attackChargeGraphics.clear();

                // Normalタイプの場合は移動しているので背景も更新する
                if (this.type === 'normal') {
                    if (this.attackBgGraphics && this.attackBgGraphics.scene) {
                        this.attackBgGraphics.clear();
                        const currentAngle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
                        this.attackBgGraphics.fillStyle(0xff0000, 0.2);
                        this.attackBgGraphics.slice(this.x, this.y, radius, currentAngle - 1.2, currentAngle + 1.2);
                        this.attackBgGraphics.fillPath();
                    }
                }

                // チャージ描画
                const currentAngle = (this.type === 'normal') 
                    ? Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y) 
                    : angle;

                if (this.type === 'ranged') {
                    // 直線のチャージ（始点から伸びる）
                    const range = this.attackRange || 800;
                    const endX = this.x + Math.cos(angle) * range * chargeObj.value;
                    const endY = this.y + Math.sin(angle) * range * chargeObj.value;

                    // 濃い赤でチャージ表示
                    this.attackChargeGraphics.lineStyle(4, 0xff0000, 0.8);
                    this.attackChargeGraphics.lineBetween(this.x, this.y, endX, endY);
                } else if (this.type === 'large') {
                    // 斧振り下ろしのチャージ（扇形）
                    const range = this.attackRange || 140;

                    this.attackChargeGraphics.fillStyle(0xff0000, 0.6);
                    // 中心から外側へ広がる
                    this.attackChargeGraphics.slice(this.x, this.y, range * chargeObj.value, angle - 1.2, angle + 1.2);
                    this.attackChargeGraphics.fillPath();
                } else if (this.type === 'hanged_wisp') {
                    const range = this.attackRange || radius;
                    const currentRange = range * chargeObj.value;
                    const width = 20;
                    const endX = this.x + Math.cos(angle) * currentRange;
                    const endY = this.y + Math.sin(angle) * currentRange;
                    this.attackChargeGraphics.lineStyle(width, 0xff0000, 0.8);
                    this.attackChargeGraphics.lineBetween(this.x, this.y, endX, endY);
                } else if (this.type === 'charger' || this.type === 'crow') {
                    const isCrow = this.type === 'crow';
                    const baseRange = this.attackRange || (isCrow ? 120 : 400);
                    const range = isCrow ? baseRange * 1.5 : baseRange;
                    const width = isCrow ? 30 : 60;
                    const currentRange = range * chargeObj.value;
                    const endX = this.x + Math.cos(angle) * currentRange;
                    const endY = this.y + Math.sin(angle) * currentRange;
                    this.attackChargeGraphics.lineStyle(width, 0xff0000, 0.8);
                    this.attackChargeGraphics.lineBetween(this.x, this.y, endX, endY);
                } else if (this.type === 'poison_mushroom') {
                    const r = this.attackRange || radius;
                    this.attackChargeGraphics.fillStyle(0xff0000, 0.6);
                    this.attackChargeGraphics.fillCircle(this.x, this.y, r * chargeObj.value);
                } else if (this.type === 'mossy_statue') {
                    const r = this.attackRange || radius;
                    this.attackChargeGraphics.fillStyle(0xff0000, 0.6);
                    this.attackChargeGraphics.fillCircle(this.x, this.y, r * chargeObj.value);
                } else if (this.type === 'cursed_stag') {
                    const r = this.attackRange || radius;
                    this.attackChargeGraphics.fillStyle(0xff0000, 0.6);
                    this.attackChargeGraphics.slice(this.x, this.y, r * chargeObj.value, angle - 0.6, angle + 0.6);
                    this.attackChargeGraphics.fillPath();
                } else if (this.type === 'normal') {
                    // 亡命兵のチャージ（ワイドな扇形）
                    this.attackChargeGraphics.fillStyle(0xff0000, 0.6);
                    this.attackChargeGraphics.slice(this.x, this.y, radius * chargeObj.value, currentAngle - 1.2, currentAngle + 1.2);
                    this.attackChargeGraphics.fillPath();
                } else {
                    // 扇形のチャージ
                    this.attackChargeGraphics.fillStyle(0xff0000, 0.6);
                    // 中心から外側へ広がる
                    this.attackChargeGraphics.slice(this.x, this.y, radius * chargeObj.value, angle - 0.7, angle + 0.7);
                    this.attackChargeGraphics.fillPath();
                }
            },
            onComplete: () => {
                if (this.attackBgGraphics) {
                    this.attackBgGraphics.destroy();
                    this.attackBgGraphics = null;
                }
                if (this.attackChargeGraphics) {
                    this.attackChargeGraphics.destroy();
                    this.attackChargeGraphics = null;
                }
                this.attackTween = null;
                // 攻撃実行時の角度を再計算（Normal以外は初期角度のままかもしれないが、追尾させるならここも変更）
                // 今回はNormalのみ追尾させる
                const finalAngle = (this.type === 'normal') 
                    ? Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y) 
                    : angle;
                this.executeAttack(finalAngle);
            }
        });
    }

    executeAttack(angle) {
        if (this.hp <= 0) return;

        this.state = 'ATTACK';

        if (this.type === 'ranged') {
            // アニメーション: 発射
            this.setTexture('skeleton_shoot');

            // 少し遅れてアイドルに戻る
            this.scene.time.delayedCall(200, () => {
                if (this.active) this.setTexture('skeleton_idle');
            });

            // 矢を発射
            const spawnDist = 30;
            const spawnX = this.x + Math.cos(angle) * spawnDist;
            const spawnY = this.y + Math.sin(angle) * spawnDist;

            const arrow = new Arrow(this.scene, spawnX, spawnY, angle);
            this.scene.arrows.add(arrow);

            const speed = 400;
            arrow.launch(speed);
        } else if (this.type === 'tiny') {
            // Rat "Bite" Attack (Melee, similar to Militia)
            if (this.anims && this.anims.play) {
                this.anims.play('rat_attack', true);
            }

            // Quick step forward (Dash)
            const dashSpeed = 350; // Quick dash
            this.setVelocity(Math.cos(angle) * dashSpeed, Math.sin(angle) * dashSpeed);

            // Visual Swipe Effect (Claw/Bite)
            const swipe = this.scene.add.graphics();
            swipe.setDepth(this.depth + 1);
            swipe.lineStyle(4, 0xffffff, 1); // White sharp line

            // Draw a quick slash arc in front
            const arcRadius = 40;
            swipe.beginPath();
            swipe.arc(this.x, this.y, arcRadius, angle - 1.0, angle + 1.0, false);
            swipe.strokePath();

            // Fade out swipe
            this.scene.tweens.add({
                targets: swipe,
                alpha: 0,
                x: Math.cos(angle) * 30, // Move effect forward
                y: Math.sin(angle) * 30,
                duration: 150,
                onComplete: () => swipe.destroy()
            });

            // Stop and Hit Check after short dash
            this.scene.time.delayedCall(150, () => {
                if (!this.active || this.hp <= 0) return;

                this.setVelocity(0);

                // Hit Detection (Melee Cone)
                const dist = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
                const playerAngle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
                const angleDiff = Math.abs(Phaser.Math.Angle.ShortestBetween(Phaser.Math.RadToDeg(angle), Phaser.Math.RadToDeg(playerAngle)));

                // Range 90, Angle +/- 70 degrees (Wide bite)
                if (dist < 90 && angleDiff < 70) {
                    const dmg = Phaser.Math.Between(10, 15);
                    this.player.takeDamage(dmg, this);

                    // Small knockback
                    const kbAngle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
                    this.player.takeKnockback(Math.cos(kbAngle) * 200, Math.sin(kbAngle) * 200, 100);
                }

                // Return to IDLE
                this.scene.time.delayedCall(200, () => { 
                     if (this.active) {
                         this.state = 'COOLDOWN';
                         this.anims.play('rat_idle', true);
                     }
                });
            });
        } else if (this.type === 'normal') {
            // Exiled Soldier Attack: Flowing Slash (Nagashigiri)
            this.anims.play('exiled_swing', true);

            this.weapon.setVisible(true);
            this.weapon.setPosition(this.x, this.y);

            // Wider, smoother sweep
            // Start from opposite side (e.g. Right shoulder to Left hip)
            const startAngle = angle - 1.5; 
            const endAngle = angle + 1.5;

            this.weapon.setRotation(startAngle);

            this.scene.tweens.add({
                targets: this.weapon,
                rotation: endAngle,
                duration: 400, // Slower, more deliberate
                ease: 'Quad.easeInOut', // Soft in, soft out (Flowing feel)
                onUpdate: () => {
                     if (this.active) {
                         this.weapon.setPosition(this.x, this.y);
                     }
                },
                onComplete: () => {
                    if (this.active && this.weapon) {
                        this.weapon.setVisible(false);
                        this.anims.play('exiled_idle', true);
                    }
                }
            });

            // Add "Flowing" Trail Effect
            const trailDuration = 200;
            const trailCount = 5;
            for(let i=0; i<trailCount; i++) {
                this.scene.time.delayedCall(i * 30, () => {
                     if (!this.active || !this.weapon.visible) return;
                     const trail = this.scene.add.sprite(this.x, this.y, 'rusty_sword');
                     trail.setOrigin(0.5, 1.0);
                     trail.rotation = this.weapon.rotation;
                     trail.setAlpha(0.4);
                     trail.setTint(0xffffff); // White trail for wind effect
                     trail.setDepth(54); // Behind weapon

                     this.scene.tweens.add({
                         targets: trail,
                         alpha: 0,
                         scaleX: 1.2,
                         scaleY: 1.2,
                         duration: 150,
                         onComplete: () => trail.destroy()
                     });
                });
            }

            // Hit Detection (Wide Sweep)
            const range = this.attackRange || 80;
            const dist = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
            const playerAngle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
            const angleDiff = Math.abs(Phaser.Math.Angle.ShortestBetween(Phaser.Math.RadToDeg(angle), Phaser.Math.RadToDeg(playerAngle)));

            // Wider hit angle (80 degrees)
            if (dist < range && angleDiff < 80) {
                const dmg = Phaser.Math.Between(10, 20);
                this.player.takeDamage(dmg, this);
                const kbAngle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
                this.player.takeKnockback(Math.cos(kbAngle) * 350, Math.sin(kbAngle) * 350, 200);
            }
        } else if (this.type === 'large') {
            // Axe Swing Animation
            this.weapon.setVisible(true);
            this.weapon.setPosition(this.x, this.y);

            // Start position: Raised high (Wide swing)
            const startAngle = angle - 1.2; 
            const endAngle = angle + 1.2;

            this.weapon.setRotation(startAngle);

            // Swing Down
            this.scene.tweens.add({
                targets: this.weapon,
                rotation: endAngle,
                duration: 300,
                ease: 'Back.easeOut', // Heavy impact feel
                onUpdate: () => {
                     if (this.active) {
                         // Keep attached to body
                         this.weapon.setPosition(this.x, this.y);
                     }
                },
                onComplete: () => {
                    if (this.active && this.weapon) {
                        this.weapon.setVisible(false);
                    }
                }
            });

            // Axe Hitbox (Wide Sweep)
            const range = this.attackRange || 140;

            const dist = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
            const playerAngle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);

            const angleDiff = Math.abs(Phaser.Math.Angle.ShortestBetween(Phaser.Math.RadToDeg(angle), Phaser.Math.RadToDeg(playerAngle)));

            // Wider angle for axe swing (Match telegraph: +/- 1.2 rad approx 70 deg)
            if (dist < range && angleDiff < 70) {
                const dmg = Phaser.Math.Between(30, 45); // Heavy Damage
                this.player.takeDamage(dmg, this);
                // Heavy Knockback
                 const kbAngle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
                 this.player.takeKnockback(Math.cos(kbAngle) * 600, Math.sin(kbAngle) * 600, 400);
            }
        } else if (this.type === 'charger' || this.type === 'crow') {
            const speed = this.type === 'crow' ? 520 : 600;
            const duration = this.type === 'crow' ? 400 : 500;
            this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
            this.scene.time.delayedCall(duration, () => {
                if (!this.active || this.hp <= 0) return;
                this.setVelocity(0);
                if (this.state !== 'COOLDOWN') {
                    this.state = 'COOLDOWN';
                }
                this.scene.time.delayedCall(1000, () => {
                    if (!this.active || !this.scene) return;
                    this.state = 'IDLE';
                    this.nextAttackTime = this.scene.time.now + 1000;
                });
                });
                return;
        } else if (this.type === 'hanged_wisp') {
            const range = this.attackRange || 140;
            const startX = this.x;
            const startY = this.y;
            const endX = startX + Math.cos(angle) * range;
            const endY = startY + Math.sin(angle) * range;
            const bolt = this.scene.add.graphics();
            bolt.setDepth(this.depth + 2);
            bolt.lineStyle(6, 0x221133, 1);
            bolt.beginPath();
            bolt.moveTo(startX, startY);
            const segments = 6;
            for (let i = 1; i < segments; i++) {
                const t = i / segments;
                const px = Phaser.Math.Linear(startX, endX, t);
                const py = Phaser.Math.Linear(startY, endY, t);
                const offset = Phaser.Math.Between(-8, 8);
                const nx = Math.cos(angle + Math.PI * 0.5) * offset;
                const ny = Math.sin(angle + Math.PI * 0.5) * offset;
                bolt.lineTo(px + nx, py + ny);
            }
            bolt.lineTo(endX, endY);
            bolt.strokePath();
            const inner = this.scene.add.graphics();
            inner.setDepth(this.depth + 3);
            inner.lineStyle(2, 0xaa88ff, 1);
            inner.beginPath();
            inner.moveTo(startX, startY);
            inner.lineTo(endX, endY);
            inner.strokePath();
            this.scene.tweens.add({
                targets: [bolt, inner],
                alpha: 0,
                duration: 180,
                onComplete: () => {
                    bolt.destroy();
                    inner.destroy();
                }
            });
            const playerDist = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
            const playerAngle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
            let angleDiff = angle - playerAngle;
            angleDiff = Phaser.Math.Angle.Wrap(angleDiff);
            angleDiff = Math.abs(angleDiff);
            const maxRange = range + 10;
            if (playerDist <= maxRange && angleDiff < 0.25) {
                const dmg = Phaser.Math.Between(24, 32);
                this.player.takeDamage(dmg, this);
                const kbAngle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
                this.player.takeKnockback(Math.cos(kbAngle) * 300, Math.sin(kbAngle) * 300, 200);
            }
        } else if (this.type === 'poison_mushroom') {
            if (this.scene && typeof this.scene.spawnPoisonSpores === 'function') {
                this.scene.spawnPoisonSpores(this.x, this.y, 28);
            }
            const range = this.attackRange || 100;
            const dist = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
            if (dist < range) {
                const dmg = Phaser.Math.Between(12, 20);
                this.player.takeDamage(dmg, this);
            }
        } else if (this.type === 'mossy_statue') {
            const range = this.attackRange || 140;
            const scene = this.scene || (this.player && this.player.scene);
            if (!scene || !scene.add || !scene.tweens) {
                return;
            }
            const ripple = scene.add.graphics();
            ripple.setDepth(this.depth + 1);
            ripple.lineStyle(3, 0x4caf50, 0.9);
            ripple.strokeCircle(this.x, this.y, range);
            const spikes = scene.add.graphics();
            spikes.setDepth(this.depth + 1);
            spikes.fillStyle(0x8bc34a, 0.9);
            const spikeCount = 12;
            for (let i = 0; i < spikeCount; i++) {
                const a = (Math.PI * 2 * i) / spikeCount;
                const sx = this.x + Math.cos(a) * (range - 8);
                const sy = this.y + Math.sin(a) * (range - 8);
                const ex = this.x + Math.cos(a) * (range + 4);
                const ey = this.y + Math.sin(a) * (range + 4);
                spikes.beginPath();
                spikes.moveTo(sx, sy);
                spikes.lineTo(ex, ey);
                spikes.lineTo(this.x + Math.cos(a) * (range - 2), this.y + Math.sin(a) * (range - 2));
                spikes.closePath();
                spikes.fillPath();
            }
            scene.tweens.add({
                targets: [ripple, spikes],
                alpha: 0,
                duration: 250,
                onComplete: () => {
                    ripple.destroy();
                    spikes.destroy();
                }
            });
            const dist = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
            if (dist < range) {
                const dmg = Phaser.Math.Between(18, 26);
                this.player.takeDamage(dmg, this);
                const kbAngle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
                this.player.takeKnockback(Math.cos(kbAngle) * 260, Math.sin(kbAngle) * 260, 220);
            }
        } else if (this.type === 'cursed_stag') {
            const range = this.attackRange || 90;
            this.anims.play('cursed_stag_attack', true);
            this.scene.time.delayedCall(180, () => {
                if (!this.active) return;
                this.anims.play('cursed_stag_idle', true);
            });
            const dist = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
            const playerAngle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
            let angleDiff = angle - playerAngle;
            angleDiff = Phaser.Math.Angle.Wrap(angleDiff);
            angleDiff = Math.abs(angleDiff);
            if (dist < range && angleDiff < 0.6) {
                const dmg = Phaser.Math.Between(18, 26);
                this.player.takeDamage(dmg, this);
                const kbAngle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
                this.player.takeKnockback(Math.cos(kbAngle) * 320, Math.sin(kbAngle) * 320, 260);
            }
        } else {
            // 近接攻撃判定

            if (this.type === 'tiny') {
                if (this.anims && this.anims.play) {
                    this.anims.play('rat_attack', true);
                }
                let reach = 47;
                const baseLen = 18;
                const scaleTarget = reach / baseLen;
                const ox = this.x + Math.cos(angle) * 8;
                const oy = this.y + Math.sin(angle) * 8;
                // Tentacle was for tiny blob. For rat, maybe just a bite effect or nothing special (animation handles it).
                // Removing tentacle effect as it doesn't fit a rat.

                this.scene.tweens.add({
                    targets: this,
                    scaleX: 1.15,
                    scaleY: 0.95,
                    duration: 140,
                    yoyo: true,
                    onComplete: () => {
                        if (this.active) this.setScale(1.2);
                    }
                });
            } else if (this.type === 'spearman' || this.type === 'yari_goblin') {
                const isGoblin = this.type === 'yari_goblin';
                const attackAnimKey = isGoblin ? 'goblin_green_attack' : 'goblin_attack';
                this.anims.play(attackAnimKey, true);

                // Spark effect
                const tele = this.scene.add.sprite(this.x, this.y, 'spark');
                tele.setOrigin(0.5, 0.5);
                tele.setDepth(56);
                tele.setTint(0xffee58);
                this.scene.tweens.add({
                    targets: tele,
                    alpha: 0,
                    duration: 120,
                    onComplete: () => tele.destroy()
                });

                // Self animation (small lunge forward handled by texture offset, but we can add small tween)
                const lungeDistance = isGoblin ? 12 : 16;
                const tweenDuration = isGoblin ? 240 : 140;
                this.scene.tweens.add({
                    targets: this,
                    x: this.x + Math.cos(angle) * lungeDistance,
                    y: this.y + Math.sin(angle) * lungeDistance,
                    duration: tweenDuration,
                    yoyo: true,
                    ease: 'Quad.easeOut'
                });

                const cooldown = isGoblin ? 2000 : 1000;
                this.once('animationcomplete', () => {
                    if (!this.active) return;
                    this.state = 'COOLDOWN';
                    this.scene.time.delayedCall(cooldown, () => {
                        if (!this.active || !this.scene) return;
                        this.state = 'IDLE';
                        this.nextAttackTime = this.scene.time.now + cooldown;
                    });
                });

                // Return early to skip default cooldown logic
                // Damage logic below still needs to run? No, damage logic is inside the if-else blocks or below?
                // Wait, damage logic is below "if (this.type === 'ranged') ... else ... "
                // The damage logic is at L4407. We need to run that BEFORE returning, or duplicate it.
                // Let's duplicate the damage logic here for spearman to ensure timing is correct (e.g. at the thrust frame).
                // Actually, for instant hit, we can just run it now.

                const dist = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
                const playerAngle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
                let angleDiff = angle - playerAngle;
                angleDiff = Phaser.Math.Angle.Wrap(angleDiff);
                angleDiff = Math.abs(angleDiff);
                if (dist < 70 && angleDiff < 1.0) {
                    const dmg = isGoblin ? Phaser.Math.Between(10, 15) : Phaser.Math.Between(15, 20);
                    this.player.takeDamage(dmg, this);
                }

                return; 

            } else if (this.type === 'normal') {
                this.weapon.setVisible(true);
                this.weapon.setPosition(this.x, this.y);
                const swingOffset = 0.9;
                let startAngle;
                let endAngle;
                if (Math.abs(angle) > Math.PI / 2) {
                    startAngle = angle + swingOffset;
                    startAngle = Phaser.Math.Angle.Wrap(startAngle);
                    endAngle = startAngle - (swingOffset * 2);
                } else {
                    startAngle = angle - swingOffset;
                    startAngle = Phaser.Math.Angle.Wrap(startAngle);
                    endAngle = startAngle + (swingOffset * 2);
                }
                this.weapon.setRotation(startAngle);
                this.scene.tweens.add({
                    targets: this.weapon,
                    rotation: endAngle,
                    duration: 150,
                    onUpdate: () => {
                        if (this.active) {
                            this.weapon.setPosition(this.x, this.y);
                        }
                    },
                    onComplete: () => {
                        if (this.active && this.weapon) {
                            this.weapon.setVisible(false);
                        }
                    }
                });
            }

            const dist = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
            const playerAngle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);

            // Fix angle difference calculation to handle wrapping (PI vs -PI)
            let angleDiff = angle - playerAngle;
            angleDiff = Phaser.Math.Angle.Wrap(angleDiff);
            angleDiff = Math.abs(angleDiff);

            let hit = false;

            // 攻撃距離の判定
            let attackRangeDist = 100;
            if (this.type === 'tiny') {
                // 武器長(40) + 本体半径(8) + 相手半径(16) = 64
                // 少し余裕を持たせて55〜60程度だが、赤い範囲(40)にプレイヤーが触れる距離にする
                attackRangeDist = 55; 
            } else if (this.type === 'spearman') {
                attackRangeDist = 70;
            } else if (this.type === 'normal') {
                // 武器長(72) + 本体半径(16) + 相手半径(16) = 104
                // 赤い範囲(72)にプレイヤーが触れる距離。半径の和(32) + 範囲(72) = 104
                // 100は少し厳しいので、90程度にする
                attackRangeDist = 90;
            }

            if (dist < attackRangeDist && angleDiff < 1.0) {
                hit = true;
            }

            if (hit) {
                const dmg = Phaser.Math.Between(8, 12);
                this.player.takeDamage(dmg, this);
            }
        }

        this.state = 'COOLDOWN';
        let cooldown = 1000;
        if (this.type === 'mossy_statue') {
            cooldown = 2000;
        }
        const scene = this.scene || (this.player && this.player.scene);
        if (!scene || !scene.time) {
            return;
        }
        scene.time.delayedCall(cooldown, () => {
            const activeScene = this.scene || (this.player && this.player.scene);
            if (!this.active || !activeScene || !activeScene.time) return;
            this.state = 'IDLE';
            this.nextAttackTime = activeScene.time.now + cooldown;
        });
    }

    takeDamage(amount, attackType = 'light', customHitStop = 0, isPlayerCritical = false) {
        let finalDamage = amount;
        let isCritical = false;

        if (this.type === 'large' || this.type === 'charger' || this.type === 'mossy_statue' || this.type === 'cursed_stag') {
            if (!this.isGuardBroken) {
                // Reduce Stamina
                // RB長押し（Empowered）時はSP削り値が高い
                let staminaDmg = 20;
                if (this.player.isEmpowered) {
                    if (attackType === 'heavy') {
                        staminaDmg = 150; // Empowered Heavy (High SP Damage)
                    } else {
                        staminaDmg = 50; // Empowered Light
                    }
                }

                const bonus = this.player && this.player.spDamageBonus ? this.player.spDamageBonus : 0;
                this.stamina -= (staminaDmg + bonus);
                if (this.stamina <= 0) {
                    // ブレイク時にプレイヤーのHPを50%回復 (RB攻撃時のみ)
                    if (this.player && this.player.isEmpowered) {
                        this.player.recoverHealth(this.player.maxHp * 0.5);
                    }

                    this.stamina = 0;
                    this.isGuardBroken = true;
                    this.canBeFatalNow = true;

                    // Hit Stop Duration
                    // ブレイク時は演出重視で固定値長めにするか、customHitStopを使うか
                    // ここではブレイク演出優先で300ms固定とするが、customHitStopが極端に長ければそちら優先も検討
                    const stopDuration = 300;

                    const guardBreakDuration = 3000 + stopDuration;
                    this.guardBreakTimer = guardBreakDuration;
                    this.guardBreakMax = guardBreakDuration;

                    // this.setTint(0x888888); // Removed in favor of blinking
                    this.startBreakEffect(); // Start Red Blinking
                    this.scene.showDamagePopup(this.x, this.y - 60, "BREAK!", "#ffff00");
                    this.scene.spawnBreakParticles(this.x, this.y, 30);
                    this.cancelAttack();
                    // Add Hit Stop for Guard Break
                    this.scene.hitStop(stopDuration);

                    // ブレイク瞬間の強制ノックバック（ヒットストップ中も動くように手動制御）
                    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.x, this.y);
                    const force = 400; 
                    this.forceMoveVelocity = {
                        x: Math.cos(angle) * force,
                        y: Math.sin(angle) * force
                    };

                    this.state = 'KNOCKBACK';
                    this.setVelocity(0); // 物理移動はキャンセル（手動制御に任せる）

                    this.scene.time.delayedCall(300, () => {
                        if (!this.active) return;
                        if (this.hp > 0) {
                            // ノックバック終了
                            // ブレイク中はupdateで制御されるのでstateは何でも良いが、KNOCKBACK以外にする
                            this.state = 'IDLE'; 
                            this.setVelocity(0);
                        }
                    });
                }

                // Reduce Damage (Hard skin)
                finalDamage = Math.ceil(amount * 0.1);
            } else {
                // Guard Broken: Critical Damage
                finalDamage = amount * 2;
                isCritical = true;
            }
        }

        this.hp -= finalDamage;

        if (this.scene && typeof this.scene.registerEnemyDamage === 'function' && finalDamage > 0) {
            this.scene.registerEnemyDamage(finalDamage);
        }

        if (this.type === 'tiny') {
            this.anims.play('rat_hit', true);
        } else if (this.type === 'spearman' || this.type === 'yari_goblin') {
            const hitAnimKey = this.type === 'yari_goblin' ? 'goblin_green_hit' : 'goblin_hit';
            this.anims.play(hitAnimKey, true);
        }

        // ダメージ表示
        let color = '#ffffff';
        if (isCritical) color = '#ff0000';
        else if (isPlayerCritical) color = '#ffff00';
        const displayText = (isCritical || isPlayerCritical) ? finalDamage + "!" : finalDamage;
        this.scene.showDamagePopup(this.x, this.y - 40, displayText, color);

        // ボクセル欠損エフェクト
        this.chipBody();

        // Normal hit flash (skip if blinking for break)
        if (!this.isGuardBroken) {
            this.setTintFill(0xffffff); // Use setTintFill for solid white flash
            this.scene.time.delayedCall(100, () => {
                if (this.active) {
                    if ((this.type === 'large' || this.type === 'charger') && this.isGuardBroken) {
                        // Ignore, blinking handles it
                    } else if (this.type === 'charger') {
                        this.clearTint();
                    } else if (this.type === 'tiny') {
                        this.setTint(0xffaaaa);
                    } else {
                        this.clearTint(); // Restore to original color (Green for goblin/spearman, None for large)
                    }
                }
            });
        }

        if (this.hp <= 0) {
            if (this.scene && typeof this.scene.registerEnemyKill === 'function') {
                this.scene.registerEnemyKill();
            }
            // ヒットストップ（死亡時：トドメの強調）
            // 一般的なアクションゲームの強打撃基準：約7フレーム = 120ms
            this.scene.hitStop(200);

            // 覚醒攻撃でトドメを刺した場合、HPを最大値の10%回復
            if (this.player && this.player.isEmpowered) {
                this.player.recoverHealth(this.player.maxHp * 0.1);
            }

            this.cancelAttack();
            if (this.weapon) this.weapon.destroy(); // 武器削除
            this.hpBar.destroy();
            if (this.staminaBar) this.staminaBar.destroy(); // SPゲージ削除
            // 死亡時に肉片を撒き散らす
            const scale = this.type === 'tiny' ? 0.5 : 1.0;
            this.scene.spawnGore(this.x, this.y, 0xaa0000, scale);

            // Gold Drop (1-500)
            const goldAmount = Phaser.Math.Between(1, 500);
            this.scene.spawnGold(this.x, this.y, goldAmount);

            // Item Drop Test (50% chance)
            if (Phaser.Math.Between(0, 100) < 50) {
                const type = Phaser.Math.Between(0, 1) === 0 ? 'weapon' : 'shield';
                // Use scene factory if available, or direct instantiation
                // Since ItemDrop is a class in this file, we can instantiate it.
                // However, we need to make sure 'ItemDrop' class is accessible here. 
                // It is defined in the same scope (script tag).
                const drop = new ItemDrop(this.scene, this.x, this.y, type);
                this.scene.items.add(drop);
                drop.playDropEffect();
            }

            this.destroy();
        } else {
            // 生存時のヒットストップ（攻撃の重さ表現）
            let stopDuration = 0;

            if (this.player && this.player.isEmpowered) {
                // 覚醒時（RB長押し）：重厚感のあるヒットストップ
                // 覚醒時もcustomHitStopがあればそれを使うが、覚醒補正をかけたい場合もある
                // ここではcustomHitStopがあれば優先する
                if (customHitStop > 0) {
                    stopDuration = customHitStop;
                } else {
                    if (attackType === 'light') {
                        stopDuration = 100;  // 通常強攻撃並み
                    } else {
                        stopDuration = 200; // かなり重い
                    }
                }
            } else {
                // 通常時
                if (customHitStop > 0) {
                    stopDuration = customHitStop;
                } else {
                    // フォールバック（古い呼び出し方など）
                    if (attackType === 'light') {
                        stopDuration = 30; // 軽快に
                    } else {
                        stopDuration = 100;
                    }
                }
            }

            if (stopDuration > 0) {
                this.scene.hitStop(stopDuration);
            }
        }
    }

    takeFatalDamage(source, attackType = 'light') {
        if (!this.isGuardBroken) return;
        if (!this.active) return;

        this.canBeFatalNow = false;

        const fatalBase = this.maxHp * 2;
        let firstDamage = Math.floor(fatalBase / 2);
        if (firstDamage >= this.hp) {
            firstDamage = Math.max(this.hp - 1, 0);
        }

        if (firstDamage > 0) {
            this.hp -= firstDamage;
            if (this.hp <= 0) {
                this.hp = 1;
            }

            if (this.scene && this.scene.showDamagePopup) {
                this.scene.showDamagePopup(this.x, this.y - 40, firstDamage, '#ff0000');
            }

            this.chipBody();
        }

        if (this.armorBlinkTween) {
            this.armorBlinkTween.stop();
            this.armorBlinkTween = null;
        }

        if (this.breakEvent) {
            this.breakEvent.remove();
            this.breakEvent = null;
        }

        this.setTint(0xff0000);
        this.setAlpha(1);

        this.pendingFatalAttackType = attackType;
        this.stamina = this.maxStamina;
    }

    finishFatalDamage() {
        if (!this.active) return;

        const attackType = this.pendingFatalAttackType || 'light';
        const fatalBase = this.maxHp * 2;
        const stopDuration = 200;

        this.takeDamage(fatalBase, attackType, stopDuration, true);

        if (this.scene && this.scene.showText) {
            this.scene.showText('FATAL');
        }

        this.pendingFatalAttackType = null;
    }

    chipBody() {
        if (!this.voxelMaskRT) return;

        // ランダムに数箇所欠けさせる (1〜3個)
        const chips = Phaser.Math.Between(1, 3);

        // Use ERASE blend mode to remove alpha (create holes)
        const eraser = this.scene.make.graphics({ add: false });
        eraser.fillStyle(0x000000, 1);
        eraser.fillRect(0, 0, 4, 4);

        for (let i = 0; i < chips; i++) {
            const rx = Phaser.Math.Between(0, 28);
            const ry = Phaser.Math.Between(0, 28);

            // Draw with ERASE blend mode -> Alpha becomes 0
            this.voxelMaskRT.draw(eraser, rx, ry, 1, 0xffffff, Phaser.BlendModes.ERASE);
        }

        eraser.destroy();
    }

    destroy(fromScene) {
        if (this.voxelMaskRT) this.voxelMaskRT.destroy();
        if (this.voxelMaskImg) this.voxelMaskImg.destroy();
        if (this.voxelMask) this.voxelMask.destroy();
        if (this.hpBar) this.hpBar.destroy();
        if (this.staminaBar) this.staminaBar.destroy();
        if (this.weapon) this.weapon.destroy();

        super.destroy(fromScene);
    }
}
