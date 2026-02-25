# Codebase & Session Context

**Last updated:** January 29, 2026

This document summarizes the full project, what was done in recent sessions, and what to do next.

---

## 1. Project Overview

**Name:** Alliance of Independent Physicians (AIP) – Physician Network & Patient Directory  
**Repo:** EnsembleDrPage-main (DRP / Dr Page)

### What it is
- **Dual-audience platform:** Patients (find doctors/practices) and Physicians (join network, dashboard, referrals).
- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind, shadcn/ui. **Static export** (`output: 'export'`) for GoDaddy/Firebase Hosting.
- **Backend:** Separate Node/Express API in `aip-backend/` – Cloud Run (GCP). PostgreSQL (Cloud SQL). JWT auth.
- **API base URL:** `NEXT_PUBLIC_API_URL` → default `https://aip-backend-682175235100.us-central1.run.app`.

### Key routes (frontend)
| Route | Purpose |
|-------|--------|
| `/` | Homepage (light); mission, benefits, CTA |
| `/homedark` | Dark-themed homepage |
| `/doctors` | Doctor directory (filters, API-backed) |
| `/doctors/[slug]` | Doctor profile (public) |
| `/practices` | **Find Practices** – practice directory with map, filters |
| `/practices/view?slug=...` | Single practice view |
| `/join-us` | Sign in / Sign up (API auth); onboarding, application |
| `/doctor/dashboard/*` | Doctor portal (profile, locations, insurance, referrals, find-physician, contacts, etc.) |
| `/admin/*` | Admin dashboard (members, practices, requests, policies, events, etc.) |
| `/patients`, `/physicians` | Audience-specific landing pages |
| `/membership`, `/trustee-board`, `/public-health`, `/medical-students`, `/contact-us` | Content and info pages |

### Data flow (current)
- **Practices:** `GET /api/practices` (public). No `doctorIds` in list response.
- **Doctors:** `GET /api/doctors` (public, optional auth). Returns `practice_id`; used for directory and for “doctors per practice” counts.
- **Auth:** `aip_doctor_token` in localStorage; backend JWT. Admin uses API-only (no local fallback).
- **Staging:** Frontend at `https://staging.aipstl.org` (Firebase Hosting); backend CORS allows that origin. See `docs/GCP_STAGING_DOMAIN_SETUP.md`.

---

## 2. What We Were Doing (Recent Work)

### 2.1 “0 doctors” on Find Practices page (fixed)
**Problem:** Every practice card showed “0 doctors” on `/practices`.

**Causes:**
1. Practice cards used `practice.doctorIds?.length ?? 0`, but the practices API does not return `doctorIds`.
2. `getDoctorsForPractice()` only fetched doctors when the user had a token (`token ? getAllDoctorsArray(token) : []`), so logged-out users saw 0.

**Fixes applied:**
1. **`src/app/practices/page.tsx`**  
   When building `practicesWithDerivedSpecialties`, we now set `doctorCount: practiceDoctors.length` and pass `doctorCount={practice.doctorCount}` into `PracticeCard`.
2. **`src/lib/services/practiceDirectoryService.ts`**  
   `getDoctorsForPractice()` always fetches doctors (including when no token), using the public doctors API:  
   `getAllDoctorsArray(token ?? undefined, { limit: 2000 })`.
3. **`src/lib/api/doctors.ts`**  
   `getAllDoctorsArray(token?, options?: { limit?: number })` so the directory can request a larger limit (e.g. 2000) for accurate counts.

Result: Find Practices shows the correct “X doctors” per practice for both logged-in and logged-out users.

### 2.2 Earlier session (SESSION_CHANGES_SUMMARY.md)
- **Mission statement** updated (home + homedark); new background image and logo in mission section.
- **Dark mode toggle:** Route-based (`/` vs `/homedark`); `useDarkMode`, `DarkModeToggle` in TopBar; home links use `getHomeLink()`.
- **Reviews removed** from home, homedark, physicians, patients, and home sections.
- **Deployment:** Build + zip for GoDaddy; GCP staging doc added.

