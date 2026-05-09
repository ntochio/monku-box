# Story Generation Plan（monku-box PoC）

**前提**: `user-stories-assessment.md` で User Stories 実施を Yes と判定。正本のストーリー一覧のたたき台は `inception/application-design/unit-of-work-story-map.md`。

## ストーリー分解アプローチの選択肢（参考）

| アプローチ | 利点 | 注意 |
|------------|------|------|
| User Journey-Based | フロー検証に強い | ロール横断で重複しやすい |
| Feature-Based | 実装モジュールと対応しやすい | ユーザー文脈が弱くなりがち |
| Persona-Based | ロール別のニーズが明確 | 同一機能の重複記述 |
| Domain-Based | ドメイン境界と整合 | PoC ではやや重い |
| Epic-Based | 既存ストーリーマップと一致しやすい | エピック間の依存を明示する必要 |

**本 PoC の推奨**: 既存マップに合わせ **Epic-Based を主** とし、必要に応じて **Persona-Based** でロールをラベル付け（ハイブリッド）。

## 実行チェックリスト（Part 2 で順に [x]）

- [x] `aidlc-docs/inception/user-stories/personas.md` を生成（アーキタイプ・動機・権限の要約）
- [x] `aidlc-docs/inception/user-stories/stories.md` を生成（INVEST、エピック→ストーリー、各ストーリーに受け入れ基準）
- [x] ストーリーとペルソナの対応表を `stories.md` 内または別節に記載
- [x] `unit-of-work-story-map.md` のストーリー ID と照合し、欠落・矛盾がないことを確認
- [x] `aidlc-state.md` の User Stories 行を Part 2 完了状態に更新

## 必須成果物（計画への組み込み）

- [x] `stories.md` — INVEST を意識したユーザーストーリーと受け入れ基準
- [x] `personas.md` — ユーザーアーキタイプと特性
- [x] 各ストーリーが Independent / Valuable / Testable であることの簡潔な根拠（本文または表）

---

## 設問（`common/question-format-guide.md` に準拠）

回答は各問の `[Answer]:` に記入してください（例: `A` または `A — 補足`）。

### Question 1

ストーリー `stories.md` の主な整理軸はどれにしますか？

A) Epic-Based（`unit-of-work-story-map.md` のエピック 1〜3 を正とする）
B) User Journey-Based（投稿→閲覧→管理の時系列で並べ替える）
C) Persona-Based（投稿者 / 閲覧者 / 管理者ごとにグループ化）
X) Other（`[Answer]:` 下に具体的に記載）

[Answer]: A

### Question 2

ペルソナ `personas.md` の詳細度はどれにしますか？

A) 最小（名前・ロール・目的・主要権限のみ、各 1 段落程度）
B) 標準（上記に加え、典型シナリオ・フラストレーション・成功指標を箇条書き）
C) 詳細（ユーザーリサーチ想定の深掘り、複数引用・行動パターン）
X) Other（`[Answer]:` 下に具体的に記載）

[Answer]: B

### Question 3

受け入れ基準の記述形式はどれにしますか？

A) 箇条書き（Given/When/Then なし、検証可能なチェックリスト）
B) Given / When / Then（シナリオ形式）
C) 両方（ストーリーごとに箇条書き＋代表シナリオ 1 本）
X) Other（`[Answer]:` 下に具体的に記載）

[Answer]: A PoC段階なので

### Question 4

音声入力関連ストーリー（Story 1.2 / 1.3）の技術的詳細の扱いは？

A) ユーザー目標のみ（ブラウザ API 名や実装方式は書かない）
B) PoC 実装に合わせた一行メモのみ（例: 音声認識フォールバック）
C) 技術制約を受け入れ基準に明示（対応ブラウザ・失敗コード等）
X) Other（`[Answer]:` 下に具体的に記載）

[Answer]: C

### Question 5

`stories.md` に、要件確認書の PoC スコープ外（本番監査・本格 NFR 等）への言及をどこまで含めますか？

A) 含めない（PoC ストーリーのみ）
B) 各エピック末尾に「本番移行時」の一行注記のみ
C) 別節「Out of scope（参照）」に要件ドキュメントへのリンクのみ
X) Other（`[Answer]:` 下に具体的に記載）

[Answer]: C

---

## Part 1 完了条件

- 上記すべての `[Answer]:` が記入されていること
- 曖昧な回答（「おおむね」「場合による」等）があれば、追記の明確化またはフォローアップ設問に回答済みであること
- ユーザーから本計画（分解方針・設問回答）の**明示承認**があること → **2026-05-08 承認済み**（ユーザー入力: `story-generation-plan.mdを承認します`）

## Part 2

- **2026-05-08**: チェックリストおよび必須成果物を完了。`inception/user-stories/personas.md` / `stories.md` を生成。
