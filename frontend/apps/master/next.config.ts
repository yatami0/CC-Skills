import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // EKS / コンテナ前提。standalone を最初から有効化（§4.2）。
  output: 'standalone',
  // pnpm workspace では node_modules が workspace root にホイストされるため、
  // トレース基準を frontend/ に合わせる（未設定だと root 依存を取りこぼす §4.2）。
  outputFileTracingRoot: path.join(import.meta.dirname, '../../'),
  reactStrictMode: true,
  // 生成物・型は型エラーを既に typecheck ゲートで見るため build で二重に止めない、ではなく
  // CI で tsc / eslint を別途回す前提（§4.1）。build 内の lint は無効化して責務を分離する。
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
