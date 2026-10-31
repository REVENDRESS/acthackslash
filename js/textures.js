const createSkeletonTexture = (scene, key, state) => {
    if (scene.textures.exists(key)) return;
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

    // --- Pixel Art Skeleton Archer ---

    // 1. Legs (Bone White)
    graphics.fillStyle(0xE0E0E0, 1);
    graphics.fillRect(12, 22, 2, 10); // Left Leg Bone
    graphics.fillRect(18, 22, 2, 10); // Right Leg Bone

    // 2. Ribcage/Spine (Bone White)
    graphics.fillStyle(0xE0E0E0, 1);
    graphics.fillRect(14, 14, 4, 10); // Spine
    // Ribs
    graphics.fillRect(11, 15, 10, 2);
    graphics.fillRect(12, 18, 8, 2);
    graphics.fillRect(13, 21, 6, 2);

    // 3. Left Arm (Holding Bow) - Static
    graphics.fillStyle(0xE0E0E0, 1);
    graphics.fillRect(8, 14, 2, 8); 

    // 4. Skull (Bone White)
    graphics.fillStyle(0xE0E0E0, 1);
    graphics.fillRect(10, 4, 12, 10); // Skull Base

    // 5. Face Details
    graphics.fillStyle(0x1a1a1a, 1); 
    graphics.fillRect(12, 7, 3, 3); // Left Eye
    graphics.fillRect(17, 7, 3, 3); // Right Eye
    graphics.fillRect(15, 11, 2, 2); // Nose
    // Teeth
    graphics.fillRect(12, 13, 1, 1);
    graphics.fillRect(14, 13, 1, 1);
    graphics.fillRect(16, 13, 1, 1);
    graphics.fillRect(18, 13, 1, 1);

    // 6. Hood
    graphics.fillStyle(0x5D4037, 1);
    graphics.fillRect(8, 2, 16, 4); 
    graphics.fillRect(8, 2, 4, 12); 
    graphics.fillRect(20, 2, 4, 12); 
    graphics.fillRect(8, 14, 2, 2);
    graphics.fillRect(22, 14, 2, 2);

    // 7. Quiver
    graphics.fillStyle(0x3E2723, 1);
    graphics.fillRect(21, 10, 3, 8);
    graphics.fillStyle(0xE0E0E0, 1);
    graphics.fillRect(22, 8, 1, 2);

    // --- State Dependent Parts ---
    let rightHandX = 22;
    let bowControlX = 0;

    if (state === 'draw') {
        rightHandX = 16; // Pulling back
        bowControlX = -8; // Curved more
    } else if (state === 'shoot') {
        rightHandX = 24; // Released
        bowControlX = 4; // Straightened
    }

    // Right Arm (Dynamic)
    graphics.fillStyle(0xE0E0E0, 1);
    if (state === 'draw') {
        // Drawing pose: arm bent back
        graphics.fillRect(22, 14, 2, 4); // Upper arm
        graphics.fillRect(18, 16, 4, 2); // Forearm
    } else {
        graphics.fillRect(22, 14, 2, 8); // Normal down
    }

    // 8. Bow (Left Hand)
    graphics.lineStyle(2, 0x8D6E63, 1);
    const start = new Phaser.Math.Vector2(8, 6);
    const control = new Phaser.Math.Vector2(bowControlX, 16); 
    const end = new Phaser.Math.Vector2(8, 26);
    const curve = new Phaser.Curves.QuadraticBezier(start, control, end);
    curve.draw(graphics);

    // Bow String
    graphics.lineStyle(1, 0xFFFFFF, 0.5);
    graphics.beginPath();
    graphics.moveTo(8, 6);
    if (state === 'draw') {
        graphics.lineTo(rightHandX, 18); // Pulled to hand
        graphics.lineTo(8, 26);
    } else {
        graphics.lineTo(8, 26); // Straight
    }
    graphics.strokePath();

    // Arrow (if drawing)
    if (state === 'draw') {
        graphics.fillStyle(0xE0E0E0, 1); // Bone arrow
        graphics.fillRect(8, 18, 12, 1); // Arrow shaft
    }

    graphics.generateTexture(key, 32, 32);
    graphics.destroy();
};

