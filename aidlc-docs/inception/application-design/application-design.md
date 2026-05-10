# Application Design：文句箱（モンクボックス）PoC

**ドキュメント種別**: インセプション／Application Design（コンポーネント境界・サービス層・依存関係の高水準設計）  
**ステータス**: **承認済み**（2026-05-08 — `aidlc-docs/aidlc-state.md` と一致）  
**詳細ルール・スキーマの正本**: Construction の `construction/monolith-core/functional-design/` および実装（`src/`）。本書はインセプション段階の境界・フロー・RBAC・API 意図を示す。  
**前提**: `inception/requirements/service-proposal-monku-box.md`（承認済み）、`inception/requirements/requirement-verification-questions.md`（承認済み）、`inception/plans/workflow-plan-monku-box-poc.md`（承認済み）。**集計・連投・重複**は `aggregation-duplicate-and-repeat-submissions.md`（**2026-05-10** 承認）を参照。

---

## 1. 目的とスコープ

本書は PoC における **主要コンポーネントの責務**、**サービス層のオーケストレーション**、**コンポーネント間の依存と通信**を定義する。詳細な業務ルール・分岐の網羅は **Construction / Functional Design（ユニット単位）** に委ねる。

**PoC で明示的に含めないもの**（要件確認書の前提に準拠）: 監査・法務の本格要件、本番向け運用監視・ログモニタリング本格化、オートスケール、**拡張性の精緻なアーキテクチャ設計・文書化の完了**、パフォーマンス数値要件、システムによる優先付け・優先度スコアリング、定期レポート配布。

**インフラ・通信**（要件確認書「インフラ構築および通信方式について」に準拠）: クラウド選定・ネットワーク・IaC の粒度、SOAP / REST / gRPC 等の**通信標準の厳密確定**は PoC では深く行わない。一方で **将来のホスト変更・プロトコル切替に備え**、外部連携・永続化はアダプタ境界に置く等、**実装の拡張余地**を意識する。**クライアントとサーバの主要なやり取りは JSON**（HTTP API の本文等）を中心とする。

---

## 2. アーキテクチャ概要

| 項目 | 方針 |
|------|------|
| 形態 | **Next.js モノリス**（UI + Route Handlers / Server Actions + 永続化） |
| 投稿チャネル | **Web が当面の主軸**。Slack 等は将来拡張 |
| API の表現 | **JSON を中心**（`/v1/api/...` のリクエスト/レスポンス）。SOAP/gRPC 等の全面採用は本番移行時に再オープン |
| 永続化 | 要件上は **SQLite 等の軽量 RDB** も選択肢。**現行 PoC 実装**は **`MONKU_DATA_DIR` 配下の JSON ファイル**（`json-store`）— Functional Design / コードを正とする |
| AI | 要約・トーン調整・（データ分析系の）補助。**PoC ではブラックリスト等のフォールバックと併用しうる**（要件回答に整合） |

