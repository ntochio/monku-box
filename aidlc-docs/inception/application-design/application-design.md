# Application Design：文句箱（モンクボックス）PoC

**ドキュメント種別**: インセプション／Application Design（コンポーネント境界・サービス層・依存関係の高水準設計）  
**ステータス**: ドラフト（Construction の Functional Design で業務ルールを詳細化する）  
**前提**: `inception/requirements/service-proposal-monku-box.md`（承認済み）、`inception/requirements/requirement-verification-questions.md`（承認済み）、`inception/plans/workflow-plan-monku-box-poc.md`

---

## 1. 目的とスコープ

本書は PoC における **主要コンポーネントの責務**、**サービス層のオーケストレーション**、**コンポーネント間の依存と通信**を定義する。詳細な業務ルール・分岐の網羅は **Construction / Functional Design（ユニット単位）** に委ねる。

**PoC で明示的に含めないもの**（要件確認書の前提に準拠）: 監査・法務の本格要件、本番向け運用監視・ログモニタリング本格化、オートスケール、拡張性の精緻設計、パフォーマンス数値要件、システムによる優先付け・優先度スコアリング、定期レポート配布。

---

## 2. アーキテクチャ概要

| 項目 | 方針 |
|------|------|
| 形態 | **Next.js モノリス**（UI + Route Handlers / Server Actions + 永続化） |
| 投稿チャネル | **Web が当面の主軸**。Slack 等は将来拡張 |
| 永続化 | PoC では **SQLite 等の軽量 RDB** またはチーム選定の単一ストア（要件確認書の DB 設問に追随） |
| AI | 要約・トーン調整・（データ分析系の）補助。**PoC ではブラックリスト等のフォールバックと併用しうる**（要件回答に整合） |

```text
[Browser]
   │  HTTPS
   ▼
[Next.js App]
   ├── UI (投稿 / ダッシュボード / 通知一覧)
   ├── Server/API 層 (Route Handlers / Server Actions)
   └── ドメインサービス (Message, Topic, Analysis, Notification, Voice)
            │
            ▼
      [DB] + [外部 STT 任意] + [LLM/ルールエンジン 任意]
```

---

## 3. コンポーネント一覧と責務

| コンポーネント | 責務（高水準） |
|----------------|----------------|
| **Web UI — 投稿** | topic 必須・本文／音声入力・送信・エラー表示（質問 102〜110 と整合） |
| **Web UI — ダッシュボード** | topic 別集計・グラフ・一覧・改善提案表示（優先度の機械付与はしない） |
| **Web UI — 通知** | 閲覧者向けアプリ内通知一覧（質問 111〜119・125 と整合） |
| **API / Server 層** | 認可チェック、入力検証、トランザクション境界、HTTP エラー整形（質問 75〜82） |
| **Message Service** | 投稿受理、匿名内部 ID 付与、マスキング適用、保存、一覧取得 |
| **Topic Service** | topic CRUD、投稿との紐付け検証、閲覧者による topic 追加 |
| **Analysis Service** | 集計・トレンド・（topic 単位の）改善提案生成のトリガー・結果参照 |
| **Notification Service** | イベント検知→通知レコード生成→閲覧者への表示 |
| **Voice / STT Adapter** | ブラウザ／API 経由の音声→テキスト（失敗時フォールバック） |
| **Content Policy Engine** | 禁止語・マスキングルール適用（ルール中心、AI は補助） |

---

## 4. サービス層（オーケストレーション）

| サービス | 主な協調 | 説明 |
|----------|-----------|------|
| `SubmitMessageFlow` | Topic, Message, Policy, Analysis?, Notification? | 投稿→検証→保存→（任意）分析更新→（条件付き）通知 |
| `BuildDashboardView` | Message, Topic, Analysis | ダッシュボード用 DTO の組み立て |
| `NotifyViewersFlow` | Notification, Analysis | 急増・新規投稿等のイベントから通知生成 |

**トランザクション方針（要件回答の整合）**: 処理失敗時は **ロールバックして不整合状態を避ける**（詳細は Functional Design でテーブル単位に定義）。

