FROM oven/bun:latest
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install
COPY . .
EXPOSE 3030
ENV PORT=3030
CMD ["bun", "run", "src/server.ts"]
