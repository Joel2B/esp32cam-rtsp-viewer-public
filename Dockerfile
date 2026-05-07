FROM cgr.dev/chainguard/node:latest-dev AS deps
WORKDIR /app
COPY --chown=65532:65532 package*.json ./
RUN npm ci

FROM cgr.dev/chainguard/node:latest-dev AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --chown=65532:65532 --from=deps /app/node_modules ./node_modules
COPY --chown=65532:65532 . .
RUN npm run build

FROM cgr.dev/chainguard/node:latest AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --chown=65532:65532 --from=builder /app/public ./public
COPY --chown=65532:65532 --from=builder /app/.next/static ./.next/static
COPY --chown=65532:65532 --from=builder /app/.next/standalone ./

EXPOSE 3000
CMD ["server.js"]
