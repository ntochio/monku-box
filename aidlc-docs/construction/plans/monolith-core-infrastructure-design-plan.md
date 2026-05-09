# Infrastructure Design Plan - monolith-core

## 実行計画（チェックリスト）

- [x] Functional Design / NFR Design / 論理コンポーネントを参照する
- [x] デプロイ環境・計算・ストレージ・ネットワークの PoC マッピングを確定する
- [x] メッセージング／本格監視の要否を NFR と照合する
- [x] 成果物を作成する（`infrastructure-design.md` / `deployment-architecture.md`）
- [x] 共有インフラの要否を判断する（本ユニットでは **不要** と判断）

---

## 確認質問（PoC 前提で [Answer] を確定）

### Q-I1. デプロイ環境・クラウド

PoC の実行・デモの主たる配置は？

[Answer]: **クラウド固定はしない**。開発は **ローカル**（`next dev` 等）。デモ共有が必要な場合は、チームが **Next.js をホスト可能な単一 PaaS**（例: Vercel 等）を選定してよい。マルチリージョン・専用 VPC は対象外。

### Q-I2. コンピュート

アプリの実行形態は？

[Answer]: **単一プロセス／単一インスタンス**の Next.js ランタイム。オートスケール・コンテナオーケストレーションは PoC では必須としない。

### Q-I3. ストレージ

永続データの PoC 実装は？

[Answer]: **単一ストア**。`tech-stack-decisions.md` に準拠し、**SQLite 等の単一ファイル DB** または **JSON/CSV 等のファイル永続**のいずれか（チーム選定）。バックアップ自動化・レプリケーションは必須化しない。

### Q-I4. メッセージング

キュー・イベントバスは？

[Answer]: **導入しない**（`logical-components.md` と一致）。

### Q-I5. ネットワーク

LB・独立 API ゲートウェイは？

[Answer]: **独立 API GW は置かない**。利用者からは **HTTPS でモノリス**に到達する 1 経路。PoC では **単一オリジン** を想定。

### Q-I6. 監視・ログ

運用監視基盤は？

[Answer]: **本格 APM/アラートは導入しない**。ホスト/PaaS 付属の **最小ログ** と、アプリの **標準出力レベル** に留める（`nfr-requirements.md` と一致）。

### Q-I7. 共有インフラ・マルチテナント

他ユニットとのインフラ共有は？

[Answer]: **なし**（`monolith-core` のみ）。`shared-infrastructure.md` は **作成しない**。

---

## トレーサビリティ

| 項目 | 根拠ドキュメント |
|------|------------------|
| 単一デプロイ | `nfr-design/logical-components.md`, `nfr-requirements.md` |
| 軽量永続 | `tech-stack-decisions.md`, `nfr-requirements.md` |
| 秘密情報 | `nfr-design/nfr-design-patterns.md` |
| PoC でインフラ・通信を深く確定しない／JSON 中心 | `requirement-verification-questions.md` 文脈・前提「インフラ構築および通信方式について」 |
