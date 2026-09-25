# Frontend Architecture Challenge

A feature-based monorepo containing two independently deployable Next.js applications and a lightweight shared API.

The architecture intentionally shares **technical infrastructure**, while keeping **product-specific models and behavior application-owned**.

```text
API owns security.
Frontend owns experience.
Shared packages own technical capabilities.
Features own product behavior.
```

---

## Overview

The repository contains three independently runnable applications:

```text
apps/
├── admin/      # Next.js — port 3000
├── profile/    # Next.js — port 3001
└── api/        # Hono — port 4000
```

The two frontend applications represent different product surfaces:

- **Admin** manages users: list, search, filtering, details, and editing.
- **Profile** allows an authenticated user to view and edit their own profile.
- **API** provides authentication, authorization, and an in-memory data source.

The API is intentionally lightweight. Its purpose in this challenge is to provide a realistic HTTP and security boundary without turning the assignment into a backend architecture exercise.

---

## Repository Structure

```text
.
├── apps/
│   ├── admin/
│   │   └── src/
│   │       ├── app/
│   │       │   └── providers.tsx
│   │       ├── components/
│   │       ├── features/
│   │       │   ├── auth/
│   │       │   └── user-administration/
│   │       └── proxy.ts
│   │
│   ├── profile/
│   │   └── src/
│   │       ├── app/
│   │       │   └── providers.tsx
│   │       ├── components/
│   │       ├── features/
│   │       │   ├── auth/
│   │       │   └── profile/
│   │       └── proxy.ts
│   │
│   └── api/
│       └── src/
│           ├── features/
│           │   ├── auth/
│           │   ├── admin-users/
│           │   └── profile/
│           ├── infrastructure/
│           │   └── persistence/
│           └── server.ts
│
├── packages/
│   ├── ui/
│   ├── auth/
│   ├── http/
│   ├── eslint-config/
│   └── typescript-config/
│
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## Architecture

### Applications own product behavior

Product-specific code stays inside the application that owns it.

For example:

```text
apps/admin/src/features/user-administration
```

owns:

```text
User list
User filters
User details
User editing
Admin-specific user model
Admin-specific API calls
```

while:

```text
apps/profile/src/features/profile
```

owns:

```text
Current profile
Profile editing
Profile-specific model
Profile-specific API calls
```

The two applications never import product code from each other.

---

## Shared Packages

### `@platform/ui`

Contains the Tailwind primitives shared by both products.

Examples:

```text
Button
Input
Label
Card
Table
Select
Alert
Skeleton
```

It must not contain product-specific components such as:

```text
UserTable
ProfileForm
UserStatusBadge
```

---

### `@platform/http`

Provides transport-level HTTP behavior only.

Responsibilities include:

```text
GET / POST / PATCH helpers
JSON parsing
credentials handling
error normalization
AbortSignal forwarding
common request behavior
```

It does not know about users, profiles, or product-specific endpoints.

This is correct:

```ts
http.get('/api/backend/admin/users')
```

This is intentionally avoided:

```ts
http.getUsers()
```

Endpoint knowledge belongs to the feature that owns it.

---

### `@platform/auth`

Provides the frontend authentication interface.

The package is split so the browser bundle never loads the server helper:

```text
src/types.ts     Session type and cookie name
src/client.ts    login(), logout(), getSession()
src/server.ts    getServerSession()
```

It does **not** sign or verify JWTs and does not contain the authentication secret.

The API is the only component allowed to own:

```text
jose
AUTH_SECRET
JWT signing
JWT verification
authorization rules
```

---

## Dependency Direction

The intended dependency direction is:

```text
Application
    ↓
Feature
    ↓
Shared technical packages
```

Allowed:

```text
admin → @platform/ui
admin → @platform/http
admin → @platform/auth

profile → @platform/ui
profile → @platform/http
profile → @platform/auth
```

Not allowed:

```text
admin → profile
profile → admin

ui → admin
ui → profile

