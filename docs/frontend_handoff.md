# Frontend Handoff for Sohan Manager Backend

## Purpose

This document summarizes the backend API, frontend expectations, and handoff guidance for the admin frontend team.

## Backend overview

The backend exposes an API under `/api/v1` and supports:

- Admin authentication and authorization
- Admin user management (list, create, update, disable, reset password)
- Admin audit log querying
- Plan and feature management
- Organization and subscription management
- License management, activation, and verification
- Device listing and lifecycle management
- Billing webhook ingestion and invoice persistence
- Health and metrics endpoints for observability

## API contract

The OpenAPI contract is available in `openapi.yaml`.

### Exact backend route mapping

Use `NEXT_PUBLIC_API_BASE_URL` as the frontend API base and append `/api/v1` for backend endpoints.

#### Auth
- `POST /api/v1/admin/token`
  - body: `{ email: string, password: string, expiresIn?: string }`
  - returns `data: { token: string }`
- `POST /api/v1/admin/setup`
  - body: `{ email: string, password: string, role?: string }`
  - only enabled when `ENABLE_ADMIN_BOOTSTRAP=true`

#### Admin management
- `GET /api/v1/admin/admins` — list admins
  - query: `page`, `perPage`, `q`, `sort`
- `POST /api/v1/admin/admins`
  - body: `{ email: string, password: string, role?: 'superadmin' | 'admin' }`
- `PUT /api/v1/admin/admins/:id`
  - body: `{ email?: string, role?: 'superadmin' | 'admin', disabled?: boolean }`
- `POST /api/v1/admin/admins/:id/disable`
- `POST /api/v1/admin/admins/:id/reset-password`
  - body: `{ password: string }`
- `GET /api/v1/admin/admin-audit`
  - query: `adminId`, `action`, `from`, `to`, `page`, `perPage`

#### Feature and plan management
- `GET /api/v1/admin/features`
- `POST /api/v1/admin/features`
  - body: `{ id: string, name: string, valueType: 'boolean' | 'numeric', description?: string }`
- `GET /api/v1/admin/plans`
- `POST /api/v1/admin/plans`
- `GET /api/v1/admin/plans/:id`
- `PUT /api/v1/admin/plans/:id`
- `DELETE /api/v1/admin/plans/:id`
- `GET /api/v1/admin/plans/:planId/entitlements`
- `POST /api/v1/admin/plans/:planId/entitlements`
  - body: `{ entitlements: Array<{ featureId: string, valueType: 'boolean' | 'numeric', booleanValue?: boolean, numericValue?: number }> }`

#### License admin CRUD
- `GET /api/v1/admin/licenses`
- `POST /api/v1/admin/licenses`
- `GET /api/v1/admin/licenses/:id`
- `PUT /api/v1/admin/licenses/:id`
- `DELETE /api/v1/admin/licenses/:id`
- `GET /api/v1/admin/licenses/:licenseId/entitlements/overrides`
- `POST /api/v1/admin/licenses/:licenseId/entitlements/overrides`
  - body: `{ overrides: Array<{ featureId: string, valueType: 'boolean' | 'numeric', booleanValue?: boolean, numericValue?: number }> }`

#### Subscription and organization management
- `GET /api/v1/admin/subscriptions`
- `POST /api/v1/admin/subscriptions`
- `GET /api/v1/admin/subscriptions/:id`
- `PUT /api/v1/admin/subscriptions/:id`
- `DELETE /api/v1/admin/subscriptions/:id`
- `POST /api/v1/admin/subscriptions/:id/renew`
- `POST /api/v1/admin/subscriptions/:id/cancel`
- `POST /api/v1/admin/subscriptions/:id/mark-paid`
- `GET /api/v1/admin/organizations`
- `POST /api/v1/admin/organizations`
- `GET /api/v1/admin/organizations/:id`
- `PUT /api/v1/admin/organizations/:id`
- `DELETE /api/v1/admin/organizations/:id`

#### Device management
- `GET /api/v1/admin/devices`
- `GET /api/v1/admin/devices/:id`
- `DELETE /api/v1/admin/devices/:id`

#### Public license endpoints
- `POST /api/v1/license/activate`
  - body: `{ activationKey: string, deviceId: string (uuid), deviceMeta: { platform: string, manufacturer?: string, model?: string, appVersion: string } }`
- `POST /api/v1/license/verify`
  - body: `{ licenseId: string, deviceId: string (uuid) }`
- `POST /api/v1/license/devices/reset`
  - body: `{ activationKey: string, deviceId: string (uuid) }`
