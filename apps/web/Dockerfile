FROM oven/bun:1.3.9

WORKDIR /app

COPY package.json bun.lock turbo.json tsconfig.json ./
COPY apps ./apps
COPY packages ./packages

RUN bun install

EXPOSE 3000

CMD ["bun", "--cwd", "apps/web", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]
