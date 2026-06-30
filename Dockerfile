FROM oven/bun:1-alpine AS base
WORKDIR /app

# Install dependencies into a temp directory to cache them
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Copy dependencies and project files for build
FROM base AS build
COPY --from=install /temp/dev/node_modules ./node_modules
COPY . .

# Set up build-time environment variables for Next.js inlining
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js application
RUN bun run build

# Production runner image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENV NEXT_TELEMETRY_DISABLED=1

# Copy all source and config files needed for runtime build
COPY --from=build /app/package.json ./
COPY --from=build /app/bun.lock ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.ts ./
COPY --from=build /app/postcss.config.mjs ./
COPY --from=build /app/tsconfig.json ./
COPY --from=build /app/app ./app
COPY --from=build /app/components ./components
COPY --from=build /app/lib ./lib

EXPOSE 3000

CMD ["sh", "-c", "bun run build && bun run start"]
