# コードレビュー: doc-kit-poc

レビュアー: シニアフロントエンドエンジニア視点
対象: `c:\Users\yunag\git\sdd\AI_proccess\doc-kit-poc`
レビュー日: 2026-06-22
ブランチ: fe-architecture

---

## ① 概要とスコープ

### 対象

「資料作成キット（ドキュメント系デザインシステム）」の PoC。React 19 / Vite 6 / TypeScript 5.8 / Storybook 10 / Tailwind CSS 4 を採用し、以下の二層に分離している。

- **`design-system/`** … トークン（OKLCH + Tailwind v4 `@theme`）・部品（役割9カテゴリ）・テンプレ（`PageDoc`/`Section`）・runtime（`resolveWork`/`useTheme`/`useScrollSpy`/`markdown`）。content-free を標榜。
- **`works/`** … 成果物（資料1本 = `nextjs-tanstack`）。`doc.tsx` で `defineWork()` を使い内容を宣言する。

依存方向は `works → design-system` の一方向で、ESLint の `no-restricted-imports` により機械的に強制している。

### レビューしたファイル（node_modules / dist / storybook-static / dist-shots を除く全ソース）

- 設定: `package.json`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `index.html`, `.storybook/main.ts`, `.storybook/preview.tsx`
- design-system: `tokens/tokens.css`, `components/**`（全 .tsx + `components.css` + `index.ts` + `types.ts`）, `templates/page/**`, `templates/types.ts`, `runtime/**`, `foundations/TokenSwatches.tsx`, `index.ts`
- works: `nextjs-tanstack/{App.tsx,doc.tsx}`, `Works.stories.tsx`, `assets/`（SVG/drawio 実在を確認）
- src: `main.tsx`
- scripts: `screenshot.mjs`
- doc: 設計md 群、`README.md`

### 検証の前提

- 「検証済みの事実」と「推測」を区別して記載する。バージョン互換・セキュリティ挙動は公式情報源で裏取りした（④参照）。
- ソースコードは一切変更していない（本レビューファイルの Write のみ）。

### 全体評価（先に結論）

設計の芯（content-free / 一方向依存 / トークン経由のみ）は明快で、PoC としての完成度は高い。**Critical な脆弱性・バグは発見されなかった。** 一方で **ドキュメント（README）が実装と大きく乖離**しており、それに連動して **未使用依存（zod / js-yaml / eslint-plugin-import）** と **デッドコード（`useTOC`）** が残っている。React hooks の lint ルールが未導入である点も保守上の弱点。

---

## ② 良い点

- **関心の分離が徹底**: 部品は `content-free`（中身を JSX 直書きさせず `columns`/`rows`/`items` 等のデータ props で受ける）。`CompareTable.tsx` / `KeyPoints.tsx` / `Bullets.tsx` がよい例。デザインシステムとして筋がよい。
- **境界を機械で守る設計**: `eslint.config.js` の `no-restricted-imports` で `design-system → works` 禁止・`works` は公開バレル経由のみ、を強制。さらに `no-restricted-syntax` で Tailwind 任意値（`p-[24px]` / `bg-[#fff]`）と生 px/hex を禁止し、トークン経由を担保している（思想と実装が一致）。
- **Tailwind v4 の CSS-first を正しく採用**: `tokens.css` で `@import "tailwindcss";` + `@theme` / `@theme inline` を使用。色は `@theme inline` で `var(--bg)` を直接参照させ、`:root[data-theme="dark"]` 切替が runtime で効く構成。shadcn 流の2段名（semantic 実体 → `@theme inline` 公開）になっており、v4 の推奨に沿う（出典④）。`@tailwindcss/vite` プラグインの使い方も公式どおり。
- **アクセシビリティへの配慮が随所に**:
  - `Toc.tsx`: 現在地に `aria-current="location"`、`<nav aria-label="目次">`。
  - `PageDoc.tsx`: テーマトグルに `aria-label` / `aria-pressed`。
  - `CompareTable.tsx` / `Table.tsx`: `scope="col"` / `scope="row"` を適切に付与、行頭セルを `<th scope="row">` 化。
  - `components.css`: `@media (prefers-reduced-motion: reduce)` で smooth scroll を無効化（前庭障害配慮）。
  - `Image.tsx`: `alt` を必須 props にし、`doc.tsx` でも図に要旨 alt を記述。
  - Storybook で `@storybook/addon-a11y` を導入し `a11y: { test: "error" }` で CI ゲート化。
