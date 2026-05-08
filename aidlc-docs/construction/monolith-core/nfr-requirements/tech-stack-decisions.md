# Tech Stack Decisions - monolith-core (PoC)

## 1. 決定事項サマリ

| 項目 | 決定 | 理由 |
|------|------|------|
| アプリ構成 | Next.js モノリス | 実装速度とデモ一貫性を優先 |
| API バージョン | `/v1/api/...` | 将来の破壊的変更時に `/v2/api/...` へ移行しやすい |
| API データ形式 | **JSON 中心** | `requirement-verification-questions.md`（インフラ構築および通信方式）。SOAP/gRPC 等の確定は本番移行時 |
| インフラ・通信標準 | PoC では**深く確定しない** | 最小構成＋アダプタ等で**将来の拡張**に備える（同上） |
| フロント設計 | DDD 分離（context + layer） | ビジネスロジック分離と保守性確保 |
| 投稿入力 | テキスト + 音声（ブラウザSTT優先） | UX重視、PoCで実現しやすい |
| 通知 | アプリ内のみ | PoCで外部連携コストを抑える |
| データ保持 | 軽量運用（CSV/JSON許容） | 本格DB設計は将来検討 |

## 2. 採用技術（PoC）

### 2.1 Frontend
- Next.js App Router
- React
- Tailwind CSS（既存方針）

### 2.2 Backend/API
- Next.js Route Handlers / Server Actions
- API Prefix: `/v1/api/...`
- リクエスト/レスポンスの主要ペイロードは **JSON**（`application/json`）。REST リソース設計の厳密化や gRPC 化は本番移行時に再オープン

### 2.3 Voice / STT
- 第一候補: ブラウザ機能
- 任意: `/v1/api/voice/transcribe` でサーバ経由
- 方針: 便利なライブラリ/プラットフォーム機能を優先利用

### 2.4 Data
- PoC では軽量保持を許容（CSV/JSON）
- 永続層の本格選定（RDB/NoSQL）は将来フェーズ

## 3. 非採用/先送り

- オートスケーリング
- 本格ログモニタリング基盤
- 高度な監査/法務対応機能
- 優先度スコアリング実装

## 4. 将来切替時の方針

### API
- `v1` 維持 + `v2` 追加で段階移行

### Data
- 軽量保持から RDB へ移行する場合も、論理エンティティ（Topic/Message/Notification/Suggestion/Account）を維持

### NFR
- 本番移行時に Security Baseline、性能目標、可用性目標を再定義

