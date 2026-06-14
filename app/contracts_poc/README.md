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

## スコープ

- **TS（フロント側）に集中**。codegen ツールは **orval**、越境検知は **dependency-cruiser + ESLint**。
- 検証は **V-1（契約→codegen破壊検知）＋ V-2（越境・改変の機械検知）**。MSW モック・ランタイム検証・サーバ実装(Java/ArchUnit)は対象外だが、構造を保ったまま後付けできる。

## 構成

```
contracts/http/                正の中心（人が書く OpenAPI 契約）
  poc-master-api.yaml          6エンドポイント・{masterId}パラメタライズ・examples必須
  shared/components.yaml       ErrorResponse / Paging / MasterRecord ほか共通スキーマ
orval.config.ts                契約→コードの一方向 codegen 設定（client: fetch / mode: single）
eslint.config.js               V-2: 生fetch/http直書き禁止（消費側 web のみ対象）
.dependency-cruiser.cjs        V-2: レイヤ依存方向・生成物直参照の禁止
packages/api-client/
  src/generated/               orval 出力（コミット対象・手書き改変禁止。唯一 fetch を持つ正規経路）
services/master/web/
  src/app/recordsRoute.ts                      app層（ルーティング/BFF入口の代役。features へ委譲のみ）
  src/features/masterRecords/recordsView.ts    消費コード（生成型に静的依存。破壊が現れる場所）
```

層の依存方向（V-2 で機械強制）: `app → features → @poc/api-client`。逆流・近道・生fetchをすべて lint / dependency-cruiser で塞ぐ。

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
| `pnpm verify` | 上記ゲートを一括（codegen:check → typecheck → lint → depcruise）= ローカル CI 相当 |

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

## codegen ツール選定の記録

| 項目 | 採用 | 理由 |
|---|---|---|
| ツール | **orval 7.21.0** | OpenAPI → TS型 + client（+ 将来 MSW/zod）を一括生成。examples をモック源泉に流用可能 |
| client | `fetch` | 純TSで tsc だけで完結。react-query 依存を持ち込まない |
| mode | `single` | 生成物が1ファイルで `codegen:check` の diff がクリーン |
| mock / zod | off | スコープ外。examples を契約に保持済みなので1スイッチで後付け可 |
| ref解決 | redocly bundle 前段 | 跨ファイル `$ref` の orval 不具合を回避 |

検証時の解決バージョン: orval `7.21.0` / typescript `5.9.3` / @redocly/cli `1.34.15` / prettier `3.8.4`（Node 24 / pnpm 10）。

## 既知の前提・割り切り

- module解決は `bundler`（orval 出力が拡張子なし/ディレクトリ import のため）。型解決は tsconfig `paths` でソース直結（ビルド0）。本番は workspace の exports map を使う想定。
- エラーコード・マスタ名などの値はすべてダミー。利用先の契約に差し替える。
- このPoCは原則使い捨て。持ち越すのは「契約の書き方・codegen設定・破壊テスト手順」。
