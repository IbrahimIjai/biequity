FROM oven/bun:1.3.9

WORKDIR /app

COPY package.json bun.lock turbo.json tsconfig.json ./
COPY apps ./apps
COPY packages ./packages

RUN bun install

EXPOSE 8787

CMD ["bun", "--cwd", "apps/cloudfare-worker", "run", "dev", "--", "--ip", "0.0.0.0", "--port", "8787", "--local"]
