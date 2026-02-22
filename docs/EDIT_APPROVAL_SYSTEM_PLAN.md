# Edit Approval System – Foolproof Plan (API/DB, No localStorage)

**Goal:** Every edit to practice info or to doctor profile (beyond “basic info”) goes through an approval flow. No localStorage for approval or applied data; all state and persistence in GCP/DB.

---

## 1. Rules Summary

| Who | What they edit | Approval flow for edit to go active |
|-----|----------------|-------------------------------------|
| **Practice Admin only** | Practice info (name, description, phone, website, locations, insurance, services) | **Admin only** – PA submits → Admin approves → DB updated |
| **Doctor (non–Practice Admin)** | Own profile **beyond basic info** | **Practice Admin first, then Admin** – Doctor submits → PA approves → Admin approves → DB updated |
| **Practice Admin** | Own profile **beyond basic info** OR practice info | **Admin only** – PA submits → Admin approves → DB updated |

**Basic info (no approval; direct save to API/DB):**

- Doctor: `firstName`, `lastName`, `fullName`, `credentials`, `specialty`, `image`, primary location `hours` (and optionally `specialties` if treated as basic). All other profile fields = “non-basic” and require approval.
- Practice: Only Practice Admin can edit practice at all; no “basic” bypass for practice.

---

## 2. Current State vs Target

### 2.1 Practice edits

- **Today:** Only Practice Admin can open practice edit (route under `/doctor/dashboard/practice`, `assertPracticeAdmin`). Submits `practice_edit_request` via `submitApprovalRequest` → backend creates row with `practice_admin_status = null` → backend requires PA approval then admin (`TYPES_REQUIRING_PRACTICE_ADMIN`). So PA would have to approve their own request for admin to then approve.
- **Target:** Only Practice Admin can edit practice (unchanged). When **Practice Admin** submits any practice-related request, **only Admin** approves. No PA approval step for PA-submitted practice edits.

### 2.2 Doctor profile edits

- **Today:** Edit Profile saves via `saveDoctorProfileToAPI` → `updateDoctor` (PUT /api/doctors/:id). No approval; optional localStorage cache. All edits go live immediately.
- **Target:**
  - **Basic info** (see above): still direct PUT to API (no approval).
  - **Non-basic info:** do **not** call PUT. Create approval request `doctor_profile_edit_request`. When **regular doctor** submits → PA approves → Admin approves → side effect updates `doctors` in DB. When **Practice Admin** submits (own profile) → only Admin approves → side effect updates `doctors` in DB.

### 2.3 Data source (no localStorage)

- **Today:** Doctor profile can be cached in localStorage; some flows fall back to localStorage.
- **Target:** No localStorage for approval flow or for “source of truth” of doctor/practice data. Load doctor/practice from API only. Pending edits = rows in `approval_requests`. Applied edits = only in DB; API reads from DB.

---

## 3. Backend (GCP / Cloud SQL)

### 3.1 Approval request creation (POST /api/approval-requests)

- **Practice-type requests submitted by Practice Admin**  
  Types: `practice_edit_request`, `practice_location_add_request`, `practice_location_edit_request`, `practice_location_remove_request`, `practice_insurance_services_change_request`.  
  When `requested_by_type === 'practice_admin'` (and optionally `practice_id` matches the PA’s practice):
  - Set `practice_admin_status = 'approved'` and `practice_admin_reviewed_at = NOW()` on INSERT.
  - So only `admin_status` is pending; Admin can approve without a PA step.

- **New type: `doctor_profile_edit_request`**
  - Payload: `{ doctorId, before: { ... }, after: { ... } }`. `after` contains only non-basic doctor fields (e.g. bio, about, website, bookingUrl, medicalSchool, internship, residency, boardCertifications, hospitalPrivileges, statesLicensedIn, acceptsNewPatients, featured, specialties).
  - When submitter is **Practice Admin** and `target_doctor_id` is that PA’s own doctor id (or same as the doctor they’re editing): set `practice_admin_status = 'approved'` on INSERT so only Admin approves.
  - When submitter is **Doctor** (not PA): leave `practice_admin_status = null`/pending so PA must approve first, then Admin.

- **List/GET behavior (unchanged in spirit):** Admin still only sees PA-required requests after `practice_admin_status = 'approved'`. With the above defaults, PA-submitted practice edits and PA self-edits appear to Admin as “admin only” (PA step already set).

