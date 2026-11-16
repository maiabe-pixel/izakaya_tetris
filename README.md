# 居酒屋テトリス

― 詰んでからが、本番。―

ブラウザで遊べる一人用パズル。落下モードで地形を作り、居酒屋モードでカードを引いてミノを置き、**最下段の行を消すとクリア**。

## Stack

React + TypeScript + Vite + Canvas + CSS + localStorage + Web Audio（ゲームエンジンなし）

## 遊び方

1. タイトル → 制限時間（3/5/7/10/15秒、初期7）
2. 落下モード（10×20・7袋）
3. 積めたら居酒屋モード（上に空行+7 → 27行）
4. 食/飲で資源 →「カードを引く」ネオンルーレット → 着地タップで配置
5. 最下段クリア → 結果 → タイトル

## 開発

```bash
npm install
npm run dev          # 0.0.0.0:5173
npm run typecheck
npm run build
npm run verify:bgm
npm run test:matrix  # または npx tsx scripts/phase5-matrix.mts
```

## BGM

- パスは `src/audio/tracks.ts` のみ（`/audio/tetris.mp3`・`/audio/izakaya.mp3`）
- 著作権フリー音源を `public/audio/` に同梱（公開ビルドにも含める）
- `npm run verify:bgm` で dist への同梱を確認

## セーブ

| キー | 内容 |
|---|---|
| `izakaya-neon-puzzle:session-v1` | 居酒屋セッション |
| `izakaya-neon-puzzle:audio-v1` | BGM/効果音設定 |