- **テーマのちらつき対策（FOUC）が本格的**: `index.html` の blocking script が first paint 前に `data-theme` を確定し、`useTheme.ts` がそれを `readInitial` で引き継ぐ。next-themes 方式に準拠。`localStorage` 不可（private mode）でも `try/catch` で継続。
- **scroll-spy の実装が堅実**: `useScrollSpy.ts` は IntersectionObserver で交差中 entry を Map 管理し、外れたら削除。コメントで「旧実装のバグ修正」を明記。依存配列を `key`（`ids.join("|")`）で安定化する判断も妥当。
- **SVG の light/dark 切替が CSS 駆動**で JS state に依存しない（`Image.tsx` + `components.css` の `.ds-image--themed`）。`@media (prefers-color-scheme)` と `data-theme` の二段構えで SSR/初期表示にも強い。
- **印刷/PDF 対応**: `@media print` で TOC・トグルを隠し、図・表・出典に `break-inside: avoid`、見出しに `break-after: avoid`。
- **型の identity ヘルパ** `defineWork()` で `doc.tsx` の補完が効く。runtime の `ResolvedWork`/`ResolvedPart` も型がしっかり通っている。
- **Storybook の自動発見**: `Works.stories.tsx` が `import.meta.glob("./*/doc.tsx", { eager: true })` で works を自動列挙。資料追加でストーリーが自動増加する。
- **tsconfig が厳格**: `strict` / `noUnusedLocals` / `noUnusedParameters` / `noFallthroughCasesInSwitch` / `noUncheckedSideEffectImports` / `verbatimModuleSyntax`。Vite 公式テンプレに沿った Project References 構成。

---

## ③ 指摘事項（重大度順）

> 重大度の目安: Critical=即時対応（脆弱性/壊れる）、High=早期対応（保守性/正しさに実害）、Medium=改善推奨、Low=些細、Info=参考。

### High

| # | 重大度 | 指摘 | 根拠（ファイル:行） | 推奨対応 |
|---|---|---|---|---|
| H-1 | High | **README が実装と大幅に乖離（ドキュメント・ドリフト）**。README は `原稿.md`（frontmatter + 本文を js-yaml/Zod で parse・検証）、`doc.config.ts`、`parts/NN-slug/{原稿.md, Part.tsx, Diagram.tsx}`、`figure: ./Diagram` 文字列解決、「frontmatter が誤ると Zod でビルド停止」等を説明するが、**実装はいずれも存在しない**。実体は単一 `doc.tsx` + `defineWork()` のインライン TS データで、YAML も Zod も使っていない。新規参画者が README に従うと動かない。 | `README.md:6,87-98,104-108,118-149`（frontmatter/Zod/parts/doc.config.ts の記述） vs `works/nextjs-tanstack/doc.tsx:17`（`defineWork({...})`）, `design-system/runtime/resolveWork.tsx`（YAML/Zod なし） | README を現行アーキ（`doc.tsx` 1ファイル宣言・`defineWork`・`Image` import）に全面更新。設計md（`doc/`）にも旧構成の記述が残るため整合を取る。 |
| H-2 | High | **`zod` と `js-yaml`（+ `@types/js-yaml`）が未使用依存**。ソース全体で import ゼロ（設計md にのみ登場）。バンドル/サプライチェーン上の死荷重で、H-1 の旧設計の名残。 | `package.json:16,20`（deps）, `package.json:34`（@types）。`zod`/`js-yaml` の import を全 `*.ts(x)/*.mjs` で grep → 0 件（`doc/テンプレートslot仕様.md:22` の記述のみ） | 実際に Zod 検証を再導入しないなら3つとも削除。再導入するなら runtime に組み込む。 |
| H-3 | High | **`eslint-plugin-react-hooks` が未導入**。React アプリでありながら `rules-of-hooks` / `exhaustive-deps` が無効。`useScrollSpy.ts:48` は意図的に依存を `[key]` のみにしているが（コメントあり）、こうした箇所を含めフックの依存ミスを機械検出できない。React 公式は flat config での導入を推奨。 | `eslint.config.js` 全体（`react-hooks` の記述なし。grep 0 件） | `eslint-plugin-react-hooks`（v5+/flat config 対応）を追加し `recommended-latest` を有効化。意図的な依存除外は該当行 `// eslint-disable-next-line react-hooks/exhaustive-deps` で明示。 |

