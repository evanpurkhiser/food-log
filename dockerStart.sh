#!/usr/bin/env sh

npx prisma migrate deploy
exec npm start
