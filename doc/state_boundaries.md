# 状態管理の境界線設計
 
## 使われている状態管理手段
 
| 手段 | ライブラリ / API | 典型的な使用箇所 |
|---|---|---|
| クライアントグローバル状態 | Jotai (v2.10.3+) | ログインユーザー、一覧データ、チェック状態、ソート設定、ローディング、ドロワー開閉、プレビュー状態など、アプリの大半の状態 |
| 永続化付きグローバル状態 | Jotai `atomWithStorage` | ソート設定、表示モード（リスト/サムネイル）、サイドメニューの展開状態。ユーザー別にキーを振ってlocalStorageと自動同期する |
| フォーム状態 | React Hook Form (v7系) + Zod | 名前変更モーダル、フォルダ作成、検索フォーム、プロパティ編集。モーダルやフォームの閉じた世界で完結する |
| URL状態 | react-router-dom v7 `useParams` / `useSearchParams` | ノードID（パスパラメータ `/:nodeId`）、バージョン指定 `?v=`、スクロール対象 `?select=`、検索クエリ `?query=`、検索対象 `?target=` |
| クライアントローカル状態 | `useState` / `useRef` | ズーム状態、タッチイベント管理、ポーリング進捗参照、DOM参照。UIコンポーネント固有の一時的な状態 |
| React Context | `createContext` + Provider | ポータル（モーダル/スナックバー/ツールチップ）の表示制御、認証情報(OIDC)、アプリ初期化データ（ユーザー、ライセンス、テナント）、非同期セッション管理（OCR/タイムスタンプ/ZIP） |
| サーバー状態 | なし（TanStack Query/SWR 未採用） | サーバーから取得したデータは Jotai atom に直接格納する |
| ローカルストレージ直接操作 | 独自 `localStorageService` | 表示モード、カラム検索条件。Jotai atom とローカルストレージを手動で二重管理する（デスクトップ版のみ） |
 
### 不使用の手段
- TanStack Query / SWR: 未採用。サーバーキャッシュ層は存在しない
- Redux / Zustand: 未採用
- Next.js Server Component: 未採用（Vite SPA構成）
---
 
## 使い分け基準
 
### サーバー状態 vs クライアント状態
 
線引きとして、このプロジェクトにはサーバー状態を表す概念レイヤーが存在しない。APIから取得したデータは、ドメインフック内でAPIを呼び出し、その結果を直接 Jotai atom に `set` するパターンで統一している。
 
```
API呼び出し（apApi.xxxxx）
  → set(一覧atomやエンティティatom, レスポンスデータ)
```
 
キャッシュ無効化やリフェッチは、ドメインフック内の `refreshXxxList()` のような明示的な再取得関数で手動制御する。stale-while-revalidate のような自動キャッシュ戦略は存在しない。
 
判断基準（推測）として、プロジェクト開始時点でTanStack Queryが一般的でなかったか、Jotaiに寄せて統一したいという方針を優先したと考えられる。
 
### Jotai atom vs useState
 
判断基準は次のとおり。
 
| 条件 | 選択 |
|------|------|
| 複数コンポーネントから参照/更新される | Jotai atom |
| ページ遷移をまたいで保持が必要 | Jotai atom |
| ドメインフック内でAPI結果を格納する | Jotai atom |
| UIコンポーネント1つの中で閉じる一時状態 | `useState` |
| DOM参照やアニメーション制御 | `useRef` |
 
具体例:
- atom: 一覧データ、チェック状態、ソート設定、ドロワー開閉、ローディングスタック
- useState: ズーム中フラグ、ポーリング状態、フォームのローカルUI状態
### URL state vs メモリ state
 
URLに載せているもの:
- ノードID: パスパラメータ `/:nodeId`。文書ツリーの現在位置（ブックマーク可能にする目的）
- バージョン指定: `?v=N`。旧バージョン表示
- スクロール対象: `?select=1`。特定ノードへのスクロール指示
- 検索クエリ: `?query=xxx`。検索キーワード
- 検索対象フォルダ: `?target=nodeId`。フォルダ指定検索
URLに載せていないもの:
- ソート設定 → `atomWithStorage`（ローカルストレージ永続化、ユーザー別キー）
- チェック状態（選択中ノード） → Jotai atom（画面遷移で消えてよい）
- ドロワー開閉 → Jotai atom（一時的なUI状態）
- 表示モード（リスト/サムネイル） → ローカルストレージ
選定基準（推測）:
- ブラウザで直接URLを開いてたどり着ける状態 → URL
- ユーザーの好み設定として残したい状態 → ローカルストレージ
- 画面遷移で消えてよい一時的な状態 → メモリ（Jotai atom）
### Context API vs Jotai
 
Contextを使っている箇所と理由は次のとおり。
 