### 3.2 Side effects (when both approvals are satisfied)

- **Existing:** `practice_edit_request` (and other practice_* types) already applied in `applyApprovalSideEffects` (UPDATE practices, practice_locations, practice_insurance, practice_services). No change except creation behavior above.
- **New:** Handle `doctor_profile_edit_request` in `applyApprovalSideEffects`:
  - Read `payload.doctorId` and `payload.after`.
  - Single `UPDATE doctors SET ... WHERE id = $doctorId` for the allowed non-basic columns (no id/slug/user_id/practice_id/role changes from this flow). Use whitelist of columns that are safe to update from profile edit (bio, about, website, booking_url, medical_school, internship, residency, board_certifications, hospital_privileges, states_licensed_in, accepts_new_patients, featured, specialties, etc.). Ensure `updated_at = NOW()`.

### 3.3 DB schema

- **approval_requests:** Already has all needed columns. No new migration for practice edits. For `doctor_profile_edit_request`, no new columns; type is just a new value.
- Optional: add a small migration or comment documenting that `requested_by_type` and optional auto-set `practice_admin_status` implement “PA-submitted → admin only” and “doctor-submitted → PA then admin”.

### 3.4 Who can create which request types

- **Practice-type requests** (`practice_edit_request`, location add/edit/remove, insurance/services): Only **Practice Admin** for that practice. Backend: require `userRole === 'practice_admin'` and that the user’s `practice_id` (from practice_roles) matches `practice_id` in the request body.
- **doctor_profile_edit_request:** **Doctor** or **Practice Admin** (for own profile). Backend: require authenticated doctor (or PA); `target_doctor_id` or payload.doctorId must be the same user’s doctor id (or restrict to self only).

---

## 4. Frontend (No localStorage for approval or source of truth)

### 4.1 Practice info

- **Access:** Only Practice Admin sees edit practice UI (already under `/doctor/dashboard/practice` and guarded by `assertPracticeAdmin`). No change to who can edit.
- **Submit:** On submit, call `createApprovalRequest` (or existing `submitApprovalRequest` that uses it) with type `practice_edit_request` (or location/insurance/services types). Do not write practice data to localStorage.
- **After submit:** Show “Edit submitted; pending admin approval.” List/status of requests from API only (GET approval-requests filtered by user/practice).

### 4.2 Doctor Edit Profile

- **Load:** Always load doctor from API (GET /api/doctors/:id). Remove reliance on localStorage for “current” profile when deciding what to show or submit. Optional: show a banner if the doctor has a pending `doctor_profile_edit_request` for this doctor.
- **Basic info tab/section:** On save, call PUT /api/doctors/:id with only basic fields. No approval request. No localStorage cache for approval flow.
- **Non-basic tabs/sections (Biography, Credentials, Status & Settings):** On save:
  - Do **not** call PUT for those fields.
  - Build `before` (current from API) and `after` (form state for non-basic fields only).
  - Call API to create approval request: type `doctor_profile_edit_request`, `target_doctor_id` = current doctor id, `practice_id` = doctor’s practice (for PA filtering), payload `{ doctorId, before, after }`.
  - Show “Profile edit submitted; pending approval (Practice Admin then Admin)” for doctors, or “pending Admin approval” for Practice Admin.
- **Pending state:** Optionally show “You have a pending profile edit” with link to approval queue or history. Data from GET approval-requests (or GET approval-requests/:id), not localStorage.

### 4.3 Remove localStorage from approval/edit flow

- **doctorStorage / EditProfileSection:** Remove saving to localStorage for profile when the save is “approval requested” (non-basic). For basic-info save, keep using API only; remove or stop writing to `aip_doctor_profile_*` for the approval path. Prefer: load doctor only from API; do not cache “pending” edits in localStorage.
- **Approval list/detail:** Already use API (GET approval-requests, GET approval-requests/:id). Ensure no code path “applies” approved edits from localStorage; all application happens in backend side effects.

---

## 5. Implementation Checklist

### Backend (aip-backend, GCP/DB)

