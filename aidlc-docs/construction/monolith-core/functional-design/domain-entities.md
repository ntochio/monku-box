# Domain Entities - monolith-core

## 1. エンティティ一覧

| Entity | 役割 |
|--------|------|
| Topic | 投稿の分類軸 |
| Message | 投稿本文・表示本文・入力種別を保持 |
| NotificationEvent | 通知対象イベントの記録 |
| NotificationView | UI 通知表示用の派生ビュー |
| Suggestion | 改善提案（topic 単位） |
| Account | 閲覧者/管理者アカウント |
| PolicyResult | バリデーション/マスキング結果 |

## 2. Topic

### 属性（論理）
- `topic_id`
- `label`
- `normalized_label`
- `created_by_role`
- `created_at`
- `status`（active/archive）

### ルール
- 新規追加時は `normalized_label` 完全一致を優先して再利用する。
- 投稿者・閲覧者・管理者が作成可能。

## 3. Message

### 属性（論理）
- `message_id`
- `topic_id`
- `body_raw`
- `body_display`（補正/マスク後）
- `input_type`（text/voice）
- `anonymous_submitter_id`
- `created_at`
- `policy_applied`（bool）

### ルール
- `topic_id` は必須（存在検証は行わず、フロー内で紐付け確定）。
- 表示用と集計用は同一ソース方針。

## 4. PolicyResult

### 属性（論理）
- `policy_result_id`
- `message_id`
- `required_check_ok`
- `length_check_ok`
- `mask_applied`
- `masked_terms`（配列）
- `final_action`（accept_with_mask）

### ルール
- PoC では NG でも拒否せず補正受理。
- 監査向けの詳細証跡は将来拡張。

## 5. NotificationEvent / NotificationView

### NotificationEvent 属性
- `event_id`
- `event_type`（new_message / topic_spike）
- `topic_id`
- `occurred_at`
- `title`

### NotificationView 属性
- `notification_id`
- `event_id`
- `recipient_role`（viewer/admin）
- `read_flag`
- `created_at`

### ルール
- 投稿者は受信対象外。
- 閲覧者・管理者に表示。
- 既読管理は通知履歴一覧レベル（PoC）。

## 6. Suggestion

### 属性（論理）
- `suggestion_id`
- `topic_id`
- `summary_text`
- `evidence_metrics`（件数、期間など）
- `generated_at`

### ルール
- topic 単位生成。
- そのまま表示（承認フローなし）。

## 7. Account

### 属性（論理）
- `account_id`
- `email`
- `role`（submitter/viewer/admin）
- `status`
- `created_at`

### ルール
- 管理者のみアカウント追加可能。
- 追加時はロール指定必須。

## 8. 関係（論理ER）

- Topic 1 --- * Message
- Message 1 --- 0..1 PolicyResult
- Topic 1 --- * Suggestion
- NotificationEvent 1 --- * NotificationView
- Account（viewer/admin）1 --- * NotificationView

## 9. 永続化方針（PoC）

- 実装は DB 固定を前提にせず、CSV/JSON ベースの軽量管理を許容する。
- ただし、上記論理エンティティの整合性は維持する。
- 将来、RDB へ移行する場合でも同じ論理モデルを保つ。
- API およびクライアント連携の主要なデータ表現は **`requirement-verification-questions.md`（インフラ構築および通信方式）** に従い **JSON を中心**とする。インフラ・伝送プロトコルの厳密確定は PoC では行わない。

