# design-docs（設計書専用リポジトリ）

本リポジトリは基本設計書を一元管理する専用リポジトリ。コードリポジトリ（FE/BFF・Java BE）とは分離する。
最上位の標準は [`00_standards/design_architecture.md`](00_standards/design_architecture.md)。新規参画者・Claude はまずこれを読む。

## 構成（3層構造）

```
design-docs/
├── 00_standards/          第1層：標準（サイト非依存・1セット）
│   ├── design_architecture.md   3層構造と全体方針（最上位・正本）
│   ├── fe-architecture.md       FE横断アーキテクチャ標準（別途整備）
│   ├── be-architecture.md       BE横断アーキテクチャ標準（別途整備）
│   ├── document_guideline.md    成果物カタログ（何を書くか）
│   ├── diagram_format.md        図フォーマット規約
│   ├── naming_convention.md     命名規約
│   └── templates/               各成果物の空テンプレート（5種）
├── adr/                   設計判断の記録（ADR）
├── siteA_master-data/     第2層：サイトA（標準体系に従って埋める）
├── siteB_xxx/             第2層：サイトB
└── siteC_xxx/             第2層：サイトC
```

## このPoCの状態

- 第1層の標準（`00_standards/` の4種＋テンプレート5種）を整備済み。
- 第2層（各サイト）は標準フォルダ体系の**空の骨組み**。各サイトが `templates/` を複製して埋める。
- `fe-architecture.md` / `be-architecture.md` は別途整備（本PoCの対象外）。