// --- Exiled Soldier (Normal Enemy) ---
const createExiledSoldierTextures = (scene) => {
    // Colors
    const c = {
        skin: 0x9E9E9E,      // Ashen skin
        armor: 0x555555,     // Dull iron
        rust: 0x8B4513,      // Rust spots
        cloth: 0x5D2E2E,     // Faded Maroon Surcoat
        helmet: 0xB8860B,    // Tarnished Brass/Gold
        dark: 0x222222       // Shadow/Pants
    };

    const drawSoldier = (key, pose) => {
        if (scene.textures.exists(key)) return;
        const g = scene.make.graphics({ x: 0, y: 0, add: false });

        // 1. Legs
        g.fillStyle(c.dark, 1);
        if (pose === 'walk1') {
            g.fillRect(10, 22, 4, 10); // Left Back
            g.fillRect(18, 20, 4, 10); // Right Forward
        } else if (pose === 'walk2') {
            g.fillRect(10, 20, 4, 10); // Left Forward
            g.fillRect(18, 22, 4, 10); // Right Back
        } else {
            // Idle
            g.fillRect(10, 22, 4, 10);
            g.fillRect(18, 22, 4, 10);
        }

        // 2. Body (Chainmail & Surcoat)
        // Chainmail visible at bottom
        g.fillStyle(c.armor, 1);
        g.fillRect(9, 18, 14, 6);

        // Surcoat (Tattered)
        g.fillStyle(c.cloth, 1);
        g.fillRect(8, 12, 16, 12);
        // Tatters
        g.fillRect(8, 24, 4, 2);
        g.fillRect(14, 24, 4, 3);
        g.fillRect(20, 24, 4, 1);

        // Rust/Dirt on Surcoat
        g.fillStyle(0x3e2723, 0.5);
        g.fillRect(10, 16, 4, 4);
        g.fillRect(18, 20, 2, 2);

        // 3. Head (Helmet)
        g.fillStyle(c.helmet, 1);
        g.fillRect(10, 4, 12, 10); // Helmet Dome
        g.fillStyle(c.rust, 0.6); // Rust on helmet
        g.fillRect(11, 5, 3, 3);

        // Face (Visor open/missing)
        g.fillStyle(c.skin, 1);
        g.fillRect(12, 8, 8, 6);

        // Eyes (Hollow)
        g.fillStyle(0x000000, 0.8);
        g.fillRect(13, 10, 2, 2);
        g.fillRect(17, 10, 2, 2);

        // Helmet Rim
        g.fillStyle(c.armor, 1);
        g.fillRect(9, 10, 14, 2); // Brow ridge

        // 4. Arms
        g.fillStyle(c.armor, 1);

        if (pose === 'attack_charge') {
            // Raising arms high
            g.fillRect(6, 10, 4, 8); // Left Arm Up
            g.fillRect(22, 10, 4, 8); // Right Arm Up
        } else if (pose === 'attack_swing') {
            // Swinging down
            g.fillRect(6, 16, 4, 8); // Left Arm Forward/Down
            g.fillRect(22, 16, 4, 8); // Right Arm Forward/Down
        } else {
            // Idle/Walk
            g.fillRect(6, 14, 4, 8); // Left Arm Side
            g.fillRect(22, 14, 4, 8); // Right Arm Side
        }

        g.generateTexture(key, 32, 32);
        g.destroy();
    };

    drawSoldier('exiled_idle', 'idle');
    drawSoldier('exiled_walk1', 'walk1');
    drawSoldier('exiled_walk2', 'walk2');
    drawSoldier('exiled_charge', 'attack_charge');
    drawSoldier('exiled_swing', 'attack_swing');
};

const createRustySwordTexture = (scene) => {
    const key = 'rusty_sword';
    if (scene.textures.exists(key)) return;
    const g = scene.make.graphics({ x: 0, y: 0, add: false });

    // Blade (Chipped Iron)
    g.fillStyle(0x757575, 1);
    g.fillRect(14, 4, 4, 20);

    // Rust spots
    g.fillStyle(0x8B4513, 0.8);
    g.fillRect(14, 8, 2, 4);
    g.fillRect(16, 16, 2, 3);

    // Crossguard
    g.fillStyle(0x3E2723, 1); // Dark Wood/Rusted Iron
    g.fillRect(10, 24, 12, 2);

    // Grip
    g.fillStyle(0x5D4037, 1); // Leather
    g.fillRect(15, 26, 2, 4);

    // Pommel
    g.fillStyle(0x8B4513, 1);
    g.fillRect(14, 30, 4, 2);

    g.generateTexture(key, 32, 32);
    g.destroy();
};