### 2.3 Backend / admin / doctor dashboard (from conversation summary)
- Admin login: API-only (no hardcoded credentials).
- Backend CORS and frontend default API URL set for staging.
- Doctor **contact phone** optional in Edit Profile; used in visibility/contact card.
- **Insurance:** Medicare/Medicaid only as toggles in InsuranceSection (removed from dropdown).
- **My Contacts** (doctor dashboard): Backend `GET /api/doctors/me/contacts` returns `credentials`, `practice_name`, `city`, `state`, `insurance`; frontend contact cards show them when API sends.
- **Practice view page** uses API via `practiceDirectoryService` (getPracticeBySlug/ById, getDoctorsForPractice).

---

## 3. Key Files Reference

### Practice directory & “doctors” count
- **Practice cards:** `src/components/public/practices/PracticeCard.tsx` – uses `doctorCount` prop or `practice.doctorIds?.length`.
- **Practices page:** `src/app/practices/page.tsx` – `searchPractices()`, `getDoctorsForPractice()`, `doctorCount` passed to card.
- **Service:** `src/lib/services/practiceDirectoryService.ts` – `searchPractices`, `getAllPractices`, `getDoctorsForPractice`, `getPracticeFilterOptions`.
- **API:** `src/lib/api/practices.ts`, `src/lib/api/doctors.ts` – `getPractices`/`getAllPracticesArray`, `getDoctors`/`getAllDoctorsArray`.

### Backend
- **Practices list:** `aip-backend/src/routes/practices.ts` – `GET /` (no doctor count/doctorIds).
- **Doctors list:** `aip-backend/src/routes/doctors.ts` – `GET /` (public; returns `practice_id`).
- **Auth:** `aip-backend/src/routes/auth.ts`; middleware in `aip-backend/src/middleware/auth.ts`.

### Config
- **Frontend API:** `src/lib/api/config.ts` – `API_BASE_URL`, `getToken()`.
- **Next.js:** `next.config.js` – `output: 'export'`, `env.NEXT_PUBLIC_API_URL`.

---

## 4. What’s Done vs What to Continue

### Done
- “0 doctors” on practice cards: fixed (frontend count + public doctors fetch + limit option).
- Practice directory and practice view page use API; doctor count and derived specialties work.
- Admin API-only auth; staging URL and CORS documented; doctor contact phone; insurance dropdown; My Contacts API and UI.

### Optional next steps (no code changes yet)
1. **Backend:** Add `doctor_count` or `doctor_ids` to `GET /api/practices` so the frontend doesn’t need to fetch all doctors for counts (better for large datasets).
2. **Performance:** If there are many practices, the current approach calls `getDoctorsForPractice()` per practice (each call fetches up to 2000 doctors). Consider one bulk “doctors by practice” endpoint or server-side count.
3. **Portal theme:** PortalThemeContext + dark toggle in admin/doctor layouts (from earlier todo list) – completed in that session.

### If you’re continuing development
- Run frontend: `npm run dev` (port 3001).
- Set `NEXT_PUBLIC_API_URL` in `.env.local` to point to your backend (e.g. Cloud Run URL).
- Backend: run from `aip-backend/` with DB env vars; CORS already allows staging and localhost.
- Build static: `npm run build` → `out/`; deploy to GoDaddy (upload `out` contents) or Firebase Hosting (see GCP doc).

---

## 5. Quick Reference

- **Project understanding (legacy/static focus):** `PROJECT_UNDERSTANDING.md`
- **Session changes (mission, dark mode, reviews, deploy):** `SESSION_CHANGES_SUMMARY.md`
- **Staging/GCP (Firebase + Cloud Run + CORS):** `docs/GCP_STAGING_DOMAIN_SETUP.md`
- **GoDaddy deploy:** `DEPLOYMENT_INSTRUCTIONS.md`
