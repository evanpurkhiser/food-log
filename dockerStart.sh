#!/usr/bin/env sh

npx prisma migrate deploy
exec pnpm start server
