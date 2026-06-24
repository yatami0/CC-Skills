# レビュー: 設計管理アーキテクチャ ＆ SDD/AI活用プロセス

- レビュー対象: `DOC_architecture/設計管理アーキテクチャ.md`、`プロンプト.md`（ルート）、`design-docs/プロンプト.md`、`メモ.md`、`doc/skills.md`、`AI_proccess/doc-kit-poc/doc/` 配下5件、補助として `design-docs/README.md`・`FE_architecture/doc/ai-*.drawio`
- 観点: 設計書→AI→成果物のトレーサビリティ／プロンプトの再現性・曖昧さ／人間とAIのレビュー境界／スケール時の破綻／ドキュメント重複／運用負荷
- レビュー日: 2026-06-22

---

## ① 概要

本リポジトリは「設計書を専用リポジトリで一元管理（3層構造・SSOT）し、Claude を使って 設計→ドキュメント→コード を機械的ガードレールで縛りながら生成する」という、明確に SDD（Spec-Driven Development）志向の試みである。中核は次の3系統に分かれている。

1. 設計書標準（`設計管理アーキテクチャ.md` ＋ `design-docs/`）: 第1層=標準／第2層=サイト／第3層=実ファイルの3層と、「2人以上が別実装するか？」という単一の判断基準で正本配置を決める設計。
2. AI実装プロセス（`プロンプト.md`ルート ＋ `FE_architecture/doc/ai-*.drawio`）: OpenAPI を起点に型/クライアント/Zod を生成し、AGENTS.md・lint・型・drift検出・CI・E2E でAIのドリフトを止め、人間とAI/機械のレビュー境界を図で定義する。
3. AI資料生成プロセス（`AI_proccess/doc-kit-poc/`）: content-free なデザインシステムと「原稿.md（frontmatter＋本文）」を分離し、AIに見た目を発明させずに資料を量産する。

総じて**思想は現行 SDD ベストプラクティス（GitHub Spec Kit / Amazon Kiro / Anthropic Context Engineering）と方向性が強く一致**している。SSOT、契約（OpenAPI）駆動、機械ゲートによるドリフト抑止、人間=仕様/AI=実装の境界という勘所を正しく押さえている。一方で、**「設計書（仕様）と生成コードを結びつける明示的トレーサビリティ」「プロンプト群の版管理・配置の一貫性」「人間レビューがラバースタンプ化しない運用上の歯止め」「スケール時の標準ガバナンス」**が弱い、または未整備である。これらは PoC 段階としては許容範囲だが、本番運用へ進める前に閉じるべき穴である。

評価サマリ: 設計思想 = 高い。再現性・運用設計 = 中。トレーサビリティ・ガバナンスの実装 = 未整備。

---

## ② 良い点

1. **SSOT の徹底と判断基準の明文化**。「それが決まっていないと2人以上が別実装するか？ Yes なら設計書、No なら別の正本（型/Figma/Storybook/Lint）」という1本の基準（`設計管理アーキテクチャ.md:29-30`, `メモ`系 `design-docs/プロンプト.md:34-35`）は、SDD で最も難しい「何を仕様に書くか」を運用可能なルールに落としており優秀。Spec Kit が `constitution.md` で非交渉原則を固定する発想と同型。
2. **契約（OpenAPI）駆動の生成＋drift検出**。`プロンプト.md:51-53,112` と `ai-human-review-boundary.drawio` の「①スキーマ→生成→②AI実装→③CI(型/lint/Vitest/drift/build)」は、Kiro/Spec Kit の「仕様が実行される検証ゲート」になるという核心と一致。手書き型禁止＋drift検出は、AIドリフトに対する有効な構造的歯止め。
3. **人間とAI/機械のレビュー境界を図で明示**。`ai-human-review-boundary.drawio` は「人間=仕様・アーキ／AI=実装詳細」「HIGH(セキュリティ)・MED(エラー処理)はブロッキング、LOWは助言的」「CIが緑になってから人間レビュー」「同速で通すのはラバースタンプ」（同 `note` セル）まで言語化しており、HITL設計として水準が高い。
4. **content-free 3層（tokens/components/templates）＋内容のコロケーション**。doc-kit の「部品は内容を持たず、原稿.md に内容を閉じる」「design-system→works 参照禁止を lint で機械強制」（`資料キット設計.md:205-211`、`コンポーネントprops仕様.md:163-170`）は、AIに見た目/余白を発明させない仕組みとして筋が良く、本体 ADR-0017 とも整合。
5. **Skill による暗黙知の形式知化・版管理**。`doc/skills.md` の「口頭指示でなく Skill に蓄積、カタログを単一索引に、1 Skill=1目的」は、Anthropic の CLAUDE.md/再利用ガイドラインと整合し、再現性に効く。
6. **根拠（出典）を添える文化**。`プロンプト.md` の引用ID体系（[P1]〜[E6]）、doc-kit の shadcn/Spectrum/Tailwind 出典明示（`トークン定義雛形.md:245-251`）は、AI生成物の検証可能性を上げる良い習慣。

