FROM node:16

WORKDIR /app
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

RUN apk --no-cache --virtual build-dependencies add \
  python3 \
  make \
  g++

RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i; \
  else echo "Warning: Lockfile not found. It is recommended to commit lockfiles to version control." && yarn install; \
  fi \
  && apk del build-dependencies

COPY src ./src
COPY public ./public
COPY next.config.js .
COPY tsconfig.json .

ENV NEXT_TELEMETRY_DISABLED 1

CMD \
  if [ -f yarn.lock ]; then yarn dev; \
  elif [ -f package-lock.json ]; then npm run dev; \
  elif [ -f pnpm-lock.yaml ]; then pnpm dev; \
  else yarn dev; \
  fi