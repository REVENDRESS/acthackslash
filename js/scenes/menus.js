class TitleScene extends Phaser.Scene {
    constructor() {
        super('TitleScene');
        this.menuIndex = 0;
        this.menuItems = [];
        this.prevAxisY = 0;
    }

    create() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;
        const w = this.scale.width;
        const h = this.scale.height;

        // ---- 背景アニメーション ----

        // 漆黒の下地（紫みがかった黒）
        this.add.rectangle(0, 0, w, h, 0x030108, 1).setOrigin(0, 0).setDepth(0);

        // グローオーブテクスチャ（柔らかい発光球、240x240）
        if (!this.textures.exists('title_orb')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0xffffff, 0.55); g.fillCircle(120, 120, 10);
            g.fillStyle(0xffffff, 0.22); g.fillCircle(120, 120, 28);
            g.fillStyle(0xffffff, 0.09); g.fillCircle(120, 120, 65);
            g.fillStyle(0xffffff, 0.04); g.fillCircle(120, 120, 110);
            g.fillStyle(0xffffff, 0.015); g.fillCircle(120, 120, 120);
            g.generateTexture('title_orb', 240, 240);
            g.destroy();
        }

        // マジックスパークテクスチャ（小さい光点）
        if (!this.textures.exists('title_spark')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0xffffff, 1.0); g.fillCircle(3, 3, 3);
            g.fillStyle(0xffffff, 0.35); g.fillCircle(3, 3, 5);
            g.generateTexture('title_spark', 10, 10);
            g.destroy();
        }

        // グローオーブ（5個、ゆっくり漂う）
        const orbDefs = [
            { color: 0x8833ff, scale: 2.2, vx:  20, vy: -14 },
            { color: 0x2255ff, scale: 1.8, vx: -16, vy:  18 },
            { color: 0xff4411, scale: 1.6, vx:  12, vy:  22 },
            { color: 0x00bbff, scale: 1.4, vx: -22, vy: -10 },
            { color: 0xcc22ff, scale: 2.6, vx:   8, vy:  16 },
        ];
        this._orbs = orbDefs.map(def => {
            const orb = this.add.image(
                Phaser.Math.Between(60, w - 60),
                Phaser.Math.Between(60, h - 60),
                'title_orb'
            ).setDepth(1).setTint(def.color).setAlpha(0.75).setScale(def.scale)
             .setBlendMode(Phaser.BlendModes.ADD);
            orb._vx = def.vx;
            orb._vy = def.vy;
            return orb;
        });

        // 四辺ヴィネット（端を暗くしてオーブの発光を引き立てる）
        const vig = this.add.graphics().setDepth(3);
        vig.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.92, 0.92, 0, 0);
        vig.fillRect(0, 0, w, h * 0.4);
        vig.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0, 0.92, 0.92);
        vig.fillRect(0, h * 0.6, w, h * 0.4);
        vig.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.7, 0, 0.7, 0);
        vig.fillRect(0, 0, w * 0.18, h);
        vig.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0.7, 0, 0.7);
        vig.fillRect(w * 0.82, 0, w * 0.18, h);

        // 上昇するマジックパーティクル（65個）
        const sparkTints = [0xffffff, 0xaaddff, 0xddaaff, 0xffddaa, 0x88ffee];
        this._sparks = Array.from({ length: 65 }, () => {
            const sp = this.add.image(
                Phaser.Math.Between(0, w),
                Phaser.Math.Between(0, h),
                'title_spark'
            ).setDepth(4).setBlendMode(Phaser.BlendModes.ADD);
            sp.setTint(sparkTints[Phaser.Math.Between(0, sparkTints.length - 1)]);
            sp.setAlpha(Phaser.Math.FloatBetween(0.3, 1.0));
            sp.setScale(Phaser.Math.FloatBetween(0.3, 1.3));
            sp._vy = Phaser.Math.FloatBetween(-90, -22);
            sp._vx = Phaser.Math.FloatBetween(-12, 12);
            sp._fadeRate = Phaser.Math.FloatBetween(0.1, 0.35);
            return sp;
        });

        // ---- 背景アニメーション ここまで ----

        const title = this.add.text(centerX, centerY - 140, 'DUNGEON', {
            fontFamily: 'x10y12pxDonguriDuel',
            fontSize: '48px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);
        title.setDepth(10);

        const menuTexts = ['はじめから', 'ロード', 'ゲームを終了'];
        const startY = centerY - 10;

        this.menuItems = menuTexts.map((text, i) => {
            const t = this.add.text(centerX, startY + i * 40, text, {
                fontFamily: 'x10y12pxDonguriDuel',
                fontSize: '24px',
                color: '#cccccc'
            }).setOrigin(0.5);
            t.setDepth(10);
            return t;
        });

        this.updateMenuVisual();

        this.input.keyboard.on('keydown-UP', () => this.moveCursor(-1));
        this.input.keyboard.on('keydown-DOWN', () => this.moveCursor(1));
        this.input.keyboard.on('keydown-W', () => this.moveCursor(-1));
        this.input.keyboard.on('keydown-S', () => this.moveCursor(1));
        this.input.keyboard.on('keydown-ENTER', () => this.selectCurrent());
        this.input.keyboard.on('keydown-SPACE', () => this.selectCurrent());
        this.input.keyboard.on('keydown-Z', () => this.selectCurrent());

        this.prevConfirm = undefined;
        this.prevCancel = undefined;
        this.input.gamepad.on('connected', pad => {
            this.gamepad = pad;
        });
    }

    moveCursor(dir) {
        const max = this.menuItems.length;
        this.menuIndex = (this.menuIndex + dir + max) % max;
        this.updateMenuVisual();
    }

    updateMenuVisual() {
        this.menuItems.forEach((item, i) => {
            if (i === this.menuIndex) {
                item.setColor('#ffffff');
                item.setStyle({ fontStyle: 'bold' });
            } else {
                item.setColor('#777777');
                item.setStyle({ fontStyle: 'normal' });
            }
        });
    }

    selectCurrent() {
        const index = this.menuIndex;
        if (index === 0) {
            this.scene.start('SaveSlotScene', { mode: 'new' });
        } else if (index === 1) {
            this.scene.start('SaveSlotScene', { mode: 'load' });
        } else if (index === 2) {
            this.game.destroy(true);
        }
    }

    update(time, delta) {
        const dt = delta / 1000;

        // グローオーブ更新（ゆっくり漂い、端で反射）
        if (this._orbs) {
            const w = this.scale.width;
            const h = this.scale.height;
            this._orbs.forEach(orb => {
                orb.x += orb._vx * dt;
                orb.y += orb._vy * dt;
                if (orb.x < -60 || orb.x > w + 60) orb._vx *= -1;
                if (orb.y < -60 || orb.y > h + 60) orb._vy *= -1;
            });
        }

        // マジックパーティクル更新（下から湧いて上へ消える）
        if (this._sparks) {
            const w = this.scale.width;
            const h = this.scale.height;
            const sparkTints = [0xffffff, 0xaaddff, 0xddaaff, 0xffddaa, 0x88ffee];
            this._sparks.forEach(sp => {
                sp.x += sp._vx * dt;
                sp.y += sp._vy * dt;
                sp.setAlpha(sp.alpha - sp._fadeRate * dt);
                if (sp.y < -10 || sp.alpha <= 0.04) {
                    sp.x = Phaser.Math.Between(0, w);
                    sp.y = Phaser.Math.Between(h + 5, h + 40);
                    sp._vy = Phaser.Math.FloatBetween(-90, -22);
                    sp._vx = Phaser.Math.FloatBetween(-12, 12);
                    sp._fadeRate = Phaser.Math.FloatBetween(0.1, 0.35);
                    sp.setTint(sparkTints[Phaser.Math.Between(0, sparkTints.length - 1)]);
                    sp.setAlpha(Phaser.Math.FloatBetween(0.5, 1.0));
                    sp.setScale(Phaser.Math.FloatBetween(0.3, 1.3));
                }
            });
        }

        const pads = this.input.gamepad.gamepads;
        if (pads && pads.length > 0 && this.time.now > (this.game.registry.get('_padTimer') || 0)) {
            const pad = this.input.gamepad.getPad();
            if (pad) {
                const axisY = pad.axes.length > 1 ? pad.axes[1].getValue() : 0;
                const threshold = 0.4;
                if (axisY > threshold && this.prevAxisY <= threshold) {
                    this.moveCursor(1);
                } else if (axisY < -threshold && this.prevAxisY >= -threshold) {
                    this.moveCursor(-1);
                }
                this.prevAxisY = axisY;

                const up = pad.up;
                const down = pad.down;

                if (up && this.prevUp === false) {
                    this.moveCursor(-1);
                }
                if (down && this.prevDown === false) {
                    this.moveCursor(1);
                }
                this.prevUp = up;
                this.prevDown = down;

                const confirm = pad.A || pad.X;
                if (confirm && this.prevConfirm === false) {
                    this.selectCurrent();
                }
                if (!this.prevConfirm && confirm) this.game.registry.set('_padTimer', this.time.now + PAD_DEBOUNCE_MS);
                this.prevConfirm = confirm;
            }
        }
    }
}

