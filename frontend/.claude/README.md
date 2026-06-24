# .claude/ — Claude Code 資産（設計 §4.3）

frontend サブツリーの AI 関連ルール置き場。

```
.claude/
├─ skills/<name>/SKILL.md   # スキル
├─ commands/*.md            # スラッシュコマンド
├─ agents/*.md              # サブエージェント定義
├─ settings.json            # 共有設定（権限・hooks・model）※必要時に作成
└─ settings.local.json      # 個人設定（.gitignore 済み）
```

- `settings.json` は共有設定（権限・hooks・model）。チームで合意した内容を必要時に追加する。
- `settings.local.json` は個人設定。`.gitignore` 済み（コミットしない）。
- 規約本体は `AGENTS.md` / `CLAUDE.md` と `@repo/eslint-config` 等に置き、ここはツール資産に限定する。
