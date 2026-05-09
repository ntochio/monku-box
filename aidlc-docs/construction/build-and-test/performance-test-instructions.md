# Performance Test Instructions — monku-box（monolith-core）

## Status: N/A（PoC）

要件確認書および Application Design の前提どおり、**PoC では本格的な性能数値要件・負荷試験をスコープ外**とする。

## 将来（本番移行時）の指針

数値目標（p95 レイテンシ、RPS、同時ユーザー）が NFR で定義されたあと、次のいずれかで手順を本ファイルまたは別リポジトリに追加する。

- **HTTP 負荷**: k6、Apache Bench、`autocannon` 等で `/v1/api/*` を対象
- **シナリオ**: 投稿バースト、ダッシュボード同時参照、通知一覧
- **環境**: 本番相当の DB・ネットワーク・ワーカー数で実施

## PoC での最小確認（任意）

開発者が体感で十分な場合のみ。

```bash
npm run build
time npm test
```

閾値は定めない。回帰比較用にログを残す程度。