const SAVE_SLOTS = [
    null,
    null,
    null
];

const WAREHOUSE = [[], [], []];

class SaveSlotScene extends Phaser.Scene {
    constructor() {
        super('SaveSlotScene');
        this.menuIndex = 0;
        this.menuItems = [];
        this.mode = 'new';
        this.prevAxisY = 0;
    }

    init(data) {
        this.mode = data && data.mode ? data.mode : 'new';
    }

    create() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        const titleText = this.mode === 'new' ? 'セーブスロット選択（はじめから）' : 'セーブスロット選択（ロード）';

        const title = this.add.text(centerX, centerY - 150, titleText, {
            fontFamily: 'x10y12pxDonguriDuel',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);
        title.setDepth(10);

        const startY = centerY - 40;

        this.menuItems = [0, 1, 2].map(i => {
            const slotData = SAVE_SLOTS[i];
            let label;
            if (!slotData) {
                label = `スロット${i + 1}：空`;
            } else {
                const floor = slotData.floor != null ? slotData.floor : 0;
                label = `スロット${i + 1}：${floor}階まで`;
            }
            const t = this.add.text(centerX, startY + i * 40, label, {
                fontFamily: 'x10y12pxDonguriDuel',
                fontSize: '22px',
                color: '#cccccc'
            }).setOrigin(0.5);
            t.setDepth(10);
            return t;
        });

        this.updateMenuVisual();

        this.input.keyboard.on('keydown-UP', () => this.moveCursor(-1));
        this.input.keyboard.on('keydown-DOWN', () => this.moveCursor(1));
        this.input.keyboard.on('keydown-W', () => this.moveCursor(-1));
        this.input.keyboard.on('keydown-S', () => this.moveCursor(1));
        this.input.keyboard.on('keydown-ENTER', () => this.selectCurrent());
        this.input.keyboard.on('keydown-SPACE', () => this.selectCurrent());
        this.input.keyboard.on('keydown-Z', () => this.selectCurrent());
        this.input.keyboard.on('keydown-ESC', () => this.cancel());
        this.input.keyboard.on('keydown-X', () => this.cancel());
        this.prevConfirm = undefined;
        this.prevCancel = undefined;
    }

    moveCursor(dir) {
        const max = this.menuItems.length;
        this.menuIndex = (this.menuIndex + dir + max) % max;
        this.updateMenuVisual();
    }

    updateMenuVisual() {
        this.menuItems.forEach((item, i) => {
            if (i === this.menuIndex) {
                item.setColor('#ffffff');
                item.setStyle({ fontStyle: 'bold' });
            } else {
                item.setColor('#777777');
                item.setStyle({ fontStyle: 'normal' });
            }
        });
    }

    selectCurrent() {
        const index = this.menuIndex;
        const slotData = SAVE_SLOTS[index];
        if (this.mode === 'load' && !slotData) {
            return;
        }
        const data = {
            slotIndex: index
        };
        this.scene.start('BaseMenuScene', data);
    }

    cancel() {
        this.scene.start('TitleScene');
    }

    update() {
        const pads = this.input.gamepad.gamepads;
        if (pads && pads.length > 0 && this.time.now > (this.game.registry.get('_padTimer') || 0)) {
            const pad = this.input.gamepad.getPad();
            if (pad) {
                const axisY = pad.axes.length > 1 ? pad.axes[1].getValue() : 0;
                const threshold = 0.4;
                if (axisY > threshold && this.prevAxisY <= threshold) {
                    this.moveCursor(1);
                } else if (axisY < -threshold && this.prevAxisY >= -threshold) {
                    this.moveCursor(-1);
                }
                this.prevAxisY = axisY;

                const up = pad.up;
                const down = pad.down;

                if (up && this.prevUp === false) {
                    this.moveCursor(-1);
                }
                if (down && this.prevDown === false) {
                    this.moveCursor(1);
                }
                this.prevUp = up;
                this.prevDown = down;

                const confirm = pad.A || pad.X;
                if (confirm && this.prevConfirm === false) {
                    this.selectCurrent();
                }
                const cancel = pad.B;
                if (cancel && this.prevCancel === false) {
                    this.cancel();
                }
                if (!this.prevConfirm && confirm) this.game.registry.set('_padTimer', this.time.now + PAD_DEBOUNCE_MS);
                this.prevConfirm = confirm;
                if (!this.prevCancel && cancel) this.game.registry.set('_padTimer', this.time.now + PAD_DEBOUNCE_MS);
                this.prevCancel = cancel;
            }
        }
    }
}

class BaseMenuScene extends Phaser.Scene {
    constructor() {
        super('BaseMenuScene');
        this.menuIndex = 0;
        this.menuItems = [];
        this.menuDefinitions = [];
        this.prevAxisY = 0;
        this.slotIndex = 0;
        this.descriptionTitle = null;
        this.descriptionText = null;
    }

    init(data) {
        this.slotIndex = data && typeof data.slotIndex === 'number' ? data.slotIndex : 0;
    }