// Helper to create heavy knight texture
const createHeavyKnightTexture = (scene, key) => {
    if (scene.textures.exists(key)) return;
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

    // --- Pixel Art Heavy Knight (64x64) ---

    // 1. Cape (Red) - Behind everything
    graphics.fillStyle(0x880000, 1);
    graphics.fillRect(20, 20, 24, 36);

    // 2. Legs (Armored - Dark Grey)
    graphics.fillStyle(0x444444, 1);
    graphics.fillRect(24, 40, 6, 16); // Left Leg
    graphics.fillRect(34, 40, 6, 16); // Right Leg

    // 3. Torso (Plate Armor - Silver)
    graphics.fillStyle(0xAAAAAA, 1);
    graphics.fillRect(20, 20, 24, 24); // Chest
    graphics.fillStyle(0x888888, 1);
    graphics.fillRect(22, 22, 20, 20); // Inner Detail

    // 4. Head (Helmet - Dark Silver)
    graphics.fillStyle(0x888888, 1);
    graphics.fillRect(24, 6, 16, 16);
    // Visor (Black Slit)
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(26, 12, 12, 2);
    // Plume (Red)
    graphics.fillStyle(0xCC0000, 1);
    graphics.fillRect(30, 0, 4, 6);

    // 5. Left Arm (Shield Side)
    // Shield (Large Heater Shield)
    graphics.fillStyle(0x222222, 1);
    graphics.beginPath();
    graphics.moveTo(12, 20);
    graphics.lineTo(28, 20);
    graphics.lineTo(28, 40);
    graphics.lineTo(20, 52); // Point
    graphics.lineTo(12, 40);
    graphics.closePath();
    graphics.fillPath();
    // Shield Trim (Gold/Yellow)
    graphics.lineStyle(2, 0xFFD700, 1);
    graphics.strokePath();

    // 6. Right Arm (Weapon Side)
    graphics.fillStyle(0xAAAAAA, 1);
    graphics.fillRect(44, 22, 6, 14); // Shoulder/Arm

    // Weapon (Greatsword/Lance) - Held vertical
    graphics.fillStyle(0xDDDDDD, 1);
    // Blade
    graphics.fillRect(50, 4, 6, 46);
    // Hilt
    graphics.fillStyle(0x442200, 1);
    graphics.fillRect(48, 40, 10, 4); // Crossguard
    graphics.fillRect(51, 44, 4, 10); // Handle

    graphics.generateTexture(key, 64, 64);
    graphics.destroy();
};

// Helper to create executioner texture (Body)
const createExecutionerTexture = (scene, key) => {
    if (scene.textures.exists(key)) return;
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

    // --- Pixel Art Executioner (64x64) ---

    // 1. Body Base (Skin - Greyish)
    graphics.fillStyle(0xD7CCC8, 1);
    graphics.fillRect(20, 20, 24, 24); // Torso (Muscular)
    graphics.fillRect(22, 44, 8, 16);  // Left Leg
    graphics.fillRect(34, 44, 8, 16);  // Right Leg
    graphics.fillRect(14, 22, 8, 20);  // Left Arm
    graphics.fillRect(42, 22, 8, 20);  // Right Arm

    // 2. Apron (Leather/Bloodied)
    graphics.fillStyle(0x3E2723, 1); // Dark Brown
    graphics.fillRect(20, 30, 24, 20); // Waist/Skirt
    graphics.fillStyle(0x5D4037, 1); // Lighter Brown Strap
    graphics.fillRect(22, 20, 4, 30); // Strap Left
    graphics.fillRect(38, 20, 4, 30); // Strap Right

    // Blood stains on apron
    graphics.fillStyle(0x880000, 0.8);
    graphics.fillRect(24, 38, 6, 8);
    graphics.fillRect(32, 42, 4, 6);

    // 3. Boots (Black)
    graphics.fillStyle(0x212121, 1);
    graphics.fillRect(20, 56, 10, 8);
    graphics.fillRect(34, 56, 10, 8);

    // 4. Gloves/Wristbands (Black leather)
    graphics.fillStyle(0x212121, 1);
    graphics.fillRect(14, 36, 8, 6);
    graphics.fillRect(42, 36, 8, 6);

    // 5. Head (Black Hood)
    graphics.fillStyle(0x212121, 1); // Black
    graphics.fillRect(22, 4, 20, 20); // Main Hood

    // Hood shape (Triangle top)
    graphics.beginPath();
    graphics.moveTo(22, 4);
    graphics.lineTo(42, 4);
    graphics.lineTo(32, 0); // Pointy top
    graphics.closePath();
    graphics.fillPath();

    // Eye holes (Darker or Glowing?)
    // Let's make them hidden (shadow)
    graphics.fillStyle(0x000000, 0.5);
    graphics.fillRect(26, 10, 4, 2);
    graphics.fillRect(34, 10, 4, 2);

    graphics.generateTexture(key, 64, 64);
    graphics.destroy();
};