| 用途 | 理由（推測） |
|------|------------|
| ポータル系Provider（モーダル、スナックバー、ツールチップなど） | Reactツリーの特定位置にDOMをマウントする座席を提供する必要がある。描画位置の制御はReactコンポーネントツリーと紐づくため、Contextが向く |
| アプリ初期化データProvider（ユーザー情報、ライセンス、テナント情報） | 認証完了後、ツリー全体に初期化済みであることを型レベルで保証するため。Providerの外側では値が存在しないことをTypeScriptで強制できる |
| 非同期セッションProvider（OCR、タイムスタンプ、ZIP圧縮） | セッションのライフサイクル管理（useEffect内のポーリングなど）をProvider内に閉じ込めるため。Jotaiは値の管理に向くが、副作用のライフサイクル管理にはProviderパターンの方が整理しやすい |
| OIDC認証Context | oidc-c-tsライブラリが提供するProvider経由 |
 
Jotaiはグローバルな値の読み書きを担い、ContextはReactツリー構造に依存するサービス提供を担う、と使い分けている。
 
### フォーム状態と外部状態の境界
 
React Hook Form のフォーム状態と Jotai などの外部状態を、はっきり分離している。
 
- RHFの `useForm` はモーダルやフォームコンポーネント内でのみ使う
- 初期値はprops経由で渡す（例: `defaultValues: { name: node.name }`）
- `onSubmit` でバリデーションを通過したあとコールバック関数を呼び、その中でドメインフックがAPIを叩いてJotai atomを更新する
- フォームから外部状態への受け渡しは、submit時のコールバック引数のみ
- 外部状態からフォームへの受け渡しは、defaultValues か `setValue` による命令的更新
```
[RHF フォーム状態]
  defaultValues ← props ← Jotai atom
  onSubmit → ドメインフック → API → set(atom)
```
 
---
 
## 状態フローの代表パターン
 
### パターンA: 一覧画面（フォルダ配下ノード一覧 / 無限スクロール）
 
```
URL (/:nodeId)
    │
    ▼
useParams() → useNodeRouteState()
    │            nodeId, v, select を解析・バリデーション
    │
    ▼
useFolderListAction.fetchNodeList()
    │  ├─ apApi.getNode({ nodeId })      → set(currentFolderAtom)
    │  └─ apApi.listNodeChildren({ nodeId, orderBy, limit, offset })
    │                                       → set(folderListAtom)
    │                                       → set(isAllDataFetchedAtom)
    ▼
[Jotai Atoms]
  folderListAtom ─────────────── 一覧UIコンポーネント
  selectedNodeIdListAtomFamily ── チェックボックスUI
  isAllSelectedAtomFamily ─────── 全選択チェックボックスUI
  sortSettingsAtomWithStorage ── ソート設定（LS永続化）
  scrollTargetNodeIdAtom ──────── スクロール対象制御
    │
    ▼
追加読込(スクロール末尾到達)
  fetchMoreNodeList() → apApi.listNodeChildren({ offset })
                       → folderListAtom を追記更新
    │
    ▼
ソート変更
  changeSortSettings() → set(sortSettingsAtomWithStorage)
                        → cleanup → fetchNodeList()（再取得）
 
検索
  RHF (SearchForm) → onSubmit → useNavigationAction.toSearch()
                                 → URL遷移 (?query=xxx&target=yyy)
```
 
押さえどころ:
- URLがエントリポイント（ノードIDの指定元）
- API結果はすぐにJotai atomへ格納する（キャッシュ層なし）
- ソート設定は `atomWithStorage` と `atomFamily(userIdHash)` でユーザー別にlocalStorageへ永続化する
- チェック状態は `atomFamily(pageKey)` でページ種別ごとに独立管理する
---
 
### パターンB: ファイルプレビュー画面（SP版）
 
```
URL (/:nodeId?v=2)
    │
    ▼
useNodeRouteState() → nodeId, v を解析
    │
    ▼
useFileViewAction.fetch()
    ├─ apApi.getNode({ nodeId, v })   → set(currentFileAtom)
    └─ apApi.getNodeImage({ nodeId }) → set(previewImageUrlListAtom)
    │
    ▼
[Jotai Atoms]
  currentFileAtom ──────── FilePreviewArea (画像表示 or アイコン)
  previewImageUrlListAtom ─ 画像URL配列
  isOldVersionAtom ──────── アクション制御（旧バージョンは一部無効）
  isFullPreviewModeAtom ── ヘッダー/メニュー表示制御
  referencePageAtom ────── 遷移元ページ記憶（戻るボタンの挙動分岐）
    │
    ▼
[UIローカル状態 (useState)]
  isZooming ──── ズーム中判定（タップ判定の分岐に使用）
    │
    ▼
ユーザー操作
  タップ → toggleFullPreviewMode() → set(isFullPreviewModeAtom)
  メニュー操作 → ドメインフック（ダウンロード / 名前変更 / 複製 / 移動）
    │
    ▼
名前変更の場合:
  openChangeNameModal() → Context(PortalProvider).showPortal()
    → ChangeNameModal 表示
    → RHF useForm({ defaultValues: { name: node.name } })
    → submit → apApi.updateNode() → set(currentFileAtom)
    → Context.hidePortal()
```
 