    create() {
        const menuDefs = [
            {
                label: 'ダンジョンへ向かう',
                title: 'ダンジョンへ向かう',
                description: '呪いに満ちたダンジョンへ出発する。現在の装備で階層に挑む。'
            },
            {
                label: '倉庫／ショップ',
                title: '倉庫／ショップ',
                description: '左の倉庫番で装備と保管、右の商人で商品の購入ができる。'
            },
            {
                label: 'アリーナ',
                title: 'アリーナ',
                description: '強敵との対戦でアリーナポイントを稼ぎ、特別な装備と交換できる。'
            },
            {
                label: 'オプション',
                title: 'オプション',
                description: '音量や操作設定を変更する。'
            },
            {
                label: 'タイトルへ戻る',
                title: 'タイトルへ戻る',
                description: 'タイトル画面に戻る。セーブが実装されたらここで確認が入る。'
            }
        ];

        this.menuDefinitions = menuDefs;

        const leftWidth = this.scale.width * 0.5;
        const centerY = this.scale.height / 2;
        const w = this.scale.width;
        const h = this.scale.height;

        // 背景アニメーション用のオーブテクスチャ（TitleSceneと共有）
        if (!this.textures.exists('title_orb')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0xffffff, 0.55); g.fillCircle(120, 120, 10);
            g.fillStyle(0xffffff, 0.22); g.fillCircle(120, 120, 28);
            g.fillStyle(0xffffff, 0.09); g.fillCircle(120, 120, 65);
            g.fillStyle(0xffffff, 0.04); g.fillCircle(120, 120, 110);
            g.fillStyle(0xffffff, 0.015); g.fillCircle(120, 120, 120);
            g.generateTexture('title_orb', 240, 240);
            g.destroy();
        }
        if (!this.textures.exists('title_spark')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0xffffff, 1.0); g.fillCircle(3, 3, 3);
            g.fillStyle(0xffffff, 0.35); g.fillCircle(3, 3, 5);
            g.generateTexture('title_spark', 10, 10);
            g.destroy();
        }

        // 暗い下地
        this.add.rectangle(0, 0, w, h, 0x050808, 1).setOrigin(0, 0).setDepth(0);

        // 背景グローオーブ（落ち着いた青緑系）
        const baseOrbDefs = [
            { color: 0x1144aa, scale: 3.0, vx:  10, vy:  7 },
            { color: 0x006644, scale: 2.2, vx: -12, vy: -9 },
            { color: 0x223388, scale: 2.6, vx:   8, vy: 11 },
        ];
        this._baseOrbs = baseOrbDefs.map(def => {
            const orb = this.add.image(
                Phaser.Math.Between(80, w - 80),
                Phaser.Math.Between(80, h - 80),
                'title_orb'
            ).setDepth(0).setTint(def.color).setAlpha(0.6).setScale(def.scale)
             .setBlendMode(Phaser.BlendModes.ADD);
            orb._vx = def.vx;
            orb._vy = def.vy;
            return orb;
        });

        // パネル（半透明にしてオーブが透けるように）
        const bg = this.add.rectangle(0, 0, w, h, 0x080d10, 0.88);
        bg.setOrigin(0, 0);
        bg.setDepth(1);

        const leftBg = this.add.rectangle(0, 0, leftWidth, h, 0x0e1318, 0.92);
        leftBg.setOrigin(0, 0);
        leftBg.setDepth(1);

        const rightBg = this.add.rectangle(leftWidth, 0, w - leftWidth, h, 0x111820, 0.92);
        rightBg.setOrigin(0, 0);
        rightBg.setDepth(1);

        // パネルの境界線（光る縦ライン）
        const divLine = this.add.graphics().setDepth(2);
        divLine.lineStyle(1, 0x334455, 0.8);
        divLine.beginPath();
        divLine.moveTo(leftWidth, 0);
        divLine.lineTo(leftWidth, h);
        divLine.strokePath();
        divLine.lineStyle(1, 0x446688, 0.3);
        divLine.beginPath();
        divLine.moveTo(leftWidth + 1, 0);
        divLine.lineTo(leftWidth + 1, h);
        divLine.strokePath();

        // 浮遊するダストパーティクル（全体、パネルより上のレイヤー）
        const dustTints = [0x4466aa, 0x336688, 0x225566, 0x557799, 0x334477];
        this._baseDust = Array.from({ length: 40 }, () => {
            const sp = this.add.image(
                Phaser.Math.Between(0, w),
                Phaser.Math.Between(0, h),
                'title_spark'
            ).setDepth(3).setBlendMode(Phaser.BlendModes.ADD);
            sp.setTint(dustTints[Phaser.Math.Between(0, dustTints.length - 1)]);
            sp.setAlpha(Phaser.Math.FloatBetween(0.15, 0.45));
            sp.setScale(Phaser.Math.FloatBetween(0.3, 0.9));
            sp._vy = Phaser.Math.FloatBetween(-22, -6);
            sp._vx = Phaser.Math.FloatBetween(-5, 5);
            sp._fadeRate = Phaser.Math.FloatBetween(0.04, 0.12);
            return sp;
        });

        const menuTitle = this.add.text(leftWidth / 2, 80, '拠点', {
            fontFamily: 'x10y12pxDonguriDuel',
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);
        menuTitle.setDepth(2);

        const startY = centerY - (menuDefs.length * 32) / 2;

        this.menuItems = menuDefs.map((def, i) => {
            const t = this.add.text(leftWidth / 2, startY + i * 40, def.label, {
                fontFamily: 'x10y12pxDonguriDuel',
                fontSize: '22px',
                color: '#777777'
            }).setOrigin(0.5);
            t.setDepth(2);
            return t;
        });

        this.descriptionTitle = this.add.text(leftWidth + 40, 100, '', {
            fontFamily: 'x10y12pxDonguriDuel',
            fontSize: '26px',
            fontStyle: 'bold',
            color: '#ffffff',
            wordWrap: { width: this.scale.width - leftWidth - 80 }
        });
        this.descriptionTitle.setDepth(2);

        this.descriptionText = this.add.text(leftWidth + 40, 150, '', {
            fontFamily: 'x10y12pxDonguriDuel',
            fontSize: '20px',
            color: '#cccccc',
            wordWrap: { width: this.scale.width - leftWidth - 80 }
        });
        this.descriptionText.setDepth(2);

        this.updateMenuVisual();
        this.updateDescription();

        this.input.keyboard.on('keydown-UP', () => this.moveCursor(-1));
        this.input.keyboard.on('keydown-DOWN', () => this.moveCursor(1));
        this.input.keyboard.on('keydown-W', () => this.moveCursor(-1));
        this.input.keyboard.on('keydown-S', () => this.moveCursor(1));
        this.input.keyboard.on('keydown-ENTER', () => this.selectCurrent());
        this.input.keyboard.on('keydown-SPACE', () => this.selectCurrent());
        this.input.keyboard.on('keydown-Z', () => this.selectCurrent());
        this.input.keyboard.on('keydown-ESC', () => this.backToTitle());
        this.input.keyboard.on('keydown-X', () => this.backToTitle());
        this.prevConfirm = undefined;
        this.prevCancel = undefined;
    }

    moveCursor(dir) {
        const max = this.menuItems.length;
        this.menuIndex = (this.menuIndex + dir + max) % max;
        this.updateMenuVisual();
        this.updateDescription();
    }

    updateMenuVisual() {
        this.menuItems.forEach((item, i) => {
            if (i === this.menuIndex) {
                item.setColor('#ffffff');
                item.setStyle({ fontStyle: 'bold' });
            } else {
                item.setColor('#777777');
                item.setStyle({ fontStyle: 'normal' });
            }
        });
    }

    updateDescription() {
        const def = this.menuDefinitions[this.menuIndex];
        if (!def) return;
        this.descriptionTitle.setText(def.title);
        this.descriptionText.setText(def.description);
    }

    selectCurrent() {
        const index = this.menuIndex;
        const def = this.menuDefinitions[index];
        if (!def) return;
        if (def.label === 'ダンジョンへ向かう') {
            this.scene.start('DungeonSelectScene', { slotIndex: this.slotIndex });
        } else if (def.label === '倉庫／ショップ') {
            this.scene.start('WarehouseShopScene', { slotIndex: this.slotIndex });
        } else if (def.label === 'アリーナ') {
            this.scene.start('ArenaScene', { slotIndex: this.slotIndex });
        } else if (def.label === 'オプション') {
            this.showOptionInfo();
        } else if (def.label === 'タイトルへ戻る') {
            this.backToTitle();
        }
    }

    showOptionInfo() {
        if (this.optionPopup) {
            this.optionPopup.destroy();
            this.optionPopup = null;
        }
        const w = 420;
        const h = 140;
        const x = this.scale.width / 2;
        const y = this.scale.height / 2;
        const container = this.add.container(0, 0);
        const bg = this.add.rectangle(x, y, w, h, 0x000000, 0.9);
        bg.setStrokeStyle(2, 0xffffff, 1);
        const text = this.add.text(x, y, 'オプションは今後追加予定。', {
            fontFamily: 'x10y12pxDonguriDuel',
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);
        container.add(bg);
        container.add(text);
        container.setDepth(20);
        this.optionPopup = container;
        this.time.delayedCall(1200, () => {
            if (this.optionPopup) {
                this.optionPopup.destroy();
                this.optionPopup = null;
            }
        });
    }

    backToTitle() {
        this.scene.start('TitleScene');
    }

    update(time, delta) {
        const dt = delta / 1000;

        // 背景オーブ更新
        if (this._baseOrbs) {
            const w = this.scale.width;
            const h = this.scale.height;
            this._baseOrbs.forEach(orb => {
                orb.x += orb._vx * dt;
                orb.y += orb._vy * dt;
                if (orb.x < -80 || orb.x > w + 80) orb._vx *= -1;
                if (orb.y < -80 || orb.y > h + 80) orb._vy *= -1;
            });
        }

        // ダストパーティクル更新
        if (this._baseDust) {
            const w = this.scale.width;
            const h = this.scale.height;
            this._baseDust.forEach(sp => {
                sp.x += sp._vx * dt;
                sp.y += sp._vy * dt;
                sp.setAlpha(sp.alpha - sp._fadeRate * dt);
                if (sp.y < -10 || sp.alpha <= 0.01) {
                    const dustTints = [0x4466aa, 0x336688, 0x225566, 0x557799, 0x334477];
                    sp.x = Phaser.Math.Between(0, w);
                    sp.y = Phaser.Math.Between(h + 5, h + 35);
                    sp._vy = Phaser.Math.FloatBetween(-22, -6);
                    sp._vx = Phaser.Math.FloatBetween(-5, 5);
                    sp._fadeRate = Phaser.Math.FloatBetween(0.04, 0.12);
                    sp.setTint(dustTints[Phaser.Math.Between(0, dustTints.length - 1)]);
                    sp.setAlpha(Phaser.Math.FloatBetween(0.18, 0.5));
                    sp.setScale(Phaser.Math.FloatBetween(0.3, 0.9));
                }
            });
        }

        const pads = this.input.gamepad.gamepads;
        if (pads && pads.length > 0 && this.time.now > (this.game.registry.get('_padTimer') || 0)) {
            const pad = this.input.gamepad.getPad();
            if (pad) {
                const axisY = pad.axes.length > 1 ? pad.axes[1].getValue() : 0;
                const threshold = 0.4;
                if (axisY > threshold && this.prevAxisY <= threshold) {
                    this.moveCursor(1);
                } else if (axisY < -threshold && this.prevAxisY >= -threshold) {
                    this.moveCursor(-1);
                }
                this.prevAxisY = axisY;

                const up = pad.up;
                const down = pad.down;

                if (up && this.prevUp === false) {
                    this.moveCursor(-1);
                }
                if (down && this.prevDown === false) {
                    this.moveCursor(1);
                }
                this.prevUp = up;
                this.prevDown = down;

                const confirm = pad.A || pad.X;
                if (confirm && this.prevConfirm === false) {
                    this.selectCurrent();
                }
                const cancel = pad.B;
                if (cancel && this.prevCancel === false) {
                    this.backToTitle();
                }
                if (!this.prevConfirm && confirm) this.game.registry.set('_padTimer', this.time.now + PAD_DEBOUNCE_MS);
                this.prevConfirm = confirm;
                if (!this.prevCancel && cancel) this.game.registry.set('_padTimer', this.time.now + PAD_DEBOUNCE_MS);
                this.prevCancel = cancel;
            }
        }
    }
}