// Helper to create executioner axe texture (Weapon)
const createExecutionerAxeTexture = (scene, key) => {
    if (scene.textures.exists(key)) return;
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

    // --- Huge Axe (32x96) ---
    // Designed to be held by the center or bottom.
    // Let's make it 48x96 to have a wide blade.

    // 1. Handle (Long Wood)
    graphics.fillStyle(0x4E342E, 1);
    graphics.fillRect(10, 4, 6, 88); // Shifted handle left

    // 2. Blade (Right side)
    graphics.fillStyle(0xBDBDBD, 1); // Silver
    graphics.beginPath();
    graphics.moveTo(16, 12); // Neck top
    graphics.lineTo(40, 4);  // Top tip

    // Curved Cutting Edge using Phaser.Curves.QuadraticBezier
    const bladeCurve = new Phaser.Curves.QuadraticBezier(
        new Phaser.Math.Vector2(40, 4),
        new Phaser.Math.Vector2(48, 24),
        new Phaser.Math.Vector2(40, 44)
    );
    const points = bladeCurve.getPoints(10);
    points.forEach(p => graphics.lineTo(p.x, p.y));

    graphics.lineTo(16, 36); // Neck bottom
    graphics.closePath();
    graphics.fillPath();

    // 3. Edge Highlight
    graphics.lineStyle(2, 0xE0E0E0, 1);
    bladeCurve.draw(graphics);

    // Blood on blade
    graphics.fillStyle(0x880000, 0.7);
    graphics.beginPath();
    graphics.moveTo(30, 20);
    graphics.lineTo(44, 10);
    graphics.lineTo(42, 30);
    graphics.closePath();
    graphics.fillPath();

    graphics.generateTexture(key, 48, 96);
    graphics.destroy();
};

const createPoisonMushroomTexture = (scene, key) => {
    if (scene.textures.exists(key)) return;
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x143018, 1);
    g.fillRect(14, 18, 4, 10);
    g.fillStyle(0x357a38, 1);
    g.fillRect(8, 10, 16, 8);
    g.fillStyle(0x8bd67a, 1);
    g.fillRect(10, 12, 3, 2);
    g.fillRect(16, 11, 3, 2);
    g.generateTexture(key, 32, 32);
    g.destroy();
};

const createHangedWispTexture = (scene, key) => {
    if (scene.textures.exists(key)) return;
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x5d4037, 1);
    g.fillRect(15, 0, 2, 12);
    g.fillRect(14, 10, 4, 3);
    g.fillStyle(0x11111f, 1);
    g.fillEllipse(16, 18, 18, 14);
    g.fillTriangle(8, 20, 24, 20, 16, 28);
    g.fillEllipse(16, 30, 16, 10);
    g.fillTriangle(8, 30, 12, 40, 16, 32);
    g.fillTriangle(24, 30, 20, 40, 16, 32);
    g.fillStyle(0xfffff0, 1);
    g.fillCircle(13, 18, 2);
    g.fillCircle(19, 18, 2);
    g.fillStyle(0xfff176, 1);
    g.fillCircle(13, 18, 1);
    g.fillCircle(19, 18, 1);
    g.fillStyle(0x26c6da, 0.8);
    g.fillEllipse(16, 28, 8, 6);
    g.fillStyle(0x80deea, 1);
    g.fillEllipse(16, 28, 4, 3);
    g.generateTexture(key, 32, 48);
    g.destroy();
};

const createMossyStatueTexture = (scene, key) => {
    if (scene.textures.exists(key)) return;
    const g = scene.make.graphics({ x: 0, y: 0, add: false });

    g.fillStyle(0x000000, 0.25);
    g.fillEllipse(16, 46, 18, 4);

    g.fillStyle(0x455a64, 1);
    g.fillRect(8, 30, 16, 10);

    g.fillStyle(0x607d8b, 1);
    g.fillRect(10, 18, 12, 12);
    g.fillRect(11, 10, 10, 8);

    g.fillStyle(0xcfd8dc, 1);
    g.fillRect(12, 12, 3, 3);
    g.fillRect(17, 12, 3, 3);

    g.fillStyle(0x33691e, 1);
    g.fillRect(11, 8, 4, 4);
    g.fillRect(16, 8, 3, 4);
    g.fillRect(9, 20, 3, 4);
    g.fillRect(20, 22, 3, 4);

    g.fillStyle(0x558b2f, 1);
    g.fillRect(13, 7, 2, 2);
    g.fillRect(18, 7, 2, 2);

    g.lineStyle(1, 0x263238, 1);
    g.beginPath();
    g.moveTo(13, 10);
    g.lineTo(12, 16);
    g.strokePath();

    g.beginPath();
    g.moveTo(19, 18);
    g.lineTo(18, 26);
    g.strokePath();

    g.generateTexture(key, 32, 48);
    g.destroy();
};

