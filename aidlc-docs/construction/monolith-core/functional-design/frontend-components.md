# Frontend Components - monolith-core

## 1. 画面構成

- 投稿画面（テキスト/音声）
- ダッシュボード画面（topic 別件数 + 改善提案カード）
- 通知一覧画面（閲覧者/管理者）
- 管理設定画面（管理者: アカウント追加、辞書更新）

## 2. コンポーネント階層（DDD / ビジネスロジック分離）

### 設計方針
- Bounded Context ごとにフロント機能を分離する
- UI からドメインロジックへ直接依存せず、`application` 層（UseCase）を経由する
- `domain` は純粋ロジック（ルール/値オブジェクト）を保持し、表示コンポーネントは持たない

```text
App
├─ shared/
│  ├─ ui/                 # 汎用 UI 部品（Button, Modal, Toast）
│  ├─ lib/                # 日付/文字列など共通ユーティリティ
│  └─ auth/               # AuthGate, session helper
├─ contexts/
│  ├─ submission/         # 投稿コンテキスト
│  │  ├─ presentation/    # SubmitPage, TopicSelector, VoiceRecorder, TranscriptEditor
│  │  ├─ application/     # submitMessageUseCase, transcribeVoiceUseCase
│  │  ├─ domain/          # MessageDraft, TopicSelection, PolicyPreview ルール
│  │  └─ infrastructure/  # /v1/api/messages, /v1/api/topics, /v1/api/voice/transcribe client
│  ├─ dashboard/          # 可視化コンテキスト
│  │  ├─ presentation/    # DashboardPage, TopicCountChart, SuggestionCardList, MessageListPanel
│  │  ├─ application/     # loadDashboardSummaryUseCase
│  │  ├─ domain/          # TopicTrend, Suggestion モデル
│  │  └─ infrastructure/  # /v1/api/dashboard/summary, /v1/api/messages client
│  ├─ notification/       # 通知コンテキスト
│  │  ├─ presentation/    # NotificationPage, NotificationList
│  │  ├─ application/     # loadNotificationsUseCase
│  │  ├─ domain/          # NotificationItem, NotificationRule
│  │  └─ infrastructure/  # /v1/api/notifications client
│  └─ admin/              # 管理コンテキスト
│     ├─ presentation/    # AdminPage, AccountCreateForm, PolicyDictionaryForm
│     ├─ application/     # createAccountUseCase, updatePolicyDictionaryUseCase
│     ├─ domain/          # AccountRoleRule, DictionaryPolicy
│     └─ infrastructure/  # admin APIs client
└─ app-shell/             # レイアウトとルーティング
```

## 3. コンポーネント仕様（主要 / DDD対応）

### SubmitPage（submission/presentation）
- 責務: 投稿入力の完了と送信（UI オーケストレーション）
- 依存: `submitMessageUseCase` / `transcribeVoiceUseCase`
- 状態:
  - `selectedTopicId`
  - `newTopicLabel`
  - `messageText`
  - `inputType`（text/voice）
  - `policyPreview`
- ルール:
  - topic は既存選択または新規追加で必須化
  - 音声入力後、送信前に必ず文字起こし編集を挟む

### TopicSelector / TopicCreateInput（submission/presentation）
- 責務: topic 指定
- ルール:
  - 新規 topic 入力を許可
  - 完全一致 topic は既存に寄せる（application/domain ルールに従い最終判定）

### VoiceRecorder（submission/presentation）
- 責務: 録音開始/停止
- 方式:
  - 録音開始/停止ボタン
  - ブラウザ STT 優先

### TranscriptEditor（submission/presentation）
- 責務: STT 結果とサマリーの確認/編集
- ルール:
  - 送信前編集必須

### DashboardPage（dashboard/presentation）
- 責務: 閲覧者/管理者向け可視化
- 依存: `loadDashboardSummaryUseCase`
- 表示:
  - topic 別件数
  - 改善提案カード（topic 単位、根拠付き）
- ロール:
  - 投稿者はアクセス不可

### NotificationList（notification/presentation）
- 責務: 通知表示
- 依存: `loadNotificationsUseCase`
- ルール:
  - 受信対象は閲覧者・管理者
  - 投稿者は画面非表示
  - PoC は履歴一覧中心、即時イベント反映

### AccountCreateForm（admin/presentation）
- 責務: アカウント追加
- 依存: `createAccountUseCase`
- バリデーション:
  - メール形式
  - ロール指定必須
- 権限:
  - 管理者のみ

## 4. API 連携ポイント

| コンポーネント | API | 用途 |
|----------------|-----|------|
| SubmitPage | `POST /v1/api/messages` | 投稿送信 |
| TopicSelector/TopicCreateInput | `GET/POST /v1/api/topics` | topic 取得/追加 |
| VoiceRecorder | `POST /v1/api/voice/transcribe`（任意） | 音声→テキスト |
| DashboardPage | `GET /v1/api/dashboard/summary` | 集計取得 |
| MessageListPanel | `GET /v1/api/messages` | 投稿一覧 |
| NotificationPage | `GET /v1/api/notifications` | 通知一覧 |

## 5. UI バリデーション方針

- 必須入力未設定は送信不可
- 文字数上限/下限を送信前に表示
- Policy による補正後内容を確認可能にする
- 失敗時は再試行導線を表示（クライアント手動再試行）

## 6. ユーザー操作フロー（要約）

1. 投稿者は topic を選択または追加する。
2. テキスト入力または音声入力を行う。
3. 音声時は文字起こし・サマリーを確認編集する。
4. 投稿送信後、閲覧者/管理者のダッシュボード・通知に反映される。

