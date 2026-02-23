# Plan: NPI, Two-Phase Activation (Practice Admin & Doctor Join), and Profile Completion

This document is a **detailed implementation plan** for:

1. **NPI (National Provider Identifier)** on every doctor, used by admin to verify identity before approval.
2. **Two-phase activation for Practice Admin (new practice):** First admin approval → user sees only 2 screens (Add Profile + Add Practice) → submit → second admin approval → profile and practice become active.
3. **Profile completion for new doctor (joining existing practice):** PA then Admin approve join → doctor sees only 1 screen (Add Profile) → submit → admin approves → doctor profile becomes active.

4. **Certifications, badges, and awards** as structured items with **name, image, and year**, displayed as a grid (not just text names).

---

## Clarifications and assumptions

- **NPI:** Collected in **application Step 1 (basic details)** so the admin can verify identity on the **first** approval request. Also stored on doctor profile and shown on the second (profile-completion) approval request for Practice Admin flow.
- **“Active” meaning:** Doctor/practice appear in **public search** (doctors list, practice list) and the user has **full dashboard access**. Today: doctor list uses `doctors.verified = true`, practice list uses `practices.status = 'active'`.
- **Second request type:** New approval types: **`practice_admin_profile_practice_completion`** (PA flow: profile + practice details) and **`doctor_profile_completion`** (doctor-join flow: profile details only). Admin-only approval for both.
- **Certifications / badges / awards:** New structure: each item has **name**, **image URL** (or upload), **year**. Stored as JSONB arrays (or separate tables). Display: grid of small image/badge + name + year in respective sections.

If any of the above should be different (e.g. NPI only at profile completion, or different approval type names), the rest of the plan can be adjusted accordingly.

---

## Part 1: NPI (National Provider Identifier)

### 1.1 What is NPI

- 10-digit unique ID for covered healthcare providers in the U.S. (HIPAA/CMS NPPES).
- Used for Medicare/Medicaid billing and identity verification.
- Admin uses it to **verify doctor identity before approval**.

### 1.2 Data model

- **doctors table:** Add column  
  `npi VARCHAR(10) UNIQUE`  
  (allow NULL for legacy; new doctors required to have NPI before going active.)
- **Application payload (approval_requests.payload):** Include `doctor.npi` so admin sees it on approval screen.
- **Frontend types:** Add `npi?: string` to `Doctor` and to application basic details / payload types.

### 1.3 Where NPI is collected and shown

- **Application (Join Us) – Step 1:** Add required field **NPI** in `ApplicationBasicDetailsForm` (e.g. 10-digit input, optional client-side format check). Stored in draft and sent in approval payload as `doctor.npi`.
- **Approval request (admin):** Show NPI prominently on the approval detail view for `new_practice_with_admin_doctor` and `doctor_join_practice` (and on new types below) so admin can verify identity before approving.
- **Profile completion screens:** Pre-fill or show NPI (read-only or editable depending on product choice); include in second approval payload if editable.
- **Doctor profile (public and dashboard):** NPI is **shown on the public doctor profile page** as well as in admin/dashboard.

### 1.4 Backend

- **POST /api/approval-requests:** For join types, accept `payload.doctor.npi`; no need to persist to `doctors` until approval side effects run.
- **applyApprovalSideEffects (new_practice_with_admin_doctor, doctor_join_practice):** When creating/updating `doctors` row, set `npi` from `payload.doctor.npi` (if present).
- **PUT /api/doctors/:id:** Allow updating `npi` (e.g. admin only or owner; optional validation 10 digits).
- **GET /api/doctors (public list):** No change to filtering; NPI can be omitted from public response for privacy.
- **Migration:** `ALTER TABLE doctors ADD COLUMN npi VARCHAR(10) UNIQUE;` (and index if needed for lookups).

### 1.5 Validation

- Optional: 10-digit format validation (and, if desired, Luhn check for NPI) in frontend and backend.

---

## Part 2: Certifications, Badges, and Awards (name + image + year)

### 2.1 Current state

- **Doctor type:** `boardCertifications?: string[]`, `hospitalPrivileges?: string[]` (and similar).
- **DB:** `board_certifications JSONB`, `hospital_privileges JSONB` (arrays of strings).
- **UI:** Simple list of text (e.g. `EditableList` in EditProfileSection).

### 2.2 Target state

- Each item: **name**, **image** (URL or uploaded file path), **year**.
- Display: **grid** of small image/badge + name + year in each section (Certifications, Badges, Awards).
- Sections to support (naming can be aligned with existing):
  - **Board certifications** (name, image, year)
  - **Hospital privileges** (name, image, year) – or keep as list if no image required
  - **Badges / awards** (new or repurpose): name, image, year, grid

### 2.3 Data model options

**Option A (recommended for simplicity):** Keep JSONB on `doctors` with a defined shape.