押さえどころ:
- URL状態（nodeId, v）からJotai atom（APIレスポンス）、そしてUIへと流れる
- ズーム状態のような純粋なUIローカル状態は `useState` で閉じる
- モーダル表示は Context (Portal Provider) を経由する
- フォームは RHF で閉じ、submit時にドメインフックを経由してatomを更新する
---
 
### パターンC: 複製/アップロード進捗管理（非同期バッチ処理）
 
```
ユーザー操作（複数ノード選択 → 複製ボタン）
    │
    ▼
ドメインフック → 対象ノードIDリストを取得
    │
    ▼
[Jotai Atoms — 進捗管理専用]
  copyItemAtomFamily(nodeId) ── 各ノードの複製状態（pending/active/succeeded/failed）
  copyItemIdsAtom ───────────── 対象IDリスト
  copyQueueSummaryReadAtom ──── 進捗集計（派生atom: pending数/active数/完了数を計算）
    │
    ▼
非同期処理（atom内でAPIポーリング）
  apApi.copyNode()
    → ポーリング（exponentialBackoffPolling）
    → set(copyItemAtomFamily(nodeId), { copyStatus: "succeeded" })
    │
    ▼
UIコンポーネント（進捗ダイアログ）
  copyQueueSummaryReadAtom → プログレスバー表示
  copyItemAtomFamily → 各行のステータス表示
```
 
押さえどころ:
- `atomFamily(nodeId)` で各アイテムの進捗状態を独立管理する
- 派生atom（read-only atom）で集計値を自動算出する
- 並行実行数の制限（最大5件）もatom内のロジックで制御する
- Contextは使わず、Jotai atomだけで進捗の全状態を管理する
---
 
## 気づいた点 / アンチパターン
 
### サーバー状態をグローバルstateにコピーしている（意図的）
 
APIレスポンスを直接 Jotai atom に格納し、キャッシュ無効化、再検証、楽観的更新などの仕組みは手動で実装している。これはアンチパターンというよりプロジェクト方針で、Jotaiに統一して学習コストを下げている。
 
トレードオフ:
- (+) 状態管理ライブラリが1つで済み、型の取り回しがシンプルになる
- (-) キャッシュ戦略がなく、同じデータの重複フェッチが起きうる
- (-) リフェッチのタイミング管理が各ドメインフックに分散する
- (-) 楽観的更新のパターンが複雑になりやすい
### デスクトップ版でのローカルストレージ二重管理
 
デスクトップ版（ap-c）では、表示モードやカラム検索条件の管理で、Jotai atom と独自 `localStorageService` の二重管理が発生している。
 
```
atom ←(手動読込)→ localStorageService ←(手動書込)→ localStorage
```
 
一方、SP版（ap-c-sp）では `atomWithStorage` を使って自動同期しており、この問題は解消している。デスクトップ版は歴史的経緯で手動管理が残っている（推測）。
 
### 同一エンティティの重複atom定義
 
デスクトップ版とSP版で、ログインユーザー情報や一覧データのatomを別々に定義している。
 
- デスクトップ版: `ap-c/src/store/atom/response.ts` に `apUserAtom`
- SP版: `ap-c-sp/src/features/response/atoms/response.ts` に `apUserAtom`
これは別アプリケーション（別エントリポイント）なので実害はないが、型定義や設計パターンが少しずつ異なっており、知識の分断が生じうる。
 
### URLに載せるべき状態がメモリに閉じている（軽微）
 
- 遷移元ページ (`referencePageAtom`): ファイルプレビューの戻るボタンの挙動を決めるために、遷移元ページをJotai atomに記憶している。ブラウザのバック操作やURL直接指定時には失われる。ただしブックマーク性が不要な状態なので、実用上の問題は小さい。
### デスクトップ版のatom設計が初期設計のまま
 
SP版（ap-c-sp）では `atomFamily` や `atomWithReset` を活用して整理した設計になっているが、デスクトップ版（ap-c）では `atomFamily` の活用が限定的で、個別atomが大量に並んでいる（例: `response.ts` に15以上のatom定義）。SP版の方が設計を整理できており、世代差が見える。
 
---
 
## このプロジェクトの状態管理設計を3行で要約
 
- Jotaiに一本化している。サーバー状態もクライアント状態も Jotai atom に統一し、TanStack Queryなどのサーバーキャッシュ層は持たない。シンプルだが手動管理のコストを受け入れている。
- Context は場所、Jotai は値を担う。Context APIはReactツリーに依存するサービス（ポータル、認証、セッション管理）に限定し、アプリケーション状態の値管理はすべてJotaiで行う棲み分けがある。
- URLは座標、ローカルストレージは好み、atomはその他すべてを受け持つ。ブックマーク可能にしたい位置情報はURL、ユーザー設定はローカルストレージへ永続化、それ以外の一時的な状態はメモリ上のatomという三層構造。