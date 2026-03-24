#! /usr/bin/env bash
SEC=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'));")
echo "JWT_SECRET=$SEC" >> .env