# Jotai実装パターン集
 
## atom定義の基本方針
 
### 粒度の原則
- 単一責務。1つのatomは1つの概念(エンティティ、フラグ、リスト)を持つ。オブジェクト全体を1つのatomに入れるケースと、プリミティブ値を入れるケースが共存する
- 更新単位で分割する。同時に更新される情報はまとめる(例: リストデータ = folders + files を1つのatomに)。独立して変化するフラグ(ソート順、スクロール位置など)は別atomに分離する
- null初期値パターン。データ未取得の状態を `null` で明示し、取得後に実データをセットする。データがまだ存在しない状態と、まだ取得していない状態を区別するための設計判断
### 命名規約
- 末尾に `Atom` を付与する(例: `entityListAtom`, `isLoadingAtom`)
- 派生atomは `Selector` サフィックス(例: `viewListSelector`)
- 書き込み専用atomは `WriteAtom` サフィックス(例: `replaceNodeWriteAtom`)
## atom種別の使い分け表
 
| atom種別 | 使用箇所の傾向 | 意図 / 判断基準 |
|---|---|---|
| `atom()` (基本) | APIレスポンスの格納、単純なフラグ | リセット不要な永続状態。初期値nullでデータ未取得を表現 |
| derived atom (read関数あり) | フィルタリング、ソート、表示用の加工 | 複数atomから派生する読み取り専用の計算状態。selectorとして機能 |
| writable atom (read + write) | カスタムセッター、複数atomの同時更新 | setに複雑なロジックを持たせたい場合。リスト内の要素置換など |
| `atomFamily` | パラメータ付きキャッシュ(エンティティID、ユーザーID) | 同一構造のatomを動的に生成。等価関数でキーの同一性を判定 |
| `atomWithStorage` | ソート設定、メニュー開閉状態 | ローカルストレージと同期。ユーザーごとの永続設定に使用 |
| `atomWithReset` | ダイアログ状態、一時フラグ、一覧データ | `RESET` で初期値に戻せる。クリーンアップパターンの基盤 |
| `loadable` (非同期) | ストレージ読み込み中の状態管理 | 非同期atomの状態(loading/hasData/hasError)を同期的に読み取る |
 
## 配置規約
 
### ディレクトリ構造
```
【グローバルatom】
store/atom/
  ├── response.ts      # APIレスポンス系（ユーザー情報、設定、権限等）
  └── *.ts             # 横断的に使われる状態
 
【フィーチャーローカルatom】
pages/<Feature>/hooks/
  ├── atom.ts           # そのページ/機能に閉じたatom
  ├── use<Feature>Action.ts  # Actionフック（atomの操作）
  └── use<Feature>State.ts   # Stateフック（atomの読み取り）
 
【共通パッケージのatom】
packages/service/src/store/
  └── <feature>/
      ├── baseAtoms.ts      # 基本atom（ファクトリ関数で生成）
      ├── derivedAtoms.ts   # 派生atom
      ├── types.ts          # 型定義
      └── storage.ts        # カスタムストレージアダプタ
```
 
### 配置判断基準
- 1つのページ/ダイアログ内で閉じる → `hooks/atom.ts`
- 複数ページで共有 → `store/atom/`
- 全サイト共通 → `packages/service/src/store/`
### エクスポート規約
- atomは定義ファイルから直接export(バレルエクスポートは使わない)
- Stateフックから返すことで、読み取り可能なatomを制限する設計もある
## Hooks使用ルール
 
### 使い分け基準
 
| フック | 用途 | 再レンダリング |
|---|---|---|
| `useAtomValue(atom)` | 読み取りのみ | atom値変更時のみ |
| `useSetAtom(atom)` | 書き込みのみ | 発生しない |
| `useAtom(atom)` | 読み書き両方 | atom値変更時 |
| `useAtomCallback` | atom操作を関数化（get/setにアクセス） | 発生しない |
 
### プロジェクトの実践
- Stateフックは `useAtomValue` のみ使う。副作用なし
- Actionフックは `useAtomCallback` / `useAtomActionCallback` を使う。コンポーネントの再レンダリングを引き起こさない
- ドロワー制御は `useSetAtom` で開閉フラグのみセットする(値の読み取りは別フック)
- `useAtom` は使わない方針。State/Action分離の原則から、読み書きを同一フックで行わない
### `useAtomActionCallback` — プロジェクト独自のショートハンド
`useAtomCallback(useCallback(...))` の定型コードを省略するヘルパー。依存配列の管理もそのまま。
 
## 代表パターン集
 
### パターン1: atomWithReset + RESETによるクリーンアップ
 
#### 意図
ページ離脱やダイアログクローズ時に、関連するatomを確実に初期状態へ戻す。メモリリークや状態の残留を防ぐ。
 
#### 構造
- 元のatom: `atomWithReset<データ型 | null>(null)` で定義する
- クリーンアップ関数: `useAtomActionCallback` 内で `set(xxxAtom, RESET)` を複数回呼ぶ
- 使用側: ページのアンマウント時、リフレッシュ時にcleanupを呼ぶ
#### 擬似コード
```
// atom定義
const listAtom = atomWithReset<ListData | null>(null)
const flagAtom = atomWithReset(false)
 
// Actionフック
const cleanup = useAtomActionCallback((_get, set) => {
  set(listAtom, RESET)
  set(flagAtom, RESET)
}, [])
```
 
