# API 契約: 型インターフェースの定義方針

バックエンドは外部APIとして提供される。本リポジトリは型を定義して消費するだけで、API仕様自体は変更できない。
ここでの契約とは、BEの入出力を写し取った TypeScript 型を指す。

## 出典と前提
- TypeScript 公式: 型は静的でコンパイル時のみ。実行時のAPIレスポンスは型では保証されない。
- Zod 公式: スキーマで実行時バリデーション(本プロジェクト採用済み, `^3.22.3`)。

## 原則
- API の入出力型は `@core/external/api/` に定義する。機能固有の API という括りは作らず、共通定義に集約する。
- `any` で受けない。不明な形でも最小限の具体型を定義する(`04-typescript.md` の no-any)。
- 境界(API型)に触れる変更は plan で必ず明示し、人間レビューを必須とする。FE単独の都合で型を実態と乖離させない。
- API仕様(BE提供のスキーマ/OpenAPI等)が一次情報。型を通すために実態と違う型へ歪めない。

## 実行時バリデーション(本プロジェクトは Zod 採用)
- TypeScript の型はコンパイル時のみ。実行時のレスポンス保証は Zod スキーマで行う。
- フォームは React Hook Form + `@hookform/resolvers`(Zod ⇔ RHF ブリッジ)で組み、入力バリデーションも Zod に統一する。
- 型と Zod スキーマの二重管理を避けたい箇所は `z.infer` で型をスキーマから導出する。

## ケース変換
- レスポンス/リクエストのケース変換は `camelcase-keys` / `snakecase-keys` に任せる。
- BE が snake_case、FE 内部は camelCase。境界(`@core/external/rest`)で変換し、ドメイン型は camelCase で扱う。

## クライアント実装の置き場所と責務
- REST クライアントは `@core/external/rest/`(共通) / `@shared/external/rest/`(ドメイン固有)。
- クライアントは純粋関数で書き、React フックに依存させない。呼び出すのはフック側(`useXxxAction`)。
- UIから直接 fetch しない。API 呼び出しは必ず `useXxxAction` 経由(`06-state-and-hooks.md`)。

## エラーの扱い
- API エラーは型クラス `ApiError` で構造化し、エラーコードで分岐する。
- 遷移 / スナックバー / ログ送信は `useErrorAction` または各アプリの `useXxxErrorHandlingAction` に一元化する。

## 変更手順
1. BE提供のAPI仕様(スキーマ/OpenAPI等)を一次情報として確認
2. `@core/external/api/` の型と対応する Zod スキーマを更新
3. 影響する `useXxxAction` と呼び出し箇所を洗い出し plan に列挙
4. 型チェックとテストを通す(`05-enforcement.md`)
