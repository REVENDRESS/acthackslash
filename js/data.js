const RARITY = {
    NORMAL: 0,
    RARE: 1,
    EPIC: 2,
    LEGENDARY: 3
};

const RARITY_COLORS = {
    0: 0xffffff,
    1: 0x0000ff,
    2: 0xcc66ff,
    3: 0xffa500
};

const RARITY_NAMES = {
    0: 'Normal',
    1: 'Rare',
    2: 'Epic',
    3: 'Legendary'
};

const RARITY_LABELS_JP = {
    0: 'ノーマル',
    1: 'レア',
    2: 'エピック',
    3: 'レジェンダリー'
};

// コントローラーボタンのデバウンス設定
// 0 = 無効（即反応）、500 = 通常（500ms待機）
const PAD_DEBOUNCE_MS = 0;

const WEAPON_TYPES = {
    1: { name: "さびたけん", baseAttack: 8, baseSpeed: 0.8, baseSize: 0.9, texture: "weapon_rusty_sword", color: 0x8B4513 },
    2: { name: "てつのけん", baseAttack: 12, baseSpeed: 1.0, baseSize: 1.0, texture: "weapon_iron_sword", color: 0xC0C0C0 },
    3: { name: "はがねのつるぎ", baseAttack: 18, baseSpeed: 0.9, baseSize: 1.1, texture: "weapon_steel_longsword", color: 0xE6E6FA },
    4: { name: "たんけん", baseAttack: 6, baseSpeed: 1.5, baseSize: 0.45, texture: "weapon_dagger", color: 0x708090 },
    5: { name: "くれいもあ", baseAttack: 25, baseSpeed: 0.6, baseSize: 1.3, texture: "weapon_claymore", color: 0xD3D3D3 },
    6: { name: "ざんげつ", baseAttack: 28, baseSpeed: 0.8, baseSize: 1.2, texture: "weapon_zangetsu", color: 0x2F4F4F },
    7: { name: "ぎんのけん", baseAttack: 18, baseSpeed: 1.0, baseSize: 1.0, texture: "weapon_sacred_silver", color: 0xF0FFFF },
    8: { name: "フォトンブレード", baseAttack: 22, baseSpeed: 1.2, baseSize: 1.1, texture: "weapon_photon_blade", color: 0x00FFFF },
    9: { name: "ブッチャーナイフ", baseAttack: 28, baseSpeed: 0.7, baseSize: 1.2, texture: "weapon_butcher_knife", color: 0x8B0000 },
    10: { name: "クリスタルエッジ", baseAttack: 20, baseSpeed: 1.0, baseSize: 1.0, texture: "weapon_crystal_edge", color: 0xFF69B4 },
    11: { name: "ヴォイド・カッター", baseAttack: 30, baseSpeed: 1.3, baseSize: 1.0, texture: "weapon_void_cutter", color: 0x000000 },
    12: { name: "ギア・ブレード", baseAttack: 26, baseSpeed: 0.8, baseSize: 1.3, texture: "weapon_gear_blade", color: 0xCD7F32 },
    13: { name: "ぎれいけん", baseAttack: 32, baseSpeed: 1.1, baseSize: 1.1, texture: "weapon_golden_order", color: 0xFFD700 },
};

const SHIELD_TYPES = {
    1: { name: "てつのたて", baseHardness: 5, baseThickness: 4, baseWeight: 4, texture: "shield_iron" },
    2: { name: "ラウンドシールド", baseHardness: 4, baseThickness: 3, baseWeight: 3, texture: "shield_round" },
    3: { name: "カイトシールド", baseHardness: 6, baseThickness: 5, baseWeight: 5, texture: "shield_kite" },
    4: { name: "バックラー", baseHardness: 2, baseThickness: 2, baseWeight: 1, texture: "shield_buckler" },
    5: { name: "タワーシールド", baseHardness: 8, baseThickness: 7, baseWeight: 7, texture: "shield_tower" },
    6: { name: "ぎんのたて", baseHardness: 5, baseThickness: 5, baseWeight: 3, texture: "shield_silver" },
    7: { name: "きりがくれのたて", baseHardness: 3, baseThickness: 4, baseWeight: 2, texture: "shield_mist" },
    8: { name: "さびたたて", baseHardness: 1, baseThickness: 1, baseWeight: 2, texture: "shield_rusty" },
    9: { name: "しょけいにんのたて", baseHardness: 7, baseThickness: 4, baseWeight: 4, texture: "shield_executioner" },
    10: { name: "クリスタルシールド", baseHardness: 7, baseThickness: 3, baseWeight: 3, texture: "shield_crystal" }
};

function getOutlinedWeaponTextureKey(scene, baseTextureKey, rarity, isDropped = false) {
    if (!isDropped) {
        return baseTextureKey;
    }

    const outlineColor = RARITY_COLORS[rarity] ?? 0xffffff;
    const outlinedKey = `${baseTextureKey}__outline__${rarity}_dropped`;
    if (scene.textures.exists(outlinedKey)) return outlinedKey;

    if (!scene.textures.exists(baseTextureKey)) return baseTextureKey;
    const baseTexture = scene.textures.get(baseTextureKey);
    const sourceImage = baseTexture?.getSourceImage?.();
    if (!sourceImage) return baseTextureKey;

    const width = sourceImage.width;
    const height = sourceImage.height;
    if (!width || !height) return baseTextureKey;

    const canvasTexture = scene.textures.createCanvas(outlinedKey, width, height);
    const ctx = canvasTexture.getContext();
    const tmp = document.createElement('canvas');
    tmp.width = width;
    tmp.height = height;
    const tctx = tmp.getContext('2d');

    const offsets = [];
    for (let y = -2; y <= 2; y++) {
        for (let x = -2; x <= 2; x++) {
            if (x === 0 && y === 0) continue;
            if (x*x + y*y <= 5) {
                offsets.push([x, y]);
            }
        }
    }

    for (const [dx, dy] of offsets) {
        tctx.drawImage(sourceImage, dx, dy);
    }

    const colorStr = '#' + outlineColor.toString(16).padStart(6, '0');
    tctx.globalCompositeOperation = 'source-in';
    tctx.fillStyle = colorStr;
    tctx.fillRect(0, 0, width, height);
    tctx.globalCompositeOperation = 'destination-out';
    tctx.drawImage(sourceImage, 0, 0);

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(tmp, 0, 0);
    ctx.drawImage(sourceImage, 0, 0);
    canvasTexture.refresh();

    return outlinedKey;
}

function getOutlinedShieldTextureKey(scene, baseTextureKey, rarity, isDropped = false) {
    return getOutlinedWeaponTextureKey(scene, baseTextureKey, rarity, isDropped);
}