const createCursedStagTexture = (scene, key) => {
    if (scene.textures.exists(key)) return;
    const g = scene.make.graphics({ x: 0, y: 0, add: false });

    g.fillStyle(0x000000, 0.25);
    g.fillEllipse(16, 46, 18, 4);

    g.fillStyle(0x4e342e, 1);
    g.fillRect(10, 18, 12, 22);
    g.fillRect(12, 14, 8, 6);

    g.fillStyle(0x6d4c41, 1);
    g.fillRect(11, 20, 10, 16);

    g.fillStyle(0x8d6e63, 1);
    g.fillRect(12, 16, 8, 4);

    g.fillStyle(0x263238, 1);
    g.fillEllipse(20, 22, 12, 16);

    g.lineStyle(2, 0xb0bec5, 1);
    g.strokeEllipse(20, 22, 12, 16);

    g.fillStyle(0x455a64, 1);
    g.fillEllipse(20, 22, 8, 10);

    g.fillStyle(0x33691e, 1);
    g.fillRect(14, 24, 4, 4);

    g.fillStyle(0x3e2723, 1);
    g.fillRect(11, 10, 2, 6);
    g.fillRect(19, 10, 2, 6);
    g.fillRect(9, 12, 2, 4);
    g.fillRect(21, 12, 2, 4);

    g.fillStyle(0x212121, 1);
    g.fillRect(13, 12, 6, 4);

    g.fillStyle(0xeeeeee, 1);
    g.fillRect(13, 12, 2, 2);
    g.fillRect(17, 12, 2, 2);

    g.generateTexture(key, 32, 48);
    g.destroy();
};

const createCursedStagTextures = (scene) => {
    const draw = (key, pose) => {
        if (scene.textures.exists(key)) return;
        const g = scene.make.graphics({ x: 0, y: 0, add: false });

        g.fillStyle(0x000000, 0.25);
        g.fillEllipse(16, 46, 18, 4);

        g.fillStyle(0x4e342e, 1);
        g.fillRect(10, 18, 12, 22);
        g.fillRect(12, 14, 8, 6);

        g.fillStyle(0x6d4c41, 1);
        g.fillRect(11, 20, 10, 16);

        g.fillStyle(0x8d6e63, 1);
        g.fillRect(12, 16, 8, 4);

        g.fillStyle(0x263238, 1);
        g.fillEllipse(20, 22, 12, 16);

        g.lineStyle(2, 0xb0bec5, 1);
        g.strokeEllipse(20, 22, 12, 16);

        g.fillStyle(0x455a64, 1);
        g.fillEllipse(20, 22, 8, 10);

        g.fillStyle(0x33691e, 1);
        g.fillRect(14, 24, 4, 4);

        g.fillStyle(0x3e2723, 1);
        g.fillRect(11, 10, 2, 6);
        g.fillRect(19, 10, 2, 6);
        g.fillRect(9, 12, 2, 4);
        g.fillRect(21, 12, 2, 4);

        g.fillStyle(0x212121, 1);
        g.fillRect(13, 12, 6, 4);

        g.fillStyle(0xeeeeee, 1);
        g.fillRect(13, 12, 2, 2);
        g.fillRect(17, 12, 2, 2);

        const handleColor = 0x5d4037;
        const gripColor = 0x4e342e;
        const bladeOuter = 0x455a64;
        const bladeInner = 0xcfd8dc;
        const bladeHighlight = 0xffffff;

        if (pose === 'idle') {
            g.fillStyle(handleColor, 1);
            g.fillRect(5, 22, 3, 18);
            g.fillStyle(gripColor, 1);
            g.fillRect(5, 26, 3, 6);
            g.fillStyle(bladeOuter, 1);
            g.fillRect(2, 22, 6, 11);
            g.fillTriangle(2, 22, 2, 33, 0, 27);
            g.fillStyle(bladeInner, 1);
            g.fillRect(3, 23, 4, 9);
            g.fillTriangle(3, 23, 3, 32, 1, 27);
            g.fillStyle(bladeHighlight, 0.8);
            g.fillRect(6, 24, 1, 6);
        } else if (pose === 'attack_up') {
            g.fillStyle(handleColor, 1);
            g.fillRect(8, 6, 3, 24);
            g.fillStyle(gripColor, 1);
            g.fillRect(8, 14, 3, 6);
            g.fillStyle(bladeOuter, 1);
            g.fillRect(4, 6, 9, 9);
            g.fillTriangle(4, 6, 13, 6, 13, 3);
            g.fillStyle(bladeInner, 1);
            g.fillRect(5, 7, 7, 7);
            g.fillTriangle(5, 7, 12, 7, 12, 4);
            g.fillStyle(bladeHighlight, 0.8);
            g.fillRect(11, 7, 1, 5);
        } else if (pose === 'attack_down') {
            g.fillStyle(handleColor, 1);
            g.fillRect(21, 20, 3, 20);
            g.fillStyle(gripColor, 1);
            g.fillRect(21, 26, 3, 6);
            g.fillStyle(bladeOuter, 1);
            g.fillRect(17, 30, 9, 9);
            g.fillTriangle(17, 39, 26, 39, 26, 42);
            g.fillStyle(bladeInner, 1);
            g.fillRect(18, 31, 7, 7);
            g.fillTriangle(18, 38, 25, 38, 25, 41);
            g.fillStyle(bladeHighlight, 0.8);
            g.fillRect(23, 32, 1, 5);
        }

        g.generateTexture(key, 32, 48);
        g.destroy();
    };

    draw('cursed_stag_idle_0', 'idle');
    draw('cursed_stag_attack_0', 'attack_up');
    draw('cursed_stag_attack_1', 'attack_down');
};