```text
[Browser]
   │  HTTPS
   ▼
[Next.js App]
   ├── UI (投稿 / メッセージ一覧 / ダッシュボード / 通知一覧)
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
| **Web UI — 投稿** | topic 必須・**単一の「文字起こし（送信前に編集可）」欄**（**直接テキスト入力**と**Web Speech API の確定結果**の両方を受け付け、送信前に編集）・追記/上書きモード・認識停止・エラー表示（質問 102〜110 と整合） |
| **Web UI — メッセージ一覧** | 閲覧者・管理者向け、投稿本文の時系列一覧、topic 絞り込み（`GET /v1/api/messages`） |
| **Web UI — ダッシュボード** | **topic 別件数の円グラフ**・**UTC 日別投稿件数の棒グラフ**・件数リスト・改善提案。件数は **受理メッセージの生カウント**（§11）。利用者向け脚注で制約を明示 |
| **Web UI — 通知** | 閲覧者向けアプリ内通知一覧（質問 111〜119・125 と整合） |
| **API / Server 層** | 認可チェック、**Policy 呼び出し**、トランザクション境界、HTTP エラー整形（質問 75〜82） |
| **Message Service** | 投稿受理、匿名内部 ID 付与、マスキング適用、保存、一覧取得 |
| **Topic Service** | topic CRUD、投稿との紐付け管理、**投稿者・閲覧者・管理者**による topic 追加 |
| **Analysis Service** | 集計・トレンド・（topic 単位の）改善提案生成のトリガー・結果参照。**PoC** の KPI は **生メッセージ件数** ベース（§11）。ロードマップでユニーク投稿者・重複除外を検討 |
| **Notification Service** | イベント検知→通知レコード生成→閲覧者への表示 |
| **Voice / STT Adapter** | ブラウザ／API 経由の音声→テキスト（失敗時フォールバック） |
| **Content Policy Engine** | 禁止語・マスキングルール適用、**投稿バリデーション**（ルール中心、AI は補助） |

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
| **Message** | id, topic_id, body_raw, body_display, anonymous_submitter_id, input_type, created_at | 表示用と集計は同一ソース（質問 65）。**PoC** の集計は **メッセージ行を 1 件ずつ数える**（§11）。将来は業務 ID／Slack 等で `anonymous_submitter_id` を安定化し、重複検知を検討 |
| **Notification** | id, type, payload_ref, recipient_role?, read_at?, created_at | 閲覧者向け（質問 125） |
| **AnalysisSnapshot**（任意） | topic_id, period, metrics_json, suggestions_json, created_at | 都度集計 vs スナップショットは質問 143 に追随 |

**非実装**: 優先度スコア、機械的ランキングのための専用テーブル。

---

## 6. RBAC（高水準）

| 能力 | 投稿者 | 閲覧者（管理職・人事・経営） | 管理者（運用） |
|------|--------|------------------------------|----------------|
| 投稿作成 | ✓ | — | — |
| ダッシュボード閲覧 | — | ✓ | ✓ |
| メッセージ一覧閲覧 | — | ✓ | ✓ |
| topic 追加 | ✓（投稿時に新規追加可） | ✓ | ✓ |
| 通知の受信 | — | ✓（閲覧者向け） | ✓（管理者向け通知あり） |
| アカウント追加（ユーザー追加） | — | — | ✓（管理者のみ） |
| 辞書・通知ルール変更 | — | — | PoC では最小または設定ファイル |

※ロール数・細部は `requirement-verification-questions.md` の質問 120〜128 の確定回答に合わせて Functional Design で固定する。

---

## 7. API 境界（案・Route Handler 想定）

プレフィックス例: `/v1/api/...`（バージョン管理のため **v1 を明示**。将来の破壊的変更は `/v2/api/...` を新設して移行する）

| メソッド | パス（案） | 説明 |
|----------|------------|------|
| POST | `/v1/api/messages` | 匿名投稿（**既存 topicId または新規 topicLabel** のいずれか必須。本文はテキスト経路・音声経路いずれも同一ペイロード） |
| GET | `/v1/api/messages` | 一覧（閲覧者・管理者、クエリで topic 等）。**メッセージ一覧画面**の主データ源 |
| GET/POST | `/v1/api/topics` | 一覧・追加 |
| GET | `/v1/api/dashboard/summary` | `topicCounts`、**`messagesByDay`**（UTC 日付ごとの全メッセージ件数、昇順）、改善提案（suggestions）など KPI 用集約 |
| GET | `/v1/api/notifications` | 閲覧者向け通知一覧 |
| POST | `/v1/api/voice/transcribe`（任意） | STT をサーバ側に寄せる場合。**実装は便利なライブラリ／プラットフォーム機能を優先利用**し、PoC では自前実装を最小化する |

**認証**: PoC では固定ロール・最小ログイン等（質問 87 に追随）。

---

## 8. コンポーネント依存（通信パターン）

- **Web UI** → **API 層**（**JSON** を主とする HTTP API / Server Actions。PoC では通信スタイルの厳密分類に依存しない）
- **API 層** → **各ドメインサービス**（同一プロセス内呼び出し）
- **Message Service** → **DB**、**Content Policy Engine**
- **Analysis Service** → **DB**、（任意）**LLM Adapter**
- **Notification Service** → **DB**（他サービスからイベント後に呼び出し）

**外部依存**: STT・LLM はアダプタで抽象化し、PoC ではモック差し替え可能にする。

---

## 9. 主要ユースケース（テキストフロー）

**UC-A 投稿（テキストのみ）**  
1. UI が **文字起こし欄に直接入力した本文**と topic 情報（既存選択または新規追加）を送信（`inputType: text`）  
2. API が認可し、必要に応じて Topic を追加して紐付ける（topic 存在検証は行わない）  
3. Policy がバリデーションとマスキング等を適用  
4. Message を保存、Analysis／Notification を必要なら更新  

**UC-B 投稿（音声経由）**  
1. UI が **Web Speech API**（日本語）で認識セッションを開始し、ユーザーが**認識を停止**するまで発話を受け付ける（中間結果を表示してよい）  
2. 確定テキストを **同一の文字起こし欄**に反映する（**投稿前の追認**・編集可能）。必要に応じ複数回の発話を**追記**または**上書き**で蓄積する（要件 Q106）  
3. 以降は UC-A と合流（`POST /v1/api/messages`、**実際に音声で確定文が取り込まれた場合** `inputType: voice`）。**サーバ経由 STT**（`/v1/api/voice/transcribe`）は PoC では使用せず 501 のまま差し替え用とする

**UC-C ダッシュボード閲覧**  
1. 閲覧者または管理者がサマリ API を取得  
2. **topic 別件数を円グラフおよび一覧**で表示する（**各件数 = 当該 topic のメッセージ件数の合計**）  
3. **日別投稿件数（UTC 暦日）を棒グラフ**で表示する（**各日 = その日に作成されたメッセージ件数**）  
4. topic 別件数・トレンド・改善提案（topic 単位）を参照する（定期レポートはなし）  
5. 画面で **集計の解釈**（生件数であり、同一人物の連投・重複は PoC では別扱いしない旨）を利用者に示す（脚注等 — `aggregation-duplicate-and-repeat-submissions.md` と整合）

**UC-D メッセージ一覧閲覧**  
1. 閲覧者または管理者が一覧 API を取得（任意で topic で絞り込み）  
2. 画面に本文（表示用）、日時、入力種別、topic を時系列で表示（優先度の自動付与はしない）

---

## 10. 参照・更新方針（Construction 完了後）

- **Functional / NFR / Infrastructure Design / Code Generation** は `construction/monolith-core/` および `aidlc-docs/aidlc-state.md` を正とする（本書の「次アクション」は完了済み）。  
- 実装や API の確定値が本書と差異を生じた場合は、**Construction 成果物とコードを先に更新**し、本書は高水準の意図が保たれる範囲で追随する。  
- AI-DLC でコンポーネントを細分化する場合のみ、本書を `components.md` 等へ分割することを検討する。

---

## 11. 集計指標・投稿者識別（PoC とロードマップ）

**正本（設問・回答・承認）**: `inception/requirements/aggregation-duplicate-and-repeat-submissions.md`（§6・§8）。**承認日**: 2026-05-10。

### 11.1 PoC（現行）

- ダッシュボードの **topic 別件数**・**日別件数**・改善提案の **根拠件数**は、いずれも **永続化された `Message` レコードを 1 行 1 カウント**とする。  
- **同一人物の連投**・**同一／類似内容の複数投稿**は、**検知も集計からの除外もしない**（歪みは **既知の制約**）。  
- 利用者には **脚注・ヘルプ・README** で上記を明示する（Q1: PoC では高度な KPI を表現しきれないためドキュメントで補う、という承認に従う）。

### 11.2 ロードマップ（承認済み・未実装）

- **同一人物**の技術的定義の目標: **業務上の本人**（**ログイン／職員 ID** 等）。**Slack 連携**時は **Slack ID** 等の活用を検討（Q2=C）。  
- **集計の拡張（Q1=D）**: 将来、**安定した投稿者識別子**に基づく KPI（例: ユニーク投稿者数、加重）および **重複内容の扱い**を **両方**検討する。  
- **重複投稿（Q3=A）**: PoC では必須とせず **将来検討**。

---

## 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-05-07 | 初版作成（PoC 向け統合 Application Design） |
| 2026-05-07 | topic 追加権限を全ロール（投稿者・閲覧者・管理者）へ拡張 |
| 2026-05-07 | RBAC の通知受信を確定（管理者は通知を受信しない） |
| 2026-05-07 | RBAC の通知受信を再変更（管理者への通知を有効化） |
| 2026-05-07 | 管理者権限にアカウント追加（ユーザー追加）を追加 |
| 2026-05-08 | `/api/voice/transcribe` 方針を更新（便利なライブラリ／機能を優先利用） |
| 2026-05-08 | API パスにバージョンを導入（`/v1/api/...`、将来は `/v2/api/...` で管理） |
| 2026-05-08 | topic 存在検証を廃止し、バリデーション責務を Policy へ集約 |
| 2026-05-08 | 主要ユースケースを更新（投稿時の topic 追加を許容、存在検証なし） |
| 2026-05-08 | メッセージ一覧（閲覧者・管理者）をストーリーマップ・画面責務・RBAC・UC に追記 |
| 2026-05-09 | ダッシュボードに topic 別**円グラフ**・UTC 日別**棒グラフ**を明記（API `messagesByDay`、UC-C、コンポーネント表） |
| 2026-05-09 | UC-B・Web UI 投稿を **Web Speech API 実装**に合わせ更新（サーバ transcribe は任意・501） |
| 2026-05-09 | ステータスを **承認済み** に更新（`aidlc-state.md` と一致）。永続化に **現行 JSON ストア実装**を注記。投稿 UI を **文字起こし欄への統合**（テキスト直接入力／音声反映）に合わせ UC-A・UC-B・コンポーネント表を更新。§10 を Construction 完了後の参照方針に差し替え |
| 2026-05-10 | §11 を追加（集計の生件数定義、連投・重複の既知制約、業務 ID／Slack・重複扱いのロードマップ）。UC-C・ダッシュボード・Message・Analysis の行を整合。**前提**に `aggregation-duplicate-and-repeat-submissions.md`（2026-05-10 承認）への参照を追加 |
