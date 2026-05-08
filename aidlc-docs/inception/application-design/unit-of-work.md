# Unit of Work 定義（PoC）

## Unit Name
`monolith-core`

## 背景
PoC では Next.js モノリスを採用するため、機能を 1 ユニットに集約して Functional Design を進める。

## Unit Scope
- 匿名投稿（テキスト/音声入力経路）
- topic 管理（投稿時の新規追加を含む）
- ダッシュボード表示（テーマ別集計・トレンド・改善提案表示）
- 管理者/閲覧者向け通知
- RBAC（投稿者・閲覧者・管理者）

## Out of Scope（PoC）
- 本番向け監査/運用監視/ログモニタリング本格化
- 本格パフォーマンス最適化
- オートスケーリング
- 拡張性の精緻設計（将来検討）
- 優先付け・優先度スコアリングのシステム実装

## 主要インターフェース（案）
- `/v1/api/messages`
- `/v1/api/topics`
- `/v1/api/dashboard/summary`
- `/v1/api/notifications`
- `/v1/api/voice/transcribe`（任意）

