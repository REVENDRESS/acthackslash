class Chest extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // テクスチャがない場合のフォールバックはMainSceneで行う
        // Explicitly use '__BASE' frame to ensure full image is used even if fragments exist
        super(scene, x, y, 'chest', '__BASE');
        scene.add.existing(this);
        // scene.physics.add.existing(this, true); // Don't add manually here if adding to static group, OR manage manually

        // Manual physics setup for better control
        scene.physics.add.existing(this); // Dynamic body initially
        this.setImmovable(true);
        this.body.moves = false; // Disable physics movement
        this.body.checkCollision.none = false; // Ensure collision is enabled initially

        // Force size to match player (32x32 visual)
        this.setDisplaySize(32, 32);

        // Hitbox Adjustment: Full 32x32 square as requested
        // Note: body.setSize takes values relative to the unscaled texture.
        // Since we force display size to 32x32, we need to calculate the unscaled size that results in 32x32.
        // However, setDisplaySize modifies scaleX/Y. 
        // body.width = size / scaleX. 
        // It's safer to use the texture dimensions if available, but scale might not be ready if texture is loading.
        // For base64, it should be ready. 

        // Let's assume we want the hitbox to MATCH the visual bounds (32x32).
        // We calculate the required body size by dividing target size by scale.
        if (this.scaleX !== 0 && this.scaleY !== 0) {
            this.body.setSize(32 / this.scaleX, 32 / this.scaleY);
        } else {
            // Fallback if scale is 0 (shouldn't happen with setDisplaySize unless texture missing)
            this.body.setSize(32, 32);
        }

        this.body.setOffset(0, 0);

        this.scene = scene;
        this.isOpen = false;
        this.timer = 0;
        this.requiredTime = 3000; // 3 seconds
        this.gauge = scene.add.graphics();
        this.gauge.setDepth(100); // Above chest

        this.setDepth(40); // Between floor and player
    }

    update(time, delta) {
        if (this.isOpen) return;
        if (this.scene && this.scene.player && this.scene.player.isFatalAttacking) return;

        // Check distance to player
        const dist = Phaser.Math.Distance.Between(this.x, this.y, this.scene.player.x, this.scene.player.y);

        // Adjacent distance (approx 60px: 32/2 + 32/2 + margin)
        // Player radius ~16, Chest ~16. Sum ~32. 60 is plenty close.
        if (dist < 60) {
            this.timer += delta;
            if (this.timer >= this.requiredTime) {
                this.timer = this.requiredTime;
                this.open();
            }
        } else {
            // Decay if player moves away
            this.timer = Math.max(0, this.timer - delta * 2);
        }

        this.drawGauge();
    }

    drawGauge() {
        this.gauge.clear();
        if (this.timer <= 0 || this.isOpen) return;

        const width = 40;
        const height = 6;
        const x = this.x - width / 2;
        const y = this.y - 40;

        // Background
        this.gauge.fillStyle(0x000000, 1);
        this.gauge.fillRect(x, y, width, height);

        // Fill (Green -> Yellow -> Red? Or just Gold)
        const percent = this.timer / this.requiredTime;
        this.gauge.fillStyle(0xffff00, 1); // Gold
        this.gauge.fillRect(x, y, width * percent, height);
    }

    open() {
        if (this.isOpen) return;
        this.isOpen = true;
        this.gauge.clear();

        // Visual feedback (Change texture and darken)
        this.setTexture('chestOpen');
        this.setDisplaySize(32, 32); 
        this.setTint(0x999999); // 少し暗くする

        // Depth: Lower than player (Player is 10, Enemy is 10, Blood is 5)
        // Let's put it at 1 (above floor 0, below blood 5)
        this.setDepth(1); 

        // Shatter effect (16 fragments, depth 2)
        this.scene.spawnChestFragments(this.x, this.y);

        // Text
        this.scene.showDamagePopup(this.x, this.y - 50, "OPEN!", "#ffffff");

        // Spawn Loot (e.g., 100-500 Gold)
        const amount = Phaser.Math.Between(100, 500);
        this.scene.spawnGold(this.x, this.y, amount);

        // Disable collision so player can walk through
        if (this.body) {
            this.body.checkCollision.none = true;
        }
    }
}

class BloodDrop extends Phaser.GameObjects.Image {
    constructor(scene, x, y, key) {
        super(scene, x, y, key);
        this.setVisible(false);
        this.setActive(false);
        this.scene = scene;
        this.setDepth(5);

        // 初期状態は非表示（初期化完了まで見せない）
        this.setVisible(false);
        this.setActive(false);

        // 物理パラメータ
        this.groundX = x;
        this.groundY = y;
        this.vx = 0;
        this.vy = 0;
        this.z = 0;
        this.vz = 0;
        this.gravity = 800;
        this.isLanded = false;
        this.isLaunched = false;
    }