- `board_certifications` JSONB: `[{ "name": string, "imageUrl": string | null, "year": string | number }]`
- Same shape for a new field, e.g. `badges_awards` or split into `badges` and `awards`.
- `hospital_privileges` can stay string[] or become same shape with optional image/year.

**Option B:** Normalized tables.

- `doctor_certifications` (doctor_id, name, image_url, year, sort_order)
- `doctor_badges_awards` (doctor_id, name, image_url, year, type, sort_order)
- More flexible for querying; more migrations and joins.

**Recommendation:** Option A for board certifications and badges/awards; add `image_url` and `year` to each item. Use consistent frontend types and a shared grid component.

### 2.4 Frontend

- **Types:** e.g. `CertificationItem { name: string; imageUrl?: string; year?: string }`; same for badges/awards.
- **Profile completion forms (and later Edit Profile):** Per-section form: add/remove items; each item: name, image upload or URL, year. Submit builds the array for that section.
- **Display component:** Reusable grid: small image (or placeholder), name, year; used in profile completion preview, public profile, and dashboard profile.

### 2.5 Image storage and upload endpoint

- Store **URLs** in JSON (e.g. `imageUrl`). There is **no existing upload endpoint**; the implementation **must add one** so certification/badge/award images can be uploaded and a URL returned.
- **Add:** `POST /api/upload` (or similar) that:
  - Accepts multipart file upload (e.g. image only: jpeg, png, webp; max size limit).
  - Stores the file in a configured location (e.g. local `public/uploads`, or cloud storage like GCS/S3 if available).
  - Returns a **public URL** (or path) that the frontend stores in `imageUrl` for each certification/badge/award item.
- Frontend: use this URL in the completion forms and in Edit Profile when adding/editing items with an image. Optional: client-side resize/compress before upload to keep sizes reasonable.

---

## Part 3: Two-Phase Activation for Practice Admin (New Practice)

### 3.1 Current flow (to change)

- Submit application → Admin approves → `applyApprovalSideEffects` creates practice + doctor + PA role + membership, sets `users.role = 'doctor'`, `doctors.verified = true` (or similar) → profile/practice active and visible in search, full PA dashboard.

### 3.2 New flow

1. **Application unchanged** up to submit: Sign up → Step 1 (basic details **+ NPI** + “Create new practice” + practice name) → Step 2 (plan) → Step 3 (payment) → Step 4 (review) → Submit.
2. **First approval:** Admin approves **first** request (type `new_practice_with_admin_doctor`). Admin uses **NPI** (and any other info) to verify identity.
3. **Side effects after first approval (modified):**
   - Create **practice** and **doctor** and **practice_roles** (practice_admin) and **memberships** and set **users.role = 'doctor'**, **users.status = 'active'**, so the user can log in.
   - Do **not** set `doctors.verified = true`. Do **not** set `practices.status = 'active'` (or set to something like `'pending_profile'`).
   - Set a **profile/practice completion flag** so the app knows to show only the 2 completion screens (e.g. `doctors.profile_status = 'pending_profile'` or keep `verified = false` and derive “pending profile” from that + a new column).
4. **User logs in:** After first approval, user can log in with same email/password. **Doctor dashboard layout** checks: if doctor has `profile_status === 'pending_profile'` (or equivalent), render **only** the onboarding/completion flow (no full sidebar, no other routes).
5. **Two screens only:**
   - **Screen 1 – Add profile details:** All required doctor fields (including NPI if not pre-filled), bio, credentials, certifications/badges/awards (name + image + year), education, etc. Required validation; submit does **not** make profile active.
   - **Screen 2 – Add practice details:** Basic practice info, address, locations, phone, website, etc. Required validation; submit does **not** make practice active.
6. **Single “Submit” for both (or two-step submit):** When user completes both and submits (e.g. one “Submit profile and practice” button, or “Submit profile” then “Submit practice” with one combined request), frontend creates **one** new approval request:
   - Type: **`practice_admin_profile_practice_completion`** (or similar).
   - Payload: full doctor payload (including certifications/badges/awards with name/image/year) and full practice payload (basic info, locations, etc.).
7. **Second approval:** Admin sees this request at `/admin/requests-v2`. On approve:
   - **Side effects:** Update `doctors` with all profile fields (including NPI, certifications, etc.); update `practices` and `practice_locations` (and related) with practice details; set **`doctors.verified = true`** and **`practices.status = 'active'`** (and clear `profile_status` if used).
8. **After second approval:** Doctor and practice appear in search; user gets **full** Practice Admin dashboard (all normal nav).

### 3.3 Data model (for “pending profile” state)