### Medium

| # | 重大度 | 指摘 | 根拠 | 推奨対応 |
|---|---|---|---|---|
| M-1 | Medium | **デッドコード `useTOC`**。定義・バレル公開されているが呼び出し元ゼロ。`WorkDocView.tsx:24` は `work.tocItems` を直接使い、`resolveWork.tsx:83` が tocItems を自前生成するため `useTOC` は不要。`noUnusedLocals` は export されているため検出しない。 | `runtime/page/useScrollSpy.ts:6-11`（定義）, `design-system/index.ts:25`（`export { useTOC, ... }`）。`useTOC` の利用箇所 grep → 定義/export のみ | `useTOC` と `index.ts` の export を削除。`useScrollSpy` だけ残す（ファイル名も実態に合わせる検討可）。 |
| M-2 | Medium | **`eslint-plugin-import` が依存にあるが未設定**。flat config で plugin 登録も `import/*` ルールも無い。境界制御は `no-restricted-imports` で実現済みのため、当 plugin は実質未使用依存。 | `package.json:39`（dep）vs `eslint.config.js`（`import` plugin/ルールの記述なし、grep 0 件） | 使うなら `import/order` 等を有効化、使わないなら削除。 |
| M-3 | Medium | **Storybook `typescript.reactDocgen` 設定の妥当性**。`reactDocgen: "react-docgen-typescript"` を指定しているが、当プロジェクトの部品はインライン型注釈（`{ tone?: Tone }`）が中心で、別名 interface への抽出が少ない。`react-docgen-typescript` はビルドが重く型解決が不安定になりやすい。Storybook 10 の既定（`react-docgen`）の方が高速で十分なケースが多い（推測: 実測していないため要検証）。 | `.storybook/main.ts:17-23` | props 表の出方を確認のうえ、不足なければ既定 `react-docgen` に戻すことを検討。 |
| M-4 | Medium | **`Region` の compound 用 CSS が部分欠落**。`Region.tsx` は `.ds-region-body` / `.ds-region-footer` を出力するが、`components.css` には `.ds-region` と `.ds-region-header` のスタイルしか無い（body/footer は無スタイル）。現状 `Region` は実描画パスで未使用のため実害は出ていないが、使い始めると不整合。 | `components/layout/Region.tsx:14-19` vs `components.css:30-39`（body/footer の規則なし） | 不要なら body/footer サブ要素を削るか、CSS を補う。 |
| M-5 | Medium | **デザインシステム部品の多くが「カタログのみ」で実利用ゼロ**。`Region`/`Stack`/`Columns`/`Card`/`Badge`/`Spacer`/`Divider` は stories と自身の定義以外から参照されない（実資料 `doc.tsx`・テンプレ経路で不使用）。DS として将来用に持つ判断は妥当だが、PoC の検証範囲としては「動作実績のない部品」が多い点を認識すべき。 | 各部品ファイル + `*.stories.tsx` 以外での参照を grep → 実利用なし | PoC のスコープを「実証済み部品」と「カタログ提供部品」に分けて明記。または最小セットに絞る。 |