    launch(startX, startY, angle, speed, zSpeed) {
        // 初期位置を明示的に設定
        this.groundX = startX;
        this.groundY = startY;
        this.x = startX;
        this.y = startY;

        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.vz = zSpeed;
        this.z = Phaser.Math.Between(10, 20); // 少し高いところから出る

        this.isLanded = false;
        this.updatePosition();

        // 見た目のリセット（再利用対策）
        // 4x4のテクスチャに対してスケールを適用
        this.setScale(Phaser.Math.FloatBetween(0.8, 1.2)); // 実質 3px ~ 5px 程度
        this.setAlpha(1.0);
        this.setTint(0xff0000);
        this.setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2)); // ランダムに回転させて自然なバラつきを出す

        // (0,0)バグ対策: もし座標が(0,0)なら強制的に非表示にする
        if (this.x === 0 && this.y === 0) {
            this.setVisible(false);
            this.setActive(false);
            this.isLaunched = false;
            return;
        }

        // ここで初めて表示
        this.isLaunched = true;
        this.setVisible(true);
        this.setActive(true);
    }

    update(time, delta) {
        // アクティブでない、または発射されていない場合は処理しない
        if (!this.active || !this.isLaunched) return;

        // ゲームオーバー時は停止
        if (this.scene.isGameOver) return;
        if (this.scene.player && this.scene.player.isFatalAttacking) return;

        // 着地済みの場合は何もしない（そのまま表示し続ける）
        if (this.isLanded) return;

        const dt = delta / 1000;

        // 地面上の移動
        this.groundX += this.vx * dt;
        this.groundY += this.vy * dt;

        // Z移動（重力）
        this.z += this.vz * dt;
        this.vz -= this.gravity * dt;

        // 着地判定
        if (this.z <= 0) {
            this.z = 0;
            this.isLanded = true;
            this.updatePosition();

            // 着地処理: 床の高さ（Depth 1）に変更して、そのままオブジェクトとして残す
            // RenderTextureへの焼き付けは不安定なため廃止し、スプライトを永続化する
            this.setDepth(1);
            this.clearTint();
            this.setAlpha(0.8); // 少し馴染ませる
        } else {
            // 描画位置の更新
            this.updatePosition();
        }
    }

    updatePosition() {
        this.x = this.groundX;
        this.y = this.groundY - this.z;
    }
}

class Spark extends Phaser.GameObjects.Image {
    constructor(scene, x, y, key) {
        super(scene, x, y, key);
        this.setVisible(false);
        this.setActive(false);
        this.scene = scene;
        this.setDepth(20); // 最前面

        this.groundX = x;
        this.groundY = y;
        this.vx = 0;
        this.vy = 0;
        this.z = 0;
        this.vz = 0;
        this.gravity = 1000;
        this.isLaunched = false;
    }

    launch(startX, startY, angle, speed, zSpeed) {
        this.groundX = startX;
        this.groundY = startY;
        this.x = startX;
        this.y = startY;

        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.vz = zSpeed;
        this.z = Phaser.Math.Between(20, 40); 

        this.updatePosition();

        this.setScale(Phaser.Math.FloatBetween(0.5, 1.5));
        this.setAlpha(1.0);
        this.setTint(0xffff00); // 黄色

        if (this.x === 0 && this.y === 0) {
            this.setVisible(false);
            this.setActive(false);
            this.isLaunched = false;
            return;
        }

        this.isLaunched = true;
        this.setVisible(true);
        this.setActive(true);
    }

    update(time, delta) {
        if (!this.active || !this.isLaunched) return;

        // ゲームオーバー時は停止
        if (this.scene.isGameOver) return;
        if (this.scene.player && this.scene.player.isFatalAttacking) return;

        const dt = delta / 1000;

        this.groundX += this.vx * dt;
        this.groundY += this.vy * dt;
        this.z += this.vz * dt;
        this.vz -= this.gravity * dt;

        if (this.z <= 0) {
            this.z = 0;
            // バウンド
            this.vz *= -0.5;
            this.vx *= 0.5;
            this.vy *= 0.5;

            // 勢いがなくなったら消える
            if (Math.abs(this.vz) < 50) {
                this.setActive(false);
                this.setVisible(false);
            }
        }

        this.updatePosition();

        // フェードアウト
        this.alpha -= dt * 3.0;
        if (this.alpha <= 0) {
            this.setActive(false);
            this.setVisible(false);
        }
    }

