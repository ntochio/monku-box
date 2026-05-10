# Unit of Work 定義（PoC）

## Unit Name
`monolith-core`

## 背景
PoC では Next.js モノリスを採用するため、機能を 1 ユニットに集約して Functional Design を進める。

## Unit Scope
- 匿名投稿（テキスト/音声入力経路）
- topic 管理（投稿時の新規追加を含む）
- ダッシュボード表示（テーマ別集計・**円グラフ／棒グラフ**・トレンド・改善提案表示）
  - **集計の定義（PoC）**: topic 別件数・日別件数・提案根拠の件数はいずれも **受理メッセージの生カウント**（`Message` 1 行 1 件）。同一人物の連投・内容の重複は **集計上は区別しない**。利用者向けに画面脚注・README で説明する（`application-design.md` §11、`inception/requirements/aggregation-duplicate-and-repeat-submissions.md` §8 と整合）。
- **メッセージ一覧**（閲覧者・管理者向け、topic 絞り込み、`GET /v1/api/messages`）
- 管理者/閲覧者向け通知
- RBAC（投稿者・閲覧者・管理者）

## Out of Scope（PoC）
- 本番向け監査/運用監視/ログモニタリング本格化
- 本格パフォーマンス最適化
- オートスケーリング
- 拡張性の精緻設計（将来検討）
- 優先付け・優先度スコアリングのシステム実装
- **集計の高度化（ロードマップ）**: 業務 **ログイン／職員 ID** 等による投稿者の安定識別、**Slack ID** 連携を前提とした同一人物の扱い、**ユニーク投稿者系 KPI**、**重複投稿**の検知／集計からの除外 — は **別イテレーション（Construction）** で設計・実装（承認済み論点: `aggregation-duplicate-and-repeat-submissions.md`）

## 主要インターフェース（案）
- `/v1/api/messages`
- `/v1/api/topics`
- `/v1/api/dashboard/summary`
- `/v1/api/notifications`
- `/v1/api/voice/transcribe`（任意）

## 関連ドキュメント

| 資料 | 内容 |
|------|------|
| `application-design.md` §11 | 集計指標・投稿者識別の PoC とロードマップ |
| `inception/requirements/aggregation-duplicate-and-repeat-submissions.md` | 連投・重複と集計の設問・決定サマリ（**2026-05-10 承認**） |
| `inception/application-design/unit-of-work-story-map.md` | ストーリーとユニットの対応 |

## 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-05-10 | ダッシュボードの **生メッセージ件数** 定義、集計ロードマップを Out of Scope に明記。関連ドキュメント表を追加 |