class WarehouseShopScene extends Phaser.Scene {
    constructor() {
        super('WarehouseShopScene');
        this.slotIndex = 0;
        this.activePanel = 'inventory';
        this.inventoryCursor = 0;
        this.warehouseCursor = 0;
        this.inventory = [];
        this.equippedWeapon = null;
        this.equippedShield = null;
        this.prevAxisY = 0;
        this.prevAxisX = 0;
        this.prevConfirm = false;
        this.prevCancel = false;
        this.warningTimer = 0;
    }

    init(data) {
        this.slotIndex = data && typeof data.slotIndex === 'number' ? data.slotIndex : 0;
    }

    create() {
        this.loadFromStorage();

        const w = this.scale.width;
        const h = this.scale.height;
        const half = w / 2;
        this.W = w;
        this.H = h;
        this.HALF = half;

        const bg = this.add.rectangle(0, 0, w, h, 0x101010, 1).setOrigin(0, 0).setDepth(0);

        const leftRoom = this.add.rectangle(0, 0, half - 2, h, 0x181822, 1).setOrigin(0, 0).setDepth(1);
        const rightRoom = this.add.rectangle(half + 2, 0, half - 2, h, 0x1f1f2a, 1).setOrigin(0, 0).setDepth(1);
        const divider = this.add.rectangle(half - 1, 0, 2, h, 0x333355, 1).setOrigin(0, 0).setDepth(1);

        this.add.text(half / 2, 36, '所持品', {
            fontFamily: 'x10y12pxDonguriDuel', fontSize: '24px', fontStyle: 'bold', color: '#ffffff'
        }).setOrigin(0.5).setDepth(2);

        this.add.text(half + half / 2, 36, '倉庫', {
            fontFamily: 'x10y12pxDonguriDuel', fontSize: '24px', fontStyle: 'bold', color: '#ffffff'
        }).setOrigin(0.5).setDepth(2);

        this.equippedLabel = this.add.text(24, 68, '', {
            fontFamily: 'x10y12pxDonguriDuel', fontSize: '14px', color: '#aaaaaa'
        }).setDepth(2);
        this.refreshEquippedLabel();

        this.itemListY = 110;
        this.itemRowH = 38;
        this.visibleRows = Math.floor((h - this.itemListY - 60) / this.itemRowH);

        this.inventoryRows = [];
        this.warehouseRows = [];
        for (let i = 0; i < this.visibleRows; i++) {
            const y = this.itemListY + i * this.itemRowH;
            const invText = this.add.text(28, y, '', {
                fontFamily: 'x10y12pxDonguriDuel', fontSize: '16px', color: '#aaaaaa'
            }).setDepth(2);
            this.inventoryRows.push(invText);

            const whText = this.add.text(half + 28, y, '', {
                fontFamily: 'x10y12pxDonguriDuel', fontSize: '16px', color: '#aaaaaa'
            }).setDepth(2);
            this.warehouseRows.push(whText);
        }

        this.emptyInvText = this.add.text(half / 2, this.itemListY + 20, '空', {
            fontFamily: 'x10y12pxDonguriDuel', fontSize: '20px', color: '#555566'
        }).setOrigin(0.5, 0).setDepth(2).setVisible(false);

        this.emptyWhText = this.add.text(half + half / 2, this.itemListY + 20, '空', {
            fontFamily: 'x10y12pxDonguriDuel', fontSize: '20px', color: '#555566'
        }).setOrigin(0.5, 0).setDepth(2).setVisible(false);

        this.panelIndicatorLeft = this.add.text(half / 2, 14, '▼', {
            fontFamily: 'x10y12pxDonguriDuel', fontSize: '12px', color: '#aaddff'
        }).setOrigin(0.5).setDepth(2).setVisible(false);

        this.panelIndicatorRight = this.add.text(half + half / 2, 14, '▼', {
            fontFamily: 'x10y12pxDonguriDuel', fontSize: '12px', color: '#aaddff'
        }).setOrigin(0.5).setDepth(2).setVisible(false);

        this.warningText = this.add.text(w / 2, h / 2, '所持品がいっぱいです（最大8個）', {
            fontFamily: 'x10y12pxDonguriDuel', fontSize: '20px', color: '#ff4444',
            backgroundColor: '#000000', padding: { x: 16, y: 8 }
        }).setOrigin(0.5).setDepth(10).setVisible(false);

        this.add.text(w / 2, h - 22, '↑↓:選択  ←→:パネル切替  Enter/Z:移動  ESC/B:保存して戻る', {
            fontFamily: 'x10y12pxDonguriDuel', fontSize: '14px', color: '#778899'
        }).setOrigin(0.5).setDepth(2);

        this.input.keyboard.on('keydown-ESC', () => this.saveAndBack());
        this.input.keyboard.on('keydown-X', () => this.saveAndBack());
        this.input.keyboard.on('keydown-UP', () => this.moveCursor(-1));
        this.input.keyboard.on('keydown-W', () => this.moveCursor(-1));
        this.input.keyboard.on('keydown-DOWN', () => this.moveCursor(1));
        this.input.keyboard.on('keydown-S', () => this.moveCursor(1));
        this.input.keyboard.on('keydown-LEFT', () => this.switchPanel('inventory'));
        this.input.keyboard.on('keydown-A', () => this.switchPanel('inventory'));
        this.input.keyboard.on('keydown-RIGHT', () => this.switchPanel('warehouse'));
        this.input.keyboard.on('keydown-D', () => this.switchPanel('warehouse'));
        this.input.keyboard.on('keydown-ENTER', () => this.transferItem());
        this.input.keyboard.on('keydown-SPACE', () => this.transferItem());
        this.input.keyboard.on('keydown-Z', () => this.transferItem());

        this.refreshDisplay();
    }

