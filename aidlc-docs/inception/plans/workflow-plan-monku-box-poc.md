# Workflow Plan：文句箱（モンクボックス）PoC

**前提**: `inception/requirements/requirement-verification-questions.md` は 2026-05-07 承認済み。正本は同ファイルの `[Answer]:` と冒頭の PoC スコープ外明記（監査・運用監視など）。**2026-05-08 追記**: インフラ構築および通信方式（SOAP/REST/gRPC 等）は PoC で深く確定せず拡張しやすい実装とし、**JSON を中心**とする節を追加済み。

## 推奨フェーズ（Inception → Construction）

1. **提案書への回答サマリ反映** — `requirements/service-proposal-monku-box.md` を確定版に近づける（チャネル、匿名性、Next.js モノリス、DB、通知・権限、音声入力、データ分析の PoC 範囲）。
2. **Application Design（標準〜最小）** — API・主要エンティティ（message/topic/user 匿名 ID）、RBAC、主要画面フローを 1 資料に整理。
3. **User Stories（条件付き）** — 投稿（音声含む）、閲覧ダッシュボード、管理者通知、分析・改善提案が複数ロールに跨る場合に起票。
4. **Construction / Code Generation** — Next.js モノリスで実装。PoC では性能・運用監視・拡張性の本格設計は対象外（要件確認書の前提に従う）。

## 深度

- **Functional / NFR**: PoC は機能と最小エラーハンドリング優先。本番 NFR は本番移行時に再オープン。
- **Security Baseline**: PoC では無効（要件確認書・`aidlc-state.md` に一致）。

## 承認

- **承認日**: 2026-05-08
- **状態**: 承認済み（変更があれば本ファイルと `aidlc-state.md` を更新する）
