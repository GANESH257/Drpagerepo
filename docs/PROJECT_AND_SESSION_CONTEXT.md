# Project & Session Context

**Purpose:** Single reference for deep project understanding and what was done in recent sessions so work can continue seamlessly.

**Last updated:** January 29, 2026

---

## 1. Project Overview (Deep Understanding)

### What It Is
- **Alliance of Independent Physicians (AIP)** – physician network and patient directory.
- **Dual audience:** (1) **Patients** – find doctors, view profiles, insurance, locations; (2) **Physicians** – join network, manage profile, practice, referrals, approvals.
- **Stack:** Next.js 14 (App Router), TypeScript, Tailwind, shadcn/ui. **Static export** (`output: 'export'`) for frontend; **Node/Express backend** (`aip-backend`) on GCP Cloud Run; **PostgreSQL** (Cloud SQL).

### Frontend (This Repo)
- **Routes:** `/` (home), `/doctors`, `/doctors/[slug]` (profile), `/join-us`, `/doctor/dashboard/*` (profile, locations, insurance, practice, referrals, etc.), `/admin/*` (requests, members, events, policies), `/practices/view?slug=...`, `/trustee-board`, `/public-health`, `/medical-students`, `/membership`, `/contact-us`.
- **Data:** Hybrid – static seed in `src/data/doctors.ts` (and others) plus **API** for doctors, practices, departments, approval-requests, join-requests, etc. (`NEXT_PUBLIC_API_URL` → backend).
- **Auth:** Doctor session (`aip_doctor_token` / localStorage), admin session (`aip_admin_session`). Backend JWT for API calls.

### Backend (aip-backend)
- **API:** REST – doctors, practices, approval-requests, join-requests, upload, auth, departments, memberships, etc.
- **Approval system:** Single table `approval_requests`; types include `new_practice_with_admin_doctor`, `doctor_join_practice`, `practice_admin_profile_edit`, `practice_admin_profile_practice_completion`, `practice_admin_practice_profile_edit`, `practice_admin_practice_locations_edit`, `doctor_profile_edit`, `doctor_insurance_edit`, etc. **Admin** and/or **practice_admin** approve; **side effects** on approve (create practice/doctor, update user role, apply profile/location/insurance edits).
- **Uploads:** `POST /api/upload` – when `UPLOAD_STORAGE=gcs` and `GCS_BUCKET` set, files go to **Google Cloud Storage**; response is full URL. Otherwise local `UPLOAD_DIR`; response is path (frontend uses `getUploadFullUrl()`).

### Key Concepts
- **Roles:** Admin (full), Practice Admin (own practice approvals + doctor capabilities), Doctor (own profile, referrals), Applicant (pending).
- **Approval flow:** Request created → admin/practice_admin approve → side effects run (e.g. create doctor, update practice). Approval is source of truth; side effects are best-effort (repair endpoint exists).
- **Images:** Profile, practice logo, board certs, badges – paths or full URLs in DB; frontend `getUploadFullUrl()` and `next.config.js` `images.remotePatterns` for `storage.googleapis.com`.

---

## 2. What We Were Doing (Recent Sessions – Deep Understanding)

### A. Approval screen – show images
- **Problem:** On approval request detail (e.g. "Practice Admin Profile Edit"), only text was shown; approvers could not see **profile image, board certification images, or badge/award images** from the payload.
- **Done:** In `RequestedChangesRenderer.tsx`, **DoctorProfileCompletionView** (used for `practice_admin_profile_edit`, `doctor_profile_completion`, `doctor_profile_edit`):
  - Added missing pieces: `requested` (from payload.doctor), `doctorId`, `currentDoctor` / `loadFailed` state, `profileImageUrl`, **PROFILE_SCALAR_KEYS**, **approvalImageUrl()** (uses `getUploadFullUrl` so both `/uploads/...` and GCS URLs work).
  - **Fallback block** ("Profile details (requested)" when loadFailed or no current doctor): now shows **profile image**, **board certifications** (with thumbnails), **badges & awards** (with thumbnails).
  - Fixed main diff branch JSX (Card/CardContent not inside conditional; board certs card structure).
  - Imports: `getDoctor`, `getToken`, `getUploadFullUrl`, type `Doctor`.

### B. Request Appointment removed from doctor profile
- **Done:** In `DoctorProfile.tsx` – removed "Request Appointment" button, `BookingModal`, `bookingOpen` state, and `Calendar` import. In `EditProfileSection.tsx` – updated booking URL help text (no longer references "Request Appointment").

### C. Earlier context (from prior session summary)
- **Practice profiles:** Single practice view at `/practices/view?slug=...` (or `?id=...`); no static route under `/practices/[slug]`. Links from DoctorProfile, DoctorCard, PracticeCard point there.
- **Images:** Backend uses GCS when configured; no `makePublic()` (uniform bucket-level access); bucket IAM for public read. Frontend allows GCS in `next.config.js` for `<Image>`.
- **Pending badge:** Refetch on `document.visibilitychange` where the pending approval badge is shown (e.g. practice profile, practice locations, EditProfileSection, InsuranceSection).
- **Docs:** `IMAGE_STORAGE.md`, `GCS_IMAGE_UPLOAD_SETUP.md`, `APPROVAL_FLOW_DEEP_DIVE.md`, `PRACTICE_PROFILE_AND_LOCATIONS_APPROVAL_IMPLEMENTATION.md`.

---

## 3. File Touchpoints (Where to Look)

| Area | Key files |
|------|-----------|
| Approval UI – doctor profile request | `src/components/shared/approvals/RequestedChangesRenderer.tsx` (DoctorProfileCompletionView, approvalImageUrl, PROFILE_SCALAR_KEYS) |
| Doctor profile page | `src/components/DoctorProfile.tsx`, `src/app/doctors/[slug]/page.tsx` |
| Upload URL helper | `src/lib/api/upload.ts` (getUploadFullUrl) |
| Backend upload | `aip-backend/src/routes/upload.ts` (GCS vs local) |
| Next images | `next.config.js` (remotePatterns for storage.googleapis.com) |
| Practice view | `src/app/practices/view` (or similar), practiceDirectoryService |

---

## 4. What Is Needed Next (Optional / Follow-ups)

- **Build:** Current failure is Next.js font resolution (Inter/Playfair Display) during `npm run build`, not application code. May need network or font config (e.g. `next/font` or env) for clean static export.
- **Remaining work (from docs):** Some components still use seed data vs API; optional TODOs (placeholder PDFs, RSS URLs). Not blocking approval or profile flows.
- **Verification:** After fixing font/build, re-run build and smoke-test approval request detail (with a request that has profile + cert + badge images) and doctor profile (no Request Appointment; Book Directly if URL set).

---

*Use this doc to onboard or resume: project structure, approval + image behavior, and what was completed in recent sessions.*
