Frontend Blueprint & Generator Prompt for SohanManagerBackend

Overview

This file is a single, copy-pasteable blueprint and generator prompt to create a production-ready React + TypeScript admin frontend for the SohanManagerBackend API. Use it with a frontend generator, or hand it to an engineer building the UI.

Goals

- Provide a complete page/component list and mapping to backend APIs (exact Prisma model names and fields).
- Provide API contract guidance, data shapes, Zod schemas, MSW mocks, OpenAPI output requirement.
- Provide security UX and operational cautions (no destructive resets from UI).

Project choices (recommended)

- Framework: Next.js (app router) + React 18+ + TypeScript
- Data fetching: TanStack Query (react-query)
- Validation: Zod
- UI lib: Chakra UI (or Material UI if preferred)
- Testing: Vitest/Jest (unit), Playwright (E2E)
- Mocking: MSW (Mock Service Worker)

Backend models (use exactly these names/fields as in Prisma schema)

- AdminUser
  - id: string (uuid)
  - email: string
  - passwordHash: string
  - role: string (SuperAdmin|admin)
  - isActive: boolean
  - createdAt: DateTime
  - updatedAt: DateTime

- AdminAudit
  - id: bigint
  - adminId: string
  - targetAdminId: string? (nullable)
  - action: string
  - details: string? (nullable)
  - isSuccess: boolean
  - ipAddress: string? (nullable)
  - userAgent: string? (nullable)
  - createdAt: DateTime

- ActivationLog (use existing ActivationLog schema fields: licenseId, deviceId, action, meta, createdAt)
- Device (id, licenseId, fingerprint, lastSeenAt, createdAt, etc.)
- License (id, activationKeyLookup, subscriptionId, entitlements...)
- Feature, Plan, PlanEntitlement, LicenseEntitlementOverride, Organization, Subscription — implement CRUD where applicable.

API Base & Auth

- Base URL: runtime env `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:4000/api`).
- Auth: JWT via `POST /api/admin/token` (returns `createResponse({ token })`). Use httpOnly cookie `__session` in production; for local dev optionally use memory/localStorage token fallback.
- Header: `Authorization: Bearer <token>` for protected API calls.

Response envelope

All responses follow the backend `createResponse` wrapper:
```
{ success: boolean, data: any, errors?: Array<{ code:string, message:string }>, meta?: any }
```

Primary endpoints (frontend should call these routes)

Auth
- POST /api/admin/token
  - Req: { email, password, expiresIn? }
  - Resp: { token }

Admin management (SuperAdmin only)
- GET /api/admins?page=&limit=
  - Resp: { data: [{ id, email, role, isActive, createdAt }], meta: { total, page, limit } }
- POST /api/admins
  - Req: { email, password, role }
  - Resp: created admin
- GET /api/admins/:id
- PUT /api/admins/:id
  - Req: { email?, role?, disabled? }
- POST /api/admins/:id/disable
- POST /api/admins/:id/reset-password
  - Req: { password }
- GET /api/admins/audit?adminId=&action=&page=&limit=
  - Resp: list of `AdminAudit` entries

Features & Plans
- GET /api/features
- POST /api/features
- GET/PUT/DELETE /api/features/:id
- GET /api/plans
- POST /api/plans
- GET/PUT/DELETE /api/plans/:id
- GET /api/plans/:planId/entitlements
- POST /api/plans/:planId/entitlements

Licenses & Devices
- GET /api/licenses
- GET /api/licenses/:id
- POST /api/licenses/:id/activate
  - Req: { deviceFingerprint, metadata? }
  - Resp: signed activation payload
- GET /api/licenses/:id/entitlement-overrides
- GET /api/devices
- GET /api/devices/:id
- POST /api/devices/:id/reset

Audit & logs
- GET /api/admin-audit (filters: adminId, targetAdminId, action, dateFrom, dateTo, success)
- GET /api/activation-logs (filters)

UI Pages & Components

- /login
  - Login form (email, password). Use Zod schema for validation.

- /admin (Dashboard)
  - KPIs: total licenses, active devices, recent activation logs, recent admin audit events.
  - Small charts and recent lists.

- /admin/admins
  - Admins list table: columns Email, Role, Active, CreatedAt, Actions (edit, disable, reset pw, view audit)
  - Create admin modal: fields email, password, role
  - Edit admin modal: email, role, toggle active/disabled
  - Reset password modal: new password
  - Audit viewer: paginated AdminAudit entries

- /admin/features
  - Feature list, create/edit/delete

- /admin/plans
  - Plan list, create/edit/delete
  - Plan entitlements editor: map features to boolean/numeric inputs