#### いつ使うべきか
- ダイアログやページに紐づく一時的な状態すべて
- 初期値に戻すことが明確なatom
#### 注意点
- `atomWithReset` でないatomに `RESET` を渡すとエラーになる
- クリーンアップの呼び忘れが状態の残留を引き起こすため、必ずペアで設計する
---
 
### パターン2: atomFamily + ユーザーID/エンティティIDによるキャッシュ
 
#### 意図
同一構造のデータを、パラメータ(ID)ごとに独立して管理する。ユーザー別設定、エンティティ別のキャッシュに使う。
 
#### 構造
- atomFamily: パラメータを受け取り、新しいatomインスタンスを返すファクトリ
- 等価関数: 第2引数でキーの同一性判定ロジックを定義する
- ラッパーatom: atomFamilyを内部で使い、外部にはシンプルなAPIを提供する
#### 擬似コード
```
// ユーザーごとの設定atom
const settingsFamily = atomFamily((userId: string) => {
  return atomWithStorage(`${userId}-SETTINGS`, defaultSettings)
})
 
// ラッパー（現在のユーザーで自動解決）
const settingsAtom = atom(
  (get) => {
    const userId = get(currentUserIdAtom)
    return get(settingsFamily(userId))
  },
  (get, set, newValue) => {
    const userId = get(currentUserIdAtom)
    set(settingsFamily(userId), newValue)
  }
)
```
 
#### いつ使うべきか
- エンティティID、ユーザーIDなど動的なキーで状態を分離したい
- 同じ画面で複数のエンティティの状態を独立管理したい
#### 注意点
- 等価関数を省略するとオブジェクトキーが参照比較になり、意図しない重複インスタンスが発生する
- メモリリークに注意。`atomFamily.remove()` でクリーンアップするか、使い捨てにする設計が必要
---
 
### パターン3: writable atom(カスタムセッター)によるリスト要素の部分更新
 
#### 意図
リスト全体を置き換えるのではなく、特定の要素だけを更新する操作をatomレベルでカプセル化する。お気に入りトグル、名前変更後のリスト反映で頻出する。
 
#### 構造
- 元のatom: リストデータを保持する `atomWithReset`
- 書き込み専用atom: `atom(null, (get, set, updatedNodes) => { ... })` で更新ロジックを定義する
- 使用側: `set(replaceAtom, [updatedNode])` で差分更新する
#### 擬似コード
```
const listAtom = atomWithReset<ListData | null>(null)
 
const replaceNodeWriteAtom = atom(
  null,  // read は不要
  (_get, set, nodes: NodeItem[]) => {
    set(listAtom, (prev) => {
      if (!prev) return null
      return {
        folders: prev.folders.map(f => {
          const updated = nodes.find(n => n.id === f.id)
          return updated && isFolder(updated) ? updated : f
        }),
        files: prev.files.map(f => {
          const updated = nodes.find(n => n.id === f.id)
          return updated && isFile(updated) ? updated : f
        }),
      }
    })
  }
)
```
 
#### いつ使うべきか
- リストの1要素だけを更新したい(お気に入りON/OFF、名前変更後のUI反映)
- API再取得せずにUIへ即時反映したい場合の楽観的更新
#### 注意点
- 同じパターンが複数のリスト(フォルダ一覧、検索一覧、お気に入り一覧)で重複しやすい
- `prev` が `null` の場合のガード処理を忘れない
---
 
### パターン4: atomWithStorage + atomFamily + ラッパーatomの三層構成
 
#### 意図
ユーザーごとの永続設定(ソート順など)を、ローカルストレージと同期しつつ、アプリ全体から統一的にアクセスできる仕組み。
 
#### 構造
- 第1層: `atomFamily` でユーザーIDごとにatomを生成する
- 第2層: `atomWithStorage` でローカルストレージと同期する
- 第3層: ラッパーの writable atom で現在のユーザーを自動解決し、ページキーで分岐する
#### 擬似コード
```
// 第1層+第2層: ユーザーごとのストレージatom
const settingsFamily = atomFamily((userHash: string) => {
  return atomWithStorage(`${userHash}-SORT`, initialSettings, undefined, {
    getOnInit: true  // マウント時にLSから読み込み
  })
})
 
// 第3層: ラッパー
const sortSettingsAtom = atom(
  (get) => get(settingsFamily(get(userHashAtom))),
  (get, set, pageKey, order) => {
    set(settingsFamily(get(userHashAtom)), prev =>
      match(pageKey)
        .with("PAGE_A", () => ({ ...prev, PAGE_A: { order } }))
        .with("PAGE_B", () => ({ ...prev, PAGE_B: { order } }))
        .exhaustive()
    )
  }
)
```
 
