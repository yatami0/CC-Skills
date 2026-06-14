# 契約駆動開発 PoC — codegen 破壊検知（汎用テンプレート）

OpenAPI 契約を一次情報とし、そこから型・API クライアントを生成する「契約駆動開発」を、実際に動く最小構成で実証する汎用 PoC。

検証する仮説（V-1）:
**人が契約を変更 → 再生成 → 消費コードがコンパイルエラーで止まる。**
契約と実装のドリフトを、人のレビューではなく機械（型チェック）が落とすことを示す。

> このPoCは特定プロジェクトに依存しない汎用テンプレートとして使うことを想定している。
> 値（マスタ名・エラーコード等）はすべてダミー。利用先の契約に差し替えて再利用できる。

検証する仮説（V-2・追加）:
**生fetch直書き／レイヤ違反／生成物の手書き改変を、機械（lint・構造解析・差分）が CI で落とす。**
実装側の「配線ミス（経路逸脱・層の逆流）」もレビュー任せにせず機械ゲートで塞ぐ。詳細は [doc/v-2/基本設計.md](doc/v-2/基本設計.md)。

検証する仮説（V-3・追加）:
**BE未完成の状態で、契約から生成した MSW モックだけで FE の経路結合テストが通る。**
モックを手書きせず契約 examples から生成することで「モックと本番の乖離」を構造的に消し、FE を BE ゼロで作り進められる。詳細は [doc/v-3/基本設計.md](doc/v-3/基本設計.md)。

検証する仮説（V-5・追加）:
**マスタ個別の画面コードなしで、メタ定義の差し替えだけで 2 種類のマスタ画面が動く。**
契約のメタ定義（項目名・型・必須・コード値）を汎用エンジン（`@poc/ui-engine`）が解釈し、同一の `<MasterCrudPage>` 1 本が dept / price 両マスタを描画する（ADR-0003）。これにより V-3 が経路（データ）結合から**画面（render→DOM）結合**へ昇格する。詳細は [doc/v-5/基本設計.md](doc/v-5/基本設計.md)。

> 注: 本 PoC はまだ React/Next 未導入のため、結合するのは「契約→モック→生成client→消費(app/features)」という**経路(データ)結合**。React 描画(render→DOM)＝"画面"の結合は ui-engine 実装(V-5)の領域。親仕様の合格基準「画面結合テスト」を、本 PoC は経路結合テストとして実装している。ランナー(Vitest)も暫定で、V-5 で本決めする。

## スコープ

- **TS（フロント側）に集中**。codegen ツールは **orval**、越境検知は **dependency-cruiser + ESLint**、モック/結合テストは **MSW + Vitest**。
- 検証は **V-1（契約→codegen破壊検知）＋ V-2（越境・改変の機械検知）＋ V-3（モックによる並行開発）**。ランタイム検証・サーバ実装(Java/ArchUnit)は対象外だが、構造を保ったまま後付けできる。

## 構成