    updatePosition() {
        this.x = this.groundX;
        this.y = this.groundY - this.z;
    }
}

class GoldDrop extends Phaser.GameObjects.Image {
    constructor(scene, x, y, key) {
        super(scene, x, y, key);
        this.setVisible(false);
        this.setActive(false);
        this.scene = scene;
        this.setDepth(15); // 床より上、キャラより手前？キャラは10だが... Sparkは20。コインは目立たせたいので15で。

        this.groundX = x;
        this.groundY = y;
        this.z = 0;
        this.vz = 0;
        this.vx = 0;
        this.vy = 0;
        this.gravity = 1000;
        this.value = 0;
        this.isCollectable = false;
        this.blinkTimer = 0;
    }

    launch(x, y, value) {
        this.groundX = x;
        this.groundY = y;
        this.x = x;
        this.y = y;
        this.z = 0;
        this.value = value;

        this.setActive(true);
        this.setVisible(true);
        this.setAlpha(1);
        this.clearTint();

        // キラキラ用タイマー
        this.blinkTimer = Phaser.Math.FloatBetween(0, 0.5);

        // テクスチャ設定
        if (value >= 100) this.setTexture('gold_large');
        else if (value >= 10) this.setTexture('gold_medium');
        else this.setTexture('gold_small');

        // 物理初期化（ランダムに散らす）
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const speed = Phaser.Math.Between(50, 150);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.vz = Phaser.Math.Between(200, 400); // 跳ねる

        this.isCollectable = false;
        // 0.5秒後に取得可能
        this.scene.time.delayedCall(500, () => {
            if (this.active) this.isCollectable = true;
        });
    }

    update(time, delta) {
        if (!this.active) return;

        // ゲームオーバー時は停止
        if (this.scene.isGameOver) return;
        if (this.scene.player && this.scene.player.isFatalAttacking) return;

        const dt = delta / 1000;

        this.vz -= this.gravity * dt;
        this.z += this.vz * dt;

        this.groundX += this.vx * dt;
        this.groundY += this.vy * dt;

        const radius = 10;
        const goldRect = new Phaser.Geom.Rectangle(this.groundX - radius, this.groundY - radius, radius * 2, radius * 2);
        const scene = this.scene;
        const checkGroupCollision = (group) => {
            if (!group || !group.getChildren) return;
            const children = group.getChildren();
            for (let i = 0; i < children.length; i++) {
                const obj = children[i];
                if (!obj.active) continue;
                const body = obj.body;
                if (!body) continue;
                const bounds = new Phaser.Geom.Rectangle(body.x, body.y, body.width, body.height);
                if (Phaser.Geom.Intersects.RectangleToRectangle(goldRect, bounds)) {
                    const normalX = Math.sign(this.vx) || 0;
                    const normalY = Math.sign(this.vy) || 0;
                    if (normalX !== 0) {
                        this.groundX -= this.vx * dt;
                        this.vx *= -0.6;
                    }
                    if (normalY !== 0) {
                        this.groundY -= this.vy * dt;
                        this.vy *= -0.6;
                    }
                    return;
                }
            }
        };
        checkGroupCollision(scene && scene.forestWalls);
        checkGroupCollision(scene && scene.obstacles);

        if (this.z <= 0) {
            this.z = 0;
            this.vz *= -0.6;
            this.vx *= 0.8;
            this.vy *= 0.8;
            if (Math.abs(this.vz) < 50) this.vz = 0;
        }

        this.setPosition(this.groundX, this.groundY - this.z);

        // プレイヤーへの吸い寄せと取得
        if (this.isCollectable && this.scene.player) {
            const dist = Phaser.Math.Distance.Between(this.groundX, this.groundY, this.scene.player.x, this.scene.player.y);

            // 吸い寄せ開始距離
            if (dist < 100) {
                const angle = Phaser.Math.Angle.Between(this.groundX, this.groundY, this.scene.player.x, this.scene.player.y);
                // 加速して吸い寄せる
                this.vx += Math.cos(angle) * 800 * dt;
                this.vy += Math.sin(angle) * 800 * dt;

                // 取得判定
                if (dist < 30) {
                    this.scene.addGold(this.value);
                    this.setActive(false);
                    this.setVisible(false);

                    // ----------------------------------------------------------------
                    // 演出: マリオ風ジャンプ & キラキラ
                    // ----------------------------------------------------------------

                    const scene = this.scene;
                    if (!scene) {
                        return;
                    }

                    // 1. 演出用Gold (最前面)
                    const effectGold = scene.add.image(this.groundX, this.groundY, this.texture.key);
                    effectGold.setDepth(2000);

                    // ぴょこん！と跳ねる
                    scene.tweens.add({
                        targets: effectGold,
                        y: this.groundY - 100,
                        duration: 400,
                        ease: 'Back.easeOut',
                        onComplete: () => {
                            scene.tweens.add({
                                targets: effectGold,
                                alpha: 0,
                                duration: 200,
                                onComplete: () => effectGold.destroy()
                            });
                        }
                    });

                    // 回転 (チャリーン感)
                    scene.tweens.add({
                        targets: effectGold,
                        scaleX: -1,
                        duration: 200,
                        yoyo: true,
                        repeat: 2
                    });

                    // 2. キラキラパーティクル (削除)
                    // const particles = this.scene.add.particles(this.groundX, this.groundY, 'spark', {
                    //     speed: { min: 50, max: 150 },
                    //     angle: { min: 0, max: 360 },
                    //     scale: { start: 0.8, end: 0 },
                    //     blendMode: 'ADD',
                    //     lifespan: 600,
                    //     gravityY: 0, 
                    //     quantity: 6
                    // });
                    // particles.setDepth(1999);
                    // particles.explode(6);
                    // this.scene.time.delayedCall(1000, () => particles.destroy());

                    // 3. テキストポップアップ
                    const scoreText = this.scene.add.text(this.groundX, this.groundY - 20, '+' + this.value, {
                        fontFamily: 'x10y12pxDonguriDuel',
                        fontSize: '20px',
                        color: '#ffff00'
                    }).setOrigin(0.5);
                    scoreText.setDepth(2001);

                    this.scene.tweens.add({
                        targets: scoreText,
                        y: this.groundY - 80,
                        alpha: 0,
                        duration: 800,
                        ease: 'Power2',
                        onComplete: () => scoreText.destroy()
                    });
                }
            }
        }

        // キラキラ演出（ランダムに明るく点滅）
        this.blinkTimer -= dt;
        if (this.blinkTimer <= 0) {
            if (this.isTinted) {
                // 元の色に戻す
                this.clearTint();
                this.blinkTimer = Phaser.Math.FloatBetween(0.1, 0.4); // 通常状態の時間
            } else {
                // 白っぽく光らせる (TintFillで塗りつぶしは強すぎるので、Tintで加算的な表現を試みるが、
                // PhaserのsetTintは乗算なので、明るくするにはsetTintFillで白に近い黄色にするのが良い)
                this.setTintFill(0xffffee); // ほぼ白
                this.blinkTimer = 0.05; // 一瞬だけ光る
            }
        }
    }
}

