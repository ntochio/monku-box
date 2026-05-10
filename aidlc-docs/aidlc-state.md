# AI-DLC State

## Extension Configuration

| Extension | Enabled | Decided At |
|-----------|---------|------------|
| Security Baseline | いいえ（PoC 段階ではスキップ — `requirement-verification-questions.md` 冒頭・セキュリティ拡張設問に準拠） | 2026-05-07 |

## Inception 再見直し（2026-05-10 起票・同日承認）

| 項目 | 状態 |
|------|------|
| 計画 | `inception/plans/inception-full-revisit-plan.md` — **承認済み**（2026-05-10。チェックリスト完了） |
| 追加論点（連投・重複と集計） | `inception/requirements/aggregation-duplicate-and-repeat-submissions.md` — **承認済み**（2026-05-10。§8 決定サマリ） |

**方針**: 既存の Inception／Construction 承認済み成果は **ベースライン**。本再見直しで追記した **集計の説明責任・ロードマップ**（業務 ID／Slack、ユニーク投稿者系 KPI、重複扱いの将来検討）を正とする。**現行 PoC 実装**の集計式（生メッセージ件数）は据え置き、次期 Construction で段階的に拡張する。

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
| Code Generation（monolith-core） | **承認済み**（2026-05-08）— `construction/plans/monolith-core-code-generation-plan.md`、`construction/monolith-core/code/code-generation-summary.md` |
| Build & Test（monolith-core） | **承認済み**（2026-05-08）— `construction/build-and-test/`（手順書・実行記録）、Operations 移行承認済み |

## Construction — Current Status

- **ユニット**: `monolith-core`
- **状態**: **Construction フェーズ完了**（Code Generation・Build & Test いずれも承認済み）。次工程は **Operations**（AI-DLC 上はプレースホルダ — 本番デプロイ・監視の手順は別途整備）。

## Operations Progress

| アーティファクト | ステータス |
|------------------|------------|
| Operations（デプロイ・監視・インシデント等） | **プレースホルダ** — `AGENTS.md` の定義どおり未拡張。Build & Test からの移行は **2026-05-08 承認済み**。 |

## 備考

- 要件の正本: `inception/requirements/requirement-verification-questions.md`（詳細）、`service-proposal-monku-box.md`（提案の要約・方針）。**PoC 前提の追記（2026-05-08）**: インフラ構築・通信方式（SOAP/REST/gRPC 等）は深く確定せず拡張しやすい実装とし、**JSON 中心** — 後続設計はこれに整合。
- アプリケーション設計の正本（PoC）: `inception/application-design/application-design.md`。
- ユーザーストーリー・ペルソナ（PoC）: `inception/user-stories/stories.md`、`inception/user-stories/personas.md`。
- Functional Design 対象ユニット: `inception/application-design/unit-of-work.md`（`monolith-core`。**集計の PoC 定義・ロードマップ**を 2026-05-10 に追記済み）。
- Infrastructure Design（PoC）の正本: `construction/monolith-core/infrastructure-design/`。
- **ビルド・テスト手順とサマリ**: `construction/build-and-test/`（正本は `build-and-test-summary.md`）。
- 本番移行時は `Extension Configuration` を見直し、必要なら Security Baseline 等を有効化する。
- **Inception 再見直し**と **集計・連投・重複** の論点: 上表「Inception 再見直し」を参照。