#### いつ使うべきか
- ユーザー固有の設定を永続化したい
- 複数ページで共通の設定構造を持つが、ページごとに値が異なる
#### 注意点
- `getOnInit: true` を付けないと初回レンダリング時にデフォルト値が使われる
- ts-pattern の `exhaustive()` でページキーの漏れを静的に検出できる
---
 
### パターン5: ドロワー排他制御パターン(atomWithReset + 一括RESET)
 
#### 意図
複数のドロワー(メニュー)が同時に開かないよう排他制御する。開くときに他を全てRESETし、対象だけtrueにする。
 
#### 構造
- 各ドロワーに `atomWithReset(false)` を1つずつ定義する
- Actionフック: 1つを開くとき、他の全atomに `RESET` を送信してから対象を `true` にする
- Stateフック: 各atomの値を `useAtomValue` で返す
#### 擬似コード
```
const isOpenMenuA = atomWithReset(false)
const isOpenMenuB = atomWithReset(false)
const isOpenMenuC = atomWithReset(false)
 
// Actionフック
const openMenuA = useAtomCallback(
  useCallback((_get, set) => {
    set(isOpenMenuB, RESET)
    set(isOpenMenuC, RESET)
    set(isOpenMenuA, true)
  }, [])
)
 
const cleanupAll = useAtomCallback(
  useCallback((_get, set) => {
    set(isOpenMenuA, RESET)
    set(isOpenMenuB, RESET)
    set(isOpenMenuC, RESET)
  }, [])
)
```
 
#### いつ使うべきか
- 排他的に開閉する複数のUI要素がある
- ドロワー、アコーディオン、タブ的な排他制御
#### 注意点
- atomの数が増えるとRESET呼び出しが冗長になる(共通化の余地あり)
- `useAtomCallback` で包むことで、複数のsetが1回のバッチとして処理される
## テスト方針
 
### テストインフラ
- テストランナーは Vitest(globals モード)
- Jotai テスト用ラッパーは `useJotaiTestWrapper`。プロジェクト独自のヘルパー
### `useJotaiTestWrapper` の設計
次の3つの機能を提供する:
 
1. JotaiTestWrapper: `createStore()` で毎テスト独立のストアを生成し、`<Provider store={store}>` でラップする
2. preConditions: テスト前にatomへ初期値(モック値)をセットする
3. observeTargets + stateMockOf: 指定atomの値変更を `vi.fn()` で監視し、更新履歴を追跡する
### カスタムマッチャー
atomの状態遷移を検証する専用マッチャーを `expect.extend` で追加している:
 
| マッチャー | 意味 |
|---|---|
| `toBeKeepDefault` | atomがデフォルト値のまま更新されていない |
| `toBeKeepPreState` | atomが前提条件の値のまま |
| `toBeUpdatedTimes(n)` | n回更新された |
| `toBeUpdatedWith(v1, v2, ...)` | 指定された値の順序で更新された |
 
### テストの書き方(擬似コード)
```
test("アクション実行後にatomが更新される", async () => {
  const { JotaiTestWrapper, stateMockOf } = useJotaiTestWrapper({
    observeTargets: [targetAtom, flagAtom],
    preConditions: [{ atom: someAtom, state: mockData }],
  })
 
  const { result } = renderHook(() => useTargetAction(), {
    wrapper: JotaiTestWrapper,
  })
 
  await act(async () => {
    await result.current.executeAction()
  })
 
  expect(stateMockOf(targetAtom)).toBeUpdatedWith(expectedValue)
  expect(stateMockOf(flagAtom)).toBeKeepDefault()
})
```
 
### テストファイル配置
- フックと同階層に `*.test.tsx` を配置する
- テストユーティリティは `packages/service/src/tests/` に集約する
## 自分のための学習メモ
 
### このプロジェクトで学べたこと
- Action/State分離。読み取りフックと操作フックを物理的に分けると、再レンダリング最適化とコードの見通しが両立する
- useAtomCallback の使いどころ。コンポーネントの再レンダリングを引き起こさずにatomを操作できる。Actionフックの基盤になる
- atomWithReset + RESET でのクリーンアップ。Reactのライフサイクルに依存せず、明示的に状態をリセットできる設計が堅牢
- atomFamily + atomWithStorage + ラッパーatom の三層構成。永続化 × ユーザー分離 × 統一API を同時に実現する実践的パターン
- カスタムマッチャーでatomテストを宣言的に書ける。`toBeUpdatedWith` のような専用マッチャーで、atom状態遷移のテストが読みやすくなる
### 別プロジェクトに持ち込めそうな考え方
- atomは安いという思想。小さなatomを多数作り、derivedAtomで合成する。Reduxの1つの巨大なストアとは真逆のアプローチ
- writable atomでロジックをカプセル化する。セッターにロジックを持たせると、呼び出し側のコードがシンプルになる
- テスト用の状態監視ラッパー。Jotai + renderHook のボイラープレートを共通化する仕組みは、どのプロジェクトでも再利用できる
- 排他制御パターン。複数のUI状態の排他制御を、atomレベルで設計する考え方は汎用的
- ts-pattern × atom。`exhaustive()` でパターンの網羅性を保証しつつ、atomの更新ロジックを安全に分岐できる
