# 構造の地図

スコープを絞っても全体整合が崩れないための置き場所の対応表。変更の種類から置き場所を一意に引けるようにする。

## トップレベル(モノレポ)
```
root/
├── packages/service/   # @core 共通基盤(git submodule / 別リポジトリ)
├── app/                # @app メインアプリ(デスクトップ/モバイル統合)
├── app-admin/          # @app-admin 管理者向け
├── app-external/       # @app-ext 外部公開向け
├── shared/             # @shared アプリ間共有
├── patches/            # サードパーティパッチ
└── scripts/            # ビルド / CI
```
- 依存はルート `package.json` に集約。各アプリの package.json はスクリプト定義のみ。
- デスクトップ/モバイルでアプリやコードを分けない。単一 `app` がレスポンシブで両対応。

## パスエイリアス
```
@core/*   → packages/service/src/*
@shared/* → shared/src/*
@app/*    → app/src/*   (自分自身。アプリごとに @ap 等)
```
`tsconfig.json` の `paths` と `vite.config.ts` の `resolve.alias` は二重に定義する(型チェックとビルドの両方で解決させるため)。

## @core 内部(Atomic Design = ライブラリ層)
```
packages/service/src/
├── components/  atoms/ molecules/ organisms/ templates/ pages/
├── domain/      auth/ constants/ types/
├── external/    api/(API型定義) rest/(RESTクライアント) datadog/ storage/
├── hooks/  store/  error/  lib/  i18n/  tests/
```
- 参照は下位→上位の一方向(atoms→molecules→organisms→templates)。
- Atomic Design は @core 内だけで使う。アプリ層はこの分類を引き継がない。

## アプリ層(ページコロケーション = アプリ層)
```
app/src/
├── pages/XxxPage/
│   ├── XxxPage.tsx     # 本体。hooks を組み立てて画面を構成するだけ
│   ├── components/     # ページ固有コンポーネント
│   ├── dialogs/        # ページ固有モーダル / ドロワー
│   └── hooks/          # ページのドメインロジック(API呼び出しもここ)
├── routes/  components/(ルートガード) hooks/
├── providers/  store/(グローバル Jotai Atom)  i18n/  styles/
```
- アプリ直下に `components/` `dialogs/` `hooks/` を置かない。すべてページ配下へ。
- UIは `@core` の atom〜organism を組み立てて作る。アプリ側で atom を自前定義しない。

## この種の変更はどこに置くか
| 変更の種類 | 置き場所 |
| --- | --- |
| 新しい画面 | `app/src/pages/XxxPage/` |
| ページ固有コンポーネント | `app/src/pages/XxxPage/components/` |
| ページ固有モーダル/ドロワー | `app/src/pages/XxxPage/dialogs/` |
| ページのドメインロジック / API呼び出し | `app/src/pages/XxxPage/hooks/` |
| グローバル状態(Atom) | `app/src/store/` |
| 複数ページで使う部品 | `@shared/components/` へ昇格 |
| 全アプリで使うUIプリミティブ | `@core/components/`(Atomic Design 粒度で配置) |
| API の型定義 | `@core/external/api/` |
| REST クライアント実装 | `@core/external/rest/`(共通) / `@shared/external/rest/`(ドメイン固有) |
| 共通カスタムフック | `@core/hooks/` |
| 認証 / OIDC | `@core/domain/auth/` |
| ルート定義 | 各アプリ `routes/`(`createBrowserRouter` + `createRoutesFromElements`) |
| ルートガード | `routes/components/`(`PrivateRoute`) |
| Context プロバイダ | `app/src/providers/` |

## 共有化の昇格基準
- 複数ページ、または2アプリ以上から参照 → `@shared` へ
- 全アプリ共通 → `@core` へ
- アプリ直下に共有置き場を作らないことで昇格を強制する。

## 依存方向(UI → Logic → Data の一方向)
```
Presentation  pages/XxxPage → XxxPage/components, dialogs → @core/components(atoms〜templates)
Logic         pages/XxxPage/hooks → @core/hooks ,  store → @core/store
Data          @shared/external/rest → @core/external
Cross-cutting error / i18n / lib / providers
```
- 逆向き禁止。共通層(`@core`/`@shared`)→ アプリ `pages/` の向きにだけ流す。共通層はアプリを参照しない。
- アプリ間の直接参照禁止(`import/no-restricted-paths` で機械強制)。
- UIから直接 fetch する箇所を作らない。API は必ず `useXxxAction` 経由。

## スコープ境界(1サイクルのルール)
- 1サイクルで触れてよいのは宣言したディレクトリのみ。またぐとき、または昇格が必要なときは手を止めて報告する。
- ルーティングはコード定義ベース(ファイルベースではない)。`/ap` `/aps` `/apv` のプレフィックスでアプリを分ける。