const createCrowTexture = (scene) => {
    const hasBase = scene.textures.exists('crow_idle_0');

    const bodyColor = 0x111111;
    const wingColor = 0x202020;
    const eyeColor = 0xffffff;
    const beakColor = 0xffcc33;

    const drawCrow = (key, pose) => {
        const g = scene.make.graphics({ x: 0, y: 0, add: false });

        g.fillStyle(bodyColor, 1);
        g.fillEllipse(16, 19, 12, 8);
        g.fillEllipse(22, 14, 6, 5);

        g.fillStyle(eyeColor, 1);
        g.fillCircle(24, 13, 1.2);

        g.fillStyle(beakColor, 1);
        g.fillTriangle(26, 14, 30, 15, 26, 16);

        g.fillStyle(wingColor, 1);
        if (pose === 'down') {
            g.fillTriangle(12, 18, 4, 30, 16, 22);
            g.fillTriangle(20, 18, 28, 30, 16, 22);
        } else {
            g.fillTriangle(12, 18, 4, 8, 16, 14);
            g.fillTriangle(20, 18, 28, 8, 16, 14);
        }

        g.fillStyle(bodyColor, 1);
        g.fillTriangle(8, 20, 6, 26, 10, 26);

        g.generateTexture(key, 32, 32);
        g.destroy();
    };

    if (!hasBase) {
        drawCrow('crow_idle_0', 'down');
        drawCrow('crow_idle_1', 'up');
    }

    if (!scene.anims.exists('crow_fly')) {
        scene.anims.create({
            key: 'crow_fly',
            frames: [
                { key: 'crow_idle_0' },
                { key: 'crow_idle_1' }
            ],
            frameRate: 10,
            repeat: -1
        });
    }
};

const createShieldTextures = (scene) => {
    Object.values(SHIELD_TYPES).forEach(shield => {
        if (!shield.texture) return;
        if (scene.textures.exists(shield.texture)) return;
        const g = scene.make.graphics({x: 0, y: 0, add: false});
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
    });
};

