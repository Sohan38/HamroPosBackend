# Sohan Manager Backend

Enterprise licensing backend for Sohan Manager.

## Overview

This repository provides the backend API, authentication, licensing, billing webhook handling, admin user management, and observability endpoints for Sohan Manager. It is designed to support a separate frontend admin portal and a license activation client.

## Key features

- Admin authentication with JWT and role-based authorization
- One-time bootstrap admin setup support
- License activation and verification with Ed25519 signing
- Billing webhook replay protection and invoice persistence
- Health and metrics endpoints for observability
- Typed schemas, Prisma ORM, Express middleware, and GitHub Actions CI

## Setup

1. Install dependencies

```bash
npm ci
```

2. Generate Prisma Client

```bash
npm run prisma:generate
```

3. Build the backend

```bash
npm run build
```

4. Run tests

```bash
npm test
```

## Scripts

- `npm run dev` — run development server with ts-node-dev
- `npm run build` — compile TypeScript
- `npm start` — run compiled server
- `npm run lint` — run ESLint
- `npm test` — run Vitest test suite
- `npm run prisma:generate` — generate Prisma client
- `npm run prisma:migrate` — apply Prisma migrations locally
- `npm run seed` — run database seed script
- `npm run seed:admin` — seed initial admin user

## Environment variables

Defined in `src/config/env.ts`.

- `NODE_ENV` — environment (default `development`)
- `PORT` — server port (default `4000`)
- `DATABASE_URL` — Prisma database connection string
- `SERVER_PEPPER` — server-side pepper for activation key hashing
- `ED25519_PRIVATE_KEY` — private key for license payload signing
- `ED25519_PUBLIC_KEY` — legacy public key for signature verification
- `ED25519_PUBLIC_KEYS` — comma/newline-separated rotated public keys
- `ADMIN_API_KEY` — admin bootstrap API key
- `JWT_SECRET` — JWT signing secret
- `JWT_EXPIRES_IN` — token expiration string (default `1h`)
- `RATE_LIMIT_WINDOW_MS` — rate limit window
- `RATE_LIMIT_MAX` — max requests per window
- `ENABLE_ADMIN_BOOTSTRAP` — allow one-time admin setup
- `BILLING_WEBHOOK_SECRET` — generic billing webhook verification secret
- `BILLING_PROVIDER` — billing provider name
- `BILLING_STRIPE_WEBHOOK_SECRET` — Stripe webhook secret
- `ALLOWED_ORIGINS` — comma-separated allowed CORS origins

> In production, `ALLOWED_ORIGINS`, `DATABASE_URL`, `JWT_SECRET`, and an Ed25519 key pair are required. If `ENABLE_ADMIN_BOOTSTRAP=true`, `ADMIN_API_KEY` must also be set.

## Deployment

This backend is production-ready with the following deployment flow:

1. Build the app:
   ```bash
   npm ci
   npm run prisma:generate
   npm run build
   ```
2. Provide production environment variables and run the compiled server:
   ```bash
   NODE_ENV=production npm start
   ```
3. Use the Docker image:
   ```bash
   docker build -t sohan-manager-backend .
   docker run -p 4000:4000 --env-file .env sohan-manager-backend
   ```

In production, disable `ENABLE_ADMIN_BOOTSTRAP` after the initial admin account has been created to prevent accidental bootstrap reuse.

## Observability

- `/health` — returns component health for DB, JWT, signing keys, webhook config
- `/metrics` — returns request and error metrics for the backend

## API contract

The API base path is `/api/v1`.

- Authentication routes are under `/api/v1/admin`
- License routes are under `/api/v1/license`
- Invoice routes are under `/api/v1/invoice`
- Billing webhook is `/api/v1/webhooks/billing`

See `openapi.yaml` for the full OpenAPI specification.

## Frontend handoff

- Primary frontend blueprint: `docs/frontend_blueprint.md`
- Full API contract: `openapi.yaml`
- Additional frontend handoff summary: `docs/frontend_handoff.md`

## CI

GitHub Actions CI is configured in `.github/workflows/ci.yml`.

## Notes

- The repository is currently at phase 7: frontend handoff and documentation.
- The backend has been validated with `npm run build` and `npm test`.
- Do not expose destructive tooling to the frontend; use the backend only for safe admin and license operations.