shared package → product feature
```

Feature internals are also kept private behind the feature's public `index.ts` where practical.

---

## Product Models

The project intentionally does not define a single shared `User` model.

There are three different representations.

### Persistence model

The API stores an internal:

```text
UserRecord
```

which may contain fields that must never leave the backend, such as a password.

### API representations

The API exposes separate response shapes:

```text
AdminUserResponse
ProfileResponse
```

### Frontend models

The applications own their own models:

```text
Admin   → ManagedUser
Profile → Profile
```

For example, the storage layer may contain:

```text
name
role
status
```

while the profile application receives and works with:

```text
displayName
email
```

`role` and `status` are not part of the profile model.

The distinction is intentional:

```text
Persistence Model
≠
API Representation
≠
Frontend Model
```

Small duplication is preferred over introducing a shared product model that couples independently evolving applications.

---

## State Ownership

State is split according to responsibility.

| State | Owner |
|---|---|
| Remote/server data | TanStack Query |
| URL state | nuqs |
| Form state | React Hook Form |
| Validation | Zod |
| Local UI state | React `useState` / `useReducer` |
| Global client state | Not currently required |

For example, the admin user list stores:

```text
page
q
role
status
```

in the URL:

```text
/users?page=2&q=ali&role=member&status=active
```

This makes filtering:

```text
refresh-safe
shareable
bookmarkable
compatible with browser navigation
```

Zustand is intentionally not included because the current requirements do not contain shared client-only state that justifies a global store.

---

## Authentication and Authorization

Authentication uses a signed JWT stored in an `httpOnly` cookie.

The token is never stored in `localStorage`.

Cookie configuration:

```text
httpOnly: true
SameSite: Lax
secure: true in production
```

Authentication authority belongs exclusively to the API.

---

## Trust Boundaries

Route protection is intentionally split into three levels.

### 1. `proxy.ts`

Each Next.js application has:

```text
src/proxy.ts
```

It only checks whether the authentication cookie exists.

If the cookie is missing, the user is redirected to `/login`.

The proxy does not decode or trust JWT claims.

Its purpose is early navigation control, not security.

---

### 2. Server layout

Protected layouts call:

```text
getServerSession()
```

which forwards the current request cookie to:

```text
GET /auth/me
```

The API validates the session and returns the authenticated identity.

The Admin application can then determine whether the current user has the required role.

---

### 3. API authorization

The API is the final security boundary.

The token only identifies the user. Role and status are read from the current stored record, so a demotion or suspension takes effect before the token expires.

Examples:

```text
unauthenticated request
→ 401

