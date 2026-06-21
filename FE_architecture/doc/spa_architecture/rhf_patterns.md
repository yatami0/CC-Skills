# React Hook Form 応用パターン集
 
## バリデーション統合
 
### ライブラリ構成
- バリデーション: Zod（`z.object()`, `z.string()`, `z.refine()` など）
- リゾルバー: `@hookform/resolvers/zod` の `zodResolver`
- 型導出: `z.infer<typeof schema>` でスキーマから TypeScript 型を自動生成する
### スキーマ定義の配置
- フォームコンポーネントとは別ファイルに分離する（`validation.ts`）
- ダイアログ系: `dialogs/XxxModal/components/validation.ts` または `dialogs/XxxModal/hooks/validation.ts`
- 共通コンポーネント系: コンポーネントと同階層に `validation.ts`
### スキーマと型の関係
```
// 基本: スキーマから型を導出
const schema = z.object({ field: z.string() })
type SchemaType = z.infer<typeof schema>
 
// transform使用時: 入力型と出力型が分離
type InputType = z.input<typeof schema>   // フォームの値の型
type OutputType = z.infer<typeof schema>  // バリデーション後の型
 
// useForm で両方指定
useForm<InputType, unknown, OutputType>({ ... })
```
 
### パラメータ付きスキーマ
外部値に依存するバリデーション（例: ポリシー情報、既存値チェック）は関数でスキーマを生成する:
```
const schema = (externalPolicy: Policy) =>
  z.object({
    field: z.string().refine(
      (v) => validateWithPolicy(v, externalPolicy),
      { message: i18n.t("validation:xxx.error") }
    ),
  })
 
// 使用側
resolver: zodResolver(schema(policyData))
```
 
### サーバーエラーのフォーム流し込み
- このプロジェクトでは `setError` による流し込みをしていない
- サーバーエラーはエラーハンドリングフック（`handleUnexpectedError`）でダイアログ表示する
- APIエラーコード別にi18nメッセージを出し分ける（`ApiError` の `errorResponse.error.code` で分岐）
## Controller 使用基準
 
### 判断基準
 
| 入力要素 | 手段 | 理由 |
|---|---|---|
| テキスト入力（自社Textboxコンポーネント） | `register` | Textboxが `React.forwardRef` で `ref` を受け取れるため |
| テキストエリア（自社Textareaコンポーネント） | `register` | 同上 |
| 独自のアイコン入力等（ファイル選択 + プレビュー表示） | `Controller` | `ref` では管理しきれない複合UIのため |
| セレクトボックス・ラジオ等 | `register` or `Controller` | コンポーネントの `ref` 対応状況で決定 |
 
### 実践的な傾向
- `register` 優先: 自社コンポーネントライブラリが `forwardRef` に対応しているため、大半は `register` で済む
- `Controller` は例外的: 独自コンポーネントが `ref` を受け取れない場合、または `field.onChange` を手動で制御したい場合だけ使う
- `Controller` 使用時は `fieldState.error?.message` でエラーをインラインに表示する
## 動的フィールドのパターン
 
### パターン: テンプレート編集フォーム
 
#### ユースケース
プロパティテンプレートの編集画面。テンプレートに含まれるプロパティ項目を動的に追加、削除、並び替えする。
 
#### 構造
- 親: `FormProvider` でフォームコンテキストを共有する
- 子: `useFormContext` + `useFieldArray` で `fields`, `remove`, `update`, `prepend` を使う
- 並び替え: `@dnd-kit` によるドラッグ&ドロップ。D&D完了時は `useFieldArray` の `move` ではなく、`fields` を並び替えて `update` で反映する
#### バリデーション
- 各要素のバリデーション: `z.array(z.object({ type: z.enum([...]), name: z.string().min(1).max(40) }))`
- 重複チェック: `superRefine` で配列全体を走査し、同名の要素があれば `ctx.addIssue` でエラーを注入する
- エラーのパスは `${index}.name` のように要素のインデックスを指定する
#### UXの工夫
- D&D並び替えは `@dnd-kit` の `SortableContext` + `restrictToVerticalAxis` で垂直方向だけに制限する
- 削除時は確認ダイアログなし（即座に削除し、undo的な仕組みもなし）
- `Enter` キーによる意図しないsubmitを `onKeyDown` で防ぐ
### パターン: 通知先ユーザー設定
 
