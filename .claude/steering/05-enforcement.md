# 強制ゲート

## 出典
- Anthropic Best practices: CLAUDE.md は助言にすぎず、毎回必ず起きるべきことは決定論的な hook に置く。https://code.claude.com/docs/en/best-practices
- React 公式: Strict Mode + eslint-plugin-react-hooks / "You Might Not Need an Effect"
- TypeScript 公式: strict / tsc

## 原則
散文の Steering は AI が逸脱しうる。強制力は散文ではなく機械に置く。ここに無い規約は努力目標とみなす。

## ゲート一覧(本プロジェクトの実ツール)
| 規約 | 強制手段 | タイミング |
| --- | --- | --- |
| Rules of Hooks / 純粋性 | eslint-plugin-react-hooks + Strict Mode | 編集後 / CI |
| 不要 useEffect の禁止 | react-you-might-not-need-an-effect(全8ルール error) | 編集後 / CI |
| 独自フックの deps チェック | exhaustive-deps(useSemaphoreCallback 等を対象に追加) | 編集後 / CI |
| アプリ間直接参照の禁止 | import/no-restricted-paths | 編集後 / CI |
| import 順 | import/order | 編集後 / CI |
| 命名規約 | @typescript-eslint/naming-convention | 編集後 / CI |
| 型安全(no-any 等) | @typescript-eslint | 編集後 / CI |
| 型チェック | tsc --noEmit(strict, noErrorTruncation) | コミット前 / CI |
| コードスタイル | ESLint(Flat Config v9) + Prettier | コミット前 / CI |
| スペル | cspell | コミット前 / CI |
| 振る舞い(単体/統合) | Vitest(jsdom, globals) + Testing Library | CI |
| E2E | Playwright | CI |
| ビジュアル回帰(VRT) | Storybook + storycap + reg-suit | CI |
| API モック | MSW(本番ビルドは removeMSW プラグインで除外) | テスト時 |
| コミット前一括 | simple-git-hooks + lint-staged | コミット前 |
| 全ゲート通過 | CI をマージ条件に | PR |

## hook 設定の方針(.claude/settings.json)
- ファイル編集後に lint / typecheck を自動実行する(公式例: Write a hook that runs eslint after every file edit)。
- 危険操作(API 型定義ディレクトリの無断書き換え、依存追加、submodule 操作、push)は ask/deny に置く。
- コミット前ゲートは simple-git-hooks + lint-staged が既に担う。Claude Code の hook はそれと重複しない範囲、つまり編集直後の即時フィードバックに絞る。