```
contracts/http/                正の中心（人が書く OpenAPI 契約）
  poc-master-api.yaml          6エンドポイント・{masterId}パラメタライズ・examples必須
  shared/components.yaml       ErrorResponse / Paging / MasterRecord ほか共通スキーマ
orval.config.ts                契約→コードの一方向 codegen 設定（client: fetch / mode: split / V-3: MSW mock on）
eslint.config.js               V-2: 生fetch/http直書き禁止（消費側 web のみ対象）
.dependency-cruiser.cjs        V-2: レイヤ依存方向・生成物直参照の禁止
vitest.config.ts               V-3: MSW モックだけで回す FE 結合テスト設定（node 環境）
packages/api-client/
  src/generated/poc.ts         orval 出力。型付き fetch クライアント（msw 非依存＝本番経路は純粋）
  src/generated/poc.msw.ts     orval 出力。MSW ハンドラ（V-3・mock 専用入口。テストが import）
  src/generated/model/         orval 出力。型（poc.ts / poc.msw.ts が共有）
                               ※ generated/ はコミット対象・手書き改変禁止（唯一 fetch を持つ正規経路）
packages/ui-engine/            V-5: メタ定義→CRUD画面の汎用レンダラ（マスタ個別コードなし・API/状態非依存）
  src/types.ts                 エンジンのドメイン型（MasterUiMeta/RecordRow/AppError。generated に非依存）
  src/buildSchema.ts           メタ定義→Zod スキーマ（必須/型をメタから機械導出）
  src/MetaForm.tsx             メタ駆動フォーム（型→入力UI・RHF+Zod・必須エラーをインライン表示）
  src/MasterList.tsx           メタ駆動一覧（カラムをメタから・セルを項目名で引く）
  src/MasterCrudView.tsx       一覧＋登録/編集フォームの合成（V-5 の主役・props 駆動の純粋描画層）
services/master/web/
  src/app/recordsRoute.ts                      app層（V-3 経路結合用の薄いルーティング代役）
  src/app/MasterCrudPage.tsx                   V-5: メタ駆動 CRUD ページ（masterId 差し替えで全マスタ対応）
  src/features/masterRecords/recordsView.ts    消費コード（生成型に静的依存。V-1 破壊が現れる場所）
  src/features/masterRecords/mappers.ts        V-5: generated 型 ⇄ エンジン型の写像（契約への静的依存=V-1 波及点）
  src/features/masterRecords/hooks/            V-5: useMasterCrudState（読み取り）/ useMasterCrudAction（書込+API+エラー）
  src/store/masterStore.ts                     V-5: グローバル状態（Jotai Atom。store/ に集約）
  test/setup.ts                                V-3: 契約由来 MSW ハンドラで server 起動（BE 不要）
  test/path.msw.test.ts                        V-3: 経路結合テスト（app→features→api-client→MSW）
  test/screen.v5.test.tsx                      V-5: 画面結合テスト（render→DOM。同一ページが2マスタを描画）
```

層の依存方向（V-2 で機械強制）: `app → features → @poc/api-client`。逆流・近道・生fetchをすべて lint / dependency-cruiser で塞ぐ。
V-5 で `app → @poc/ui-engine`（描画）と `features → store`（状態）が加わるが、いずれも生成物 generated/ には触れず、契約への接点は features（mappers）に限定する。

設計上の約束（汎用原則）:

- **契約 → コードの一方向**。コードから契約を生成しない。
- 生成物（`packages/api-client/src/generated/`）は**手書きで改変しない**。再生成で上書きされる前提。
- 消費側は**生 fetch を書かず、必ず生成 api-client 経由**で API に触れる（経路を1本に絞る）。
- マスタ別にパスを増やさず、エンドポイントは `{masterId}` でパラメタライズする（メタ定義駆動）。
- 跨ファイル `$ref` は `@redocly/cli` で単一ファイルへバンドルしてから orval に渡す（`contracts/.bundled/` は build 成果物で gitignore、分割yamlが正）。

## スクリプト

| script | 役割 |
|---|---|
| `pnpm bundle` | 契約を単一ファイルへバンドル |
| `pnpm codegen` | bundle → orval 生成 → prettier 整形（出力をバイト安定化） |
| `pnpm codegen:check` | 再生成して `git diff --exit-code`（生成物ドリフト/手書き改変を検知。V-1/V-2 共通） |
| `pnpm typecheck` | `tsc --noEmit`（strict）。V-1 の機械ゲート |
| `pnpm lint` | ESLint。生fetch/http直書きを検知（V-2） |
| `pnpm depcruise` | dependency-cruiser。レイヤ違反・生成物直参照を検知（V-2） |
| `pnpm test` | Vitest。MSW モックだけで FE 経路結合テスト（V-3） |
| `pnpm verify` | 上記ゲートを一括（codegen:check → typecheck → lint → depcruise → test）= ローカル CI 相当 |