const createWeaponTextures = (scene) => {
    // 横向きで描画（setOrigin(0,0.5) → 左端=柄のピボット, 右→刃先）
    // bladeLen: 刃の長さpx, thick: 刃の太さ, guardH: 鍔の高さ
    const weapons = [
        { key: 'weapon_rusty_sword',     color: 0x8B4513, guardColor: 0x5C3317, bladeLen: 36, thick: 5, guardH: 12 },
        { key: 'weapon_iron_sword',       color: 0xC0C0C0, guardColor: 0x888888, bladeLen: 40, thick: 5, guardH: 12 },
        { key: 'weapon_steel_longsword',  color: 0xE6E6FA, guardColor: 0xAAAAAA, bladeLen: 52, thick: 5, guardH: 14 },
        { key: 'weapon_dagger',           color: 0x708090, guardColor: 0x505060, bladeLen: 22, thick: 4, guardH: 8  },
        { key: 'weapon_claymore',         color: 0xD3D3D3, guardColor: 0x999999, bladeLen: 58, thick: 7, guardH: 18 },
        { key: 'weapon_zangetsu',         color: 0x3A3A5A, guardColor: 0x222240, bladeLen: 56, thick: 6, guardH: 14 },
        { key: 'weapon_sacred_silver',    color: 0xF0FFFF, guardColor: 0xCCEEFF, bladeLen: 44, thick: 5, guardH: 12 },
        { key: 'weapon_ancient_rune',     color: 0xFFD700, guardColor: 0xAA8800, bladeLen: 48, thick: 6, guardH: 14 },
        { key: 'weapon_flame_sword',      color: 0xFF6600, guardColor: 0xCC3300, bladeLen: 44, thick: 5, guardH: 12 },
        { key: 'weapon_ice_blade',        color: 0x88CCFF, guardColor: 0x4488AA, bladeLen: 44, thick: 5, guardH: 12 },
        { key: 'weapon_thunder_edge',     color: 0xFFFF44, guardColor: 0xAAAA00, bladeLen: 44, thick: 5, guardH: 12 },
        { key: 'weapon_shadow_blade',     color: 0x2A2A3A, guardColor: 0x111122, bladeLen: 46, thick: 6, guardH: 12 },
        { key: 'weapon_holy_sword',       color: 0xFFFFCC, guardColor: 0xCCCC88, bladeLen: 46, thick: 5, guardH: 12 },
        { key: 'weapon_dragon_slayer',    color: 0xFF4444, guardColor: 0xAA0000, bladeLen: 58, thick: 7, guardH: 16 },
        { key: 'weapon_elven_blade',      color: 0x88FF88, guardColor: 0x44AA44, bladeLen: 42, thick: 4, guardH: 10 },
        { key: 'weapon_demon_sword',      color: 0x880000, guardColor: 0x440000, bladeLen: 52, thick: 6, guardH: 14 },
    ];
    weapons.forEach(({ key, color, guardColor, bladeLen, thick, guardH }) => {
        if (scene.textures.exists(key)) return;
        const cw = 96, ch = 32;
        const cy = ch / 2;
        const g = scene.make.graphics({ x: 0, y: 0, add: false });
        // pommel（一番左 = pivot付近）
        g.fillStyle(guardColor, 1);
        g.fillCircle(3, cy, 3);
        // grip
        g.fillStyle(0x5C3317, 1);
        g.fillRect(5, cy - 2, 14, 4);
        // 鍔（guard）縦棒
        g.fillStyle(guardColor, 1);
        g.fillRect(19, cy - guardH/2, 5, guardH);
        // 刃のボディ（guard右端から伸びる）
        const bladeX = 24;
        g.fillStyle(color, 1);
        g.fillTriangle(
            bladeX, cy - thick/2,
            bladeX, cy + thick/2,
            bladeX + bladeLen, cy
        );
        // 刃のハイライト
        g.lineStyle(1, 0xffffff, 0.5);
        g.beginPath();
        g.moveTo(bladeX, cy - thick/2 + 1);
        g.lineTo(bladeX + bladeLen - 4, cy);
        g.strokePath();
        g.generateTexture(key, cw, ch);
        g.destroy();
    });
};

