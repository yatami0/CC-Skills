# 新方式APIクライアント移行ドキュメント
 
## 概要
 
プロジェクトには2つのAPIクライアント実装が並存している。
 
| 方式 | パス | 状態 |
|---|---|---|
| 旧方式 | `packages/service/src/external/api/` | レガシー。段階的に廃止中 |
| 新方式 | `packages/service/src/external/rest/` | 現在の推奨。新規コードはこちらを使用 |
 
ap-shared のAPI関数（`apApi`）は最初から新方式で実装されており、旧方式は存在しない。旧方式が残存しているのは `packages/service`（PCA Hub共通API）のみ。
 
## 旧方式の構造（`external/api/`）
 
### apiClient.ts
 
- `apiClientFactory` がカリー化された3段関数: `(authApi) => (baseUrl, proxy?) => (metadata) => { get, post, ... }`
- `metadata` は `{ appId: string | null, caseKeysExclude?: ... }`
- `appId` が nullable（`string | null`）
- export: `apiClient` は `(metadata) => { get, post, ... }` の形。呼び出し時に metadata を渡す
```typescript
// 旧方式: apiClient はファクトリ関数
const authApi = apiClient({ appId, caseKeysExclude });
// authApi.get(...), authApi.post(...) で使用
```
 
### 個別API関数（旧方式）
 
カリー化されている。`(apiClient: Api) => async (request) => response` の形を取る。
 
```typescript
// 旧: Api型を受け取るカリー化関数
import { Api } from "@core/external/api/apiClient";
 
export const getAccessCodes =
  (apiClient: Api) => async (): Promise<Response> => {
    const response = await apiClient.get("/g/api/v1/access-codes");
    return response;
  };
```
 
### TenantApiProvider（旧方式の集約レイヤー）
 
- React Context と Provider のパターンを使う。`createContext` と `useContext` でAPI関数を提供する
- `TenantApiProvider` コンポーネントが `appId` を受け取り、`useMemo` 内で全API関数に `apiClient` を注入する
- 消費側は `useTenantApi()` フックでAPIオブジェクトを取得する
```typescript
// 旧: Provider でラップが必要
<TenantApiProvider appId={APP_ID}>
  <App />
</TenantApiProvider>
 
// 旧: フックで取得
const tenantApi = useTenantApi();
await tenantApi.getAccessCodes();
```
 
### 旧方式の問題点
 
- カリー化による冗長性。全API関数が `(apiClient: Api) => ...` でラップされ、ボイラープレートが多い
- Context依存。`TenantApiProvider` のツリー内でしかAPIを呼べず、Reactコンポーネント外からの呼び出しが難しい
- 型の曖昧さ。`appId: string | null`、`RequestBody` が `{}`（空オブジェクト型）で、各メソッドのジェネリクスにデフォルトの `{}` を使う
- eslint-disable の多用。`@typescript-eslint/no-empty-object-type` や `@typescript-eslint/no-explicit-any` などの抑制コメントが大量に存在する
- 二重登録。`TenantApiProvider` 内で全API関数を2回列挙する（Context デフォルト値と useMemo 内）
- テスタビリティ。Context モックが必要になり、テストセットアップが煩雑になる
## 新方式の構造（`external/rest/`）
 
### apiClient.ts
 
- 同じ `apiClientFactory` 構造だが、export 時点で metadata を確定済みにする
- `appId` は環境変数 `VITE_APP_ID` から取得し、ビルド時に固定する
- `caseKeysExclude` も環境変数 `VITE_CASE_KEYS_EXCLUDE` から取得する
- export: `apiClient` は確定済みのHTTPクライアントオブジェクト（`{ get, post, ... }`）
```typescript
// 新方式: apiClient は確定済みオブジェクト
const appId = import.meta.env.VITE_APP_ID || "";
const caseKeysExclude = import.meta.env.VITE_CASE_KEYS_EXCLUDE || "";
 
export const apiClient = apiClientFactory(api(errorInterceptor))(
  baseUrl, proxy(baseUrl)
)({ appId, caseKeysExclude: ... });
```
 
### 個別API関数（新方式）
 
カリー化なし。`async (request) => response` という単純な非同期関数になる。
 
