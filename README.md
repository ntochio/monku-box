# monku-box（文句箱 PoC）

Next.js モノリスのアプリケーションコードはリポジトリルートにあります。設計ドキュメントは **`aidlc-docs/`**（AI-DLC 成果物）。

## 開発

```bash
npm install
cp .env.example .env.local   # 任意
npm run dev
```

ブラウザ: [http://localhost:3000](http://localhost:3000)

### 環境変数

| 変数 | 説明 |
|------|------|
| `MONKU_DATA_DIR` | JSON ストアの親ディレクトリ（未設定時は `./.data`）。テストでは一時ディレクトリを指定 |

### PoC ロール（認可の擬似）

API は **`X-Monku-Role`** ヘッダでロールを受け取ります（`submitter` | `viewer` | `admin`）。未指定は `submitter`。UI はホームで選んだロールを `localStorage` に保存し、クライアントの `fetch` にヘッダを付与します。

## スクリプト

| コマンド | 説明 |
|----------|------|
| `npm run dev` | 開発サーバー |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー（`build` 後） |
| `npm run lint` | ESLint |
| `npm run test` | Vitest |

## 手動スモーク（E2E なしの最小確認）

1. `npm run dev` で起動。
2. ホームでロール **投稿者** → **投稿** で topic＋本文を送信。
3. ホームで **閲覧者** → **ダッシュボード** で件数・提案カードを確認。
4. **通知** で新規投稿通知を確認し、**既読** を試す。
5. ホームで **管理者** → **管理** でアカウント追加・禁止語の保存を試す。

永続データはデフォルトで **`.data/store.json`**（`.gitignore` 対象）。

## API（JSON）

ベースパス: **`/v1/api/`**

| メソッド | パス | 要約 |
|----------|------|------|
| GET/POST | `/v1/api/topics` | topic 一覧・追加 |
| GET/POST | `/v1/api/messages` | 一覧（閲覧者以上）／投稿（投稿者のみ） |
| GET | `/v1/api/dashboard/summary` | 閲覧者以上 |
| GET | `/v1/api/notifications` | 閲覧者・管理者 |
| POST | `/v1/api/notifications/:id/read` | 既読 |
| GET/POST | `/v1/api/accounts` | 管理者（一覧・追加） |
| GET/POST | `/v1/api/policy/words` | 管理者（禁止語） |
| POST | `/v1/api/voice/transcribe` | 501（ブラウザ STT 優先） |

## ドキュメント

- 要件・設計の正本: `aidlc-docs/`（`aidlc-state.md` で進捗確認）
- 実装サマリ: `aidlc-docs/construction/monolith-core/code/code-generation-summary.md`
- Code Generation 計画: `aidlc-docs/construction/plans/monolith-core-code-generation-plan.md`

## PoC スコープ

本番向けの可用性・監視・セキュリティ基盤の本格要件は対象外。詳細は要件確認書の冒頭「文脈・前提」および `deployment-architecture.md` を参照。
