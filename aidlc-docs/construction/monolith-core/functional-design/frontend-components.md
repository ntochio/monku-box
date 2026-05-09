# Frontend Components - monolith-core

## 1. 画面構成

- 投稿画面（テキスト/音声）
- ダッシュボード画面（topic 別件数 + 改善提案カード）
- 通知一覧画面（閲覧者/管理者）
- 管理設定画面（管理者: アカウント追加、辞書更新）

## 2. コンポーネント階層（DDD / ビジネスロジック分離）

### 設計方針
- Bounded Context ごとにフロント機能を分離する
- UI からドメインロジックへ直接依存せず、`application` 層（UseCase）を経由する（**論理上の依存方向**。PoC 実装での物理配置は §2.1 参照）
- `domain` は純粋ロジック（ルール/値オブジェクト）を保持し、表示コンポーネントは持たない
- `infrastructure` の API クライアントは **`/v1/api/...` への HTTP と JSON** を主とする（`requirement-verification-questions.md`「インフラ構築および通信方式」に準拠）

### 2.1 論理構成と PoC 実装の対応（明記）

以下のツリーは **論理上のレイヤ分離（目標アーキテクチャ）** を示す。**PoC の monolith-core 実装はこのツリーとファイルを 1:1 で一致させることを求めない**。実装の正本パス・構成は `construction/monolith-core/code/code-generation-summary.md` およびリポジトリの `src/` を参照する。

**意図的に採用している PoC の割り切り**（いずれも許容範囲）:

| 論理（本節の図） | PoC 実装での扱い |
|------------------|------------------|
| `app-shell/`（レイアウト・ルーティング） | Next.js 慣習に合わせ **`src/app/`** に配置（名称は `app-shell` とはしない） |
| `shared/` | 汎用コードは **`src/lib/`**（例: `client-api.ts`, `poc-role.ts`, `http/`）に集約。`shared/ui` 相当の部品は未分割のまま各 presentation に内包してよい |
| 各 BC の `application` / `domain` / `infrastructure`（フロント専用） | **サーバ側のユースケース・ドメイン・永続化は**リポジトリ直下の **`src/application/`・`src/domain/`・`src/infrastructure/`** に集約（モノリス 1 本）。各 `src/contexts/<bc>/application|domain|infrastructure` は **レイヤの「置き場」としての枠**（PoC では空でもよい） |
| 各 BC の `infrastructure`（API クライアント） | PoC では **`monkuFetch` + `/v1/api/...`** を presentation から呼ぶ形を許容。将来、BC ごとに `infrastructure/api.ts` へ切り出してよい |
| `presentation` 内の細かいコンポーネント名 | 設計上は `TopicSelector` 等に分割可能だが、**1 ファイルに集約（例: `SubmitForm`）** してもよい |
| BC フォルダ名 `notification` | リポジトリ上は **`notifications`**（複数形）を使用 |

**責務の対応（論理 → 実装の見かけ）**:

| BC（論理） | presentation（実装例） | ルート（`src/app`） |
|------------|-------------------------|---------------------|
| submission | `contexts/submission/presentation/SubmitForm.tsx` 等 | `/submit` |
| dashboard | `contexts/dashboard/presentation/DashboardPanel.tsx` 等 | `/dashboard` |
| notifications | `contexts/notifications/presentation/NotificationList.tsx` 等 | `/notifications` |
| admin | `contexts/admin/presentation/AdminPanel.tsx` 等 | `/admin` |

**結論**: 本ドキュメントは **画面責務・API 対応・DDD の依存方向** を定義する。ディレクトリの完全一致は PoC の完了条件としない。拡張時は論理図に近づけるよう、クライアント側の `application` / `infrastructure` を BC 配下へ段階的に移してよい。

### 2.2 論理ディレクトリツリー（参照用）

```text
App（論理）
├─ shared/
│  ├─ ui/                 # 汎用 UI 部品（Button, Modal, Toast）
│  ├─ lib/                # 日付/文字列など共通ユーティリティ
│  └─ auth/               # AuthGate, session helper
├─ contexts/
│  ├─ submission/         # 投稿コンテキスト
│  │  ├─ presentation/    # SubmitPage, TopicSelector, VoiceRecorder, TranscriptEditor
│  │  ├─ application/     # submitMessageUseCase, transcribeVoiceUseCase（クライアント側・任意）
│  │  ├─ domain/          # MessageDraft, TopicSelection, PolicyPreview ルール（クライアント側・任意）
│  │  └─ infrastructure/  # /v1/api/messages, /v1/api/topics, /v1/api/voice/transcribe client（任意）
│  ├─ dashboard/          # 可視化コンテキスト
│  │  ├─ presentation/    # DashboardPage, TopicCountChart, SuggestionCardList, MessageListPanel
│  │  ├─ application/     # loadDashboardSummaryUseCase（任意）
│  │  ├─ domain/          # TopicTrend, Suggestion モデル（任意）
│  │  └─ infrastructure/  # /v1/api/dashboard/summary, /v1/api/messages client（任意）
│  ├─ notifications/      # 通知コンテキスト（リポジトリ名に合わせ複数形）
│  │  ├─ presentation/    # NotificationPage, NotificationList
│  │  ├─ application/     # loadNotificationsUseCase（任意）
│  │  ├─ domain/          # NotificationItem, NotificationRule（任意）
│  │  └─ infrastructure/  # /v1/api/notifications client（任意）
│  └─ admin/              # 管理コンテキスト
│     ├─ presentation/    # AdminPage, AccountCreateForm, PolicyDictionaryForm
│     ├─ application/     # createAccountUseCase, updatePolicyDictionaryUseCase（任意）
│     ├─ domain/          # AccountRoleRule, DictionaryPolicy（任意）
│     └─ infrastructure/  # admin APIs client（任意）
└─ app-shell/             # レイアウトとルーティング（PoC では src/app に相当）
```

## 3. コンポーネント仕様（主要 / DDD対応）

### SubmitPage（submission/presentation）
- 責務: 投稿入力の完了と送信（UI オーケストレーション）
- 依存（論理）: `submitMessageUseCase` / `transcribeVoiceUseCase`。**PoC 実装**では同等の処理を `SubmitForm` 内で `monkuFetch` により呼び出してよい（§2.1）
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
- 依存（論理）: `loadDashboardSummaryUseCase`。**PoC 実装**では `DashboardPanel` + `monkuFetch` でよい（§2.1）
- 表示:
  - topic 別件数
  - 改善提案カード（topic 単位、根拠付き）
- ロール:
  - 投稿者はアクセス不可

### NotificationList（notifications/presentation）
- 責務: 通知表示
- 依存（論理）: `loadNotificationsUseCase`。**PoC 実装**では `NotificationList` + `monkuFetch` でよい（§2.1）
- ルール:
  - 受信対象は閲覧者・管理者
  - 投稿者は画面非表示
  - PoC は履歴一覧中心、即時イベント反映

### AccountCreateForm（admin/presentation）
- 責務: アカウント追加
- 依存（論理）: `createAccountUseCase`。**PoC 実装**では `AdminPanel` 内のフォーム + `monkuFetch` でよい（§2.1）
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
| NotificationList | `GET /v1/api/notifications` | 通知一覧 |

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

---

## 7. 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-05-09 | §2.1 を追加。論理ツリーと PoC 実装（`src/app`・`src/lib`・集約された `src/application` 等）の差を **意図的な許容**として明記。`notification` を `notifications` に統一（実装パスに合わせる）。§2.2 を論理ツリーとして再掲。 |
