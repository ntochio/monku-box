# Bounded Contexts（`frontend-components.md` 対応）

PoC では画面コンポーネントを `src/contexts/<context>/presentation/` に置く。

| Context | 主な画面 |
|---------|----------|
| `submission` | 投稿 |
| `dashboard` | ダッシュボード |
| `notifications` | 通知一覧 |
| `admin` | アカウント・辞書 |

ドメイン純粋ロジックは `src/domain/`、ユースケースは `src/application/`、永続・HTTP は `src/infrastructure/`。