const createRatTextures = (scene) => {
    if (scene.textures.exists('rat_idle_0')) return;
    const genRat = (key, opts) => {
        const w = 64, h = 32;
        const g = scene.make.graphics({ x: 0, y: 0, add: false });
        const by = opts.by || 0, bx = opts.bx || 0;
        const phase = opts.phase || 'idle';
        const cFur = opts.fur || 0x4E342E, cSkin = 0xD7CCC8, cEye = 0xFF0000;
        const ox = 16 + bx, oy = 8 + by;
        if (phase === 'lunge') { g.fillStyle(0x000000, 0.3); g.fillEllipse(32+ox, 32+by+10, 16, 6); }
        g.lineStyle(2, cSkin, 1);
        if (phase === 'lunge') { g.beginPath(); g.moveTo(10+ox, 18+oy); g.lineTo(-5+ox, 18+oy); g.strokePath(); }
        else if (phase === 'windup') { const s=new Phaser.Math.Vector2(10+ox,18+oy),c=new Phaser.Math.Vector2(10+ox,24+oy),e=new Phaser.Math.Vector2(0+ox,20+oy); g.strokePoints(new Phaser.Curves.QuadraticBezier(s,c,e).getPoints(8)); }
        else { const s=new Phaser.Math.Vector2(10+ox,18+oy),c=new Phaser.Math.Vector2(0+ox,18+oy),e=new Phaser.Math.Vector2(-5+ox,8+oy); g.strokePoints(new Phaser.Curves.QuadraticBezier(s,c,e).getPoints(8)); }
        g.fillStyle(cFur, 1);
        if (phase === 'lunge') g.fillEllipse(20+ox,16+oy,20,7);
        else if (phase === 'windup') g.fillEllipse(20+ox,19+oy,16,10);
        else g.fillEllipse(20+ox,16+oy,14,9);
        g.fillStyle(cFur, 1);
        if (phase === 'lunge') g.fillEllipse(34+ox,16+oy,9,6);
        else if (phase === 'windup') g.fillEllipse(28+ox,18+oy,7,7);
        else g.fillEllipse(30+ox,15+oy,7,6);
        g.fillStyle(cSkin, 1);
        if (phase === 'lunge') { g.fillCircle(28+ox,14+oy,2.5); g.fillCircle(30+ox,12+oy,2.5); }
        else { g.fillCircle(28+ox,11+oy,2.5); g.fillCircle(32+ox,11+oy,2.5); }
        g.fillStyle(cEye, 1);
        if (phase === 'lunge') g.fillCircle(35+ox,14+oy,2.5);
        else if (phase === 'windup') g.fillCircle(29+ox,17+oy,1.5);
        else g.fillCircle(31+ox,14+oy,1.5);
        g.fillStyle(cSkin, 1);
        if (phase === 'lunge') g.fillCircle(42+ox,17+oy,1.5);
        else if (phase === 'windup') g.fillCircle(32+ox,20+oy,1);
        else g.fillCircle(36+ox,16+oy,1);
        if (phase === 'lunge') { g.fillStyle(0xFFFFFF,1); g.beginPath(); g.moveTo(38+ox,18+oy); g.lineTo(44+ox,18+oy); g.lineTo(41+ox,22+oy); g.fillPath(); g.fillStyle(0x000000,1); g.fillRect(38+ox,19+oy,5,2); }
        g.fillStyle(cSkin, 1);
        if (phase === 'lunge') { g.fillRect(20+ox,22+oy,6,2); g.fillRect(36+ox,22+oy,6,2); }
        else if (phase === 'windup') { g.fillRect(24+ox,24+oy,3,2); g.fillRect(16+ox,24+oy,3,2); }
        else { g.fillRect(26+ox,22+oy,2,3); g.fillRect(30+ox,22+oy,2,3); g.fillRect(14+ox,22+oy,2,3); g.fillRect(18+ox,22+oy,2,3); }
        g.generateTexture(key, w, h); g.destroy();
    };
    genRat('rat_idle_0',{by:0}); genRat('rat_idle_1',{by:-1});
    genRat('rat_move_0',{by:0}); genRat('rat_move_1',{by:-2}); genRat('rat_move_2',{by:0}); genRat('rat_move_3',{by:-2});
    genRat('rat_attack_0',{by:2,bx:-4,phase:'windup'}); genRat('rat_attack_1',{by:-16,bx:8,phase:'lunge'}); genRat('rat_attack_2',{by:0});
    genRat('rat_hit_0',{by:0,fur:0x6d4c41}); genRat('rat_hit_1',{by:-1,fur:0x5d4037});
    genRat('rat_death_0',{by:0,fur:0x3e2723}); genRat('rat_death_1',{by:2,fur:0x271c19}); genRat('rat_death_2',{by:4,fur:0x1a1210});
    if (!scene.anims.exists('rat_idle')) scene.anims.create({ key:'rat_idle', frames:[{key:'rat_idle_0'},{key:'rat_idle_1'}], frameRate:6, repeat:-1 });
    if (!scene.anims.exists('rat_move')) scene.anims.create({ key:'rat_move', frames:[{key:'rat_move_0'},{key:'rat_move_1'},{key:'rat_move_2'},{key:'rat_move_3'}], frameRate:10, repeat:-1 });
    if (!scene.anims.exists('rat_attack')) scene.anims.create({ key:'rat_attack', frames:[{key:'rat_attack_0',duration:400},{key:'rat_attack_1',duration:150},{key:'rat_attack_2',duration:100}], frameRate:10 });
    if (!scene.anims.exists('rat_hit')) scene.anims.create({ key:'rat_hit', frames:[{key:'rat_hit_0'},{key:'rat_hit_1'}], frameRate:10 });
    if (!scene.anims.exists('rat_death')) scene.anims.create({ key:'rat_death', frames:[{key:'rat_death_0'},{key:'rat_death_1'},{key:'rat_death_2'}], frameRate:6 });
};
