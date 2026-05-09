# AI-DLC State

## Extension Configuration

| Extension | Enabled | Decided At |
|-----------|---------|------------|
| Security Baseline | いいえ（PoC 段階ではスキップ — `requirement-verification-questions.md` 冒頭・セキュリティ拡張設問に準拠） | 2026-05-07 |

## Inception Progress

| アーティファクト | ステータス |
|------------------|------------|
| Workspace Detection | 完了（グリーンフィールド／ドキュメント中心リポジトリ） |
| Requirements Analysis | **完了**（2026-05-07）— `requirement-verification-questions.md` および `service-proposal-monku-box.md` **いずれも承認済み** |
| requirement-verification-questions.md | **承認済み**（2026-05-07） |
| service-proposal-monku-box.md | **承認済み**（2026-05-07） |
| Workflow Planning | **承認済み**（2026-05-08）— `inception/plans/workflow-plan-monku-box-poc.md` |
| User Stories | **承認済み**（2026-05-08）— `inception/user-stories/stories.md`、`personas.md`；計画 `inception/plans/story-generation-plan.md` |
| Application Design | **承認済み**（2026-05-08）— `inception/application-design/application-design.md` |
| Functional Design | **承認済み**（2026-05-08）— `construction/monolith-core/functional-design/` |
| NFR Requirements | **承認済み**（2026-05-08）— `construction/monolith-core/nfr-requirements/` |
| NFR Design | **承認済み**（2026-05-08）— `construction/monolith-core/nfr-design/`、`construction/plans/monolith-core-nfr-design-plan.md` |
| Infrastructure Design | **承認済み**（2026-05-08）— `construction/monolith-core/infrastructure-design/`、`construction/plans/monolith-core-infrastructure-design-plan.md` |
| Code Generation（monolith-core） | **成果物作成済み（承認待ち）** — Step 1〜14 完了 — `construction/plans/monolith-core-code-generation-plan.md`、`construction/monolith-core/code/code-generation-summary.md` |

## Construction — Current Status

- **ユニット**: `monolith-core`
- **進行中**: Code Generation Part 2 を実装完了（計画チェックリストすべて [x]）。**Build & Test** フェーズへ進める前提。生成コードのレビュー承認は `code-generation.md` に従う。

## 備考

- 要件の正本: `inception/requirements/requirement-verification-questions.md`（詳細）、`service-proposal-monku-box.md`（提案の要約・方針）。**PoC 前提の追記（2026-05-08）**: インフラ構築・通信方式（SOAP/REST/gRPC 等）は深く確定せず拡張しやすい実装とし、**JSON 中心** — 後続設計はこれに整合。
- アプリケーション設計の正本（PoC）: `inception/application-design/application-design.md`。
- ユーザーストーリー・ペルソナ（PoC）: `inception/user-stories/stories.md`、`inception/user-stories/personas.md`。
- Functional Design 対象ユニット: `inception/application-design/unit-of-work.md`（`monolith-core`）。
- Infrastructure Design（PoC）の正本: `construction/monolith-core/infrastructure-design/`。
- 本番移行時は `Extension Configuration` を見直し、必要なら Security Baseline 等を有効化する。