- [ ] **POST /api/approval-requests:** When `requested_by_type === 'practice_admin'` and `type` is one of `practice_edit_request`, `practice_location_add_request`, `practice_location_edit_request`, `practice_location_remove_request`, `practice_insurance_services_change_request`, set `practice_admin_status = 'approved'` and `practice_admin_reviewed_at = NOW()` on INSERT.
- [ ] **New type `doctor_profile_edit_request`:** Accept in POST; allow from doctor or practice_admin. When requester is practice_admin and target_doctor_id is their own doctor id, set `practice_admin_status = 'approved'` on INSERT. Add to `TYPES_REQUIRING_PRACTICE_ADMIN` so that when it’s pending PA, admin cannot approve until PA has approved.
- [ ] **applyApprovalSideEffects:** Add branch for `doctor_profile_edit_request`: from payload do a single UPDATE doctors with whitelisted non-basic columns (snake_case), set `updated_at = NOW()`. No changes to id, slug, user_id, practice_id, role.
- [ ] **GET /api/approval-requests (and GET by id):** Admin sees PA-submitted practice/doctor_profile edits that already have `practice_admin_status = 'approved'` (so they only need to approve as admin). No change to list filtering logic beyond what’s needed for the new type.
- [ ] Optional: Validate in POST that practice-type requests are only created by a user who is practice_admin for the given practice_id; doctor_profile_edit_request only for self (target_doctor_id = requester’s doctor id).

### Frontend

- [ ] **Edit Profile – Basic vs non-basic:** Split save behavior: basic info → PUT /api/doctors/:id. Non-basic → create `doctor_profile_edit_request` (no PUT, no localStorage).
- [ ] **Edit Profile – Load:** Always load doctor from API; remove dependency on localStorage for “current” profile in edit flow. Optionally show pending approval message when there is an open `doctor_profile_edit_request` for this doctor.
- [ ] **Practice edit:** Keep only PA able to open practice edit; submit creates approval request; no localStorage for practice data. Optional: show “Pending practice edit” when there is an open practice_edit_request for this practice.
- [ ] **Remove localStorage** for approval and for “source of truth” of doctor/practice: do not read or write `aip_doctor_profile_*` (or equivalent) for the approval path; do not apply approved edits on the client from localStorage.

### Types / shared

- [ ] **ApprovalType:** Add `doctor_profile_edit_request` in frontend types and backend validation.
- [ ] **Payload type:** Define `DoctorProfileEditPayload { doctorId, before: Partial<Doctor>, after: Partial<Doctor> }`; backend and frontend use same shape.

---

## 6. Flow Diagrams

### 6.1 Practice Admin edits practice info

```
PA opens Practice → Edit
  → Submits form
  → POST /api/approval-requests
     type: practice_edit_request, requested_by_type: practice_admin,
     practice_admin_status: 'approved' (set on insert)
  → Admin sees request (PA step already approved)
  → Admin approves
  → applyApprovalSideEffects: UPDATE practices + related tables
  → Done. No localStorage.
```

### 6.2 Doctor (non-PA) edits non-basic profile

```
Doctor opens Edit Profile → edits Biography / Credentials / Status
  → Save
  → POST /api/approval-requests
     type: doctor_profile_edit_request, target_doctor_id, practice_id,
     payload: { doctorId, before, after }
     practice_admin_status: null
  → PA sees request in /doctor/dashboard/practice/approvals
  → PA approves → practice_admin_status = 'approved'
  → Admin sees request → Admin approves
  → applyApprovalSideEffects: UPDATE doctors SET ... (non-basic columns)
  → Done. No localStorage.
```

### 6.3 Practice Admin edits own non-basic profile

```
PA opens Edit Profile → edits non-basic
  → Save
  → POST /api/approval-requests
     type: doctor_profile_edit_request, requested_by_type: practice_admin,
     target_doctor_id: self, practice_admin_status: 'approved' (set on insert)
  → Admin sees request → Admin approves
  → applyApprovalSideEffects: UPDATE doctors SET ...
  → Done. No localStorage.
```

---

## 7. Summary

- **Practice info:** Only PA can edit; PA submits → **Admin only** approves → DB updated.
- **Doctor non-basic:** Regular doctor submits → **PA then Admin**; PA (editing self) submits → **Admin only**. Basic info still direct PUT, no approval.
- **No localStorage** for approval flow or for “current” doctor/practice data; all reads from API (DB), all writes via approval request + side effects or direct PUT (basic only).
- Backend: creation rules (set `practice_admin_status = 'approved'` when PA submits practice or own-profile edit), new type `doctor_profile_edit_request`, and side effect to UPDATE doctors for that type. Frontend: split basic vs non-basic save, always load from API, remove localStorage from approval path.

This keeps the system foolproof, GCP/DB-based, and consistent with a single source of truth in the database.