---

## ③ 指摘事項（重大度順）

### [Critical] C-1. 設計書→生成コードの「トレーサビリティ」が仕組みとして存在しない

- 根拠: `設計管理アーキテクチャ.md` 全体（画面ID `SC-001` 採番は `design-docs/プロンプト.md:74` にあるが、設計書の項目と生成コード/テストを相互参照する仕組みの記述なし）。`プロンプト.md:51-53` の生成起点は OpenAPI のみで、3層設計書（画面設計・バリデーション・データ状態 `設計管理アーキテクチャ.md:183`）がコードへどう辿られるかの定義がない。
- 問題: SDD の中核価値は「仕様→実装→テストが双方向に追える」こと（Kiro の requirements/design/tasks のトラッキング、Spec Kit の user story 単位タスク分解）。本リポジトリは OpenAPI 契約のトレースは強いが、**画面仕様・業務ルール・区分値・メッセージといった「OpenAPI に乗らない仕様」が、どのコード/テストを根拠づけるかが追えない**。AIが生成したコードが「どの設計書のどの条項を満たすために存在するか」を後から検証できない＝レビューが勘に依存する。
- 推奨対応:
  - 安定IDの導入。画面ID/バリデーションID/区分値ID/メッセージIDを設計書側に採番し（`SC-001` 体系を拡張）、生成コード・テストにそのIDを参照コメント/タグで残す（例: テスト名に `[SC-001/VR-003]`）。Kiro が acceptance criteria を EARS 記法で番号付けする発想に倣う。
  - CIに「設計書ID→テスト被覆」チェックを足す（未被覆IDを警告）。これで drift検出が「契約」だけでなく「仕様」にも効く。
