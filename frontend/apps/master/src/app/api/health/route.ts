// 疎通・監視用ヘルスチェック（設計 §2.2 / DoD）。
// /api/health は static route として catch-all proxy より優先され、backend に届かず
// Next 自身が応答する（コンテナ起動後の liveness/readiness 用）。
export const dynamic = 'force-dynamic';

export function GET(): Response {
  return Response.json({ status: 'ok', service: 'master' });
}
