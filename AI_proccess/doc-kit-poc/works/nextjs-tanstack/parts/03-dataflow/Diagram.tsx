import { useId } from "react";

/**
 * 図1: 実行時データフロー（この part 固有の図。色は design-system の diagram.css が token から当てる）。
 * a11y: role="img" ＋ <title>/<desc> を aria-labelledby/aria-describedby で連結（Deque/W3C 推奨）。
 * marker / title / desc の id は useId() で図ごとに自動ユニーク化。
 */
export default function Diagram() {
  const uid = useId().replace(/:/g, "");
  const arrow = `${uid}-arrow`;
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;
  const mk = `url(#${arrow})`;
  return (
    <svg
      viewBox="0 0 680 470"
      role="img"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <title id={titleId}>Next.js + TanStack Query の実行時データフロー</title>
      <desc id={descId}>
        Client Component が TanStack Query の hook を使い、生成済み API クライアント経由で
        Route Handler(BFF) を呼び、Spring Boot に転送する。更新時は invalidateQueries で
        キャッシュを無効化し再取得する。
      </desc>
      <defs>
        <marker
          id={arrow}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path
            d="M2 1L8 5L2 9"
            fill="none"
            stroke="context-stroke"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>
      </defs>

      <text className="th" x="40" y="28">ブラウザ（クライアント）</text>
      <g className="c-blue">
        <rect x="40" y="40" width="280" height="56" rx="8" strokeWidth="0.5" />
        <text className="th" x="180" y="60" textAnchor="middle" dominantBaseline="central">Client Component</text>
        <text className="ts" x="180" y="80" textAnchor="middle" dominantBaseline="central">一覧 / 詳細 / 更新フォーム</text>
      </g>
      <g className="c-blue">
        <rect x="40" y="116" width="280" height="56" rx="8" strokeWidth="0.5" />
        <text className="th" x="180" y="136" textAnchor="middle" dominantBaseline="central">useQuery / useMutation</text>
        <text className="ts" x="180" y="156" textAnchor="middle" dominantBaseline="central">取得・更新・状態管理</text>
      </g>
      <g className="c-teal">
        <rect x="40" y="192" width="280" height="56" rx="8" strokeWidth="0.5" />
        <text className="th" x="180" y="212" textAnchor="middle" dominantBaseline="central">QueryCache</text>
        <text className="ts" x="180" y="232" textAnchor="middle" dominantBaseline="central">queryKey 単位で保持</text>
      </g>
      <g className="c-gray">
        <rect x="40" y="268" width="280" height="56" rx="8" strokeWidth="0.5" />
        <text className="th" x="180" y="288" textAnchor="middle" dominantBaseline="central">生成APIクライアント</text>
        <text className="ts" x="180" y="308" textAnchor="middle" dominantBaseline="central">OpenAPIから型付き生成</text>
      </g>

      <text className="th" x="400" y="28">サーバー</text>
      <g className="c-purple">
        <rect x="400" y="116" width="240" height="56" rx="8" strokeWidth="0.5" />
        <text className="th" x="520" y="136" textAnchor="middle" dominantBaseline="central">Route Handler（BFF）</text>
        <text className="ts" x="520" y="156" textAnchor="middle" dominantBaseline="central">認証付与・整形</text>
      </g>
      <g className="c-coral">
        <rect x="400" y="268" width="240" height="56" rx="8" strokeWidth="0.5" />
        <text className="th" x="520" y="288" textAnchor="middle" dominantBaseline="central">Spring Boot</text>
        <text className="ts" x="520" y="308" textAnchor="middle" dominantBaseline="central">REST API / DB</text>
      </g>

      <line x1="180" y1="96" x2="180" y2="114" className="arr" markerEnd={mk} />
      <line x1="180" y1="172" x2="180" y2="190" className="arr" markerEnd={mk} />
      <line x1="180" y1="248" x2="180" y2="266" className="arr" markerEnd={mk} />
      <line x1="320" y1="296" x2="398" y2="160" className="arr" markerEnd={mk} />
      <line x1="520" y1="172" x2="520" y2="266" className="arr" markerEnd={mk} />

      <text className="ts" x="350" y="360" textAnchor="middle">
        更新成功 → invalidateQueries → QueryCache を無効化 → 自動で再取得
      </text>
      <path
        className="dia-loop"
        d="M180 410 L40 410 L40 250"
        strokeWidth="1"
        strokeDasharray="5 5"
        markerEnd={mk}
      />
      <text className="ts" x="190" y="414">更新後の再取得ループ</text>
    </svg>
  );
}