### Low

| # | 重大度 | 指摘 | 根拠 | 推奨対応 |
|---|---|---|---|---|
| L-1 | Low | **`PageDoc` の `onJump` が常に未配線**。`WorkDocView.tsx` は `onJump` を渡さないため `Toc` の onClick は常に未設定で、アンカー遷移はネイティブ `href="#id"` + CSS `scroll-behavior: smooth` 任せ。動作はするが、`onJump` prop が「使われない拡張点」として残る。 | `PageDoc.tsx:18,65`, `WorkDocView.tsx:26-38`（`onJump` 未指定）, `Toc.tsx:27` | 当面はネイティブ遷移で十分。`onJump` を残すなら用途（focus 管理等）をコメント化、不要なら削除。 |
| L-2 | Low | **`Works.stories.tsx` の「資料全体」ストーリーでテーマトグルが no-op**。`onToggleTheme={() => {}}` 固定で、ツールバー globals でしかテーマが変わらない（意図的と読めるがトグルボタンは押せてしまう）。 | `works/Works.stories.tsx:62` | 仕様コメントを添えるか、ストーリー内ではトグルを隠す。 |
| L-3 | Low | **`scripts/screenshot.mjs` が固定 timeout 依存**。`waitForTimeout(300/400)` でテーマ確定を待つのは flaky になりやすい。dev ツール用途なので影響は限定的。 | `scripts/screenshot.mjs:15,24` | `waitForFunction` で `documentElement.dataset.theme` を待つ等、状態ベースに。 |
| L-4 | Low | **`aggregateSources` の重複キーが衝突しうる**。`key = s.href || \`${s.tag}:${s.text}\`` で、href が空かつ tag/text 重複だと別出典が同一視される。現データでは全件 href ありのため実害なし。 | `runtime/resolveWork.tsx:35` | href 必須を型/検証で担保するか、tag を常にキーに含める。 |
| L-5 | Low | **`<a>` の補集合 a11y**: `Sources`/`SourceIndex` の外部リンクは `target="_blank" rel="noopener noreferrer"` 付きで良いが、スクリーンリーダ向けに「新しいタブで開く」旨の補助テキストが無い。 | `Sources.tsx:22`, `SourceIndex.tsx:25` | 視覚的に隠したラベル（例: `<span class="sr-only">（新しいタブ）</span>`）の付与を検討。 |

### Info

| # | 重大度 | 指摘 | 根拠 | 補足 |
|---|---|---|---|---|
| I-1 | Info | **react-markdown の XSS は既定で安全**（検証済み）。`markdown.tsx` でカスタム `a` レンダラに渡る `href` は、react-markdown の `defaultUrlTransform` を**通過済み**で `javascript:`/`vbscript:` 等は除去される。`dangerouslySetInnerHTML` も `rehype-raw` も未使用。`Link` も `href` を素直に `<a href>` へ渡すのみで安全。 | `runtime/markdown.tsx:14-20`, `components/action/Link.tsx:14-23`。出典: react-markdown 公式（④） | 将来 `rehype-raw` 等で生 HTML を許可する場合は `rehype-sanitize` 必須。 |
| I-2 | Info | **markdown 本文は段落/強調/リンクのみ対応**（`remark-gfm` 未導入）。表・箇条書きは markdown ではなく構造ブロック（`table`/`keyPoints` 等）で書く設計と一致。ただし `components.css:380-398` に `.ds-prose ul/ol/li/code/strong` のスタイルがあり、markdown の `-` 箇条書きや `` `code` `` は描画される（GFM 表は不可）。意図どおりか確認推奨。 | `runtime/markdown.tsx:12-21`, `components.css:380-398` | 本文での list/code 使用可否をドキュメント化。 |
| I-3 | Info | **`createRoot(...!)` の非 null 断言**。`#root` 不在時はクラッシュ。SPA エントリでは一般的だが、堅牢化するなら存在チェック+明示エラーも可。 | `src/main.tsx:11` | 任意。 |
| I-4 | Info | **`tsconfig.app.json` の `target: ES2022` だが `tsconfig.node.json` は ES2023**。意図的（node 側を新しめに）と読めるが、混在の理由を一言コメントしておくと親切。 | `tsconfig.app.json:3`, `tsconfig.node.json:3` | 任意。 |
| I-5 | Info | **`doc/` 配下の設計md も旧構成（frontmatter/原稿.md/Zod/parts）を前提**。H-1 と同根。レビュー対象の設計意図としては有用だが、現実装と差分があることに留意。 | `doc/資料作成キット設計.md` ほか | H-1 とまとめて更新。 |

