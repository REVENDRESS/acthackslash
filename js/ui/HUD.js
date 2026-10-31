class HUD {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;

        // バーの背景
        this.barBg = scene.add.graphics();
        this.barBg.setScrollFactor(0); // 画面固定
        this.barBg.setDepth(100);

        // HPバー
        this.hpBar = scene.add.graphics();
        this.hpBar.setScrollFactor(0);
        this.hpBar.setDepth(101);

        // スタミナバー
        this.staminaBar = scene.add.graphics();
        this.staminaBar.setScrollFactor(0);
        this.staminaBar.setDepth(101);

        // アニメーション用の表示値
        this.displayedHp = player.hp;
        this.displayedStamina = player.stamina;

        // テキスト
        this.hpText = scene.add.text(15, 12, 'HP 100/100', { fontFamily: 'x10y12pxDonguriDuel', fontSize: '12px', fill: '#ffffff' });
        this.hpText.setScrollFactor(0).setDepth(102);

        this.staminaText = scene.add.text(15, 42, 'SP 100/100', { fontFamily: 'x10y12pxDonguriDuel', fontSize: '12px', fill: '#ffffff' });
        this.staminaText.setScrollFactor(0).setDepth(102);

        // Gold Text
        this.goldText = scene.add.text(scene.scale.width - 20, 20, '0 G', { fontFamily: 'x10y12pxDonguriDuel', fontSize: '24px', fill: '#ffff00', align: 'right' });
        this.goldText.setScrollFactor(0).setDepth(102).setOrigin(1, 0);

        // Dungeon Name Text (Top-Left, same height as Gold)
        this.dungeonText = scene.add.text(20, this.goldText.y, '', {
            fontFamily: 'x10y12pxDonguriDuel',
            fontSize: '20px',
            fill: '#ffffff'
        });
        this.dungeonText.setScrollFactor(0).setDepth(102).setOrigin(0, 0);

        // Inventory State
        this.isInventoryOpen = false;
        this.focusArea = 'inventory'; // 'inventory' or 'equipment'
        this.selectedIndex = 0; // Selected item index in inventory (0-7)
        this.equipmentIndex = 0; // 0: Weapon, 1: Shield
        this.inventoryItems = []; 
        this.inventoryGroup = scene.add.container();
        this.inventoryGroup.setScrollFactor(0);
        this.inventoryGroup.setDepth(110); // Container depth

        // Costume Menu State
        this.isCostumeMenuOpen = false;
        this.costumeGroup = scene.add.container();
        this.costumeGroup.setScrollFactor(0);
        this.costumeGroup.setDepth(200); // Higher than inventory

        this.drawBackground();
        this.createInventoryUI();
        this.createCostumeUI();

        // Input Handling for Inventory
        // Keyboard 'I'
        this.scene.input.keyboard.on('keydown-I', () => {
            this.toggleInventory();
        });

        // Keyboard 'C' for Costume Menu
        this.scene.input.keyboard.on('keydown-C', () => {
            this.toggleCostumeMenu();
        });

        // Keyboard 'P' for Debug Menu
        this.scene.input.keyboard.on('keydown-P', () => {
            this.toggleDebugMenu();
        });

        // Gamepad '+' (Start Button, Index 9)
        this.scene.input.gamepad.on('down', (pad, button, index) => {
            if (button.index === 9) {
                this.toggleInventory();
            }
        });

        // Mouse Click on Inventory Button
        const layout = this.getLayout();
        const invZone = scene.add.zone(layout.invX + 16, layout.invY + 16, 32, 32).setInteractive();
        invZone.setScrollFactor(0);
        invZone.on('pointerdown', () => {
            this.toggleInventory();
        });

        // Global Drag Events
        this.scene.input.on('dragstart', (pointer, gameObject) => {
            this.scene.children.bringToTop(gameObject);
            gameObject.origX = gameObject.x;
            gameObject.origY = gameObject.y;
        });

        this.scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.scene.input.on('drop', (pointer, gameObject, dropZone) => {
            if (dropZone.name === 'weaponSlot') {
                // Try to equip as weapon
                if (gameObject.itemData.type === 'weapon') {
                    this.player.equipItem(gameObject.itemData, 'weapon');
                    // gameObject is destroyed by updateInventoryItems (called by equipItem)
                } else {
                    // Return to inventory
                    gameObject.x = gameObject.origX;
                    gameObject.y = gameObject.origY;
                }
            } else if (dropZone.name === 'shieldSlot') {
                // Try to equip as shield
                if (gameObject.itemData.type === 'shield') {
                    this.player.equipItem(gameObject.itemData, 'shield');
                    // gameObject is destroyed by updateInventoryItems (called by equipItem)
                } else {
                    gameObject.x = gameObject.origX;
                    gameObject.y = gameObject.origY;
                }
            } else if (dropZone.name === 'inventoryArea') {
                // Return to inventory (do nothing, just snap back or stay)
                // If it was equipped item dragged here? 
                // Equipped items are not in inventoryGroup, they are separate sprites?
                // If dragging FROM equipment slot TO inventory:
                if (gameObject.isEquipped) {
                    // unequipItem will handle adding back to inventory
                    if (this.player.unequipItem(gameObject.slotType)) {
                        // Success. Sprite is destroyed by updateEquipmentSlots via unequipItem.
                    } else {
                        // Inventory full, return to slot
                        gameObject.x = gameObject.origX;
                        gameObject.y = gameObject.origY;
                    }
                } else {
                    // Dragging inventory item within inventory
                    gameObject.x = gameObject.origX;
                    gameObject.y = gameObject.origY;
                }
            }
        });

        this.scene.input.on('dragend', (pointer, gameObject, dropped) => {
            if (!dropped) {
                // Dropped on floor
                // If equipped:
                if (gameObject.isEquipped) {
                    // Manual unequip without adding to inventory
                    // Do NOT use unequipItem() because it adds to inventory
                    if (gameObject.slotType === 'weapon') {
                        this.player.equippedWeapon = null;
                    } else if (gameObject.slotType === 'shield') {
                        this.player.equippedShield = null;
                    }
                    this.updateEquipmentSlots(); // Refresh UI and destroy sprite

                    // Spawn item drop in world
                    const drop = new ItemDrop(this.scene, this.player.x, this.player.y + 20, gameObject.itemData.type, gameObject.itemData);
                    this.scene.items.add(drop);
                    drop.playDropEffect();
                } else {
                    // From inventory
                    // Use index-based removal for reliability
                    if (this.player.removeItemAtIndex(gameObject.inventoryIndex)) {
                        const drop = new ItemDrop(this.scene, this.player.x, this.player.y + 20, gameObject.itemData.type, gameObject.itemData);
                        this.scene.items.add(drop);
                        drop.playDropEffect();
                        // removeItemAtIndex calls updateInventoryItems, which destroys the sprite.
                    } else {
                        gameObject.x = gameObject.origX;
                        gameObject.y = gameObject.origY;
                    }
                }
            }
        });
    }

    getLayout() {
        const screenW = this.scene.scale.width;
        const screenH = this.scene.scale.height;
        const sz = 32;

        // Bottom row for HUD elements (one 32px tile above the very bottom)
        const slotTop = screenH - sz * 2;
        const centerX = Math.floor(screenW / 2);

        const weaponSlotX = centerX - sz;
        const shieldSlotX = centerX;

        const invX = screenW - sz * 2;
        const invY = slotTop;

        const potX = sz;
        const potY = slotTop;

        const gridBottomY = slotTop - 4;
        const gridStartX = invX - sz * 4;
        const gridStartY = gridBottomY - sz * 2;

        return {
            sz,
            centerX,
            slotTop,
            weaponSlotX,
            shieldSlotX,
            invX,
            invY,
            potX,
            potY,
            gridStartX,
            gridStartY
        };
    }

    createInventoryUI() {
        this.invGridGraphics = this.scene.add.graphics();
        // this.invGridGraphics.setScrollFactor(0); // Container has scroll factor
        // this.invGridGraphics.setDepth(110); // Container depth handles this
        this.inventoryGroup.add(this.invGridGraphics);

        const sz = 32;
        const layout = this.getLayout();
        const startX = layout.gridStartX;
        const startY = layout.gridStartY;

        this.invGridStartX = startX;
        this.invGridStartY = startY;

        this.invGridGraphics.lineStyle(2, 0xffffff, 1);

        for (let i = 0; i < 8; i++) {
            const col = i % 4;
            const row = Math.floor(i / 4);

            const x = startX + col * sz;
            const y = startY + row * sz;

            this.invGridGraphics.strokeRect(x, y, sz, sz);
        }

        this.inventoryGroup.setVisible(false);
    }

    createCostumeUI() {
        // Background
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x000000, 0.9);
        bg.fillRect(100, 100, 600, 300); // Centered box
        bg.lineStyle(4, 0xffffff);
        bg.strokeRect(100, 100, 600, 300);
        this.costumeGroup.add(bg);

        // Title
        const title = this.scene.add.text(400, 125, 'Costume Selection', {
            fontFamily: 'x10y12pxDonguriDuel',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.costumeGroup.add(title);

        // Grid
        // Optimized for 30 costumes: 8 cols x 4 rows
        // Box size: 48x48 (reduced from 80x80)
        // Gap: 60x60
        const startX = 140;
        const startY = 160;
        const gapX = 64;
        const gapY = 64;
        const boxSize = 56;
        const halfBox = boxSize / 2;

        this.player.skins.forEach((skin, index) => {
            const col = index % 8;
            const row = Math.floor(index / 8);
            const x = startX + col * gapX;
            const y = startY + row * gapY;

            // Box Graphic
            const box = this.scene.add.graphics();
            box.fillStyle(0x333333, 1);
            box.fillRect(x - halfBox, y - halfBox, boxSize, boxSize);
            box.lineStyle(2, 0x888888);
            box.strokeRect(x - halfBox, y - halfBox, boxSize, boxSize);
            this.costumeGroup.add(box);

            // Icon
            const suffix = index === 0 ? '' : `_${index}`;
            const icon = this.scene.add.image(x, y - 5, `player_down${suffix}`);
            icon.setScale(1.2); // Slightly smaller than before
            this.costumeGroup.add(icon);

            // Name (Small text)
            const nameText = this.scene.add.text(x, y + 20, skin.name, {
                fontFamily: 'x10y12pxDonguriDuel',
                fontSize: '10px',
                color: '#ffffff'
            }).setOrigin(0.5);
            this.costumeGroup.add(nameText);

            // Button Zone (Overlay)
            const zone = this.scene.add.zone(x, y, boxSize, boxSize).setInteractive();
            zone.on('pointerdown', () => {
                this.player.setCostume(index);
                this.toggleCostumeMenu(); // Close on select
            });

            // Highlight on hover
            zone.on('pointerover', () => {
                box.clear();
                box.fillStyle(0x555555, 1);
                box.fillRect(x - halfBox, y - halfBox, boxSize, boxSize);
                box.lineStyle(2, 0xffff00);
                box.strokeRect(x - halfBox, y - halfBox, boxSize, boxSize);
            });
            zone.on('pointerout', () => {
                box.clear();
                box.fillStyle(0x333333, 1);
                box.fillRect(x - halfBox, y - halfBox, boxSize, boxSize);
                box.lineStyle(2, 0x888888);
                box.strokeRect(x - halfBox, y - halfBox, boxSize, boxSize);
            });

            this.costumeGroup.add(zone);
        });

        this.costumeGroup.setVisible(false);
    }

    toggleCostumeMenu() {
        if (this.player && this.player.isFatalAttacking) {
            return;
        }

        this.isCostumeMenuOpen = !this.isCostumeMenuOpen;
        this.costumeGroup.setVisible(this.isCostumeMenuOpen);
    }

    updateInventoryItems() {
        // Clear existing item sprites in inventory group
        // Use spread operator to create a copy of the array, as destroying children modifies the live array
        [...this.inventoryGroup.list].forEach(child => {
            if (child !== this.invGridGraphics && child !== this.cursorGraphics && child !== this.selectionHighlight) {
                child.destroy();
            }
        });

        // Add new item sprites
        this.player.inventory.forEach((itemData, index) => {
            const col = index % 4;
            const row = Math.floor(index / 4);

            const layout = this.getLayout();
            const x = layout.gridStartX + col * 32 + 16;
            const y = layout.gridStartY + row * 32 + 16;

            let itemTextureKey = 'item_texture';
            if (itemData && itemData.type === 'weapon') {
                const candidate = WEAPON_TYPES[itemData.typeId]?.texture;
                if (candidate && this.scene.textures.exists(candidate)) {
                    itemTextureKey = candidate;
                }
            } else if (itemData && itemData.type === 'shield') {
                const candidate = SHIELD_TYPES[itemData.typeId]?.texture;
                if (candidate && this.scene.textures.exists(candidate)) {
                    itemTextureKey = candidate;
                }
            }
            const itemSprite = this.scene.add.sprite(x, y, itemTextureKey); 
            itemSprite.setScale(0.4);
            itemSprite.setAngle(-45);

            if (itemData && itemData.type === 'weapon') {
                itemSprite.clearTint();
            } else if (itemData && itemData.type === 'shield') {
                itemSprite.clearTint();
            } else if (itemTextureKey === 'weapon_iron_sword') {
                itemSprite.clearTint();
            } else if (itemData.rarity !== undefined && RARITY_COLORS[itemData.rarity]) {
                itemSprite.setTint(RARITY_COLORS[itemData.rarity]);
            } else if (itemData.type === 'weapon') {
                itemSprite.setTint(0x00ffff); 
            } else {
                itemSprite.setTint(0xff00ff); 
            }

            itemSprite.setScrollFactor(0);
            // itemSprite.setDepth(111); // Depth relative to container, 0 is fine if sorted by add order, or explicit

            // Make Interactive & Draggable
            itemSprite.setInteractive();
            this.scene.input.setDraggable(itemSprite);
            itemSprite.itemData = itemData;
            itemSprite.inventoryIndex = index;
            itemSprite.isEquipped = false;

            // Ensure sprite visibility matches inventory state
            // If inventory is NOT open, these sprites should not be visible.
            // But if it IS open, they should be visible.
            // The inventoryGroup controls visibility of its children, BUT...
            // If we add them to the group, the group's visibility will override the child's visibility property?
            // Actually, if group is visible=false, children are not rendered regardless of their visible property.
            // However, if the group is tweening (visible=true), then we need to make sure the items are visible.
            // So setting visible=true here is correct, IF they are added to the group properly.
            // The issue might be that updateInventoryItems is called when an item is added, 
            // and if the inventory is closed (group.visible = false), the items are added but the group is hidden.
            // BUT, the user says they ARE visible. This implies they might not be in the group correctly,
            // or the group is somehow visible?
            // Wait, in toggleInventory, we set group.visible = true when opening.
            // When closing, we set group.visible = false after tween.
            // If the user picks up an item, updateInventoryItems() is called.
            // If inventory is closed, the group should be hidden.
            // Let's make sure we don't accidentally show the group or items if closed.

            itemSprite.setVisible(this.isInventoryOpen);

            this.inventoryGroup.add(itemSprite);
        });

        // Ensure selection highlight is on top of items
        if (this.selectionHighlight) {
            this.inventoryGroup.bringToTop(this.selectionHighlight);
        }
        if (this.cursorGraphics) {
            this.inventoryGroup.bringToTop(this.cursorGraphics);
        }

        // CRITICAL FIX: Ensure the group's visibility is respected.
        // If the inventory is closed, the group should be invisible.
        // If updateInventoryItems is called while closed, the group remains invisible, so items shouldn't show.
        // If items are showing, maybe they are being added to the scene directly and NOT just the group?
        // scene.add.sprite adds to scene. updateInventoryItems adds to group.
        // Group members are still in the scene display list unless removed from display list?
        // No, Phaser Groups don't automatically remove from display list.
        // But setting group.setVisible(false) SHOULD hide all children.
        // Let's enforce the group visibility state just in case.
        this.inventoryGroup.setVisible(this.isInventoryOpen);
    }

    updateEquipmentSlots() {
        // Handle Equipped Item Sprites
        if (this.player.equippedWeapon) {
            if (!this.equipWeaponSprite) {
                const layout = this.getLayout();
                this.equipWeaponSprite = this.scene.add.sprite(layout.weaponSlotX + 16, layout.slotTop + 16, 'item_texture');
                this.equipWeaponSprite.setScale(0.4);
                this.equipWeaponSprite.setAngle(-45);
                this.equipWeaponSprite.clearTint();
                this.equipWeaponSprite.setScrollFactor(0);
                this.equipWeaponSprite.setDepth(105);
                this.equipWeaponSprite.setInteractive();
                this.scene.input.setDraggable(this.equipWeaponSprite);
                this.equipWeaponSprite.slotType = 'weapon';
                this.equipWeaponSprite.isEquipped = true;
            }
            this.equipWeaponSprite.itemData = this.player.equippedWeapon;
            {
                let equipTextureKey = 'item_texture';
                const candidate = WEAPON_TYPES[this.player.equippedWeapon.typeId]?.texture;
                if (candidate && this.scene.textures.exists(candidate)) {
                    equipTextureKey = candidate;
                }
                this.equipWeaponSprite.setTexture(equipTextureKey);
            }
            this.equipWeaponSprite.clearTint();
        } else {
            if (this.equipWeaponSprite) {
                this.equipWeaponSprite.destroy();
                this.equipWeaponSprite = null;
            }
        }

        if (this.player.equippedShield) {
            if (!this.equipShieldSprite) {
                const layout = this.getLayout();
                this.equipShieldSprite = this.scene.add.sprite(layout.shieldSlotX + 16, layout.slotTop + 16, 'item_texture');
                this.equipShieldSprite.setScale(0.4);
                this.equipShieldSprite.setAngle(-45);
                this.equipShieldSprite.setScrollFactor(0);
                this.equipShieldSprite.setDepth(105);
                this.equipShieldSprite.setInteractive();
                this.scene.input.setDraggable(this.equipShieldSprite);
                this.equipShieldSprite.slotType = 'shield';
                this.equipShieldSprite.isEquipped = true;
            }
            this.equipShieldSprite.itemData = this.player.equippedShield;
            {
                let equipTextureKey = 'item_texture';
                const candidate = SHIELD_TYPES[this.player.equippedShield.typeId]?.texture;
                if (candidate && this.scene.textures.exists(candidate)) {
                    equipTextureKey = candidate;
                }
                this.equipShieldSprite.setTexture(equipTextureKey);
            }
            this.equipShieldSprite.clearTint();
        } else {
            if (this.equipShieldSprite) {
                this.equipShieldSprite.destroy();
                this.equipShieldSprite = null;
            }
        }

        // Update Slot Frames Colors
        if (this.weaponSlotFrame) {
            this.weaponSlotFrame.clear();
            let color = 0xffffff;
            if (this.player.equippedWeapon && this.player.equippedWeapon.rarity !== undefined) {
                color = RARITY_COLORS[this.player.equippedWeapon.rarity] || 0xffffff;
            }
            this.weaponSlotFrame.lineStyle(2, color, 1);
            const layout = this.getLayout();
            const sz = layout.sz;
            this.weaponSlotFrame.strokeRect(layout.weaponSlotX, layout.slotTop, sz, sz);
        }

        if (this.shieldSlotFrame) {
            this.shieldSlotFrame.clear();
            let color = 0xffffff;
            if (this.player.equippedShield && this.player.equippedShield.rarity !== undefined) {
                color = RARITY_COLORS[this.player.equippedShield.rarity] || 0xffffff;
            }
            this.shieldSlotFrame.lineStyle(2, color, 1);
            const layout = this.getLayout();
            const sz = layout.sz;
            this.shieldSlotFrame.strokeRect(layout.shieldSlotX, layout.slotTop, sz, sz);
        }
    }

    toggleInventory() {
        if (this.player && this.player.isFatalAttacking) {
            return;
        }

        this.scene.tweens.killTweensOf(this.inventoryGroup);

        const layout = this.getLayout();
        const btnX = layout.invX + 16;
        const btnY = layout.invY + 16;

        if (this.isInventoryOpen) {
            // Close
            this.isInventoryOpen = false;
            this.scene.tweens.add({
                targets: this.inventoryGroup,
                x: btnX,
                y: btnY,
                scaleX: 0,
                scaleY: 0,
                duration: 300,
                ease: 'Back.easeIn',
                onComplete: () => {
                    this.inventoryGroup.setVisible(false);
                    if (!this.isInventoryOpen) {
                        this.drawInventoryIcon(false);
                    }
                }
            });

            // Hide cursor
            if (this.cursorGraphics) this.cursorGraphics.setVisible(false);
            if (this.selectionHighlight) this.selectionHighlight.setVisible(false);
        } else {
            // Open
            this.isInventoryOpen = true;
            this.drawInventoryIcon(true); // リュックを開ける
            this.inventoryGroup.setVisible(true);

            this.inventoryGroup.setPosition(btnX, btnY);
            this.inventoryGroup.setScale(0);

            this.selectedIndex = 0; // Reset selection to first item
            this.focusArea = 'inventory'; // Reset focus
            this.equipmentIndex = 0;
            this.prevCrossBtnInv = false;

            // 展開アニメーション
            this.scene.tweens.add({
                targets: this.inventoryGroup,
                x: 0,
                y: 0,
                scaleX: 1,
                scaleY: 1,
                duration: 400,
                ease: 'Back.easeOut'
            });

            this.updateInventoryItems();
            this.updateCursor(); // Show cursor
        }
    }

    drawBackground() {
        this.barBg.clear();
        this.barBg.fillStyle(0x000000, 0.5);

        const screenWidth = this.scene.scale.width;
        const screenHeight = this.scene.scale.height;
        const barWidth = 120;
        const barHeight = 10;
        const gap = 20;
        const totalWidth = barWidth * 2 + gap;
        const startX = (screenWidth - totalWidth) / 2;
        const baseY = this.goldText ? (this.goldText.y + 7) : 27;

        this.barWidth = barWidth;
        this.barHeight = barHeight;
        this.barGap = gap;
        this.barStartX = startX;
        this.barBaseY = baseY;

        const hpBgX = startX;
        const spBgX = startX + barWidth + gap;

        this.barBg.fillRect(hpBgX - 2, baseY - 2, barWidth + 4, barHeight + 4);
        this.barBg.fillRect(spBgX - 2, baseY - 2, barWidth + 4, barHeight + 4);

        this.hpText.setPosition(hpBgX + barWidth / 2, baseY + barHeight / 2);
        this.hpText.setOrigin(0.5, 0.5);
        this.staminaText.setPosition(spBgX + barWidth / 2, baseY + barHeight / 2);
        this.staminaText.setOrigin(0.5, 0.5);

        // Equipment Slots
        const layout = this.getLayout();
        const cx = layout.centerX;
        const sz = layout.sz;
        const slotTop = layout.slotTop;

        // Weapon Slot Frame
        if (!this.weaponSlotFrame) {
            this.weaponSlotFrame = this.scene.add.graphics();
            this.weaponSlotFrame.setScrollFactor(0);
            this.weaponSlotFrame.setDepth(100);
        }
        this.weaponSlotFrame.clear();
        this.weaponSlotFrame.lineStyle(2, 0xffffff, 1);
        this.weaponSlotFrame.strokeRect(layout.weaponSlotX, slotTop, sz, sz);

        // Shield Slot Frame
        if (!this.shieldSlotFrame) {
            this.shieldSlotFrame = this.scene.add.graphics();
            this.shieldSlotFrame.setScrollFactor(0);
            this.shieldSlotFrame.setDepth(100);
        }
        this.shieldSlotFrame.clear();
        this.shieldSlotFrame.lineStyle(2, 0xffffff, 1);
        this.shieldSlotFrame.strokeRect(layout.shieldSlotX, slotTop, sz, sz);

        // Inventory Button (Right Side)
        // Inventory Icon (Leather Backpack)
        const invX = layout.invX;
        const invY = layout.invY;

        // アイコン描画用のGraphicsを保持
        this.inventoryIcon = this.scene.add.graphics();
        this.inventoryIcon.setScrollFactor(0);
        this.inventoryIcon.setDepth(102);
        this.drawInventoryIcon(false); // 初期状態は閉じたリュック

        // Button Frame
        this.barBg.lineStyle(2, 0xffffff, 1);
        this.barBg.strokeRect(invX, invY, 32, 32);

        // Potion Slot (Left Side - Opposite to Inventory)
        // X = 32 (Same margin from left as inventory from right)
        // Y = slotTop

        // Potion Icon (Red Bottle)
        const potX = layout.potX;
        const potY = layout.potY;

        // Liquid
        this.barBg.fillStyle(0xFF0000, 1); // Red
        this.barBg.fillCircle(potX + 16, potY + 20, 9); // Body
        this.barBg.fillRect(potX + 12, potY + 10, 8, 10); // Neck

        // Bottle Outline (Glass effect)
        this.barBg.lineStyle(2, 0xEEEEEE, 0.8);
        this.barBg.strokeCircle(potX + 16, potY + 20, 9);
        this.barBg.strokeRect(potX + 12, potY + 10, 8, 10);

        // Cork/Lip
        this.barBg.fillStyle(0x8B4513, 1); // Cork
        this.barBg.fillRect(potX + 11, potY + 7, 10, 3);

        // Slot Frame
        this.barBg.lineStyle(2, 0xffffff, 1);
        this.barBg.strokeRect(potX, potY, 32, 32);

        // Potion UI Elements
        if (!this.potionGauge) {
            this.potionGauge = this.scene.add.graphics();
            this.potionGauge.setScrollFactor(0);
            this.potionGauge.setDepth(101);
        }

        if (!this.potionText) {
            const layoutForText = this.getLayout();
            this.potionText = this.scene.add.text(layoutForText.potX + 16, layoutForText.potY + 16, '', { 
                fontFamily: 'x10y12pxDonguriDuel', 
                fontSize: '16px', 
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            });
            this.potionText.setScrollFactor(0);
            this.potionText.setDepth(102);
            this.potionText.setOrigin(0.5, 0.5);
        }

        // Create Drop Zones for Equipment
        if (!this.weaponZone) {
            const layoutForZones = this.getLayout();
            this.weaponZone = this.scene.add.zone(layoutForZones.weaponSlotX + 16, layoutForZones.slotTop + 16, 32, 32).setRectangleDropZone(32, 32);
            this.weaponZone.setScrollFactor(0);
            this.weaponZone.name = 'weaponSlot';
        }
        if (!this.shieldZone) {
            const layoutForZones = this.getLayout();
            this.shieldZone = this.scene.add.zone(layoutForZones.shieldSlotX + 16, layoutForZones.slotTop + 16, 32, 32).setRectangleDropZone(32, 32);
            this.shieldZone.setScrollFactor(0);
            this.shieldZone.name = 'shieldSlot';
        }

        // Inventory Drop Zone (to return items)
        if (!this.inventoryZone) {
            // Area covering the 4x2 grid
            const layoutForGrid = this.getLayout();
            const gridX = layoutForGrid.gridStartX;
            const gridY = layoutForGrid.gridStartY;
            this.inventoryZone = this.scene.add.zone(gridX + 64, gridY + 32, 128, 64).setRectangleDropZone(128, 64);
            this.inventoryZone.setScrollFactor(0);
            this.inventoryZone.name = 'inventoryArea';
            // Only active when inventory is open? We can control this logic in 'drop' event.
        }

        // Inventory Cursor for Gamepad
        if (!this.cursorGraphics) {
            this.cursorGraphics = this.scene.add.graphics();
            // this.cursorGraphics.setScrollFactor(0); // Container handles this
            this.cursorGraphics.setDepth(10); // Relative depth above items (items are ~0)
            this.cursorGraphics.lineStyle(2, 0xffff00, 1); // Yellow cursor
            this.cursorGraphics.strokeRect(0, 0, 32, 32);
            this.cursorGraphics.setVisible(false);
            this.inventoryGroup.add(this.cursorGraphics);
        }

        // 選択中のアイテム枠（ハイライト）
        // 常に表示されるわけではないが、updateCursorで制御
        if (!this.selectionHighlight) {
            this.selectionHighlight = this.scene.add.graphics();
            this.selectionHighlight.lineStyle(4, 0xFFD700, 1); // 太い金色に近い黄色
            this.selectionHighlight.strokeRect(0, 0, 32, 32);
            this.selectionHighlight.setVisible(false);
            this.selectionHighlight.setDepth(11);
            this.inventoryGroup.add(this.selectionHighlight);
        }
    }

    drawInventoryIcon(isOpen) {
        if (!this.inventoryIcon) return;

        const g = this.inventoryIcon;
        g.clear();

        const layout = this.getLayout();
        const invX = layout.invX;
        const invY = layout.invY;

            // Backpack Body (Main compartment)
        g.fillStyle(0x8B4513, 1); // SaddleBrown
        g.fillRoundedRect(invX + 6, invY + 6, 20, 22, 3);

        // Front Pocket
        g.fillStyle(0xA0522D, 1); // Sienna
        g.fillRoundedRect(invX + 8, invY + 16, 16, 10, 2);

        if (isOpen) {
            // Open Flap (Upward) - より大きく開く
            g.fillStyle(0x654321, 1); // Darker Brown
            // フラップが開いているので上に描画
            g.beginPath();
            g.moveTo(invX + 6, invY + 6);
            g.lineTo(invX + 26, invY + 6);
            g.lineTo(invX + 28, invY - 6); // より外側へ
            g.lineTo(invX + 4, invY - 6);  // より外側へ
            g.closePath();
            g.fillPath();

            // Buckle (Dangling or on flap)
            g.fillStyle(0xFFD700, 1); 
            g.fillRect(invX + 14, invY - 4, 4, 4); 

            // 中身が見える感じ (Dark hole) - 少し広げる
            g.fillStyle(0x221100, 1); // より暗く
            g.fillRect(invX + 8, invY + 6, 16, 6);

        } else {
            // Closed Flap (Downward)
            g.fillStyle(0x654321, 1); // Darker Brown
            g.fillRoundedRect(invX + 6, invY + 6, 20, 10, 2);

            // Straps/Buckle (Gold)
            g.fillStyle(0xFFD700, 1); 
            g.fillRect(invX + 14, invY + 12, 4, 4); // Buckle on flap
        }
    }

    updateCursor() {
        if (!this.isInventoryOpen) {
            if (this.cursorGraphics) this.cursorGraphics.setVisible(false);
            if (this.selectionHighlight) this.selectionHighlight.setVisible(false);
            return;
        }

        // Show cursor
        // this.cursorGraphics.setVisible(true); // Gamepad用カーソル（古い方）は一旦非表示にするか、重ねて使う
        // 今回はselectionHighlightを使うので、こちらは非表示でもよいが、既存ロジック温存
        if (this.cursorGraphics) this.cursorGraphics.setVisible(false);

        if (this.selectionHighlight) this.selectionHighlight.setVisible(true);

        let x, y;

        if (this.focusArea === 'equipment') {
            // Equipment Slots
            // Weapon/Shield positions from layout
            // NOTE: Equipment slots are NOT in the inventoryGroup container!
            // So we cannot put selectionHighlight (which is in container) over them easily unless we transform coords
            // OR we move selectionHighlight out of container.
            // But user asked for inventory selection highlight.

            // For simplicity, let's keep highlight in container for inventory grid, 
            // and use a separate global highlight for equipment if needed.
            // But wait, the container is fullscreen size? No, container has no size, just origin 0,0 usually.
            // But we animate the container position.
            // When inventory is open, container is at 0,0 (after tween).
            // So coordinates match screen coordinates relative to container.

            const layout = this.getLayout();
            if (this.equipmentIndex === 0) {
                x = layout.weaponSlotX;
                y = layout.slotTop;
            } else {
                x = layout.shieldSlotX;
                y = layout.slotTop;
            }
        } else {
            // Inventory Grid
            const layout = this.getLayout();
            const col = this.selectedIndex % 4;
            const row = Math.floor(this.selectedIndex / 4);

            x = layout.gridStartX + col * 32;
            y = layout.gridStartY + row * 32;
        }

        if (this.selectionHighlight) {
            this.selectionHighlight.x = x;
            this.selectionHighlight.y = y;
        }

        if (this.cursorGraphics) {
            this.cursorGraphics.x = x;
            this.cursorGraphics.y = y;
        }
    }

    handleGamepadInput(pad) {
        if (!this.isInventoryOpen) return;

        // Simple debouncing/JustDown simulation
        const now = this.scene.time.now;
        if (!this.lastInputTime) this.lastInputTime = 0;

        // Check buttons for focus switching (LB/RB) - no debounce needed for mode switch usually, but safer
        // Buttons
        const lb = pad.buttons[4]?.pressed;
        const rb = pad.buttons[5]?.pressed;

        // Focus Switching
        if (lb && this.focusArea !== 'equipment') {
            if (now - this.lastInputTime > 150) {
                this.focusArea = 'equipment';
                this.equipmentIndex = 0; // Reset to weapon
                this.updateCursor();
                this.lastInputTime = now;
            }
            return;
        } else if (rb && this.focusArea !== 'inventory') {
            if (now - this.lastInputTime > 150) {
                this.focusArea = 'inventory';
                this.updateCursor();
                this.lastInputTime = now;
            }
            return;
        }

        if (now - this.lastInputTime < 150) return; // 150ms delay for navigation/action

        const crossBtn = pad.buttons[0]?.pressed; // Button 0 = A/Cross
        const triangleBtn = pad.buttons[3]?.pressed; // Button 3 = Y/Triangle

        // D-pad Navigation
        const left = pad.left || (pad.dpad && pad.dpad.left);
        const right = pad.right || (pad.dpad && pad.dpad.right);
        const up = pad.up || (pad.dpad && pad.dpad.up);
        const down = pad.down || (pad.dpad && pad.dpad.down);

        let moved = false;

        if (this.focusArea === 'inventory') {
            // Inventory Grid Logic
            if (left) {
                if (this.selectedIndex % 4 > 0) {
                    this.selectedIndex--;
                    moved = true;
                }
            } else if (right) {
                if (this.selectedIndex % 4 < 3) {
                    this.selectedIndex++;
                    moved = true;
                }
            }

            if (up) {
                if (this.selectedIndex >= 4) {
                    this.selectedIndex -= 4;
                    moved = true;
                }
            } else if (down) {
                if (this.selectedIndex < 4) {
                    this.selectedIndex += 4;
                    moved = true;
                }
            }

            // Equip Item (Cross Button)
            if (crossBtn && !this.prevCrossBtnInv) {
                const itemData = this.player.inventory[this.selectedIndex];
                if (itemData) {
                    // Equip/Swap
                    this.player.equipItem(itemData, itemData.type);
                    this.updateInventoryItems();
                    // Re-update cursor as inventory might have changed
                    this.updateCursor();
                    this.lastInputTime = now;
                }
            }

            // Drop Item (Triangle Button)
            if (triangleBtn && !this.prevTriangleBtnInv) {
                const itemData = this.player.inventory[this.selectedIndex];
                if (itemData) {
                     // Remove and Drop
                     if (this.player.removeItemAtIndex(this.selectedIndex)) {
                         const drop = new ItemDrop(this.scene, this.player.x, this.player.y + 20, itemData.type, itemData);
                         // Add some velocity to spread them out
                         if (drop.body) {
                             drop.setVelocity(Phaser.Math.Between(-150, 150), Phaser.Math.Between(-150, 150));
                         }
                         this.scene.items.add(drop);
                         this.updateCursor();
                         this.lastInputTime = now;
                     }
                }
            }
        } else if (this.focusArea === 'equipment') {
            // Equipment Slot Logic
            if (left) {
                if (this.equipmentIndex > 0) {
                    this.equipmentIndex--;
                    moved = true;
                }
            } else if (right) {
                if (this.equipmentIndex < 1) {
                    this.equipmentIndex++;
                    moved = true;
                }
            }

            // Unequip Item (Cross Button)
            if (crossBtn && !this.prevCrossBtnInv) {
                const slotType = this.equipmentIndex === 0 ? 'weapon' : 'shield';
                this.player.unequipItem(slotType);
                this.updateEquipmentSlots(); 
                this.updateCursor();
                this.lastInputTime = now;
            }

            // Drop Item (Triangle Button)
            if (triangleBtn && !this.prevTriangleBtnInv) {
                let itemToDrop = null;
                if (this.equipmentIndex === 0) itemToDrop = this.player.equippedWeapon;
                else if (this.equipmentIndex === 1) itemToDrop = this.player.equippedShield;

                if (itemToDrop) {
                    // Manual Unequip (don't return to inventory)
                    if (this.equipmentIndex === 0) this.player.equippedWeapon = null;
                    else if (this.equipmentIndex === 1) this.player.equippedShield = null;

                    this.updateEquipmentSlots();

                    const drop = new ItemDrop(this.scene, this.player.x, this.player.y + 20, itemToDrop.type, itemToDrop);
                    if (drop.body) {
                        drop.setVelocity(Phaser.Math.Between(-150, 150), Phaser.Math.Between(-150, 150));
                    }
                    this.scene.items.add(drop);

                    this.lastInputTime = now;
                }
            }
        }

        if (moved) {
            this.lastInputTime = now;
            this.updateCursor();
        }

        this.prevCrossBtnInv = crossBtn;
        this.prevTriangleBtnInv = triangleBtn;
    }

    update() {
        // 値の補間（イージング）
        const lerpSpeed = 0.1;
        this.displayedHp = Phaser.Math.Linear(this.displayedHp, this.player.hp, lerpSpeed);
        this.displayedStamina = Phaser.Math.Linear(this.displayedStamina, this.player.stamina, lerpSpeed);

        this.hpBar.clear();
        this.staminaBar.clear();

        // HP
        const hpPercent = Phaser.Math.Clamp(this.displayedHp / this.player.maxHp, 0, 1);
        this.hpBar.fillStyle(0xff0000, 1);

        const barWidth = this.barWidth || 120;
        const barHeight = this.barHeight || 10;
        const gap = this.barGap || 20;
        const startX = (this.barStartX !== undefined)
            ? this.barStartX
            : (this.scene.scale.width - (barWidth * 2 + gap)) / 2;
        const baseY = (this.barBaseY !== undefined) ? this.barBaseY : (this.goldText ? (this.goldText.y + 7) : 27);

        this.hpBar.fillRect(startX, baseY, barWidth * hpPercent, barHeight);

        // HP Text Update
        this.hpText.setText(`HP ${Math.floor(this.displayedHp)}/${this.player.maxHp}`);

        // Stamina
        const staminaPercent = Phaser.Math.Clamp(this.displayedStamina / this.player.maxStamina, 0, 1);

        // スタミナ切れ状態なら青点滅（回復中）
        if (this.player.isExhausted) {
            // 200ms周期で点滅
            if (Math.floor(this.scene.time.now / 200) % 2 === 0) {
                this.staminaBar.fillStyle(0x00FFFF, 1); // シアン (明るい青)
            } else {
                this.staminaBar.fillStyle(0x0000AA, 1); // 暗い青
            }
        } else {
            this.staminaBar.fillStyle(0x0088ff, 1); // 通常の青
        }

        const staminaX = startX + barWidth + gap;
        this.staminaBar.fillRect(staminaX, baseY, barWidth * staminaPercent, barHeight);

        // SP Text Update
        this.staminaText.setText(`SP ${Math.floor(this.displayedStamina)}/${this.player.maxStamina}`);

        // Gold Animation
        if (this.scene.displayGold !== undefined && this.scene.gold !== undefined) {
            this.scene.displayGold = Phaser.Math.Linear(this.scene.displayGold, this.scene.gold, 0.1);
            if (Math.abs(this.scene.displayGold - this.scene.gold) < 0.5) {
                this.scene.displayGold = this.scene.gold;
            }
            this.goldText.setText(Math.floor(this.scene.displayGold) + ' G');
        }

        if (this.dungeonText) {
            let baseName = 'テストルーム';
            let floor = 1;
            if (this.scene.dungeonTheme === 'forest') {
                baseName = 'よどみの　じゅかい';
                floor = this.scene.dungeonFloor || 1;
            } else if (this.scene.dungeonTheme === 'castle') {
                baseName = this.scene.isTowerMode ? 'だんざいの　せんとう' : 'たそがれの　はいじょう';
                floor = this.scene.dungeonFloor || 1;
            }
            const label = `${baseName} ${floor}F`;
            this.dungeonText.setText(label);
            if (this.goldText) {
                this.dungeonText.y = this.goldText.y;
            }
        }

        // Update Potion UI
        if (this.potionText && this.potionGauge) {
            // Update Count
            this.potionText.setText((this.player.potions ?? 0).toString());

            // Update Cooldown Gauge (Red, filling up from bottom)
            this.potionGauge.clear();

            if (this.player.potionCooldownTimer > 0) {
                const progress = 1 - (this.player.potionCooldownTimer / this.player.potionMaxCooldown);
                const h = 32 * progress;

                // Fill red
                this.potionGauge.fillStyle(0xff0000, 0.7);
                // Draw from bottom up: y = bottom - h
                const layout = this.getLayout();
                this.potionGauge.fillRect(layout.potX, layout.potY + (32 - h), 32, h);
            }
        }
    }

    createDebugMenu() {
        this.isDebugMenuOpen = false;
        this.debugMenuContainer = this.scene.add.container(400, 300).setScrollFactor(0).setDepth(200).setVisible(false);

        // 背景
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x000000, 0.9);
        bg.fillRect(-150, -100, 300, 200);
        bg.lineStyle(2, 0xffffff, 1);
        bg.strokeRect(-150, -100, 300, 200);
        this.debugMenuContainer.add(bg);

        // タイトル
        const title = this.scene.add.text(0, -80, 'Debug Menu', { fontFamily: 'x10y12pxDonguriDuel', fontSize: '20px', fill: '#ffffff' }).setOrigin(0.5);
        this.debugMenuContainer.add(title);

        // 全武器入手ボタン
        const btnBg = this.scene.add.graphics();
        btnBg.fillStyle(0x444444, 1);
        btnBg.fillRect(-100, -20, 200, 40);
        // インタラクティブ領域の設定
        btnBg.setInteractive(new Phaser.Geom.Rectangle(-100, -20, 200, 40), Phaser.Geom.Rectangle.Contains);

        const btnText = this.scene.add.text(0, 0, 'Give All Weapons', { fontFamily: 'x10y12pxDonguriDuel', fontSize: '16px', fill: '#ffffff' }).setOrigin(0.5);

        this.debugMenuContainer.add([btnBg, btnText]);

        // ボタンイベント
        btnBg.on('pointerdown', () => {
            btnBg.clear();
            btnBg.fillStyle(0x666666, 1);
            btnBg.fillRect(-100, -20, 200, 40);
            this.giveAllWeapons();
        });
        btnBg.on('pointerup', () => {
            btnBg.clear();
            btnBg.fillStyle(0x444444, 1);
            btnBg.fillRect(-100, -20, 200, 40);
        });
        btnBg.on('pointerout', () => {
            btnBg.clear();
            btnBg.fillStyle(0x444444, 1);
            btnBg.fillRect(-100, -20, 200, 40);
        });
    }

    toggleDebugMenu() {
        if (this.player && this.player.isFatalAttacking) {
            return;
        }

        if (!this.debugMenuContainer) {
            this.createDebugMenu();
        }
        this.isDebugMenuOpen = !this.isDebugMenuOpen;
        this.debugMenuContainer.setVisible(this.isDebugMenuOpen);
    }

    giveAllWeapons() {
        const weaponIds = Object.keys(WEAPON_TYPES);
        let addedCount = 0;
        let droppedCount = 0;

        weaponIds.forEach((id, index) => {
            const typeId = Number(id);
            const weaponDef = WEAPON_TYPES[typeId];
            const rarity = RARITY.LEGENDARY;
            const itemData = {
                id: Phaser.Utils.String.UUID(),
                typeId,
                type: 'weapon',
                rarity,
                name: weaponDef.name,
                attackPower: Math.floor(weaponDef.baseAttack * (1 + rarity * 0.5)),
                attackSpeed: parseFloat((weaponDef.baseSpeed + rarity * 0.1).toFixed(2)),
                size: parseFloat((weaponDef.baseSize + rarity * 0.1).toFixed(2)),
                options: []
            };

            const added = this.player.addToInventory(itemData, false);
            if (added) {
                addedCount++;
                return;
            }

            const angle = (index / Math.max(1, weaponIds.length)) * Math.PI * 2;
            const dx = Math.cos(angle) * 40;
            const dy = Math.sin(angle) * 40;
            const drop = new ItemDrop(this.scene, this.player.x + dx, this.player.y + 20 + dy, 'weapon', itemData);
            if (drop.body) {
                drop.setVelocity(Phaser.Math.Between(-120, 120), Phaser.Math.Between(-120, 120));
            }
            this.scene.items.add(drop);
            droppedCount++;
        });

        this.updateInventoryItems();

        const msgText = droppedCount > 0 ? `Added ${addedCount}, Dropped ${droppedCount}` : 'All Weapons Added!';
        const msg = this.scene.add.text(400, 400, msgText, { fontFamily: 'x10y12pxDonguriDuel', fontSize: '24px', fill: '#00ff00', stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5).setScrollFactor(0).setDepth(300);
        this.scene.tweens.add({
            targets: msg,
            y: 350,
            alpha: 0,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => msg.destroy()
        });
    }
}