    loadFromStorage() {
        const dataStr = localStorage.getItem('rogueSaveData');
        this.inventory = [];
        this.equippedWeapon = null;
        this.equippedShield = null;
        if (dataStr) {
            try {
                const data = JSON.parse(dataStr);
                if (data.player) {
                    this.inventory = Array.isArray(data.player.inventory) ? data.player.inventory.slice() : [];
                    this.equippedWeapon = data.player.equippedWeapon || null;
                    this.equippedShield = data.player.equippedShield || null;
                }
                if (data.warehouse) {
                    WAREHOUSE[this.slotIndex] = data.warehouse.slice();
                }
            } catch (e) {}
        }
    }

    saveToStorage() {
        const dataStr = localStorage.getItem('rogueSaveData');
        let saveData = {};
        if (dataStr) {
            try { saveData = JSON.parse(dataStr); } catch (e) {}
        }
        if (!saveData.player) {
            saveData.player = {
                hp: 100, maxHp: 100,
                stamina: 100, maxStamina: 100,
                potions: 3
            };
        }
        saveData.player.inventory = this.inventory;
        saveData.warehouse = WAREHOUSE[this.slotIndex];
        localStorage.setItem('rogueSaveData', JSON.stringify(saveData));
    }

    refreshEquippedLabel() {
        let lines = [];
        if (this.equippedWeapon) {
            const wt = WEAPON_TYPES[this.equippedWeapon.typeId];
            const wname = wt ? wt.name : this.equippedWeapon.name || '?';
            lines.push('装備武器: ' + wname);
        }
        if (this.equippedShield) {
            const st = SHIELD_TYPES[this.equippedShield.typeId];
            const sname = st ? st.name : this.equippedShield.name || '?';
            lines.push('装備盾:　' + sname);
        }
        if (lines.length === 0) lines.push('装備なし');
        this.equippedLabel.setText(lines.join('\n'));
    }

    getItemColor(item) {
        const r = item.rarity ?? 0;
        const colorMap = { 0: '#aaaaaa', 1: '#4488ff', 2: '#aa44ff', 3: '#ffaa00' };
        return colorMap[r] || '#aaaaaa';
    }

    getItemLabel(item) {
        const typeLabel = item.type === 'weapon' ? '武' : '盾';
        const rarityLabel = RARITY_LABELS_JP[item.rarity ?? 0] || '';
        let stat = '';
        if (item.type === 'weapon') {
            stat = item.attackPower !== undefined ? ' ATK' + item.attackPower : '';
        } else {
            stat = item.hardness !== undefined ? ' DEF' + item.hardness : '';
        }
        return '[' + typeLabel + '] ' + (item.name || '?') + stat + ' ' + rarityLabel;
    }

    isEquipped(item) {
        if (!item || !item.id) return false;
        if (this.equippedWeapon && this.equippedWeapon.id === item.id) return true;
        if (this.equippedShield && this.equippedShield.id === item.id) return true;
        return false;
    }

    getScrollOffset(cursor, total) {
        const half = Math.floor(this.visibleRows / 2);
        let start = cursor - half;
        if (start < 0) start = 0;
        if (start + this.visibleRows > total) start = Math.max(0, total - this.visibleRows);
        return start;
    }

    refreshDisplay() {
        const inv = this.inventory;
        const wh = WAREHOUSE[this.slotIndex];

        const invOffset = this.getScrollOffset(this.inventoryCursor, inv.length);
        const whOffset = this.getScrollOffset(this.warehouseCursor, wh.length);

        this.emptyInvText.setVisible(inv.length === 0);
        this.emptyWhText.setVisible(wh.length === 0);

        for (let i = 0; i < this.visibleRows; i++) {
            const invIdx = invOffset + i;
            const whIdx = whOffset + i;
            const invRow = this.inventoryRows[i];
            const whRow = this.warehouseRows[i];

            if (invIdx < inv.length) {
                const item = inv[invIdx];
                const isSelected = this.activePanel === 'inventory' && invIdx === this.inventoryCursor;
                const equipped = this.isEquipped(item);
                const label = this.getItemLabel(item) + (equipped ? ' ★' : '');
                if (isSelected) {
                    invRow.setText('▶ ' + label).setColor('#ffffff').setStyle({ fontStyle: 'bold' });
                } else if (equipped) {
                    invRow.setText('  ' + label).setColor('#888888').setStyle({ fontStyle: 'normal' });
                } else {
                    invRow.setText('  ' + label).setColor(this.getItemColor(item)).setStyle({ fontStyle: 'normal' });
                }
                invRow.setVisible(true);
            } else {
                invRow.setText('').setVisible(false);
            }

            if (whIdx < wh.length) {
                const item = wh[whIdx];
                const isSelected = this.activePanel === 'warehouse' && whIdx === this.warehouseCursor;
                const label = this.getItemLabel(item);
                if (isSelected) {
                    whRow.setText('▶ ' + label).setColor('#ffffff').setStyle({ fontStyle: 'bold' });
                } else {
                    whRow.setText('  ' + label).setColor(this.getItemColor(item)).setStyle({ fontStyle: 'normal' });
                }
                whRow.setVisible(true);
            } else {
                whRow.setText('').setVisible(false);
            }
        }

        this.panelIndicatorLeft.setVisible(this.activePanel === 'inventory');
        this.panelIndicatorRight.setVisible(this.activePanel === 'warehouse');
    }

