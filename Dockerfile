FROM debian:stable-slim

RUN apt-get update \
  && apt-get install -y \
  curl \
  ca-certificates \
  --no-install-recommends

WORKDIR /app

ENV VOLTA_HOME /root/.volta
ENV PATH $VOLTA_HOME/bin:$PATH
RUN curl https://get.volta.sh | bash
RUN volta fetch node@22.14.0
RUN volta install node@22.14.0
RUN volta install pnpm@10.12.4

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /app/
RUN pnpm install

COPY prisma/ ./prisma/
COPY src/ ./src/
COPY tsconfig.json .
RUN npx prisma generate --schema=prisma/schema.prisma
RUN pnpm run build

ENV PORT 8888
EXPOSE 8888

ENV DATABASE_URL file:/data/meal-log.db
VOLUME /data

COPY dockerStart.sh .

ENTRYPOINT ["./dockerStart.sh"]