## セットアップ

```bash
pnpm install
pnpm codegen
pnpm typecheck            # 期待: 終了コード 0（緑）
```

## V-1 破壊テスト

```bash
# (0) ベースラインをコミット（codegen:check が git diff で比較できるように）
git add -A && git commit -m "poc: baseline generated client (green)"

# (1) 人が契約 yaml のみ改変
#     contracts/http/shared/components.yaml の MasterRecord.unitPrice を unitPriceJpy にリネーム

# (2) 再生成 → 型チェック
pnpm codegen
pnpm typecheck
#   期待: 非ゼロ終了。消費コードは未編集なのに以下で止まる:
#   recordsView.ts: error TS2551: Property 'unitPrice' does not exist on type 'MasterRecord'.

# (3) 復帰
git checkout -- contracts/http/shared/components.yaml
pnpm codegen
pnpm typecheck            # 緑に戻る
```

**実測結果（このPoCで確認済み）**

| ステップ | typecheck 終了コード |
|---|---|
| ベースライン | `0`（緑） |
| `unitPrice` リネーム後 | `2` … `TS2551 Property 'unitPrice' does not exist on type 'MasterRecord'` |
| 復帰後 | `0`（緑） |

他の破壊例: `UpdateRecordRequest` から `version` を削除すると、`recordsView.ts` の `bumpPrice` が渡す object literal が必須プロパティ欠落でコンパイルエラーになる（楽観排他項目の契約逸脱を検知）。

> `codegen:check` を意味あるものにするには (0) のベースラインコミットが必須（`git diff --exit-code` は tracked ファイルのみ比較する）。未コミット状態では生成物が untracked のため vacuously pass する点に注意。

## V-2 破壊テスト（越境・改変の機械検知）

実装側の配線ミス（生fetch直書き・層の逆流・近道）を機械が落とすことを確認する。実測値は [doc/v-2/検証メモ.md](doc/v-2/検証メモ.md)。

```bash
# A. 生fetch直書き → ESLint で落ちる
#    services/master/web/src/features/.../foo.ts に `await fetch("/api/...")` を書く
pnpm lint        # 期待: 非ゼロ。no-restricted-globals / no-restricted-syntax

# B. app が generated を直叩き（層飛ばし） → dependency-cruiser で落ちる
#    services/master/web/src/app/foo.ts で `@poc/api-client/generated/poc` を import
pnpm depcruise   # 期待: 非ゼロ。app-must-go-through-features / generated-only-...

# C. features が app を逆 import（方向逆流） → dependency-cruiser で落ちる
pnpm depcruise   # 期待: 非ゼロ。features-no-reverse-to-app

# D. generated を手で書き換え → codegen:check で落ちる（V-1 と同じ仕組み）
pnpm codegen:check

# 一括（ローカル CI 相当）
pnpm verify      # codegen:check → typecheck → lint → depcruise
```

| 破壊操作 | 落とすゲート | 実測 終了コード |
|---|---|---|
| 生fetch直書き | `pnpm lint` | `1` |
| app→generated 直叩き | `pnpm depcruise` | `2` |
| features→app 逆流 | `pnpm depcruise` | `1` |
| generated 手書き改変 | `pnpm codegen:check` | 非ゼロ（V-1） |

> 集約スクリプトは `verify`。`ci` という名前は `pnpm ci`（pnpm 組み込みの clean install）と衝突するため避けている（`pnpm run ci` なら可）。

## V-3 検証（モックによる並行開発）

契約 examples から生成した MSW モックだけで、BE を起動せず FE の経路結合テストが通ることを確認する（React 描画＝"画面"の結合は V-5 領域。親仕様の「画面結合テスト」を経路結合として実装）。実測値は [doc/v-3/検証メモ.md](doc/v-3/検証メモ.md)。