- **doctors:** Add optional `profile_status VARCHAR(50) DEFAULT 'active'` with values e.g. `'active'` | `'pending_profile'`. When `pending_profile`, dashboard shows only completion flow. Alternatively, rely on `verified = false` + “has no completed profile submission” (no second request yet) to show completion flow.
- **practices:** Use existing `status`; after first approval set `status = 'pending_profile'` (or similar); after second approval set `status = 'active'`.

### 3.4 Backend

- **applyApprovalSideEffects for `new_practice_with_admin_doctor`:**
  - Create practice with `status = 'pending_profile'` (or equivalent).
  - Create doctor with `verified = false` and `profile_status = 'pending_profile'` (if column exists).
  - Rest unchanged (practice_roles, memberships, user role/status).
- **New approval type `practice_admin_profile_practice_completion`:**
  - Created by the PA (they are already a doctor and PA) after filling the two completion screens.
  - Payload: `{ doctorId, practiceId, doctor: { ...all profile fields, certifications[], badgesAwards[] }, practice: { ... }, locations: [...] }`.
  - Admin-only approval.
  - Side effects: UPDATE doctors SET ... (all allowed fields), UPDATE practices SET ..., replace practice_locations, set `doctors.verified = true`, `practices.status = 'active'`, clear `profile_status`.
- **GET /api/doctors/:id (for dashboard):** Return `profile_status` (and `verified`) so frontend can decide to show completion flow vs full dashboard.

### 3.5 Frontend

- **Doctor dashboard layout:** After loading doctor, if `profile_status === 'pending_profile'` (or `verified === false` and completion not yet submitted), render **only** the completion flow (e.g. `/doctor/dashboard/onboarding` or `/doctor/dashboard/complete-profile` with two steps: Profile, Practice). No sidebar, no other routes.
- **Completion – Profile screen:** Form with all required doctor fields + certifications/badges/awards (name, image, year) grid. Validate required fields; on submit, either save to state and go to Practice screen or submit both in one approval request.
- **Completion – Practice screen:** Form with practice basic info, address, locations. On submit (or combined submit), call **POST /api/approval-requests** with type `practice_admin_profile_practice_completion` and full payload.
- **Routing:** Only allow `/doctor/dashboard` and `/doctor/dashboard/complete-profile` (and maybe `/doctor/dashboard/complete-profile/practice`) when in pending_profile; redirect any other path to completion flow.

### 3.6 Admin UI

- First approval: existing approval detail for `new_practice_with_admin_doctor`; show **NPI** clearly for verification.
- Second approval: new type `practice_admin_profile_practice_completion`; show diff/summary of profile and practice data; approve/reject.

### 3.7 Rejection and resubmit

- If admin **rejects** the profile/practice completion request, the user **can edit and resubmit**. Allow creating a **new** approval request of the same type (`practice_admin_profile_practice_completion`) with updated payload; user returns to the two completion screens, edits, and submits again.

---

## Part 4: Profile Completion for New Doctor (Joining Existing Practice)

### 4.1 Current flow (to change)

- Applicant submits `doctor_join_practice` → PA approves → Admin approves → side effects create doctor, attach to practice, set user to doctor → doctor can log in and has full dashboard.

### 4.2 New flow

1. **Application and first approvals unchanged:** Submit `doctor_join_practice` → PA approves → Admin approves.
2. **Side effects after Admin approves join (modified):**
   - Create doctor, attach to practice, create practice_roles (doctor), memberships, set user to doctor.
   - Set **`doctors.verified = false`** and **`doctors.profile_status = 'pending_profile'`** (or equivalent). Doctor is “part of practice” but **not** visible in search and **not** full dashboard.
3. **Notify doctor:** Send notification (in-app and/or email) that they’ve been approved and must complete their profile (link to login + completion flow).
4. **Doctor logs in:** Sees **only one screen** – **Add profile** (same structure as Practice Admin’s profile screen: required fields, certifications/badges/awards with name + image + year).
5. **Submit profile:** Doctor submits completion form → frontend creates **one** approval request:
   - Type: **`doctor_profile_completion`**.
   - Payload: full doctor profile (including NPI if not already set, certifications, badges, awards, etc.).
6. **Admin approves:** Admin sees request at `/admin/requests-v2`. On approve:
   - Side effects: UPDATE `doctors` with all profile fields; set **`doctors.verified = true`** and clear `profile_status`.
7. **After approval:** Doctor appears in search and has **full** doctor dashboard (no PA nav unless they’re made PA later).

### 4.3 Backend

- **applyApprovalSideEffects for `doctor_join_practice`:**
  - Create doctor with `verified = false`, `profile_status = 'pending_profile'`.
  - Rest unchanged.
- **New approval type `doctor_profile_completion`:**
  - Created by the doctor (owner of the profile) after filling the single completion screen.
  - Payload: `{ doctorId, doctor: { ...all profile fields, certifications[], badgesAwards[] } }`.
  - Admin-only approval.
  - Side effects: UPDATE doctors SET ... (all allowed fields), set `verified = true`, clear `profile_status`.
