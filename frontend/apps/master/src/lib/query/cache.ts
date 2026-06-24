// キャッシュ定数（設計 §3.3）。直書き禁止。具体値は後決め、箱だけ用意する。
// グローバル既定は makeQueryClient に焼き、エンドポイント別はフック呼び出し時に渡す。

/**
 * グローバル staleTime（ミリ秒）。必須: 0 より大きくする（§3.3）。
 * prefetch → hydrate を標準にする以上、0 だとハイドレーション直後に即 refetch して
 * サーバー prefetch が無駄になる（二重フェッチ）。
 */
export const STALE = {
  /** 既定の staleTime。暫定値（確定後に見直す）。 */
  DEFAULT: 60_000,
} as const;

/** gcTime（ミリ秒）。暫定値。 */
export const GC = {
  DEFAULT: 5 * 60_000,
} as const;
