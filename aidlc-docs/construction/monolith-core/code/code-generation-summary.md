# Code Generation Summary — monolith-core

## 概要

Next.js 16（App Router）モノリスとして PoC 実装を追加した。永続化は **`MONKU_DATA_DIR/store.json`**（既定: `.data/store.json`）。API は **`/v1/api/*`**、ペイロードは **JSON**。

## ディレクトリ索引

| パス | 内容 |
|------|------|
| `src/app/` | App Router ページ・レイアウト |
| `src/app/v1/api/` | Route Handlers（messages, topics, dashboard, notifications, accounts, policy/words, voice/transcribe） |
| `src/domain/` | ドメイン型・正規化・Policy エンジン |
| `src/application/` | ユースケース（投稿・一覧・ダッシュボード・通知・アカウント・辞書） |
| `src/infrastructure/persistence/` | JSON ストア |
| `src/infrastructure/auth/` | `X-Monku-Role` / Cookie による PoC 認可 |
| `src/lib/http/` | API 用 JSON レスポンスヘルパ |
| `src/lib/client-api.ts` | クライアント `fetch`（ロールヘッダ） |
| `src/lib/voice-recognition.ts` | Web Speech API 補助（認識取得、結果パース、追記マージ、エラーメッセージ） |
| `src/contexts/dashboard/presentation/TopicPieChart.tsx` | topic 別件数の円グラフ |
| `src/contexts/dashboard/presentation/MessagesTimelineBarChart.tsx` | 日別件数の棒グラフ |
| `src/contexts/*/` | Bounded Context 別 UI（`presentation` に画面コンポーネント、`application`/`domain`/`infrastructure` はレイヤ枠の `.gitkeep`） |

## 主な設計対応

- **topic 重複**: `normalized_label` 完全一致で既存採用（Functional Design Q1）。
- **Policy**: NG でもマスクして受理（Q2）。禁止語は管理画面＋既定リスト。
- **通知**: 新規投稿・topic 急増（直近1時間5件以上）を閲覧者・管理者へ（Q3 A,B）。
- **音声入力**: 投稿画面で **Web Speech API**（`ja-JP`）を使用。`src/lib/voice-recognition.ts` で結果パース・追記マージ。サーバ STT ルートは未使用（501）。
- **トランザクション**: JSON ストアの `withTransaction` で読み→メモリ更新→書き込み（同一リクエスト内で整合）。

## テスト

- `src/domain/policy-engine.test.ts` — Policy 代表ケース
- `src/lib/voice-recognition.test.ts` — 音声ヘルパー（結果パース・追記マージ）
- `src/infrastructure/persistence/json-store.test.ts` — 永続化ラウンドトリップ
- `src/application/dashboard-summary.test.ts` — ダッシュボード集計（`messagesByDay`）
- `src/app/v1/api/messages/messages-api.test.ts` — メッセージ API の統合テスト（一時データディレクトリ）

## 既知の制限（PoC）

- 認証・本番 RBAC なし（ロールヘッダのみ）。
- サーバ経由 STT（`/v1/api/voice/transcribe`）は **501**（ブラウザ STT が主経路）。
- Web Speech API は **Chrome / Edge 推奨**、**HTTPS または localhost**・マイク許可が必要。Safari 等では未対応の場合あり。
- topic 急増通知はノイズ抑制なし（同一条件で複数イベントがありうる）。