- **Notifications:** When Admin approves `doctor_join_practice`, create a notification for the doctor (e.g. “You’ve been added to [Practice]. Please complete your profile to activate your listing.”) with link to login.

### 4.4 Frontend

- **Doctor dashboard layout:** If doctor has `profile_status === 'pending_profile'` and type is **not** practice_admin (or is doctor only), render **only** the **single** completion screen (Add profile). No sidebar, no other routes.
- **Completion – Profile screen:** Same form as in Part 3 (required fields, certifications/badges/awards with name, image, year). Submit → **POST /api/approval-requests** with type `doctor_profile_completion`.
- **Routing:** Only allow completion route until profile is active.

### 4.5 Admin UI

- Join approval: unchanged; NPI can be shown if present in payload.
- New approval type `doctor_profile_completion`: show profile summary/diff; approve/reject.

### 4.6 Rejection and resubmit

- If admin **rejects** the profile completion request, the user **can edit and resubmit**. Allow creating a **new** approval request of the same type (`doctor_profile_completion`) with updated payload; no special “resubmit” flow required—just “Submit” again from the completion screen (same as first time).

---

## Part 5: Summary of New/Modified Pieces

### 5.1 Database

- **doctors:** `npi VARCHAR(10) UNIQUE`, `profile_status VARCHAR(50) DEFAULT 'active'` (optional), certifications/badges/awards as JSONB with `{ name, imageUrl?, year? }[]` (or keep current + add new fields).
- **practices:** Use existing `status`; add value `'pending_profile'` for new practices until second approval.
- **approval_requests:** No schema change; new types are just new values for `type`.

### 5.2 New approval types

- **`practice_admin_profile_practice_completion`** – PA (new practice) submitted profile + practice details; admin approves → doctor and practice become active.
- **`doctor_profile_completion`** – Doctor (joined existing practice) submitted profile details; admin approves → doctor becomes active.

### 5.3 Visibility rules (consistent)

- **Public doctors list:** `doctors.verified = true` (unchanged).
- **Public practices list:** `practices.status = 'active'` (unchanged); new practices stay `pending_profile` until second approval.
- **Admin practice list:** Practices with `status = 'pending_profile'` **do** appear in the admin practice list (so admin can see them); they are excluded only from **public** practice search.
- **Dashboard:** If `doctors.profile_status === 'pending_profile'` (or equivalent), show only completion flow (2 screens for PA new practice, 1 screen for doctor join).

### 5.4 NPI usage

- Application Step 1: required NPI field; stored in payload.
- First approval (both flows): admin sees NPI and verifies identity before approving.
- Stored on doctor after first approval (from payload); shown again on second approval if needed.

### 5.5 Certifications / badges / awards

- Structure: name, image (URL), year; grid display.
- Used in: profile completion forms (PA and doctor), then in Edit Profile and public profile.

---

## Part 6: Implementation order (suggested)

1. **Upload endpoint:** Add `POST /api/upload` for certification/badge/award images (multipart, store file, return URL). Needed before or in parallel with certifications/badges/awards UI.
2. **NPI:** DB migration, types, application form, approval payload and display, side effects (set NPI on doctor when creating/updating). **Decision:** NPI is shown on public doctor profile.
3. **Certifications/badges/awards structure:** Types, DB (JSONB shape or new columns), shared grid component and form component (using upload URL for images); integrate into existing Edit Profile (optional) and prepare for completion screens.
4. **Two-phase for Practice Admin:** New `profile_status`/practice `status` behavior, modify first-approval side effects, add completion route and two screens (profile + practice), new approval type and side effects, dashboard layout conditional. **Decision:** On rejection, user can edit and resubmit (new request of same type).
5. **Profile completion for doctor join:** Modify `doctor_join_practice` side effects, add completion route and one screen, new approval type and side effects, notification on join approval, dashboard layout conditional. **Decision:** On rejection, user can edit and resubmit.
6. **Admin UI:** Show NPI on all relevant approval types; add handling for `practice_admin_profile_practice_completion` and `doctor_profile_completion` (display payload, approve/reject, side effects). **Decision:** Pending practices appear in admin practice list but not in public search.

---

## Part 7: Decisions (answered)

| Question | Decision |
|----------|----------|
| **NPI visibility** | NPI **can be shown on the public** doctor profile page. |
| **Practice “pending” visibility** | **Yes:** Practices with `status = 'pending_profile'` appear in the **admin** practice list but **not** in public practice search. |
| **Rejection of completion request** | **Yes:** User **can edit and resubmit** (create a new approval request of the same type with updated payload). |
| **Image upload** | **No existing upload endpoint;** the plan **includes** adding **POST /api/upload** (or equivalent) that accepts file upload and returns a URL for use in certifications/badges/awards. |