```bash
# (1) モック生成を on にして再生成（orval.config.ts: mode:split + mock={type:"msw",useExamples:true}）
pnpm codegen
#   → poc.msw.ts に MSW ハンドラ + getPoCMasterAPIMock() が契約 examples を本文として生成
#     （client は poc.ts に分離。poc.ts は msw を import しない＝本番経路は純粋）

# (2) BE を一切起動せず、経路結合テストを実行
pnpm test        # 期待: 終了コード 0。app→features→api-client→fetch→MSW を一気通貫で通す
#   ✓ services/master/web/test/path.msw.test.ts (4 tests)

# (3) 一括（ローカル CI 相当）
pnpm verify      # codegen:check → typecheck → lint → depcruise → test
```

| 検証観点 | 手段 | 実測 |
|---|---|---|
| MSW モックだけで経路結合テストが通る | `pnpm test`（BE プロセス無し） | `0`（4 tests passed） |
| モックの源泉が契約 examples | orval `useExamples: true` | 期待値が契約 yaml と一致 |
| 本物 BE を叩いていない | MSW `onUnhandledRequest:"error"` | 契約外通信は即エラー |
| モックと契約の乖離が起きない | V-1 `codegen:check` + 型破壊の波及 | 契約変更→モック再生成→`tsc` で露見 |

> モックと本番は同じ生成 api-client 1本（V-2）を通るため、BE 完成時は「向き先の差し替え」だけで FE は不変。
> テストハーネス（`web/test/**`）は V-2 の生fetch禁止ルールの対象外（ブラウザの origin を補うため意図的に `globalThis.fetch` を扱う）。

## V-5 検証（メタ定義駆動 UI・画面結合）

契約のメタ定義だけで、**マスタ個別の画面コードを 1 行も書かずに** 2 種類のマスタ画面が動くことを、React の render→DOM で確認する。これにより V-3 の「経路結合」が「画面結合」へ昇格する。実装は `@poc/ui-engine`（汎用レンダラ）＋ `services/master/web`（Jotai 状態・features フック・app ページ）。

```bash
# 画面結合テスト(jsdom)。同一の <MasterCrudPage> を masterId だけ替えて 2 マスタ描画する。
pnpm test        # 期待: 0。screen.v5.test.tsx (4 tests) + path.msw.test.ts (4 tests)

# 一括(ローカル CI 相当)
pnpm verify      # codegen:check → typecheck → lint → depcruise → test
```

| 検証観点 | 手段 | 実測 |
|---|---|---|
| 同一画面コードが 2 マスタを描画（マスタ個別コードなし） | `<MasterCrudPage masterId>` を dept/price で render→DOM | dept=code(select)+name / price=name+unitPrice(number)+effectiveDate(date) |
| 入力 UI・カラムがメタ駆動 | メタの type→入力UI / fields→列 を DOM 断言 | dept に unitPrice 列なし・price に code 入力なし |
| バリデーションがメタ駆動 | メタの required→Zod を `buildSchema` で導出 | 必須未入力で「name は必須です」等をインライン表示・送信されない |
| 画面結合（render→DOM）でモックと結合 | createRecord→MSW→一覧反映 | 登録で契約 example（Eraser）が一覧に追加 |
| 契約破壊が画面側まで波及（V-1 継続） | `codeValues` リネーム→再生成→`tsc` | `mappers.ts` が TS2339 で停止（メタ駆動経路も契約に縛られる） |

設計上のポイント:

- **ui-engine は generated/ にも特定マスタにも依存しない**汎用描画層。契約の生成型 `MasterMeta` → エンジン型 `MasterUiMeta` の写像は features 層（`mappers.ts`）が一手に担い、契約への静的依存＝V-1 の波及点をそこへ集約する（dependency-cruiser: `generated-only-via-sanctioned-consumers` を満たす）。
- 状態は Jotai に集約（`store/`）。読み取り `useMasterCrudState` と書込 `useMasterCrudAction` を分離（06-state-and-hooks）。API 呼び出しは Action フック内のみ・生成 api-client 経由のみ（V-2）。
- フォームは React Hook Form + Zod。Zod スキーマは**メタ定義から機械導出**（`buildSchema.ts`）し、マスタごとに手書きしない。
- Rules of Hooks は `eslint-plugin-react-hooks`（rules-of-hooks / exhaustive-deps を error）で機械検知する。