#### ユースケース
設定モーダル内で通知先ユーザーを動的に追加、削除する。
 
#### 構造
- `useFormContext` + `useFieldArray` で `fields`, `remove`, `prepend` を使う
- ユーザー追加: `prepend` で先頭に追加する（視覚的にわかりやすくするため）
- ハイライト: 新規追加ユーザーを一時的にハイライト表示する（`highlightId` state）
## ネストフォーム設計
 
### 基本方針
- 1つの `useForm` で全体を管理する: フォーム全体を1つの `useForm` インスタンスで管理するのが原則
- `FormProvider` + `useFormContext`: 子コンポーネントは `useFormContext` でフォームにアクセスする
### 実装パターン
```
// 親コンポーネント
const methods = useForm<InputType, unknown, OutputType>({
  resolver: zodResolver(schema),
  mode: "onChange",
  defaultValues: { ... },
})
 
return (
  <FormProvider {...methods}>
    <form onSubmit={methods.handleSubmit(onSubmit)}>
      <SectionA />   // useFormContext でアクセス
      <SectionB />
    </form>
  </FormProvider>
)
 
// 子コンポーネント
const { register, formState: { errors }, watch } = useFormContext<SchemaType>()
```
 
### ステップ式フォーム
- このプロジェクトではウィザード形式のステップフォームを使っていない
- すべてのフォームは1画面で完結する設計
## 外部状態との連携
 
### Jotaiからフォーム初期値を流し込むパターン
- 直接的な流し込みはしない: フォームの `defaultValues` は props 経由で渡す
- Actionフックがデータ取得 → atom更新 → Stateフック → propsとして渡す → `useForm({ defaultValues })` の流れ
- atom → フォーム の直接バインディングは避ける設計判断
### submit結果で外部状態を更新するパターン
- submit の `onSubmit` ハンドラーは親（ダイアログのActionフック）から props で受け取る
- Actionフック内で API呼び出し → 成功時に atom を更新
- フォーム自体は atom を知らない（プレゼンテーション層に閉じる）
### フォーム入力中の値を外部状態に同期
- `isDirty` 状態を呼び出し元に通知するケースがある（`useEffect` + `setIsDirtyForm(formState.isDirty)`)
- 目的: 親コンポーネントがモーダルの閉じ確認を制御するため
- 入力中の値そのものは外部に同期しない方針
## エラー表示規約
 
### 表示位置
- フィールド直下: エラーメッセージは対応する入力フィールドの直下にインライン表示する
- フォーム上部への集約表示はしない
### エラー表示コンポーネント
- `ErrorMessage` コンポーネント（共通部品）を使う: `@core/components/molecules/FormBox`
- `InputWithError`: 入力欄 + エラーメッセージを一体化したコンポーネント
### 表示パターン
```
// パターン1: ErrorMessage コンポーネント
{errors.fieldName?.message && (
  <ErrorMessage>{errors.fieldName.message}</ErrorMessage>
)}
 
// パターン2: InputWithError（テキスト入力 + エラー一体型）
<InputWithError
  textboxProps={{ ...register("fieldName"), maxLength: 25 }}
  error={errors?.fieldName?.message}
/>
 
// パターン3: Controller使用時
<Controller
  control={control}
  name={name}
  render={({ field, fieldState }) => (
    <div>
      <Textbox {...field} />
      {fieldState.error?.message && (
        <ErrorMessage>{fieldState.error.message}</ErrorMessage>
      )}
    </div>
  )}
/>
```
 