---

## ④ 依存関係 / バージョン検証結果

公式情報源で確認した結果（2026-06-22 時点）。

| パッケージ | 宣言 (`package.json`) | 最新安定（確認値） | 互換・所見 | 出典 |
|---|---|---|---|---|
| react / react-dom | `^19.1.0` | React 19 系が安定 | 問題なし。Storybook 10 は story を iframe 内で React 19 として描画（UI 内部は React 18）。実用上の不具合報告なし。 | https://github.com/storybookjs/storybook/issues/29805 |
| vite | `^6.3.0` | Vite 6 安定（7/8 も存在） | Storybook 10 は Vite 6 をサポート（旧 8.4.x の Vite6 非対応問題は解消済み）。問題なし。 | https://storybook.js.org/docs/builders/vite , https://github.com/storybookjs/storybook/issues/29726 |
| storybook / @storybook/* | `^10.4.6` | 10.3 系がブログ告知、addon-a11y は 10.3.6 等（10.4.x も公開） | バージョン整合（コア/addon が同レンジ）。**Node 要件に注意: Storybook 10 は ESM-only で Node 20.16+ / 22.19+ / 24+ を要求**。README は「Node 20+」とだけ記載 → パッチ下限を明記推奨。 | https://storybook.js.org/blog/storybook-10-3/ , https://www.npmjs.com/package/@storybook/addon-a11y , https://storybook.js.org/docs/releases/migration-guide |
| @storybook/addon-a11y, addon-docs, react-vite | `^10.4.6` | 同上 | `a11y: { test: "error" }`（`preview.tsx:53`）は Storybook 10 の a11y テスト統合に沿う設定。問題なし。 | https://storybook.js.org/blog/storybook-10-3/ |
| tailwindcss / @tailwindcss/vite | `^4.1.0` | v4.1 系安定 | CSS-first（`@import "tailwindcss"` + `@theme` / `@theme inline`）の使い方は v4 公式推奨に合致。Vite プラグイン併用も正。問題なし。 | https://tailwindcss.com/docs (v4 theme/CSS-first) |
| typescript | `^5.8.0` | 5.8 系安定 | 問題なし。 | — |
| react-markdown | `^10.1.0` | 10.1.0（2025-03） | **既定で XSS 安全**（`defaultUrlTransform` がカスタム `a` に渡る href も事前サニタイズ）。`dangerouslySetInnerHTML`/`rehype-raw` 不使用。Node 16+ 要件。問題なし。 | https://github.com/remarkjs/react-markdown |
| zod | `^3.25.0` | 3.25 系（v4 系も存在） | **未使用**（③ H-2）。導入の有無を判断。 | https://zod.dev |
| js-yaml / @types/js-yaml | `^4.1.0` / `^4.0.9` | 4.1 系 | **未使用**（③ H-2）。`yaml.load` 等の危険な使用箇所も存在しない（＝そもそも呼ばれていないため YAML 由来の脆弱性面はゼロ）。 | — |
| eslint / typescript-eslint / @eslint/js | `^9.25.0` / `^8.30.0` / `^9.25.0` | 安定 | flat config 構成。`react-hooks` 不足（③ H-3）。 | https://react.dev (eslint-plugin-react-hooks 推奨) |
| eslint-plugin-import | `^2.31.0` | 安定 | **未設定 = 実質未使用**（③ M-2）。 | — |
| playwright | `^1.61.0`（dev） | 安定 | スクショ専用（dev ツール）。`pnpm.onlyBuiltDependencies` に esbuild を限定する設定も妥当。 | — |

**既知の重大脆弱性**: レビュー範囲の依存・使用法に、既知の重大 CVE に直結する箇所は発見されなかった。最大のセキュリティ面（react-markdown / js-yaml.load / dangerouslySetInnerHTML）はいずれも安全側（前者は既定サニタイズ、後二者は不使用）。

> 注: npm/GitHub Advisory への自動横断スキャンは本レビューでは未実施（推測を避けるため）。CI に `pnpm audit` / Dependabot を組み込むことを推奨。

---

## ⑤ 総評とおすすめ次アクション

### 総評

PoC として狙い（「AI が余白を発明しない／内容と部品が混ざらない」を機械で守る）をよく体現できている。**アーキテクチャ・型安全・アクセシビリティ・テーマ/印刷対応・トークン設計はいずれも水準が高く、Critical/High の脆弱性やランタイムバグは発見されなかった。** 採用バージョンはすべて現行安定で、組み合わせ（React 19 + Vite 6 + Storybook 10 + Tailwind 4）に既知の致命的非互換は無い。

最大の弱点は **コードではなくドキュメント/依存の整合**。README・設計md が「旧アーキ（YAML frontmatter + Zod + parts フォルダ）」のまま残り、それが未使用依存（zod / js-yaml / eslint-plugin-import）とデッドコード（`useTOC`）を生んでいる。実装自体は新アーキ（`doc.tsx` 1宣言）でクリーンなので、ドキュメントと依存を実装に合わせれば一気に締まる。

### おすすめ次アクション（優先順）

1. **（High）README と `doc/` 設計mdを現行実装に全面更新**（H-1）。`doc.tsx` + `defineWork` + `Image` import の手順へ。Node 下限も Storybook 10 要件（20.16+/22.19+/24+）に合わせる。
2. **（High）未使用依存の整理**（H-2, M-2）: `zod` / `js-yaml` / `@types/js-yaml` / `eslint-plugin-import` を削除、または実際に使う形で再導入。
3. **（High）`eslint-plugin-react-hooks` 導入**（H-3）。意図的な依存除外は inline disable で明示。
4. **（Medium）デッドコード削除**（M-1）: `useTOC` と該当 export。
5. **（Medium）DS 部品のスコープ整理**（M-5, M-4）: 実証済み部品とカタログ提供部品を区別、`Region` の body/footer CSS を補うか削る。
6. **（運用）CI に `pnpm audit` / Dependabot と、`pnpm build`（tsc -b）・`pnpm lint`・Storybook a11y を必須ゲート化**。本 PoC の思想（機械で縛る）と完全に整合する。
7. **（任意）`reactDocgen` の既定回帰検討**（M-3）、`onJump`/screenshot timeout 等の Low 項目を時間があるとき清掃。

---

### 出典（本レビューで参照した一次/公式情報源）

- Storybook 10.3 リリース（a11y/Vite対応）: https://storybook.js.org/blog/storybook-10-3/
- Storybook 10 マイグレーション/Node要件: https://storybook.js.org/docs/releases/migration-guide
- Storybook React 19 サポート調査: https://github.com/storybookjs/storybook/issues/29805
- Storybook Vite 6 サポート: https://storybook.js.org/docs/builders/vite , https://github.com/storybookjs/storybook/issues/29726
- @storybook/addon-a11y: https://www.npmjs.com/package/@storybook/addon-a11y
- react-markdown（既定の XSS 安全・urlTransform）: https://github.com/remarkjs/react-markdown
- Tailwind CSS v4 公式: https://tailwindcss.com/docs
- React 公式（eslint-plugin-react-hooks 推奨）: https://react.dev
- zod 公式: https://zod.dev
