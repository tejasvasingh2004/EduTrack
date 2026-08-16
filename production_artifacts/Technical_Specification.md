# Technical Specification: EduTrack Track A (Auth & Application Pipeline)

## 1. Executive Summary
This specification defines the implementation of the Authentication Module and the Application Pipeline for the EduTrack platform. Auth will rely entirely on our custom two-token JWT architecture (HTTP-only cookies) scaffolded in Phase 0. The Application pipeline will enable public application submissions and an RBAC-protected administrative dashboard backend for reviewing and managing those applications.

## 2. Requirements

### Functional Requirements
**Auth Routes (`app/api/auth/*`)**
- `POST /api/auth/register`: Accepts email, password, and optional LinkedIn URL. Creates a `User` with the default `APPLICANT` role.
- `POST /api/auth/login`: Verifies credentials via bcrypt. Issues short-lived access and long-lived refresh tokens (stored in HTTP-only cookies).
- `POST /api/auth/logout`: Clears the session cookies and revokes the refresh token in the database.
- `GET /api/auth/me`: Retrieves the current user's profile based on the session token.
- `POST /api/auth/refresh`: Rotates the access and refresh tokens.

**Application Pipeline Routes (`app/api/applications/*`)**
- `POST /api/applications/submit`: Authenticated route for `APPLICANT` role. Creates an `Application` record linked to the user with `PENDING` status.
- `GET /api/applications/list`: Protected route (requires `ADMIN` role). Returns a paginated list of all applications, preventing N+1 query issues.
- `PATCH /api/applications/:id/status`: Protected route (requires `ADMIN` role). Transitions an application's status. If the status is transitioned to `APPROVED`, the associated user's role is automatically updated from `APPLICANT` to `STUDENT`.

### Non-Functional Requirements
- **Security**: Strict Role-Based Access Control (RBAC) enforced on all admin routes via `lib/auth/rbac.ts`. Passwords securely hashed with `bcryptjs`.
- **Validation**: Strict input validation using the Zod schemas established in Phase 0 (`lib/validation/*`).
- **Data Integrity**: Database transactions must be used when updating an application to `APPROVED` and elevating a user to `STUDENT` simultaneously.

## 3. Architecture & Tech Stack
- **Framework**: Next.js App Router (using `/app/api/*` directory conventions).
- **Database**: PostgreSQL with Prisma ORM.
- **Validation**: Zod (for request bodies and URL parameters).
- **Auth**: Custom JWT (jose) managed securely via Next.js `cookies()`.

### Module Boundary Enforcement (Track A)
Code will strictly be created inside:
- `app/api/auth/*`
- `app/api/applications/*`
*(No modifications to Track B files or shared schemas.)*

## 4. State Management (Data Flow)
1. **Client Request**: A client calls the API route.
2. **Authentication / RBAC**: The route invokes `requireRole()` to ensure the caller has the necessary permissions (e.g., `ADMIN`).
3. **Validation**: The route parses the request payload or query string using the predefined Zod schema (e.g., `ApplicationStatusUpdateSchema.parse(body)`).
4. **Business Logic & DB Transaction**: Prisma executes the necessary query (using transactions if multiple mutations are required, e.g., Application Status + User Role).
5. **Response**: A standard JSON response is returned to the client.