    moveCursor(dir) {
        if (this.activePanel === 'inventory') {
            const max = this.inventory.length - 1;
            if (max < 0) return;
            this.inventoryCursor = Phaser.Math.Clamp(this.inventoryCursor + dir, 0, max);
        } else {
            const wh = WAREHOUSE[this.slotIndex];
            const max = wh.length - 1;
            if (max < 0) return;
            this.warehouseCursor = Phaser.Math.Clamp(this.warehouseCursor + dir, 0, max);
        }
        this.refreshDisplay();
    }

    switchPanel(panel) {
        this.activePanel = panel;
        this.refreshDisplay();
    }

    transferItem() {
        if (this.activePanel === 'inventory') {
            const item = this.inventory[this.inventoryCursor];
            if (!item) return;
            if (this.isEquipped(item)) return;
            this.inventory.splice(this.inventoryCursor, 1);
            WAREHOUSE[this.slotIndex].push(item);
            if (this.inventoryCursor >= this.inventory.length && this.inventoryCursor > 0) {
                this.inventoryCursor--;
            }
        } else {
            const wh = WAREHOUSE[this.slotIndex];
            const item = wh[this.warehouseCursor];
            if (!item) return;
            if (this.inventory.length >= 8) {
                this.showWarning();
                return;
            }
            wh.splice(this.warehouseCursor, 1);
            this.inventory.push(item);
            if (this.warehouseCursor >= wh.length && this.warehouseCursor > 0) {
                this.warehouseCursor--;
            }
        }
        this.refreshDisplay();
    }

    showWarning() {
        this.warningText.setVisible(true);
        this.warningTimer = this.time.now + 1800;
    }

    saveAndBack() {
        this.saveToStorage();
        this.scene.start('BaseMenuScene', { slotIndex: this.slotIndex });
    }

    update(time, delta) {
        if (this.warningTimer > 0 && this.time.now > this.warningTimer) {
            this.warningText.setVisible(false);
            this.warningTimer = 0;
        }

        const pads = this.input.gamepad.gamepads;
        if (pads && pads.length > 0 && this.time.now > (this.game.registry.get('_padTimer') || 0)) {
            const pad = this.input.gamepad.getPad();
            if (pad) {
                const axisY = pad.axes.length > 1 ? pad.axes[1].getValue() : 0;
                const axisX = pad.axes.length > 0 ? pad.axes[0].getValue() : 0;
                const dpadUp = pad.up || axisY < -0.5;
                const dpadDown = pad.down || axisY > 0.5;
                const dpadLeft = pad.left || axisX < -0.5;
                const dpadRight = pad.right || axisX > 0.5;

                if (dpadUp && this.prevAxisY >= -0.5) {
                    this.moveCursor(-1);
                    this.game.registry.set('_padTimer', this.time.now + 150);
                } else if (dpadDown && this.prevAxisY <= 0.5) {
                    this.moveCursor(1);
                    this.game.registry.set('_padTimer', this.time.now + 150);
                } else if (dpadLeft && !this.prevDpadLeft) {
                    this.switchPanel('inventory');
                    this.game.registry.set('_padTimer', this.time.now + PAD_DEBOUNCE_MS);
                } else if (dpadRight && !this.prevDpadRight) {
                    this.switchPanel('warehouse');
                    this.game.registry.set('_padTimer', this.time.now + PAD_DEBOUNCE_MS);
                }

                const confirm = pad.A;
                const cancel = pad.B;

                if (confirm && this.prevConfirm === false) {
                    this.transferItem();
                }
                if (cancel && this.prevCancel === false) {
                    this.saveAndBack();
                }

                if ((!this.prevConfirm && confirm) || (!this.prevCancel && cancel)) {
                    this.game.registry.set('_padTimer', this.time.now + PAD_DEBOUNCE_MS);
                }

                this.prevConfirm = confirm;
                this.prevCancel = cancel;
                this.prevAxisY = axisY;
                this.prevAxisX = axisX;
                this.prevDpadLeft = dpadLeft;
                this.prevDpadRight = dpadRight;
            }
        }
    }
}

class ArenaScene extends Phaser.Scene {
    constructor() {
        super('ArenaScene');
        this.slotIndex = 0;
        this.menuIndex = 0;
        this.menuItems = [];
        this.prevAxisY = 0;
    }

    init(data) {
        this.slotIndex = data && typeof data.slotIndex === 'number' ? data.slotIndex : 0;
    }

