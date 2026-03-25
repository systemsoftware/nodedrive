#! /usr/bin/env bash
SEC=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'));")
SEC2=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'));")
echo "JWT_SECRET=$SEC" >> .env
echo "ID_SECRET=$SEC2" >> .env