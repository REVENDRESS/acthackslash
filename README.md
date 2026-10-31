# acthackslash

添付プロトタイプのブラウザ版。ゲームライブラリと素材は同梱。

GitHub Pages: Settings → Pages → Deploy from a branch → main / (root)。

## コントローラー
左スティック: 移動 / A(×): 決定・拾う / B(○): 戻る・回避 / X(□): 弱攻撃 / Y(△): 強攻撃 / LB(L1): ガード / RB(R1)+攻撃: 強化攻撃 / RT(R2): 向き固定 / 十字キー上: 回復 / Start(OPTIONS): 所持品。
接続後にボタンを押すとブラウザが認識します。標準マッピング対応。

セーブはブラウザのlocalStorageに保存されます。

## ソース構成
- `index.html`: 画面の枠と読み込み順
- `css/game.css`: ページスタイル
- `js/data.js`: アイテム定義と共通描画ヘルパー
- `js/entities/`: プレイヤー・敵・床アイテム・エフェクト
- `js/ui/HUD.js`: HUDと所持品画面
- `js/textures.js`: 手続き生成テクスチャ
- `js/scenes/`: メニュー・探索・サバイバル
- `js/bootstrap.js`: Phaser起動とコントローラー選択
- `js/errors.js`: エラー表示
- `assets/`: 画像とフォント（宝箱画像もここに一元化）

ビルド不要。クラシックスクリプトの読み込み順を維持してください。
GitHub Pagesはmainへの更新を自動公開します。