    create() {
        const w = this.scale.width;
        const h = this.scale.height;

        const bg = this.add.rectangle(0, 0, w, h, 0x101018, 1);
        bg.setOrigin(0, 0);
        bg.setDepth(0);

        const title = this.add.text(w / 2, 80, 'アリーナ', {
            fontFamily: 'x10y12pxDonguriDuel',
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);
        title.setDepth(1);

        const menuTexts = ['対戦', 'ポイント交換', '戻る'];
        const startY = h / 2 - 40;

        this.menuItems = menuTexts.map((text, i) => {
            const t = this.add.text(w / 2, startY + i * 40, text, {
                fontFamily: 'x10y12pxDonguriDuel',
                fontSize: '24px',
                color: '#777777'
            }).setOrigin(0.5);
            t.setDepth(1);
            return t;
        });

        this.descriptionText = this.add.text(w / 2, h / 2 + 80, '強敵との戦いやポイント交換は今後追加予定。', {
            fontFamily: 'x10y12pxDonguriDuel',
            fontSize: '20px',
            color: '#cccccc'
        }).setOrigin(0.5);
        this.descriptionText.setDepth(1);

        this.updateMenuVisual();

        this.input.keyboard.on('keydown-UP', () => this.moveCursor(-1));
        this.input.keyboard.on('keydown-DOWN', () => this.moveCursor(1));
        this.input.keyboard.on('keydown-W', () => this.moveCursor(-1));
        this.input.keyboard.on('keydown-S', () => this.moveCursor(1));
        this.input.keyboard.on('keydown-ENTER', () => this.selectCurrent());
        this.input.keyboard.on('keydown-SPACE', () => this.selectCurrent());
        this.input.keyboard.on('keydown-Z', () => this.selectCurrent());
        this.input.keyboard.on('keydown-ESC', () => this.back());
        this.input.keyboard.on('keydown-X', () => this.back());
        this.prevConfirm = undefined;
        this.prevCancel = undefined;
    }

    moveCursor(dir) {
        const max = this.menuItems.length;
        this.menuIndex = (this.menuIndex + dir + max) % max;
        this.updateMenuVisual();
    }

    updateMenuVisual() {
        this.menuItems.forEach((item, i) => {
            if (i === this.menuIndex) {
                item.setColor('#ffffff');
                item.setStyle({ fontStyle: 'bold' });
            } else {
                item.setColor('#777777');
                item.setStyle({ fontStyle: 'normal' });
            }
        });
    }

    selectCurrent() {
        const index = this.menuIndex;
        if (index === 0) {
            this.showMessage('対戦コンテンツは今後追加予定。');
        } else if (index === 1) {
            this.showMessage('ポイント交換は今後追加予定。');
        } else if (index === 2) {
            this.back();
        }
    }

    showMessage(text) {
        if (this.popup) {
            this.popup.destroy();
            this.popup = null;
        }
        const w = 480;
        const h = 120;
        const x = this.scale.width / 2;
        const y = this.scale.height / 2;
        const container = this.add.container(0, 0);
        const bg = this.add.rectangle(x, y, w, h, 0x000000, 0.9);
        bg.setStrokeStyle(2, 0xffffff, 1);
        const t = this.add.text(x, y, text, {
            fontFamily: 'x10y12pxDonguriDuel',
            fontSize: '20px',
            color: '#ffffff',
            wordWrap: { width: w - 40 }
        }).setOrigin(0.5);
        container.add(bg);
        container.add(t);
        container.setDepth(10);
        this.popup = container;
        this.time.delayedCall(1200, () => {
            if (this.popup) {
                this.popup.destroy();
                this.popup = null;
            }
        });
    }

    back() {
        this.scene.start('BaseMenuScene', { slotIndex: this.slotIndex });
    }

    update() {
        const pads = this.input.gamepad.gamepads;
        if (pads && pads.length > 0 && this.time.now > (this.game.registry.get('_padTimer') || 0)) {
            const pad = this.input.gamepad.getPad();
            if (pad) {
                const axisY = pad.axes.length > 1 ? pad.axes[1].getValue() : 0;
                const threshold = 0.4;
                if (axisY > threshold && this.prevAxisY <= threshold) {
                    this.moveCursor(1);
                } else if (axisY < -threshold && this.prevAxisY >= -threshold) {
                    this.moveCursor(-1);
                }
                this.prevAxisY = axisY;

                const up = pad.up;
                const down = pad.down;

                if (up && this.prevUp === false) {
                    this.moveCursor(-1);
                }
                if (down && this.prevDown === false) {
                    this.moveCursor(1);
                }
                this.prevUp = up;
                this.prevDown = down;

                const confirm = pad.A || pad.X;
                if (confirm && this.prevConfirm === false) {
                    this.selectCurrent();
                }
                const cancel = pad.B;
                if (cancel && this.prevCancel === false) {
                    this.back();
                }
                if (!this.prevConfirm && confirm) this.game.registry.set('_padTimer', this.time.now + PAD_DEBOUNCE_MS);
                this.prevConfirm = confirm;
                if (!this.prevCancel && cancel) this.game.registry.set('_padTimer', this.time.now + PAD_DEBOUNCE_MS);
                this.prevCancel = cancel;
            }
        }
    }
}

class DungeonSelectScene extends Phaser.Scene {
    constructor() {
        super('DungeonSelectScene');
        this.slotIndex = 0;
        this.menuIndex = 0;
        this.menuItems = [];
        this.prevAxisY = 0;
        this.descriptionText = null;
    }

    init(data) {
        this.slotIndex = data && typeof data.slotIndex === 'number' ? data.slotIndex : 0;
    }

    create() {
        const w = this.scale.width;
        const h = this.scale.height;

        const bg = this.add.rectangle(0, 0, w, h, 0x0f1013, 1);
        bg.setOrigin(0, 0);
        bg.setDepth(0);

        const title = this.add.text(w / 2, 80, 'ダンジョン選択', {
            fontFamily: 'x10y12pxDonguriDuel',
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);
        title.setDepth(1);

        const menuTexts = ['チュートリアルダンジョン', 'ストーリーダンジョン', 'エンドコンテンツ', 'サバイバルモード', '拠点に戻る'];
        const startY = h / 2 - 80;

        this.menuItems = menuTexts.map((text, i) => {
            const t = this.add.text(w / 2, startY + i * 40, text, {
                fontFamily: 'x10y12pxDonguriDuel',
                fontSize: '24px',
                color: '#777777'
            }).setOrigin(0.5);
            t.setDepth(1);
            return t;
        });

        this.descriptionText = this.add.text(w / 2, h / 2 + 90, '', {
            fontFamily: 'x10y12pxDonguriDuel',
            fontSize: '20px',
            color: '#cccccc',
            wordWrap: { width: w - 120 }
        }).setOrigin(0.5);
        this.descriptionText.setDepth(1);

        this.updateMenuVisual();
        this.updateDescription();

        this.input.keyboard.on('keydown-UP', () => this.moveCursor(-1));
        this.input.keyboard.on('keydown-DOWN', () => this.moveCursor(1));
        this.input.keyboard.on('keydown-W', () => this.moveCursor(-1));
        this.input.keyboard.on('keydown-S', () => this.moveCursor(1));
        this.input.keyboard.on('keydown-ENTER', () => this.selectCurrent());
        this.input.keyboard.on('keydown-SPACE', () => this.selectCurrent());
        this.input.keyboard.on('keydown-Z', () => this.selectCurrent());
        this.input.keyboard.on('keydown-ESC', () => this.back());
        this.input.keyboard.on('keydown-X', () => this.back());
        this.prevConfirm = undefined;
        this.prevCancel = undefined;
    }

    moveCursor(dir) {
        const max = this.menuItems.length;
        this.menuIndex = (this.menuIndex + dir + max) % max;
        this.updateMenuVisual();
        this.updateDescription();
    }

    updateMenuVisual() {
        this.menuItems.forEach((item, i) => {
            if (i === this.menuIndex) {
                item.setColor('#ffffff');
                item.setStyle({ fontStyle: 'bold' });
            } else {
                item.setColor('#777777');
                item.setStyle({ fontStyle: 'normal' });
            }
        });
    }

    updateDescription() {
        const index = this.menuIndex;
        let text = '';
        if (index === 0) {
            text = '基本操作や戦闘の流れを学ぶための短いダンジョン。初回プレイ向け。';
        } else if (index === 1) {
            text = '物語を進めるためのメインダンジョン。階層を進めていく本編用。';
        } else if (index === 2) {
            text = '強敵や高報酬が待つ高難度ダンジョン。育ったキャラクター向け。';
        } else if (index === 3) {
            text = '大量の敵を3分間生き抜くモード。撃破でレベルアップしてパワーアップを選択できる。';
        } else if (index === 4) {
            text = '拠点メニューに戻る。ダンジョンには出発しない。';
        }
        if (this.descriptionText) {
            this.descriptionText.setText(text);
        }
    }

    selectCurrent() {
        const index = this.menuIndex;
        if (index === 0) {
            this.startDungeon('tutorial');
        } else if (index === 1) {
            this.startDungeon('story');
        } else if (index === 2) {
            this.startDungeon('end');
        } else if (index === 3) {
            this.scene.start('SurvivalScene', { slotIndex: this.slotIndex });
        } else if (index === 4) {
            this.back();
        }
    }

    startDungeon(type) {
        this.scene.start('MainScene', { slotIndex: this.slotIndex, dungeonType: type });
    }

    back() {
        this.scene.start('BaseMenuScene', { slotIndex: this.slotIndex });
    }

    update() {
        const pads = this.input.gamepad.gamepads;
        if (pads && pads.length > 0 && this.time.now > (this.game.registry.get('_padTimer') || 0)) {
            const pad = this.input.gamepad.getPad();
            if (pad) {
                const axisY = pad.axes.length > 1 ? pad.axes[1].getValue() : 0;
                const threshold = 0.4;
                if (axisY > threshold && this.prevAxisY <= threshold) {
                    this.moveCursor(1);
                } else if (axisY < -threshold && this.prevAxisY >= -threshold) {
                    this.moveCursor(-1);
                }
                this.prevAxisY = axisY;

                const up = pad.up;
                const down = pad.down;

                if (up && this.prevUp === false) {
                    this.moveCursor(-1);
                }
                if (down && this.prevDown === false) {
                    this.moveCursor(1);
                }
                this.prevUp = up;
                this.prevDown = down;

                const confirm = pad.A || pad.X;
                if (confirm && this.prevConfirm === false) {
                    this.selectCurrent();
                }
                const cancel = pad.B;
                if (cancel && this.prevCancel === false) {
                    this.back();
                }
                if (!this.prevConfirm && confirm) this.game.registry.set('_padTimer', this.time.now + PAD_DEBOUNCE_MS);
                this.prevConfirm = confirm;
                if (!this.prevCancel && cancel) this.game.registry.set('_padTimer', this.time.now + PAD_DEBOUNCE_MS);
                this.prevCancel = cancel;
            }
        }
    }
}

class ClearResultScene extends Phaser.Scene {
    constructor() {
        super('ClearResultScene');
        this.slotIndex = 0;
        this.dungeonType = 'story';
        this.finalFloor = 0;
        this.clearTimeMs = 0;
        this.killCount = 0;
        this.damageDealt = 0;
        this.damageTaken = 0;
        this.goldGained = 0;
        this.objectsDestroyed = 0;
    }