- 出典: [Kiro Specs (requirements/design/tasks, トラッキング)](https://kiro.dev/docs/specs/) / [spec-kit: spec-driven.md (user story単位のタスク)](https://github.com/github/spec-kit/blob/main/spec-driven.md) / [Guardrails and human review — traceability/audit trail](https://www.reco.ai/hub/guardrails-for-ai-agents)

### [Critical] C-2. 「プロンプト.md」の意味重複・配置不整合で、AI入力の再現性が壊れている

- 根拠: ルート `プロンプト.md`（447行）は「Next.js+TanStack解説HTMLを別セッションに生成させるビルド仕様」。`design-docs/プロンプト.md` は「`00_standards/` 残りファイルを作る引き継ぎ指示書」。**同名・別物・別ディレクトリ**で、命名から内容が推測できない。さらに `資料キット設計.md:14` は「現行PoCの問題＝内容を部品に直書き」と、ルート `プロンプト.md` が前提とした SVGベタ書き方式を**既に否定して再設計済み**である（`プロンプト.md:243-` の SVG直貼り方式は doc-kit 再設計で deprecated）。
- 問題: SDD/AI運用で「プロンプト＝再現可能な入力」は資産。同名衝突＋陳腐化により、新規参画者やClaudeが「どのプロンプトが現役の正本か」を判断できない。Anthropic のベストプラクティス（高シグナルな最小コンテキストの curation、CLAUDE.md を正本化）に真っ向から反する。SSOT原則（自分たちの `設計管理アーキテクチャ.md:34`）の自己違反でもある。
- 推奨対応:
  - 命名を内容で一意化（例 `prompt_build-explainer-html.md` / `handoff_00-standards-authoring.md`）。`プロンプト.md` という総称名は使わない。
  - 陳腐化したプロンプトに `> DEPRECATED: doc-kit再設計（資料キット設計.md）に置換` のステータスを冒頭付与、または `archive/` へ退避。
  - プロンプト/Skill/AGENTS.md の置き場と版管理ルールを1箇所に定義（`doc/skills.md` の索引思想をプロンプトにも拡張）。
- 出典: [Best practices for Claude Code (CLAUDE.md を正本化)](https://code.claude.com/docs/en/best-practices) / [Effective context engineering (高シグナル最小コンテキスト)](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

### [High] H-1. SDDの「フェーズ分割（spec→plan→tasks→implement）」が標準として未定義

- 根拠: `設計管理アーキテクチャ.md` は成果物の「配置と書式」の標準であり、AIに渡す**手順（フェーズ）の標準**がない。`プロンプト.md` 群は個別タスクの一発仕様で、Spec Kit/Kiro のような「要件確定→設計合意→タスク分解→実装」のゲート分割がプロセスとして固定されていない（`design-docs/プロンプト.md:113` に「章立てを先に提示し合意を取る」という良習があるが、属人的な一節に留まり標準化されていない）。
- 問題: フェーズ分割こそ SDD が「巨大な単一プロンプトからの推測」を排除する装置（Spec Kit の Specify/Plan/Tasks/Implement）。これが標準化されないと、AI活用の品質がセッションごとにばらつき、再現しない。
- 推奨対応: `00_standards/` に `ai-workflow.md`（仮）を新設し、(1)要件確定（人間署名）(2)設計合意（章立て先出し→合意）(3)タスク分解（IDで設計書に紐付け）(4)実装（CIゲート）のフェーズと、各ゲートの人間承認境界を `ai-human-review-boundary.drawio` と接続して固定する。
- 出典: [Spec Kit (Spec→Plan→Tasks→Implement)](https://github.github.com/spec-kit/) / [Microsoft Dev Blog: Diving into SDD with Spec Kit](https://developer.microsoft.com/blog/spec-driven-development-spec-kit)

### [High] H-2. 人間レビューのラバースタンプ化に対する「運用上の歯止め」が図止まり

- 根拠: `ai-human-review-boundary.drawio` の `note` で「同速で通すのはラバースタンプ」と問題提起はあるが、**それを防ぐ具体策（レビュー所要時間の下限、AI生成PRのサイズ上限、レビュー観点チェックリスト、AIレビューと人間レビューの責務分界の運用ルール）が成果物化されていない**。プロセス文書側（`設計管理アーキテクチャ.md`）にもレビュー基準の記載なし。
- 問題: AIが高速にPRを量産すると、人間が追認するだけの構造に陥りやすい（業界共通の失敗様式）。境界を図で描くだけでは運用で守れない。
- 推奨対応: PRテンプレートに「変更が満たす設計書ID」「人間が確認した業務ロジック観点」を必須項目化。AI生成PRの行数/ファイル数上限と分割規約を定義。HIGH/MEDブロッキングを CIのレビューbot or ラベルで強制。
- 出典: [CodeScene: guardrails & metrics for AI-assisted coding（理解できないコードは受け入れない）](https://codescene.com/blog/implement-guardrails-for-ai-assisted-coding) / [OpenAI: Guardrails and human review（承認の一時停止）](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals)

### [High] H-3. 標準のガバナンス（変更・逸脱・例外承認）が未定義でスケール時に破綻リスク

- 根拠: 「強い標準（番号体系・章立て・書式まで固定）」（`設計管理アーキテクチャ.md:19`）を採るが、**標準そのものを誰がどう改訂するか、サイト固有逸脱の承認フロー、例外（Excel許容 `設計管理アーキテクチャ.md:203-205`、番号ずれ容認 `:129-130`）の運用ルール**が薄い。ADRは「設計判断の記録」止まりで、変更管理プロセスではない（`:225-231`）。
- 問題: サイトがA/B/Cと増えると、各サイトが「固有成果物の追加」（`:151`）や「Excel化」を独自判断で行い、強い標準が骨抜きになる。Kiro の steering files / Spec Kit の constitution は「非交渉原則＋更新規律」をセットで持つ。本設計は原則はあるが更新規律が弱い。
- 推奨対応: `00_standards/` に変更管理を明記（標準改訂はADR必須＋レビュア指定）。固有成果物追加・Excel採用・番号挿入は「申請→記録（各サイトREADME＋中央台帳）」を必須化。standard準拠を機械チェック（フォルダ番号/必須ファイルの lint）。
- 出典: [Kiro: Steering files（恒久知識の規律）](https://kiro.dev/docs/specs/) / [spec-kit: constitution（非交渉原則）](https://github.com/github/spec-kit)

### [Medium] M-1. ルート `プロンプト.md` の指示に再現性を損なう曖昧・手作業依存が残る

- 根拠: `プロンプト.md:231` 「marker id を arrow1〜4 に手でユニーク化」、`:59` 「数値は目安、改善可」、`:421` 「図化しても可」など、AIの裁量に委ねる箇所が多い。これらは doc-kit 再設計で `useId()` 自動化・トークン固定・lint禁止に置換済み（`資料作成キット設計.md:170`, `トークン定義雛形.md:29`）。
- 問題: 「改善可」「〜してもよい」は出力をセッションごとにブレさせる。SDDが排除したい曖昧さそのもの。古いプロンプトが残ると、新方針を知らないセッションが旧手作業方式を再生産する。
- 推奨対応: C-2 のDEPRECATED処理とセットで、現役プロンプトからは裁量句を排し、固定値＋機械検証（lint/schema）へ寄せる。doc-kit の Zod schema 検証（`テンプレートslot仕様.md:133`）を「原稿が仕様を満たすか」の機械ゲートとして全面採用。
- 出典: [Claude prompting best practices（曖昧さ低減・タグ構造化）](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices) / [eagleeyet: specifications as guardrails](https://eagleeyet.net/blog/artificial-intelligence-ai/ai-assisted-coding-with-specifications-as-guardrails-how-discipline-turns-generative-speed-into-reliable-engineering/)

### [Medium] M-2. テストが「AIの実装」から作られるとドリフトを追認するリスク

- 根拠: `プロンプト.md:53,116` と `ai-human-review-boundary.drawio` n2b「AI: テスト草案を生成→人間がレビューしてコミット」。E2EはCRUDハッピーパス中心（`プロンプト.md:340`）。
- 問題: 「実装からテストを作る」と、AIの誤実装をテストが追認してしまう（業界既知の失敗様式）。SDDの正道は「テストは実装ではなく仕様（acceptance criteria）から生成」。ハッピーパス偏重は異常系の検証ゲートが薄い。
- 推奨対応: テスト生成の根拠を「設計書ID/受入基準」に固定（C-1のIDと接続）。`ai-human-review-boundary` のn2bに「テストは仕様から、実装からは作らない」を明記。異常系（バリデーション・error状態 `設計管理アーキテクチャ.md:183`）のE2E/単体を最低1本ずつ必須化。
- 出典: [Guardrails — AI generates tests from the spec, not implementation](https://www.reco.ai/hub/guardrails-for-ai-agents) / [CodeScene: all AI code covered by tests](https://codescene.com/blog/implement-guardrails-for-ai-assisted-coding)

### [Medium] M-3. doc-kit が「設計md多数・実装ゼロ」で、設計と実体の乖離リスク

- 根拠: `資料作成キット設計.md`（Web Components版）と `資料キット設計.md`（React再設計版）が併存し、前者は「Web Components採用」、後者は「React+Tailwind v4 へ転換」と**結論が逆**。実装は「次フェーズ」（`資料キット設計.md:222`）で未着手。仕様3枚（props/slot/token）は精緻だが検証されていない。
- 問題: SDDでも「設計だけが増え実装で検証されない」と設計が空中楼閣化する。特に逆結論の2設計の併存は、AI/人間のどちらにも「現役の正本」を誤認させる（C-2と同根）。
- 推奨対応: Web Components版を明示的にSuperseded化（冒頭にステータスとリンク）。React版を最小1成果物（works/nextjs-tanstack の page 1本）で実装し、lint（参照方向・任意値禁止・content-free）が実際に効くことを実証してから仕様を確定。
- 出典: [Spec Kit（spec→plan→tasks→implementで早期に実装検証）](https://github.github.com/spec-kit/quickstart.html)

### [Low] L-1. 図フォーマット規約の自己不整合（PlantUML推奨 vs draw.io多用）

- 根拠: `設計管理アーキテクチャ.md:160-168` は「Git差分と相性の良いテキストベース（PlantUML/Mermaid）を基本」とするが、実際のAIフロー図は `.drawio`（XML）で作られている（`ai-human-review-boundary.drawio` 等）。
- 問題: 標準と実運用の軽微な乖離。draw.io はバイナリ寄りで差分レビューしにくく、自標準の趣旨と緊張関係。
- 推奨対応: 「複雑な構成図のみ draw.io 可」の例外条件（`:166`）に AIフロー図が該当するかを明記。該当しないなら Mermaid 化、するなら `.drawio.svg` でテキスト差分を確保。
- 出典: [Future Architect: Markdown設計ドキュメント規約（図の方針・本リポジトリの手本）](https://future-architect.github.io/arch-guidelines/documents/forMarkdown/markdown_design_document.html)

### [Low] L-2. ドキュメントの分散と表記ゆれで運用ナビゲーションが弱い

- 根拠: ルート直下 `プロンプト.md`/`メモ.md`、`DOC_architecture/`、`design-docs/`、`AI_proccess/doc-kit-poc/`、`FE_architecture/` と関連物が散在。`設計管理アーキテクチャ.md` 内でファイル名が `design_architecture.md`（英名・`:55`）と日本語名で揺れ、`document_guideline.md` は §4 から「§4成果物カタログ」と参照されるが本文に§4見出しが別内容（フォルダ体系）になっている軽微な参照ずれ。
- 問題: 新規参画者/Claudeの「まずこれを読む」（`設計管理アーキテクチャ.md:5`）導線が、リポジトリ全体では機能しにくい。
- 推奨対応: リポジトリ直下 README にトップレベル索引（設計書標準／AI実装プロセス／AI資料生成／Skill の4系統への入口）を置く。ファイル名の英/日を統一。
- 出典: [Effective context engineering（ナビゲーション可能な構造）](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

### [Info] I-1. メモ.md が要件の唯一の源だが、構造化されていない

- 根拠: `メモ.md` は業務仕様（マスタデータ駆動UI生成）を箇条書きで保持するが、推敲前の思考メモ（「〜かなあ」`:16` 等）。これが上流要件の実質的な源になっている。
- 推奨対応: 確定要件は requirements 相当の構造化文書（user story＋受入基準）へ昇格し、メモは `notes/` として分離。C-1のID採番の起点にする。
- 出典: [Kiro: requirements.md（user story＋acceptance criteria）](https://kiro.dev/docs/specs/)

---

## ④ SDD/AI活用ベストプラクティスとの照合

| 観点 | 権威ある基準 | 本リポジトリの状況 | 判定 |
|---|---|---|---|
| 仕様を中心に置く / SSOT | Spec Kit: constitution＋spec中心 / Kiro: steering files | 3層構造＋単一判断基準で正本配置を規律。OpenAPI契約をSSOT化 | 強い（思想一致） |
| フェーズ分割（spec→plan→tasks→implement） | Spec Kit / Kiro の必須ワークフロー | プロセスとして標準化されていない（H-1） | 弱い |
| トレーサビリティ（仕様↔実装↔テスト） | Kiro のタスクトラッキング / 監査証跡 | OpenAPI契約のみ。画面/業務/区分値/メッセージは未接続（C-1） | 弱い |
| 仕様からのテスト生成（実装からでなく） | Guardrails: tests from spec | AIが実装からテスト草案（M-2） | 弱い |
| 機械ゲートでドリフト抑止 | specs as executable guardrails | 型/lint/drift/CI/E2E が整備。drawioで境界明示 | 強い |
| 人間=仕様/AI=実装 の境界 | HITL: 高リスクは人間承認、追認回避 | 図で明示。ただし運用歯止めは未成果物化（H-2） | 中 |
| プロンプト/コンテキストの再現性 | Anthropic: 高シグナル最小コンテキスト、CLAUDE.md正本化 | Skillは良。プロンプトは同名衝突・陳腐化（C-2, M-1） | 弱い |
| 標準のガバナンス/変更規律 | constitution＋更新規律 / steering | 原則はあるが改訂・逸脱承認が薄い（H-3） | 中 |
| 設計の実装検証 | Spec Kit: 早期 implement で検証 | doc-kit は逆結論2設計併存・実装ゼロ（M-3） | 弱い |

主要出典:
- [GitHub Spec Kit (repo)](https://github.com/github/spec-kit) / [Spec Kit Docs](https://github.github.com/spec-kit/) / [spec-driven.md](https://github.com/github/spec-kit/blob/main/spec-driven.md)
- [Amazon Kiro: Specs](https://kiro.dev/docs/specs/) / [Kiro](https://kiro.dev/)
- [Anthropic: Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices) / [Claude prompting best practices](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices)
- [Microsoft Dev Blog: Diving into SDD with Spec Kit](https://developer.microsoft.com/blog/spec-driven-development-spec-kit)
- [Guardrails for AI agents (Reco)](https://www.reco.ai/hub/guardrails-for-ai-agents) / [CodeScene: guardrails & metrics](https://codescene.com/blog/implement-guardrails-for-ai-assisted-coding) / [OpenAI: Guardrails and human review](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals)
- [eagleeyet: specifications as guardrails](https://eagleeyet.net/blog/artificial-intelligence-ai/ai-assisted-coding-with-specifications-as-guardrails-how-discipline-turns-generative-speed-into-reliable-engineering/)
- [Future Architect: Markdown設計ドキュメント規約（本リポジトリの手本）](https://future-architect.github.io/arch-guidelines/documents/forMarkdown/markdown_design_document.html)

---

## ⑤ 総評と次アクション

**総評**: SDD/AI活用の「思想」は現行ベストプラクティスと高い水準で一致している。SSOT、契約駆動生成、機械ゲート、レビュー境界の明示は、多くの現場が言語化できていない勘所を正しく押さえている。減点は「思想を運用に固定する仕組み」が未整備な点に集中する。具体的には (a) 仕様↔コードのトレーサビリティ、(b) プロンプト/設計の版管理と陳腐化処理、(c) 人間レビューがラバースタンプ化しない歯止め、(d) 標準のガバナンス。これらは PoC として未着手は妥当だが、サイトを増やし本番運用へ進める前の必須課題である。

**次アクション（優先順）**:
1. (C-2/M-1/M-3) 即時: 同名 `プロンプト.md` を内容で改名し、陳腐化したプロンプトと Web Components版 doc-kit設計に DEPRECATED/Superseded ステータスを付与。「現役の正本」を一意化する（低コスト・高効果）。
2. (C-1) 設計書に安定ID体系（画面/バリデーション/区分値/メッセージ）を採番し、生成コード/テストに参照を残す。CIで「未被覆ID」を警告。
3. (H-1) `00_standards/ai-workflow.md` を新設し、spec→plan→tasks→implement の各ゲートと人間承認境界を `ai-human-review-boundary.drawio` と接続して固定。
4. (H-2/M-2) PRテンプレートに「満たす設計書ID／人間確認の業務観点」を必須化、AI生成PRのサイズ上限を規定、テストは仕様から生成する旨を明文化。異常系テストを最低限必須化。
5. (H-3) 標準の変更管理（改訂はADR＋レビュア、逸脱は申請・台帳記録、フォルダ/必須ファイルのlint）を整備。
6. (M-3) doc-kit React版を最小1成果物で実装し、lintガードレールが実際に効くことを実証してから仕様確定。
7. (L-1/L-2/I-1) 図フォーマット例外の明記、リポジトリ直下READMEに4系統索引、`メモ.md` を構造化要件へ昇格。
