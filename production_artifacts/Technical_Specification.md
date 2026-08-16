# Technical Specification: EduTrack Track A (Frontend UI & Portals)

## 1. Executive Summary
This specification defines the frontend architecture and user interface implementation for Track A. It covers the public-facing authentication pages (Login, Register/Apply) and the secure, role-based portal shells (Admin, Mentor, Student). The design will prioritize **premium aesthetics** (dark mode by default, glassmorphism, vibrant gradients, and smooth micro-animations) to deliver a modern, high-end user experience.

## 2. Requirements

### Functional Requirements
**Public Routes:**
- `app/login/page.tsx`: A sleek login form that authenticates the user via the `/api/auth/login` endpoint and redirects them to their respective portal based on their role (`ADMIN`, `MENTOR`, `STUDENT`, `APPLICANT`).
- `app/register/page.tsx` (Public Application): A dynamic, multi-step-feel form calling `/api/applications/submit` to capture an applicant's details.

**Portal Shells (RBAC Protected):**
- `app/(admin)/layout.tsx`: A robust sidebar navigation layout restricted to Admins.
- `app/(admin)/page.tsx`: The primary Admin Dashboard. Features a data table displaying all applications (fetched from `/api/applications/list`) with quick-action buttons to `APPROVE`, `REJECT`, or `WAITLIST` applications.
- `app/(mentor)/layout.tsx`: A clean, focused portal shell for Mentors (content to be populated in Track B).
- `app/(student)/layout.tsx`: A personalized dashboard shell for Students (content to be populated in Track B).

### Non-Functional Requirements
- **Aesthetics**: Premium Dark Mode. Deep backgrounds (e.g., `bg-neutral-950`), subtle vibrant glows (using Tailwind `bg-gradient-to-r` with blur utilities), and glassmorphic cards (`bg-white/5 backdrop-blur-md`).
- **Interactions**: Smooth hover states, focus rings, and micro-animations on buttons and form inputs.
- **Client-Server State**: React Server Components where possible, sprinkled with minimal Client Components (`"use client"`) for interactivity (forms, state management, toasts).

## 3. Architecture & Tech Stack
- **Framework**: Next.js App Router.
- **Styling**: Tailwind CSS v4 (already configured).
- **Icons**: `lucide-react` (needs to be installed) for crisp, modern SVG icons.
- **Data Fetching**: Native `fetch` utilizing our custom `api` routes, authenticated seamlessly via the HTTP-only cookies we set up in the backend phase.

## 4. State Management (Data Flow)
1. **Forms**: Controlled via React state (`useState`), handled on submit by calling our Next.js API routes.
2. **Dashboard Hydration**: The Admin Dashboard will fetch the application list on mount and maintain an optimistic local state when an Admin clicks "Approve", instantly reflecting the UI change while the API request processes in the background.
3. **Routing**: `next/navigation` (`useRouter`) will be used to intelligently redirect users to the correct portals post-login.

---

> [!IMPORTANT]
> **PM Approval Gate:** Do you approve of this frontend technical specification for Track A? You can safely add comments or modifications directly if you want me to rework anything! Click **Proceed** (or reply "Yes") if approved, and I will generate the code.
