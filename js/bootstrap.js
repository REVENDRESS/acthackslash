const config = {
    type: Phaser.AUTO,
    width: 960,
    height: 540,
    parent: 'game-container',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    backgroundColor: '#1a1a1a',
    input: {
        gamepad: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },
    scene: [TitleScene, SaveSlotScene, BaseMenuScene, WarehouseShopScene, ArenaScene, DungeonSelectScene, ClearResultScene, SurvivalScene, MainScene],
    pixelArt: true
};

let activePadIndex = null;
const game = window.__phaserGame = new Phaser.Game(config);

// Keep a connected controller selected across scenes and ignore stale slots.
Phaser.Input.Gamepad.GamepadPlugin.prototype.getPad = function() {
    const pads = (this.gamepads || []).filter(pad => pad && pad.connected);
    return pads.find(pad => pad.index === activePadIndex)
        || pads.find(pad => pad.pad?.mapping === 'standard') || pads[0] || null;
};
window.addEventListener('gamepadconnected', event => {
    activePadIndex = event.gamepad.index;
    document.getElementById('pad-status').textContent = 'コントローラー接続済み';
});
window.addEventListener('gamepaddisconnected', () => {
    document.getElementById('pad-status').textContent = '接続が切れました。再接続してボタンを押してください';
});
