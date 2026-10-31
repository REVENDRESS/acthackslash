class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // スキン定義データ (ローカル変数として定義)
        const skins = [
            // Existing 10
            { name: 'Boy',   hair: 0x8B4513, skin: 0xFFDAB9, type: 'human' },
            { name: 'Girl',  hair: 0xFFD700, skin: 0xFFDAB9, type: 'human_girl' },
            { name: 'Old',   hair: 0xDDDDDD, skin: 0xFFCCAA, type: 'human_old' },
            { name: 'Cat',   base: 0xFFA500, type: 'animal_cat' },
            { name: 'Dog',   base: 0xA0522D, type: 'animal_dog' },
            { name: 'Bear',  base: 0x8B4513, type: 'animal_bear' },
            { name: 'Rabbit',base: 0xFFFFFF, type: 'animal_rabbit' },
            { name: 'Frog',  base: 0x32CD32, type: 'animal_frog' },
            { name: 'Robot', base: 0x708090, type: 'robot' },
            { name: 'Slime', base: 0x00CED1, type: 'slime' },
            { name: 'Square', base: 0x00FF00, type: 'square_head' }
        ];

        // テクスチャ生成 (thisを使用せず実行)
        skins.forEach((skin, index) => {
            const suffix = index === 0 ? '' : `_${index}`;
            const keyDown = `player_down${suffix}`;

            if (!scene.textures.exists(keyDown)) {
                // 共通設定
                const cEye = 0x000000;
                const cMouth = 0xD2691E;
                const cCheek = 0xFFB6C1;

                // Graphics生成関数
                const createG = () => scene.make.graphics({ x: 0, y: 0, add: false });

                // --- 描画ロジック ---
                // 1. Front (Down)
                const gDown = createG();

                if (skin.type.startsWith('human')) {
                    // Human Base
                    gDown.fillStyle(skin.skin, 1);
                    gDown.fillRect(0, 0, 32, 32);

                    // Hair
                    gDown.fillStyle(skin.hair, 1);
                    if (skin.type === 'human') {
                        // Boy Hair
                        gDown.fillRect(0, 0, 32, 8);
                        gDown.fillRect(0, 8, 4, 6);
                        gDown.fillRect(28, 8, 4, 6);
                        gDown.fillRect(4, 8, 4, 2);
                        gDown.fillRect(12, 8, 8, 2);
                        gDown.fillRect(24, 8, 4, 2);
                    } else if (skin.type === 'human_girl') {
                        // Girl Hair (Long)
                        gDown.fillRect(0, 0, 32, 10);
                        gDown.fillRect(0, 0, 6, 32); // Side locks
                        gDown.fillRect(26, 0, 6, 32);
                        // Ribbon
                        gDown.fillStyle(0xFF0000, 1);
                        gDown.fillRect(12, 2, 8, 4);
                    } else if (skin.type === 'human_old') {
                        // Old Man (Balding?)
                        gDown.fillRect(0, 6, 4, 10);
                        gDown.fillRect(28, 6, 4, 10);
                        // Beard
                        gDown.fillStyle(0xEEEEEE, 1);
                        gDown.fillRect(6, 26, 20, 6);
                    }

                    // Face Parts
                    gDown.fillStyle(cEye, 1);
                    gDown.fillRect(8, 14, 4, 4);
                    gDown.fillRect(20, 14, 4, 4);

                    // Cheeks
                    gDown.fillStyle(cCheek, 1);
                    gDown.fillRect(4, 18, 4, 2);
                    gDown.fillRect(24, 18, 4, 2);

                    // Mouth
                    gDown.fillStyle(cMouth, 1);
                    gDown.fillRect(10, 24, 12, 2);
                    gDown.fillRect(10, 22, 2, 2);
                    gDown.fillRect(20, 22, 2, 2);

                } else if (skin.type === 'animal_cat') {
                    // Cat
                    gDown.fillStyle(skin.base, 1);
                    gDown.fillRect(2, 6, 28, 24); // Face
                    // Ears
                    gDown.beginPath();
                    gDown.moveTo(2, 6); gDown.lineTo(8, 0); gDown.lineTo(12, 6);
                    gDown.moveTo(20, 6); gDown.lineTo(24, 0); gDown.lineTo(30, 6);
                    gDown.fillPath();
                    // Eyes (Slit)
                    gDown.fillStyle(cEye, 1);
                    gDown.fillRect(6, 14, 6, 2);
                    gDown.fillRect(20, 14, 6, 2);
                    // Nose
                    gDown.fillStyle(0xFFAAAA, 1);
                    gDown.fillRect(14, 18, 4, 3);
                    // Whiskers
                    gDown.fillStyle(0x000000, 1);
                    gDown.fillRect(0, 18, 6, 1); gDown.fillRect(0, 20, 6, 1);
                    gDown.fillRect(26, 18, 6, 1); gDown.fillRect(26, 20, 6, 1);

                } else if (skin.type === 'animal_dog') {
                    // Dog
                    gDown.fillStyle(skin.base, 1);
                    gDown.fillRect(4, 4, 24, 24);
                    // Ears (Floppy)
                    gDown.fillStyle(0x654321, 1);
                    gDown.fillRect(0, 6, 6, 12);
                    gDown.fillRect(26, 6, 6, 12);
                    // Eyes
                    gDown.fillStyle(cEye, 1);
                    gDown.fillRect(10, 12, 4, 4);
                    gDown.fillRect(18, 12, 4, 4);
                    // Nose/Mouth area
                    gDown.fillStyle(0xFFE4C4, 1);
                    gDown.fillRect(10, 18, 12, 8);
                    gDown.fillStyle(0x000000, 1);
                    gDown.fillRect(14, 20, 4, 3);

                } else if (skin.type === 'animal_bear') {
                    // Bear
                    gDown.fillStyle(skin.base, 1);
                    gDown.fillCircle(16, 18, 14); // Round face
                    // Ears
                    gDown.fillCircle(6, 6, 5);
                    gDown.fillCircle(26, 6, 5);
                    // Eyes
                    gDown.fillStyle(cEye, 1);
                    gDown.fillCircle(11, 14, 2);
                    gDown.fillCircle(21, 14, 2);
                    // Snout
                    gDown.fillStyle(0xD2B48C, 1);
                    gDown.fillEllipse(16, 22, 10, 6);
                    gDown.fillStyle(0x000000, 1);
                    gDown.fillCircle(16, 20, 2);

                } else if (skin.type === 'animal_rabbit') {
                    // Rabbit
                    gDown.fillStyle(skin.base, 1);
                    gDown.fillRect(6, 10, 20, 20);
                    // Ears (Long)
                    gDown.fillRect(8, 0, 4, 12);
                    gDown.fillRect(20, 0, 4, 12);
                    gDown.fillStyle(0xFFC0CB, 1); // Inner ear
                    gDown.fillRect(9, 2, 2, 8);
                    gDown.fillRect(21, 2, 2, 8);
                    // Face
                    gDown.fillStyle(0xFF0000, 1); // Red eyes
                    gDown.fillRect(8, 16, 4, 4);
                    gDown.fillRect(20, 16, 4, 4);
                    // Teeth
                    gDown.fillStyle(0xFFFFFF, 1);
                    gDown.fillRect(14, 24, 4, 4);
                    gDown.lineStyle(1, 0x000000);
                    gDown.strokeRect(14, 24, 4, 4);

                } else if (skin.type === 'animal_frog') {
                    // Frog
                    gDown.fillStyle(skin.base, 1);
                    gDown.fillEllipse(16, 20, 28, 20);
                    // Eyes (Pop out)
                    gDown.fillStyle(skin.base, 1);
                    gDown.fillCircle(8, 8, 6);
                    gDown.fillCircle(24, 8, 6);
                    gDown.fillStyle(0xFFFFFF, 1);
                    gDown.fillCircle(8, 8, 4);
                    gDown.fillCircle(24, 8, 4);
                    gDown.fillStyle(0x000000, 1);
                    gDown.fillCircle(8, 8, 2);
                    gDown.fillCircle(24, 8, 2);
                    // Mouth
                    gDown.fillStyle(0x006400, 1);
                    gDown.beginPath();
                    gDown.moveTo(8, 24);
                    gDown.lineTo(12, 28);
                    gDown.lineTo(20, 28);
                    gDown.lineTo(24, 24);
                    gDown.strokePath();

                } else if (skin.type === 'robot') {
                    // Robot
                    gDown.fillStyle(skin.base, 1);
                    gDown.fillRect(2, 2, 28, 28);
                    // Antenna
                    gDown.fillRect(14, 0, 4, 4);
                    // Eyes (Bar)
                    gDown.fillStyle(0x00FF00, 1);
                    gDown.fillRect(6, 10, 20, 6);
                    // Mouth (Grill)
                    gDown.fillStyle(0x333333, 1);
                    gDown.fillRect(8, 22, 16, 4);
                    gDown.lineStyle(1, 0xFFFFFF);
                    gDown.beginPath();
                    gDown.moveTo(12, 22); gDown.lineTo(12, 26);
                    gDown.moveTo(16, 22); gDown.lineTo(16, 26);
                    gDown.moveTo(20, 22); gDown.lineTo(20, 26);
                    gDown.strokePath();

                } else if (skin.type === 'slime') {
                    // Slime
                    gDown.fillStyle(skin.base, 0.8);
                    // Blob shape (Rounded Rectangle)
                    gDown.fillRoundedRect(4, 6, 24, 24, 8);

                    // Face
                    gDown.fillStyle(0x000000, 1);
                    gDown.fillCircle(12, 18, 3);
                    gDown.fillCircle(20, 18, 3);
                    gDown.beginPath();
                    gDown.moveTo(14, 22);
                    gDown.lineTo(18, 22);
                    gDown.strokePath();

                } else if (skin.type === 'square_head') {
                    // Square Head
                    gDown.fillStyle(skin.base, 1);
                    gDown.fillRect(0, 0, 32, 32);
                    // Eyes
                    gDown.fillStyle(0x000000, 1);
                    gDown.fillRect(6, 10, 6, 6);
                    gDown.fillRect(20, 10, 6, 6);
                    // Mouth
                    gDown.fillRect(10, 24, 12, 2);

                }


                gDown.generateTexture(`player_down${suffix}`, 32, 32);

                // 2. Back (Up)
                const gUp = createG();

                if (skin.type.startsWith('human')) {
                    // Body/Head Base
                    gUp.fillStyle(skin.hair || skin.skin, 1);
                    gUp.fillRect(0, 0, 32, 32); // Full hair coverage mostly

                    if (skin.type === 'human_girl') {
                        gUp.fillRect(0, 0, 32, 32); // Long hair
                        // Ribbon
                        gUp.fillStyle(0xFF0000, 1);
                        gUp.fillRect(10, 4, 12, 4);
                    } else if (skin.type === 'human_old') {
                        gUp.fillStyle(skin.skin, 1); gUp.fillRect(4, 4, 24, 24); // Balding Head
                        gUp.fillStyle(skin.hair, 1);
                        gUp.fillRect(0, 12, 6, 12); // Left hair
                        gUp.fillRect(26, 12, 6, 12); // Right hair
                        gUp.fillRect(6, 20, 20, 4); // Back hair rim
                    } else {
                        // Generic Short Hair
                        gUp.fillStyle(skin.hair, 1); gUp.fillRect(0, 0, 32, 12);
                        gUp.fillStyle(skin.skin, 1); gUp.fillRect(4, 12, 24, 20); // Neck/Back
                    }
                } else if (skin.type.startsWith('animal')) {
                     gUp.fillStyle(skin.base, 1);
                     if (skin.type === 'animal_frog') {
                         gUp.fillEllipse(16, 20, 28, 20); // No ears
                         gUp.fillStyle(skin.base, 1); gUp.fillCircle(8, 8, 6); gUp.fillCircle(24, 8, 6); // Eyes from back
                     } else if (['animal_cat', 'animal_dog', 'animal_bear'].includes(skin.type)) {
                         gUp.fillCircle(16, 16, 14); // Head
                         // Ears
                         if (skin.type === 'animal_cat') {
                             gUp.beginPath(); gUp.moveTo(6, 10); gUp.lineTo(2, 2); gUp.lineTo(12, 6); gUp.fillPath();
                             gUp.beginPath(); gUp.moveTo(26, 10); gUp.lineTo(30, 2); gUp.lineTo(20, 6); gUp.fillPath();
                         } else if (skin.type === 'animal_dog') {
                             gUp.fillRect(4, 4, 24, 24); // Boxy head for dog
                             gUp.fillStyle(0x654321, 1); gUp.fillRect(0, 6, 6, 12); gUp.fillRect(26, 6, 6, 12); // Ears
                         } else if (skin.type === 'animal_bear') {
                             gUp.fillCircle(6, 6, 5); gUp.fillCircle(26, 6, 5); // Ears
                         } else {
                             gUp.fillCircle(8, 6, 5); gUp.fillCircle(24, 6, 5);
                         }
                     } else if (skin.type === 'animal_rabbit') {
                         gUp.fillRect(6, 10, 20, 20);
                         // Rounded Ears
                         gUp.fillRoundedRect(8, 0, 4, 14, 2); 
                         gUp.fillRoundedRect(20, 0, 4, 14, 2);
                     } else {
                         gUp.fillRect(4, 4, 24, 24); // Generic
                     }
                } else if (skin.type === 'robot') {
                     gUp.fillStyle(skin.base, 1);
                     gUp.fillRect(2, 2, 28, 28);
                     gUp.fillRect(14, 0, 4, 4); // Antenna
                     gUp.fillStyle(0x555555, 1); gUp.fillRect(4, 4, 24, 24); // Back panel
                } else {
                    // Monsters
                    gUp.fillStyle(skin.base, 1);
                    if (skin.type === 'slime') {
                        gUp.fillStyle(skin.base, 0.8); gUp.fillRoundedRect(4, 6, 24, 24, 8);
                    } else if (skin.type === 'square_head') {
                        gUp.fillRect(0, 0, 32, 32);
                    } else {
                        gUp.fillRect(4, 4, 24, 24);
                    }
                }
                gUp.generateTexture(`player_up${suffix}`, 32, 32);

                // 3. Right (Side)
                const gRight = createG();
                // Common Side Logic
                const drawSide = (g, isRight) => {
                    const xFace = isRight ? 12 : 4; // Shift face center
                    const xEye = isRight ? 24 : 4;

                    if (skin.type.startsWith('human')) {
                        // Face/Head - Widen to 24px (Cubic)
                        g.fillStyle(skin.skin, 1);
                        g.fillRect(4, 4, 24, 24);
                        // Hair
                        g.fillStyle(skin.hair, 1);
                        if (skin.type === 'human_girl') {
                            g.fillRect(isRight?0:8, 0, 24, 32); // Back hair
                            g.fillRect(4, 0, 24, 8); // Top
                            g.fillStyle(0xFF0000, 1); g.fillRect(isRight?6:18, 2, 8, 4); // Side ribbon
                        } else if (skin.type === 'human_old') {
                            g.fillStyle(skin.skin, 1); g.fillRect(4, 4, 24, 24); // Head
                            g.fillStyle(skin.hair, 1);
                            g.fillRect(isRight?0:24, 12, 8, 12); // Side hair
                            g.fillStyle(0xEEEEEE, 1); // Beard
                            g.beginPath();
                            if(isRight) { g.moveTo(28, 20); g.lineTo(28, 32); g.lineTo(16, 28); }
                            else { g.moveTo(4, 20); g.lineTo(4, 32); g.lineTo(16, 28); }
                            g.fillPath();
                        } else if (skin.type === 'human') {
                            // Boy Hair
                            g.fillRect(4, 0, 24, 8); // Top
                            g.fillRect(isRight?0:8, 4, 24, 12); // Back/Side Hair
                            // Sideburn
                            g.fillRect(isRight?20:8, 10, 4, 6);
                        } else {
                            // Short hair
                            g.fillRect(4, 0, 24, 8);
                            g.fillRect(isRight?4:20, 4, 8, 16); // Back/Side
                        }
                        // Eye
                        g.fillStyle(cEye, 1);
                        g.fillRect(xEye, 12, 4, 4);
                    } else if (skin.type.startsWith('animal')) {
                        g.fillStyle(skin.base, 1);
                        if (skin.type === 'animal_frog') {
                             g.fillEllipse(16, 20, 28, 20); // Body
                             g.fillStyle(skin.base, 1); g.fillCircle(isRight?20:12, 6, 6); // Eye bump
                             g.fillStyle(0xFFFFFF, 1); g.fillCircle(isRight?20:12, 6, 4);
                             g.fillStyle(0x000000, 1); g.fillCircle(isRight?20:12, 6, 2);
                        } else if (skin.type === 'animal_cat') {
                             g.fillCircle(isRight?14:18, 16, 13); // Head
                             // Ears (Pointed)
                             g.beginPath(); 
                             if (isRight) { g.moveTo(14, 6); g.lineTo(20, 0); g.lineTo(24, 6); }
                             else { g.moveTo(18, 6); g.lineTo(12, 0); g.lineTo(8, 6); }
                             g.fillPath();
                             g.fillStyle(cEye, 1); g.fillCircle(xEye, 14, 2);
                        } else if (skin.type === 'animal_dog') {
                             g.fillRect(isRight?4:8, 6, 24, 20); // Head (Wider)
                             g.fillStyle(0x654321, 1); // Ear
                             g.fillRect(isRight?8:18, 6, 6, 10);
                             g.fillStyle(cEye, 1); g.fillRect(xEye, 12, 4, 4);
                             g.fillStyle(0xFFE4C4, 1); g.fillRect(isRight?24:0, 18, 8, 6); // Snout
                        } else if (skin.type === 'animal_rabbit') {
                            g.fillRect(4, 10, 24, 20); // Body (Wider)
                            g.fillRoundedRect(isRight?8:20, 0, 4, 14, 2); // Ear
                            g.fillStyle(cEye, 1); g.fillCircle(xEye, 14, 2);
                        } else if (skin.type === 'animal_bear') {
                            g.fillCircle(isRight?14:18, 16, 13); // Head
                            g.fillCircle(16, 6, 5); // Ear
                            g.fillStyle(0xD2B48C, 1); g.fillEllipse(isRight?22:10, 20, 8, 6); // Snout
                            g.fillStyle(cEye, 1); g.fillCircle(xEye, 14, 2);
                        }
                    } else if (skin.type === 'robot') {
                        g.fillStyle(skin.base, 1);
                        g.fillRect(2, 2, 28, 28);
                        g.fillRect(14, 0, 4, 4); // Antenna
                        g.fillStyle(0x00FF00, 1); g.fillRect(isRight?20:4, 10, 8, 6); // Eye Bar Side
                    } else if (skin.type === 'slime') {
                        g.fillStyle(skin.base, 0.8);
                        g.fillRoundedRect(4, 6, 24, 24, 8);
                        g.fillStyle(0x000000, 1);
                        g.fillCircle(xEye, 18, 3);
                    } else if (skin.type === 'square_head') {
                        g.fillStyle(skin.base, 1);
                        g.fillRect(0, 0, 32, 32);
                        g.fillStyle(0x000000, 1);
                        g.fillRect(isRight?24:4, 10, 4, 6); // Side Eye
                    }
                };

                drawSide(gRight, true);
                gRight.generateTexture(`player_right${suffix}`, 32, 32);

                // 4. Left (Side)
                const gLeft = createG();
                drawSide(gLeft, false);
                gLeft.generateTexture(`player_left${suffix}`, 32, 32);
            }
        });

        super(scene, x, y, 'player_down_4');

        // Initialize properties
        this.costumeCount = 11;
        this.currentCostume = 4;
        this.skins = skins;

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setDepth(60); // 敵(50)より手前に表示

        this.setCollideWorldBounds(true);
        this.baseBodyWidth = 24;
        this.baseBodyHeight = 24;
        this.updateBodyHitbox();

        // ステータス
        this.speed = 160;
        this.baseSpeed = 160;
        this.maxHp = 100;
        this.baseMaxHp = 100;
        this.hp = 100;
        this.maxStamina = 100;
        this.stamina = 100;
        this.staminaRegenRate = 0.5;
        this.baseStaminaRegenRate = 0.5;
        this.guardDrainRate = 0.2;

        this.isAttacking = false;
        this.isFatalAttacking = false;
        this.isInvincible = false;
        this.isDashing = false;
        this.isGuarding = false;
        this.isExhausted = false;
        this.dashBlinkStyle = 'white';
        this.inWindup = false;
        this.isKnockback = false;
        this.isGuardStuck = false;

        // コンボシステム用
        this.comboCount = 0;
        this.comboTimer = 0;
        this.comboWindow = 480; // コンボ受付時間 (ms) - ゆっくり入力対応
        this.comboInputReceived = false;

        // 武器ステータス（変態ビルド用）
        this.weaponStats = {
            attackSpeed: 1.0,
            scale: 1.0,
            reach: 50
        };
        this.baseCritChance = 0.1;
        this.critChance = this.baseCritChance;
        this.knockbackBonus = 0;
        this.moveSpeedBonus = 0;
        this.attackSpCostMultiplier = 1.0;
        this.dashSpCostMultiplier = 1.0;
        this.spDamageBonus = 0;
        this.critDamageBonus = 0;

        // キー入力
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.keyW = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyA = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        this.keyJ = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J); // 弱攻撃
        this.keyK = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K); // 強攻撃
        this.keyL = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L); // ダッシュ
        this.keySpace = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); // ガード

        // 攻撃判定用のグループ（使い回しをやめてグループ管理にする）
        this.attackHitboxes = scene.physics.add.group({
            classType: Phaser.GameObjects.Rectangle,
            runChildUpdate: false
        });

        // ★★★ 攻撃当たり判定の調整設定 ★★★
        // ここで向きや攻撃タイプごとの当たり判定のサイズ(size)と位置オフセット(offset)を調整してください
        // width/height: Hitboxのサイズ
        // offset: プレイヤー中心から剣の方向への距離
        // angle: Hitboxの回転角度（度数法）。0で回転なし。
        this.hitboxAdjustments = {
            // 通常攻撃 (RBなし)
            normal: {
                light1: {
                    hitStop: 80,
                    up:    { width: 30, height: 80, offset: 30, angle: 0 },
                    down:  { width: 30, height: 80, offset: 30, angle: 0 },
                    left:  { width: 30, height: 80, offset: 30, angle: 0 },
                    right: { width: 30, height: 80, offset: 30, angle: 0 },
                    'up-left':    { width: 30, height: 80, offset: 30, angle: 0 },
                    'up-right':   { width: 30, height: 80, offset: 30, angle: 0 },
                    'down-left':  { width: 30, height: 80, offset: 30, angle: 0 },
                    'down-right': { width: 30, height: 80, offset: 30, angle: 0 }
                },
                light2: {
                    hitStop: 100,
                    up:    { width: 30, height: 80, offset: 30, angle: 0 },
                    down:  { width: 30, height: 80, offset: 30, angle: 0 },
                    left:  { width: 30, height: 80, offset: 30, angle: 0 },
                    right: { width: 30, height: 80, offset: 30, angle: 0 },
                    'up-left':    { width: 30, height: 80, offset: 30, angle: 0 },
                    'up-right':   { width: 30, height: 80, offset: 30, angle: 0 },
                    'down-left':  { width: 30, height: 80, offset: 30, angle: 0 },
                    'down-right': { width: 30, height: 80, offset: 30, angle: 0 }
                },
                light3: {
                    hitStop: 200,
                    up:    { width: 45, height: 100, offset: 35, angle: 0 },
                    down:  { width: 45, height: 100, offset: 35, angle: 0 },
                    left:  { width: 45, height: 100, offset: 35, angle: 0 },
                    right: { width: 45, height: 100, offset: 35, angle: 0 },
                    'up-left':    { width: 45, height: 100, offset: 35, angle: 0 },
                    'up-right':   { width: 45, height: 100, offset: 35, angle: 0 },
                    'down-left':  { width: 45, height: 100, offset: 35, angle: 0 },
                    'down-right': { width: 45, height: 100, offset: 35, angle: 0 }
                },
                heavy: {
                    hitStop: 250,
                    up:    { width: 30, height: 80, offset: 30, angle: 0 },
                    down:  { width: 30, height: 80, offset: 30, angle: 0 },
                    left:  { width: 30, height: 80, offset: 30, angle: 0 },
                    right: { width: 30, height: 80, offset: 30, angle: 0 },
                    'up-left':    { width: 30, height: 80, offset: 30, angle: 0 },
                    'up-right':   { width: 30, height: 80, offset: 30, angle: 0 },
                    'down-left':  { width: 30, height: 80, offset: 30, angle: 0 },
                    'down-right': { width: 30, height: 80, offset: 30, angle: 0 }
                }
            },
            // RB同時押し攻撃
            rb: {
                light1: {
                    hitStop: 80,
                    up:    { width: 20, height: 70, offset: 30, angle: 0 },
                    down:  { width: 20, height: 70, offset: 30, angle: 0 },
                    left:  { width: 20, height: 70, offset: 30, angle: 0 },
                    right: { width: 20, height: 70, offset: 30, angle: 0 },
                    'up-left':    { width: 20, height: 70, offset: 30, angle: 0 },
                    'up-right':   { width: 20, height: 70, offset: 30, angle: 0 },
                    'down-left':  { width: 20, height: 70, offset: 30, angle: 0 },
                    'down-right': { width: 20, height: 70, offset: 30, angle: 0 }
                },
                light2: {
                    hitStop: 100,
                    up:    { width: 20, height: 70, offset: 30, angle: 0 },
                    down:  { width: 20, height: 70, offset: 30, angle: 0 },
                    left:  { width: 20, height: 70, offset: 30, angle: 0 },
                    right: { width: 20, height: 70, offset: 30, angle: 0 },
                    'up-left':    { width: 20, height: 70, offset: 30, angle: 0 },
                    'up-right':   { width: 20, height: 70, offset: 30, angle: 0 },
                    'down-left':  { width: 20, height: 70, offset: 30, angle: 0 },
                    'down-right': { width: 20, height: 70, offset: 30, angle: 0 }
                },
                light3: {
                    hitStop: 200,
                    up:    { width: 30, height: 90, offset: 35, angle: 0 },
                    down:  { width: 30, height: 90, offset: 35, angle: 0 },
                    left:  { width: 30, height: 90, offset: 35, angle: 0 },
                    right: { width: 30, height: 90, offset: 35, angle: 0 },
                    'up-left':    { width: 30, height: 90, offset: 35, angle: 0 },
                    'up-right':   { width: 30, height: 90, offset: 35, angle: 0 },
                    'down-left':  { width: 30, height: 90, offset: 35, angle: 0 },
                    'down-right': { width: 30, height: 90, offset: 35, angle: 0 }
                },
                heavy: {
                    hitStop: 250,
                    up:    { width: 30, height: 70, offset: 30, angle: 0 },
                    down:  { width: 30, height: 70, offset: 30, angle: 0 },
                    left:  { width: 30, height: 70, offset: 30, angle: 0 },
                    right: { width: 30, height: 70, offset: 30, angle: 0 },
                    'up-left':    { width: 30, height: 70, offset: 30, angle: 0 },
                    'up-right':   { width: 30, height: 70, offset: 30, angle: 0 },
                    'down-left':  { width: 30, height: 70, offset: 30, angle: 0 },
                    'down-right': { width: 30, height: 70, offset: 30, angle: 0 }
                }
            }
        };

        // 向き管理
        this.lastDirection = new Phaser.Math.Vector2(1, 0); // 初期は右向き
        this.inputVector = new Phaser.Math.Vector2(0, 0); // 入力ベクトル
        this.hasInput = false; // 入力があるかどうか

        this.weapon = scene.add.sprite(0, 0, 'item_texture'); 
        this.weapon.setOrigin(0, 0.5);
        this.weapon.setVisible(false);

        this.shieldSprite = scene.add.sprite(x, y, 'shield_texture');
        this.shieldSprite.setOrigin(0.5, 0.5);
        this.shieldSprite.setDepth(61);
        this.shieldSprite.setVisible(false);

        // ガード制御用
        this.justGuardTimer = 0; // ジャストガード受付時間（ms）
        this.guardCooldownTimer = 0; // ガード不可時間（ms）
        this.justGuardBlinkEvent = null;
        this.justGuardLockX = null;
        this.justGuardLockY = null;
        this.justGuardPrevBodyMoves = true;

        // 覚醒モード（RB長押し）
        this.isEmpowered = false;
        this.prevRB = false;
        this.empoweredLocked = false;

        // 覚醒エフェクト用パーティクル
        // ユーザー要望により体の炎は削除

        // 武器用エミッタ
        this.weaponEmitter = scene.add.particles(0, 0, 'fire_texture', {
            speed: { min: 20, max: 50 },
            scale: { start: 0.8, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 200,
            tint: { start: 0xff0000, end: 0x000000 },
            blendMode: 'ADD',
            emitting: false
        });
        this.weaponEmitter.setDepth(62);

        // デバッグ用（無敵モード）
        this.isGodMode = false;

        this.equippedWeapon = {
            id: 'starter_rusty_sword',
            typeId: 1,
            type: 'weapon',
            rarity: RARITY.NORMAL,
            name: WEAPON_TYPES[1].name,
            attackPower: WEAPON_TYPES[1].baseAttack,
            attackSpeed: WEAPON_TYPES[1].baseSpeed,
            size: WEAPON_TYPES[1].baseSize
        };
        this.equippedShield = null;
        this.applyEquippedWeapon();

        // Inventory
        this.inventory = [];
        this.potions = 3; // 初期ポーション数
        this.potionCooldownTimer = 0; // ポーションクールダウン (ms)
        this.potionMaxCooldown = 3000; // 3秒
    }

    updateBodyHitbox() {
        if (!this.body) return;
        const w = this.baseBodyWidth;
        const h = this.baseBodyHeight;
        this.body.setSize(w, h);
        const offsetX = (this.displayWidth - w) * 0.5;
        const offsetY = (this.displayHeight - h) * 0.5;
        this.body.setOffset(offsetX, offsetY);
    }

    usePotion() {
        if (this.hp >= this.maxHp) {
            this.scene.showDamagePopup(this.x, this.y - 40, "HP Full!", "#ffff00");
            return;
        }

        if (this.potionCooldownTimer > 0) {
            this.scene.showDamagePopup(this.x, this.y - 40, "Cooldown...", "#aaaaaa");
            return;
        }

        if (this.potions > 0) {
            this.potions--;
            this.recoverHealth(this.maxHp * 0.5); 
            // recoverHealth内で +HP 表示が出るので、ここでは残数表示
            this.scene.showDamagePopup(this.x, this.y - 100, `Potion Left: ${this.potions}`, '#ffffff');

            // クールダウン開始
            this.potionCooldownTimer = this.potionMaxCooldown;
        } else {
            this.scene.showDamagePopup(this.x, this.y - 40, "No Potions!", "#ff0000");
        }
    }

    addToInventory(item, showPopup = true) {
        if (this.inventory.length >= 8) {
            if (showPopup) this.scene.showDamagePopup(this.x, this.y - 40, "Inventory Full!", "#ff0000");
            return false;
        }

        this.inventory.push(item);

        // Update HUD if needed
        if (this.scene.hud && this.scene.hud.updateInventoryItems) {
            this.scene.hud.updateInventoryItems();
        }

        // Show text only, don't show inventory
        if (showPopup) this.scene.showDamagePopup(this.x, this.y - 40, `Got Item!`, "#00ff00");
        return true;
    }

    checkForItemPickup() {
        const pad = this.scene.input.gamepad.getPad(0);
        // Xbox A is Button 0 (PS Cross)
        const pickupBtn = pad && pad.buttons && pad.buttons[0]?.pressed;

        if (pickupBtn && !this.prevPickupBtn) {
             // Check overlap with items
             const items = this.scene.items;
             let picked = false;
             this.scene.physics.overlap(this, items, (player, item) => {
                 if (picked) return; 
                 if (this.addToInventory(item.itemData)) {
                     item.destroy();
                     picked = true;
                 }
             });

             if (picked) {
                 this.prevPickupBtn = pickupBtn;
                 return true;
             }
        }
        this.prevPickupBtn = pickupBtn;
        return false;
    }

    removeFromInventory(itemData) {
        const index = this.inventory.indexOf(itemData);
        if (index > -1) {
            return this.removeItemAtIndex(index);
        }
        return false;
    }

    removeItemAtIndex(index) {
        if (index >= 0 && index < this.inventory.length) {
            this.inventory.splice(index, 1);
            if (this.scene.hud && this.scene.hud.updateInventoryItems) {
                this.scene.hud.updateInventoryItems();
            }
            return true;
        }
        return false;
    }

    applyEquippedWeapon() {
        if (this.equippedWeapon && this.equippedWeapon.attackSpeed) {
            this.weaponStats.attackSpeed = this.equippedWeapon.attackSpeed;
        } else {
            this.weaponStats.attackSpeed = 1.0;
        }

        if (this.equippedWeapon && this.equippedWeapon.size) {
            this.weaponStats.scale = this.equippedWeapon.size;
        } else {
            this.weaponStats.scale = 1.0;
        }

        let textureKey = 'item_texture';
        const typeId = this.equippedWeapon ? this.equippedWeapon.typeId : null;
        if (typeId && WEAPON_TYPES[typeId] && WEAPON_TYPES[typeId].texture) {
            const candidate = WEAPON_TYPES[typeId].texture;
            if (this.scene.textures.exists(candidate)) {
                textureKey = candidate;
            }
        }
        this.weapon.setTexture(textureKey);
        if (Number(typeId) === 2) {
            this.weapon.clearTint();
        }
        this.weapon.setOrigin(0.2, 0.5);
        this.applyEquipmentBonuses();
    }

    applyEquippedShield() {
        if (!this.shieldSprite) return;

        let textureKey = 'shield_texture';
        const typeId = this.equippedShield ? this.equippedShield.typeId : null;
        if (typeId && SHIELD_TYPES[typeId] && SHIELD_TYPES[typeId].texture) {
            const candidate = SHIELD_TYPES[typeId].texture;
            if (this.scene.textures.exists(candidate)) {
                textureKey = candidate;
            }
        }
        this.shieldSprite.setTexture(textureKey);
        this.shieldSprite.setVisible(false);
    }

    applyEquipmentBonuses() {
        let hpBonus = 0;
        let critBonus = 0;
        let knockbackBonus = 0;
        let moveSpeedBonus = 0;
        let staminaBonus = 0;
        let attackSpReduce = 0;
        let dashSpReduce = 0;
        let spDamagePlus = 0;
        let critDamagePlus = 0;
        let staminaRegenPlus = 0;

        const items = [this.equippedWeapon, this.equippedShield].filter(Boolean);
        for (const it of items) {
            if (it.hpBonus) hpBonus += it.hpBonus;
            if (it.critChanceBonus) critBonus += it.critChanceBonus;
            if (it.knockbackBonus) knockbackBonus += it.knockbackBonus;
            if (it.moveSpeedBonus) moveSpeedBonus += it.moveSpeedBonus;
            if (it.staminaBonus) staminaBonus += it.staminaBonus;
            if (it.attackSpCostReduction) attackSpReduce += it.attackSpCostReduction;
            if (it.dashCostReduction) dashSpReduce += it.dashCostReduction;
            if (it.spDamagePlus) spDamagePlus += it.spDamagePlus;
            if (it.critDamageBonus) critDamagePlus += it.critDamageBonus;
            if (it.staminaRegenBonus) staminaRegenPlus += it.staminaRegenBonus;
        }

        this.maxHp = Math.max(1, this.baseMaxHp + hpBonus);
        if (this.hp > this.maxHp) this.hp = this.maxHp;

        this.maxStamina = Math.max(1, 100 + staminaBonus);
        if (this.stamina > this.maxStamina) this.stamina = this.maxStamina;

        const chance = this.baseCritChance + (critBonus / 100);
        this.critChance = Math.max(0, Math.min(0.95, chance));

        this.knockbackBonus = knockbackBonus;
        this.moveSpeedBonus = moveSpeedBonus;
        this.speed = Math.max(10, Math.floor(this.baseSpeed * (1 + moveSpeedBonus / 100)));
        const atkRedRate = Math.min(0.9, Math.max(0, attackSpReduce / 100));
        this.attackSpCostMultiplier = 1 - atkRedRate;
        const dashRedRate = Math.min(0.9, Math.max(0, dashSpReduce / 100));
        this.dashSpCostMultiplier = 1 - dashRedRate;
        this.spDamageBonus = spDamagePlus;
        this.critDamageBonus = critDamagePlus;
        this.staminaRegenRate = Math.max(0, this.baseStaminaRegenRate * (1 + staminaRegenPlus / 100));
    }

    equipItem(itemData, slotType) {
        // Remove from inventory first
        this.removeFromInventory(itemData);

        let oldItem = null;
        if (slotType === 'weapon') {
            oldItem = this.equippedWeapon;
            this.equippedWeapon = itemData;
            this.applyEquippedWeapon();
        } else if (slotType === 'shield') {
            oldItem = this.equippedShield;
            this.equippedShield = itemData;
            this.applyEquippedShield();
        }

        // If there was an old item, put it back in inventory
        if (oldItem) {
            this.addToInventory(oldItem, false);
        }

        this.applyEquipmentBonuses();
        if (this.scene.hud) {
            this.scene.hud.updateEquipmentSlots();
        }
    }

    unequipItem(slotType) {
        let itemToUnequip = null;
        if (slotType === 'weapon') itemToUnequip = this.equippedWeapon;
        else if (slotType === 'shield') itemToUnequip = this.equippedShield;

        if (itemToUnequip) {
            if (this.addToInventory(itemToUnequip, false)) {
                if (slotType === 'weapon') {
                    this.equippedWeapon = null;
                    this.applyEquippedWeapon();
                }
                else if (slotType === 'shield') {
                    this.equippedShield = null;
                    this.applyEquippedShield();
                }

                this.applyEquipmentBonuses();
                if (this.scene.hud) {
                    this.scene.hud.updateEquipmentSlots();
                }
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

    update(time, delta) {
        // タイマー更新
        if (this.justGuardTimer > 0) {
            this.justGuardTimer -= delta;
            if (this.justGuardTimer <= 0) {
                this.justGuardTimer = 0;
                this.guardCooldownTimer = 250;
                if (this.justGuardBlinkEvent) {
                    this.justGuardBlinkEvent.remove();
                    this.justGuardBlinkEvent = null;
                }
                this.clearTint();
                this.justGuardLockX = null;
                this.justGuardLockY = null;
                if (this.body) {
                    this.body.moves = this.justGuardPrevBodyMoves;
                }
                this.justGuardPrevBodyMoves = true;
            }
        }
        if (this.guardCooldownTimer > 0) {
            this.guardCooldownTimer -= delta;
            if (this.guardCooldownTimer < 0) this.guardCooldownTimer = 0;
        }

        // ポーションクールダウン
        if (this.potionCooldownTimer > 0) {
            this.potionCooldownTimer -= delta;
            if (this.potionCooldownTimer < 0) this.potionCooldownTimer = 0;
        }

        // コンボタイマー更新
        if (this.comboTimer > 0) {
            this.comboTimer -= delta;
            if (this.comboTimer < 0) this.comboTimer = 0;
        }

        if (this.hp <= 0) {
            this.setVelocity(0);
            this.setTint(0x555555);
            return;
        }

        if (this.isFatalAttacking) {
            return;
        }

        if (this.justGuardTimer > 0 && this.justGuardLockX !== null && this.justGuardLockY !== null) {
            if (this.body) {
                this.body.setVelocity(0, 0);
            }
            this.setPosition(this.justGuardLockX, this.justGuardLockY);
        }

        // スタミナ管理
        if (this.isExhausted) {
            // 枯渇中は少しずつ回復
            this.stamina += this.staminaRegenRate * 0.5;
            if (this.stamina >= this.maxStamina) {
                this.stamina = this.maxStamina;
                this.isExhausted = false;
                if (this.exhaustBlinkEvent) {
                    this.exhaustBlinkEvent.remove();
                    this.exhaustBlinkEvent = null;
                }
                this.clearTint();
            }
        } else {
            // 通常回復
            if (!this.isGuarding && !this.isDashing && !this.isAttacking) {
                this.stamina = Math.min(this.stamina + this.staminaRegenRate, this.maxStamina);
            }
        }

        if (this.isDashing) return;

        this.updateInput();
        this.handleMovement();
        this.handleCombat();
        this.handleGuard();
        this.updateShieldSprite();
        this.handleIdleAnimation(time);

        // Empower Effect
        if (this.isEmpowered) {
            // 覚醒状態の処理
        }
    }

    handleIdleAnimation(time) {
        if (this.isDashing) {
            this.setScale(1, 1);
            return;
        }

        if (this.body.velocity.length() < 10 && !this.isAttacking && !this.isGuarding) {
            const freq = 0.005;
            const amp = 0.05;
            const s = Math.sin(time * freq);
            this.setScale(1 - s * amp, 1 + s * amp);
        } else if (this.body.velocity.length() > 10 && !this.isAttacking) {
            const freq = 0.005;
            const amp = 0.2;
            const s = Math.abs(Math.sin(time * freq));
            this.setScale(1 + s * amp * 0.8, 1 - s * amp);
        } else {
            this.setScale(1, 1);
        }
    }

    updateInput() {
        if (this.scene.isFloorTransition) {
            this.hasInput = false;
            this.inputVector.set(0, 0);
            return;
        }
        const pad = this.scene.input.gamepad.getPad(0);
        const isRBPad = pad && pad.buttons[5] && pad.buttons[5].pressed;
        const rKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        const isRB = (isRBPad || rKey.isDown);
        const isLightHeldPad = pad && pad.buttons && pad.buttons[2]?.pressed;
        const isHeavyHeldPad = pad && pad.buttons && pad.buttons[3]?.pressed;

        if (!this.prevRB && isRB) {
            if (isLightHeldPad || isHeavyHeldPad || this.isAttacking || this.isFatalAttacking) {
                this.empoweredLocked = true;
                this.isEmpowered = false;
            } else {
                this.empoweredLocked = false;
                this.isEmpowered = true;
            }
        } else if (!isRB) {
            this.isEmpowered = false;
            this.empoweredLocked = false;
        } else {
            if (this.empoweredLocked) {
                this.isEmpowered = false;
            } else {
                this.isEmpowered = true;
            }
        }
        this.prevRB = isRB;

        // ノックバック中は入力受付不可
        if (this.isKnockback) {
            this.hasInput = false;
            this.inputVector.set(0, 0);
            return;
        }

        let velX = 0;
        let velY = 0;

        // Keyboard
        if (this.keyA.isDown) velX -= 1;
        if (this.keyD.isDown) velX += 1;

        if (this.keyW.isDown) velY -= 1;
        if (this.keyS.isDown) velY += 1;

        // Gamepad
        // const pad = this.scene.input.gamepad.getPad(0); // Already declared above
        if (pad) {
            // Item Pickup (Cross / A)
            this.checkForItemPickup();

            // キーボード入力がない場合のみパッド入力を受け付ける（競合回避）
            if (velX === 0 && velY === 0) {
                if (pad.leftStick.length() > 0.22) {
                    velX = pad.leftStick.x;
                    velY = pad.leftStick.y;
                } else if (!this.scene.hud.isInventoryOpen) {
                     // 十字キー上は回復アイテム使用 (移動は無効化)
                     const up = pad.up || (pad.dpad && pad.dpad.up);

                     if (up && !this.prevUpBtn) {
                         this.usePotion();
                     }
                     this.prevUpBtn = up;
                }
            }
        }

        if (velX !== 0 || velY !== 0) {
            this.hasInput = true;
            // 正規化してinputVectorに格納
            const vec = new Phaser.Math.Vector2(velX, velY).normalize();
            this.inputVector.set(vec.x, vec.y);

            // 向きの更新判定
            // 攻撃中でない、または攻撃中でもWindup中なら向き変更可能
            // RT長押し中は向き固定 (Xbox RT = Button 7)
            // キーボードの場合は Shift キーで代用 (操作性向上のため追加)
            const isRT = (pad && pad.buttons[7] && pad.buttons[7].pressed) || this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT).isDown;
            const canTurn = (!this.isAttacking || this.inWindup) && !isRT;

            if (canTurn) {
                this.lastDirection.set(vec.x, vec.y);

                // アニメーション（テクスチャ切り替え）
                const suffix = this.currentCostume > 0 ? `_${this.currentCostume}` : '';

                if (Math.abs(vec.x) > Math.abs(vec.y)) {
                    // 横移動優先
                    if (vec.x > 0) {
                        this.setTexture(`player_right${suffix}`);
                        this.setFlipX(false);
                    } else {
                        this.setTexture(`player_left${suffix}`);
                        this.setFlipX(false);
                    }
                } else {
                    // 縦移動優先
                    if (vec.y > 0) {
                        this.setTexture(`player_down${suffix}`);
                        this.setFlipX(false);
                    } else {
                        this.setTexture(`player_up${suffix}`);
                        this.setFlipX(false);
                    }
                }
            }
        } else {
            this.hasInput = false;
            this.inputVector.set(0, 0);
        }
    }

    handleMovement() {
        // ノックバック中は操作不能（物理挙動はupdateInputで入力無効化済みだが念のため）
        if (this.isKnockback) return;

        if (this.hasInput) {
            let moveSpeed = this.speed;

            // ガード中は速度半減
            if (this.isGuarding) {
                moveSpeed *= 0.5;
            }

            // 攻撃中は速度半減（移動可能にする）
            if (this.isAttacking) {
                moveSpeed *= 0.5;
            }

            // SP枯渇（ブレイク）中は移動速度0.7倍
            if (this.isExhausted) {
                moveSpeed *= 0.7;
            }

            const vec = this.inputVector.clone().scale(moveSpeed);
            this.setVelocity(vec.x, vec.y);

            // ダッシュ処理 (Input依存なのでここに記述)
            if (this.isAttacking) return; // 攻撃中はダッシュ不可

            const pad = this.scene.input.gamepad.getPad(0);
            // Button 0 = A/Cross, Button 1 = B/Circle
            const dashBtn = pad && pad.buttons && pad.buttons[1]?.pressed;

            if (!this.scene.hud.isInventoryOpen && !this.dashBlocked && (Phaser.Input.Keyboard.JustDown(this.keyL) || (dashBtn && !this.prevDashBtn))) {
                if (this.isExhausted) {
                    // スタミナ切れ
                } else if (this.stamina > 0) {
                if (!this.isGodMode) {
                    const base = 20;
                    const cost = Math.max(0, Math.floor(base * this.dashSpCostMultiplier));
                    this.stamina -= cost;
                }
                    if (this.stamina <= 0) {
                        this.triggerExhaustion();
                    }
                    this.startDash(vec); // 現在の移動ベクトルでダッシュ
                } else {
                    this.scene.showDamagePopup(this.x, this.y - 30, "No Stamina!", "#ffff00");
                }
            }
            if (pad) this.prevDashBtn = dashBtn;

        } else {
            this.setVelocity(0);
        }
    }

    startDash(vec) {
        this.isDashing = true;

        if (!this.scene.textures.exists('dust_square')) {
            const graphics = this.scene.make.graphics({x: 0, y: 0, add: false});
            graphics.fillStyle(0xdddddd, 0.8);
            graphics.fillRect(0, 0, 16, 16); // 四角いドット
            graphics.generateTexture('dust_square', 16, 16);
        }

        // ダッシュ方向の逆向きにパーティクルを飛ばす
        const dashAngle = Math.atan2(vec.y, vec.x);
        const dustAngle = Phaser.Math.RadToDeg(dashAngle) + 180;

        const particles = this.scene.add.particles(this.x, this.y, 'dust_square', {
            speed: { min: 80, max: 150 },
            angle: { min: dustAngle - 40, max: dustAngle + 40 },
            scale: { start: 1.0, end: 0 }, // 少し小さくして四角さを強調
            alpha: { start: 0.8, end: 0 },
            lifespan: 500,
            gravityY: -100,
            quantity: 8,
            rotate: { min: 0, max: 90 } // 少し回転させる
        });

        particles.setDepth(10); // 肉塊(5)や血痕(1)より上に表示
        particles.explode(8);

        this.scene.time.delayedCall(500, () => {
            particles.destroy();
        });

        if (this.dashBlinkEvent) {
            this.dashBlinkEvent.remove();
            this.dashBlinkEvent = null;
        }

        if (this.dashBlinkStyle === 'rainbow') {
            let hue = 0;
            this.dashBlinkEvent = this.scene.time.addEvent({
                delay: 20,
                loop: true,
                callback: () => {
                    hue = (hue + 0.15) % 1;
                    const color = Phaser.Display.Color.HSVToRGB(hue, 1, 1).color;
                    this.setTintFill(color);
                }
            });
        } else {
            let on = false;
            this.dashBlinkEvent = this.scene.time.addEvent({
                delay: 40,
                loop: true,
                callback: () => {
                    on = !on;
                    if (on) {
                        this.setTintFill(0xffffff);
                    } else {
                        this.clearTint();
                    }
                }
            });
        }

        this.setVelocity(vec.x * 3, vec.y * 3);

        this.scene.time.delayedCall(200, () => {
            this.isDashing = false;

            // 点滅終了
            if (this.dashBlinkEvent) {
                this.dashBlinkEvent.remove();
                this.dashBlinkEvent = null;
            }
            this.clearTint();
        });
    }

    handleGuard() {
        if (this.isAttacking || this.isDashing || this.isExhausted || this.guardCooldownTimer > 0 || this.scene.hud.isInventoryOpen || this.scene.isFloorTransition) {
            if (this.isGuarding) {
                this.isGuarding = false;
                this.clearTint();
            }
            return;
        }

        const pad = this.scene.input.gamepad.getPad(0);
        // Guard: SPACE or Button Left Bumper (LB) (Button 4)
        const isGuardBtn = pad && pad.buttons && pad.buttons[4]?.pressed;
        const isGuardInput = this.keySpace.isDown || isGuardBtn;

        if (isGuardInput) {
            // ジャストガード受付中（リリース直後5F以内）は再ガード不可（ガード解除アクション中とみなす）
            if (this.justGuardTimer > 0) return;

            if (!this.isGuarding) {
                // ガード開始時：ダッシュ同様のスタミナ消費
                if (this.stamina > 0) {
                    if (!this.isGodMode) {
                        const base = 20;
                        const cost = Math.max(0, Math.floor(base * this.dashSpCostMultiplier));
                        this.stamina -= cost;
                    }
                    if (this.stamina <= 0) {
                        this.triggerExhaustion();
                        return; // ガード失敗
                    }
                    this.isGuarding = true;
                    this.setTint(0x0000ff); // 青くなる
                } else {
                    // スタミナなしでガードしようとした
                     this.scene.showDamagePopup(this.x, this.y - 30, "No Stamina!", "#ffff00");
                }
            } else {
                // ガード継続中：徐々にスタミナ減少
                if (!this.isGodMode) {
                    this.stamina -= this.guardDrainRate;
                }
                if (this.stamina <= 0) {
                    this.isGuarding = false;
                    this.triggerExhaustion();
                }
            }
        } else {
            if (this.isGuarding) {
                if (this.isGuardStuck) {
                    return;
                }
                this.isGuarding = false;
                this.clearTint();
                this.justGuardTimer = 83;
                this.justGuardLockX = this.x;
                this.justGuardLockY = this.y;
                if (this.body) {
                    this.justGuardPrevBodyMoves = this.body.moves;
                    this.body.moves = false;
                    this.body.setVelocity(0, 0);
                }
                if (this.justGuardBlinkEvent) {
                    this.justGuardBlinkEvent.remove();
                    this.justGuardBlinkEvent = null;
                }
                let on = false;
                this.justGuardBlinkEvent = this.scene.time.addEvent({
                    delay: 40,
                    loop: true,
                    callback: () => {
                        on = !on;
                        if (this.justGuardTimer <= 0) {
                            if (this.justGuardBlinkEvent) {
                                this.justGuardBlinkEvent.remove();
                                this.justGuardBlinkEvent = null;
                            }
                            this.clearTint();
                            return;
                        }
                        if (on) {
                            this.setTint(0x0000ff);
                        } else {
                            this.clearTint();
                        }
                    }
                });
            }
        }
    }

    triggerExhaustion() {
        this.stamina = 0;
        this.isExhausted = true; // スタミナ切れ発動
        if (this.exhaustBlinkEvent) {
            this.exhaustBlinkEvent.remove();
            this.exhaustBlinkEvent = null;
        }
        let on = false;
        this.exhaustBlinkEvent = this.scene.time.addEvent({
            delay: 120,
            loop: true,
            callback: () => {
                on = !on;
                if (on) {
                    this.setTint(0xff4444);
                } else {
                    this.clearTint();
                }
            }
        });
        this.scene.showDamagePopup(this.x, this.y - 40, "BREAK!", "#ff0000");
    }

    updateShieldSprite() {
        if (!this.shieldSprite) return;

        if (this.equippedShield && this.isGuarding) {
        const dir = this.lastDirection;
        let dx = dir.x;
        let dy = dir.y;
        const len = Math.hypot(dx, dy) || 1;
        dx /= len;
        dy /= len;
        const offset = 18;
            const x = this.x + dx * offset;
            const y = this.y + dy * offset;
            this.shieldSprite.setVisible(true);
            this.shieldSprite.setPosition(x, y);
            const angle = Math.atan2(dy, dx);
            this.shieldSprite.setRotation(angle);
            this.shieldSprite.setDepth(this.depth + 1);
        } else {
            this.shieldSprite.setVisible(false);
        }
    }

    handleCombat() {
        if (this.scene.isFloorTransition) return;
        if (this.isGuarding || this.isExhausted || this.scene.hud.isInventoryOpen) return;

        const pad = this.scene.input.gamepad.getPad(0);

        // Light Attack: J or Button West/X
        const isLightBtn = pad && pad.buttons && pad.buttons[2]?.pressed;
        // Heavy Attack: K or Button North/Y
        const isHeavyBtn = pad && pad.buttons && pad.buttons[3]?.pressed;

        // コンボ入力チェック (攻撃中)
        if (this.isAttacking) {
            if (this.attackType === 'heavy') {
                if (Phaser.Input.Keyboard.JustDown(this.keyK) || (isHeavyBtn && !this.prevHeavyBtn)) {
                    this.triggerHeavyMultiHit();
                }
            }
            // ボタン状態の更新 (リターンする前に必要)
            if (pad) {
                this.prevLightBtn = isLightBtn;
                this.prevHeavyBtn = isHeavyBtn;
            }
            return;
        }

        if (this.isEmpowered) {
            if (Phaser.Input.Keyboard.JustDown(this.keyJ) || (isLightBtn && !this.prevLightBtn)) {
                if (!this.isAttacking) {
                    this.tryFatalAttack('light');
                }
            } else if (Phaser.Input.Keyboard.JustDown(this.keyK) || (isHeavyBtn && !this.prevHeavyBtn)) {
                if (!this.isAttacking) {
                    this.tryFatalAttack('heavy');
                }
            }

            if (pad) {
                this.prevLightBtn = isLightBtn;
                this.prevHeavyBtn = isHeavyBtn;
            }
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(this.keyJ) || (isLightBtn && !this.prevLightBtn)) {
            if (!this.isAttacking) {
                if (this.comboTimer > 0) {
                    this.comboCount = (this.comboCount + 1) % 3;
                } else {
                    this.comboCount = 0;
                }

                if (this.stamina > 0) {
                    if (!this.isGodMode) {
                        const base = 15;
                        const cost = Math.max(0, Math.floor(base * this.attackSpCostMultiplier));
                        this.stamina -= cost;
                    }
                    if (this.stamina <= 0) {
                        this.triggerExhaustion();
                    }
                    this.performAttack('light');
                }
            }
        } 
        else if (Phaser.Input.Keyboard.JustDown(this.keyK) || (isHeavyBtn && !this.prevHeavyBtn)) {
            if (!this.isAttacking) {
                if (this.stamina > 0) {
                    if (!this.isGodMode) {
                        const base = 30;
                        const cost = Math.max(0, Math.floor(base * this.attackSpCostMultiplier));
                        this.stamina -= cost;
                    }
                    if (this.stamina <= 0) {
                        this.triggerExhaustion();
                    }
                    this.performAttack('heavy');
                }
            }
        }

        if (pad) {
            this.prevLightBtn = isLightBtn;
            this.prevHeavyBtn = isHeavyBtn;
        }
    }

    findFatalTarget() {
        const scene = this.scene;
        if (!scene || !scene.enemies) return null;

        const group = scene.enemies;
        const enemies = group.getChildren ? group.getChildren() : [];
        if (!enemies.length) return null;

        const dir = this.lastDirection;
        let facingAngle = Math.atan2(dir.y, dir.x);

        const maxDist = 120;
        const maxDistSq = maxDist * maxDist;
        const maxAngleDiff = 0.8;

        let best = null;
        let bestDistSq = maxDistSq;

        for (const enemy of enemies) {
            if (!enemy || !enemy.active) continue;
            if (!enemy.body) continue;
            if (!enemy.isGuardBroken) continue;

            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distSq = dx * dx + dy * dy;
            if (distSq > maxDistSq) continue;

            const ang = Math.atan2(dy, dx);
            const diff = Math.abs(Phaser.Math.Angle.Wrap(ang - facingAngle));
            if (diff > maxAngleDiff) continue;

            if (distSq < bestDistSq) {
                bestDistSq = distSq;
                best = enemy;
            }
        }

        return best;
    }

    tryFatalAttack(type) {
        if (this.isFatalAttacking) return true;

        const target = this.findFatalTarget();
        if (!target) return false;

        this.fatalTarget = target;
        this.fatalOriginalDepth = typeof target.depth === 'number' ? target.depth : null;
        const weaponDepth = this.weapon ? this.weapon.depth : this.depth + 1;
        target.setDepth(weaponDepth + 1);

        if (this.scene.freezeBreakParticles) {
            this.scene.freezeBreakParticles();
        }
        if (this.scene.beginFatalTimeStop) {
            this.scene.beginFatalTimeStop();
        }

        if (target.armorBlinkTween) {
            target.armorBlinkTween.stop();
            target.armorBlinkTween = null;
        }
        if (target.breakEvent) {
            target.breakEvent.remove();
            target.breakEvent = null;
        }
        target.setTint(0xff0000);
        target.setAlpha(1);

        this.isFatalAttacking = true;
        this.isAttacking = true;
        this.isInvincible = true;
        this.setVelocity(0, 0);
        if (this.body) {
            this.body.setVelocity(0, 0);
            this.body.enable = false;
        }

        const scene = this.scene;
        const camera = scene.cameras.main;

        const dirX = target.x - this.x;
        const dirY = target.y - this.y;
        const len = Math.hypot(dirX, dirY) || 1;
        const offsetDist = 30;
        const destX = target.x - (dirX / len) * offsetDist;
        const destY = target.y - (dirY / len) * offsetDist;

        const angle = Math.atan2(dirY, dirX);
        const attackOffsetX = Math.cos(angle) * 16;
        const attackOffsetY = Math.sin(angle) * 16;
        const weaponScale = this.weaponStats ? this.weaponStats.scale : 1;
        const weaponLen = 60 * weaponScale;
        const tweenBackDuration = 760;
        const tweenThrustDuration = 120;

        if (this.weapon) {
            this.weapon.setScale(weaponScale);
            this.weapon.setVisible(true);
            this.weapon.setTint(0xff0000);
            this.weapon.setDepth(this.depth + 1);

            const backDist = 32 * weaponScale;
            const readyDist = 18 * weaponScale;

            const state = {
                dist: readyDist
            };

            this.weapon.setPosition(
                this.x + Math.cos(angle) * state.dist,
                this.y + Math.sin(angle) * state.dist
            );
            this.weapon.setRotation(angle);
            this.weapon.setDepth(this.depth + 1);
            this.weapon.setDepth(this.depth + 1);

            // ゆっくりと後ろに引く
            scene.tweens.add({
                targets: state,
                dist: -backDist,
                duration: tweenBackDuration,
                ease: 'Sine.easeInOut',
                onUpdate: () => {
                    const px = this.x + Math.cos(angle) * state.dist;
                    const py = this.y + Math.sin(angle) * state.dist;
                    this.weapon.setPosition(px, py);
                    this.weapon.setRotation(angle);
                },
                onComplete: () => {
                    const passDist = len;
                    scene.tweens.add({
                        targets: state,
                        dist: passDist,
                        duration: tweenThrustDuration,
                        ease: 'Quad.easeIn',
                        onUpdate: () => {
                            const px = this.x + Math.cos(angle) * state.dist;
                            const py = this.y + Math.sin(angle) * state.dist;
                            this.weapon.setPosition(px, py);
                            this.weapon.setRotation(angle);
                        }
                    });
                }
            });
        }

        const totalHitDelay = tweenBackDuration + tweenThrustDuration;

        scene.time.delayedCall(totalHitDelay, () => {
            if (target && target.active && target.takeFatalDamage) {
                target.takeFatalDamage(this, type);
            }

            if (scene.hitStop) {
                scene.hitStop(200);
            }

            if (target && target.active) {
                const baseAngle = target.angle || 0;
                const shakeAmount = Phaser.Math.FloatBetween(18, 28) * (Math.random() < 0.5 ? -1 : 1);
                scene.tweens.add({
                    targets: target,
                    angle: baseAngle + shakeAmount,
                    duration: 60,
                    yoyo: true,
                    repeat: 2,
                    onComplete: () => {
                        if (target && target.active) {
                            target.angle = baseAngle;
                        }
                    }
                });
            }

            camera.shake(150, 0.008);

            if (this.weapon) {
                const pierceScale = weaponScale * 1.3;
                this.weapon.setScale(pierceScale);
                const pierceLen = 60 * pierceScale;
                const rootDist = pierceLen * 0.35;
                const rootX = target.x - Math.cos(angle) * rootDist;
                const rootY = target.y - Math.sin(angle) * rootDist;
                this.weapon.setPosition(rootX, rootY);
                this.weapon.setRotation(angle);
            }

            const pauseDuration = 1200;
            const angleToPlayer = Phaser.Math.Angle.Between(target.x, target.y, this.x, this.y);
            const distToPlayer = Phaser.Math.Distance.Between(target.x, target.y, this.x, this.y);

            if (this.weapon) {
                const holdState = { t: 0 };
                const holdEndOffset = distToPlayer * 0.3;

                scene.tweens.add({
                    targets: holdState,
                    t: 1,
                    duration: pauseDuration,
                    ease: 'Sine.easeInOut',
                    onUpdate: () => {
                        const offset = holdEndOffset * holdState.t;
                        const wx = target.x + Math.cos(angleToPlayer) * offset;
                        const wy = target.y + Math.sin(angleToPlayer) * offset;
                        this.weapon.setPosition(wx, wy);
                        this.weapon.setRotation(angle);
                    },
                    onComplete: () => {
                        const pullDuration = 220;
                        const pullState = { t: 0 };
                        const startOffset = holdEndOffset;
                        const endOffset = distToPlayer * 1.05;
                        const totalOffset = endOffset - startOffset;

                        scene.tweens.add({
                            targets: pullState,
                            t: 1,
                            duration: pullDuration,
                            ease: 'Quad.easeOut',
                            onStart: () => {
                                camera.shake(pullDuration, 0.02);
                                if (scene.spawnSparks) {
                                    scene.spawnSparks(target.x, target.y, 45, angleToPlayer, 0xcc0000);
                                }
                                if (target && target.active && target.finishFatalDamage) {
                                    target.finishFatalDamage();
                                }
                            },
                            onUpdate: () => {
                                const offset = startOffset + totalOffset * pullState.t;
                                const wx = target.x + Math.cos(angleToPlayer) * offset;
                                const wy = target.y + Math.sin(angleToPlayer) * offset;
                                this.weapon.setPosition(wx, wy);
                                this.weapon.setRotation(angle);
                            },
                            onComplete: () => {
                                if (this.weapon) {
                                    scene.tweens.add({
                                        targets: this.weapon,
                                        alpha: 0,
                                        duration: 120,
                                        onComplete: () => {
                                            this.weapon.setAlpha(1);
                                            this.weapon.clearTint();
                                            this.weapon.setVisible(false);

                                            this.isAttacking = false;
                                            this.isFatalAttacking = false;
                                            if (this.body) {
                                                this.body.enable = true;
                                                this.body.reset(this.x, this.y);
                                            }
                                            if (this.fatalTarget) {
                                                if (this.fatalOriginalDepth !== null) {
                                                    this.fatalTarget.setDepth(this.fatalOriginalDepth);
                                                }
                                                this.fatalTarget = null;
                                                this.fatalOriginalDepth = null;
                                            }
                                            if (scene.resumeBreakParticles) {
                                                scene.resumeBreakParticles();
                                            }
                                            if (scene.endFatalTimeStop) {
                                                scene.endFatalTimeStop();
                                            }
                                            scene.time.delayedCall(500, () => {
                                                this.isInvincible = false;
                                            });
                                        }
                                    });
                                } else {
                                    this.isAttacking = false;
                                    this.isFatalAttacking = false;
                                    if (this.body) {
                                        this.body.enable = true;
                                        this.body.reset(this.x, this.y);
                                    }
                                    if (this.fatalTarget) {
                                        if (this.fatalOriginalDepth !== null) {
                                            this.fatalTarget.setDepth(this.fatalOriginalDepth);
                                        }
                                        this.fatalTarget = null;
                                        this.fatalOriginalDepth = null;
                                    }
                                    if (scene.resumeBreakParticles) {
                                        scene.resumeBreakParticles();
                                    }
                                    if (scene.endFatalTimeStop) {
                                        scene.endFatalTimeStop();
                                    }
                                    scene.time.delayedCall(500, () => {
                                        this.isInvincible = false;
                                    });
                                }
                            }
                        });
                    }
                });
            } else {
                scene.time.delayedCall(pauseDuration, () => {
                    const pullDuration = 220;
                    camera.shake(pullDuration, 0.02);
                    if (scene.spawnSparks) {
                        scene.spawnSparks(target.x, target.y, 45, angleToPlayer, 0xcc0000);
                    }
                    if (target && target.active && target.finishFatalDamage) {
                        target.finishFatalDamage();
                    }
                    this.isAttacking = false;
                    this.isFatalAttacking = false;
                    if (this.body) {
                        this.body.enable = true;
                        this.body.reset(this.x, this.y);
                    }
                    if (scene.resumeBreakParticles) {
                        scene.resumeBreakParticles();
                    }
                    if (scene.endFatalTimeStop) {
                        scene.endFatalTimeStop();
                    }
                    scene.time.delayedCall(500, () => {
                        this.isInvincible = false;
                    });
                });
            }
        });

        return true;
    }

    setCostume(index) {
        if (index < 0 || index >= this.costumeCount) return;
        this.currentCostume = index;

        // Refresh texture immediately
        const suffix = this.currentCostume > 0 ? `_${this.currentCostume}` : '';
        // Use last direction to determine facing
        const angle = Math.atan2(this.lastDirection.y, this.lastDirection.x);
        const deg = Phaser.Math.RadToDeg(angle);

        let facing = 'down';
        if (deg >= -45 && deg < 45) facing = 'right';
        else if (deg >= 45 && deg < 135) facing = 'down';
        else if (deg >= -135 && deg < -45) facing = 'up';
        else facing = 'left';

        this.setTexture(`player_${facing}${suffix}`);
    }

    performAttack(type) {
        this.isAttacking = true;
        this.attackType = type; // 攻撃タイプを保存

        // コンボ受付時間の更新
        if (type === 'light') {
            this.comboTimer = this.comboWindow;
        } else if (type === 'heavy') {
            // 強攻撃は多段ヒット管理を初期化
            this.heavyHitCount = 0; // 追加ヒット数
            this.heavyMaxHits = 2; // 基本1 + 追加2 = 計3ヒットまで
            this.comboCount = 0; 
            this.comboTimer = 0;
        } else {
             this.comboCount = 0;
             this.comboTimer = 0;
        }

        // 攻撃速度の適用
        const baseTime = type === 'light' ? 300 : 500;

        // Windup (予備動作) の設定
        // Heavy攻撃は溜めを作る。
        let windupTime = 0;
        if (type === 'heavy') {
            windupTime = 100;
        }

        if (windupTime > 0) {
            this.inWindup = true;
            // Windup中は updateInput で向き変更可能

            this.scene.time.delayedCall(windupTime, () => {
                this.inWindup = false;
                this.executeAttack(type, baseTime);
            });
        } else {
            this.executeAttack(type, baseTime);
        }
    }

    executeAttack(type, baseTime) {
        // キャンセルされている場合（ダメージ等）
        if (!this.isAttacking) return;

        // 攻撃発動時の入力再取得は行わず、handleMovementで更新された最新のlastDirectionを使用する
        // これにより、入力タイミングのズレや物理演算との競合による向きの不整合を防ぐ

        const duration = baseTime / this.weaponStats.attackSpeed;

        // 攻撃パラメータ
        let scale = this.weaponStats.scale;
        if (this.isEmpowered) {
            if (type === 'light') {
                scale *= 2.0; // 覚醒弱攻撃は2倍
            } else {
                scale *= 1.5; // 覚醒強攻撃は1.5倍
            }
            this.weapon.setTint(0xff0000); // 赤く染める
        } else {
            this.weapon.clearTint(); // 通常色
        }
        const weaponLen = 60 * scale; // 武器の長さ

        // 武器の表示設定（一旦非表示のままパラメータ設定）
        // Spriteなのでwidthを直接いじると歪む。Scaleを使うべき。
        // Base scale is 1.0. Apply weapon stats scale.

        this.weapon.setScale(scale); 
        // Note: width setting was used for Rectangle. For Sprite, scale is better.
        // However, previous logic used width = weaponLen. 
        // weaponLen = 60 * scale. 
        // If base texture width is ~60 (actually 64), then scale is correct.

        // 向きの取得
        let dir = this.lastDirection.clone();
        if (dir.length() === 0) dir.set(1, 0);
        const baseAngle = Math.atan2(dir.y, dir.x);

        // 攻撃時の剣の表示オフセット計算 (プレイヤーの中心から0.5マス=16px前にずらす)
        const attackOffsetX = Math.cos(baseAngle) * 16;
        const attackOffsetY = Math.sin(baseAngle) * 16;

        // --- Hitbox Generation (Config-Driven) ---
        // 向き文字列の決定 (8方向)
        let dirStr = 'right';
        const angle = Math.atan2(this.lastDirection.y, this.lastDirection.x); // -PI to PI
        const deg = Phaser.Math.RadToDeg(angle); // -180 to 180

        // 22.5度ずらして45度刻みにする
        if (deg >= -22.5 && deg < 22.5) dirStr = 'right';
        else if (deg >= 22.5 && deg < 67.5) dirStr = 'down-right';
        else if (deg >= 67.5 && deg < 112.5) dirStr = 'down';
        else if (deg >= 112.5 && deg < 157.5) dirStr = 'down-left';
        else if (deg >= -67.5 && deg < -22.5) dirStr = 'up-right';
        else if (deg >= -112.5 && deg < -67.5) dirStr = 'up';
        else if (deg >= -157.5 && deg < -112.5) dirStr = 'up-left';
        else dirStr = 'left';

        // モード決定 (isEmpoweredをRBモードとして扱う)
        const mode = this.isEmpowered ? 'rb' : 'normal';

        // コンボ段数に応じた設定取得
        let effectiveType = type;
        if (type === 'light') {
            // light1, light2, light3
            effectiveType = 'light' + (this.comboCount + 1);
        }

        // 設定取得
        const config = this.hitboxAdjustments[mode][effectiveType][dirStr];

        // 現在のアクティブなHitboxリスト
        this.currentHitboxes = [];
        // 各Hitboxのローカル配置情報を保持
        this.currentHitboxLocalInfos = [];

        if (!config) {
            console.error("Hitbox Config Missing!", mode, type, dirStr);
            // 続行は可能だがHitboxなし
        } else {
            // Hitbox生成 (複数の円形Hitboxで近似する)
            const baseWidth = config.width * scale;  // 円の直径として使用
            const baseHeight = config.height * scale; // 全体の長さとして使用
            const hitAngle = config.angle || 0; // 傾き

            // 半径
            const radius = baseWidth / 2;

            // 配置する円の数と間隔を計算
            // 長さが直径より大きい場合、並べて配置
            let numCircles = 1;
            let step = 0;

            if (baseHeight > baseWidth) {
                // 少しオーバーラップさせて隙間をなくす (0.8倍間隔など)
                const overlapRatio = 0.7;
                const effectiveDiameter = baseWidth * overlapRatio;
                numCircles = Math.max(1, Math.ceil((baseHeight - baseWidth) / effectiveDiameter) + 1);
                step = (baseHeight - baseWidth) / Math.max(1, numCircles - 1);
            }

            // 傾きのラジアン
            const tiltRad = Phaser.Math.DegToRad(hitAngle);
            const cosTilt = Math.cos(tiltRad);
            const sinTilt = Math.sin(tiltRad);

            // オフセット計算 (生成時の初期位置用)
            const offsetVal = config.offset || 40;
            const hitBaseDist = offsetVal * scale;

            // プレイヤーの向き (baseAngle) を考慮した回転
            // hitAngle は「剣の向き(0度=右)に対する傾き」
            // 実際に配置するときは baseAngle だけ回転させる必要がある
            const cosBase = Math.cos(baseAngle);
            const sinBase = Math.sin(baseAngle);

            // 円を生成して配置
            for (let i = 0; i < numCircles; i++) {
                // 中心からのオフセット距離 (X軸方向=剣の長さ方向と仮定し、中心を0とする)
                // numCircles=1なら0
                let localX = 0;
                if (numCircles > 1) {
                    localX = -((baseHeight - baseWidth) / 2) + i * step;
                }

                // ローカル座標 (傾き適用 - 剣が右向き(0度)のとき)
                // hitAngleを適用
                const localXRot = localX * cosTilt - 0 * sinTilt; // x' = x cos - y sin
                const localYRot = localX * sinTilt + 0 * cosTilt; // y' = x sin + y cos

                // ここにオフセットを加算 (剣の長さ方向へ)
                // つまりX軸方向に hitBaseDist だけずらす
                const baseX = hitBaseDist + localXRot;
                const baseY = localYRot;

                // 最後にプレイヤーの向き(baseAngle)に合わせて回転して配置
                // さらに攻撃開始オフセット(attackOffsetX, attackOffsetY)を加算
                const finalX = this.x + attackOffsetX + (baseX * cosBase - baseY * sinBase);
                const finalY = this.y + attackOffsetY + (baseX * sinBase + baseY * cosBase);

                // 円形Hitbox生成 (Circle Bodyを持つGame Objectが必要)
                // Phaserのadd.circleはGeometryだが、Arcade Physicsをつけることも可能
                // ここでは見えない矩形(Zone的なもの)を作り、それにCircle Bodyをつける
                // あるいは add.circle を使う
                const hitbox = this.scene.add.circle(finalX, finalY, radius, 0x000000, 0);
                this.scene.physics.add.existing(hitbox);

                if (hitbox.body) {
                    hitbox.body.setCircle(radius);
                }

                // ヒットストップ情報を付与
                hitbox.hitStopDuration = config.hitStop !== undefined ? config.hitStop : 0;
                hitbox.attackType = effectiveType; // 攻撃タイプ（light1, heavy等）を付与

                // デバッグ表示はPhaserの標準(body.debugShowBody)に任せるか、
                // ユーザーの要望に合わせて描画を制御する
                // ユーザーは「薄橙の四角(Visual)を消して、ピンク(Body)だけにしたい」
                // ここではVisual(circle)は透明(alpha=0)にしているので見えない。
                // Bodyのデバッグ表示(ピンクの円)だけが見えるはず。

                // グループに追加
                this.attackHitboxes.add(hitbox);

                // リストに追加
                this.currentHitboxes.push(hitbox);
                this.currentHitboxLocalInfos.push({ x: localXRot, y: localYRot });
            }

            // コンフィグも保存してUpdateで使う
            this.currentHitboxConfig = config;

            // 攻撃終了時に削除
            this.scene.time.delayedCall(duration, () => {
                this.currentHitboxes.forEach(hb => {
                    if (hb.active) hb.destroy();
                });
                this.currentHitboxes = [];
            });
        }

        if (type === 'light') {
            // J攻撃: 横薙ぎ (Swing)

            // コンボ2段目 (count=1) は逆振り (CCW)
            const isReverse = (this.comboCount === 1);

            let startAngle, targetRotation;

            // 回転方向の制御
            // 1段目(count=0): 時計回り (-60 -> +60)
            // 2段目(count=1): 反時計回り (+60 -> -60)
            // 3段目(count=2): 時計回り (-60 -> +60)

            if (isReverse) {
                 // 反時計回り (剣先が右から左へ、あるいは左から右へ)
                 // baseAngleに対して +60度 から -60度 へ
                 startAngle = baseAngle + Phaser.Math.DegToRad(60);
                 targetRotation = baseAngle - Phaser.Math.DegToRad(60);
            } else {
                 // 時計回り (剣先が左から右へ、あるいは右から左へ)
                 // baseAngleに対して -60度 から +60度 へ
                 startAngle = baseAngle - Phaser.Math.DegToRad(60);
                 targetRotation = baseAngle + Phaser.Math.DegToRad(60);
            }

            // 武器の初期位置
            this.weapon.setPosition(this.x + attackOffsetX, this.y + attackOffsetY);
            this.weapon.setRotation(startAngle);
            this.weapon.setDepth(this.depth + 1);

            // 位置と角度が確定してから表示
            this.weapon.setVisible(true);

            // 回転制御用オブジェクト (Phaserのrotation正規化干渉を避けるため)
            const tweenObj = { val: 0 };

            this.scene.tweens.add({
                targets: tweenObj,
                val: 1,
                duration: duration,
                ease: 'Quad.easeOut',
                onUpdate: () => {
                    const currentAngle = startAngle + (targetRotation - startAngle) * tweenObj.val;
                    this.weapon.setRotation(currentAngle);
                    this.weapon.setPosition(this.x + attackOffsetX, this.y + attackOffsetY);

                    // Hitboxの位置更新
                    if (this.currentHitboxes && this.currentHitboxes.length > 0) {
                        // ここでも currentAngle を使う (this.weapon.rotation は正規化される可能性があるため)
                        const cosA = Math.cos(currentAngle);
                        const sinA = Math.sin(currentAngle);

                        // コンフィグのoffsetを使用（なければデフォルト計算）
                        const baseOffsetVal = (this.currentHitboxConfig && this.currentHitboxConfig.offset) ? this.currentHitboxConfig.offset : 40;
                        const hitBaseDist = baseOffsetVal * scale; 

                        // 各Hitboxを更新
                        for(let i=0; i<this.currentHitboxes.length; i++) {
                            const hb = this.currentHitboxes[i];
                            const local = this.currentHitboxLocalInfos[i];

                            if (hb.active) {
                                // プレイヤーの向きに合わせて回転
                                // ローカル座標(local.x, local.y)は「剣が右向き(0度)のときの位置」
                                // currentAngle分だけ回転させる
                                // ただし、local.yは既に剣の傾き(angle)が反映されているので、
                                // 剣の回転(currentAngle)と合わせる必要がある。

                                // 剣の基準回転: currentAngle
                                // Hitboxの配置: (hitBaseDist + local.x, local.y) ※中心からの距離 + ローカルズレ
                                // これをcurrentAngle回転させる

                                // まず基準位置（剣の軸上でのオフセット適用）
                                const baseX = hitBaseDist + local.x; // 剣の長さ方向へのズレ
                                const baseY = local.y;               // 剣の幅方向へのズレ

                                // 回転行列適用
                                const finalX = this.x + attackOffsetX + (baseX * cosA - baseY * sinA);
                                const finalY = this.y + attackOffsetY + (baseX * sinA + baseY * cosA);

                                hb.setPosition(finalX, finalY);
                            }
                        }
                    }
                },
                onComplete: () => {
                    this.finishAttack();
                }
            });

        } else {
            // K攻撃: 突き (Thrust)
            // まっすぐ伸びて戻る
            this.weapon.setRotation(baseAngle);
            this.weapon.setDepth(this.depth + 1);

            // 武器オブジェクト自体を移動させるのではなく、見た目の長さを変えるか、オフセットを変える
            // ここではオフセット移動で表現

            const startDist = 0;
            const endDist = weaponLen * 0.8; // 突き出し距離

            // 突き出しアニメーション用オブジェクト
            const thrustObj = { dist: startDist };

            // 位置と角度が確定してから表示
            this.weapon.setPosition(this.x + attackOffsetX, this.y + attackOffsetY);
            this.weapon.setVisible(true);

                this.scene.tweens.add({
                    targets: thrustObj,
                    dist: endDist,
                    duration: duration * 0.4,
                    yoyo: true,
                    hold: duration * 0.2,
                    ease: 'Cubic.easeOut',
                    onUpdate: () => {
                        const currentDist = thrustObj.dist;
                        this.weapon.setPosition(
                            this.x + attackOffsetX + Math.cos(baseAngle) * currentDist,
                            this.y + attackOffsetY + Math.sin(baseAngle) * currentDist
                        );

                        // Hitboxの位置更新
                    if (this.currentHitboxes && this.currentHitboxes.length > 0) {
                        // 突きの場合はオフセット移動
                        const baseOffsetVal = (this.currentHitboxConfig && this.currentHitboxConfig.offset) ? this.currentHitboxConfig.offset : 40;
                        // 突きの現在の距離 + オフセット
                        const hitBaseDist = currentDist + baseOffsetVal * scale;

                        const cosA = Math.cos(baseAngle);
                        const sinA = Math.sin(baseAngle);

                        // 各Hitboxを更新
                        for(let i=0; i<this.currentHitboxes.length; i++) {
                            const hb = this.currentHitboxes[i];
                            const local = this.currentHitboxLocalInfos[i];

                            if (hb.active) {
                                // 突きの場合も同様に回転行列適用（baseAngle固定）
                                const baseX = hitBaseDist + local.x;
                                const baseY = local.y;

                                const finalX = this.x + attackOffsetX + (baseX * cosA - baseY * sinA);
                                const finalY = this.y + attackOffsetY + (baseX * sinA + baseY * cosA);

                                hb.setPosition(finalX, finalY);
                            }
                        }
                    }
                },
                onComplete: () => {
                    this.finishAttack();
                }
            });
        }
    }

    finishAttack() {
        this.isAttacking = false;
        this.weapon.setVisible(false);
    }

    triggerHeavyMultiHit() {
        if (this.heavyHitCount < this.heavyMaxHits) {
            this.heavyHitCount++;

            // 2. 攻撃判定の再発生
            // 簡易的に：プレイヤーの前方に新しい「Pulse」Hitboxを生成

            const scale = this.weaponStats.scale * (this.isEmpowered ? 1.5 : 1.0);
            const weaponLen = 60 * scale;
            // 突き出し位置（だいたい武器の先端付近と根元付近に判定を出す）

            // 攻撃方向
            const angle = this.weapon.rotation;
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);

            // 判定発生位置 (2箇所くらいに出す)
            const distances = [weaponLen * 0.4, weaponLen * 0.8];

            distances.forEach(dist => {
                 // プレイヤー中心からの位置
                 // 武器の根元オフセットも考慮
                 const attackOffsetX = Math.cos(angle) * 16;
                 const attackOffsetY = Math.sin(angle) * 16;

                 const hx = this.x + attackOffsetX + cosA * dist;
                 const hy = this.y + attackOffsetY + sinA * dist;

                 const radius = 15 * scale;

                 const hitbox = this.scene.add.circle(hx, hy, radius, 0x000000, 0);
                 this.scene.physics.add.existing(hitbox);
                 if (hitbox.body) {
                     hitbox.body.setCircle(radius);
                 }

                 hitbox.attackType = 'heavy';
                 hitbox.hitStopDuration = 100; // 追撃は軽めのヒットストップ
                 hitbox.isMultiHit = true; // 多段ヒットフラグ（必要なら）

                 this.attackHitboxes.add(hitbox);

                 // 短時間で消滅
                 this.scene.time.delayedCall(100, () => {
                     hitbox.destroy();
                 });
            });

            // SEとかエフェクトあれば追加
        }
    }

    takeKnockback(vx, vy, duration = 200) {
        if (this.justGuardTimer > 0) {
            return;
        }
        this.isKnockback = true;
        this.setVelocity(vx, vy);

        // ガード中でなければ攻撃等はキャンセル
        if (!this.isGuarding) {
            this.finishAttack();
        }

        this.scene.time.delayedCall(duration, () => {
            this.isKnockback = false;
            this.setVelocity(0);
            this.isGuardStuck = false;
        });
    }

    takeDamage(amount, source) {
        if (this.scene.isFloorTransition || this.scene.isGameOver) return;
        if (this.isGodMode) return;

        if (this.isDashing) return;
        if (this.isInvincible) return;

        const prevHp = this.hp;

        const wasGuardingAtHit = this.isGuarding;
        let knockbackForce = 0;

        let isFrontHit = false;
        if (source && this.lastDirection) {
            const guardDirAngle = Math.atan2(this.lastDirection.y, this.lastDirection.x);
            const attackAngle = Phaser.Math.Angle.Between(this.x, this.y, source.x, source.y);
            const diff = Phaser.Math.Angle.Wrap(attackAngle - guardDirAngle);
            const deg = Math.abs(Phaser.Math.RadToDeg(diff));
            if (deg <= 60) {
                isFrontHit = true;
            }
        }

        if (this.justGuardTimer > 0 && isFrontHit) {
            if (this.justGuardBlinkEvent) {
                this.justGuardBlinkEvent.remove();
                this.justGuardBlinkEvent = null;
            }
            this.clearTint();
            this.scene.showDamagePopup(this.x, this.y - 40, "JUST GUARD!", "#ffffff");
            this.scene.hitStop(60);

            this.scene.cameras.main.flash(50, 255, 255, 255);
            this.setTintFill(0xffffff);
            this.scene.time.delayedCall(100, () => this.clearTint());

            let sparkX = this.x;
            let sparkY = this.y;
            let sparkAngle = null;
            if (source) {
                const angleToSource = Phaser.Math.Angle.Between(this.x, this.y, source.x, source.y);
                const offset = 10; 
                sparkX = this.x + Math.cos(angleToSource) * offset;
                sparkY = this.y + Math.sin(angleToSource) * offset;
                sparkAngle = angleToSource;
            }
            this.scene.spawnSparks(sparkX, sparkY, 30, sparkAngle);

            this.recoverStamina(this.maxStamina * 0.5);

            if (source && source.type && (source.type === 'large' || source.type === 'charger' || source.type === 'mossy_statue' || source.type === 'cursed_stag') && !source.isGuardBroken) {
                const enemy = source;
                const scene = this.scene;
                if (this.isEmpowered && typeof this.recoverHealth === 'function') {
                    this.recoverHealth(this.maxHp * 0.5);
                }
                enemy.stamina = 0;
                enemy.isGuardBroken = true;
                enemy.canBeFatalNow = true;
                const stopDuration = 60;
                enemy.guardBreakTimer = 3000 + stopDuration;
                enemy.guardBreakMax = enemy.guardBreakTimer;
                if (enemy.startBreakEffect) {
                    enemy.startBreakEffect();
                }
                if (scene.showDamagePopup) {
                    scene.showDamagePopup(enemy.x, enemy.y - 60, "BREAK!", "#ffff00");
                }
                if (scene.spawnBreakParticles) {
                    scene.spawnBreakParticles(enemy.x, enemy.y, 30);
                }
                if (enemy.cancelAttack) {
                    enemy.cancelAttack();
                }
                const angle = Phaser.Math.Angle.Between(this.x, this.y, enemy.x, enemy.y);
                const force = 400; 
                enemy.forceMoveVelocity = {
                    x: Math.cos(angle) * force,
                    y: Math.sin(angle) * force
                };
                enemy.state = 'KNOCKBACK';
                enemy.setVelocity(0);
                scene.time.delayedCall(300, () => {
                    if (!enemy.active) return;
                    if (enemy.hp > 0) {
                        enemy.state = 'IDLE'; 
                        enemy.setVelocity(0);
                    }
                });
            }

            return;
        }

        if (this.isGuarding && isFrontHit) {
            let hardness = 0;
            let thickness = 0;
            let weight = 0;
            if (this.equippedShield) {
                hardness = this.equippedShield.hardness || 0;
                thickness = this.equippedShield.thickness || 0;
                weight = this.equippedShield.weight || 0;
            }

            const chipDamage = Math.max(0, Math.floor(amount * 0.2) - hardness);
            const staminaDamage = Math.max(0, Math.floor(amount * 0.5) - thickness);

            this.hp -= chipDamage;
            this.stamina -= staminaDamage;

            knockbackForce = Math.max(50, 150 - (weight * 10)); // ガード時のノックバック（小）軽減

            // ガードによるスタミナ切れ判定
            if (this.stamina <= 0) {
                this.triggerExhaustion();
                this.isGuarding = false; // ガード崩し
                this.scene.showDamagePopup(this.x, this.y - 60, "GUARD BREAK!", "#ff0000");
                knockbackForce = 300; // ブレイク時は大きく吹っ飛ぶ
                this.scene.hitStop(300);
            } else {
                this.scene.showDamagePopup(this.x, this.y - 20, `Guard! -${chipDamage}`, '#aaaaff');
                this.scene.hitStop(50);
            }

            this.scene.cameras.main.shake(100, 0.005);

            // ガードエフェクト（火花）
            // 敵の攻撃方向（sourceへの方向）に火花を表示する
            let sparkX = this.x;
            let sparkY = this.y;
            let sparkAngle = null;

            if (source) {
                // プレイヤーから見た敵の方向
                const angleToSource = Phaser.Math.Angle.Between(this.x, this.y, source.x, source.y);

                // 衝突点（プレイヤーの中心から敵の方へ少しずらした位置）
                // プレイヤー周辺（半径5px程度）に表示 - さらに近くに
                const offset = 5; 
                sparkX = this.x + Math.cos(angleToSource) * offset;
                sparkY = this.y + Math.sin(angleToSource) * offset;

                // 火花も敵の方向（跳ね返る方向）へ飛ばす
                sparkAngle = angleToSource;
            }

            this.scene.spawnSparks(sparkX, sparkY, 15, sparkAngle);
        } else {
            this.hp -= amount;
            this.scene.showDamagePopup(this.x, this.y - 20, `-${amount}`, '#ff0000');
            this.scene.cameras.main.shake(200, 0.01);
            this.scene.hitStop(100);
            this.setTint(0xff0000);
            this.scene.time.delayedCall(200, () => this.clearTint());

            knockbackForce = 400; // 通常ヒット時のノックバック（大）
        }

        // ノックバック適用
        if (source) {
            let force = knockbackForce;
            // スーパーアーマー (Empowered & Attacking)
            // RB長押し攻撃中はノックバックしない
            if (this.isEmpowered && this.isAttacking) {
                force = 0;
            }

            if (force > 0) {
                const angle = Phaser.Math.Angle.Between(source.x, source.y, this.x, this.y);
                const vec = new Phaser.Math.Vector2().setToPolar(angle, force);
                if (wasGuardingAtHit && this.isGuarding) {
                    this.isGuardStuck = true;
                }
                this.takeKnockback(vec.x, vec.y, 200);
            }
        }

        if (this.hp <= 0) {
            this.hp = 0;
            this.scene.showDamagePopup(this.x, this.y - 40, "DEAD", '#ff0000');
            this.scene.onPlayerDead();
        }

        const lostHp = Math.max(0, prevHp - this.hp);
        if (lostHp > 0 && this.scene && typeof this.scene.registerPlayerDamageTaken === 'function') {
            this.scene.registerPlayerDamageTaken(lostHp);
        }
    }

    recoverStamina(amount) {
        this.stamina = Math.min(this.stamina + amount, this.maxStamina);
        this.scene.showDamagePopup(this.x, this.y - 60, `+${Math.floor(amount)} SP`, '#00ff00');
    }

    recoverHealth(amount) {
        this.hp = Math.min(this.hp + amount, this.maxHp);
        this.scene.showDamagePopup(this.x, this.y - 80, `+${Math.floor(amount)} HP`, '#00ff00');
    }

    setWeaponStats(speed, scale) {
        this.weaponStats.attackSpeed = speed;
        this.weaponStats.scale = scale;
        console.log(`Weapon Stats Updated: Speed x${speed}, Scale x${scale}`);
    }
}