class Arrow extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, angle) {
        // 矢のテクスチャ
        if (!scene.textures.exists('arrow')) {
            const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

            // Shaft (White)
            graphics.fillStyle(0xFFFFFF, 1);
            graphics.fillRect(0, 2, 12, 2);

            // Arrowhead (White)
            graphics.beginPath();
            graphics.moveTo(12, 0);
            graphics.lineTo(16, 3);
            graphics.lineTo(12, 6);
            graphics.closePath();
            graphics.fillPath();

            graphics.generateTexture('arrow', 16, 6);
            graphics.destroy();
        }

        super(scene, x, y, 'arrow');

        // ここでは物理ボディを追加せず、生成後にグループに追加されたタイミングで管理させる
        // もしくは明示的に有効化するが、位置調整は外で行う
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setDepth(60); // 血痕(1)や肉片(5)より上に表示

        this.setRotation(angle);
        this._baseSpeed = 0;
        this._dirX = Math.cos(angle);
        this._dirY = Math.sin(angle);
        this._lifeTimer = scene.time.delayedCall(3000, () => {
            if (this.active) this.destroy();
        });
    }

    launch(speed) {
        this._baseSpeed = speed;
        if (this.body) {
            this.body.setVelocity(this._dirX * speed, this._dirY * speed);
        }
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        const scene = this.scene;
        if (!scene) return;
        if (scene.isFatalTimeStop && this.body) {
            this.body.setVelocity(0, 0);
        } else if (!scene.isFatalTimeStop && this.body && this._baseSpeed) {
            this.body.setVelocity(this._dirX * this._baseSpeed, this._dirY * this._baseSpeed);
        }
    }
}

class Portal extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        if (!scene.textures.exists('portal')) {
            const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
            graphics.fillStyle(0x00ffff, 1);
            graphics.fillCircle(16, 16, 16);
            graphics.generateTexture('portal', 32, 32);
        }
        super(scene, x, y, 'portal');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setDepth(5);
        this.setAlpha(0.7);

        // Pulsing animation
        scene.tweens.add({
            targets: this,
            scaleX: 1.2,
            scaleY: 1.2,
            alpha: 0.5,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }
}

// Helper to create skeleton texture