    init(data) {
        this.slotIndex = data && typeof data.slotIndex === 'number' ? data.slotIndex : 0;
        this.dungeonType = data && data.dungeonType ? data.dungeonType : 'story';
        this.finalFloor = data && typeof data.finalFloor === 'number' ? data.finalFloor : 30;
        this.clearTimeMs = data && typeof data.clearTimeMs === 'number' ? data.clearTimeMs : 0;
        this.killCount = data && typeof data.killCount === 'number' ? data.killCount : 0;
        this.damageDealt = data && typeof data.damageDealt === 'number' ? data.damageDealt : 0;
        this.damageTaken = data && typeof data.damageTaken === 'number' ? data.damageTaken : 0;
        this.goldGained = data && typeof data.goldGained === 'number' ? data.goldGained : 0;
        this.objectsDestroyed = data && typeof data.objectsDestroyed === 'number' ? data.objectsDestroyed : 0;
    }

    create() {
        const w = this.scale.width;
        const h = this.scale.height;

        const bg = this.add.rectangle(0, 0, w, h, 0x000000, 1);
        bg.setOrigin(0, 0);
        bg.setDepth(0);

        const clearLabel = this.dungeonType === 'tutorial' ? 'チュートリアル クリア' : 'ストーリーダンジョン クリア';
        const title = this.add.text(w / 2, h / 2 - 120, clearLabel, {
            fontFamily: 'x10y12pxDonguriDuel',
            fontSize: '30px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);
        title.setDepth(1);

        const floorText = this.add.text(w / 2, h / 2 - 70, `${this.finalFloor}F 到達`, {
            fontFamily: 'x10y12pxDonguriDuel',
            fontSize: '24px',
            color: '#cccccc'
        }).setOrigin(0.5);
        floorText.setDepth(1);

        const totalSeconds = Math.max(0, Math.floor(this.clearTimeMs / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const timeLabel = `${minutes}分${seconds.toString().padStart(2, '0')}秒`;

        const statsStartY = h / 2 - 10;

        const timeText = this.add.text(w / 2, statsStartY, `クリアタイム：${timeLabel}`, {
            fontFamily: 'x10y12pxDonguriDuel',
            fontSize: '20px',
            color: '#bbbbbb',
        }).setOrigin(0.5);
        timeText.setDepth(1);

        const goldText = this.add.text(w / 2, statsStartY + 40, `獲得GOLD：${this.goldGained}`, {
            fontFamily: 'x10y12pxDonguriDuel',
            fontSize: '20px',
            color: '#bbbbbb'
        }).setOrigin(0.5);
        goldText.setDepth(1);

        const killText = this.add.text(w / 2, statsStartY + 80, `撃破数：${this.killCount}`, {
            fontFamily: 'x10y12pxDonguriDuel',
            fontSize: '20px',
            color: '#bbbbbb'
        }).setOrigin(0.5);
        killText.setDepth(1);

        const objectsText = this.add.text(w / 2, statsStartY + 120, `破壊オブジェクト数：${this.objectsDestroyed}`, {
            fontFamily: 'x10y12pxDonguriDuel',
            fontSize: '20px',
            color: '#bbbbbb'
        }).setOrigin(0.5);
        objectsText.setDepth(1);

        const dealtText = this.add.text(w / 2, statsStartY + 160, `総与ダメージ：${this.damageDealt}`, {
            fontFamily: 'x10y12pxDonguriDuel',
            fontSize: '20px',
            color: '#bbbbbb'
        }).setOrigin(0.5);
        dealtText.setDepth(1);

        const takenText = this.add.text(w / 2, statsStartY + 200, `総被ダメージ：${this.damageTaken}`, {
            fontFamily: 'x10y12pxDonguriDuel',
            fontSize: '20px',
            color: '#bbbbbb'
        }).setOrigin(0.5);
        takenText.setDepth(1);

        const prompt = this.add.text(w / 2, h - 60, 'Enter / A ボタンで拠点に戻る', {
            fontFamily: 'x10y12pxDonguriDuel',
            fontSize: '18px',
            color: '#999999'
        }).setOrigin(0.5);
        prompt.setDepth(1);

        this.input.keyboard.on('keydown-ENTER', () => this.backToBase());
        this.input.keyboard.on('keydown-SPACE', () => this.backToBase());
        this.input.keyboard.on('keydown-Z', () => this.backToBase());
        this.input.keyboard.on('keydown-ESC', () => this.backToBase());
        this.input.keyboard.on('keydown-X', () => this.backToBase());
        this.prevConfirm = undefined;
    }

    backToBase() {
        this.scene.start('BaseMenuScene', { slotIndex: this.slotIndex });
    }

    update() {
        const pads = this.input.gamepad.gamepads;
        if (pads && pads.length > 0 && this.time.now > (this.game.registry.get('_padTimer') || 0)) {
            const pad = this.input.gamepad.getPad();
            if (pad) {
                const confirm = pad.A || pad.X;
                const cancel = pad.B;
                if ((confirm || cancel) && this.prevConfirm === false) {
                    this.backToBase();
                }
                if (!this.prevConfirm && (confirm || cancel)) this.game.registry.set('_padTimer', this.time.now + PAD_DEBOUNCE_MS);
                this.prevConfirm = confirm || cancel;
            }
        }
    }
}