member requests admin resource
→ 403
```

Frontend route guards exist for user experience only.

They are never treated as authorization.

```text
UI is not a security boundary.
```

---

## Same-Origin API Strategy

Both Next.js applications expose:

```text
/api/backend/*
```

and rewrite those requests to the Hono API running on port `4000`.

For example:

```text
Browser
   ↓
http://localhost:3000/api/backend/admin/users
   ↓
Next.js rewrite
   ↓
http://localhost:4000/admin/users
```

From the browser's perspective the request remains same-origin.

This avoids introducing unnecessary cross-origin authentication complexity into the challenge.

---

## Server-Side Session Requests

Browser-side requests can rely on the browser's cookie behavior.

Server Components cannot.

`getServerSession()` therefore forwards the cookie from the current Next.js request when calling the API directly.

This distinction is intentional:

```text
Browser request
→ browser manages cookies

Server request
→ current request cookie is forwarded explicitly
```

---

## Production Considerations

The challenge uses same-origin API rewrites to keep the authentication setup focused on the frontend architecture.

On localhost, cookies are scoped to the host rather than the port, so the applications running on ports `3000` and `3001` can participate in the same session strategy.

A production deployment such as:

```text
admin.example.com
profile.example.com
api.example.com
```

would require an explicit authentication architecture, such as a shared cookie-domain strategy or centralized authentication gateway.

That infrastructure is intentionally outside the scope of this challenge.

---

## Technology Decisions

### Next.js 16 + React 19

Next.js provides application routing, layouts, server rendering boundaries, and `proxy.ts` while keeping each product independently deployable.

### pnpm + Turborepo

The repository contains multiple applications and shared packages.

A monorepo allows:

```text
shared tooling
shared UI
atomic changes
consistent dependency management
independent application builds
```

without requiring separate repositories.

### Tailwind CSS

The challenge suggests Material UI to move faster. `@platform/ui` instead holds a small set of Tailwind primitives that both products import. Product screens such as the user table and profile form stay in their features, so the shared package does not depend on a third-party theme API.

### TanStack Query

Used for remote asynchronous state that benefits from:

```text
caching
deduplication
mutation
invalidation
refetching
```

### nuqs

Used when application state belongs in the URL, such as:

```text
pagination
search
filters
```

### React Hook Form + Zod

React Hook Form manages form state while Zod provides runtime validation.

### Hono

The backend is deliberately small.

Hono provides the HTTP boundary required by the challenge without introducing a large backend framework or unnecessary infrastructure.

---

## Why No Global State Manager?

No state in the current requirements justifies one.

Current ownership is already explicit:

```text
URL state     → nuqs
Remote state  → TanStack Query
Form state    → React Hook Form
Local state   → React
```

If future requirements introduce shared, client-only state that does not naturally belong to one of these categories, a dedicated state manager such as Zustand can be introduced then.

---

## Why Two Applications?

Admin and Profile are separate product surfaces with different responsibilities and different product models.

Keeping them as separate Next.js applications provides:

```text
independent deployment
clear ownership
strong product boundaries
isolated routing
independent evolution
```

while shared technical concerns remain reusable through workspace packages.

The architecture does not use Microfrontends or runtime federation.

Sharing happens at build time through the monorepo.

---

## Why Not Microfrontends?

The current requirements do not require:

```text
runtime composition
independent frontend runtimes
Module Federation
remote UI loading
different frontend frameworks
```

Two independently deployable applications are sufficient.

Introducing Microfrontends would add runtime and operational complexity without solving a demonstrated requirement.

---

## Testing Strategy

The implemented test scope focuses on high-value behavior rather than coverage percentage.

### API

Vitest covers:

```text
login
session validation
invalid / expired sessions
401 responses
403 responses
profile update restrictions
validation schemas
```

### Frontend

React Testing Library is used for meaningful form behavior, including:

```text
login validation
admin user edit validation
profile edit validation
```

### E2E

End-to-end tests are intentionally not implemented in this challenge.

The next testing layer would use Playwright for these critical journeys:

```text
Admin:
Login → Search User → Details → Edit → Save

Profile:
Login → Edit Own Profile → Save

Authorization:
Member → Admin Area → Access Denied
```

---

## Scalability

### Adding a feature

A new feature is added inside the application that owns it:

```text
apps/<product>/src/features/<feature>
```

The feature owns its:

```text
API integration
model
schema
components
hooks
product behavior
```

---

### Adding a product

A new product can be introduced as another Next.js application:

```text
apps/new-product
```

It can reuse:

```text
@platform/ui
@platform/http
@platform/auth
shared tooling
```

without importing domain models from Admin or Profile.

---

### Adding teams

The existing application and feature boundaries provide natural ownership boundaries.

As teams grow, ownership can follow:

```text
Team Admin
→ apps/admin

Team Profile
→ apps/profile

Platform Team
→ packages/*
```

without requiring the architecture to be redesigned first.

---

## Data Persistence

The API currently uses in-memory persistence.

Restarting the API restores the seed data.

This is intentional.

The assignment requires an API boundary, not production persistence infrastructure.

A real implementation could replace the in-memory repository without changing the frontend architecture.

---

## Running the Project

Install dependencies:

```bash
pnpm install
```

Start all applications:

```bash
pnpm dev
```

Local applications:

```text
Admin    http://localhost:3000
Profile  http://localhost:3001
API      http://localhost:4000
```

---

## Environment Variables

For development, the API can fall back to:

```text
AUTH_SECRET=dev-only-change-me
```

Production requires an explicit secret.

Example:

```bash
AUTH_SECRET=replace-with-a-secure-value
API_URL=http://localhost:4000
```

No production secret should be committed to the repository.

---

## Demo Accounts

### Admin

```text
Email:    admin@example.com
Password: admin12345
```

### Member

```text
Email:    member@example.com
Password: member12345
```

---

## Trade-offs

This architecture deliberately accepts some duplication between applications and API representations.

That duplication is preferred over prematurely introducing:

```text
shared domain models
generic contract packages
global state
DDD layers
Microfrontends
complex backend infrastructure
```

The architecture is optimized for:

```text
clear ownership
controlled dependencies
low cognitive overhead
independent product evolution
low cost of future change
```

rather than maximum abstraction.

---

## Guiding Principles

```text
Share infrastructure, not product models.

API owns security.
Frontend owns experience.

Shared packages own technical capabilities.
Features own product behavior.

Prefer explicit ownership over global abstractions.

Introduce complexity only when a demonstrated requirement justifies it.
```
