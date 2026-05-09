# Build Instructions — monku-box（monolith-core）

## Prerequisites

- **Node.js**: 20.x 系推奨（`package.json` の `@types/node` と整合）
- **パッケージマネージャ**: npm（リポジトリルートの `package-lock.json` に従う）
- **ビルドツール**: Next.js 16.2.6（`next build`）
- **環境変数**: 必須なし。任意で `.env.local`（`cp .env.example .env.local`）。永続化は `MONKU_DATA_DIR` 未設定時 `.data/`（README 参照）
- **システム**: macOS / Linux / Windows（WSL 可）。ディスク数 GB 程度

## Build Steps

### 1. Install Dependencies

リポジトリルートで実行する。

```bash
cd /path/to/monku-box
npm install
```

`eslint` 等は `node_modules/.bin` 経由で `npm run` から解決される。`eslint: command not found` のときは **`npm install` 未実行**が多い。

### 2. Configure Environment（任意）

```bash
cp .env.example .env.local
# 必要なら MONKU_DATA_DIR を編集
```

### 3. Lint（ビルド前の静的解析）

```bash
npm run lint
```

### 4. Build All Units

本リポジトリは単一ユニット `monolith-core` のモノリス。

```bash
npm run build
```

### 5. Verify Build Success

- **期待**: `Compiled successfully`、`Finished TypeScript`、`Generating static pages` が完了し、終了コード 0
- **成果物**: `.next/`（Next.js の出力）。本番起動は `npm run start`（`build` 後）
- **許容される表示**: Next.js のテレメトリ案内（匿名）— オプトアウトは環境変数で [Next.js Telemetry](https://nextjs.org/telemetry) 参照

## Troubleshooting

### Build Fails with Dependency Errors

- **原因**: `node_modules` 不整合、ネットワーク切断、`package-lock.json` と手動変更の食い違い
- **対処**: `rm -rf node_modules && npm install` を再実行。企業プロキシ下では `npm` のレジストリ設定を確認

### Build Fails with TypeScript / Compilation Errors

- **原因**: 型エラー、インポートパス誤り、Next の breaking change
- **対処**: `npm run build` のログで最初のエラーを修正。ローカルで `npx tsc --noEmit` で切り分け可

### `eslint: command not found`（`npm run lint` 時）

- **原因**: `npm install` 未実行、または `PATH` で直接 `eslint` を叩いている
- **対処**: 必ず **`npm run lint`** を使う（プロジェクトの `eslint` を解決）