- /admin/licenses
  - License list & filters
  - License detail: entitlements, activation logs, devices
  - Activate device modal: POST activate and show signed payload

- /admin/devices
  - Device list, link to license, lastSeenAt

- /admin/audit
  - Global audit feed and filters

- /settings
  - Read-only env info, links for backup/migration (no destructive actions from UI), rate limit settings display

Validation (Zod schemas)

- AdminCreateSchema = z.object({ email: z.string().email(), password: z.string().min(12), role: z.enum(['SuperAdmin','admin']) })
- AdminUpdateSchema = z.object({ email: z.string().email().optional(), role: z.enum(['SuperAdmin','admin']).optional(), disabled: z.boolean().optional() })
- LoginSchema = z.object({ email: z.string().email(), password: z.string().min(8) })
- FeatureSchema etc. mirroring backend fields
- LicenseActivationReq = z.object({ deviceFingerprint: z.string().min(8), metadata: z.record(z.string()).optional() })

Sample AdminAudit entry (for MSW mocks)

{
  "id": 12345,
  "adminId": "uuid-actor",
  "targetAdminId": "uuid-target",
  "action": "admin_created",
  "details": "Created admin foo@example.com role=admin",
  "isSuccess": true,
  "ipAddress": "1.2.3.4",
  "userAgent": "Mozilla/5.0",
  "createdAt": "2026-08-03T12:00:00Z"
}

Security & UX notes

- Store JWT in httpOnly cookie for production; for local dev allow in-memory fallback.
- Protect SuperAdmin routes in UI (hide elements if current user role !== SuperAdmin).
- Confirm destructive actions in modals and log the results.
- Do NOT allow UI to trigger DB resets; only surface migration links and require CLI/CI operations.

Testing & Mocks

- Provide MSW handlers for all endpoints with realistic data shapes and pagination.
- Unit test Zod schemas, forms, and utility helpers.
- Integration tests for login and admin create/update/disable flows.
- E2E tests for core admin flows (login → list admins → create admin → reset pw).

OpenAPI & Deliverables

Request the generator to produce:
- `openapi.yaml` (OpenAPI 3.0) defining all endpoints and schemas above.
- Full Next.js repo scaffold (package.json, tsconfig, eslint, prettier, README).
- MSW mock server and sample data under `src/mocks`.
- Storybook stories for forms and tables.
- Tests (unit+E2E) and CI workflow.
- Component breakdown JSON mapping pages → components → API endpoints used.

Generator prompt (copy-paste)

"Build a production-ready Next.js (app-router) admin frontend in TypeScript for SohanManagerBackend. Use TanStack Query for data fetching, Zod for validation, and Chakra UI (or Material UI) for components. Target modern accessibility and responsive layouts.

Backend base URL: runtime env NEXT_PUBLIC_API_BASE_URL (default http://localhost:4000/api).
Auth: JWT issued by POST /api/admin/token. Use httpOnly cookie `__session` for real deploys; for local dev use localStorage token fallback.

Implement pages: /login, /admin (dashboard), /admin/admins (list/create/edit/disable/reset), /admin/features, /admin/plans, /admin/licenses, /admin/devices, /admin/audit, /settings.

Use the following exact data model names from Prisma: AdminUser, AdminAudit, ActivationLog, Device, License, Feature, Plan, PlanEntitlement, LicenseEntitlementOverride, Organization, Subscription.

Implement API calls matching the endpoint list in this file and return JSON shaped like createResponse({ success,data,errors,meta }). Map API errors to form fields and show friendly toasts.

Add MSW-based mock server for all endpoints using realistic sample data and the sample JSON shapes provided.

Provide:
- Full project scaffold (package.json, tsconfig, eslint, prettier)
- README with run & build instructions (env variables: NEXT_PUBLIC_API_BASE_URL)
- OpenAPI spec file `openapi.yaml` derived from the API contract
- Storybook stories for major components (tables, forms, modals)
- Unit tests for forms and integration tests for admin flows (Vitest/Jest; Playwright for E2E)
- CI workflow to run lint, tests, build.

Operational cautions: Do NOT include private secrets. Prefer httpOnly cookie storage and CSRF protection for state-changing endpoints. Do not call destructive endpoints (like migrations or DB resets) from the frontend—only show links and require SuperAdmin confirmation." 

Notes & Next steps

- I can now generate an OpenAPI contract (`openapi.yaml`) from the routes listed here and scaffold a starter Next.js app with MSW mocks. Tell me if you want the OpenAPI file first or the full scaffold.
