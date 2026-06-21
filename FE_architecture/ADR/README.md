# アーキテクチャ決定記録 (ADR)

このディレクトリは、本プロジェクトのフロントエンド（Next.js / BFF）に関するアーキテクチャ上の意思決定を記録します。

## 背景サマリ

| 項目 | 内容 |
|---|---|
| 対象 | 基幹システムのマスタデータ管理サイト |
| 画面規模 | 4〜5画面（一覧 / 詳細 / マスタ更新の CRUD が中心） |
| FE/BFF | Next.js（BFF として REST API を集約・整形） |
| BE | Java / Spring Boot（確定） |
| BE 連携 | OpenAPI スキーマを Spring Boot 側から提供可能 |
| 体制 | フロントエンドに明るいのは 1 名のみ |
| 開発手法 | AI コーディングエージェントを活用。規約で挙動を強く縛る方針 |

## 意思決定の通底する原則

本プロジェクトの全 ADR は、以下の 2 つの制約から導かれています。

1. **フロント専任が 1 名** — 「詰まったときに前例・情報が見つかる」枯れた技術の価値が、技術的な新しさより優先される。
2. **AI で開発し規約で縛る** — 判断ポイント（人間にも AI にも迷いが生じる分岐）を可能な限り消し、機械的に検証できる仕様（スキーマ・型・lint）でエージェントを拘束する。

## ADR 一覧

| 番号 | タイトル | ステータス |
|---|---|---|
| [0001](./0001-frontend-framework-and-rendering-paradigm.md) | フレームワークとレンダリングパラダイムの選定 | Accepted |
| [0002](./0002-data-fetching-with-tanstack-query.md) | データフェッチ戦略（TanStack Query へ統一） | Accepted |
| [0003](./0003-openapi-driven-type-and-client-generation.md) | OpenAPI 駆動の型・API クライアント・バリデーション自動生成 | Accepted |
| [0004](./0004-conventions-for-ai-assisted-development.md) | AI 開発のための規約とガードレール | Accepted |
| [0005](./0005-testing-strategy.md) | テスト戦略（Vitest + Playwright） | Accepted |

## ADR の書式について

各 ADR は「コンテキスト → 決定 → 結果（トレードオフ）」の構造に従います。決定を覆す場合は新しい ADR を追加し、旧 ADR のステータスを `Superseded by ADR-XXXX` に更新します（既存 ADR は削除しません）。