### サーバーエラーとクライアントエラーの違い
- クライアントエラー: Zodスキーマによるバリデーション → フィールド直下にインライン表示
- サーバーエラー: エラーハンドリングフック → モーダル/ダイアログで画面レベルの通知
- 両者は表示レイヤーが異なる（フォーム内 と アプリ全体）
## 初期値設定パターン
 
### `defaultValues` を使う場合
- フォーム生成時に値が確定している（props経由で渡される）
- テンプレート編集: `defaultValues: { name: template?.name || "", properties: template?.properties || [] }`
### `reset()` を使う場合
- props変更時にフォームを同期させる（編集モード切り替え時）
- `useEffect` で `methods.reset(defaultValues)` を呼び出す
- 条件: 編集モードでない場合だけリセットする（編集中のリセットを防ぐ）
### 非同期データを待つ間
- 親コンポーネントがデータ取得完了まで子フォームをレンダリングしない（条件付きレンダリング）
- `{fetchedData && <FormComponent defaultValues={fetchedData} />}`
- Suspense は使っていない
## submit 後の挙動規約
 
### 成功時
- ダイアログ内フォーム: モーダルを閉じる（`handleClose` 呼び出し）、必要に応じて完了通知
- `isCloseOnSubmit={false}`: サブミットボタンの自動クローズを無効化し、Actionフック側で明示的に閉じる
- フォームリセットはしない（モーダルが閉じればアンマウントされるため）
### 失敗時
- エラーハンドリングフックでダイアログ表示する
- フォームはそのまま維持する（ユーザーが修正して再送信できる状態）
- リトライ: フォームを修正して再submitするのが基本方針
### 二重送信防止
- `formState.isSubmitting` でサブミットボタンを `disabled` 制御する
- `useSemaphoreCallback` で並行実行を防ぐ（フック層で制御）
- `withAppLoading` でローディング中の操作全般をブロックする
## テスト戦略
 
### バリデーションのテスト
- Zodスキーマは純粋関数なので、`validation.ts` を直接importしてテストできる
- `schema.safeParse(input)` で成功と失敗を検証する
- ただし、このプロジェクトではスキーマ単体テストが少なく、フォーム全体のインテグレーションテストが中心
### フォームのテスト
- `render` でフォームコンポーネントを描画 → `userEvent` で入力 → submit ハンドラーの呼び出しを検証する
- Provider ラッパー（Jotai Provider, AppStateProvider）が必要な場合は `useJotaiTestWrapper` を使う
### submitのテスト
- APIモック: テスト内で `vi.mock` するか、MSW のハンドラーを一時的に差し替える
- `onSubmit` を `vi.fn()` にして、正しい引数で呼ばれたかをアサートする
## 別プロジェクトに持ち込める考え方
 
### スキーマ分離の原則
フォームコンポーネントにバリデーションロジックをインラインで書かない。`validation.ts` に分離すると、テスタビリティと再利用性が上がる。スキーマからの型導出（`z.infer`）でDRYも実現する。
 
### transform と Input/Output型の分離
`z.transform()` を使うと入力型と出力型が異なる。`z.input` と `z.infer` で両方の型を取得し、`useForm<Input, unknown, Output>` で型安全にsubmitデータを受け取れる。
 
### FormProvider + useFormContext による分割
1つの `useForm` で全体を管理しつつ、`FormProvider` でコンテキストを共有する。子コンポーネントは `useFormContext` でアクセスするだけ。フォーム分割はこのパターンに統一する。
 
### isDirty による離脱防止の二段構え
`useConfirmationBeforeUnload(isDirty)` でブラウザ標準の離脱確認、`closeInterceptor` でアプリ内のモーダル閉じ確認。フォームを持つダイアログには必ずこの二段構えを入れる規約。
 
### 相関バリデーション + superRefine
フィールド間の整合性チェックは `.refine()`, 配列要素の重複チェックは `.superRefine()` + `ctx.addIssue()`。`path` 指定で適切なフィールドにエラーを紐づける。transform を含むフィールドとの組み合わせは `.and()` で回避する現場テクニック。