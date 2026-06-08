# React の絶対ルール(Rules of React)

## 出典(一次ソース)
- React 公式 "Rules of React": https://react.dev/reference/rules
- これらはガイドラインではなくルール。破るとアプリにバグが出る、と公式が明言している。
- 対象バージョン: React ^19.0.0。

## コンポーネントとHookは純粋でなければならない
- 冪等。同じ入力(props / state / context)には常に同じ出力を返す。
- 副作用を render 中で実行しない。副作用はイベントハンドラへ、最終手段として `useEffect`。
- props と state は不変。直接ミューテートしない(単一renderの不変スナップショット)。
- Hookの引数と戻り値は不変。Hookに渡した値は変更しない。
- JSXに渡した値は不変。JSXで使った後にミューテートしない。ミューテートはJSX生成の前に済ませる。

## コンポーネントとHookはReactが呼ぶ
- コンポーネント関数を直接呼ばない。JSX内で使い、通常関数として呼ばない。
- Hookを通常の値として渡し回さない。Hookはコンポーネント内でのみ呼ぶ。

## Rules of Hooks
- Hookはトップレベルでのみ呼ぶ。ループ / 条件分岐 / ネスト関数の中で呼ばない。早期returnより前に置く。
- HookはReact関数からのみ呼ぶ。通常のJavaScript関数から呼ばない。

## このプロジェクト固有の上乗せ: useEffect の禁止用途
React 公式 "You Might Not Need an Effect" を `react-you-might-not-need-an-effect`(全8ルール error)で機械強制している。
- 派生状態の計算を `useEffect` で書かない。レンダー中に計算する。
- 状態の連鎖更新を `useEffect` で書かない。
- イベントハンドラでやるべき処理を `useEffect` で書かない。
- 条件分岐は `ts-pattern` の `match` で型安全に書く(`switch`/`if-else` の乱用を避ける)。

## 強制
- React 公式は Strict Mode と eslint-plugin-react-hooks の併用を強く推奨している。本プロジェクトは Strict Mode 有効。
- `exhaustive-deps` は独自フック(`useSemaphoreCallback`, `useAtomActionCallback`)も対象に含める設定。
- これらの違反は目視ではなく lint で機械検知する(`05-enforcement.md`)。
