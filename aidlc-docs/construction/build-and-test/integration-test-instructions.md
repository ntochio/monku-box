# Integration Test Instructions — monku-box（monolith-core）

## Purpose

マイクロサービス分割はないため、**「レイヤと HTTP API が期待どおり協調するか」**を次で担保する。

- **自動**: `messages-api.test.ts` が Route Handler と永続化・Policy 周辺を横断する（`npm test` に含まれる）
- **手動**: 開発サーバー上でのスモーク（README の手順）

## Automated Integration-style Tests

単一プロセス内で API とインフラを結合する Vitest を、統合テスト相当として実行する。

```bash
npm install
npm test
```

### シナリオ（参考）

| 観点 | 内容 |
|------|------|
| Messages API | POST/GET が一時 `MONKU_DATA_DIR` で期待ステータス・JSON を返す |
| JSON ストア | 読み書き・トランザクション境界 |
| Policy | メッセージ受理とマスキング |

## Manual Integration / Smoke（E2E 代替・PoC）

専用の Playwright / Cypress は**未導入**。以下で主要フローを確認する。

### 1. 開発サーバーの起動

```bash
npm install
npm run dev
```

### 2. ブラウザで確認

README「手動スモーク（E2E なしの最小確認）」に従う。

1. ホームでロール **投稿者** → **投稿** で topic＋本文送信
2. **閲覧者** → **ダッシュボード**
3. **通知**・既読
4. **管理者** → **管理**（アカウント・禁止語）

### 3. 期待結果

- エラーなく画面遷移できる
- API が JSON で応答し、`.data/store.json`（または `MONKU_DATA_DIR`）が更新される

### 4. クリーンアップ

- 手動検証用データを消す場合: 開発用 `MONKU_DATA_DIR` または `.data/` の `store.json` を削除（**本番データでは実行しない**）

## Dedicated `npm run test:integration`

現時点では**未定義**。追加時は本ファイルと `package.json` を更新する。