```typescript
// 新: モジュールスコープで apiClient を直接 import
import { apiClient } from "@core/external/rest/apiClient";
 
export const getAccessCodes = async () => {
  const response = await apiClient.get<Response>("/g/api/v1/access-codes");
  return response;
};
```
 
### tenantApi（新方式の集約レイヤー）
 
- プレーンオブジェクトで構成する。Context や Provider は不要で、名前付きエクスポートを集約するだけ
- API関数を import して1つのオブジェクトにまとめる
```typescript
// 新: シンプルなオブジェクト集約
export const tenantApi = {
  getAccessCodes,
  createAccessCode,
  deleteAccessCode,
  // ...
};
 
// 新: 直接 import して使用（Provider 不要）
import { tenantApi } from "@core/external/rest/tenantApi";
await tenantApi.getAccessCodes();
```
 
### apApi（ap固有のAPI集約）
 
ap-shared に配置。構造は `tenantApi` と同じパターン:
 
```typescript
// ap-shared/src/external/rest/apApi.ts
export const apApi = {
  getNode,
  listNodeChildren,
  patchNode,
  // ... 80+ API 関数
};
 
// 使用側
import { apApi } from "@ap-shared/external/rest/apApi";
await apApi.getNode({ nodeId });
```
 
## 差分比較表
 
| 観点 | 旧方式（`external/api/`） | 新方式（`external/rest/`） |
|---|---|---|
| apiClient の export | ファクトリ関数 `(metadata) => client` | 確定済みオブジェクト `client` |
| appId の解決 | 実行時に Provider/呼び出し元から渡す | ビルド時に環境変数で確定 |
| 個別API関数 | カリー化 `(api) => (req) => res` | フラット `(req) => res` |
| 集約レイヤー | Context + Provider + useHook | プレーンオブジェクト export |
| React ツリー依存 | あり（Provider 必須） | なし（どこからでも import 可能） |
| 型の厳密さ | `appId: string \| null`、`RequestBody = {}` | `appId: string`、`RequestBody = Record<string, any>` |
| eslint-disable | 大量に存在 | 大幅に削減 |
| テスタビリティ | Context モックが必要 | モジュールモックのみ |
| ボイラープレート | API関数ごとにカリー化ラッパー + Provider内で二重登録 | API関数はフラット + 集約は単純リスト |
| ファイルサイズ | apiClient.ts: 620行 | apiClient.ts: 571行 |
 
## 型定義の改善
 
### 旧方式
```typescript
// 曖昧な型エイリアス
export type QueryParameter = { [key: string]: any };
export type RequestBody = {};  // ← eslint-disable 必要
export type HeaderOption = { [key: string]: string };
 
// RequestMetadata が nullable
type RequestMetadata = {
  appId: string | null;
  caseKeysExclude?: (string | RegExp)[];
};
```
 
### 新方式
```typescript
// Record ベースの明確な型
type HeaderOptions = Record<string, string>;
type ResponseData = Record<string, unknown>;
type QueryParameter = Record<string, any>;
type RequestBody = Record<string, any>;
 
// RequestMetadata が non-nullable
type RequestMetadata = {
  appId: string;  // null 不可
  caseKeysExclude?: (string | RegExp)[];
};
```
 
## NoAuthApi（認証不要サイト向け）の変化
 
### 旧方式
```typescript
// apiClient を生成してカリー化関数に注入
const authApi = apiClient({ appId: null });
return {
  verifyAccessCode: verifyAccessCode(authApi),
  createUserByAccessCode: createUserByAccessCode(authApi)(header),
};
```
 
### 新方式
```typescript
// apiClient の注入が不要。ヘッダーだけ渡す
return {
  verifyAccessCode,  // そのまま使える
  createUserByAccessCode: createUserByAccessCode(header),
};
```
 
新方式では `useNoAuthApi` フックと `NoAuthApiFactory` 関数を分離し、React 外からも呼べるようにした。旧方式の `NoAuthApiFactory` 内で `useMemo` を使っていた問題（React ルール違反）も解消している。
 
## サイト別の移行状況
 
