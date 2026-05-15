FROM node:20-alpine AS api-build
WORKDIR /app/api
COPY api/package*.json ./
COPY api/prisma ./prisma
RUN npm ci
COPY api/ ./
RUN npx prisma generate && npm run build

FROM node:20-alpine AS web-build
WORKDIR /app/web
COPY web/package*.json ./
RUN npm ci
COPY web/ ./
RUN npm run build -- --configuration=production

FROM node:20-alpine
WORKDIR /app/api
ENV NODE_ENV=production
COPY api/package*.json ./
COPY api/prisma ./prisma
RUN npm ci --omit=dev
COPY --from=api-build /app/api/dist ./dist
COPY --from=api-build /app/api/node_modules/.prisma ./node_modules/.prisma
COPY --from=web-build /app/web/dist/web/browser ./public

ENV PORT=3000
EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy || npx prisma db push && exec node dist/index.js"]
