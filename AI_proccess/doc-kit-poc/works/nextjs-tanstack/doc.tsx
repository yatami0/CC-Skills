import { defineWork, Image } from "../../design-system";

// 図の実体（drawio から書き出した light/dark SVG）。assets/ に集約し、ここで import。
import dataflowSvg from "./assets/dataflow.svg";
import dataflowDark from "./assets/dataflow.dark.svg";
import pipelineSvg from "./assets/pipeline.svg";
import pipelineDark from "./assets/pipeline.dark.svg";
import eksSvg from "./assets/eks.svg";
import eksDark from "./assets/eks.dark.svg";

/**
 * この資料の全内容（メタ＋全セクション＋図＋出典）を 1 ファイルで宣言する。
 * 旧: parts/NN-slug/{原稿.md, Part.tsx, Diagram.tsx, diagram.svg} の分散 → 本ファイルに集約。
 * 通常 part は body(markdown)＋構造ブロックを並べるだけ（React を書かない）。
 * 出典は各 part の sources に置けば、引用一覧 part が自動集約する。
 */
export default defineWork({
  mode: "page",
  eyebrow: "アーキテクチャ解説",
  title: "Next.js + TanStack Query のクライアント寄り構成 — 図解",
  lead: "基幹システムのマスタデータ管理サイトを、Next.js を BFF に徹させた「クライアント寄り構成」で作る際の全体像を、実行時データフローから OpenAPI 駆動の自動生成、テスト戦略、EKS デプロイまで図解で示す解説ページ。フロントに明るくないが全体像を掴みたい人、この構成をレビューする人に向けて。",
  footer:
    "このページは、基幹システムのマスタ管理（Next + Spring Boot、フロント 1 名 + AI 開発、EKS）に対して下した一連のアーキテクチャ判断を、図で直感的に掴ませつつ各判断の根拠記事に辿れるようにまとめたものです。引用は言い換え主体で、各記事リンクから詳細に辿れます。",

  parts: [
    {
      num: "01",
      id: "intro",
      heading: "はじめに / プロジェクト背景",
      body: "このページは、ある具体的なプロジェクトに対して下した一連のアーキテクチャ判断を、図で直感的に掴ませつつ、各判断の根拠記事に辿れるようにまとめたものです。まず前提となるプロジェクトの輪郭を示します。",
      table: {
        columns: ["項目", "内容"],
        rows: [
          ["対象", "基幹システムのマスタデータ管理サイト"],
          ["画面規模", "4〜5 画面（一覧 / 詳細 / マスタ更新の CRUD が中心）"],
          ["FE / BFF", "Next.js（BFF として REST API を集約・整形）"],
          ["BE", "Java / Spring Boot（確定）"],
          ["BE 連携", "OpenAPI スキーマを Spring Boot 側から提供可能"],
          ["体制", "フロントエンドに明るいのは 1 名のみ"],
          ["開発手法", "AI コーディングエージェントを活用。規約・型・lint・CI で機械的に縛る"],
          ["インフラ", "AWS EKS。Next.js 用 Pod と Spring Boot 用 Pod を同一クラスタに同居"],
        ],
      },
      keyPointsHeading: "このページが伝える核心メッセージ",
      keyPoints: [
        "BE が別系（Spring Boot）で確定しているため、Next.js は BFF に徹し、RSC の「サーバーで直接データ取得」の旨味は構造的に効かない。よって RSC 中心ではなくクライアント寄り（Client Components + TanStack Query）が適合する。",
        "フロント 1 名 + AI 開発という制約下では、判断ポイントを消し、機械的に検証できる仕様（OpenAPI スキーマ・型・lint・テスト）でエージェントを縛ることが鍵。",
        "テストと型と CI が、AI のドリフト（もっともらしいが意図とズレたコード）を止める検証ゲートになる。",
      ],
    },

    {
      num: "02",
      id: "paradigm",
      heading: "なぜクライアント寄り構成か（設計思想）",
      body: "Next.js には大きく 2 つの寄せ方があります。サーバーファースト（RSC 中心）と、クライアントファースト（Client Components + TanStack Query）。本構成は後者を選びます。理由は、BE が別系で確定していること、CRUD 中心で SEO が不要なこと、そしてフロント 1 名 + AI 開発のもとで「server/client 境界をどちらにするか」という判断軸を一本化したいことです。\n\n公平を期すために言えば、RSC が有利な場面はあります。コンテンツ / SEO 中心のサイトでは、サーバーで直接データを取り、クライアントへ送るバンドルを削れる利点が効きます。優劣ではなく **最適化対象が違う**、というのが正確な捉え方です。\n\n本構成がクライアントファーストを選ぶのは優劣ではなく「最適化対象が違う」から（[P2](https://www.buildwithmatija.com/blog/tanstack-start-vs-nextjs-16-comparison)）。RSC は正しく使えばバンドル削減等の利点がありますが、BE 別系・CRUD 中心・フロント 1 名 + AI という制約下では、判断軸を一本化できるクライアント寄りが噛み合います。",
      table: {
        columns: [
          "観点",
          "サーバーファースト（RSC 中心）",
          "クライアントファースト（本構成）",
        ],
        rows: [
          ["データ取得", "Server Component / Server Actions でサーバー取得", "Client Component + TanStack Query"],
          ["向いている対象", "コンテンツ / SEO 中心サイト", "ダッシュボード / 内部ツール / CRUD"],
          ["BE が別系のとき", "「サーバーで直接取得」の旨味が薄い", "API を叩く前提なので素直に噛み合う"],
          ["メンタルモデル", "server/client 境界の判断が要る", "「API を叩くクライアントアプリ」で一本化"],
          ["本構成での採否", "✕（旨味が薄く判断負荷が高い）", "◯（採用）"],
        ],
        highlightColumn: 2,
      },
      sources: [
        { tag: "P1", category: "設計思想（パラダイム）", href: "https://tanstack.com/start/latest/docs/framework/react/start-vs-nextjs", text: "TanStack 公式 — Start vs Next.js 比較", note: "クライアントファースト陣営の主張。ポジショントーク含む点に注意。" },
        { tag: "P2", category: "設計思想（パラダイム）", href: "https://www.buildwithmatija.com/blog/tanstack-start-vs-nextjs-16-comparison", text: "Build with Matija — TanStack Start vs Next.js 16", note: "RSC-first と client-first を中立に対比。「どちらが優れているかではなく最適化対象が違う」。" },
        { tag: "P3", category: "設計思想（パラダイム）", href: "https://blog.logrocket.com/tanstack-start-vs-next-js-choosing-the-right-full-stack-react-framework/", text: "LogRocket — TanStack Start vs Next.js", note: "中立的な技術メディアの比較。" },
      ],
    },

    {
      num: "03",
      id: "dataflow",
      heading: "実行時データフロー（図1）",
      body: "実際にアプリが動いているときの、一覧 → 詳細 → 更新 → 再取得という CRUD ループを図にします。ポイントは、コンポーネントが `useQuery` / `useMutation` を呼ぶだけで、その下に層がきれいに並ぶことです。",
      figure: {
        caption: "CRUD の心臓部。コンポーネントは useQuery / useMutation を呼ぶだけで、その下に「QueryCache → 生成 API クライアント → Route Handler(BFF) → Spring Boot」が層として並ぶ。更新が成功すると invalidateQueries（緑の破線）が該当 queryKey のキャッシュを無効化し、その key を使う一覧が自動で再取得されて最新化される。データの実体は常に HTTP 越しの API（Spring Boot）であり、Next.js は BFF に徹する。",
        extra: "※ marker id は useId() で自動ユニーク化。同じ図を複数並べても衝突しない。",
        node: (
          <Image
            src={dataflowSvg}
            srcDark={dataflowDark}
            alt="Next.js + TanStack Query の実行時データフロー。Client Component が TanStack Query の hook を使い、生成 API クライアント経由で Route Handler(BFF) を呼び、Spring Boot に転送する。更新時は invalidateQueries でキャッシュを無効化し再取得する。"
          />
        ),
      },
      sources: [
        { tag: "D1", category: "データフロー / TanStack Query", href: "https://medium.com/@sergey-bocharov/organizing-crud-operations-with-next-js-and-tanstack-query-63d53e539608", text: "Mastering CRUD Operations with Next.js and TanStack Query", note: "本構成に最も近い。pure functions → hooks → components のレイヤー分割を図解。" },
        { tag: "D2", category: "データフロー / TanStack Query", href: "https://ihsaninh.com/blog/the-complete-guide-to-tanstack-query-next.js-app-router", text: "The Complete Guide to TanStack Query in Next.js App Router", note: "invalidateQueries による再取得ループ。" },
        { tag: "D3", category: "データフロー / TanStack Query", href: "https://blog.logrocket.com/using-tanstack-query-next-js/", text: "Using TanStack Query with Next.js (LogRocket)", note: "ReactQueryDevtools でキャッシュ挙動を可視化。" },
      ],
    },

    {
      num: "04",
      id: "generation",
      heading: "OpenAPI 駆動の自動生成と AI 規約",
      body: "クライアント寄り構成の信頼性は、型の正しさに支えられます。本構成では **OpenAPI スキーマを真実の源（source of truth）** とし、そこから型・API クライアント・Zod スキーマを自動生成します。Spring Boot 側がスキーマを出力できるので、フロントは手書きの型を持ちません。\n\nこれは AI 開発との相性が決定的に良い設計です。手書き型を禁止し、生成物（`src/generated`）を編集禁止にすると、AI が「それらしい型」をでっち上げる余地が消えます。生成された型・クライアントが、AI を縛る **実行可能な仕様** になるわけです。\n\nさらに `AGENTS.md` / `CLAUDE.md` でエージェントに規約を読ませ（ソフトな縛り）、型チェック・lint・CI でそれを機械的に検証する（ハードな縛り）。この二重ガードレールで、AI の出力を一定の幅に収めます。CI 側では **drift 検出**（スキーマから再生成した結果がコミット済みと一致するか）も走らせ、スキーマと生成物のズレを止めます。",
      sources: [
        { tag: "G1", category: "OpenAPI 生成 / AI 規約", href: "https://nextjs.org/docs/app/guides/ai-agents", text: "Next.js 公式 — AI Coding Agents ガイド", note: "AGENTS.md / CLAUDE.md の自動生成。エージェントに「docs を先に読め」と指示する公式の仕組み。" },
        { tag: "G2", category: "OpenAPI 生成 / AI 規約", href: "https://zeroshot.ghost.io/spec-driven-development-with-ai-coding-agents/", text: "Spec-Driven Development with AI Coding Agents", note: "仕様がエージェントを縛る。ドリフト対策。" },
        { tag: "G3", category: "OpenAPI 生成 / AI 規約", href: "https://www.augmentcode.com/guides/what-is-spec-driven-development", text: "What Is Spec-Driven Development? (Augment Code)", note: "仕様が「実行される検証ゲート」になる。" },
      ],
    },

    {
      num: "05",
      id: "testing",
      heading: "テスト戦略",
      body: "テストは二層構成です。**Vitest** が単体・同期コンポーネントを担い、**Playwright** が E2E（CRUD のハッピーパス）を担います。Jest はすでに Vitest に移行済みです。\n\n役割分担には技術的な根拠もあります。非同期 Server Component は Vitest が非対応のため、その検証は E2E 側に寄せます（[Next.js 公式が明記](https://nextjs.org/docs/app/guides/testing/vitest)）。本構成はクライアント寄りなので Server Component は少なめですが、境界の振り分けはこの原則に従います。\n\nそして最も重要なのは、これらが **CI ゲート** として働くことです。型・lint・Vitest・E2E がすべて緑でなければマージできない。この機械的な関門が、AI のドリフト（もっともらしいが意図とズレたコード）を止めます。",
      sources: [
        { tag: "T1", category: "テスト", href: "https://nextjs.org/docs/app/guides/testing", text: "Next.js 公式 — Testing ガイド" },
        { tag: "T2", category: "テスト", href: "https://nextjs.org/docs/app/guides/testing/vitest", text: "Next.js 公式 — Vitest", note: "非同期 Server Component は Vitest 非対応 → E2E 推奨、と明記。" },
        { tag: "T3", category: "テスト", href: "https://nextjs.org/docs/app/guides/testing/playwright", text: "Next.js 公式 — Playwright" },
        { tag: "T4", category: "テスト", href: "https://medium.com/@securestartkit/next-js-testing-in-2026-vitest-playwright-0caf6dd1f829", text: "Next.js Testing 2026: Vitest and Playwright", note: "Vitest と Playwright の二層分担。Jest からの移行。" },
      ],
    },

    {
      num: "06",
      id: "pipeline",
      heading: "開発〜CI までの全体フロー（図2）",
      body: "ここまでの判断（クライアント寄り・OpenAPI 生成・二層テスト）が、実際の開発フローのどこに効くかを 1 枚の地図にします。起点はあくまで OpenAPI スキーマで、そこから生成された型・クライアントが AI の手書き余地を消し、CI が独立した最終関門になる、という流れです。",
      figure: {
        caption: "ADR（設計判断）が実際の開発フローのどこに効くかの地図。① OpenAPI スキーマが起点で、型・API クライアント・Zod が生成され、AI が手書きする余地が消える。② AI はローカルで自己修正するが、ローカルでは「動く」と自己納得しがちなため、③ の CI が独立した最終関門になる。drift 検出 は「スキーマから再生成した結果がコミット済みと一致するか」の確認。④ プレビュー環境 E2E、⑤ main マージで本番。Branch Protection で未通過の PR はマージ不可。",
        extra: "※ この図はホスティング汎用版。EKS 固有のデプロイ（④⑤）は次セクションの図3 で差し替わる。",
        node: (
          <Image
            src={pipelineSvg}
            srcDark={pipelineDark}
            alt="OpenAPIからデプロイまでの開発・CI/CDパイプライン。OpenAPI スキーマから型・クライアントを生成し、ローカル AI 開発 → CI 検証（型+lint / 単体テスト / drift検出 / build）→ プレビュー E2E → main マージで本番、という流れ。"
          />
        ),
      },
      sources: [
        { tag: "C1", category: "CI/CD（汎用）", href: "https://pablodiazt.com/tech-stack/ci-cd-vercel-github", text: "CI/CD Pipeline with Vercel + GitHub", note: "ソロ運用向け 4 ステージ。レビュアー不在を自動チェックで代替。" },
        { tag: "C2", category: "CI/CD（汎用）", href: "https://coffey.codes/articles/production-grade-ci-cd-with-nextjs-vercel-and-github-actions", text: "Production-grade CI/CD with Next.js/Vercel and GitHub Actions", note: "プレビュー環境で E2E を回す。Branch Protection。" },
      ],
    },

    {
      num: "07",
      id: "eks",
      heading: "EKS へのデプロイ（図3）",
      body: "本構成のインフラは Vercel ではなく AWS EKS です。Vercel 前提だった「プレビュー URL・自動ロールバック」が EKS でどう置き換わるかを示します。CI（前セクションの③まで）は EKS でも同じで、変わるのは **成果物の運び方** だけです。",
      figure: {
        caption:
          '図2 の ④⑤ を EKS 用に差し替えたもの。CI（③まで）は EKS でも同じ。変わるのは成果物の運び方で、output: "standalone" で最小ビルド → Docker イメージ化 → ECR に push（tag は git sha）→ kubectl/Helm で EKS に適用、という経路になる。Next.js 用 Pod と Spring Boot 用 Pod は同一クラスタに同居し、クラスタ内 Service で通信する。認証は OIDC federation で、長期 AWS アクセスキーを GitHub Secrets に置かない。Vercel 前提だった「プレビュー URL」は一時 namespace、「自動ロールバック」は kubectl rollout undo や Canary に置き換わる。',
        node: (
          <Image
            src={eksSvg}
            srcDark={eksDark}
            alt="Next.js を EKS にデプロイする CI/CD パイプライン。CI 検証後に standalone ビルド → Docker イメージ化 → ECR push → kubectl/Helm で EKS に適用。クラスタ内に Next 用 Pod と Spring Boot 用 Pod が同居し Service で通信する。"
          />
        ),
      },
      sources: [
        { tag: "E1", category: "EKS / コンテナデプロイ", href: "https://medium.com/@meet2sudhakar/ci-cd-on-amazon-eks-using-github-actions-an-end-to-end-guide-for-devops-engineers-c707d5919629", text: "CI/CD on Amazon EKS Using GitHub Actions", note: "本構成に最も近い。Dockerfile・k8s マニフェスト・Helm・OIDC・deploy.yml 全部入り。2026 年更新。" },
        { tag: "E2", category: "EKS / コンテナデプロイ", href: "https://itdefined.org/blogs/details/78/build-your-first-end-to-end-cicd-pipeline-on-aws-using-github-actions-ecr-and-eks/", text: "CI/CD on AWS — GitHub Actions + ECR + EKS", note: "OIDC を「アクセスキーを置くな」の観点で解説。Helm values、ハマりどころ集。" },
        { tag: "E3", category: "EKS / コンテナデプロイ", href: "https://medium.com/@modifyljf/aws-eks-github-action-nextjs-part-1-903165663cb9", text: "AWS EKS + GitHub Action + NextJS", note: "Next.js 前提のマルチステージ Dockerfile。やや古くバージョン読み替え要。" },
        { tag: "E4", category: "EKS / コンテナデプロイ", href: "https://nextjs.org/docs/app/getting-started/deploying", text: "Next.js 公式 — Deploying", note: 'output: "standalone" で最小本番イメージ。Kubernetes/Docker 対応の一次情報。' },
        { tag: "E5", category: "EKS / コンテナデプロイ", href: "https://medium.com/@unosega/ci-cd-deployment-for-nextjs-application-using-docker-and-github-actions-on-a-remote-server-b1de03db6414", text: "CI/CD Deployment for Next.js Using Docker and GitHub Actions", note: "standalone ビルドと Dockerfile の具体解説。" },
        { tag: "E6", category: "EKS / コンテナデプロイ", href: "https://github.com/Jareechang/ecs-nextjs", text: "Jareechang/ecs-nextjs (GitHub)", note: "しきい値ベース自動ロールバック付き blue-green canary の実装例。ECS 向けなので EKS には読み替え。" },
      ],
    },

    {
      num: "08",
      id: "sources",
      heading: "引用ソース一覧",
      body: "ページ内で参照した記事を、カテゴリ別に一覧化します。各リンクに位置づけを一言添えています（runtime が各 part の sources から自動集約）。",
      sourceIndex: true,
    },

    {
      num: "09",
      id: "note",
      heading: "注意書き",
      callout: {
        tone: "note",
        items: [
          "これらの図・記事は複数ソースの組み合わせであり、この 1 構成を一枚で説明する公式教材は存在しません。各図は別々の出典から本構成に合わせて再構成したものです。",
          "EKS 教材の多くは汎用 DevOps 例で、Next + TanStack の FE レイヤーとは別レイヤーの話です。FE の設計判断とインフラの手順は分けて読んでください。",
          "価格・ツールの保守状況・バージョンは時間で変わります。実装時には必ず各一次情報で最新を確認してください。",
        ],
      },
    },
  ],
});
