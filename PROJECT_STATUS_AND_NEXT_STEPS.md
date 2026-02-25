# Project Status & Next Steps

**Last updated:** January 29, 2026

---

## 1. What This Project Is

**Alliance of Independent Physicians (AIP)** – A dual-audience platform:

- **Patients**: Find doctors, view profiles, see practices, request appointments.
- **Physicians**: Join the network, manage profile, locations, insurance, referrals, membership.
- **Admins**: Manage join requests, members, memberships, policies, events.

**Stack:**

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind, shadcn/ui. **Static export** (`output: 'export'`) for GoDaddy/Firebase.
- **Backend**: Separate Node/Express API (`aip-backend/`) on GCP Cloud Run. PostgreSQL (Cloud SQL). JWT auth.
- **API**: Frontend talks to `NEXT_PUBLIC_API_URL` (default: `https://aip-backend-682175235100.us-central1.run.app`). Token in `localStorage` (`aip_doctor_token`).

**Important:** The app is **not** “no backend” anymore. Doctors, practices, join requests, referrals, etc. come from the API where implemented; some flows still use localStorage/static data for legacy or fallback.

---

## 2. What Was Done Recently

### 2.1 Practice directory “0 doctors” fix (latest)

- **Issue:** Find Practices page showed “0 doctors” for every practice.
- **Cause:**  
  - Practice cards used `practice.doctorIds?.length` or optional `doctorCount`, but the practices API doesn’t return `doctorIds`.  
  - `getDoctorsForPractice()` only called the doctors API when the user had a token, so for logged-out users the list was empty.
- **Changes:**
  - **`src/app/practices/page.tsx`**: When computing derived specialties per practice, we now also set `doctorCount: practiceDoctors.length` and pass `doctorCount={practice.doctorCount}` into `PracticeCard`.
  - **`src/lib/services/practiceDirectoryService.ts`**: `getDoctorsForPractice()` now always fetches doctors (public API), e.g. `getAllDoctorsArray(token ?? undefined, { limit: 2000 })`, so counts work for unauthenticated users.
  - **`src/lib/api/doctors.ts`**: `getAllDoctorsArray(token?, options?)` now accepts optional `{ limit }` so the directory can request enough doctors for accurate counts.

Result: Practice directory shows the correct “X doctors” per practice for both logged-in and logged-out users.

### 2.2 Earlier session (from SESSION_CHANGES_SUMMARY)

- Mission statement update (new text, logo, background image).
- Dark mode toggle: switch between `/` (light) and `/homedark` (dark); preference in localStorage; TopBar, Header, Footer use dynamic home link.
- Reviews removed from homepage, homedark, physicians, patients, and home sections.
- Deployment prep: build, deployment zip for GoDaddy.

### 2.3 Backend / staging (from conversation summary)

- Admin auth: API-only (no local fallback); `adminSession` and admin login use backend.
- Frontend API URL and CORS set for staging; `docs/GCP_STAGING_DOMAIN_SETUP.md` for staging.aipstl.org.
- Doctor dashboard “My Contacts”: backend returns `credentials`, `practice_name`, `city`, `state`, `insurance`; contact cards show them when present.
- Optional “Contact Phone” in Edit Profile; visibility service uses it for private contact card.

---

## 3. Key Paths in the Codebase

| Area | Paths |
|------|--------|
| Practice directory | `src/app/practices/page.tsx`, `src/components/public/practices/PracticeCard.tsx`, `src/lib/services/practiceDirectoryService.ts`, `src/lib/api/practices.ts`, `src/lib/api/doctors.ts` |
| Doctor directory | `src/app/doctors/`, `src/components/DoctorCard.tsx`, `src/components/DoctorFilters.tsx`, `src/lib/api/doctors.ts` |
| Doctor dashboard | `src/app/doctor/dashboard/`, `src/components/dashboard/`, `src/lib/useDoctorSession.ts` |
| Admin | `src/app/admin/`, `src/components/admin/`, `src/lib/adminSession.ts` |
| Join / auth | `src/app/join-us/`, `src/lib/api/config.ts` (getToken, API_BASE_URL) |
| Backend API | `aip-backend/src/` (routes: doctors, practices, auth, join-requests, etc.; middleware: auth, cors; db: connection) |

---

## 4. Suggested “Continue the Work” Next Steps

### High impact (fixes / completeness)

1. **Verify practice doctor count in production**
   - Deploy frontend and hit Find Practices; confirm “X doctors” matches backend (and that doctors have `practice_id` and are `verified` so they appear in the public doctors list).

2. **Backend: doctor count or `doctorIds` on practices**
   - Optional improvement: have `GET /api/practices` (or single practice) return `doctor_count` or `doctorIds` so the frontend doesn’t need to fetch all doctors for counts (better for scale). Frontend already supports `doctorCount` prop and `practice.doctorIds?.length` fallback.

3. **Admin login**
   - Ensure admin login is only via API (no hardcoded credentials). Document admin user creation in backend/DB if needed.

### Product / roadmap (from ROADMAP.md and AIP_Website_Recommendations)

4. **Persona-based homepage**
   - AIP recommendations: Patient vs Physician persona selection, separate content and CTAs. Partially present (e.g. AudienceSwitchFloating, patients/physicians pages). Next: tighten homepage around persona and ensure nav/CTAs match.

5. **Phase 2 roadmap**
   - Join request approval workflow, email notifications, real auth (OAuth/JWT), booking, review moderation. Backend already has join-requests, auth, doctors, practices; frontend uses API where wired. Continue by wiring remaining flows (e.g. join request status from API, emails).

### Quality / ops

6. **Staging**
   - Use `docs/GCP_STAGING_DOMAIN_SETUP.md`: set `FRONTEND_URL` (and optional `FRONTEND_URL_WWW`) on Cloud Run, build frontend with `NEXT_PUBLIC_API_URL`, deploy to Firebase Hosting, custom domain staging.aipstl.org.

7. **Docs vs reality**
   - `PROJECT_UNDERSTANDING.md` and `CODEBASE_UNDERSTANDING.md` still say “no backend” and “no database”. Update them to reflect: static frontend + separate backend API, token in localStorage, practices/doctors from API, and which flows are API vs localStorage.

---

## 5. Quick Reference

- **Frontend dev:** `npm run dev` (port 3001). Set `NEXT_PUBLIC_API_URL` in `.env.local` to point at backend.
- **Backend:** `aip-backend/` (Express, Cloud Run). Env: `FRONTEND_URL`, `JWT_SECRET`, DB connection vars.
- **Practice directory:** Practices from `getAllPracticesArray()`; doctor count from `getDoctorsForPractice()` (uses public `GET /api/doctors` with optional high limit).
- **Auth:** Doctor token in `localStorage` key `aip_doctor_token`; admin via API; `getToken()` in `src/lib/api/config.ts`.

Use this file to onboard and to continue the work from where the last session left off.