- `GET /api/v1/license/public-keys`

#### Invoice endpoints
- `GET /api/v1/invoice/:id`
- `GET /api/v1/invoice/subscription/:subscriptionId`

#### Billing webhook
- `POST /api/v1/webhooks/billing`
  - body: JSON payload from provider

#### Observability endpoints
- `GET /health`
- `GET /metrics`

> Note: the root routes `GET /api/v1/subscription` and `GET /api/v1/organization` are currently placeholder endpoints and should not be used for frontend data integration.

### Response envelope

All backend responses use the wrapper:

```json
{
  "success": boolean,
  "data": any | null,
  "errors": Array<{ code: string, message: string }>,
  "meta": { timestamp: string, apiVersion: string }
}
```

Frontend should unwrap `data` and use `errors` when `success` is false.

### Naming guidance

- Use `adminId`, `featureId`, `planId`, `licenseId`, `subscriptionId`, and `deviceId` exactly as named in paths and request bodies.
- For admin role values, use lowercase `superadmin` or `admin`.
- For feature/plan entitlement values, use `valueType` = `boolean` or `numeric`, and send `booleanValue` or `numericValue` accordingly.
- Token auth should send `Authorization: Bearer <token>`.
- Prefer storing JWT in an httpOnly cookie for production, but local dev may use in-memory fallback.

### Query and pagination names

- `page`
- `perPage`
- `q` for search across admins
- `sort` for list sorting
- `from` and `to` for audit date filters

### Frontend integration note

- Use `/api/v1/admin` for admin-facing CRUD and management operations.
- Use `/api/v1/license` for license activation, verification, and public keys.
- Use `/api/v1/invoice` for invoice retrieval.
- Do not expose one-time setup unless it is explicitly enabled in the backend environment.

### If you generate client types

- Model names should reflect backend domain entities: `AdminUser`, `AdminAudit`, `Feature`, `Plan`, `License`, `Subscription`, `Organization`, `Device`, `ActivationLog`, `Invoice`.
- Use a shared `ApiResponse<T>` type matching the backend envelope.

### Recommended frontend base URL

Set `NEXT_PUBLIC_API_BASE_URL` to:

- `http://localhost:4000/api` for local dev
- `https://<your-host>/api` in production

### Quick request examples

`POST /api/v1/admin/token`
```json
{ "email": "admin@example.com", "password": "secret", "expiresIn": "1h" }
```

`POST /api/v1/license/activate`
```json
{
  "activationKey": "TEST-KEY",
  "deviceId": "00000000-0000-0000-0000-000000000000",
  "deviceMeta": {
    "platform": "desktop",
    "manufacturer": "Acme",
    "model": "X1",
    "appVersion": "1.0.0"
  }
}
```

`POST /api/v1/admin/admins`
```json
{ "email": "user@example.com", "password": "VeryStrongPass123!", "role": "admin" }
```

- Use JWT returned by `/api/v1/admin/token`
- Prefer storing auth in httpOnly cookie for production
- Use `Authorization: Bearer <token>` for API calls if the cookie is not available
- Protect SuperAdmin UI routes in the frontend based on user role

### Observability endpoints

- `GET /health` — health checks for DB, JWT, signing, webhook secrets
- `GET /metrics` — basic request and error metrics

## Client requirements

- React + TypeScript frontend
- Use TanStack Query for data fetching and caching
- Use Zod for request validation and form validation
- Use Chakra UI or Material UI for UI components
- Use MSW to mock API responses in development tests
- Add Storybook stories for pages and forms

## Important UX rules

- Do not expose database reset or destructive migration actions in the UI
- Confirm destructive actions with modal prompts
- Surface clear error messages from `createResponse` payloads
- Hide or disable SuperAdmin features for non-SuperAdmin users

## Primary UI pages

- `/login`
- `/admin`
- `/admin/admins`
- `/admin/features`
- `/admin/plans`
- `/admin/licenses`
- `/admin/devices`
- `/admin/audit`
- `/settings`

## Handoff artifact checklist

- `openapi.yaml` — full API spec
- `README.md` — repo setup and run instructions
- `docs/frontend_blueprint.md` — frontend architecture and endpoints
- `docs/frontend_handoff.md` — frontend handoff summary
- `.github/workflows/ci.yml` — CI pipeline

## Notes for frontend engineers

- Backend responses use the `createResponse` envelope: `{ success, data, errors?, meta? }`
- Always validate API payloads against the expected schemas
- Use `NEXT_PUBLIC_API_BASE_URL` to target the backend API
- Do not store secrets in frontend source code
