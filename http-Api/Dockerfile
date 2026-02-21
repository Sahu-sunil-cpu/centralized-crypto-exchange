FROM oven/bun:1

WORKDIR /usr/src/path

COPY package.json bun.lock ./
RUN bun install 

COPY . .
EXPOSE 3001
CMD [ "bun", "run", "index.ts" ]