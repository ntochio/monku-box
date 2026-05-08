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
| Workflow Planning | **起票済み** — `inception/plans/workflow-plan-monku-box-poc.md` |
| Application Design | **承認済み**（2026-05-08）— `inception/application-design/application-design.md` |
| Functional Design | **承認済み**（2026-05-08）— `construction/monolith-core/functional-design/` |
| NFR Requirements | **承認済み**（2026-05-08）— `construction/monolith-core/nfr-requirements/` |
| NFR Design | **成果物作成済み（承認待ち）** — `construction/monolith-core/nfr-design/`、`construction/plans/monolith-core-nfr-design-plan.md` |

## 備考

- 要件の正本: `inception/requirements/requirement-verification-questions.md`（詳細）、`service-proposal-monku-box.md`（提案の要約・方針）。
- アプリケーション設計の正本（PoC）: `inception/application-design/application-design.md`。
- Functional Design 対象ユニット: `inception/application-design/unit-of-work.md`（`monolith-core`）。
- 本番移行時は `Extension Configuration` を見直し、必要なら Security Baseline 等を有効化する。