| サイト | tenantApi（PCA Hub共通） | apApi（ap固有） | 残存する旧方式 |
|---|---|---|---|
| ap-sys | 新方式のみ | 新方式 | なし |
| ap-c | 新方式が主 | 新方式 | 一部（通知系で旧方式の残存なし） |
| ap-c-sp | 新方式が主 | 新方式 | 4ファイル（通知系で `useTenantApi` 残存） |
| ap-delivery | — | 新方式 | なし |
| ap-shared | — | 新方式のみ（旧方式は存在しない） | なし |
| packages/service | 新旧並存 | — | 旧: `TenantApiProvider.tsx`, `apiClient.ts` |
 
### ap-c-sp の残存箇所（4ファイル）
- `useUnreadCountPollingEffect.ts` / `.test.ts`（未読数ポーリング）
- `useNotificationModal.ts` / `.test.ts`（通知モーダル）
いずれも `useTenantApi()` を使っており、`tenantApi` への直接 import に置換できる。
 
## 移行パターン
 
### API関数の移行（1ファイル単位）
 
旧:
```typescript
import { Api } from "@core/external/api/apiClient";
 
export const getResource =
  (apiClient: Api) =>
  async (request: Request): Promise<Response> => {
    return await apiClient.get<Response>(`/path/${request.id}`);
  };
```
 
新:
```typescript
import { apiClient } from "@core/external/rest/apiClient";
 
export const getResource = async (request: Request) => {
  return await apiClient.get<Response>(`/path/${request.id}`);
};
```
 
変更点:
1. import を `api/apiClient` → `rest/apiClient` に変更する
2. カリー化の外側関数 `(apiClient: Api) =>` を削除する
3. `apiClient` をモジュールスコープの import に変更する
4. eslint-disable コメントを削除する（不要になるため）
### 消費側の移行
 
旧:
```typescript
import { useTenantApi } from "@core/external/api/TenantApiProvider";
const tenantApi = useTenantApi();
await tenantApi.getResource(request);
```
 
新:
```typescript
import { tenantApi } from "@core/external/rest/tenantApi";
await tenantApi.getResource(request);
```
 
変更点:
1. import 先を `api/TenantApiProvider` → `rest/tenantApi` に変更する
2. `useTenantApi()` フック呼び出しを削除し、直接 import で使う
3. Provider のツリー配置が不要になる
## 設計判断の背景
 
### なぜ Context/Provider から脱却したか
 
- appId の固定化。環境変数でビルド時に決められるため、ランタイムでの DI が不要になった
- React ツリー外からの呼び出し。Jotai の `useAtomCallback` 内から API を呼ぶ場合、Context に依存しない方が扱いやすい
- テストの簡素化。`vi.mock("@core/external/rest/tenantApi")` だけで済む
- ボイラープレートの削減。Provider 内での二重登録やカリー化ラッパーが不要になった
### なぜ完全移行が未完了か
 
- 通知系の機能は `useTenantApi()` 経由で呼ばれており、テストも含めて移行が必要になる
- 移行は機能改修のタイミングで段階的に進める方針
## 別プロジェクトに持ち込める考え方
 
### APIクライアントはモジュールスコープで確定させる
認証トークンのような動的な値も、取得関数をクロージャに閉じ込めれば Context は要らない。環境ごとの差異は環境変数で吸収する。
 
### API関数はフラットな非同期関数にする
カリー化による DI（`(client) => (req) => res`）は柔軟だが、実際にはクライアントインスタンスが1つしかない場合が多い。フラットな関数にした方がコード量が減り、型推論も効きやすい。
 
### 集約レイヤーはプレーンオブジェクトで十分
React Context による DI は、アプリ全体で1つだけ使うAPIクライアントのようなものには過剰になる。プレーンオブジェクトの export で足り、tree-shaking も効く。
 
### 移行は段階的に行い、旧方式は物理的に残す
旧ディレクトリ（`external/api/`）を削除せず、新ディレクトリ（`external/rest/`）を並行して作る。消費側を1ファイルずつ移行し、旧方式の参照がゼロになったら削除する。
 
### 環境変数でビルド時に固定できるものは固定する
`appId` のようにデプロイ先ごとに異なるがランタイムでは変わらない値は、環境変数で注入する。これで Provider ツリーの深さが減り、テストもしやすくなる。