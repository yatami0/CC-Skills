# syntax=docker/dockerfile:1
# マルチステージ・standalone（設計 §4.2）。
# ビルドコンテキストは frontend/（workspace root）。例:
#   docker build -f apps/master/Dockerfile -t master:local .
#
# ランタイムで node_modules を不要にする主役は Next の output: 'standalone'。
# pnpm deploy は前段のコンテキスト切り出し役で、ここでは builder で full workspace を
# install/build し .next/standalone をランタイムへコピーする方式を採る。
ARG NODE_VERSION=24-alpine

FROM node:${NODE_VERSION} AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

FROM base AS builder
# 依存解決に必要な workspace メタを先に入れてキャッシュを効かせる。
COPY pnpm-lock.yaml pnpm-workspace.yaml .npmrc package.json ./
COPY packages ./packages
COPY apps/master ./apps/master
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
# generated は commit 済みのため codegen（specs 参照）は不要。next build が standalone を出す。
RUN pnpm --filter master build

FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -G nodejs -S nextjs

# standalone（outputFileTracingRoot=frontend/ なので apps/master 配下に出力される §4.2）。
COPY --from=builder --chown=nextjs:nodejs /app/apps/master/.next/standalone ./
# standalone は .next/static と public を含まないため別途コピー（§4.2）。
COPY --from=builder --chown=nextjs:nodejs /app/apps/master/.next/static ./apps/master/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/master/public ./apps/master/public

USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "apps/master/server.js"]