> メタの源泉について: orval の `useExamples` は契約の**先頭 example のみ**モック化するため、既定ハンドラが返すメタは常に `dept`（example #1）。2 つ目の `price`（example #2）は契約と同値のメタを MSW ハンドラ override で供給する（既存テストが 404 を override するのと同じ流儀）。画面コードはメタの出所に依存しないため不変。
> 本 PoC は full Next.js を導入せず React + Testing Library で render→DOM を成立させる（ランナーは Vitest で本決め）。Next ルーティング/RouteHandler の配線は本番化の関心事。

## codegen ツール選定の記録

| 項目 | 採用 | 理由 |
|---|---|---|
| ツール | **orval 7.21.0** | OpenAPI → TS型 + client + MSW モックを一括生成。examples をモック源泉に流用 |
| client | `fetch` | 純TSで tsc だけで完結。react-query 依存を持ち込まない |
| mode | `split` | client(poc.ts)と mock(poc.msw.ts)をファイル分離。**本番 client を msw 非依存に保つ**（V-3 で single→split に変更。経緯は doc/v-3/技術調査.md §1.5） |
| mock | **on（type: msw / useExamples / delay:false）** | V-3。契約 examples を本文に。faker 乱数を使わず期待値を契約に固定 |
| mock の置き場所 | api-client 内に **split**（別パッケージ msw-mocks は見送り） | orval は mock 単独生成不可で別パッケージ化は型を二重生成するため。本番は出力先分離で昇格 |
| zod | off（生成）/ V-5 で UI 側に手動採用 | 契約↔モックは codegen が守る。UI フォームのバリデーションは `buildSchema` でメタから Zod を導出（生成 zod とは別軸） |
| 結合テスト | **MSW 2 + Vitest 2（node 経路 / jsdom 画面）** | 生成ハンドラをそのまま `setupServer`。V-3 は node の経路結合、V-5 は jsdom の render→DOM 画面結合 |
| UI（V-5） | **React 19 + RHF 7 + Zod 3 + ts-pattern 5 + Jotai 2** | メタ駆動 CRUD。@testing-library/react で render→DOM。esbuild の automatic JSX で plugin-react を足さず完結 |
| ref解決 | redocly bundle 前段 | 跨ファイル `$ref` の orval 不具合を回避 |

検証時の解決バージョン: orval `7.21.0` / typescript `5.9.3` / @redocly/cli `1.34.15` / prettier `3.8.4`（Node 24 / pnpm 10）。

## 既知の前提・割り切り

- module解決は `bundler`（orval 出力が拡張子なし/ディレクトリ import のため）。型解決は tsconfig `paths` でソース直結（ビルド0）。本番は workspace の exports map を使う想定。
- エラーコード・マスタ名などの値はすべてダミー。利用先の契約に差し替える。
- 生成 api-client が相対 URL で fetch するため、node 結合テストでは origin が無い。本番クライアントに baseUrl を焼かず、テスト側（`web/test/setup.ts`）でブラウザ相当の origin を補う。jsdom（V-5）でも同じ shim で吸収する。
- V-5 のメタ駆動エンジンは「一覧＋登録/編集フォーム」のみ（検索条件・項目間連動は対象外）。レコード契約は単一固定形のため、書込（Create/Update）の往復は契約と一致する `price` マスタで実証する。
- このPoCは原則使い捨て。持ち越すのは「契約の書き方・codegen設定・破壊テスト手順・モックを生成する設計（examples必須運用）・ui-engine のメタ駆動設計（メタ→入力UI/Zod/一覧の機械導出）」。