---

## 5. 主要エンティティ（論理データ）

| エンティティ | 主な属性（案） | 備考 |
|--------------|----------------|------|
| **Topic** | id, label, created_at, archived_at? | 1 投稿 1 topic 必須 |
| **Message** | id, topic_id, body_raw, body_display, anonymous_submitter_id, input_type, created_at | 表示用と集計は同一ソース（質問 65） |
| **Notification** | id, type, payload_ref, recipient_role?, read_at?, created_at | 閲覧者向け（質問 125） |
| **AnalysisSnapshot**（任意） | topic_id, period, metrics_json, suggestions_json, created_at | 都度集計 vs スナップショットは質問 143 に追随 |

**非実装**: 優先度スコア、機械的ランキングのための専用テーブル。

---

## 6. RBAC（高水準）

| 能力 | 投稿者 | 閲覧者（管理職・人事・経営） | 管理者（運用） |
|------|--------|------------------------------|----------------|
| 投稿作成 | ✓ | — | — |
| ダッシュボード閲覧 | — | ✓ | ✓ |
| topic 追加 | 投稿時選択のみ（質問に準拠） | ✓（閲覧者追加可） | ✓ |
| 通知の受信 | — | ✓（管理者には送らない設計が回答にあり） | 要確認 |
| 辞書・通知ルール変更 | — | — | PoC では最小または設定ファイル |

※ロール数・細部は `requirement-verification-questions.md` の質問 120〜128 の確定回答に合わせて Functional Design で固定する。

---

## 7. API 境界（案・Route Handler 想定）

プレフィックス例: `/api/...`（実装はチーム規約に従う）

| メソッド | パス（案） | 説明 |
|----------|------------|------|
| POST | `/api/messages` | 匿名投稿（topic_id 必須、音声経路は同一または事前 STT） |
| GET | `/api/messages` | 一覧（閲覧者以上、クエリで topic・期間） |
| GET/POST | `/api/topics` | 一覧・追加 |
| GET | `/api/dashboard/summary` | KPI・トレンド用集約 |
| GET | `/api/notifications` | 閲覧者向け通知一覧 |
| POST | `/api/voice/transcribe`（任意） | STT をサーバ側に寄せる場合 |

**認証**: PoC では固定ロール・最小ログイン等（質問 87 に追随）。

---

## 8. コンポーネント依存（通信パターン）

- **Web UI** → **API 層**（JSON / Server Actions）
- **API 層** → **各ドメインサービス**（同一プロセス内呼び出し）
- **Message Service** → **DB**、**Content Policy Engine**
- **Analysis Service** → **DB**、（任意）**LLM Adapter**
- **Notification Service** → **DB**（他サービスからイベント後に呼び出し）

**外部依存**: STT・LLM はアダプタで抽象化し、PoC ではモック差し替え可能にする。

---

## 9. 主要ユースケース（テキストフロー）

**UC-A 投稿（テキスト）**  
1. UI が topic 選択済み本文を送信  
2. API が認可・topic 存在検証  
3. Policy がマスキング等を適用  
4. Message を保存、Analysis／Notification を必要なら更新  

**UC-B 投稿（音声）**  
1. UI が録音→（クライアントまたはサーバ）STT→テキスト化  
2. 以降は UC-A と合流  

**UC-C ダッシュボード閲覧**  
1. 閲覧者がサマリ API を取得  
2. topic 別件数・トレンド・改善提案（topic 単位）を表示（定期レポートはなし）

---

## 10. 次アクション（設計の深化）

1. **Functional Design（Construction）**: 各 API の入出力スキーマ、エラーコード、トランザクション境界、通知イベント種別の確定。  
2. **User Stories（任意）**: 音声入力・通知・分析の受け入れ基準を跨ロールで記述。  
3. 必要に応じ本書を分割: `components.md` / `component-methods.md` / `services.md` / `component-dependency.md`（AI-DLC 完全準拠時）。

---

## 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-05-07 | 初版作成（PoC 向け統合 Application Design） |
