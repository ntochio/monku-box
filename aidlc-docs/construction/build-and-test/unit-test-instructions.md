# Unit Test Execution — monku-box（monolith-core）

## テストランナー

- **Vitest** 3.x（`vitest run`）
- 設定: リポジトリルートの `vitest` 既定（`package.json` の `"test": "vitest run"`）

## Run Unit Tests

### 1. 依存関係の確認

```bash
npm install
```

### 2. 全ユニットテストの実行

```bash
npm test
```

（同等: `npx vitest run`）

### 3. 結果の確認

- **期待**: テストファイルがすべてパス、失敗 0
- **現行スイート**（参考）:
  - `src/smoke.test.ts` — スモーク
  - `src/domain/policy-engine.test.ts` — Policy エンジン
  - `src/infrastructure/persistence/json-store.test.ts` — JSON ストア
  - `src/app/v1/api/messages/messages-api.test.ts` — Messages Route Handler（一時データディレクトリ使用）
- **カバレッジ**: PoC では数値ゲートなし。必要なら `vitest run --coverage` を別途導入
- **レポート**: 標準出力。CI 用ファイルは未設定

### 4. 失敗時の対処

1. 失敗したファイル名・ケース名をログから特定する
2. `MONKU_DATA_DIR` を触るテストは一時ディレクトリ前提（`messages-api.test.ts` 等）— 環境汚染がないか確認
3. コード修正後に `npm test` を再実行し、すべてパスするまで繰り返す

### 5. ウォッチモード（開発時のみ）

```bash
npx vitest
```

CI や Build & Test の正本は **`vitest run`（非ウォッチ）** とする。
