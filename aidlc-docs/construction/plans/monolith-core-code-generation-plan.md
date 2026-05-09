# Code Generation Plan - monolith-core

**単一情報源**: 本ファイルのチェックリストに従い Part 2（実装）を進める。アプリコードは **リポジトリルート**（`aidlc-docs/` 外）にのみ配置する。

## ユニット文脈

| 項目 | 内容 |
|------|------|
| ユニット名 | `monolith-core` |
| プロジェクト種別 | グリーンフィールド（現時点で `package.json` なし） |
| 技術スタック | Next.js App Router, TypeScript, Tailwind（`tech-stack-decisions.md`） |
| API プレフィックス | `/v1/api/...`（Route Handlers） |
| 通信・データ | **JSON 中心**の HTTP API。インフラ・通信標準（SOAP/gRPC 等）は PoC で深く確定しない（`requirement-verification-questions.md`）。外部サービスはアダプタで差し替え可能に |
| 永続化 | PoC: SQLite または JSON ファイル（`infrastructure-design.md` / `domain-entities.md` に整合） |
| フロント構成 | DDD レイヤ（`frontend-components.md`）を `src/` 下で表現 |

## 依存・境界

- 外部ユニットなし（単一モノリス）。
- 任意依存: ブラウザ STT、将来のサーバ STT・LLM（アダプタで差し替え可能に）。

## ストーリー対応表

| Story | エピック | 計画上の主な実装ステップ |
|-------|----------|---------------------------|
| 1.1 | 投稿 | Step 6–8, 12–13 |
| 1.2 | 投稿（音声） | Step 8, 13（クライアント STT + 送信前編集） |
| 1.3 | 失敗時フォールバック | Step 8, 13（エラー表示・テキスト切替） |
| 2.1 | ダッシュボード | Step 9, 13 |
| 2.2 | 通知遷移 | Step 10, 13 |
| 2.3 | 管理者通知 | Step 10, 13 |
| 3.1 | アカウント追加 | Step 11, 13 |
| 3.2 | 辞書・通知ルール（PoC 最小） | Step 7, 11（設定または JSON） |

---

## Part 1: 計画（メタチェックリスト）

- [x] ユニット設計成果物を読了し、本計画に落とし込んだ
- [x] コード配置をリポジトリルートに確定した
- [x] 本計画ファイルを `aidlc-docs/construction/plans/` に保存した
- [x] **ユーザーが本計画全体を承認した**（Part 2 開始の前提）（2026-05-08）

---

## Part 2: 実装ステップ（実行順）

### Step 1 — プロジェクト基盤（グリーンフィールド）

- [x] リポジトリルートに Next.js（App Router, TS, Tailwind, ESLint）を初期化する（非空リポジトリのため一時ディレクトリで `create-next-app` 生成後にマージ。既存 `AGENTS.md` は上書きしない）
- [x] `package.json` のスクリプト（`dev`, `build`, `start`, `lint`, `test`）を整える（`test`: Vitest）
- [x] `.env.example` を追加し、将来のシークレット用キー名のみ記載（値は含めない）

### Step 2 — ディレクトリ方針とエイリアス

- [x] `src/domain/`, `src/application/`, `src/infrastructure/`, `contexts` 相当の UI 配置を `frontend-components.md` に沿って定義（Bounded Context 単位で `src/contexts/*` 等）
- [x] `tsconfig.json` の `paths`（例: `@/*`）を設定（既存のまま）。Vitest に `vitest.config.ts` で `@` エイリアスを追加

### Step 3 — ドメイン型・定数

- [x] `domain-entities.md` に基づき Topic / Message / Notification / User(roles) 等の型を `src/domain/` に定義
- [x] ロール列挙（submitter / viewer / admin）と RBAC チェック用ヘルパ

### Step 4 — Content Policy（PoC）

- [x] Policy エンジン（マスキング・禁止語・長さ制限等）を `src/domain` または `src/application` に実装（`business-rules.md` 準拠）
- [x] ユニットテスト（Policy の代表ケース）

### Step 5 — 永続化レイヤ

- [x] JSON ファイルまたは SQLite のいずれかでリポジトリ実装（`src/infrastructure/persistence/`）
- [x] トランザクション境界: 投稿＋分析スナップショット更新＋通知生成を同一ユニット・オブ・ワークで扱う（`nfr-design-patterns.md`）
- [x] リポジトリのユニットテスト（インメモリまたはテンポラリ DB）

### Step 6 — 認可・セッション（PoC 最小）

- [x] PoC 用の「現在ロール」決定（セッション Cookie または開発用ヘッダ）を `src/infrastructure/auth/` に実装
- [x] Route Handlers 用の `requireRole()` ヘルパ

### Step 7 — コアドメインサービス

- [x] Message / Topic / Analysis / Notification のアプリケーションサービス（`src/application/`）
- [x] topic 重複: 完全一致なら既存に寄せる（`monolith-core-functional-design-plan.md` Q1）
- [x] 通知トリガー: 新規投稿・topic 急増（Q3）— PoC 最小ロジック

### Step 8 — Route Handlers（`/v1/api/*`）

- [x] `app/v1/api/messages/route.ts` — POST/GET
- [x] `app/v1/api/topics/route.ts` — GET/POST
- [x] `app/v1/api/dashboard/summary/route.ts` — GET
- [x] `app/v1/api/notifications/route.ts` — GET
- [x] `app/v1/api/voice/transcribe/route.ts` — 任意（未設定時は 501 または未実装応答でも可）
- [x] 統一エラーレスポンス形式

### Step 9 — API 層テスト

- [x] Route Handlers の統合テスト（`fetch` または Next 推奨のテスト手段）— 主要ハッピーパス + 認可エラー

### Step 10 — フロント（投稿）

- [x] 投稿画面: topic 選択/新規、本文、音声（ブラウザ API）→ 編集確認→送信
- [x] `data-testid` を主要インタラクションに付与（code-generation ルール）

### Step 11 — フロント（ダッシュボード・通知・管理）

- [x] ダッシュボード: topic 別件数 + 改善提案カード（`functional-design-plan` Q6）
- [x] 通知一覧・既読（閲覧者・管理者）
- [x] 管理: アカウント追加（ロール必須）（Q5）

### Step 12 — フロント結合テスト / E2E（任意 PoC）

- [x] Playwright 等は任意。最低限、主要画面のスモーク手順を `README` に記載

### Step 13 — ドキュメント（aidlc-docs）

- [x] `aidlc-docs/construction/monolith-core/code/code-generation-summary.md` に実装サマリ・ディレクトリ索引を記載

### Step 14 — デプロイ・README

- [x] ルート `README.md`: 環境変数、起動手順、PoC スコープ、既知の制限
- [x] `deployment-architecture.md` と矛盾しない起動・デモ手順

---

## 完了条件

- 上記 Part 2 の全ステップが [x]
- ストーリー対応表のストーリーが実装可能な範囲でカバーされている
- Build & Test フェーズで `build` / `test` が実行できる状態
