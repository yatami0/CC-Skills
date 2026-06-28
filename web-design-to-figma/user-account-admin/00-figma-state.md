---
project: user-account-admin (mock-v8c-hub)
stage: poc-done            # scope | extract | variables | structure | verify | poc-done
target_mock: web-design-mock/user-account-admin/output/mock-v8c-hub.html
figma_file: https://www.figma.com/design/tD9dF6fED3IVNQOfKSTqHa
updated_at: 2026-06-28
next_action: フェーズ A の学びを web-design-to-figma設計.md §13 に反映済み。次はフェーズ B(SKILL.md + scripts/extract.mjs の文脈優先逆引き + セクション分割生成器)。
---
# State — PoC (フェーズ A)

| Stage | 成果物 | Status |
|---|---|---|
| F1 スコープ | (この baton) | done |
| F2 Extract | figma-plan.json (268 node / 94 var) | done |
| F3 Variables | Figma: tokens (from mock) 25 color | done |
| F4 構造 | Figma: screen v8c-hub(代表サブツリー ~50 node) | done |
| F5 検証 | render/figma-*.png + mapping-log.md | done(セル見切れバグ捕捉・修正) |

成果物:
- `figma-plan.json` — 中間表現(Extract 出力)
- `figma-plan.png` — Playwright が撮った HTML 参照画像(突き合わせ元)
- `render/figma-sidebar.png` / `render/figma-full.png` / `render/figma-card-fixed.png` — Figma 側スクショ
- `mapping-log.md` — 損失/代替/曖昧さの台帳 + Figma URL

結論: **HTML→Figma 往復は成立**。トークン層は決定論で高忠実、構造層は lossy だが「編集可能ネイティブ層」として実用水準。詳細は設計書 §13。
