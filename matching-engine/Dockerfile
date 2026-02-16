FROM oven/bun:1

WORKDIR /usr/src/path

COPY package.json bun.lock ./
RUN bun install 

COPY . .

CMD [ "bun", "run", "index.ts" ]