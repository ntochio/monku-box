# Functional Design Plan - monolith-core

## 実行計画（チェックリスト）
- [x] Unit context を確認する（`unit-of-work.md` / `unit-of-work-story-map.md`）
- [x] ビジネスロジックモデルを設計する（投稿・通知・分析表示）
- [x] ドメインエンティティを設計する（Message/Topic/Notification/Policy など）
- [x] バリデーション・業務ルールを設計する（Policy 集約方針）
- [x] エラーハンドリングと代替フローを設計する（音声失敗時フォールバック含む）
- [x] フロント機能の機能設計を作る（投稿・ダッシュボード・通知）
- [x] 成果物を作成する（business-logic-model.md / business-rules.md / domain-entities.md / frontend-components.md）
- [x] 整合性チェックを実施する（Application Design・要件確認書との整合）

**要件確認書（2026-05-08 追記）**: 「インフラ構築および通信方式」— PoC でインフラ・通信標準を深く確定しない／**JSON 中心**／拡張しやすい境界。成果物 `business-rules.md` §9 等で反映。

---

## 確認質問（[Answer] を埋めてください）

### Q1. topic 追加時の重複扱い
同名/類似 topic が既存にある場合、PoC ではどう扱いますか？  
A) 常に新規作成  
B) 完全一致なら既存 topic に寄せる  
C) 類似候補を提示し、利用者が選ぶ  
D) 管理者レビュー待ちにする  
X) その他  
[Answer]: B

### Q2. Policy バリデーション失敗時の投稿扱い
Policy が NG を返したときの扱いは？  
A) 投稿自体を拒否  
B) マスク/補正して受理  
C) 重大度で分岐（軽微は受理、重大は拒否）  
D) PoC ではログのみ残して受理  
X) その他  
[Answer]: B

### Q3. 通知トリガーの最小セット
PoC で通知を発火する条件を選んでください（複数可）。  
A) 新規投稿  
B) topic 急増  
C) 分析更新完了  
D) 要確認投稿発生  
X) その他  
[Answer]: A,B

### Q4. 音声入力の実行方式
PoC で優先する STT 方式は？  
A) ブラウザ機能優先  
B) サーバ経由 API 優先  
C) 併用（可用な方を選択）  
D) テキスト主軸で音声は補助  
X) その他  
[Answer]: A

### Q5. アカウント追加の制約
管理者がアカウント追加する際の最小制約は？  
A) メール一意のみ  
B) ロール必須指定  
C) 仮パスワード/招待フロー必須  
D) PoC は固定テンプレユーザー追加  
X) その他  
[Answer]: B

### Q6. ダッシュボード表示の最小要素
PoC のダッシュボード必須表示は？（複数可）  
A) topic 別件数  
B) 時系列トレンド  
C) 通知一覧リンク  
D) 改善提案カード  
X) その他  
[Answer]: A,D

### Q7. 非同期処理の扱い
分析・通知を投稿と同一トランザクションに含めますか？  
A) 含める（単純）  
B) 投稿保存後に非同期で実行  
C) 条件に応じて切替  
D) PoC は未定  
X) その他  
[Answer]: A

### Q8. Functional Design の完了判定
次のうち完了条件として採用するものは？  
A) 4成果物が揃う  
B) 主要ユースケース3本のルールが明文化  
C) RBACとPolicy責務が矛盾なく表現  
D) A〜C の複合  
X) その他  
[Answer]: B,C

