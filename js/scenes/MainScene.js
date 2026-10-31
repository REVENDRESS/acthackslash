class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
        this.isGameOver = false;
        this.dungeonFloor = 0;
        this.runElapsedTime = 0;
        this.runKillCount = 0;
        this.runDamageDealt = 0;
        this.runDamageTaken = 0;
        this.runGoldGained = 0;
        this.runObjectsDestroyed = 0;
        this.isFloorTransition = false;
        this.isExitingFloor = false;
        this.canUseExit = false;
        this.exitPrompt = null;
        this.prevExitConfirmBtn = false;
        this.dungeonTheme = null;
        this.prevDoorBtn = false;
        this.castleCurses = [];
        this.castleSpikes = [];
        this.lastSpikeDamageTime = 0;
        this.forestNextRespawnTime = 0;
        this.forestInteriorFloors = [];
        this.floorBannerOverlay = null;
        this.floorBannerText = null;
        this.slotIndex = 0;
        this.dungeonType = null;
    }

    init(data) {
        this.slotIndex = data && typeof data.slotIndex === 'number' ? data.slotIndex : 0;
        this.dungeonType = data && data.dungeonType ? data.dungeonType : 'story';

        // シーン再起動時にPhaserが内部で破棄した物理グループの stale 参照をリセット
        this.obstacles = null;
        this.forestWalls = null;
        this.forestFloorGroup = null;
        this.walls = null;
        this.castleFloorGroup = null;
        this.castleWalls = null;

        this.isGameOver = false;
        this.dungeonFloor = 0;
        this.runElapsedTime = 0;
        this.runKillCount = 0;
        this.runDamageDealt = 0;
        this.runDamageTaken = 0;
        this.runGoldGained = 0;
        this.runObjectsDestroyed = 0;

        this.isFloorTransition = false;
        this.isExitingFloor = false;
        this.canUseExit = false;
        this.exitPrompt = null;
        this.prevExitConfirmBtn = false;

        this.dungeonTheme = null;
        this.prevDoorBtn = false;

        this.castleCurses = [];
        this.castleSpikes = [];
        this.castleInteriorFloors = [];
        this.lastSpikeDamageTime = 0;
        this.forestNextRespawnTime = 0;
        this.forestInteriorFloors = [];

        this.floorBannerOverlay = null;
        this.floorBannerText = null;

        this.isInForest = false;
        this.isTowerMode = false;
        this.castleNextRespawnTime = 0;

        this.isPortalActive = false;
        this.testRoomGrid = null;
        this.testButtons = [];
        this.goldDrops = null;
        this.items = null;
        this.enemies = null;
        this.chests = null;
        this.arrows = null;
        this.portals = null;
        this.exitGroup = null;
        this.fogOverlay = null;
        this.dungeonExitCell = null;
        this.forestTileSize = 32;
        this.forestCols = 0;
        this.forestRows = 0;
        this.forestMapData = null;
        this.forestWalls = null;
        this.forestFloorGroup = null;
        this.forestFogSprites = [];
        this.castleWalls = null;
        this.castleFloorGroup = null;
        this.castleFogSprites = [];
        this.goreStains = [];
    }

    preload() {
        // Force reload of weapon texture with cache buster
        // this.load.image('weapon_iron_sword', 'assets/images/sword.PNG?v=' + Date.now());
        this.load.image('shield_texture', 'assets/images/shield.PNG');

        // Try to load chest texture. 
        // If it fails (404), Phaser will just not have the key, and our fallback in create() will run.
        this.load.image('chest', 'assets/images/chest.PNG');
        this.load.image('chestOpen', 'assets/images/chestOpen.PNG');
    }

    create() {
        this.isGameOver = false;

        if (this.textures.exists('weapon_iron_sword')) {
            // Image loaded successfully, no processing needed for PNG with transparency
        }

        // Items Group
        this.items = this.physics.add.group({
            classType: ItemDrop,
            runChildUpdate: true
        });

        // 血のテクスチャ生成（四角形）
        if (!this.textures.exists('blood')) {
            const graphics = this.make.graphics({x: 0, y: 0, add: false});
            graphics.setVisible(false); // 念のため非表示
            graphics.fillStyle(0xaa0000, 1);
            graphics.fillRect(0, 0, 4, 4); // 小さくする (8x8 -> 4x4)
            graphics.generateTexture('blood', 4, 4);
            graphics.destroy(); // テクスチャ生成に使ったグラフィックスは破棄
        }

        // Spark Texture
        if (!this.textures.exists('spark')) {
            const graphics = this.make.graphics({x: 0, y: 0, add: false});
            graphics.setVisible(false);
            graphics.fillStyle(0xffffff, 1);
            graphics.fillRect(0, 0, 4, 4);
            graphics.generateTexture('spark', 4, 4);
            graphics.destroy();
        }

        // Fire Texture (赤黒い炎)
        if (!this.textures.exists('fire_texture')) {
            const graphics = this.make.graphics({x: 0, y: 0, add: false});
            graphics.setVisible(false);
            graphics.fillStyle(0xcc0000, 1);
            graphics.fillCircle(4, 4, 4);
            graphics.generateTexture('fire_texture', 8, 8);
            graphics.destroy();
        }

        if (!this.textures.exists('forest_fog')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            const fogWidth = this.scale.width * 2;
            const fogHeight = this.scale.height * 2;
            g.fillStyle(0x000000, 0);
            g.fillRect(0, 0, fogWidth, fogHeight);

            g.fillStyle(0x99aa99, 0.55);
            for (let i = 0; i < 80; i++) {
                const w = Phaser.Math.Between(50, 140);
                const h = Phaser.Math.Between(50, 140);
                const x = Phaser.Math.Between(-120, fogWidth + 120);
                const y = Phaser.Math.Between(-120, fogHeight + 120);
                g.fillRect(x, y, w, h);
            }

            g.fillStyle(0x778877, 0.35);
            for (let i = 0; i < 80; i++) {
                const w = Phaser.Math.Between(30, 100);
                const h = Phaser.Math.Between(30, 100);
                const x = Phaser.Math.Between(-120, fogWidth + 120);
                const y = Phaser.Math.Between(-120, fogHeight + 120);
                g.fillRect(x, y, w, h);
            }

            g.generateTexture('forest_fog', fogWidth, fogHeight);
            g.destroy();
        }

        if (!this.textures.exists('castle_fog')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            const fogWidth = this.scale.width * 2;
            const fogHeight = this.scale.height * 2;
            g.fillStyle(0x000000, 0);
            g.fillRect(0, 0, fogWidth, fogHeight);

            g.fillStyle(0xc2e5ff, 0.5);
            for (let i = 0; i < 60; i++) {
                const w = Phaser.Math.Between(70, 160);
                const h = Phaser.Math.Between(8, 20);
                const x = Phaser.Math.Between(-120, fogWidth + 120);
                const y = Phaser.Math.Between(-120, fogHeight + 120);
                g.fillRect(x, y, w, h);
            }

            g.fillStyle(0x9ccfff, 0.3);
            for (let i = 0; i < 40; i++) {
                const w = Phaser.Math.Between(40, 120);
                const h = Phaser.Math.Between(4, 14);
                const x = Phaser.Math.Between(-120, fogWidth + 120);
                const y = Phaser.Math.Between(-120, fogHeight + 120);
                g.fillRect(x, y, w, h);
            }

            g.generateTexture('castle_fog', fogWidth, fogHeight);
            g.destroy();
        }

        if (!this.textures.exists('tower_fog')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            const fogWidth = this.scale.width * 2;
            const fogHeight = this.scale.height * 2;
            g.fillStyle(0x000000, 0);
            g.fillRect(0, 0, fogWidth, fogHeight);

            g.fillStyle(0x443366, 0.6);
            for (let i = 0; i < 70; i++) {
                const w = Phaser.Math.Between(40, 140);
                const h = Phaser.Math.Between(40, 140);
                const x = Phaser.Math.Between(-120, fogWidth + 120);
                const y = Phaser.Math.Between(-120, fogHeight + 120);
                g.fillRect(x, y, w, h);
            }

            g.fillStyle(0x221133, 0.7);
            for (let i = 0; i < 50; i++) {
                const w = Phaser.Math.Between(20, 80);
                const h = Phaser.Math.Between(60, 160);
                const x = Phaser.Math.Between(-120, fogWidth + 120);
                const y = Phaser.Math.Between(-120, fogHeight + 120);
                g.fillRect(x, y, w, h);
            }

            g.fillStyle(0xffeeaa, 0.28);
            for (let i = 0; i < 35; i++) {
                const w = Phaser.Math.Between(30, 90);
                const h = Phaser.Math.Between(12, 28);
                const x = Phaser.Math.Between(-120, fogWidth + 120);
                const y = Phaser.Math.Between(-120, fogHeight + 120);
                g.fillRect(x, y, w, h);
            }

            g.generateTexture('tower_fog', fogWidth, fogHeight);
            g.destroy();
        }

        if (!this.textures.exists('castle_curse')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            const size = 32;
            g.fillStyle(0x000000, 0);
            g.fillRect(0, 0, size, size);
            g.fillStyle(0x151726, 0.9);
            const cx = size / 2;
            const cy = size / 2 + 4;
            const rOuter = 10;
            const rInner = 6;
            g.strokeCircle(cx, cy, rOuter);
            g.lineStyle(2, 0x5b7cff, 0.9);
            g.strokeCircle(cx, cy, rInner);
            g.fillStyle(0x3b4c99, 0.5);
            g.fillCircle(cx, cy, 4);
            g.lineStyle(1, 0x8fb5ff, 0.8);
            for (let i = 0; i < 3; i++) {
                const angle = (Math.PI * 2 / 3) * i - Math.PI / 2;
                const px = cx + Math.cos(angle) * rOuter;
                const py = cy + Math.sin(angle) * rOuter;
                g.beginPath();
                g.moveTo(cx, cy);
                g.lineTo(px, py);
                g.strokePath();
            }
            g.generateTexture('castle_curse', size, size);
            g.destroy();
        }

        // Chest Texture (Placeholder)
        if (!this.textures.exists('chest')) {
            const graphics = this.make.graphics({x: 0, y: 0, add: false});
            graphics.fillStyle(0x8B4513, 1); // SaddleBrown
            graphics.fillRect(0, 0, 32, 32);
            graphics.lineStyle(2, 0xFFD700, 1); // Gold outline
            graphics.strokeRect(0, 0, 32, 32);
            graphics.generateTexture('chest', 32, 32);
            graphics.destroy();
        }

        // Item Texture (White Square for Tinting)
        if (!this.textures.exists('item_texture')) {
            const graphics = this.make.graphics({x: 0, y: 0, add: false});
            graphics.fillStyle(0xffffff, 1);
            graphics.fillRect(0, 0, 32, 32);
            graphics.lineStyle(2, 0x000000, 1);
            graphics.strokeRect(0, 0, 32, 32);
            graphics.generateTexture('item_texture', 32, 32);
            graphics.destroy();
        }

        const drawQuadBezier = (graphics, startX, startY, cpX, cpY, endX, endY) => {
            for (let i = 1; i <= 20; i++) {
                const t = i / 20;
                const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * cpX + t * t * endX;
                const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * cpY + t * t * endY;
                graphics.lineTo(x, y);
            }
        };

        Object.values(WEAPON_TYPES).forEach(type => {
            if (!this.textures.exists(type.texture)) {
                const graphics = this.make.graphics({x: 0, y: 0, add: false});

                if (type.name === "さびたけん") {
                    // 錆びた剣: 少し短く、ギザギザ

                    // 柄
                    graphics.fillStyle(0x8B4513, 1);
                    graphics.fillRect(0, 28, 16, 8);

                    // ガード
                    graphics.fillStyle(0x555555, 1);
                    graphics.fillRect(16, 20, 6, 24);

                    // 刃
                    graphics.fillStyle(type.color, 1);
                    graphics.beginPath();
                    graphics.moveTo(22, 24);
                    graphics.lineTo(55, 24); // 短め
                    graphics.lineTo(60, 32); // 先端
                    graphics.lineTo(55, 40);
                    graphics.lineTo(22, 40);
                    graphics.closePath();
                    graphics.fillPath();

                    // サビ感の追加 (灰色・青銅色)
                    graphics.fillStyle(0x708090, 0.8); // SlateGray
                    graphics.fillCircle(30, 26, 3);
                    graphics.fillCircle(45, 38, 2);
                    graphics.fillCircle(52, 30, 2.5);

                    graphics.fillStyle(0xcd7f32, 0.6); // Bronze-ish
                    graphics.fillRect(25, 30, 4, 4);
                    graphics.fillRect(40, 26, 5, 3);
                    graphics.fillRect(50, 36, 3, 3);

                } else if (type.name === "てつのけん") {
                    // てつのけん: 標準的な剣

                    // 柄
                    graphics.fillStyle(0x8B4513, 1);
                    graphics.fillRect(0, 28, 16, 8);
                    // 柄の滑り止め（革巻き風）
                    graphics.fillStyle(0x654321, 1);
                    graphics.fillRect(4, 28, 2, 8);
                    graphics.fillRect(8, 28, 2, 8);
                    graphics.fillRect(12, 28, 2, 8);

                    // ガード
                    graphics.fillStyle(0xDAA520, 1); // 金色のガード
                    graphics.fillRect(16, 20, 6, 24);
                    // ガードの装飾（リベット）
                    graphics.fillStyle(0xB8860B, 1); // DarkGoldenRod
                    graphics.fillCircle(19, 24, 2);
                    graphics.fillCircle(19, 40, 2);

                    // 刃
                    graphics.fillStyle(type.color, 1);
                    graphics.beginPath();
                    graphics.moveTo(22, 26);
                    graphics.lineTo(65, 26);
                    graphics.lineTo(70, 32); // 先端
                    graphics.lineTo(65, 38);
                    graphics.lineTo(22, 38);
                    graphics.closePath();
                    graphics.fillPath();

                    // 溝
                    graphics.lineStyle(1, 0xFFFFFF, 0.5);
                    graphics.beginPath();
                    graphics.moveTo(22, 32);
                    graphics.lineTo(60, 32);
                    graphics.strokePath();

                    // 刃の光沢ライン（下部）
                    graphics.lineStyle(1, 0x808080, 0.3);
                    graphics.beginPath();
                    graphics.moveTo(24, 36);
                    graphics.lineTo(62, 36);
                    graphics.strokePath();

                } else if (type.name === "はがねのつるぎ") {
                    // 鋼の長剣: 細く長い

                    // 柄
                    graphics.fillStyle(0x333333, 1);
                    graphics.fillRect(0, 29, 18, 6);
                    // ポメル
                    graphics.fillStyle(0x666666, 1);
                    graphics.fillCircle(0, 32, 4);

                    // ガード: 十字
                    graphics.fillStyle(0x444444, 1);
                    graphics.fillRect(18, 16, 4, 32);

                    // 刃
                    graphics.fillStyle(type.color, 1);
                    graphics.beginPath();
                    graphics.moveTo(22, 26);
                    graphics.lineTo(75, 28); // 長い
                    graphics.lineTo(80, 32); // 鋭い先端
                    graphics.lineTo(75, 36);
                    graphics.lineTo(22, 38);
                    graphics.closePath();
                    graphics.fillPath();

                    // 溝
                    graphics.lineStyle(1, 0xFFFFFF, 0.6);
                    graphics.beginPath();
                    graphics.moveTo(22, 32);
                    graphics.lineTo(70, 32);
                    graphics.strokePath();

                } else if (type.name === "たんけん") {
                    // ダガー: 短く、鋭い

                    // 柄
                    graphics.fillStyle(0x000000, 1);
                    graphics.fillRect(5, 28, 12, 8);

                    // ガード: 小さい
                    graphics.fillStyle(0x555555, 1);
                    graphics.fillRect(17, 24, 4, 16);

                    // 刃
                    graphics.fillStyle(type.color, 1);
                    graphics.beginPath();
                    graphics.moveTo(21, 26);
                    graphics.lineTo(40, 28); // 短い
                    graphics.lineTo(48, 32); // 先端
                    graphics.lineTo(40, 36);
                    graphics.lineTo(21, 38);
                    graphics.closePath();
                    graphics.fillPath();

                } else if (type.name === "くれいもあ") {
                    // クレイモア: 幅広で巨大、装飾を追加

                    // 柄: 長い
                    graphics.fillStyle(0x3E2723, 1);
                    graphics.fillRect(0, 27, 20, 10);
                    // 柄の滑り止め
                    graphics.lineStyle(1, 0x1a1a1a, 0.5);
                    graphics.beginPath();
                    graphics.moveTo(5, 27); graphics.lineTo(5, 37);
                    graphics.moveTo(10, 27); graphics.lineTo(10, 37);
                    graphics.moveTo(15, 27); graphics.lineTo(15, 37);
                    graphics.strokePath();

                    // ガード: 巨大で重厚
                    graphics.fillStyle(0x222222, 1);
                    graphics.beginPath();
                    graphics.moveTo(20, 32);
                    graphics.lineTo(15, 10); // より長く
                    graphics.lineTo(28, 12);
                    graphics.lineTo(30, 32);
                    graphics.lineTo(28, 52);
                    graphics.lineTo(15, 54);
                    graphics.closePath();
                    graphics.fillPath();

                    // ガードの装飾（金色のリベット）
                    graphics.fillStyle(0xFFD700, 1);
                    graphics.fillCircle(22, 22, 2);
                    graphics.fillCircle(22, 42, 2);

                    // 刃
                    graphics.fillStyle(type.color, 1); // 白 (White Smoke)
                    graphics.beginPath();
                    graphics.moveTo(30, 18); // 幅広
                    graphics.lineTo(80, 18);
                    graphics.lineTo(90, 32); // 先端
                    graphics.lineTo(80, 46);
                    graphics.lineTo(30, 46);
                    graphics.closePath();
                    graphics.fillPath();

                    // フラー（血溝）
                    graphics.fillStyle(0xDCDCDC, 1); // Gainsboro (少し暗い白)
                    graphics.fillRect(32, 30, 45, 4);

                    // 刃の根元の紋様（青いルーン文字風）
                    graphics.lineStyle(1, 0x4169E1, 0.8); // Royal Blue
                    graphics.beginPath();
                    graphics.moveTo(35, 24); graphics.lineTo(40, 28); graphics.lineTo(35, 32);
                    graphics.moveTo(42, 24); graphics.lineTo(42, 32);
                    graphics.strokePath();


                } else if (type.name === "ざんげつ") {
                    // ざんげつ: 弧を描く美しい曲線の刀 (Beautiful Arc Katana)

                    // --- Handle (Tsuka) ---
                    graphics.fillStyle(0x111111, 1);
                    graphics.fillRect(0, 29, 24, 6); 

                    // White wrapping
                    graphics.lineStyle(1.5, 0xf0f0f0, 1);
                    graphics.beginPath();
                    for(let i=0; i<5; i++) {
                        graphics.moveTo(5 + i*5, 29);
                        graphics.lineTo(0 + i*5, 35);
                    }
                    graphics.strokePath();

                    // --- Blade Body ---
                    // Deep Black/Gunmetal
                    graphics.fillStyle(0x050505, 1);
                    graphics.beginPath();

                    graphics.moveTo(24, 29);

                    // Spine (Top edge) - Strong Arc
                    // (StartX, StartY, ControlX, ControlY, EndX, EndY)
                    drawQuadBezier(graphics, 24, 29, 60, 15, 92, 25);

                    // Tip
                    graphics.lineTo(92, 25); // Tip

                    // Cutting Edge (Bottom) - Strong Arc
                    // (StartX, StartY, ControlX, ControlY, EndX, EndY)
                    drawQuadBezier(graphics, 92, 25, 60, 28, 24, 35);

                    graphics.closePath();
                    graphics.fillPath();

                    // --- Hamon / Edge ---
                    graphics.fillStyle(0xcccccc, 1);
                    graphics.beginPath();

                    graphics.moveTo(24, 35);
                    drawQuadBezier(graphics, 24, 35, 60, 28, 92, 25); // Follow edge
                    graphics.lineTo(85, 25); // Inner tip
                    drawQuadBezier(graphics, 85, 25, 58, 26, 28, 32);

                    graphics.closePath();
                    graphics.fillPath();

                    // --- Shine / Highlight ---
                    graphics.fillStyle(0x333333, 0.5);
                    graphics.beginPath();
                    graphics.moveTo(30, 29);
                    drawQuadBezier(graphics, 30, 29, 60, 18, 88, 24);
                    graphics.lineTo(85, 25);
                    drawQuadBezier(graphics, 85, 25, 60, 22, 30, 31);
                    graphics.closePath();
                    graphics.fillPath();

                } else if (type.name === "ぎんのけん") {
                    // ぎんのけん: 聖銀の剣
                    // 柄
                    graphics.fillStyle(0xFFFFFF, 1);
                    graphics.fillRect(0, 28, 16, 8);
                    // 柄の装飾（金のリング）
                    graphics.fillStyle(0xD4AF37, 1);
                    graphics.fillRect(4, 28, 2, 8);
                    graphics.fillRect(10, 28, 2, 8);

                    // ガード: 十字架型
                    graphics.fillStyle(0xD4AF37, 1);
                    graphics.fillRect(16, 16, 6, 32);
                    // ガード中央の宝石（サファイア）
                    graphics.fillStyle(0x00008B, 1); // DarkBlue
                    graphics.fillCircle(19, 32, 2.5);
                    graphics.lineStyle(1, 0xFFFFFF, 0.8);
                    graphics.strokeCircle(19, 32, 2.5);

                    // 刃: 白銀
                    graphics.fillStyle(0xC0C0C0, 1);
                    graphics.beginPath();
                    graphics.moveTo(22, 24);
                    graphics.lineTo(70, 24);
                    graphics.lineTo(75, 32);
                    graphics.lineTo(70, 40);
                    graphics.lineTo(22, 40);
                    graphics.closePath();
                    graphics.fillPath();

                    // 金のライン（十字架風）
                    graphics.lineStyle(1, 0xD4AF37, 1);
                    graphics.beginPath();
                    graphics.moveTo(22, 32);
                    graphics.lineTo(70, 32);
                    graphics.strokePath();
                    // 垂直ライン
                    graphics.beginPath();
                    graphics.moveTo(35, 26);
                    graphics.lineTo(35, 38);
                    graphics.strokePath();

                    // 聖なる光（ドット装飾）
                    graphics.fillStyle(0xE6E6FA, 0.8);
                    graphics.fillCircle(50, 28, 1.5);
                    graphics.fillCircle(60, 36, 1.5);
                    graphics.fillCircle(40, 34, 1.5);


                } else if (type.name === "フォトンブレード") {
                    // フォトンブレード: ビームサーベル風

                    // 柄: メカニカルなダークグレー
                    graphics.fillStyle(0x404040, 1);
                    graphics.fillRect(0, 28, 18, 8); // グリップ

                    // エミッター（発生装置）
                    graphics.fillStyle(0x808080, 1);
                    graphics.fillRect(18, 26, 6, 12);
                    graphics.lineStyle(1, 0x00FFFF, 0.8);
                    graphics.strokeRect(18, 26, 6, 12);

                    // 刃: 発光エネルギー
                    // 1. コア（高輝度、白に近い）
                    graphics.lineStyle(4, 0xE0FFFF, 1);
                    graphics.beginPath();
                    graphics.moveTo(24, 32);
                    graphics.lineTo(88, 32);
                    graphics.strokePath();

                    // 2. インナーグロー（本来の色）
                    graphics.lineStyle(8, 0x00FFFF, 0.6);
                    graphics.beginPath();
                    graphics.moveTo(24, 32);
                    graphics.lineTo(88, 32);
                    graphics.strokePath();

                    // 3. アウターグロー（拡散光）
                    graphics.lineStyle(14, 0x00FFFF, 0.3);
                    graphics.beginPath();
                    graphics.moveTo(24, 32);
                    graphics.lineTo(88, 32);
                    graphics.strokePath();

                } else if (type.name === "ブッチャーナイフ") {
                    // ブッチャーナイフ: 巨大包丁、無骨

                    // 柄: 木製
                    graphics.fillStyle(0x8B4513, 1);
                    graphics.fillRect(0, 28, 20, 8);
                    // リベット
                    graphics.fillStyle(0xDAA520, 1);
                    graphics.fillCircle(10, 32, 2);

                    // 刃: 巨大な長方形
                    graphics.fillStyle(0x696969, 1); // 濃い灰色
                    graphics.beginPath();
                    graphics.moveTo(20, 20);
                    graphics.lineTo(82, 20); // 上端
                    graphics.lineTo(82, 44); // 先端（垂直に近い）
                    graphics.lineTo(20, 44); // 下端
                    graphics.closePath();
                    graphics.fillPath();

                    // 刃先（明るい研ぎ跡）
                    graphics.fillStyle(0xA9A9A9, 1);
                    graphics.beginPath();
                    graphics.moveTo(20, 40);
                    graphics.lineTo(82, 40);
                    graphics.lineTo(82, 44);
                    graphics.lineTo(20, 44);
                    graphics.closePath();
                    graphics.fillPath();

                    // 穴（フック用）- 黒で表現
                    graphics.fillStyle(0x1a1a1a, 1); // 背景色に近い黒
                    graphics.fillCircle(72, 28, 6);

                    // 血痕
                    graphics.fillStyle(0x8B0000, 0.7);
                    graphics.fillCircle(50, 32, 4);
                    graphics.fillCircle(65, 42, 3);
                    graphics.fillCircle(30, 25, 2);

                } else if (type.name === "クリスタルエッジ") {
                    // クリスタルエッジ: 結晶の剣

                    // 柄: 金色で優雅
                    graphics.fillStyle(0xFFD700, 1);
                    graphics.fillRect(0, 29, 16, 6);

                    // ガード: 結晶の塊
                    graphics.fillStyle(0xFF69B4, 1); // Hot Pink
                    graphics.beginPath();
                    graphics.moveTo(16, 32);
                    graphics.lineTo(20, 20);
                    graphics.lineTo(24, 32);
                    graphics.lineTo(20, 44);
                    graphics.closePath();
                    graphics.fillPath();

                    // 刃: 多面体の結晶

                    // 上面（明るいピンク）
                    graphics.fillStyle(0xFFB6C1, 0.9); // Light Pink
                    graphics.beginPath();
                    graphics.moveTo(20, 32);
                    graphics.lineTo(50, 20);
                    graphics.lineTo(88, 32);
                    graphics.closePath();
                    graphics.fillPath();

                    // 下面（濃いピンク）
                    graphics.fillStyle(0xC71585, 0.9); // Medium Violet Red
                    graphics.beginPath();
                    graphics.moveTo(20, 32);
                    graphics.lineTo(50, 44);
                    graphics.lineTo(88, 32);
                    graphics.closePath();
                    graphics.fillPath();

                    // 中央稜線とエッジのハイライト
                    graphics.lineStyle(1, 0xFFFFFF, 0.7);
                    graphics.beginPath();
                    graphics.moveTo(20, 32);
                    graphics.lineTo(88, 32); // 中央線
                    graphics.strokePath();

                    graphics.beginPath();
                    graphics.moveTo(20, 32);
                    graphics.lineTo(50, 20);
                    graphics.lineTo(88, 32);
                    graphics.lineTo(50, 44);
                    graphics.lineTo(20, 32);
                    graphics.strokePath();

                    // キラキラ粒子
                    graphics.fillStyle(0xFFFFFF, 0.9);
                    graphics.fillCircle(40, 28, 1.5);
                    graphics.fillCircle(70, 36, 1.5);
                    graphics.fillCircle(60, 32, 2);

                } else if (type.name === "ヴォイド・カッター") {
                    // ヴォイド・カッター: 虚空の刃 (Void Cutter)
                    // テーマ: 黒、紫、次元の裂け目

                    // 柄: 黒曜石のような質感
                    graphics.fillStyle(0x101010, 1);
                    graphics.fillRect(0, 28, 16, 8);

                    // ガード: 歪んだ空間
                    graphics.fillStyle(0x220022, 1);
                    graphics.beginPath();
                    graphics.moveTo(16, 24);
                    graphics.lineTo(24, 16);
                    graphics.lineTo(20, 32);
                    graphics.lineTo(24, 48);
                    graphics.lineTo(16, 40);
                    graphics.closePath();
                    graphics.fillPath();

                    // 刃: 空間を切り裂くような鋭利な形状
                    // 本体は深い紫
                    graphics.fillStyle(0x1a0033, 1);
                    graphics.beginPath();
                    graphics.moveTo(20, 26);
                    graphics.lineTo(50, 24);
                    graphics.lineTo(80, 20); // 先端が少し上向く
                    graphics.lineTo(90, 32); // 鋭い切っ先
                    graphics.lineTo(70, 40);
                    graphics.lineTo(40, 36);
                    graphics.lineTo(20, 38);
                    graphics.closePath();
                    graphics.fillPath();

                    // ヴォイドエフェクト（粒子）
                    graphics.fillStyle(0x9400D3, 1); // DarkViolet
                    graphics.fillCircle(40, 28, 2);
                    graphics.fillCircle(60, 30, 3);
                    graphics.fillCircle(80, 25, 2);

                    // 裂け目（シアン色のライン）
                    graphics.lineStyle(1, 0x00FFFF, 0.8);
                    graphics.beginPath();
                    graphics.moveTo(25, 30);
                    graphics.lineTo(55, 30);
                    graphics.lineTo(85, 28);
                    graphics.strokePath();

                } else if (type.name === "ギア・ブレード") {
                    // ギア・ブレード: 機巧の剣 (Gear Blade)
                    // テーマ: スチームパンク、歯車、蒸気

                    // 柄: 銅パイプ風
                    graphics.fillStyle(0x8B4513, 1);
                    graphics.fillRect(0, 28, 20, 8);
                    // 銅のリング
                    graphics.fillStyle(0xB87333, 1); // Copper
                    graphics.fillRect(5, 28, 3, 8);
                    graphics.fillRect(12, 28, 3, 8);

                    // ガード: 巨大な歯車
                    graphics.fillStyle(0xCD7F32, 1); // Bronze
                    graphics.fillCircle(24, 32, 12);
                    graphics.fillStyle(0x000000, 1);
                    graphics.fillCircle(24, 32, 4); // 中心穴
                    // 歯車の歯
                    graphics.fillStyle(0xCD7F32, 1);
                    for(let i=0; i<8; i++) {
                        const angle = (i / 8) * Math.PI * 2;
                        const x = 24 + Math.cos(angle) * 14;
                        const y = 32 + Math.sin(angle) * 14;
                        graphics.fillCircle(x, y, 3);
                    }

                    // 刃: チェーンソーのようなノコギリ刃
                    graphics.fillStyle(0x708090, 1); // SlateGray
                    graphics.fillRect(30, 26, 50, 12);

                    // 刃のギザギザ
                    graphics.fillStyle(0xA9A9A9, 1); // DarkGray
                    for(let i=0; i<6; i++) {
                        graphics.beginPath();
                        graphics.moveTo(35 + i*8, 26);
                        graphics.lineTo(39 + i*8, 20);
                        graphics.lineTo(43 + i*8, 26);
                        graphics.closePath();
                        graphics.fillPath();
                    }

                    // 排気パイプ
                    graphics.fillStyle(0xB87333, 1);
                    graphics.fillRect(35, 30, 40, 4);



                } else if (type.name === "ぎれいけん") {
                    // ぎれいけん: 光り輝く神聖な直剣

                    // 柄: 純金
                    graphics.fillStyle(0xFFD700, 1);
                    graphics.fillRect(0, 29, 16, 6);

                    // ガード: 黄金の輪と幾何学模様
                    graphics.lineStyle(2, 0xFFD700, 1);
                    graphics.strokeCircle(20, 32, 10);
                    graphics.fillStyle(0xFFFFFF, 1);
                    graphics.fillCircle(20, 32, 4);

                    // 刃: 光の剣身（文字が浮いているイメージ）
                    // インナー
                    graphics.fillStyle(0xFFFACD, 0.9); // LemonChiffon
                    graphics.beginPath();
                    graphics.moveTo(24, 26);
                    graphics.lineTo(80, 26);
                    graphics.lineTo(85, 32);
                    graphics.lineTo(80, 38);
                    graphics.lineTo(24, 38);
                    graphics.closePath();
                    graphics.fillPath();

                    // アウターグロー
                    graphics.lineStyle(2, 0xFFA500, 0.5); // Orange
                    graphics.strokeRect(26, 28, 50, 8);

                    // 幾何学模様（ルーン文字風）
                    graphics.fillStyle(0xDAA520, 1); // GoldenRod
                    graphics.fillRect(30, 30, 4, 4);
                    graphics.fillRect(40, 30, 4, 4);
                    graphics.fillRect(50, 30, 4, 4);
                    graphics.fillRect(60, 30, 4, 4);
                    graphics.fillRect(70, 30, 4, 4);

                    // 聖なる輝き
                    graphics.fillStyle(0xFFFFFF, 0.8);
                    graphics.fillCircle(85, 32, 3);
                    graphics.fillCircle(20, 20, 2);
                    graphics.fillCircle(20, 44, 2);



                } else if (type.name === "さびたけん") {
                    // さびたけん: 刃こぼれと錆

                    // 柄: 古びた木
                    graphics.fillStyle(0x5D4037, 1);
                    graphics.fillRect(0, 28, 16, 8);

                    // ガード: 錆びた鉄
                    graphics.fillStyle(0x8B4513, 1); // SaddleBrown
                    graphics.fillRect(16, 22, 4, 20);

                    // 刃: 錆びた金属
                    graphics.fillStyle(0xA0522D, 1); // Sienna (Rust color)
                    graphics.beginPath();
                    graphics.moveTo(20, 26);
                    graphics.lineTo(50, 26);
                    graphics.lineTo(55, 30); // 欠けた先端
                    graphics.lineTo(50, 38);
                    graphics.lineTo(20, 38);
                    graphics.closePath();
                    graphics.fillPath();

                    // 刃こぼれ（背景色で描画して削る）
                    // PhaserのGraphicsで消しゴムは難しいので、暗い色で描く
                    graphics.fillStyle(0x000000, 1); // 背景に馴染ませる黒
                    graphics.beginPath();
                    graphics.moveTo(30, 26); graphics.lineTo(32, 29); graphics.lineTo(34, 26); // 上の欠け
                    graphics.moveTo(40, 38); graphics.lineTo(42, 35); graphics.lineTo(44, 38); // 下の欠け
                    graphics.fillPath();

                } else if (type.name === "てつのけん") {
                    // てつのけん: 標準的な剣

                    // 柄
                    graphics.fillStyle(0x8B4513, 1);
                    graphics.fillRect(0, 28, 16, 8);

                    // ガード
                    graphics.fillStyle(0xC0C0C0, 1); // Silver
                    graphics.fillRect(16, 20, 6, 24);

                    // 刃
                    graphics.fillStyle(0xD3D3D3, 1); // LightGray
                    graphics.beginPath();
                    graphics.moveTo(22, 24);
                    graphics.lineTo(65, 32); // Tip
                    graphics.lineTo(22, 40);
                    graphics.closePath();
                    graphics.fillPath();

                    // 溝
                    graphics.lineStyle(1, 0xA9A9A9, 1);
                    graphics.beginPath();
                    graphics.moveTo(22, 32);
                    graphics.lineTo(55, 32);
                    graphics.strokePath();

                } else if (type.name === "はがねのつるぎ") {
                    // はがねのつるぎ: 長く洗練された剣

                    // 柄: 黒革
                    graphics.fillStyle(0x2F4F4F, 1);
                    graphics.fillRect(0, 28, 18, 8);

                    // ガード: V字型
                    graphics.fillStyle(0x708090, 1); // SlateGray
                    graphics.beginPath();
                    graphics.moveTo(18, 32);
                    graphics.lineTo(24, 16);
                    graphics.lineTo(28, 18); // 厚み
                    graphics.lineTo(22, 32);
                    graphics.lineTo(28, 46);
                    graphics.lineTo(24, 48);
                    graphics.closePath();
                    graphics.fillPath();

                    // 刃: 青みがかった鋼
                    graphics.fillStyle(0xB0C4DE, 1); // LightSteelBlue
                    graphics.beginPath();
                    graphics.moveTo(22, 26);
                    graphics.lineTo(80, 28); // 長い
                    graphics.lineTo(85, 32); // 鋭い先端
                    graphics.lineTo(80, 36);
                    graphics.lineTo(22, 38);
                    graphics.closePath();
                    graphics.fillPath();

                    // ハイライト
                    graphics.lineStyle(1, 0xFFFFFF, 0.6);
                    graphics.beginPath();
                    graphics.moveTo(22, 26);
                    graphics.lineTo(80, 28);
                    graphics.strokePath();

                } else {
                    // デフォルト

                    // Handle
                    graphics.fillStyle(0x8B4513, 1); // Brown handle
                    graphics.fillRect(0, 28, 16, 8);

                    // Guard
                    graphics.fillStyle(0xDAA520, 1); // Gold guard
                    graphics.fillRect(16, 20, 6, 24);

                    // Blade
                    graphics.fillStyle(type.color, 1);
                    // Tapered blade
                    graphics.beginPath();
                    graphics.moveTo(22, 24);
                    graphics.lineTo(60, 32); // Tip
                    graphics.lineTo(22, 40);
                    graphics.closePath();
                    graphics.fillPath();

                    // Detail line
                    graphics.lineStyle(1, 0xFFFFFF, 0.5);
                    graphics.beginPath();
                    graphics.moveTo(22, 32);
                    graphics.lineTo(58, 32);
                    graphics.strokePath();
                }

                let texWidth = 96;
                if (type.name === "ざんげつ") texWidth = 96; // Allow extra long blades
                if (type.name === "はがねのつるぎ") texWidth = 128; 

                graphics.generateTexture(type.texture, texWidth, 64);
                graphics.destroy();
            }
        });

        Object.values(SHIELD_TYPES).forEach(shield => {
            if (!shield.texture) return;
            if (!this.textures.exists(shield.texture)) {
                const g = this.make.graphics({x: 0, y: 0, add: false});
                const size = 32;
                const cx = size / 2;
                const cy = size / 2;
                if (shield.texture === "shield_iron") {
                    g.fillStyle(0x555555, 1);
                    g.fillCircle(cx, cy, 12);
                    g.lineStyle(2, 0xaaaaaa, 1);
                    g.strokeCircle(cx, cy, 12);
                    g.fillStyle(0xcccccc, 1);
                    g.fillCircle(cx, cy, 3);
                } else if (shield.texture === "shield_round") {
                    g.fillStyle(0x5d4037, 1);
                    g.fillCircle(cx, cy, 12);
                    g.lineStyle(2, 0x3e2723, 1);
                    g.strokeCircle(cx, cy, 12);
                    g.lineStyle(2, 0x8d6e63, 1);
                    g.beginPath();
                    g.moveTo(cx - 10, cy);
                    g.lineTo(cx + 10, cy);
                    g.moveTo(cx, cy - 10);
                    g.lineTo(cx, cy + 10);
                    g.strokePath();
                } else if (shield.texture === "shield_kite") {
                    g.fillStyle(0x455a64, 1);
                    g.beginPath();
                    g.moveTo(cx, cy - 12);
                    g.lineTo(cx - 10, cy);
                    g.lineTo(cx, cy + 14);
                    g.lineTo(cx + 10, cy);
                    g.closePath();
                    g.fillPath();
                    g.lineStyle(2, 0xb0bec5, 1);
                    g.beginPath();
                    g.moveTo(cx, cy - 12);
                    g.lineTo(cx, cy + 14);
                    g.strokePath();
                } else if (shield.texture === "shield_buckler") {
                    g.fillStyle(0x616161, 1);
                    g.fillCircle(cx, cy, 8);
                    g.lineStyle(2, 0xbdbdbd, 1);
                    g.strokeCircle(cx, cy, 8);
                    g.fillStyle(0x212121, 1);
                    g.fillCircle(cx, cy, 3);
                } else if (shield.texture === "shield_tower") {
                    g.fillStyle(0x37474f, 1);
                    g.fillRect(cx - 8, cy - 12, 16, 24);
                    g.fillStyle(0x263238, 1);
                    g.fillRect(cx - 6, cy - 10, 12, 20);
                    g.lineStyle(2, 0x90a4ae, 1);
                    g.strokeRect(cx - 8, cy - 12, 16, 24);
                } else if (shield.texture === "shield_silver") {
                    g.fillStyle(0xcfd8dc, 1);
                    g.fillCircle(cx, cy, 11);
                    g.lineStyle(2, 0xffffff, 1);
                    g.strokeCircle(cx, cy, 11);
                    g.lineStyle(2, 0x90caf9, 0.7);
                    g.beginPath();
                    g.arc(cx, cy - 2, 8, -Math.PI / 2, Math.PI / 2, false);
                    g.strokePath();
                } else if (shield.texture === "shield_mist") {
                    g.fillStyle(0x263238, 1);
                    g.fillCircle(cx, cy, 11);
                    g.fillStyle(0xffffff, 0.15);
                    for (let i = 0; i < 6; i++) {
                        const r = 6 + i;
                        g.fillCircle(cx + i - 3, cy - i + 2, r);
                    }
                } else if (shield.texture === "shield_rusty") {
                    g.fillStyle(0x4e342e, 1);
                    g.fillCircle(cx, cy, 11);
                    g.lineStyle(2, 0x3e2723, 1);
                    g.strokeCircle(cx, cy, 11);
                    g.fillStyle(0x6d4c41, 1);
                    g.fillCircle(cx - 4, cy - 2, 3);
                    g.fillCircle(cx + 3, cy + 2, 2);
                    g.fillCircle(cx + 5, cy - 3, 2);
                } else if (shield.texture === "shield_executioner") {
                    g.fillStyle(0x212121, 1);
                    g.fillRect(cx - 7, cy - 11, 14, 22);
                    g.fillStyle(0xb71c1c, 1);
                    g.fillRect(cx - 2, cy - 11, 4, 22);
                    g.fillStyle(0xffebee, 0.5);
                    g.fillCircle(cx + 4, cy + 5, 2);
                } else if (shield.texture === "shield_crystal") {
                    g.fillStyle(0x00bcd4, 1);
                    g.beginPath();
                    g.moveTo(cx, cy - 11);
                    g.lineTo(cx - 8, cy);
                    g.lineTo(cx, cy + 11);
                    g.lineTo(cx + 8, cy);
                    g.closePath();
                    g.fillPath();
                    g.lineStyle(2, 0xe0f7fa, 1);
                    g.beginPath();
                    g.moveTo(cx, cy - 11);
                    g.lineTo(cx, cy + 11);
                    g.strokePath();
                } else {
                    g.fillStyle(0x757575, 1);
                    g.fillCircle(cx, cy, 10);
                }
                g.generateTexture(shield.texture, size, size);
                g.destroy();
            }
        });

        // Gold Textures
        if (!this.textures.exists('gold_small')) {
            const g = this.make.graphics({x: 0, y: 0, add: false});
            g.setVisible(false);
            g.fillStyle(0xffd700, 1);
            g.fillRect(0, 0, 4, 4);
            g.generateTexture('gold_small', 4, 4);
            g.destroy();
        }
        if (!this.textures.exists('gold_medium')) {
            const g = this.make.graphics({x: 0, y: 0, add: false});
            g.setVisible(false);
            g.fillStyle(0xffd700, 1);
            g.fillRect(0, 0, 8, 8);
            g.generateTexture('gold_medium', 8, 8);
            g.destroy();
        }
        if (!this.textures.exists('gold_large')) {
            const g = this.make.graphics({x: 0, y: 0, add: false});
            g.setVisible(false);
            g.fillStyle(0xffd700, 1);
            g.fillRect(0, 0, 12, 12);
            g.generateTexture('gold_large', 12, 12);
            g.destroy();
        }



        // --- Giant Rat (Tiny Enemy) ---
        createRatTextures(this);
        if (false && !this.textures.exists('rat_idle_0')) {
            const genRat = (key, opts) => {
                const w = 64;
                const h = 32;
                const g = this.make.graphics({x: 0, y: 0, add: false});

                const by = opts.by || 0;
                const bx = opts.bx || 0; 
                const phase = opts.phase || 'idle'; // idle, windup, lunge

                const cFur = opts.fur || 0x4E342E; // Dark Brown
                const cSkin = 0xD7CCC8; // Pale Pinkish
                const cEye = 0xFF0000; // Red

                const ox = 16 + bx;
                const oy = 8 + by;

                // Shadow (Ground level)
                if (phase === 'lunge') {
                    g.fillStyle(0x000000, 0.3);
                    g.fillEllipse(32+ox, 32+by+10, 16, 6); // Shadow stays down relative to jump
                }

                // Tail
                g.lineStyle(2, cSkin, 1);
                if (phase === 'lunge') {
                    // Straight tail for speed
                    g.beginPath();
                    g.moveTo(10+ox, 18+oy);
                    g.lineTo(-5+ox, 18+oy);
                    g.strokePath();
                } else if (phase === 'windup') {
                    // Coiled tail
                     const start = new Phaser.Math.Vector2(10+ox, 18+oy);
                     const control = new Phaser.Math.Vector2(10+ox, 24+oy);
                     const end = new Phaser.Math.Vector2(0+ox, 20+oy);
                     const curve = new Phaser.Curves.QuadraticBezier(start, control, end);
                     g.strokePoints(curve.getPoints(8));
                } else {
                    // Normal tail
                    const start = new Phaser.Math.Vector2(10+ox, 18+oy);
                    const control = new Phaser.Math.Vector2(0+ox, 18+oy);
                    const end = new Phaser.Math.Vector2(-5+ox, 8+oy);
                    const curve = new Phaser.Curves.QuadraticBezier(start, control, end);
                    g.strokePoints(curve.getPoints(8));
                }

                // Body
                g.fillStyle(cFur, 1);
                if (phase === 'lunge') {
                    // Stretched
                    g.fillEllipse(20+ox, 16+oy, 20, 7); 
                } else if (phase === 'windup') {
                     // Squashed
                     g.fillEllipse(20+ox, 19+oy, 16, 10);
                } else {
                    // Normal
                    g.fillEllipse(20+ox, 16+oy, 14, 9);
                }

                // Head
                g.fillStyle(cFur, 1);
                if (phase === 'lunge') {
                     g.fillEllipse(34+ox, 16+oy, 9, 6); // Head forward
                } else if (phase === 'windup') {
                     g.fillEllipse(28+ox, 18+oy, 7, 7); // Head tucked
                } else {
                     g.fillEllipse(30+ox, 15+oy, 7, 6);
                }

                // Ears
                g.fillStyle(cSkin, 1);
                if (phase === 'lunge') {
                     // Ears back
                     g.fillCircle(28+ox, 14+oy, 2.5);
                     g.fillCircle(30+ox, 12+oy, 2.5);
                } else {
                     g.fillCircle(28+ox, 11+oy, 2.5);
                     g.fillCircle(32+ox, 11+oy, 2.5);
                }

                // Eyes (Glowing Red)
                g.fillStyle(cEye, 1);
                if (phase === 'lunge') {
                     // Big crazy eye
                     g.fillCircle(35+ox, 14+oy, 2.5);
                } else if (phase === 'windup') {
                     g.fillCircle(29+ox, 17+oy, 1.5);
                } else {
                     g.fillCircle(31+ox, 14+oy, 1.5);
                }

                // Snout/Nose
                g.fillStyle(cSkin, 1);
                if (phase === 'lunge') {
                     g.fillCircle(42+ox, 17+oy, 1.5);
                } else if (phase === 'windup') {
                     g.fillCircle(32+ox, 20+oy, 1);
                } else {
                     g.fillCircle(36+ox, 16+oy, 1);
                }

                // Attack: Mouth/Teeth
                if (phase === 'lunge') {
                     g.fillStyle(0xFFFFFF, 1);
                     // Teeth
                     g.beginPath();
                     g.moveTo(38+ox, 18+oy);
                     g.lineTo(44+ox, 18+oy);
                     g.lineTo(41+ox, 22+oy); // Sharp fang
                     g.fillPath();

                     // Open Jaw
                     g.fillStyle(0x000000, 1);
                     g.fillRect(38+ox, 19+oy, 5, 2);
                }

                // Legs
                g.fillStyle(cSkin, 1);
                if (phase === 'lunge') {
                     // Flying legs
                     g.fillRect(20+ox, 22+oy, 6, 2); // Back
                     g.fillRect(36+ox, 22+oy, 6, 2); // Front
                } else if (phase === 'windup') {
                     // Crouched legs
                     g.fillRect(24+ox, 24+oy, 3, 2);
                     g.fillRect(16+ox, 24+oy, 3, 2);
                } else {
                     g.fillRect(26+ox, 22+oy, 2, 3);
                     g.fillRect(30+ox, 22+oy, 2, 3);
                     g.fillRect(14+ox, 22+oy, 2, 3);
                     g.fillRect(18+ox, 22+oy, 2, 3);
                }

                g.generateTexture(key, w, h);
                g.destroy();
            };

            genRat('rat_idle_0', { by: 0 });
            genRat('rat_idle_1', { by: -1 });

            // Move
            genRat('rat_move_0', { by: 0 });
            genRat('rat_move_1', { by: -2 });
            genRat('rat_move_2', { by: 0 });
            genRat('rat_move_3', { by: -2 });

            // Attack
            // 0: Windup (Squash, prepare)
            genRat('rat_attack_0', { by: 2, bx: -4, phase: 'windup' });
            // 1: Lunge (Stretch, bite)
            genRat('rat_attack_1', { by: -16, bx: 8, phase: 'lunge' });
            // 2: Recover
            genRat('rat_attack_2', { by: 0 });

            // Hit
            genRat('rat_hit_0', { by: 0, fur: 0x6d4c41 });
            genRat('rat_hit_1', { by: -1, fur: 0x5d4037 });

            // Death
            genRat('rat_death_0', { by: 0, fur: 0x3e2723 });
            genRat('rat_death_1', { by: 2, fur: 0x271c19 });
            genRat('rat_death_2', { by: 4, fur: 0x1a1210 });

            this.anims.create({
                key: 'rat_idle',
                frames: [{ key: 'rat_idle_0' }, { key: 'rat_idle_1' }],
                frameRate: 6,
                repeat: -1
            });

            this.anims.create({
                key: 'rat_move',
                frames: [
                    { key: 'rat_move_0' },
                    { key: 'rat_move_1' },
                    { key: 'rat_move_2' },
                    { key: 'rat_move_3' }
                ],
                frameRate: 10,
                repeat: -1
            });

            this.anims.create({
                key: 'rat_attack',
                frames: [
                    { key: 'rat_attack_0', duration: 400 }, // Long windup
                    { key: 'rat_attack_1', duration: 150 }, // Fast lunge
                    { key: 'rat_attack_2', duration: 100 }  // Quick recover
                ],
                frameRate: 10
            });

            this.anims.create({
                key: 'rat_hit',
                frames: [
                    { key: 'rat_hit_0' },
                    { key: 'rat_hit_1' }
                ],
                frameRate: 10
            });

            this.anims.create({
                key: 'rat_death',
                frames: [
                    { key: 'rat_death_0' },
                    { key: 'rat_death_1' },
                    { key: 'rat_death_2' }
                ],
                frameRate: 6
            });
        }

        if (!this.textures.exists('goblin_idle_0')) {
            const genGoblin = (key, opts) => {
                const w = 64;
                const h = 32;
                const ox = 16;

                const g = this.make.graphics({x: 0, y: 0, add: false});
                const by = (opts.by || 0) * 2;

                const cBase = opts.base || 0x9E9E9E;
                const cShadow = opts.shadow || 0x616161;
                const cEye = opts.eye || 0xFFFFFF;
                const cCloth = opts.cloth || 0x212121;
                const cSpearWood = opts.spearWood || 0x4E342E;
                const cSpearHead = opts.spearHead || 0x757575;

                // Origin offset
                const oy = by;

                // Helper to rotate point
                const r = (lx, ly, deg, cx, cy) => {
                    const rad = Phaser.Math.DegToRad(deg);
                    const cos = Math.cos(rad);
                    const sin = Math.sin(rad);
                    return {
                        x: cx + lx * cos - ly * sin,
                        y: cy + lx * sin + ly * cos
                    };
                };

                // --- Saw-Toothed Halberd Logic ---
                const attackPhase = opts.attackPhase; // 0: Windup, 1: Thrust, 2: Recover

                // Weapon Angle & Position
                let wAngle = -10; // Resting
                let wx = 22 + ox;
                let wy = 16 + oy;

                if (attackPhase === 0) {
                    wAngle = -45; // Windup
                } else if (attackPhase === 1) {
                    wAngle = 10; // Slash
                    wx += 8;
                }

                // Draw Weapon Function
                const drawWeapon = () => {
                     // Shaft
                     g.lineStyle(2, cSpearWood, 1);
                     g.beginPath();
                     const p1 = r(0, -20, wAngle, wx, wy);
                     const p2 = r(0, 20, wAngle, wx, wy);
                     g.moveTo(p1.x, p1.y);
                     g.lineTo(p2.x, p2.y);
                     g.strokePath();

                     // Blade (Saw)
                     g.fillStyle(cSpearHead, 1);
                     g.beginPath();
                     // Base of blade
                     const bBase = r(0, -15, wAngle, wx, wy);
                     g.moveTo(bBase.x, bBase.y);

                     // Serrated Edge
                     // Out 1
                     const bOut1 = r(6, -18, wAngle, wx, wy);
                     g.lineTo(bOut1.x, bOut1.y);
                     // In 1
                     const bIn1 = r(2, -20, wAngle, wx, wy);
                     g.lineTo(bIn1.x, bIn1.y);
                     // Out 2
                     const bOut2 = r(6, -22, wAngle, wx, wy);
                     g.lineTo(bOut2.x, bOut2.y);
                     // Tip
                     const bTip = r(0, -25, wAngle, wx, wy);
                     g.lineTo(bTip.x, bTip.y);

                     g.closePath();
                     g.fillPath();
                };

                g.fillStyle(cCloth, 1);
                g.fillRect(10 + ox, 14 + oy, 12, 12);

                g.fillStyle(cBase, 1);
                g.fillRect(8 + ox, 4 + oy, 14, 12);

                g.fillStyle(cShadow, 1);
                g.fillRect(8 + ox, 10 + oy, 14, 2);

                g.fillStyle(0x000000, 1);
                g.fillRect(12 + ox, 10 + oy, 4, 2);

                g.fillStyle(cEye, 1);
                g.fillRect(12 + ox, 8 + oy, 2, 2);
                g.fillRect(16 + ox, 8 + oy, 2, 2);

                // --- Arms ---
                g.fillStyle(cBase, 1); // Skin arms
                g.fillRect(8 + ox, 16 + oy, 4, 8); // Left Arm

                // Right Arm (holding weapon)
                g.fillRect(20 + ox, 16 + oy, 4, 8); 

                // Legs
                g.fillStyle(cCloth, 1); // Pants
                g.fillRect(10 + ox, 26 + oy, 4, 6);
                g.fillRect(16 + ox, 26 + oy, 4, 6);

                // Boots
                g.fillStyle(0x000000, 1);
                g.fillRect(10 + ox, 30 + oy, 4, 2);
                g.fillRect(16 + ox, 30 + oy, 4, 2);

                // Weapon
                drawWeapon();

                g.generateTexture(key, w, h);
                g.destroy();
            };

            genGoblin('goblin_idle_0', { by: 0 });
            genGoblin('goblin_idle_1', { by: -1 });
            genGoblin('goblin_move_0', { by: 0 });
            genGoblin('goblin_move_1', { by: -1 });
            genGoblin('goblin_move_2', { by: 0 });
            genGoblin('goblin_move_3', { by: -1 });

            genGoblin('goblin_attack_0', { by: 0, attackPhase: 0 });
            genGoblin('goblin_attack_1', { by: 1, attackPhase: 1 }); 
            genGoblin('goblin_attack_2', { by: 0, attackPhase: 2 });

            genGoblin('goblin_hit_0', { by: 0, base: 0x808080 });
            genGoblin('goblin_hit_1', { by: -1, base: 0x707070 });
            genGoblin('goblin_death_0', { by: 0, base: 0x606060 });
            genGoblin('goblin_death_1', { by: -1, base: 0x505050 });
            genGoblin('goblin_death_2', { by: 0, base: 0x404040 });

            genGoblin('goblin_green_idle_0', { by: 0, base: 0x66bb6a, shadow: 0x2e7d32, eye: 0xffffcc, cloth: 0x4e342e, spearWood: 0x8d6e63, spearHead: 0xb0bec5 });
            genGoblin('goblin_green_idle_1', { by: -1, base: 0x66bb6a, shadow: 0x2e7d32, eye: 0xffffcc, cloth: 0x4e342e, spearWood: 0x8d6e63, spearHead: 0xb0bec5 });
            genGoblin('goblin_green_move_0', { by: 0, base: 0x66bb6a, shadow: 0x2e7d32, eye: 0xffffcc, cloth: 0x4e342e, spearWood: 0x8d6e63, spearHead: 0xb0bec5 });
            genGoblin('goblin_green_move_1', { by: -1, base: 0x66bb6a, shadow: 0x2e7d32, eye: 0xffffcc, cloth: 0x4e342e, spearWood: 0x8d6e63, spearHead: 0xb0bec5 });
            genGoblin('goblin_green_move_2', { by: 0, base: 0x66bb6a, shadow: 0x2e7d32, eye: 0xffffcc, cloth: 0x4e342e, spearWood: 0x8d6e63, spearHead: 0xb0bec5 });
            genGoblin('goblin_green_move_3', { by: -1, base: 0x66bb6a, shadow: 0x2e7d32, eye: 0xffffcc, cloth: 0x4e342e, spearWood: 0x8d6e63, spearHead: 0xb0bec5 });

            genGoblin('goblin_green_attack_0', { by: 0, attackPhase: 0, base: 0x66bb6a, shadow: 0x2e7d32, eye: 0xffffcc, cloth: 0x4e342e, spearWood: 0x8d6e63, spearHead: 0xb0bec5 });
            genGoblin('goblin_green_attack_1', { by: 1, attackPhase: 1, base: 0x66bb6a, shadow: 0x2e7d32, eye: 0xffffcc, cloth: 0x4e342e, spearWood: 0x8d6e63, spearHead: 0xb0bec5 }); 
            genGoblin('goblin_green_attack_2', { by: 0, attackPhase: 2, base: 0x66bb6a, shadow: 0x2e7d32, eye: 0xffffcc, cloth: 0x4e342e, spearWood: 0x8d6e63, spearHead: 0xb0bec5 });

            genGoblin('goblin_green_hit_0', { by: 0, base: 0x7ccc86, shadow: 0x388e3c, eye: 0xffffcc, cloth: 0x4e342e });
            genGoblin('goblin_green_hit_1', { by: -1, base: 0x6bbf7a, shadow: 0x2e7d32, eye: 0xffffcc, cloth: 0x4e342e });
            genGoblin('goblin_green_death_0', { by: 0, base: 0x4caf50, shadow: 0x2e7d32, eye: 0xcccccc, cloth: 0x4e342e });
            genGoblin('goblin_green_death_1', { by: -1, base: 0x388e3c, shadow: 0x1b5e20, eye: 0xaaaaaa, cloth: 0x4e342e });
            genGoblin('goblin_green_death_2', { by: 0, base: 0x2e7d32, shadow: 0x1b5e20, eye: 0x888888, cloth: 0x4e342e });

            // Spear projectile texture (optional, keep simple or update)
            if (!this.textures.exists('goblin_spear')) {
                const g = this.make.graphics({x: 0, y: 0, add: false});
                const L = 56; 
                const H = 6;  
                g.fillStyle(0x4E342E, 1);
                g.fillRect(0, (H-2)/2, L - 12, 2); // Shaft
                g.fillStyle(0x757575, 1); // Iron
                g.beginPath();
                g.moveTo(L - 12, 0); g.lineTo(L, H / 2); g.lineTo(L - 12, H);
                g.closePath();
                g.fillPath();
                g.generateTexture('goblin_spear', L, H);
                g.destroy();
            }

            this.anims.create({
                key: 'goblin_idle',
                frames: [{ key: 'goblin_idle_0' }, { key: 'goblin_idle_1' }],
                frameRate: 7,
                repeat: -1
            });
            this.anims.create({
                key: 'goblin_move',
                frames: [
                    { key: 'goblin_move_0' },
                    { key: 'goblin_move_1' },
                    { key: 'goblin_move_2' },
                    { key: 'goblin_move_3' }
                ],
                frameRate: 11,
                repeat: -1
            });
            this.anims.create({
                key: 'goblin_attack',
                frames: [
                    { key: 'goblin_attack_0' },
                    { key: 'goblin_attack_1' },
                    { key: 'goblin_attack_2' }
                ],
                frameRate: 8
            });
            this.anims.create({
                key: 'goblin_hit',
                frames: [
                    { key: 'goblin_hit_0' },
                    { key: 'goblin_hit_1' }
                ],
                frameRate: 10
            });
            this.anims.create({
                key: 'goblin_death',
                frames: [
                    { key: 'goblin_death_0' },
                    { key: 'goblin_death_1' },
                    { key: 'goblin_death_2' }
                ],
                frameRate: 6
            });

            this.anims.create({
                key: 'goblin_green_idle',
                frames: [{ key: 'goblin_green_idle_0' }, { key: 'goblin_green_idle_1' }],
                frameRate: 7,
                repeat: -1
            });
            this.anims.create({
                key: 'goblin_green_move',
                frames: [
                    { key: 'goblin_green_move_0' },
                    { key: 'goblin_green_move_1' },
                    { key: 'goblin_green_move_2' },
                    { key: 'goblin_green_move_3' }
                ],
                frameRate: 11,
                repeat: -1
            });
            this.anims.create({
                key: 'goblin_green_attack',
                frames: [
                    { key: 'goblin_green_attack_0' },
                    { key: 'goblin_green_attack_1' },
                    { key: 'goblin_green_attack_2' }
                ],
                frameRate: 8
            });
            this.anims.create({
                key: 'goblin_green_hit',
                frames: [
                    { key: 'goblin_green_hit_0' },
                    { key: 'goblin_green_hit_1' }
                ],
                frameRate: 10
            });
            this.anims.create({
                key: 'goblin_green_death',
                frames: [
                    { key: 'goblin_green_death_0' },
                    { key: 'goblin_green_death_1' },
                    { key: 'goblin_green_death_2' }
                ],
                frameRate: 6
            });
        }
        if (!this.textures.exists('normal_idle_0')) {
            const genSkeleton = (key, opts) => {
                const g = this.make.graphics({x: 0, y: 0, add: false});
                const by = opts.by || 0;
                const bone = opts.body || 0xf8f1e1;
                const shadow = opts.light || 0xd9cbb2;
                const eye = opts.eye || 0x00ffff;
                g.fillStyle(bone, 1);
                g.fillCircle(8, 4 + by, 3);
                g.fillStyle(0x111111, 1);
                g.fillCircle(6, 4 + by, 1);
                g.fillCircle(10, 4 + by, 1);
                g.fillStyle(eye, 0.7);
                g.fillCircle(6, 4 + by, 1);
                g.fillCircle(10, 4 + by, 1);
                g.fillStyle(bone, 1);
                g.fillRect(6, 6 + by, 4, 1);
                g.fillStyle(shadow, 1);
                g.fillRect(8, 7 + by, 1, 5);
                g.fillStyle(bone, 1);
                g.fillRect(5, 8 + by, 3, 1);
                g.fillRect(8, 8 + by, 3, 1);
                g.fillRect(5, 10 + by, 3, 1);
                g.fillRect(8, 10 + by, 3, 1);
                g.fillRect(3, 9 + by, 2, 2);
                g.fillRect(11, 9 + by, 2, 2);
                g.fillRect(6, 12 + by, 2, 2);
                g.fillRect(8, 12 + by, 2, 2);
                g.generateTexture(key, 16, 16);
                g.destroy();
            };
            genSkeleton('normal_idle_0', { by: 0 });
            genSkeleton('normal_idle_1', { by: -1 });
            genSkeleton('normal_move_0', { by: 0, light: 0xe3d8c3 });
            genSkeleton('normal_move_1', { by: -1, light: 0xcdbfa6 });
            genSkeleton('normal_move_2', { by: 0, light: 0xe3d8c3 });
            genSkeleton('normal_move_3', { by: -1, light: 0xcdbfa6 });
            genSkeleton('normal_attack_0', { by: 0, eye: 0x72ffff });
            genSkeleton('normal_attack_1', { by: -1, eye: 0xa0ffff });
            genSkeleton('normal_attack_2', { by: 0, eye: 0x00ffff });
            genSkeleton('normal_hit_0', { by: 0, body: 0xe6dccb });
            genSkeleton('normal_hit_1', { by: -1, body: 0xd6c8b0 });
            genSkeleton('normal_death_0', { by: 0, body: 0xbfb19a, light: 0xa89a84, eye: 0x006666 });
            genSkeleton('normal_death_1', { by: -1, body: 0x9f917b, light: 0x8a7d69, eye: 0x003333 });
            genSkeleton('normal_death_2', { by: 0, body: 0x6f6353, light: 0x5a5044, eye: 0x000000 });
            this.anims.create({
                key: 'normal_idle',
                frames: [{ key: 'normal_idle_0' }, { key: 'normal_idle_1' }],
                frameRate: 7,
                repeat: -1
            });
            this.anims.create({
                key: 'normal_move',
                frames: [
                    { key: 'normal_move_0' },
                    { key: 'normal_move_1' },
                    { key: 'normal_move_2' },
                    { key: 'normal_move_3' }
                ],
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: 'normal_attack',
                frames: [
                    { key: 'normal_attack_0' },
                    { key: 'normal_attack_1' },
                    { key: 'normal_attack_2' }
                ],
                frameRate: 8
            });
            this.anims.create({
                key: 'normal_hit',
                frames: [
                    { key: 'normal_hit_0' },
                    { key: 'normal_hit_1' }
                ],
                frameRate: 10
            });
            this.anims.create({
                key: 'normal_death',
                frames: [
                    { key: 'normal_death_0' },
                    { key: 'normal_death_1' },
                    { key: 'normal_death_2' }
                ],
                frameRate: 6
            });
        }
        // Gold Logic
        this.gold = 0;
        this.displayGold = 0;
        this.goldDrops = this.add.group({
            classType: GoldDrop,
            runChildUpdate: true,
            maxSize: 100
        });

        this.testRoomGrid = this.add.grid(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width,
            this.scale.height,
            32,
            32,
            0x000000,
            0,
            0x333333,
            1
        );
        this.testRoomGrid.setDepth(0);

        // 血痕・死体用のレイヤー（RenderTexture）は廃止し、スプライト配置に変更
        // this.bloodLayer = this.add.renderTexture(0, 0, 800, 600);
        // this.bloodLayer.setDepth(1);

        this.player = new Player(this, this.scale.width / 2, this.scale.height / 2);
        this.player.setDepth(2002);

        this.hud = new HUD(this, this.player);

        this.fogOverlay = this.add.image(this.scale.width / 2, this.scale.height / 2, 'forest_fog');
        this.fogOverlay.setScrollFactor(0);
        this.fogOverlay.setDepth(2500);
        this.fogOverlay.setAlpha(0.85);
        this.fogOverlay.setVisible(false);

        this.level = 1;
        this.isPortalActive = false;
        this.isInForest = false;
        this.loadGame();

        this.enemies = this.physics.add.group({
            classType: Enemy,
            runChildUpdate: true
        });

        // 宝箱グループ
        this.chests = this.physics.add.group({
            classType: Chest,
            runChildUpdate: true
        });

        // 肉片（Gore）用のグループ
        this.gores = this.physics.add.group();

        // 血しぶき（BloodDrop）用のグループ（非物理、Update用）
        this.bloodDrops = this.add.group({
            classType: BloodDrop,
            runChildUpdate: true
        });

        // Sparks Group
        this.sparks = this.add.group({
            classType: Spark,
            runChildUpdate: true,
            maxSize: 50
        });

        // Arrows Group
        this.arrows = this.physics.add.group({
            classType: Arrow,
            runChildUpdate: true
        });

        this.portals = this.physics.add.group({
            classType: Portal,
            runChildUpdate: true
        });

        this.exitGroup = this.physics.add.staticGroup();

        // Item Popup
        this.createItemPopups();

        // テストルーム用ボタンの設置
        this.createTestButtons();

        // 衝突判定
        this.physics.add.collider(this.player, this.enemies, null, (player, enemy) => {
            if (enemy.type === 'crow' && enemy.state === 'ATTACK') {
                return false;
            }
            return true;
        });
        this.physics.add.collider(this.items, this.items);
        this.physics.add.collider(this.items, this.walls);
        if (this.obstacles) {
            this.physics.add.collider(this.items, this.obstacles);
        }
        this.physics.add.collider(this.items, this.chests);

        // Item Pickup Overlap - Removed Auto Pickup
        // Manual pickup via Click or B button is handled elsewhere.

        this.physics.add.collider(this.enemies, this.enemies, null, (e1, e2) => {
            if ((e1.type === 'crow' && e1.state === 'ATTACK') || (e2.type === 'crow' && e2.state === 'ATTACK')) {
                return false;
            }
            return true;
        });

        // 宝箱は押せないようにStaticだが、プレイヤーが重ならないようにするならColliderが必要
        // ただし今回は「隣接」判定を自前でやっているので、物理的に止めるかどうかは好み。
        // 宝箱の上に乗れたりすると面白いが、とりあえず壁として扱う。
        this.physics.add.collider(this.player, this.chests);

        // 矢とプレイヤーの衝突
        this.physics.add.overlap(this.arrows, this.player, (player, arrow) => {
            if (arrow.active) {
                // ノックバック計算のためにarrowをsourceとして渡す
                // destroy前に呼ぶことで座標を参照できるようにする
                player.takeDamage(10, arrow); 
                arrow.destroy();
            }
        });

        // 矢と壁の衝突（画面外はArrowクラスで処理しているが、もし壁を作るならここ）

        this.physics.add.overlap(this.player, this.portals, (player, portal) => {
            if (this.isPortalActive) return; // Prevent multiple triggers
            this.isPortalActive = true;

            this.showText("Saving & Traveling...");
            this.saveGame();

            this.cameras.main.fade(500, 0, 0, 0);
            this.time.delayedCall(500, () => {
                this.scene.restart();
            });
        });

        this.physics.add.overlap(this.player, this.exitGroup, (player, exit) => {
            // Exit interaction is handled in update() based on player position and button input
        });

        // 攻撃判定（オーバーラップ）
        this.physics.add.overlap(this.player.attackHitboxes, this.enemies, (hitbox, enemy) => {
            if (hitbox.body.enable) {
                if (!enemy.invulnerable) {
                    // Calculate Base Damage
                    let baseDmg = 5; // Unarmed
                    if (this.player.equippedWeapon && this.player.equippedWeapon.attackPower) {
                        baseDmg = this.player.equippedWeapon.attackPower;
                    }

                    // Apply Random Variance (+/- 10%)
                    const variance = Math.floor(baseDmg * 0.1) + 1;
                    let dmg = Math.floor(baseDmg + Phaser.Math.Between(-variance, variance));
                    if (dmg < 1) dmg = 1;

                    // 覚醒時はダメージ1.5倍
                    if (this.player.isEmpowered) {
                        dmg = Math.floor(dmg * 1.5);
                    }

                    const critChance = typeof this.player.critChance === 'number' ? this.player.critChance : 0.1;
                    const isPlayerCritical = Math.random() < critChance;
                    if (isPlayerCritical) {
                        const critMul = 1.5 * (1 + (this.player.critDamageBonus || 0) / 100);
                        dmg = Math.floor(dmg * critMul);
                    }

                    // 攻撃タイプとヒットストップ時間を取得
                    const attackType = hitbox.attackType || this.player.attackType || 'light';
                    const customHitStop = hitbox.hitStopDuration !== undefined ? hitbox.hitStopDuration : 0;

                    // attackTypeを渡してヒットストップの時間を制御
                    if (this.player.isEmpowered && attackType.startsWith('light')) {
                        // 覚醒弱攻撃: ゆっくり多段ヒット (1ヒットあたりのダメージを下げて、連続ヒットさせる)
                        // ここでは簡易的に、1回のオーバーラップ判定で複数回ダメージを与える処理を行う
                        // ヒットストップと組み合わせて「ザクッ…ザクッ…」感を出す

                        const hitCount = 3;
                        const interval = 100; // ms
                        const damagePerHit = Math.ceil(dmg / 2); // ダメージは少し下げるが合計は増える

                        for(let i=0; i<hitCount; i++) {
                            this.time.delayedCall(i * interval, () => {
                                if (enemy.active && enemy.hp > 0) {
                                    // 多段ヒット時は個別のヒットストップを使用（あるいは分割）
                                    // ここではcustomHitStopがあればそれを使うが、多段なので少し短くするなどの調整も可
                                    // 今回はそのまま渡す
                                    enemy.takeDamage(damagePerHit, attackType, customHitStop, isPlayerCritical);
                                    // 毎回ヒットストップを入れることで「重い」感じを出す
                                    // 覚醒多段なので、個別のstopは少し短めにする（全体のテンポ維持のため）
                                    // ただしcustomHitStopが指定されている場合はそれを尊重する
                                    const stop = customHitStop > 0 ? customHitStop : 80;
                                    this.hitStop(stop); 
                                }
                            });
                        }

                        // 無敵時間を少し長めにとって、多段ヒット終了まで次の攻撃を受けないようにする
                        enemy.invulnerable = true;
                        this.time.delayedCall(interval * hitCount + 100, () => enemy.invulnerable = false);

                    } else {
                        // 通常処理
                        enemy.takeDamage(dmg, attackType, customHitStop, isPlayerCritical);

                        enemy.invulnerable = true;
                        this.time.delayedCall(300, () => enemy.invulnerable = false);
                    }

                    // 血のエフェクト計算
                    // 物理挙動っぽく、攻撃のベクトルに合わせて血を飛ばす
                    const angleToEnemy = Phaser.Math.Angle.Between(this.player.x, this.player.y, enemy.x, enemy.y);
                    let bloodAngle = angleToEnemy;
                    // 基本速度（勢いよく）
                    let speedMin = 150;
                    let speedMax = 350;
                    let spread = 30;

                    if (this.player.attackType === 'light') {
                        // 弱攻撃（時計回りスイング）
                        bloodAngle += Phaser.Math.DegToRad(45);
                        spread = 45; // 拡散広め
                    } else {
                        // 強攻撃（突き）
                        spread = 15; // 拡散狭め
                        speedMin = 250;
                        speedMax = 500; 
                    }

                    // パーティクルエミッターの代わりにBloodDropを生成
                    // 数を減らして、敵周辺に散らばるようにする
                    const dropCount = Phaser.Math.Between(8, 15);
                    for(let i=0; i<dropCount; i++) {
                        // get()は非アクティブなオブジェクトがあれば再利用し、なければ新規作成する
                        const drop = this.bloodDrops.get(enemy.x, enemy.y, 'blood');
                        if (drop) {
                            let angle, speed, zSpeed;

                            // 敵の周辺に小さい赤の四角を散らせて床に残す
                            // ほとんど（80%）は敵の足元周辺にポロポロ落ちる
                            if (Math.random() < 0.8) {
                                // 近くに落ちる
                                angle = Phaser.Math.FloatBetween(0, Math.PI * 2); // 全方向
                                speed = Phaser.Math.Between(10, 60); // 超低速
                                zSpeed = Phaser.Math.Between(30, 100); // ほとんど跳ねない
                            } else {
                                // 少しだけ飛ぶ（攻撃方向）
                                angle = bloodAngle + Phaser.Math.DegToRad(Phaser.Math.Between(-spread, spread));
                                speed = Phaser.Math.Between(speedMin * 0.5, speedMax * 0.5); // 速度も抑えめ
                                zSpeed = Phaser.Math.Between(100, 250);
                            }

                            // 座標を明示的に渡して初期化・起動
                            drop.launch(enemy.x, enemy.y, angle, speed, zSpeed);
                        }
                    }


                    // ノックバック (修正: takeKnockbackを使用)
                    // 多段ヒット中はノックバックさせない（最後のヒットで吹っ飛ぶようにするか、あるいは毎回少しずれるか）
                    // ここでは多段ヒット中もノックバックさせるが、ヒットストップで止まるので不自然ではないはず
                    if (enemy.body) {
                        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, enemy.x, enemy.y);
                        const baseForce = 300;
                        const extra = (this.player.knockbackBonus || 0) * 25;
                        const vec = new Phaser.Math.Vector2().setToPolar(angle, baseForce + extra);
                        enemy.takeKnockback(vec.x, vec.y, 250);
                    }
                }
            }
        });

        // デバッグ表示切り替え (F2)
        this.input.keyboard.on('keydown-F2', () => {
            if (this.physics.world.debugGraphic) {
                this.physics.world.debugGraphic.visible = !this.physics.world.debugGraphic.visible;
            } else {
                this.physics.world.createDebugGraphic();
            }
            this.showText(`Debug Mode: ${this.physics.world.debugGraphic.visible ? 'ON' : 'OFF'}`);
        });

        // P Key: Drop All Weapons
        this.input.keyboard.on('keydown-P', () => {
            // Drop Inventory Weapons
            for (let i = this.player.inventory.length - 1; i >= 0; i--) {
                const item = this.player.inventory[i];
                if (item.type === 'weapon') {
                     const drop = new ItemDrop(this, this.player.x, this.player.y + 20, item.type, item);
                     drop.setVelocity(Phaser.Math.Between(-150, 150), Phaser.Math.Between(-150, 150));
                     this.items.add(drop);
                     this.player.removeItemAtIndex(i);
                }
            }

            // Drop Equipped Weapon
            if (this.player.equippedWeapon) {
                const item = this.player.equippedWeapon;
                const drop = new ItemDrop(this, this.player.x, this.player.y + 20, item.type, item);
                drop.setVelocity(Phaser.Math.Between(-150, 150), Phaser.Math.Between(-150, 150));
                this.items.add(drop);

                this.player.equippedWeapon = null;
                this.player.applyEquippedWeapon(); 
                if (this.hud && this.hud.updateEquipmentSlots) {
                    this.hud.updateEquipmentSlots();
                }
            }

            this.showText("Dropped All Weapons!");
        });

        this.input.keyboard.on('keydown', (event) => {
            if (event.key !== '@') return;
            const centerX = 400;
            const centerY = 300;
            const entries = Object.entries(SHIELD_TYPES);
            for (const [id, shield] of entries) {
                if (!shield) continue;
                const typeId = parseInt(id, 10);
                const itemData = {
                    id: Date.now() + Math.random().toString(36).substr(2, 9),
                    typeId: typeId,
                    type: 'shield',
                    rarity: RARITY.NORMAL,
                    name: shield.name,
                    attackPower: 0,
                    attackSpeed: 0,
                    size: 1.0,
                    options: [],
                    hardness: shield.baseHardness,
                    thickness: shield.baseThickness,
                    weight: shield.baseWeight
                };
                const drop = new ItemDrop(this, centerX, centerY, 'shield', itemData);
                drop.setVelocity(Phaser.Math.Between(-150, 150), Phaser.Math.Between(-150, 150));
                this.items.add(drop);
            }
            this.showText("Dropped All Shields!");
        });

        // Item Info Popup
        this.itemPopup = this.add.container(0, 0);
        this.itemPopup.setDepth(10000); // Highest depth
        this.itemPopup.setVisible(false);

        const popupBg = this.add.graphics();
        popupBg.fillStyle(0x000000, 0.8);
        popupBg.fillRect(0, 0, 200, 110);
        this.itemPopup.add(popupBg);

        const popupName = this.add.text(10, 10, 'Name', { fontFamily: 'x10y12pxDonguriDuel', fontSize: '16px', color: '#ffffff' });
        this.itemPopup.add(popupName);
        this.itemPopup.popupName = popupName;

        const popupPower = this.add.text(10, 35, 'Power: 0', { fontFamily: 'x10y12pxDonguriDuel', fontSize: '16px', color: '#ffffff' });
        this.itemPopup.add(popupPower);
        this.itemPopup.popupPower = popupPower;

        const popupSpeed = this.add.text(10, 55, 'Speed: 0', { fontFamily: 'x10y12pxDonguriDuel', fontSize: '16px', color: '#ffffff' });
        this.itemPopup.add(popupSpeed);
        this.itemPopup.popupSpeed = popupSpeed;

        const popupSize = this.add.text(10, 75, 'Size: 0', { fontFamily: 'x10y12pxDonguriDuel', fontSize: '16px', color: '#ffffff' });
        this.itemPopup.add(popupSize);
        this.itemPopup.popupSize = popupSize;

        // this.infoText = this.add.text(10, 570, 'Press 1-4 to change weapon | F2: Debug', { fontFamily: 'x10y12pxDonguriDuel', fontSize: '16px', fill: '#fff' });
    }

    createTestButtons() {
        // 1段目: 左から 毒キノコ, 槍ゴブリン, 森のカラス, ハングドウィスプ, 石像兵, 盾持ち木兵
        this.createButton(96, 160, 0x66bb6a, '毒キノコ', () => {
            const x = Phaser.Math.Between(100, 700);
            const y = Phaser.Math.Between(100, 500);
            this.spawnEnemy(x, y, 'poison_mushroom');
            this.showText("Spawned: Poison Mushroom x1");
        });
        this.createButton(160, 160, 0x2e7d32, '槍ゴブリン', () => {
            const x = Phaser.Math.Between(100, 700);
            const y = Phaser.Math.Between(100, 500);
            this.spawnEnemy(x, y, 'yari_goblin');
            this.showText("Spawned: Yari Goblin x1");
        });
        this.createButton(224, 160, 0x4caf50, '森のカラス', () => {
            const x = Phaser.Math.Between(100, 700);
            const y = Phaser.Math.Between(100, 500);
            this.spawnEnemy(x, y, 'crow');
            this.showText("Spawned: Crow x1");
        });
        this.createButton(288, 160, 0x11111f, 'ハングドウィスプ', () => {
            const x = Phaser.Math.Between(100, 700);
            const y = Phaser.Math.Between(100, 500);
            this.spawnEnemy(x, y, 'hanged_wisp');
            this.showText("Spawned: Hanged Wisp x1");
        });
        this.createButton(352, 160, 0x455a64, '石像兵', () => {
            const x = Phaser.Math.Between(100, 700);
            const y = Phaser.Math.Between(100, 500);
            this.spawnEnemy(x, y, 'mossy_statue');
            this.showText("Spawned: Mossy Statue x1");
        });
        this.createButton(416, 160, 0x6d4c41, '盾持ち木兵', () => {
            const x = Phaser.Math.Between(100, 700);
            const y = Phaser.Math.Between(100, 500);
            this.spawnEnemy(x, y, 'cursed_stag');
            this.showText("Spawned: Shield Wood Soldier x1");
        });

        // ボタン追加: Tinyの下 (画面左下付近に再配置)
        // ランダム10体召喚
        this.createButton(96, 536, 0xff8800, '*10', () => {
            const types = ['tiny', 'normal', 'ranged', 'large', 'charger', 'spearman', 'yari_goblin'];
            for(let i=0; i<10; i++) {
                const x = Phaser.Math.Between(100, 700);
                const y = Phaser.Math.Between(100, 500);
                const type = Phaser.Utils.Array.GetRandom(types);
                this.spawnEnemy(x, y, type);
            }
            this.showText("Spawned: 10 Random Enemies");
        });

        // ボタン追加: *10の右隣 (画面左下付近)
        // ランダム20体召喚
        this.createButton(160, 536, 0xff0000, '*20', () => {
            const types = ['tiny', 'normal', 'ranged', 'large', 'charger', 'spearman', 'yari_goblin'];
            for(let i=0; i<20; i++) {
                const x = Phaser.Math.Between(100, 700);
                const y = Phaser.Math.Between(100, 500);
                const type = Phaser.Utils.Array.GetRandom(types);
                this.spawnEnemy(x, y, type);
            }
            this.showText("Spawned: 20 Random Enemies");
        });

        // 2段目: 左から Tiny, Spearman, Normal, Ranged, Charger, Large
        // 極小の魔物 (tiny) x 3
        this.createButton(96, 230, 0x00ff00, 'Tiny x3', () => {
            for(let i=0; i<3; i++) {
                const x = Phaser.Math.Between(100, 700);
                const y = Phaser.Math.Between(100, 500);
                this.spawnEnemy(x, y, 'tiny');
            }
            this.showText("Spawned: Tiny x3");
        });
        // 槍兵 (spearman) x 3
        this.createButton(160, 230, 0x2e7d32, 'Spearman x3', () => {
            for(let i=0; i<3; i++) {
                const x = Phaser.Math.Between(100, 700);
                const y = Phaser.Math.Between(100, 500);
                this.spawnEnemy(x, y, 'spearman');
            }
            this.showText("Spawned: Spearman x3");
        });
        // 小の魔物 (normal) x 3
        this.createButton(224, 230, 0x0000ff, 'Normal x3', () => {
            for(let i=0; i<3; i++) {
                const x = Phaser.Math.Between(100, 700);
                const y = Phaser.Math.Between(100, 500);
                this.spawnEnemy(x, y, 'normal');
            }
            this.showText("Spawned: Normal x3");
        });

        // 遠距離攻撃の魔物 (ranged) x 1
        this.createButton(288, 230, 0xff00ff, 'Ranged x1', () => {
            const x = Phaser.Math.Between(100, 700);
            const y = Phaser.Math.Between(100, 500);
            this.spawnEnemy(x, y, 'ranged');
            this.showText("Spawned: Ranged x1");
        });

        // 突撃魔物 (charger) x 1
        this.createButton(352, 230, 0xff8800, 'Charger x1', () => {
            const x = Phaser.Math.Between(100, 700);
            const y = Phaser.Math.Between(100, 500);
            this.spawnEnemy(x, y, 'charger');
            this.showText("Spawned: Charger x1");
        });

        // 大の魔物 (large) x 1
        this.createButton(416, 230, 0x880088, 'Large x1', () => {
            const x = Phaser.Math.Between(100, 700);
            const y = Phaser.Math.Between(100, 500);
            this.spawnEnemy(x, y, 'large');
            this.showText("Spawned: Large x1");
        });

        // CHEST Button: 画面右下付近に再配置
        this.createButton(704, 536, 0xFFD700, 'CHEST', () => {
            const x = Phaser.Math.Between(100, 700);
            const y = Phaser.Math.Between(100, 500);
            this.spawnChest(x, y);
            this.showText("Spawned: Treasure Chest");
        });
        // ステージボタンは1マス上に移動
        this.createButton(704, 160, 0x2e7d32, 'FOREST', () => {
            this.isTowerMode = false;
            if (!this.dungeonFloor || this.dungeonFloor < 1) {
                this.dungeonFloor = 1;
            }
            this.dungeonTheme = 'forest';
            this.showFloorBanner(() => {
                this.enterForestDungeon();
            });
        });
        this.createButton(704, 230, 0x555577, 'CASTLE', () => {
            this.isTowerMode = false;
            this.dungeonFloor = 11;
            this.dungeonTheme = 'castle';
            this.showFloorBanner(() => {
                this.enterCastleDungeon();
            });
        });
        this.createButton(704, 300, 0x7777aa, 'TOWER', () => {
            this.isTowerMode = true;
            if (!this.dungeonFloor || this.dungeonFloor < 1) {
                this.dungeonFloor = 1;
            }
            this.dungeonTheme = 'castle';
            this.showFloorBanner(() => {
                this.enterCastleDungeon();
            });
        });
    }

    createButton(x, y, color, label, callback) {
        const zone = this.add.zone(x, y, 64, 64);
        this.physics.add.existing(zone, true); // Static body

        // 見た目
        const graphics = this.add.graphics();
        graphics.fillStyle(color, 0.5);
        graphics.fillRect(x - 32, y - 32, 64, 64);
        graphics.lineStyle(2, 0xffffff, 1);
        graphics.strokeRect(x - 32, y - 32, 64, 64);

        const text = this.add.text(x, y, label, { 
            fontFamily: 'x10y12pxDonguriDuel', 
            fontSize: '16px', 
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        if (!this.testButtons) {
            this.testButtons = [];
        }
        this.testButtons.push({ zone, graphics, text });

        // プレイヤーとのインタラクション
        this.physics.add.overlap(this.player, zone, () => {
            // クールダウン制御（簡易的）
            if (!zone.lastTriggerTime || this.time.now - zone.lastTriggerTime > 2000) {
                zone.lastTriggerTime = this.time.now;

                // エフェクト
                this.tweens.add({
                    targets: [graphics, text],
                    scaleX: 1.2,
                    scaleY: 1.2,
                    duration: 100,
                    yoyo: true
                });

                callback();
            }
        });

        this.dungeonType = this.dungeonType || 'story';
        if (this.dungeonType === 'story') {
            this.dungeonFloor = 1;
            this.isTowerMode = false;
            this.dungeonTheme = 'forest';
            this.showFloorBanner(() => {
                this.enterForestDungeon();
            });
        } else if (this.dungeonType === 'tutorial') {
            this.dungeonFloor = 1;
            this.isTowerMode = false;
            this.dungeonTheme = 'forest';
            this.showFloorBanner(() => {
                this.enterForestDungeon();
            });
        } else if (this.dungeonType === 'end') {
            this.dungeonFloor = 21;
            this.isTowerMode = true;
            this.dungeonTheme = 'castle';
            this.showFloorBanner(() => {
                this.enterCastleDungeon();
            });
        }
    }

    showFloorBanner(onComplete) {
        if (this.floorBannerOverlay) {
            this.floorBannerOverlay.destroy();
            this.floorBannerOverlay = null;
        }
        if (this.floorBannerText) {
            this.floorBannerText.destroy();
            this.floorBannerText = null;
        }
        this.isFloorTransition = true;
        const w = this.scale.width;
        const h = this.scale.height;
        const overlay = this.add.rectangle(0, 0, w, h, 0x000000, 1);
        overlay.setOrigin(0, 0);
        overlay.setScrollFactor(0);
        overlay.setDepth(9000);
        let baseName = 'テストルーム';
        let floor = this.dungeonFloor || 1;
        if (this.dungeonTheme === 'forest') {
            baseName = 'よどみの　じゅかい';
        } else if (this.dungeonTheme === 'castle') {
            baseName = this.isTowerMode ? 'だんざいの　せんとう' : 'たそがれの　はいじょう';
        }
        const label = `${baseName} ${floor}F`;
        const text = this.add.text(w / 2, h / 2, label, {
            fontFamily: 'x10y12pxDonguriDuel',
            fontSize: '32px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        text.setScrollFactor(0);
        text.setDepth(9001);
        this.floorBannerOverlay = overlay;
        this.floorBannerText = text;
        if (onComplete) {
            onComplete();
        }
        this.time.delayedCall(800, () => {
            this.tweens.add({
                targets: [overlay, text],
                alpha: 0,
                duration: 600,
                onComplete: () => {
                    overlay.destroy();
                    text.destroy();
                    this.floorBannerOverlay = null;
                    this.floorBannerText = null;
                    this.isFloorTransition = false;
                }
            });
        });
    }

    handleDungeonExit(exit) {
        if (this.isExitingFloor) return;
        this.isExitingFloor = true;
        if (!this.dungeonFloor || this.dungeonFloor < 1) {
            this.dungeonFloor = 1;
        }
        const type = this.dungeonType || 'story';
        if (type === 'story') {
            if (this.dungeonFloor >= 30) {
                this.saveGame();
                if (this.cameras && this.cameras.main) {
                    this.cameras.main.fade(800, 0, 0, 0);
                    this.time.delayedCall(800, () => {
                        this.scene.start('ClearResultScene', {
                            slotIndex: this.slotIndex,
                            dungeonType: type,
                            finalFloor: this.dungeonFloor,
                            clearTimeMs: this.runElapsedTime || 0,
                            killCount: this.runKillCount || 0,
                            damageDealt: this.runDamageDealt || 0,
                            damageTaken: this.runDamageTaken || 0,
                            goldGained: this.runGoldGained || 0,
                            objectsDestroyed: this.runObjectsDestroyed || 0
                        });
                    });
                } else {
                    this.scene.start('ClearResultScene', {
                        slotIndex: this.slotIndex,
                        dungeonType: type,
                        finalFloor: this.dungeonFloor,
                        clearTimeMs: this.runElapsedTime || 0,
                        killCount: this.runKillCount || 0,
                        damageDealt: this.runDamageDealt || 0,
                        damageTaken: this.runDamageTaken || 0,
                        goldGained: this.runGoldGained || 0,
                        objectsDestroyed: this.runObjectsDestroyed || 0
                    });
                }
                return;
            }
            this.dungeonFloor += 1;
            const nextFloor = this.dungeonFloor;
            let enterFunc = null;
            if (nextFloor <= 10) {
                this.isTowerMode = false;
                this.dungeonTheme = 'forest';
                enterFunc = () => this.enterForestDungeon();
            } else if (nextFloor <= 20) {
                this.isTowerMode = false;
                this.dungeonTheme = 'castle';
                enterFunc = () => this.enterCastleDungeon();
            } else {
                this.isTowerMode = true;
                this.dungeonTheme = 'castle';
                enterFunc = () => this.enterCastleDungeon();
            }
            this.showFloorBanner(enterFunc);
        } else if (type === 'tutorial') {
            if (this.dungeonFloor >= 5) {
                this.saveGame();
                if (this.cameras && this.cameras.main) {
                    this.cameras.main.fade(800, 0, 0, 0);
                    this.time.delayedCall(800, () => {
                        this.scene.start('ClearResultScene', {
                            slotIndex: this.slotIndex,
                            dungeonType: type,
                            finalFloor: this.dungeonFloor,
                            clearTimeMs: this.runElapsedTime || 0,
                            killCount: this.runKillCount || 0,
                            damageDealt: this.runDamageDealt || 0,
                            damageTaken: this.runDamageTaken || 0,
                            goldGained: this.runGoldGained || 0,
                            objectsDestroyed: this.runObjectsDestroyed || 0
                        });
                    });
                } else {
                    this.scene.start('ClearResultScene', {
                        slotIndex: this.slotIndex,
                        dungeonType: type,
                        finalFloor: this.dungeonFloor,
                        clearTimeMs: this.runElapsedTime || 0,
                        killCount: this.runKillCount || 0,
                        damageDealt: this.runDamageDealt || 0,
                        damageTaken: this.runDamageTaken || 0,
                        goldGained: this.runGoldGained || 0,
                        objectsDestroyed: this.runObjectsDestroyed || 0
                    });
                }
                return;
            }
            this.dungeonFloor += 1;
            this.showFloorBanner(() => this.enterForestDungeon());
        } else {
            if (this.dungeonFloor < 30) {
                this.dungeonFloor += 1;
                this.showFloorBanner(() => {
                    if (this.dungeonTheme === 'castle') {
                        this.enterCastleDungeon();
                    } else {
                        this.enterForestDungeon();
                    }
                });
            } else {
                this.showText('30F CLEAR');
            }
        }
    }

    generateDungeonLayout(cols, rows) {
        const map = Array.from({length: rows}, () => Array(cols).fill(1));
        const rooms = [];
        const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
        // Six randomized rooms in separate sectors: bounded generation, no retries.
        for (let gy = 0; gy < 2; gy++) {
            for (let gx = 0; gx < 3; gx++) {
                const w = rand(12, 17), h = rand(10, 16);
                const x = gx * 24 + rand(3, 21 - w);
                const y = gy * 24 + rand(3, 21 - h);
                const room = {x, y, w, h, cx: x + Math.floor(w / 2), cy: y + Math.floor(h / 2)};
                rooms.push(room);
                for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) map[yy][xx] = 0;
            }
        }
        const carve = (x, y) => {
            for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
                if (x+dx > 0 && y+dy > 0 && x+dx < cols-1 && y+dy < rows-1) map[y+dy][x+dx] = 0;
            }
        };
        const link = (a, b) => {
            let x = a.cx, y = a.cy;
            const horizontalFirst = Math.random() < 0.5;
            const horizontal = () => { while (x !== b.cx) { carve(x, y); x += Math.sign(b.cx-x); } };
            const vertical = () => { while (y !== b.cy) { carve(x, y); y += Math.sign(b.cy-y); } };
            if (horizontalFirst) { horizontal(); vertical(); } else { vertical(); horizontal(); }
            carve(x,y);
        };
        const route = [0,1,2,5,4,3,0];
        for (let i=1;i<route.length;i++) link(rooms[route[i-1]],rooms[route[i]]);
        if (Math.random() < 0.5) link(rooms[1],rooms[4]);
        return {map, rooms, start: {x:rooms[0].cx,y:rooms[0].cy}};
    }

    setupDungeonCamera(width, height) {
        this.physics.world.setBounds(0, 0, width, height);
        const camera = this.cameras.main;
        camera.setBounds(0, 0, width, height);
        camera.startFollow(this.player, true, 0.12, 0.12);
        camera.centerOn(this.player.x, this.player.y);
        if (this.dungeonMinimap) this.dungeonMinimap.destroy();
        this.dungeonMinimap = this.add.graphics().setScrollFactor(0).setDepth(2800);
        this.discoveredTiles = new Set();
        this.minimapLastCell = null;
    }

    updateDungeonMinimap() {
        if (!this.dungeonMinimap || !this.player || !this.forestMapData) return;
        const px = Math.floor(this.player.x / 32), py = Math.floor(this.player.y / 32);
        const cell = px + ',' + py;
        if (cell === this.minimapLastCell) return;
        this.minimapLastCell = cell;
        for (let y=Math.max(0,py-7);y<=Math.min(this.forestRows-1,py+7);y++) {
            for (let x=Math.max(0,px-7);x<=Math.min(this.forestCols-1,px+7);x++) this.discoveredTiles.add(x+','+y);
        }
        const g = this.dungeonMinimap, scale = 2;
        const ox = this.scale.width - this.forestCols*scale - 12, oy = 48;
        g.clear().fillStyle(0x000000,0.7).fillRect(ox-4,oy-4,this.forestCols*scale+8,this.forestRows*scale+8);
        g.fillStyle(0xaaaaaa,0.8);
        for (const key of this.discoveredTiles) {
            const [x,y] = key.split(',').map(Number);
            if (this.forestMapData[y][x] === 0) g.fillRect(ox+x*scale,oy+y*scale,scale,scale);
        }
        const exit = this.dungeonExitCell;
        if (exit && this.discoveredTiles.has(exit.x+','+exit.y)) g.fillStyle(0xffd85c).fillRect(ox+exit.x*scale-1,oy+exit.y*scale-1,4,4);
        g.fillStyle(0x66ffbb).fillRect(ox+px*scale-1,oy+py*scale-1,4,4);
    }

    enterForestDungeon() {
        const tileSize = 32;
        const width = 72 * tileSize;
        const height = 48 * tileSize;
        const cols = Math.floor(width / tileSize);
        const rows = Math.ceil(height / tileSize);

        if (!this.dungeonFloor || this.dungeonFloor < 1) {
            this.dungeonFloor = 1;
        }
        this.isExitingFloor = false;
        this.isTowerMode = false;
        this.isInForest = true;
        this.dungeonTheme = 'forest';
        if (this.fogOverlay) {
            this.fogOverlay.setTexture('forest_fog');
            this.fogOverlay.setAlpha(0.85);
            this.fogOverlay.x = this.scale.width / 2;
            this.fogOverlay.y = this.scale.height / 2;
        }
        this.canUseExit = false;
        if (this.exitPrompt) {
            this.exitPrompt.setVisible(false);
        }

        if (this.testRoomGrid) {
            this.testRoomGrid.destroy();
            this.testRoomGrid = null;
        }

        if (this.testButtons && this.testButtons.length) {
            this.testButtons.forEach(b => {
                if (b.zone) b.zone.destroy();
                if (b.graphics) b.graphics.destroy();
                if (b.text) b.text.destroy();
            });
            this.testButtons = [];
        }

        if (this.goldDrops) {
            this.goldDrops.clear(true, true);
        }
        if (this.items) {
            this.items.clear(true, true);
        }

        if (this.gores) {
            this.gores.clear(true, true);
        }
        if (this.bloodDrops) {
            this.bloodDrops.clear(true, true);
        }
        if (this.sparks) {
            this.sparks.clear(true, true);
        }
        if (this.goreStains && this.goreStains.length) {
            this.goreStains.forEach(s => {
                if (s && s.destroy) {
                    s.destroy();
                }
            });
            this.goreStains = [];
        }

        const layout = this.generateDungeonLayout(cols, rows);
        const mapData = layout.map;
        const startX = layout.start.x;
        const startY = layout.start.y;
        this.dungeonRooms = layout.rooms;

        this.forestTileSize = tileSize;
        this.forestCols = cols;
        this.forestRows = rows;
        this.forestMapData = mapData;

        const perimeter = [];
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                if (mapData[y][x] !== 0) continue;
                let isEdge = false;
                const neighbors = [
                    { x: x + 1, y },
                    { x: x - 1, y },
                    { x, y: y + 1 },
                    { x, y: y - 1 }
                ];
                for (const n of neighbors) {
                    if (n.x < 0 || n.x >= cols || n.y < 0 || n.y >= rows) {
                        isEdge = true;
                        break;
                    }
                    if (mapData[n.y][n.x] === 1) {
                        isEdge = true;
                        break;
                    }
                }
                if (isEdge) {
                    perimeter.push({ x, y });
                }
            }
        }

        let exitCell = null;
        if (perimeter.length > 0) {
            exitCell = Phaser.Utils.Array.GetRandom(perimeter);
        } else {
            const fallback = [];
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    if (mapData[y][x] === 0) {
                        fallback.push({ x, y });
                    }
                }
            }
            if (fallback.length > 0) {
                exitCell = Phaser.Utils.Array.GetRandom(fallback);
            }
        }
        this.dungeonExitCell = exitCell;

        if (!this.textures.exists('forest_floor')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            const size = tileSize;
            g.fillStyle(0x0b1910, 1);
            g.fillRect(0, 0, size, size);
            g.fillStyle(0x12261a, 1);
            g.fillRect(1, 1, size - 2, size - 2);
            g.fillStyle(0x1a3120, 0.85);
            for (let i = 0; i < 3; i++) {
                const w = Phaser.Math.Between(5, 9);
                const h = Phaser.Math.Between(3, 5);
                const x = Phaser.Math.Between(1, size - w - 1);
                const y = Phaser.Math.Between(2, size - h - 2);
                g.fillRect(x, y, w, h);
            }
            g.fillStyle(0x234a28, 0.7);
            for (let i = 0; i < 4; i++) {
                const x = Phaser.Math.Between(2, size - 3);
                const h = Phaser.Math.Between(3, 6);
                const y = Phaser.Math.Between(3, size - 4 - h);
                g.fillRect(x, y, 1, h);
            }
            g.generateTexture('forest_floor', tileSize, tileSize);
            g.destroy();
        }

        if (!this.textures.exists('forest_exit')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            const size = tileSize;
            g.fillStyle(0x050608, 1);
            g.fillRect(0, 0, size, size);
            g.fillStyle(0x14181f, 1);
            g.fillRect(2, 2, size - 4, size - 4);
            g.fillStyle(0x050609, 1);
            g.fillRect(4, 4, size - 8, size - 8);
            const stepCount = 4;
            const stepHeight = 4;
            for (let i = 0; i < stepCount; i++) {
                const inset = 3 + i * 2;
                const y = size - 6 - i * stepHeight;
                const w = size - inset * 2;
                g.fillStyle(0x3b3f28, 1);
                g.fillRect(inset, y - stepHeight + 1, w, stepHeight - 1);
                g.fillStyle(0x272a1b, 1);
                g.fillRect(inset, y - 1, w, 1);
            }
            g.fillStyle(0x8f9f6a, 0.7);
            g.fillRect(3, 5, size - 6, 2);
            g.lineStyle(2, 0xffffff, 1);
            g.strokeRect(1, 1, size - 2, size - 2);
            g.generateTexture('forest_exit', tileSize, tileSize);
            g.destroy();
        }

        if (!this.textures.exists('forest_tree')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            const size = tileSize;
            const cx = size / 2;
            const baseY = size * 0.78;
            g.fillStyle(0x0b1209, 1);
            g.fillRect(0, 0, size, size);
            const trunkHeight = size * 0.45;
            const trunkTop = baseY - trunkHeight;
            const trunkBottom = baseY + 2;
            const trunkW = 6;
            g.fillStyle(0x5b3a22, 1);
            g.fillRect(cx - trunkW / 2, trunkTop, trunkW, trunkBottom - trunkTop);
            g.fillStyle(0x714426, 1);
            g.fillRect(cx - trunkW / 2 + 1, trunkTop + 1, trunkW - 2, trunkBottom - trunkTop - 3);
            g.fillStyle(0x3f2817, 1);
            g.fillRect(cx - trunkW / 2, trunkBottom - 3, trunkW, 3);
            const mainR = size * 0.32;
            const centerY = baseY - size * 0.18;
            g.fillStyle(0x234428, 1);
            g.fillCircle(cx, centerY, mainR);
            g.fillStyle(0x29502c, 1);
            g.fillCircle(cx, centerY - mainR * 0.55, mainR * 0.8);
            g.fillStyle(0x2f5e32, 1);
            g.fillCircle(cx, centerY - mainR * 1.0, mainR * 0.55);
            g.fillStyle(0x2d5830, 1);
            g.fillCircle(cx - mainR * 0.6, centerY - mainR * 0.1, mainR * 0.6);
            g.fillCircle(cx + mainR * 0.6, centerY - mainR * 0.05, mainR * 0.55);
            g.fillStyle(0x3a7a3b, 0.85);
            g.fillCircle(cx - mainR * 0.3, centerY - mainR * 0.9, mainR * 0.35);
            g.fillStyle(0x182519, 0.85);
            g.fillCircle(cx + mainR * 0.25, centerY + mainR * 0.2, mainR * 0.45);
            g.generateTexture('forest_tree', tileSize, tileSize);
            g.destroy();
        }

        if (!this.textures.exists('forest_tree_wall')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            const size = tileSize;
            const cx = size / 2;
            const baseY = size * 0.78;
            g.fillStyle(0x000000, 0);
            g.fillRect(0, 0, size, size);
            const trunkHeight2 = size * 0.45;
            const trunkTop2 = baseY - trunkHeight2;
            const trunkBottom2 = baseY + 2;
            const trunkW2 = 6;
            g.fillStyle(0x6b3f26, 1);
            g.fillRect(cx - trunkW2 / 2, trunkTop2, trunkW2, trunkBottom2 - trunkTop2);
            g.fillStyle(0x915632, 1);
            g.fillRect(cx - trunkW2 / 2 + 1, trunkTop2 + 1, trunkW2 - 2, trunkBottom2 - trunkTop2 - 4);
            g.fillStyle(0x3b2415, 1);
            g.fillRect(cx - trunkW2 / 2, trunkBottom2 - 3, trunkW2, 3);
            g.fillStyle(0xc7ff66, 1);
            g.fillRect(cx - trunkW2 / 2, trunkTop2 + trunkHeight2 * 0.4, trunkW2, 2);
            const mainR = size * 0.22;
            const centerY = baseY - size * 0.3;
            g.fillStyle(0x224029, 1);
            g.fillCircle(cx, centerY, mainR);
            g.fillStyle(0x2b5530, 1);
            g.fillCircle(cx - mainR * 0.5, centerY - 3, mainR * 0.7);
            g.fillStyle(0x17251a, 0.95);
            g.fillCircle(cx + mainR * 0.45, centerY + 1, mainR * 0.6);
            g.generateTexture('forest_tree_wall', tileSize, tileSize);
            g.destroy();
        }

        if (!this.textures.exists('forest_vine_wall')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            const size = tileSize;
            g.fillStyle(0x000000, 0);
            g.fillRect(0, 0, size, size);
            g.lineStyle(2, 0x0f7a3a, 1);
            const vineX = size * 0.5;
            g.beginPath();
            g.moveTo(vineX, 1);
            g.lineTo(vineX, size - 1);
            g.strokePath();
            g.lineStyle(2, 0x3cd15a, 1);
            g.strokeRect(size * 0.34, size * 0.2, size * 0.22, size * 0.18);
            g.strokeRect(size * 0.54, size * 0.38, size * 0.22, size * 0.18);
            g.strokeRect(size * 0.34, size * 0.56, size * 0.22, size * 0.18);
            g.generateTexture('forest_vine_wall', tileSize, tileSize);
            g.destroy();
        }

        if (!this.forestFloorGroup) {
            this.forestFloorGroup = this.add.group();
        } else {
            this.forestFloorGroup.clear(true, true);
        }

        if (!this.forestWalls) {
            this.forestWalls = this.physics.add.staticGroup();
            this.physics.add.collider(this.player, this.forestWalls);
            this.physics.add.collider(this.enemies, this.forestWalls, null, (enemy, wall) => {
                if (enemy.type === 'crow' && enemy.state === 'ATTACK') {
                    return false;
                }
                return true;
            });
        } else {
            this.forestWalls.clear(true, true);
        }

        if (!this.obstacles) {
            this.obstacles = this.physics.add.staticGroup();
            this.physics.add.collider(this.player, this.obstacles);
            this.physics.add.collider(this.enemies, this.obstacles, null, (enemy, obstacle) => {
                if (enemy.type === 'crow' && enemy.state === 'ATTACK') {
                    return false;
                }
                return true;
            });

            this.physics.add.overlap(this.player.attackHitboxes, this.obstacles, (hitbox, obstacle) => {
                if (!hitbox.body || !hitbox.body.enable) return;
                if (!obstacle.active) return;
                if (obstacle.isInvulnerable) return;

                obstacle.isInvulnerable = true;

                let baseDmg = 5;
                if (this.player.equippedWeapon && this.player.equippedWeapon.attackPower) {
                    baseDmg = this.player.equippedWeapon.attackPower;
                }

                const variance = Math.floor(baseDmg * 0.1) + 1;
                let dmg = Math.floor(baseDmg + Phaser.Math.Between(-variance, variance));
                if (dmg < 1) dmg = 1;

                if (this.player.isEmpowered) {
                    dmg = Math.floor(dmg * 1.5);
                }

                const critChance = typeof this.player.critChance === 'number' ? this.player.critChance : 0.1;
                const isPlayerCritical = Math.random() < critChance;
                if (isPlayerCritical) {
                    const critMul = 1.5 * (1 + (this.player.critDamageBonus || 0) / 100);
                    dmg = Math.floor(dmg * critMul);
                }

                if (typeof obstacle.hp !== 'number') {
                    if (obstacle.texture && (obstacle.texture.key === 'forest_vine_wall' || obstacle.texture.key === 'castle_candle')) {
                        obstacle.hp = 1;
                    } else {
                        obstacle.hp = 150;
                    }
                }

                obstacle.hp -= dmg;

                const attackType = hitbox.attackType || this.player.attackType || 'light';
                const customHitStop = hitbox.hitStopDuration !== undefined ? hitbox.hitStopDuration : 0;
                let stopDuration = 0;

                if (this.player && this.player.isEmpowered) {
                    if (customHitStop > 0) {
                        stopDuration = customHitStop;
                    } else {
                        if (attackType === 'light') {
                            stopDuration = 100;
                        } else {
                            stopDuration = 200;
                        }
                    }
                } else {
                    if (customHitStop > 0) {
                        stopDuration = customHitStop;
                    } else {
                        if (attackType === 'light') {
                            stopDuration = 30;
                        } else {
                            stopDuration = 100;
                        }
                    }
                }

                if (stopDuration > 0) {
                    this.hitStop(stopDuration);
                }

                let tintColor = 0x99ff99;
                const obstacleKey = obstacle.texture && obstacle.texture.key;
                if (obstacleKey === 'forest_tree_wall' || obstacleKey === 'castle_coffin') {
                    tintColor = 0xffffff;
                } else if (this.dungeonTheme === 'castle') {
                    tintColor = 0x2f3642;
                }
                obstacle.setTint(tintColor);
                this.time.delayedCall(100, () => {
                    if (obstacle && obstacle.active) {
                        obstacle.clearTint();
                    }
                });

                this.time.delayedCall(200, () => {
                    if (obstacle && obstacle.active) {
                        obstacle.isInvulnerable = false;
                    }
                });

                let dmgColor = '#00ff00';
                if (this.dungeonTheme === 'castle') {
                    dmgColor = '#6f7488';
                }
                this.showDamagePopup(obstacle.x, obstacle.y - 16, '-' + dmg, dmgColor);

                this.updateObstacleHpBar(obstacle);

                if (obstacle.hp <= 0) {
                    this.runObjectsDestroyed = (this.runObjectsDestroyed || 0) + 1;
                    const key = obstacle.texture && obstacle.texture.key;
                    if (this.dungeonTheme === 'forest') {
                        if (obstacle.texture && obstacle.texture.key === 'forest_vine_wall') {
                            const vineColor = 0x0f5e30;
                            this.spawnGorePieces(obstacle.x, obstacle.y, vineColor, 0.7);
                            this.spawnBloodStains(obstacle.x, obstacle.y, vineColor, 6);
                        } else {
                            const brown = 0x6b4b2f;
                            const green = 0x0f5e30;
                            this.spawnGorePieces(obstacle.x, obstacle.y, brown, 0.8);
                            this.spawnGorePieces(obstacle.x, obstacle.y, green, 0.6);
                            this.spawnBloodStains(obstacle.x, obstacle.y, brown, 8);
                        }
                    } else if (this.dungeonTheme === 'castle') {
                        const stoneDark = 0x424554;
                        const stoneLight = 0x6f7488;
                        this.spawnGorePieces(obstacle.x, obstacle.y, stoneDark, 0.9);
                        this.spawnGorePieces(obstacle.x, obstacle.y, stoneLight, 0.7);
                        this.spawnBloodStains(obstacle.x, obstacle.y, stoneDark, 5);
                    }
                    let goldMin = 1;
                    let goldMax = 50;
                    if (key === 'forest_vine_wall') {
                        goldMax = 15;
                    } else if (key === 'forest_tree_wall') {
                        goldMin = 5;
                        goldMax = 20;
                    }
                    const goldAmount = Phaser.Math.Between(goldMin, goldMax);
                    this.spawnGold(obstacle.x, obstacle.y, goldAmount);

                    if (obstacle.hpBarBg) obstacle.hpBarBg.destroy();
                    if (obstacle.hpBarFill) obstacle.hpBarFill.destroy();

                    if (obstacle.candleFlame) {
                        obstacle.candleFlame.destroy();
                        obstacle.candleFlame = null;
                    }
                    if (obstacle.candleGlow) {
                        obstacle.candleGlow.destroy();
                        obstacle.candleGlow = null;
                    }

                    obstacle.destroy();
                }
            });
        } else {
            const children = this.obstacles.getChildren();
            if (children && children.length) {
                children.forEach(o => {
                    if (o.hpBarBg) {
                        o.hpBarBg.destroy();
                        o.hpBarBg = null;
                    }
                    if (o.hpBarFill) {
                        o.hpBarFill.destroy();
                        o.hpBarFill = null;
                    }
                    if (o.candleFlame) {
                        o.candleFlame.destroy();
                        o.candleFlame = null;
                    }
                    if (o.candleGlow) {
                        o.candleGlow.destroy();
                        o.candleGlow = null;
                    }
                });
            }
            this.obstacles.clear(true, true);
        }

        const interiorFloors = [];

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const wx = x * tileSize + tileSize / 2;
                const wy = y * tileSize + tileSize / 2;
                if (mapData[y][x] === 0) {
                    const floor = this.add.image(wx, wy, 'forest_floor');
                    floor.setDepth(0);
                    this.forestFloorGroup.add(floor);

                    const isInterior = x > 1 && x < cols - 2 && y > 1 && y < rows - 2;
                    const distFromStart = Math.abs(x - startX) + Math.abs(y - startY);
                    const isNearStart = distFromStart <= 2;
                    const isExitCell = this.dungeonExitCell && this.dungeonExitCell.x === x && this.dungeonExitCell.y === y;

                    if (isInterior && !isNearStart && !isExitCell) {
                        interiorFloors.push({ x, y, worldX: wx, worldY: wy });
                    }
                } else {
                    const tree = this.physics.add.staticImage(wx, wy, 'forest_tree');
                    tree.setDepth(6);
                    if (tree.body && tree.body.width && tree.body.height) {
                        const shrink = 4;
                        const nw = tree.body.width - shrink;
                        const nh = tree.body.height - shrink;
                        if (nw > 0 && nh > 0) {
                            tree.body.setSize(nw, nh);
                        }
                    }
                    this.forestWalls.add(tree);
                }
            }
        }

        const obstacleOccupied = new Set();
        const treeCells = [];

        if (interiorFloors.length > 0) {
            const floorForTrees = interiorFloors.slice();
            for (let i = floorForTrees.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const tmp = floorForTrees[i];
                floorForTrees[i] = floorForTrees[j];
                floorForTrees[j] = tmp;
            }

            const treeCount = Math.max(1, Math.floor(interiorFloors.length * 0.06));

            for (let i = 0; i < treeCount && floorForTrees.length > 0; i++) {
                const cell = floorForTrees.pop();
                const key = cell.x + ',' + cell.y;
                obstacleOccupied.add(key);
                treeCells.push(cell);

                const obstacle = this.obstacles.create(cell.worldX, cell.worldY, 'forest_tree_wall');
                obstacle.setDepth(2);
                obstacle.maxHp = 30;
                obstacle.hp = obstacle.maxHp;
                this.createObstacleHpBar(obstacle);
            }
        }

        for (const cell of treeCells) {
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    const nx = cell.x + dx;
                    const ny = cell.y + dy;
                    if (nx <= 1 || nx >= cols - 2 || ny <= 1 || ny >= rows - 2) continue;
                    if (mapData[ny][nx] !== 0) continue;

                    const distFromStart = Math.abs(nx - startX) + Math.abs(ny - startY);
                    if (distFromStart <= 2) continue;

                    if (this.dungeonExitCell && this.dungeonExitCell.x === nx && this.dungeonExitCell.y === ny) continue;

                    const key = nx + ',' + ny;
                    if (obstacleOccupied.has(key)) continue;

                    if (Math.random() < 0.7) {
                        const worldX = nx * tileSize + tileSize / 2;
                        const worldY = ny * tileSize + tileSize / 2;
                        const obstacle = this.obstacles.create(worldX, worldY, 'forest_vine_wall');
                        obstacle.setDepth(2);
                        obstacle.maxHp = 1;
                        obstacle.hp = obstacle.maxHp;
                        this.createObstacleHpBar(obstacle);
                        obstacleOccupied.add(key);
                    }
                }
            }
        }

        this.forestInteriorFloors = interiorFloors;

        if (this.exitGroup) {
            this.exitGroup.clear(true, true);
            if (this.dungeonExitCell) {
                const ex = this.dungeonExitCell.x * tileSize + tileSize / 2;
                const ey = this.dungeonExitCell.y * tileSize + tileSize / 2;
                const exitSprite = this.exitGroup.create(ex, ey, 'forest_exit');
                exitSprite.setDepth(2001);
            }
        }

        const spawnX = startX * tileSize + tileSize / 2;
        const spawnY = startY * tileSize + tileSize / 2;
        this.player.setPosition(spawnX, spawnY);
        this.setupDungeonCamera(width, height);
        if (this.player.body) {
            this.player.body.setVelocity(0, 0);
        }

        if (this.forestFogSprites && this.forestFogSprites.length) {
            this.forestFogSprites.forEach(s => s.destroy());
        }
        this.forestFogSprites = [];

        if (this.enemies && this.enemies.clear) {
            this.enemies.clear(true, true);
        }
        const isTutorial = this.dungeonType === 'tutorial';
        const enemyTable = isTutorial
            ? this.getTutorialEnemyTable(this.dungeonFloor || 1)
            : this.getForestEnemyTable(this.dungeonFloor || 1);
        if (enemyTable && enemyTable.length && this.forestInteriorFloors && this.forestInteriorFloors.length) {
            const initialCount = isTutorial ? Phaser.Math.Between(1, 2) : Phaser.Math.Between(2, 4);
            for (let i = 0; i < initialCount; i++) {
                const type = Phaser.Utils.Array.GetRandom(enemyTable);
                const pos = this.getDistantForestSpawnPosition();
                if (pos) {
                    this.spawnEnemy(pos.x, pos.y, type);
                }
            }
        }
        this.forestNextRespawnTime = this.time.now + (isTutorial ? 45000 : 20000);
    }

    enterCastleDungeon() {
        const tileSize = 32;
        const width = 72 * tileSize;
        const height = 48 * tileSize;
        const cols = Math.floor(width / tileSize);
        const rows = Math.ceil(height / tileSize);

        if (!this.dungeonFloor || this.dungeonFloor < 1) {
            this.dungeonFloor = 1;
        }
        this.isExitingFloor = false;
        this.isInForest = true;
        this.dungeonTheme = 'castle';
        if (this.fogOverlay) {
            const fogKey = this.isTowerMode ? 'tower_fog' : 'castle_fog';
            const fogAlpha = this.isTowerMode ? 0.96 : 0.9;
            this.fogOverlay.setTexture(fogKey);
            this.fogOverlay.setAlpha(fogAlpha);
            this.fogOverlay.x = this.scale.width / 2;
            this.fogOverlay.y = this.scale.height / 2;
        }
        this.canUseExit = false;
        if (this.exitPrompt) {
            this.exitPrompt.setVisible(false);
        }

        if (this.testRoomGrid) {
            this.testRoomGrid.destroy();
            this.testRoomGrid = null;
        }

        if (this.testButtons && this.testButtons.length) {
            this.testButtons.forEach(b => {
                if (b.zone) b.zone.destroy();
                if (b.graphics) b.graphics.destroy();
                if (b.text) b.text.destroy();
            });
            this.testButtons = [];
        }

        if (this.goldDrops) {
            this.goldDrops.clear(true, true);
        }
        if (this.items) {
            this.items.clear(true, true);
        }

        if (this.gores) {
            this.gores.clear(true, true);
        }
        if (this.bloodDrops) {
            this.bloodDrops.clear(true, true);
        }
        if (this.sparks) {
            this.sparks.clear(true, true);
        }
        if (this.goreStains && this.goreStains.length) {
            this.goreStains.forEach(s => {
                if (s && s.destroy) {
                    s.destroy();
                }
            });
            this.goreStains = [];
        }

        const layout = this.generateDungeonLayout(cols, rows);
        const mapData = layout.map;
        const startX = layout.start.x;
        const startY = layout.start.y;
        this.dungeonRooms = layout.rooms;

        this.forestTileSize = tileSize;
        this.forestCols = cols;
        this.forestRows = rows;
        this.forestMapData = mapData;

        const perimeter = [];
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                if (mapData[y][x] !== 0) continue;
                let isEdge = false;
                const neighbors = [
                    { x: x + 1, y },
                    { x: x - 1, y },
                    { x, y: y + 1 },
                    { x, y: y - 1 }
                ];
                for (const n of neighbors) {
                    if (n.x < 0 || n.x >= cols || n.y < 0 || n.y >= rows) {
                        isEdge = true;
                        break;
                    }
                    if (mapData[n.y][n.x] === 1) {
                        isEdge = true;
                        break;
                    }
                }
                if (isEdge) {
                    perimeter.push({ x, y });
                }
            }
        }

        let exitCell = null;
        if (perimeter.length > 0) {
            exitCell = Phaser.Utils.Array.GetRandom(perimeter);
        } else {
            const fallback = [];
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    if (mapData[y][x] === 0) {
                        fallback.push({ x, y });
                    }
                }
            }
            if (fallback.length > 0) {
                exitCell = Phaser.Utils.Array.GetRandom(fallback);
            }
        }
        this.dungeonExitCell = exitCell;

        if (!this.textures.exists('castle_floor')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            const size = tileSize;
            g.fillStyle(0x181a22, 1);
            g.fillRect(0, 0, size, size);
            g.fillStyle(0x222632, 1);
            g.fillRect(1, 1, size - 2, size - 6);
            g.fillStyle(0x262a36, 1);
            g.fillRect(1, size / 2 - 1, size - 2, 2);
            g.fillStyle(0x10121a, 1);
            g.fillRect(0, size - 5, size, 5);
            g.fillStyle(0x11131b, 0.8);
            for (let i = 0; i < 4; i++) {
                const rx = Phaser.Math.Between(2, size - 6);
                const ry = Phaser.Math.Between(3, size - 9);
                g.fillRect(rx, ry, Phaser.Math.Between(2, 5), 1);
            }
            g.fillStyle(0x2e3442, 0.35);
            for (let i = 0; i < 3; i++) {
                const rx = Phaser.Math.Between(2, size - 6);
                const ry = Phaser.Math.Between(3, size - 10);
                g.fillRect(rx, ry, 1, 2);
            }
            g.generateTexture('castle_floor', tileSize, tileSize);
            g.destroy();
        }

        if (!this.textures.exists('tower_floor')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            const size = tileSize;
            g.fillStyle(0x050307, 1);
            g.fillRect(0, 0, size, size);
            g.fillStyle(0x12091a, 1);
            g.fillRect(1, 2, size - 2, size - 4);
            g.fillStyle(0x1d0f2a, 1);
            for (let y = 4; y < size - 3; y += 6) {
                g.fillRect(2, y, size - 4, 2);
            }
            g.fillStyle(0x0c0714, 1);
            for (let x = 4; x < size - 3; x += 6) {
                g.fillRect(x, 3, 2, size - 5);
            }
            g.fillStyle(0x2a1740, 0.9);
            for (let i = 0; i < 3; i++) {
                const rx = Phaser.Math.Between(3, size - 6);
                const ry = Phaser.Math.Between(4, size - 8);
                g.fillRect(rx, ry, Phaser.Math.Between(2, 4), 1);
            }
            g.fillStyle(0x040208, 1);
            g.fillRect(0, size - 3, size, 3);
            g.generateTexture('tower_floor', tileSize, tileSize);
            g.destroy();
        }

        if (!this.textures.exists('castle_wall')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            const size = tileSize;
            g.fillStyle(0x11121a, 1);
            g.fillRect(0, 0, size, size);
            g.fillStyle(0x1e2230, 1);
            g.fillRect(2, 2, size - 4, size - 4);
            g.lineStyle(1, 0x080910, 0.9);
            for (let y = 6; y < size - 2; y += 5) {
                g.moveTo(2, y);
                g.lineTo(size - 2, y);
            }
            for (let x = 4; x < size - 2; x += 8) {
                g.moveTo(x, 2);
                g.lineTo(x, size - 2);
            }
            g.strokePath();
            g.fillStyle(0x181b26, 1);
            for (let i = 0; i < 4; i++) {
                const bx = Phaser.Math.Between(3, size - 7);
                const by = Phaser.Math.Between(4, size - 8);
                g.fillRect(bx, by, Phaser.Math.Between(2, 4), 2);
            }
            g.fillStyle(0x2b3140, 0.4);
            for (let i = 0; i < 3; i++) {
                const bx = Phaser.Math.Between(3, size - 7);
                const by = Phaser.Math.Between(4, size - 8);
                g.fillRect(bx, by, 1, Phaser.Math.Between(2, 4));
            }
            g.generateTexture('castle_wall', tileSize, tileSize);
            g.destroy();
        }

        if (!this.textures.exists('tower_wall')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            const size = tileSize;
            g.fillStyle(0x020203, 1);
            g.fillRect(0, 0, size, size);
            g.fillStyle(0x101018, 1);
            g.fillRect(1, 1, size - 2, size - 2);
            g.fillStyle(0x181822, 1);
            g.fillRect(2, 3, size - 4, size - 6);
            g.fillStyle(0x08080d, 1);
            for (let y = 5; y < size - 3; y += 6) {
                g.fillRect(2, y, size - 4, 2);
            }
            g.fillStyle(0x111119, 1);
            for (let x = 4; x < size - 3; x += 7) {
                g.fillRect(x, 3, 3, size - 6);
            }
            g.fillStyle(0xd9c36a, 0.96);
            g.fillRect(1, 1, size - 2, 1);
            g.fillRect(1, size - 2, size - 2, 1);
            g.fillRect(1, 1, 1, size - 2);
            g.fillRect(size - 2, 1, 1, size - 2);
            g.fillStyle(0x8f7835, 1);
            g.fillRect(size / 2 - 3, 2, 6, 3);
            g.generateTexture('tower_wall', tileSize, tileSize);
            g.destroy();
        }

        if (!this.textures.exists('castle_exit')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            const size = tileSize;
            g.fillStyle(0x000000, 1);
            g.fillRect(0, 0, size, size);
            g.fillStyle(0x151827, 1);
            g.fillRect(2, 2, size - 4, size - 4);
            g.fillStyle(0x05060b, 1);
            g.fillRect(4, 4, size - 8, size - 8);
            const stepCount = 4;
            const stepHeight = 4;
            for (let i = 0; i < stepCount; i++) {
                const inset = 3 + i * 2;
                const y = size - 6 - i * stepHeight;
                const w = size - inset * 2;
                g.fillStyle(0x303442, 1);
                g.fillRect(inset, y - stepHeight + 1, w, stepHeight - 1);
                g.fillStyle(0x202331, 1);
                g.fillRect(inset, y - 1, w, 1);
                g.fillStyle(0x9fbaf5, 0.6);
                g.fillRect(inset, y - stepHeight + 1, w, 1);
            }
            g.fillStyle(0x9fbaf5, 0.8);
            g.fillRect(size / 2 - 2, 5, 4, 3);
            g.lineStyle(2, 0xffffff, 1);
            g.strokeRect(1, 1, size - 2, size - 2);
            g.generateTexture('castle_exit', tileSize, tileSize);
            g.destroy();
        }

        if (!this.textures.exists('tower_exit')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            const size = tileSize;
            const cx = size / 2;
            const cy = size / 2 + 4;
            g.fillStyle(0x030208, 1);
            g.fillRect(0, 0, size, size);
            g.fillStyle(0x151024, 1);
            g.fillRect(2, 2, size - 4, size - 4);
            g.fillStyle(0x0a0816, 1);
            g.fillRect(4, 4, size - 8, size - 8);
            g.lineStyle(2, 0x7044a0, 0.9);
            g.strokeCircle(cx, cy, size * 0.28);
            g.lineStyle(2, 0xd9c36a, 0.9);
            g.strokeCircle(cx, cy, size * 0.18);
            g.fillStyle(0x7044a0, 0.6);
            g.fillCircle(cx, cy, size * 0.12);
            g.fillStyle(0xffeeaa, 0.9);
            g.fillCircle(cx, cy - 7, 2);
            g.fillCircle(cx + 6, cy + 3, 1.5);
            g.fillCircle(cx - 6, cy + 3, 1.5);
            g.lineStyle(2, 0xffffff, 1);
            g.strokeRect(1, 1, size - 2, size - 2);
            g.generateTexture('tower_exit', tileSize, tileSize);
            g.destroy();
        }

        if (!this.textures.exists('castle_coffin')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            const size = tileSize;
            g.fillStyle(0x000000, 0);
            g.fillRect(0, 0, size, size);
            const bodyWidth = size * 0.5;
            const bodyHeight = size * 0.6;
            const cx = size / 2;
            const cy = size / 2;
            const halfW = bodyWidth / 2;
            const halfH = bodyHeight / 2;
            const topY = cy - halfH;
            const bottomY = cy + halfH;
            const shoulderY = topY + bodyHeight * 0.25;
            const bottomInset = halfW * 0.2;
            g.fillStyle(0x2a2e3a, 1);
            g.beginPath();
            g.moveTo(cx, topY);
            g.lineTo(cx + halfW, shoulderY);
            g.lineTo(cx + halfW - bottomInset, bottomY);
            g.lineTo(cx - halfW + bottomInset, bottomY);
            g.lineTo(cx - halfW, shoulderY);
            g.closePath();
            g.fillPath();
            g.lineStyle(1, 0x111319, 1);
            g.strokePath();
            const innerOffset = 2;
            g.fillStyle(0x191c26, 1);
            g.beginPath();
            g.moveTo(cx, topY + innerOffset);
            g.lineTo(cx + halfW - innerOffset, shoulderY + innerOffset);
            g.lineTo(cx + halfW - bottomInset - innerOffset, bottomY - innerOffset);
            g.lineTo(cx - halfW + bottomInset + innerOffset, bottomY - innerOffset);
            g.lineTo(cx - halfW + innerOffset, shoulderY + innerOffset);
            g.closePath();
            g.fillPath();
            const stripW = bodyWidth * 0.12;
            const stripTop = shoulderY + innerOffset * 2;
            const stripH = bottomY - stripTop - innerOffset * 2;
            g.fillStyle(0x3a4050, 0.9);
            g.fillRect(cx - stripW / 2, stripTop, stripW, stripH);
            g.generateTexture('castle_coffin', tileSize, tileSize);
            g.destroy();
        }

        if (!this.textures.exists('castle_candle')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            const size = tileSize;
            g.fillStyle(0x000000, 0);
            g.fillRect(0, 0, size, size);
            const baseW = 6;
            const baseH = 4;
            const baseX = size / 2 - baseW;
            const baseY = size * 0.7;
            g.fillStyle(0x20242e, 1);
            g.fillRect(baseX, baseY, baseW * 2, baseH);
            g.fillStyle(0x2c3240, 1);
            g.fillRect(baseX + 1, baseY - 10, baseW * 2 - 2, 10);
            g.fillStyle(0xf5e6b5, 1);
            g.fillRect(size / 2 - 2, baseY - 14, 4, 8);
            g.fillStyle(0xfff4c1, 1);
            g.fillCircle(size / 2, baseY - 16, 3);
            g.fillStyle(0xffd27f, 0.9);
            g.fillCircle(size / 2, baseY - 18, 2);
            g.generateTexture('castle_candle', tileSize, tileSize);
            g.destroy();
        }

        if (!this.textures.exists('castle_candle_flame')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            const size = tileSize;
            const cx = size / 2;
            const cy = size * 0.3;
            g.fillStyle(0xfff4c1, 1);
            g.fillEllipse(cx, cy, 4, 6);
            g.fillStyle(0xffd27f, 1);
            g.fillEllipse(cx, cy - 1, 3, 5);
            g.fillStyle(0xff9b40, 0.9);
            g.fillEllipse(cx, cy - 1.5, 2, 4);
            g.generateTexture('castle_candle_flame', size, size);
            g.destroy();
        }

        if (!this.textures.exists('castle_candle_glow')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            const size = tileSize * 2;
            const cx = size / 2;
            const cy = size / 2;
            const maxRadius = size * 0.7;
            const layers = 14;
            for (let i = layers - 1; i >= 0; i--) {
                const t = i / (layers - 1);
                const radius = maxRadius * ((i + 1) / layers);
                const alpha = (1 - t) * (1 - t) * 0.55;
                if (alpha <= 0.01) continue;
                g.fillStyle(0xfff4c1, alpha);
                g.fillCircle(cx, cy, radius);
            }
            g.generateTexture('castle_candle_glow', size, size);
            g.destroy();
        }

        if (!this.textures.exists('castle_spike_off')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            const size = tileSize;
            g.fillStyle(0x181a22, 1);
            g.fillRect(0, 0, size, size);
            g.fillStyle(0x222632, 1);
            g.fillRect(1, 1, size - 2, size - 2);
            const grid = 3;
            const cell = Math.floor((size - 8) / grid);
            const startX = Math.floor((size - cell * grid) / 2);
            const startY = Math.floor((size - cell * grid) / 2);
            g.fillStyle(0x151720, 1);
            for (let gy = 0; gy < grid; gy++) {
                for (let gx = 0; gx < grid; gx++) {
                    const hx = startX + gx * cell + 1;
                    const hy = startY + gy * cell + 1;
                    const hw = cell - 2;
                    const hh = cell - 2;
                    g.fillRect(hx, hy, hw, hh);
                }
            }
            g.generateTexture('castle_spike_off', tileSize, tileSize);
            g.destroy();
        }

        if (!this.textures.exists('castle_spike_on')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            const size = tileSize;
            g.fillStyle(0x181a22, 1);
            g.fillRect(0, 0, size, size);
            g.fillStyle(0x222632, 1);
            g.fillRect(1, 1, size - 2, size - 2);
            const grid = 3;
            const cell = Math.floor((size - 8) / grid);
            const startX = Math.floor((size - cell * grid) / 2);
            const startY = Math.floor((size - cell * grid) / 2);
            for (let gy = 0; gy < grid; gy++) {
                for (let gx = 0; gx < grid; gx++) {
                    const hx = startX + gx * cell + 1;
                    const hy = startY + gy * cell + 1;
                    const hw = cell - 2;
                    const hh = cell - 2;
                    g.fillStyle(0x151720, 1);
                    g.fillRect(hx, hy, hw, hh);
                    const spikeBaseX = hx + hw / 2;
                    const spikeBaseY = hy + hh - 2;
                    g.fillStyle(0x50566a, 1);
                    g.fillRect(spikeBaseX - 1, spikeBaseY - (hh * 0.4), 2, hh * 0.4);
                    g.fillStyle(0xaab2c8, 1);
                    g.fillTriangle(
                        spikeBaseX - 2,
                        spikeBaseY - (hh * 0.4),
                        spikeBaseX + 2,
                        spikeBaseY - (hh * 0.4),
                        spikeBaseX,
                        spikeBaseY - (hh * 0.4) - 3
                    );
                }
            }
            g.generateTexture('castle_spike_on', tileSize, tileSize);
            g.destroy();
        }

        if (!this.forestFloorGroup) {
            this.forestFloorGroup = this.add.group();
        } else {
            this.forestFloorGroup.clear(true, true);
        }

        if (!this.forestWalls) {
            this.forestWalls = this.physics.add.staticGroup();
            this.physics.add.collider(this.player, this.forestWalls);
            this.physics.add.collider(this.enemies, this.forestWalls, null, (enemy, wall) => {
                if (enemy.type === 'crow' && enemy.state === 'ATTACK') {
                    return false;
                }
                return true;
            });
        } else {
            this.forestWalls.clear(true, true);
        }

        if (!this.obstacles) {
            this.obstacles = this.physics.add.staticGroup();
            this.physics.add.collider(this.player, this.obstacles);
            this.physics.add.collider(this.enemies, this.obstacles, null, (enemy, obstacle) => {
                if (enemy.type === 'crow' && enemy.state === 'ATTACK') {
                    return false;
                }
                return true;
            });

            this.physics.add.overlap(this.player.attackHitboxes, this.obstacles, (hitbox, obstacle) => {
                if (!hitbox.body || !hitbox.body.enable) return;
                if (!obstacle.active) return;
                if (obstacle.isInvulnerable) return;

                obstacle.isInvulnerable = true;

                let baseDmg = 5;
                if (this.player.equippedWeapon && this.player.equippedWeapon.attackPower) {
                    baseDmg = this.player.equippedWeapon.attackPower;
                }

                const variance = Math.floor(baseDmg * 0.1) + 1;
                let dmg = Math.floor(baseDmg + Phaser.Math.Between(-variance, variance));
                if (dmg < 1) dmg = 1;

                if (this.player.isEmpowered) {
                    dmg = Math.floor(dmg * 1.5);
                }

                const critChance = typeof this.player.critChance === 'number' ? this.player.critChance : 0.1;
                const isPlayerCritical = Math.random() < critChance;
                if (isPlayerCritical) {
                    const critMul = 1.5 * (1 + (this.player.critDamageBonus || 0) / 100);
                    dmg = Math.floor(dmg * critMul);
                }

                if (typeof obstacle.hp !== 'number') {
                    if (obstacle.texture && obstacle.texture.key === 'forest_vine_wall') {
                        obstacle.hp = 1;
                    } else {
                        obstacle.hp = 150;
                    }
                }

                obstacle.hp -= dmg;

                const attackType = hitbox.attackType || this.player.attackType || 'light';
                const customHitStop = hitbox.hitStopDuration !== undefined ? hitbox.hitStopDuration : 0;
                let stopDuration = 0;

                if (this.player && this.player.isEmpowered) {
                    if (customHitStop > 0) {
                        stopDuration = customHitStop;
                    } else {
                        if (attackType === 'light') {
                            stopDuration = 100;
                        } else {
                            stopDuration = 200;
                        }
                    }
                } else {
                    if (customHitStop > 0) {
                        stopDuration = customHitStop;
                    } else {
                        if (attackType === 'light') {
                            stopDuration = 30;
                        } else {
                            stopDuration = 100;
                        }
                    }
                }

                if (stopDuration > 0) {
                    this.hitStop(stopDuration);
                }

                let tintColor = 0x99ff99;
                const obstacleKey = obstacle.texture && obstacle.texture.key;
                if (obstacleKey === 'forest_tree_wall' || obstacleKey === 'castle_coffin') {
                    tintColor = 0xffffff;
                } else if (this.dungeonTheme === 'castle') {
                    tintColor = 0x2f3642;
                }
                obstacle.setTint(tintColor);
                this.time.delayedCall(100, () => {
                    if (obstacle && obstacle.active) {
                        obstacle.clearTint();
                    }
                });

                this.time.delayedCall(200, () => {
                    if (obstacle && obstacle.active) {
                        obstacle.isInvulnerable = false;
                    }
                });

                let dmgColor = '#00ff00';
                if (this.dungeonTheme === 'castle') {
                    dmgColor = '#6f7488';
                }
                this.showDamagePopup(obstacle.x, obstacle.y - 16, '-' + dmg, dmgColor);

                this.updateObstacleHpBar(obstacle);

                if (obstacle.hp <= 0) {
                    this.runObjectsDestroyed = (this.runObjectsDestroyed || 0) + 1;
                    const key = obstacle.texture && obstacle.texture.key;
                    if (this.dungeonTheme === 'forest') {
                        if (obstacle.texture && obstacle.texture.key === 'forest_vine_wall') {
                            const vineColor = 0x0f5e30;
                            this.spawnGorePieces(obstacle.x, obstacle.y, vineColor, 0.7);
                            this.spawnBloodStains(obstacle.x, obstacle.y, vineColor, 6);
                        } else {
                            const brown = 0x6b4b2f;
                            const green = 0x0f5e30;
                            this.spawnGorePieces(obstacle.x, obstacle.y, brown, 0.8);
                            this.spawnGorePieces(obstacle.x, obstacle.y, green, 0.6);
                            this.spawnBloodStains(obstacle.x, obstacle.y, brown, 8);
                        }
                    } else if (this.dungeonTheme === 'castle') {
                        const stoneDark = 0x424554;
                        const stoneLight = 0x6f7488;
                        this.spawnGorePieces(obstacle.x, obstacle.y, stoneDark, 0.9);
                        this.spawnGorePieces(obstacle.x, obstacle.y, stoneLight, 0.7);
                        this.spawnBloodStains(obstacle.x, obstacle.y, stoneDark, 5);
                    }
                    let goldMin = 1;
                    let goldMax = 50;
                    if (key === 'forest_vine_wall') {
                        goldMax = 15;
                    } else if (key === 'forest_tree_wall') {
                        goldMin = 5;
                        goldMax = 20;
                    }
                    const goldAmount = Phaser.Math.Between(goldMin, goldMax);
                    this.spawnGold(obstacle.x, obstacle.y, goldAmount);

                    if (obstacle.hpBarBg) obstacle.hpBarBg.destroy();
                    if (obstacle.hpBarFill) obstacle.hpBarFill.destroy();

                    if (obstacle.candleFlame) {
                        obstacle.candleFlame.destroy();
                        obstacle.candleFlame = null;
                    }
                    if (obstacle.candleGlow) {
                        obstacle.candleGlow.destroy();
                        obstacle.candleGlow = null;
                    }

                    obstacle.destroy();
                }
            });
        } else {
            const children = this.obstacles.getChildren();
            if (children && children.length) {
                children.forEach(o => {
                    if (o.hpBarBg) {
                        o.hpBarBg.destroy();
                        o.hpBarBg = null;
                    }
                    if (o.hpBarFill) {
                        o.hpBarFill.destroy();
                        o.hpBarFill = null;
                    }
                    if (o.candleFlame) {
                        o.candleFlame.destroy();
                        o.candleFlame = null;
                    }
                    if (o.candleGlow) {
                        o.candleGlow.destroy();
                        o.candleGlow = null;
                    }
                });
            }
            this.obstacles.clear(true, true);
        }

        const interiorFloors = [];
        const curseCells = [];
        const spikeCells = [];

        const floorKey = this.isTowerMode ? 'tower_floor' : 'castle_floor';
        const wallKey = this.isTowerMode ? 'tower_wall' : 'castle_wall';

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const wx = x * tileSize + tileSize / 2;
                const wy = y * tileSize + tileSize / 2;
                if (mapData[y][x] === 0) {
                    const floor = this.add.image(wx, wy, floorKey);
                    floor.setDepth(0);
                    this.forestFloorGroup.add(floor);

                    const isInterior = x > 1 && x < cols - 2 && y > 1 && y < rows - 2;
                    const distFromStart = Math.abs(x - startX) + Math.abs(y - startY);
                    const isNearStart = distFromStart <= 2;
                    const isExitCell = this.dungeonExitCell && this.dungeonExitCell.x === x && this.dungeonExitCell.y === y;

                    if (isInterior && !isNearStart && !isExitCell) {
                        interiorFloors.push({ x, y, worldX: wx, worldY: wy });
                    }
                } else {
                    const wall = this.physics.add.staticImage(wx, wy, wallKey);
                    wall.setDepth(6);
                    if (wall.body && wall.body.width && wall.body.height) {
                        const shrink = 4;
                        const nw = wall.body.width - shrink;
                        const nh = wall.body.height - shrink;
                        if (nw > 0 && nh > 0) {
                            wall.body.setSize(nw, nh);
                        }
                    }
                    this.forestWalls.add(wall);
                }
            }
        }

        const obstacleOccupied = new Set();
        const coffinCells = [];
        const candleCells = [];

        if (interiorFloors.length > 0) {
            const shuffled = interiorFloors.slice();
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const tmp = shuffled[i];
                shuffled[i] = shuffled[j];
                shuffled[j] = tmp;
            }

            const coffinCount = this.isTowerMode ? 0 : Math.max(1, Math.floor(interiorFloors.length * 0.03));
            const candleCount = this.isTowerMode ? 0 : Math.max(2, Math.floor(interiorFloors.length * 0.04));

            for (let i = 0; i < coffinCount && shuffled.length > 0; i++) {
                const cell = shuffled.pop();
                const key = cell.x + ',' + cell.y;
                obstacleOccupied.add(key);
                coffinCells.push(cell);

                const obstacle = this.obstacles.create(cell.worldX, cell.worldY, 'castle_coffin');
                obstacle.setDepth(2);
                obstacle.maxHp = 30;
                obstacle.hp = obstacle.maxHp;
                this.createObstacleHpBar(obstacle);
            }

            for (let i = 0; i < candleCount && shuffled.length > 0; i++) {
                const cell = shuffled.pop();
                const key = cell.x + ',' + cell.y;
                obstacleOccupied.add(key);
                candleCells.push(cell);

                const obstacle = this.obstacles.create(cell.worldX, cell.worldY, 'castle_candle');
                obstacle.setDepth(2);
                obstacle.maxHp = 1;
                obstacle.hp = obstacle.maxHp;
                this.createObstacleHpBar(obstacle);

                const flameBaseY = cell.worldY - tileSize * 0.45;
                const flame = this.add.image(cell.worldX, flameBaseY, 'castle_candle_flame');
                flame.setDepth(3);
                flame.setOrigin(0.5);

                const glowBaseY = cell.worldY - tileSize * 0.2;
                const glow = this.add.image(cell.worldX, glowBaseY, 'castle_candle_glow');
                glow.setDepth(0.6);
                glow.setOrigin(0.5);
                glow.setBlendMode(Phaser.BlendModes.ADD);

                const glowBaseScale = Phaser.Math.FloatBetween(1.0, 1.3);
                glow.setScale(glowBaseScale);

                const flameAmp = Phaser.Math.FloatBetween(1.0, 3.0);
                const flameAlphaMin = Phaser.Math.FloatBetween(0.6, 0.85);
                const flameAlphaMax = 1.0;
                const flameDuration = Phaser.Math.Between(140, 260);
                const flameDelay = Phaser.Math.Between(0, 200);

                this.tweens.add({
                    targets: flame,
                    y: { from: flameBaseY - flameAmp, to: flameBaseY + flameAmp },
                    alpha: { from: flameAlphaMax, to: flameAlphaMin },
                    duration: flameDuration,
                    yoyo: true,
                    repeat: -1,
                    delay: flameDelay
                });

                const glowScaleMin = glowBaseScale * Phaser.Math.FloatBetween(0.9, 0.98);
                const glowScaleMax = glowBaseScale * Phaser.Math.FloatBetween(1.05, 1.2);
                const glowAlphaMin = Phaser.Math.FloatBetween(0.22, 0.32);
                const glowAlphaMax = glowAlphaMin + Phaser.Math.FloatBetween(0.1, 0.18);
                const glowDuration = Phaser.Math.Between(180, 260);
                const glowDelay = Phaser.Math.Between(0, 220);

                this.tweens.add({
                    targets: glow,
                    alpha: { from: glowAlphaMax, to: glowAlphaMin },
                    scale: { from: glowScaleMax, to: glowScaleMin },
                    duration: glowDuration,
                    yoyo: true,
                    repeat: -1,
                    delay: glowDelay
                });

                obstacle.candleFlame = flame;
                obstacle.candleGlow = glow;
            }
        }

        if (interiorFloors.length > 0) {
            const shuffledForCurse = interiorFloors.slice();
            for (let i = shuffledForCurse.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const tmp = shuffledForCurse[i];
                shuffledForCurse[i] = shuffledForCurse[j];
                shuffledForCurse[j] = tmp;
            }
            const curseCount = 0;
            for (let i = 0; i < curseCount && shuffledForCurse.length > 0; i++) {
                const cell = shuffledForCurse.pop();
                const worldX = cell.worldX;
                const worldY = cell.worldY;
                const sprite = this.add.image(worldX, worldY, 'castle_curse');
                sprite.setDepth(0.5);
                curseCells.push({ x: cell.x, y: cell.y, sprite });
            }
        }

        if (interiorFloors.length > 0) {
            const shuffledForSpikes = interiorFloors.slice();
            for (let i = shuffledForSpikes.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const tmp = shuffledForSpikes[i];
                shuffledForSpikes[i] = shuffledForSpikes[j];
                shuffledForSpikes[j] = tmp;
            }
            const spikeCount = this.isTowerMode ? 0 : Math.max(3, Math.floor(interiorFloors.length * 0.025));
            for (let i = 0; i < spikeCount && shuffledForSpikes.length > 0; i++) {
                const cell = shuffledForSpikes.pop();
                const worldX = cell.worldX;
                const worldY = cell.worldY;
                const sprite = this.add.image(worldX, worldY, 'castle_spike_off');
                sprite.setDepth(0.4);
                spikeCells.push({ x: cell.x, y: cell.y, sprite, active: false });
            }
        }

        this.castleCurses = curseCells;
        this.castleSpikes = spikeCells;
        this.castleInteriorFloors = interiorFloors;

        const visited = [];
        for (let y = 0; y < rows; y++) {
            const row = [];
            for (let x = 0; x < cols; x++) {
                row.push(false);
            }
            visited.push(row);
        }

        const queue = [];
        if (mapData[startY][startX] === 0) {
            visited[startY][startX] = true;
            queue.push({ x: startX, y: startY });
        }

        const bfsDirs = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 }
        ];

        while (queue.length > 0) {
            const current = queue.shift();
            for (let i = 0; i < bfsDirs.length; i++) {
                const nx = current.x + bfsDirs[i].x;
                const ny = current.y + bfsDirs[i].y;
                if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
                if (mapData[ny][nx] !== 0) continue;
                if (visited[ny][nx]) continue;
                visited[ny][nx] = true;
                queue.push({ x: nx, y: ny });
            }
        }

        let adjustedExit = this.dungeonExitCell;
        if (!adjustedExit || !visited[adjustedExit.y][adjustedExit.x]) {
            const perimeterReachable = [];
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    if (!visited[y][x]) continue;
                    if (mapData[y][x] !== 0) continue;
                    let isEdge = false;
                    const neighbors = [
                        { x: x + 1, y },
                        { x: x - 1, y },
                        { x, y: y + 1 },
                        { x, y: y - 1 }
                    ];
                    for (let i = 0; i < neighbors.length; i++) {
                        const n = neighbors[i];
                        if (n.x < 0 || n.x >= cols || n.y < 0 || n.y >= rows) {
                            isEdge = true;
                            break;
                        }
                        if (mapData[n.y][n.x] === 1) {
                            isEdge = true;
                            break;
                        }
                    }
                    if (isEdge) {
                        perimeterReachable.push({ x, y });
                    }
                }
            }

            if (perimeterReachable.length > 0) {
                adjustedExit = Phaser.Utils.Array.GetRandom(perimeterReachable);
            } else {
                const reachableCells = [];
                for (let y = 0; y < rows; y++) {
                    for (let x = 0; x < cols; x++) {
                        if (visited[y][x] && mapData[y][x] === 0) {
                            reachableCells.push({ x, y });
                        }
                    }
                }
                if (reachableCells.length > 0) {
                    adjustedExit = Phaser.Utils.Array.GetRandom(reachableCells);
                } else {
                    adjustedExit = this.dungeonExitCell;
                }
            }
            this.dungeonExitCell = adjustedExit;
        }

        if (this.exitGroup) {
            this.exitGroup.clear(true, true);
            if (this.dungeonExitCell) {
                const ex = this.dungeonExitCell.x * tileSize + tileSize / 2;
                const ey = this.dungeonExitCell.y * tileSize + tileSize / 2;
                const exitKey = this.isTowerMode ? 'tower_exit' : 'castle_exit';
                const exitSprite = this.exitGroup.create(ex, ey, exitKey);
                exitSprite.setDepth(2001);
            }
        }

        const spawnX = startX * tileSize + tileSize / 2;
        const spawnY = startY * tileSize + tileSize / 2;
        this.player.setPosition(spawnX, spawnY);
        this.setupDungeonCamera(width, height);
        if (this.player.body) {
            this.player.body.setVelocity(0, 0);
        }

        if (this.forestFogSprites && this.forestFogSprites.length) {
            this.forestFogSprites.forEach(s => s.destroy());
        }
        this.forestFogSprites = [];

        if (this.enemies && this.enemies.clear) {
            this.enemies.clear(true, true);
        }
        const castleTable = this.getCastleEnemyTable(this.dungeonFloor || 11);
        if (castleTable && castleTable.length && this.castleInteriorFloors && this.castleInteriorFloors.length) {
            const initialCount = Phaser.Math.Between(2, 4);
            for (let i = 0; i < initialCount; i++) {
                const type = Phaser.Utils.Array.GetRandom(castleTable);
                const pos = this.getDistantCastleSpawnPosition();
                if (pos) {
                    this.spawnEnemy(pos.x, pos.y, type);
                }
            }
        }
        this.castleNextRespawnTime = this.time.now + 20000;
    }

    getTutorialEnemyTable(floor) {
        if (floor <= 1) return ['crow'];
        if (floor <= 2) return ['crow', 'poison_mushroom'];
        if (floor <= 4) return ['crow', 'poison_mushroom', 'cursed_stag'];
        return ['poison_mushroom', 'cursed_stag'];
    }

    getForestEnemyTable(floor) {
        if (floor >= 1 && floor <= 5) {
            return ['poison_mushroom', 'cursed_stag', 'crow'];
        }
        if (floor >= 6 && floor <= 10) {
            return ['hanged_wisp', 'mossy_statue', 'yari_goblin', 'crow'];
        }
        return ['normal'];
    }

    getCastleEnemyTable(floor) {
        if (floor >= 11 && floor <= 15) {
            return ['tiny', 'ranged', 'charger', 'spearman'];
        }
        if (floor >= 16 && floor <= 20) {
            return ['normal', 'large', 'ranged', 'tiny'];
        }
        return ['normal'];
    }

    getDistantCastleSpawnPosition() {
        if (!this.castleInteriorFloors || !this.castleInteriorFloors.length) {
            return null;
        }
        if (!this.player || !this.player.active) {
            const cell = Phaser.Utils.Array.GetRandom(this.castleInteriorFloors);
            if (!cell) return null;
            return { x: cell.worldX, y: cell.worldY };
        }
        const px = this.player.x;
        const py = this.player.y;
        const tileSize = this.forestTileSize || 32;
        const minDist = tileSize * 6;
        const minDistSq = minDist * minDist;
        const farCells = [];
        for (let i = 0; i < this.castleInteriorFloors.length; i++) {
            const cell = this.castleInteriorFloors[i];
            const dx = cell.worldX - px;
            const dy = cell.worldY - py;
            const distSq = dx * dx + dy * dy;
            if (distSq >= minDistSq) {
                farCells.push(cell);
            }
        }
        const list = farCells.length ? farCells : this.castleInteriorFloors;
        const chosen = Phaser.Utils.Array.GetRandom(list);
        if (!chosen) return null;
        return { x: chosen.worldX, y: chosen.worldY };
    }

    getDistantForestSpawnPosition() {
        if (!this.forestInteriorFloors || !this.forestInteriorFloors.length) {
            return null;
        }
        if (!this.player || !this.player.active) {
            const cell = Phaser.Utils.Array.GetRandom(this.forestInteriorFloors);
            if (!cell) return null;
            return { x: cell.worldX, y: cell.worldY };
        }
        const px = this.player.x;
        const py = this.player.y;
        const tileSize = this.forestTileSize || 32;
        const minDist = tileSize * 6;
        const minDistSq = minDist * minDist;
        const farCells = [];
        for (let i = 0; i < this.forestInteriorFloors.length; i++) {
            const cell = this.forestInteriorFloors[i];
            const dx = cell.worldX - px;
            const dy = cell.worldY - py;
            const distSq = dx * dx + dy * dy;
            if (distSq >= minDistSq) {
                farCells.push(cell);
            }
        }
        const list = farCells.length ? farCells : this.forestInteriorFloors;
        const chosen = Phaser.Utils.Array.GetRandom(list);
        if (!chosen) return null;
        return { x: chosen.worldX, y: chosen.worldY };
    }

    spawnEnemy(x, y, type = 'normal') {
        const enemy = new Enemy(this, x, y, this.player, type);
        this.enemies.add(enemy);
    }

    addGold(amount) {
        this.gold += amount;
        if (typeof this.runGoldGained === 'number') {
            this.runGoldGained += amount;
        }
    }

    registerEnemyDamage(amount) {
        if (typeof amount === 'number' && amount > 0 && typeof this.runDamageDealt === 'number') {
            this.runDamageDealt += amount;
        }
    }

    registerEnemyKill() {
        if (typeof this.runKillCount === 'number') {
            this.runKillCount += 1;
        }
    }

    registerPlayerDamageTaken(amount) {
        if (typeof amount === 'number' && amount > 0 && typeof this.runDamageTaken === 'number') {
            this.runDamageTaken += amount;
        }
    }

    spawnGold(x, y, amount) {
        const large = Math.floor(amount / 100);
        let rem = amount % 100;
        const medium = Math.floor(rem / 10);
        const small = rem % 10;

        const drops = [
            { count: large, val: 100 },
            { count: medium, val: 10 },
            { count: small, val: 1 }
        ];

        drops.forEach(type => {
            for(let i=0; i<type.count; i++) {
                const drop = this.goldDrops.get(x, y, 'gold_small'); 
                if (drop) {
                    drop.launch(x, y, type.val);
                }
            }
        });
    }

    createObstacleHpBar(obstacle) {
        const tileSize = this.forestTileSize || 32;
        const barWidth = 24;
        const barHeight = 4;
        const x = obstacle.x - barWidth / 2;
        const y = obstacle.y - tileSize / 2 - 6;

        const bg = this.add.graphics();
        bg.setDepth(3);
        bg.fillStyle(0x002200, 0.9);
        bg.fillRect(x, y, barWidth, barHeight);

        const fill = this.add.graphics();
        fill.setDepth(4);

        obstacle.hpBarBg = bg;
        obstacle.hpBarFill = fill;

        this.updateObstacleHpBar(obstacle);
    }

    updateObstacleHpBar(obstacle) {
        if (!obstacle || !obstacle.active) return;
        if (typeof obstacle.hp !== 'number' || typeof obstacle.maxHp !== 'number') return;

        const tileSize = this.forestTileSize || 32;
        const barWidth = 24;
        const barHeight = 4;
        const x = obstacle.x - barWidth / 2;
        const y = obstacle.y - tileSize / 2 - 6;

        if (!obstacle.hpBarBg || !obstacle.hpBarFill) {
            this.createObstacleHpBar(obstacle);
            return;
        }

        obstacle.hpBarBg.clear();
        obstacle.hpBarBg.setDepth(3);
        obstacle.hpBarBg.fillStyle(0x002200, 0.9);
        obstacle.hpBarBg.fillRect(x, y, barWidth, barHeight);

        const ratio = Phaser.Math.Clamp(obstacle.hp / obstacle.maxHp, 0, 1);

        obstacle.hpBarFill.clear();
        obstacle.hpBarFill.setDepth(4);
        obstacle.hpBarFill.fillStyle(0x00ff00, 1);
        obstacle.hpBarFill.fillRect(x + 1, y + 1, (barWidth - 2) * ratio, barHeight - 2);
    }

    spawnGorePieces(x, y, color, scale = 1.0) {
        const pieces = 16;
        for (let i = 0; i < pieces; i++) {
            const isLarge = Math.random() < 0.3;
            let baseSize = isLarge ? Phaser.Math.Between(12, 20) : Phaser.Math.Between(4, 10);
            let size = Math.floor(baseSize * scale);
            if (size < 2) size = 2;

            const key = 'gore_' + size + '_' + color.toString(16);

            if (!this.textures.exists(key)) {
                const graphics = this.make.graphics({ x: 0, y: 0, add: false });
                graphics.setVisible(false);
                graphics.fillStyle(color, 1);
                graphics.fillRect(0, 0, size, size);
                graphics.generateTexture(key, size, size);
                graphics.destroy();
            }

            const gore = this.physics.add.sprite(x, y, key);
            this.gores.add(gore);
            gore.setDepth(5);

            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const speed = Phaser.Math.Between(50, 300);

            gore.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
            gore.setAngularVelocity(Phaser.Math.Between(-360, 360));
            gore.setDrag(Phaser.Math.Between(100, 300));

            this.time.delayedCall(1000, () => {
                if (gore.active) {
                    gore.setVelocity(0);
                    gore.setAngularVelocity(0);
                    if (gore.body) gore.body.enable = false;
                }
            });
        }
    }

    spawnBloodStains(x, y, color, count = 8) {
        if (!this.goreStains) {
            this.goreStains = [];
        }
        for (let i = 0; i < count; i++) {
            const stain = this.add.image(
                x + Phaser.Math.Between(-20, 20),
                y + Phaser.Math.Between(-20, 20),
                'blood'
            );
            stain.setScale(Phaser.Math.FloatBetween(2.0, 4.0));
            stain.setAlpha(0.8);
            stain.setTint(color);
            stain.setDepth(1);
            stain.setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2));
            this.goreStains.push(stain);
        }
    }

    spawnGore(x, y, color, scale = 1.0, bloodColor = 0xcc0000) {
        this.spawnGorePieces(x, y, color, scale);
        this.spawnBloodStains(x, y, bloodColor, 8);
    }

    spawnChestFragments(x, y) {
        const texture = this.textures.get('chest');
        if (!texture) return;

        const source = texture.source[0];
        const sourceWidth = source.width;
        const sourceHeight = source.height;

        // Calculate frame size (divide by 4 for 16 pieces)
        const frameWidth = sourceWidth / 4;
        const frameHeight = sourceHeight / 4;

        // Add frames if they don't exist
        if (!texture.frames['fragment_0_0']) {
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 4; col++) {
                    // add(name, sourceIndex, x, y, width, height)
                    texture.add(`fragment_${row}_${col}`, 0, col * frameWidth, row * frameHeight, frameWidth, frameHeight);
                }
            }
        }

        // Spawn 16 fragments
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                // Calculate offset from center
                const offsetX = (col * 8) - 12; 
                const offsetY = (row * 8) - 12;

                const fragment = this.physics.add.sprite(x + offsetX, y + offsetY, 'chest', `fragment_${row}_${col}`);

                // Force size to 8x8 visually (assuming chest is 32x32 in world)
                fragment.setDisplaySize(8, 8);

                fragment.setTint(0x999999); // Darken the fragments
                fragment.setDepth(2); // Below meat(5), blood(5), attack prediction(10)

                const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
                const speed = Phaser.Math.Between(50, 200);

                fragment.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
                fragment.setAngularVelocity(Phaser.Math.Between(-360, 360));
                fragment.setDrag(Phaser.Math.Between(100, 200));

                this.time.delayedCall(1000, () => {
                    if (fragment.active) {
                        fragment.setVelocity(0);
                        fragment.setAngularVelocity(0);
                        if (fragment.body) fragment.body.enable = false;
                    }
                });
            }
        }
    }

    // Ensure new chests use the full texture, not a frame
    spawnChest(x, y) {
         const chest = new Chest(this, x, y);
         // Reset frame to __BASE to use the whole image
         chest.setFrame('__BASE'); 
         this.chests.add(chest);
         return chest;
    }

    spawnBreakParticles(x, y, count) {
        if (!this.breakDebris) {
            this.breakDebris = [];
        }
        for (let i = 0; i < count; i++) {
            const isLarge = Math.random() < 0.3; 
            const size = isLarge ? Phaser.Math.Between(12, 24) : Phaser.Math.Between(4, 10);
            const textureKey = 'debris_white_' + size;

            if (!this.textures.exists(textureKey)) {
                const graphics = this.make.graphics({x: 0, y: 0, add: false});
                graphics.fillStyle(0xffffff, 1);
                graphics.fillRect(0, 0, size, size);
                graphics.generateTexture(textureKey, size, size);
                graphics.destroy();
            }

            const offsetX = Phaser.Math.Between(-40, 40);
            const offsetY = Phaser.Math.Between(-40, 40);
            const debris = this.physics.add.sprite(x + offsetX, y + offsetY, textureKey);
            this.breakDebris.push(debris);

            const colors = [0x0000ff, 0x000088, 0x000000, 0x222222];
            debris.setTint(Phaser.Utils.Array.GetRandom(colors));

            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const speed = Phaser.Math.Between(200, 600); 

            debris.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
            debris.setAngularVelocity(Phaser.Math.Between(-720, 720)); 
            debris.setDrag(Phaser.Math.Between(400, 800)); 
            debris.setDepth(2000); 

            debris._fadeTimer = this.time.delayedCall(1600, () => {
                debris._fadeTimer = null;
                if (debris.active) {
                    debris._fadeTween = this.tweens.add({
                        targets: debris,
                        alpha: 0,
                        duration: 600,
                        onComplete: () => debris.destroy()
                    });
                }
            });
        }
    }

    freezeBreakParticles() {
        if (!this.breakDebris) return;
        for (const debris of this.breakDebris) {
            if (!debris || !debris.active || !debris.body) continue;
            if (debris._isFrozen) continue;
            debris._savedVelX = debris.body.velocity.x;
            debris._savedVelY = debris.body.velocity.y;
            debris._savedAngularVelocity = debris.body.angularVelocity;
            debris.setVelocity(0, 0);
            debris.setAngularVelocity(0);
            if (debris._fadeTween) {
                debris._fadeTween.pause();
            }
            if (debris._fadeTimer) {
                debris._fadeTimer.remove();
                debris._fadeTimer = null;
            }
            debris._isFrozen = true;
        }
    }

    resumeBreakParticles() {
        if (!this.breakDebris) return;
        for (const debris of this.breakDebris) {
            if (!debris || !debris.active || !debris.body) continue;
            if (!debris._isFrozen) continue;
            const vx = debris._savedVelX || 0;
            const vy = debris._savedVelY || 0;
            const av = debris._savedAngularVelocity || 0;
            debris.setVelocity(vx, vy);
            debris.setAngularVelocity(av);
            if (debris._fadeTween) {
                debris._fadeTween.resume();
            } else if (!debris._fadeTimer) {
                debris._fadeTimer = this.time.delayedCall(1600, () => {
                    debris._fadeTimer = null;
                    if (debris.active) {
                        debris._fadeTween = this.tweens.add({
                            targets: debris,
                            alpha: 0,
                            duration: 600,
                            onComplete: () => debris.destroy()
                        });
                    }
                });
            }
            debris._isFrozen = false;
        }
    }

    beginFatalTimeStop() {
        if (this.isFatalTimeStop) return;
        this.isFatalTimeStop = true;

        if (this.enemies && this.enemies.getChildren) {
            const enemies = this.enemies.getChildren();
            for (const enemy of enemies) {
                if (!enemy || !enemy.anims) continue;
                if (enemy.anims.isPlaying) {
                    enemy._fatalWasAnimating = true;
                    enemy.anims.pause();
                }
            }
        }

        if (this.items && this.items.getChildren) {
            const items = this.items.getChildren();
            for (const item of items) {
                if (!item || !item.onFatalTimeStopStart) continue;
                item.onFatalTimeStopStart();
            }
        }
    }

    endFatalTimeStop() {
        if (!this.isFatalTimeStop) return;
        this.isFatalTimeStop = false;

        if (this.enemies && this.enemies.getChildren) {
            const enemies = this.enemies.getChildren();
            for (const enemy of enemies) {
                if (!enemy || !enemy.anims) continue;
                if (enemy._fatalWasAnimating) {
                    enemy._fatalWasAnimating = false;
                    enemy.anims.resume();
                }
            }
        }

        if (this.items && this.items.getChildren) {
            const items = this.items.getChildren();
            for (const item of items) {
                if (!item || !item.onFatalTimeStopEnd) continue;
                item.onFatalTimeStopEnd();
            }
        }
    }

    spawnPoisonSpores(x, y, count = 10) {
        if (!this.textures.exists('poison_spore')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0x66bb6a, 0.9);
            g.fillCircle(4, 4, 4);
            g.generateTexture('poison_spore', 8, 8);
            g.destroy();
        }
        for (let i = 0; i < count; i++) {
            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const dist = Phaser.Math.Between(30, 110);
            const tx = x + Math.cos(angle) * dist;
            const ty = y + Math.sin(angle) * dist;
            const spore = this.add.image(x, y, 'poison_spore');
            spore.setDepth(4);
            spore.setAlpha(0.8);
            this.tweens.add({
                targets: spore,
                x: tx,
                y: ty,
                alpha: 0,
                scaleX: 0.5,
                scaleY: 0.5,
                duration: 600,
                onComplete: () => spore.destroy()
            });
        }
    }

    spawnSparks(x, y, count = 10, baseAngle = null, color = 0xffff00) {
        for(let i=0; i<count; i++) {
            const spark = this.sparks.get(x, y, 'spark');
            if (spark) {
                let angle;
                if (baseAngle !== null) {
                    // 指定方向（敵の方向）を中心に扇状に散らす (+/- 45度)
                    angle = baseAngle + Phaser.Math.FloatBetween(-0.8, 0.8);
                } else {
                    angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
                }

                const speed = Phaser.Math.Between(100, 300);
                const zSpeed = Phaser.Math.Between(100, 300);
                spark.launch(x, y, angle, speed, zSpeed);
                spark.setTint(color);
            }
        }
    }

    hitStop(duration) {
        if (this.isHitStopping) return;
        this.isHitStopping = true;

        // 物理演算とTweenを一時停止
        this.physics.world.pause();
        this.tweens.pauseAll();
        this.anims.pauseAll();

        // 復帰処理（JavaScriptのタイマーを使用）
        setTimeout(() => {
            if (!this.sys || !this.sys.isActive()) return;

            this.physics.world.resume();
            this.tweens.resumeAll();
            this.anims.resumeAll();
            this.isHitStopping = false;
        }, duration);
    }

    onPlayerDead() {
        this.isGameOver = true;

        // ダンジョン死亡: リュックはロスト、装備は維持してオートセーブ
        if (this.player) {
            this.player.inventory = [];
            this.saveGame();
        }

        // 物理演算を停止（画面停止）
        this.physics.world.pause();
        // TweenとアニメーションはUI用に動かしたいが、ゲーム内のは止めたい。
        // pauseAllするとUIのTweenも動かなくなるので、個別に止めるか、UIだけ動くように工夫が必要。
        // しかし、simpleにするため、物理停止＋Update停止で十分「停止」しているように見えるはず。
        // BloodDropなどはUpdateでisGameOverチェックを入れたので止まる。

        const width = this.scale.width;
        const height = this.scale.height;
        const centerX = width / 2;
        const centerY = height / 2;

        // 画面を暗くするオーバーレイ
        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 0.7);
        graphics.fillRect(0, 0, width, height);
        graphics.setDepth(9000);

        // GAME OVER テキスト
        const gameOverText = this.add.text(centerX, centerY - 40, 'GAME OVER', {
            fontFamily: 'x10y12pxDonguriDuel',
            fontSize: '64px',
            color: '#ff0000'
        }).setOrigin(0.5);
        gameOverText.setDepth(9001);

        // リスタート案内
        const restartText = this.add.text(centerX, centerY + 40, 'Press START to Restart', {
            fontFamily: 'x10y12pxDonguriDuel',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);
        restartText.setDepth(9001);

        // 点滅アニメーション
        this.tweens.add({
            targets: restartText,
            alpha: 0,
            duration: 800,
            yoyo: true,
            repeat: -1
        });
    }

    updateItemPopups() {
        if (!this.itemPopup) return;

        let closestItem = null;
        let minDist = 60; // Detection radius

        this.items.children.iterate((item) => {
            if (!item.active) return;
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, item.x, item.y);
            if (dist < minDist) {
                minDist = dist;
                closestItem = item;
            }
        });

        if (closestItem && closestItem.itemData) {
            this.itemPopup.setVisible(true);
            this.itemPopup.x = closestItem.x + 20;
            this.itemPopup.y = closestItem.y - 100;

            // Keep inside screen
            const screenW = this.scale.width;
            const screenH = this.scale.height;
            if (this.itemPopup.x + 160 > screenW) this.itemPopup.x = screenW - 160;
            if (this.itemPopup.y < 0) this.itemPopup.y = 0;
            if (this.itemPopup.y + 100 > screenH) this.itemPopup.y = screenH - 100;

            const d = closestItem.itemData;
            const colorHex = RARITY_COLORS[d.rarity];
            const colorStr = '#' + colorHex.toString(16).padStart(6, '0');

            this.itemPopup.popupName.setText(d.name);
            this.itemPopup.popupName.setColor(colorStr);

            this.itemPopup.popupPower.setText(`ちから：${d.attackPower}`);
            this.itemPopup.popupSpeed.setText(`そくど：${d.attackSpeed}`);
            this.itemPopup.popupSize.setText(`でかさ：${d.size}`);
        } else {
            this.itemPopup.setVisible(false);
        }
    }

    update(time, delta) {
        this.updateDungeonMinimap();
        if (!this.isGameOver && this.player && this.player.active && typeof this.runElapsedTime === 'number') {
            this.runElapsedTime += delta;
        }

        // Debug Toggle (Back Button / Minus Button -> Button 8)
        const pad = this.input.gamepad.getPad(0);

        const backBtn = pad && pad.buttons && pad.buttons[8]?.pressed;

        if (backBtn && !this.prevBackBtn) {
            if (this.physics.world.drawDebug) {
                this.physics.world.drawDebug = false;
                if (this.physics.world.debugGraphic) {
                    this.physics.world.debugGraphic.clear();
                    this.physics.world.debugGraphic.setVisible(false);
                }
            } else {
                this.physics.world.drawDebug = true;
                if (!this.physics.world.debugGraphic) {
                    this.physics.world.createDebugGraphic();
                }
                this.physics.world.debugGraphic.setVisible(true);
            }
        }
        this.prevBackBtn = backBtn;

        if (this.dungeonTheme === 'castle' && this.castleCurses && this.castleCurses.length && this.player && this.player.active) {
            const tileSize = this.forestTileSize || 32;
            const px = Math.floor(this.player.x / tileSize);
            const py = Math.floor(this.player.y / tileSize);
            let onCurse = false;
            for (let i = 0; i < this.castleCurses.length; i++) {
                const c = this.castleCurses[i];
                if (!c) continue;
                if (c.x === px && c.y === py) {
                    onCurse = true;
                    break;
                }
            }
            if (onCurse) {
                if (!this.player.isCursed) {
                    this.player.isCursed = true;
                    if (!this.player.baseSpeed) {
                        this.player.baseSpeed = this.player.speed;
                    }
                    this.player.speed = this.player.baseSpeed * 0.6;
                    this.showText("呪われた…");
                }
            } else {
                if (this.player.isCursed) {
                    this.player.isCursed = false;
                    if (this.player.baseSpeed) {
                        this.player.speed = this.player.baseSpeed;
                    }
                }
            }
        } else if (this.player && this.player.isCursed) {
            this.player.isCursed = false;
            if (this.player.baseSpeed) {
                this.player.speed = this.player.baseSpeed;
            }
        }

        if (this.dungeonTheme === 'castle' && this.castleSpikes && this.castleSpikes.length && this.player && this.player.active) {
            const tileSize = this.forestTileSize || 32;
            const px = Math.floor(this.player.x / tileSize);
            const py = Math.floor(this.player.y / tileSize);

            let onSpike = false;
            let currentSpike = null;

            for (let i = 0; i < this.castleSpikes.length; i++) {
                const s = this.castleSpikes[i];
                if (!s) continue;
                if (s.x === px && s.y === py) {
                    onSpike = true;
                    currentSpike = s;
                }
            }

            for (let i = 0; i < this.castleSpikes.length; i++) {
                const s = this.castleSpikes[i];
                if (!s || !s.sprite) continue;
                if (s === currentSpike) {
                    if (!s.active) {
                        s.active = true;
                        s.sprite.setTexture('castle_spike_on');
                    }
                } else {
                    if (s.active) {
                        s.active = false;
                        s.sprite.setTexture('castle_spike_off');
                    }
                }
            }

            if (!this.player.spikeState) {
                this.player.spikeState = {
                    onSpike: false,
                    lastDamageTime: 0
                };
            }

            const spikeState = this.player.spikeState;

            if (onSpike && currentSpike && currentSpike.sprite) {
                const interval = 800;
                if (!spikeState.onSpike || time - spikeState.lastDamageTime >= interval) {
                    if (!this.player.isGodMode) {
                        this.player.takeDamage(10, currentSpike.sprite);
                    }
                    spikeState.lastDamageTime = time;
                }
                spikeState.onSpike = true;
            } else if (spikeState) {
                spikeState.onSpike = false;
            }
        } else if (this.player && this.player.spikeState && this.player.spikeState.onSpike) {
            this.player.spikeState.onSpike = false;
        }

        if (this.fogOverlay) {
            this.fogOverlay.setVisible(this.isInForest);
            if (this.isInForest) {
                const speedX = 4;
                const speedY = 1;
                const t = delta / 1000;
                this.fogOverlay.x += speedX * t;
                this.fogOverlay.y += speedY * t;
            }
        }
        const canCheckExit = this.isInForest && this.dungeonExitCell && this.player && this.player.active;
        let nearExit = false;
        if (canCheckExit) {
            const tileSize = this.forestTileSize || 32;
            const ex = this.dungeonExitCell.x * tileSize + tileSize / 2;
            const ey = this.dungeonExitCell.y * tileSize + tileSize / 2;
            const dx = this.player.x - ex;
            const dy = this.player.y - ey;
            const dist2 = dx * dx + dy * dy;
            const threshold = tileSize * 0.6;
            nearExit = dist2 <= threshold * threshold;
        }

        if (nearExit) {
            this.canUseExit = true;
            if (!this.exitPrompt) {
                this.exitPrompt = this.add.text(0, 0, 'すすむ？', {
                    fontFamily: 'x10y12pxDonguriDuel',
                    fontSize: '20px',
                    color: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 4
                }).setOrigin(0.5);
                this.exitPrompt.setDepth(2002);
            }
            const cam = this.cameras.main;
            this.exitPrompt.x = this.player.x - cam.scrollX;
            this.exitPrompt.y = this.player.y - cam.scrollY - 32;
            this.exitPrompt.setVisible(true);
        } else {
            this.canUseExit = false;
            if (this.exitPrompt) {
                this.exitPrompt.setVisible(false);
            }
        }

        const crossBtn = pad && pad.buttons && pad.buttons[0]?.pressed;

        if (this.canUseExit && crossBtn && !this.prevExitConfirmBtn && !this.isExitingFloor && !this.isGameOver && !this.player.isFatalAttacking) {
            this.handleDungeonExit();
        }
        this.prevExitConfirmBtn = !!crossBtn;

        if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F3))) {
            this.player.isGodMode = !this.player.isGodMode;
            const status = this.player.isGodMode ? "ON" : "OFF";
            this.showText(`God Mode: ${status}`);
            console.log(`God Mode: ${status}`);
        }

        const key8 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.EIGHT);
        const key9 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NINE);
        const key0 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ZERO);
        const keyMinus = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.MINUS);

        if (Phaser.Input.Keyboard.JustDown(key8)) {
            if (!this.isGameOver && !this.isExitingFloor && !this.isFloorTransition && this.player && this.player.active) {
                this.dungeonType = 'story';
                this.dungeonFloor = 9;
                this.handleDungeonExit();
            }
        }

        if (Phaser.Input.Keyboard.JustDown(key9)) {
            if (!this.isGameOver && !this.isExitingFloor && !this.isFloorTransition && this.player && this.player.active) {
                this.dungeonType = 'story';
                this.dungeonFloor = 19;
                this.handleDungeonExit();
            }
        }

        if (Phaser.Input.Keyboard.JustDown(key0)) {
            if (!this.isGameOver && !this.isExitingFloor && !this.isFloorTransition && this.player && this.player.active) {
                this.dungeonType = 'story';
                this.dungeonFloor = 29;
                this.handleDungeonExit();
            }
        }

        if (Phaser.Input.Keyboard.JustDown(keyMinus)) {
            const type = this.dungeonType || 'story';
            const finalFloor = this.dungeonFloor && this.dungeonFloor > 0 ? this.dungeonFloor : 30;
            this.scene.start('ClearResultScene', {
                slotIndex: this.slotIndex || 0,
                dungeonType: type,
                finalFloor: finalFloor,
                clearTimeMs: this.runElapsedTime || 0,
                killCount: this.runKillCount || 0,
                damageDealt: this.runDamageDealt || 0,
                damageTaken: this.runDamageTaken || 0,
                goldGained: this.runGoldGained || 0,
                objectsDestroyed: this.runObjectsDestroyed || 0
            });
            return;
        }

        if (this.isGameOver) {
            return;
        }

        // Inventory Control Override
        this.player.dashBlocked = false; 
        if (this.hud && this.hud.isInventoryOpen) {
            if (pad) {
                this.hud.handleGamepadInput(pad);
            }
            // Keep HUD updating
            this.hud.update(); 

            // Allow Player update to handle movement via L-stick
            // But ensure Player ignores D-pad and Actions in its update logic
        } else {
            this.hud.update();
            if (this.player.checkForItemPickup()) {
                this.player.dashBlocked = true;
            }
        }

        // Item Popup Logic
        let targetItemData = null;
        let compareItemData = null;
        let targetX = 0;
        let targetY = 0;
        if (typeof this.isSimplePopup === 'undefined') this.isSimplePopup = false; // Default to detailed mode as requested

        // Global L2 Button Toggle (Index 6)
        const l2Btn = pad && pad.buttons[6] && pad.buttons[6].pressed;
        if (l2Btn && !this.prevL2Btn) {
            this.isSimplePopup = !this.isSimplePopup;
        }
        this.prevL2Btn = l2Btn;


        // HUD Item Check
        if (this.hud && this.hud.isInventoryOpen) {
            if (this.hud.focusArea === 'inventory') {
                const item = this.player.inventory[this.hud.selectedIndex];
                if (item) {
                    targetItemData = item;
                    const col = this.hud.selectedIndex % 4;
                    const row = Math.floor(this.hud.selectedIndex / 4);
                    const layout = this.hud.getLayout();
                    targetX = layout.gridStartX + col * 32;
                    targetY = layout.gridStartY + row * 32 - 100;

                    // Comparison Logic
                    if (item.type === 'weapon' && this.player.equippedWeapon) {
                        compareItemData = this.player.equippedWeapon;
                    } else if (item.type === 'shield' && this.player.equippedShield) {
                        compareItemData = this.player.equippedShield;
                    }
                }
            } else if (this.hud.focusArea === 'equipment') {
                 if (this.hud.equipmentIndex === 0 && this.player.equippedWeapon) {
                     targetItemData = this.player.equippedWeapon;
                     const layout = this.hud.getLayout();
                     targetX = layout.weaponSlotX; 
                     targetY = layout.slotTop - 120; 
                 } else if (this.hud.equipmentIndex === 1 && this.player.equippedShield) {
                     targetItemData = this.player.equippedShield;
                     const layout = this.hud.getLayout();
                     targetX = layout.shieldSlotX; 
                     targetY = layout.slotTop - 120;
                 }
            }
        }

        // World Item Check (only if no HUD item selected)
        if (!targetItemData && this.player && this.player.active) {
             let closestItem = null;
             this.physics.overlap(this.player, this.items, (player, item) => {
                 closestItem = item;
             });

             if (closestItem && closestItem.itemData) {
                 // Always show popup when overlapping
                 targetItemData = closestItem.itemData;

                 // Convert world to screen coordinates
                 const cam = this.cameras.main;
                 targetX = closestItem.x - cam.scrollX;
                 targetY = closestItem.y - cam.scrollY - 120;
             }
        }

        const formatNumber = (num, decimals) => {
            if (typeof num !== 'number' || Number.isNaN(num)) return '0';
            return num.toFixed(decimals).replace(/\.?0+$/, '');
        };

        const formatSignedDelta = (delta, decimals) => {
            const rounded = Number(formatNumber(delta, decimals));
            if (rounded > 0) return `+${formatNumber(rounded, decimals)}`;
            if (rounded < 0) return `${formatNumber(rounded, decimals)}`;
            return '0';
        };

        const stripRarityPrefix = (name) => {
            if (typeof name !== 'string') return '';
            const prefixes = [
                'Normal', 'Rare', 'Epic', 'Legendary',
                'ノーマル', 'レア', 'エピック', 'レジェンダリー'
            ];
            let out = name;
            for (const p of prefixes) {
                out = out.replace(new RegExp(`^${p}\\s+`, 'i'), '');
            }
            return out;
        };

        const updatePopup = (container, data, x, y, { isEquipped = false, referenceItem = null, simpleMode = false } = {}) => {
            if (!data || !container) {
                if (container) container.setVisible(false);
                return null;
            }

            const rColor = RARITY_COLORS[data.rarity] ? '#' + RARITY_COLORS[data.rarity].toString(16).padStart(6, '0') : '#ffffff';
            const rarityLabel = RARITY_LABELS_JP[data.rarity] ?? 'ノーマル';
            const cleanName = stripRarityPrefix(data.name);
            const titleName = isEquipped ? `そうび：${cleanName}` : `${cleanName}`;
            const titleRarity = `（${rarityLabel}）`;
            const lines = [];
            const lineColors = [];

            const posColor = '#3399ff';
            const negColor = '#ff3333';
            const neutralColor = '#ffffff';

            const pushLineWithDelta = (label, value, delta, decimals) => {
                const deltaStr = formatSignedDelta(delta, decimals);
                const show = `${label}：${value} (${deltaStr})`;
                lines.push(show);
                if (delta > 0) lineColors.push(posColor);
                else if (delta < 0) lineColors.push(negColor);
                else lineColors.push(neutralColor);
            };

            if (!simpleMode) {
                if (data.type === 'weapon') {
                if (isEquipped && referenceItem && referenceItem.type === 'weapon') {
                    pushLineWithDelta('ちから', data.attackPower, (referenceItem.attackPower ?? 0) - (data.attackPower ?? 0), 0);
                    pushLineWithDelta('そくど', data.attackSpeed, (referenceItem.attackSpeed ?? 0) - (data.attackSpeed ?? 0), 1);
                    pushLineWithDelta('でかさ', data.size, (referenceItem.size ?? 0) - (data.size ?? 0), 1);
                } else {
                    lines.push(`ちから：${data.attackPower}`);
                    lines.push(`そくど：${data.attackSpeed}`);
                    lines.push(`でかさ：${data.size}`);
                    lineColors.push('#ffffff', '#ffffff', '#ffffff');
                }
            } else {
                const h = data.hardness || 0;
                const t = data.thickness || 0;
                const w = data.weight || 0;
                if (isEquipped && referenceItem && referenceItem.type === 'shield') {
                    pushLineWithDelta('かたさ', h, (referenceItem.hardness || 0) - h, 0);
                    pushLineWithDelta('あつみ', t, (referenceItem.thickness || 0) - t, 0);
                    pushLineWithDelta('おもさ', w, (referenceItem.weight || 0) - w, 0);
                } else {
                    lines.push(`かたさ：${h}`);
                    lines.push(`あつみ：${t}`);
                    lines.push(`おもさ：${w}`);
                    lineColors.push('#ffffff', '#ffffff', '#ffffff');
                }
            }

            const opts = Array.isArray(data.options) ? data.options : [];
            for (const opt of opts) {
                if (!opt || typeof opt.label !== 'string') continue;
                const v = opt.value;
                const unit = opt.unit || '';
                if (typeof v === 'number') {
                    const isPercent = unit === '%';
                    const showVal = isPercent ? `${v}${unit}` : `${v}${unit}`;
                    let prefix = '+';
                    if (opt.key === 'attackSpCostReduction' || opt.key === 'dashCostReduction') {
                        prefix = '-';
                    }
                    lines.push(`${opt.label}${prefix}${showVal}`);
                    lineColors.push('#ffffff');
                } else if (typeof v === 'string') {
                    lines.push(`${opt.label}${v}`);
                    lineColors.push('#ffffff');
                } else {
                    lines.push(`${opt.label}`);
                    lineColors.push('#ffffff');
                }
            }
            }

            if (container.titleNameText) {
                container.titleNameText.setText(titleName);
                container.titleNameText.setColor('#ffffff');
            }
            if (container.titleRarityText) {
                container.titleRarityText.setText(titleRarity);
                container.titleRarityText.setColor(rColor);
                if (container.titleNameText) {
                    container.titleRarityText.setX(container.titleNameText.x + container.titleNameText.width + 4);
                }
            }
            if (container.lineTexts && container.lineTexts.length >= 3) {
                for (let i = 0; i < container.lineTexts.length; i++) {
                    container.lineTexts[i].setText(lines[i] ?? '');
                    container.lineTexts[i].setColor(lineColors[i] ?? '#ffffff');
                }
            } else if (container.textObj) {
                const text = [`${titleName}${titleRarity}`, ...lines].join('\n');
                container.textObj.setText(text);
                container.textObj.setColor('#ffffff');
            }

            const lineCount = Math.max(0, Math.min(lines.length, container.lineTexts?.length ?? lines.length));
            const popupH = 20 + ((1 + lineCount) * 19); 
            const paddingX = 10;
            const minPopupW = 200;
            const maxPopupW = 780;
            const titleW = (container.titleNameText?.width || 0) + 4 + (container.titleRarityText?.width || 0);
            const lineW = container.lineTexts && container.lineTexts.length
                ? Math.max(...container.lineTexts.map(t => t.width || 0))
                : 0;
            const contentW = Math.max(titleW, lineW);
            const popupW = Math.min(maxPopupW, Math.max(minPopupW, Math.ceil(contentW + paddingX * 2)));

            if (container.bg) {
                 container.bg.clear();
                 container.bg.fillStyle(0x000000, 0.8);
                 container.bg.fillRoundedRect(0, 0, popupW, popupH, 5);
                 container.bg.lineStyle(2, 0xffffff, 1);
                 container.bg.strokeRoundedRect(0, 0, popupW, popupH, 5);
            }

            // Clamp to screen
            let px = x;
            let py = y;

            const screenW = this.scale.width;
            const screenH = this.scale.height;

            // Basic clamping
            if (px < 10) px = 10;
            if (px > screenW - popupW - 10) px = screenW - popupW - 10;
            if (py < 10) py = 10;
            if (py > screenH - popupH - 10) py = screenH - popupH - 10;

            // Avoid overlapping HUD inventory grid and equipment slots
            const layout = this.hud ? this.hud.getLayout() : null;
            const avoidRects = layout ? [
                { x: layout.gridStartX, y: layout.gridStartY, w: 128, h: 64 },
                { x: layout.weaponSlotX, y: layout.slotTop, w: 32, h: 32 },
                { x: layout.shieldSlotX, y: layout.slotTop, w: 32, h: 32 },
            ] : [];
            const intersects = (ax, ay, aw, ah, bx, by, bw, bh) =>
                !(ax + aw <= bx || bx + bw <= ax || ay + ah <= by || by + bh <= ay);
            for (const r of avoidRects) {
                if (intersects(px, py, popupW, popupH, r.x, r.y, r.w, r.h)) {
                    // Try move above
                    const aboveY = r.y - popupH - 8;
                    if (aboveY >= 10) {
                        py = aboveY;
                    } else {
                        // Try move left
                        const leftX = r.x - popupW - 8;
                        if (leftX >= 10) {
                            px = leftX;
                        } else {
                            // Try move right
                            const rightX = r.x + r.w + 8;
                            if (rightX + popupW <= screenW - 10) {
                                px = rightX;
                            } else {
                                // Try move below
                                const belowY = r.y + r.h + 8;
                                py = Math.min(belowY, screenH - popupH - 10);
                            }
                        }
                    }
                    // Re-clamp
                    if (px < 10) px = 10;
                    if (px > screenW - popupW - 10) px = screenW - popupW - 10;
                    if (py < 10) py = 10;
                    if (py > screenH - popupH - 10) py = screenH - popupH - 10;
                }
            }

            container.setPosition(px, py);
            container.setVisible(true);
            return { x: px, y: py, w: popupW, h: popupH };
        };

        if (targetItemData) {
            const mainRect = updatePopup(this.itemPopupContainer, targetItemData, targetX, targetY, { isEquipped: false, simpleMode: this.isSimplePopup });

            if (compareItemData && mainRect && !this.isSimplePopup) {
                const tempRect = updatePopup(this.equippedPopupContainer, compareItemData, 0, mainRect.y, { isEquipped: true, referenceItem: targetItemData });
                let compareX = mainRect.x - (tempRect.w + 10);
                let compareY = mainRect.y;
                updatePopup(this.equippedPopupContainer, compareItemData, compareX, compareY, { isEquipped: true, referenceItem: targetItemData });
            } else {
                if (this.equippedPopupContainer) this.equippedPopupContainer.setVisible(false);
            }
        } else {
            if (this.itemPopupContainer) this.itemPopupContainer.setVisible(false);
            if (this.equippedPopupContainer) this.equippedPopupContainer.setVisible(false);
        }

        if (this.dungeonTheme === 'forest' && this.enemies && this.player && this.player.active && this.forestInteriorFloors && this.forestInteriorFloors.length) {
            const now = this.time.now;
            if (!this.forestNextRespawnTime) {
                this.forestNextRespawnTime = now + 20000;
            } else if (now >= this.forestNextRespawnTime) {
                const floor = this.dungeonFloor || 1;
                const table = this.getForestEnemyTable(floor);
                if (table && table.length) {
                    const type = Phaser.Utils.Array.GetRandom(table);
                    const pos = this.getDistantForestSpawnPosition();
                    if (pos) {
                        this.spawnEnemy(pos.x, pos.y, type);
                    }
                }
                this.forestNextRespawnTime = now + 20000;
            }
        }

        if (this.dungeonTheme === 'castle' && this.enemies && this.player && this.player.active && this.castleInteriorFloors && this.castleInteriorFloors.length) {
            const nowCastle = this.time.now;
            if (!this.castleNextRespawnTime) {
                this.castleNextRespawnTime = nowCastle + 20000;
            } else if (nowCastle >= this.castleNextRespawnTime) {
                const floor = this.dungeonFloor || 11;
                const table = this.getCastleEnemyTable(floor);
                if (table && table.length) {
                    const type = Phaser.Utils.Array.GetRandom(table);
                    const pos = this.getDistantCastleSpawnPosition();
                    if (pos) {
                        this.spawnEnemy(pos.x, pos.y, type);
                    }
                }
                this.castleNextRespawnTime = nowCastle + 20000;
            }
        }

        this.player.update(time, delta);
    }

    saveGame() {
        const saveData = {
            level: this.level,
            gold: this.gold,
            player: {
                hp: this.player.hp,
                maxHp: this.player.maxHp,
                stamina: this.player.stamina,
                maxStamina: this.player.maxStamina,
                potions: this.player.potions,
                inventory: this.player.inventory,
                equippedWeapon: this.player.equippedWeapon,
                equippedShield: this.player.equippedShield
            },
            warehouse: WAREHOUSE[this.slotIndex] || []
        };
        localStorage.setItem('rogueSaveData', JSON.stringify(saveData));
        console.log('Game Saved', saveData);
    }

    loadGame() {
        const dataStr = localStorage.getItem('rogueSaveData');
        let loaded = false;

        if (dataStr) {
            try {
                const data = JSON.parse(dataStr);
                this.level = data.level || 1;
                this.gold = data.gold || 0;
                this.displayGold = this.gold;

                if (data.player) {
                    this.player.hp = data.player.hp;
                    this.player.maxHp = data.player.maxHp;
                    this.player.stamina = data.player.stamina;
                    this.player.maxStamina = data.player.maxStamina;
                    this.player.potions = data.player.potions ?? 3;
                    this.player.inventory = Array.isArray(data.player.inventory) ? data.player.inventory : this.player.inventory;
                    this.player.equippedWeapon = data.player.equippedWeapon ?? this.player.equippedWeapon;
                    this.player.equippedShield = data.player.equippedShield ?? this.player.equippedShield;
                    this.player.applyEquippedWeapon();
                    this.player.applyEquippedShield();
                }
                if (data.warehouse) WAREHOUSE[this.slotIndex] = data.warehouse;
                loaded = true;
            } catch (e) {
                console.error('Failed to load save data', e);
            }
        }

        if (!loaded) {
            // Default / New Game
            this.level = 1;
            this.gold = 0;
            this.displayGold = 0;
            // Player already initialized with defaults in constructor
        }

        // Update HUD
        if (this.hud) {
            this.hud.updateInventoryItems();
            this.hud.updateEquipmentSlots();
        }
    }

    createItemPopups() {
        const createPopup = () => {
            const container = this.add.container(0, 0);
            container.setDepth(4000);
            container.setVisible(false);

            const bg = this.add.graphics();
            bg.fillStyle(0x000000, 0.8);
            bg.fillRoundedRect(0, 0, 200, 100, 5);
            bg.lineStyle(2, 0xffffff, 1);
            bg.strokeRoundedRect(0, 0, 200, 100, 5);
            container.add(bg);
            container.bg = bg;

            const titleNameText = this.add.text(10, 10, '', {
                fontFamily: 'x10y12pxDonguriDuel',
                fontSize: '14px',
                color: '#ffffff',
                lineSpacing: 5
            });
            container.add(titleNameText);
            container.titleNameText = titleNameText;

            const titleRarityText = this.add.text(10, 10, '', {
                fontFamily: 'x10y12pxDonguriDuel',
                fontSize: '14px',
                color: '#ffffff',
                lineSpacing: 5
            });
            container.add(titleRarityText);
            container.titleRarityText = titleRarityText;

            const lineTexts = [];
            for (let i = 0; i < 7; i++) {
                const lineText = this.add.text(10, 29 + i * 19, '', {
                    fontFamily: 'x10y12pxDonguriDuel',
                    fontSize: '14px',
                    color: '#ffffff'
                });
                container.add(lineText);
                lineTexts.push(lineText);
            }
            container.lineTexts = lineTexts;
            return container;
        };

        this.itemPopupContainer = createPopup();
        this.equippedPopupContainer = createPopup();

        this.itemPopupText = this.itemPopupContainer.titleNameText;
    }

    showText(msg) {
        const t = this.add.text(400, 100, msg, { fontFamily: 'x10y12pxDonguriDuel', fontSize: '32px', color: '#ffff00' }).setOrigin(0.5);
        t.setDepth(9999);
        this.tweens.add({
            targets: t,
            y: 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => t.destroy()
        });
    }

    showDamagePopup(x, y, damage, color) {
        const t = this.add.text(x, y, damage.toString(), {
            fontFamily: 'x10y12pxDonguriDuel',
            fontSize: '20px',
            fontStyle: 'bold',
            fill: color
        }).setOrigin(0.5);
        t.setDepth(9999);

        this.tweens.add({
            targets: t,
            y: y - 50,
            alpha: 0,
            duration: 800,
            ease: 'Power1',
            onComplete: () => t.destroy()
        });
    }
}

// ============================================================
//  SurvivalScene — ヴァンサバ風 3分間サバイバルモード
//  実際の Player / Enemy クラスをそのまま流用
// ============================================================
