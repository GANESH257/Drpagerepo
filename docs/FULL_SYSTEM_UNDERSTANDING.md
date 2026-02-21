# Full System Understanding — Approval, Portal, and Fixes

This document is the **single reference** for everything we changed and why. Read it to understand the system deeply and avoid regressions.

---

## Part 1: The Approval Problem and Backend Fixes

### What was broken

1. **Approval didn’t persist**  
   Admin clicked Approve → API returned `admin_status: 'approved'`, but GET/list and the DB still showed `pending`. Cause: approval was done inside a transaction; after COMMIT, other connections (or the same pool) didn’t see the new row in some environments (e.g. Cloud SQL pooling).

2. **Side effects didn’t run or failed silently**  
   Even when the approval row was written, the “account setup” (create practice, create doctor, set user to `role = 'doctor'`) sometimes failed (wrong column names, extra params, enums). Errors were caught and the API still returned 200, so the user stayed `applicant` with no doctor row and couldn’t log in as a doctor.

3. **Other code could overwrite approval**  
   e.g. join-requests PUT could set status back to “pending” and overwrite an already approved request.

### Backend design we implemented

| Principle | Implementation |
|-----------|-----------------|
| **One write for approval** | Single `pool.query(UPDATE approval_requests SET admin_status = 'approved' ... WHERE id = $2 RETURNING *)`. No transaction. Auto-commits so every reader sees the new state. |
| **Never overwrite approval** | Only the approve (and reject) endpoints set `admin_status` / `practice_admin_status`. join-requests PUT checks: if current state is already `approved` or `rejected`, it does **not** run the UPDATE and returns the existing row. |
| **Side effects in one transaction** | For join types, `applyApprovalSideEffects` runs in `BEGIN` … `COMMIT`. If any step fails we `ROLLBACK` and throw. So DB is either fully set up (practice, doctor, roles, membership, user updated) or unchanged. |
| **Response reflects reality** | Approve response includes `sideEffectsApplied` and optional `sideEffectsError`. So the UI knows whether account setup ran. |
| **Repair path** | `POST /api/approval-requests/:id/apply-side-effects` (admin only) re-runs side effects for an already-approved request. Idempotent: if the user already has a doctor, we only update `users.role`/`status`. |

### Cloud SQL schema alignment (backend)

The DB follows `docs/CLOUD_SQL_MIGRATION.sql`. We changed the approval code to match:

- **practices:** `city`, `state`, `zip`, `country` (not `address_city` etc.); `address_line1`, `address_line2`.
- **practice_locations:** `address_line1` (NOT NULL), `address_line2`, `city`, `state`, `zip`; we always insert at least one location (with fallbacks like `'N/A'` when payload is empty).
- **doctors:** `slug`, `first_name`, `last_name` required; we derive from `fullName` and generate a unique slug.
- **practice_roles:** `id` PK, no `created_at` (use `assigned_at` or omit); enum is `practice_role_type` with values **`'practice_admin'`** and **`'doctor'`** (not `'admin'`). All SELECTs that check for “practice admin” use `role = 'practice_admin'`. INSERT uses `(id, practice_id, doctor_id, role)` and `ON CONFLICT (practice_id, doctor_id) DO NOTHING`.
- **memberships:** `plan_name`, `amount`, `expiry_date`, `payment_method` required; we pass `practice_id` as well.
- **approval_history:** Table has both `performed_by`/`performed_by_type` and `actor_id`/`actor_type` (NOT NULL). We set all four so INSERTs don’t fail.

### Approve flow (summary)

1. Load request; auth (admin or practice_admin).
2. **Single UPDATE** to set `admin_status` (or practice_admin equivalent) and get `savedRow`. If 0 rows updated → 500.
3. INSERT into `approval_history` (best-effort).
4. If “both approved” (admin + practice admin when required), call `applyApprovalSideEffects(client, savedRow, payload)`:
   - `BEGIN`
   - User lookup → practice (if new) → practice_locations → practice_specialties → doctor → practice_roles → memberships → UPDATE users SET role='doctor', status='active'
   - `COMMIT`; on error `ROLLBACK` and throw.
5. Return `savedRow` plus `sideEffectsApplied` and optional `sideEffectsError`.

---

## Part 2: Frontend — Why Referrals, Announcements, View Practice Showed Dashboard

### Root cause

- **Referrals**, **Announcements**, and **View Practice** use `getActorFromSession()` and then require `actor.kind === 'doctor'` (and for View Practice, `actor.practiceId`).
- **Before:** `getActorFromSession()` only returned a doctor actor if the doctor existed in the **static** array `doctors` in `@/data/doctors`. Newly approved doctors exist only in the **API/DB**, not in that file. So for them we got `{ kind: 'public' }` → `assertDoctor()` threw → catch did `router.push('/doctor/dashboard')` → user always saw the dashboard instead of the intended page.

### Fix: Session as source of truth for doctors

In **`src/lib/services/permissionService.ts`**:

- If the session has **`role === 'doctor'`** and **`doctorId`**, we **always** return an actor with `kind: 'doctor'` and that `doctorId`, **even if** that doctor is not in the static `doctors` array.
- We still look up the doctor in the static list only to fill in **`practiceId`** and **`roleInPractice`** when present; for API-created doctors those can be undefined.
- So: **Referrals** and **Announcements** no longer redirect to dashboard for newly approved doctors.

### View Practice (practice-info) specifically

- It also needed **`practiceId`** to load the practice. For API-created doctors, `actor.practiceId` was undefined (no entry in static list).
- **Fix:** The page uses **`useDoctorContext()`** to get the **doctor loaded by the layout** (from the API via `getDoctor(doctorId)`). That doctor object has **`practiceId`** from the API. So we use **`doctor?.practiceId ?? actor.practiceId`** to resolve the practice. If there’s no practiceId we stay on the page and show “Practice not found” instead of redirecting.

---

## Part 3: Frontend — Null Safety (New Doctors Have Sparse Data)

### Problem

Newly created doctors from the approval flow have a **minimal profile** from the API: no `locations`, no `insurance`, sometimes null `bio`/`about`/optional fields. Components that assumed arrays or non-null strings threw (e.g. `doctor.locations.length`, `doctor.locations[0]`, `doctor.bio`), or React warned (e.g. `value` on textarea must not be null).

### Fixes applied

| Location | What we did |
|----------|-------------|
| **OverviewSection** | `(doctor.locations?.length ?? 0) > 0`, same for `insurance` and `boardCertifications`. |
| **EditProfileSection** | Primary location hours: `doctor.locations?.[0]?.hours`, and when updating we use `const base = doctor.locations ?? []`. All inputs/textareas: `value={doctor.bio ?? ''}`, `doctor.firstName ?? ''`, etc., so **value is never null**. |
| **LocationsSection** | `const locations = doctor.locations ?? []`; all logic and JSX use `locations`. |
| **InsuranceSection** | `const insurance = doctor.insurance ?? []`; all logic and JSX use `insurance`. |
| **Practice-info** | Uses `doctor` from context and `doctor?.practiceId` so it doesn’t depend only on actor. |
| **Practice locations page** | `practice.locations ?? []` (e.g. `plocs`) everywhere we read or iterate; same for remove/edit dialogs. |

Result: Dashboard, Profile, Locations, Insurance, View Practice, and practice locations pages work even when `locations`/`insurance` or other optional fields are undefined or null.

---

## Part 4: Data Flow End-to-End

```
1. Applicant signs up → user row (role=applicant), approval_requests row (admin_status=pending).

2. Admin clicks Approve →
   - One UPDATE approval_requests SET admin_status='approved' ... RETURNING *  (committed immediately)
   - INSERT approval_history
   - applyApprovalSideEffects (in one transaction):
     practices (+ practice_locations, practice_specialties) → doctors → practice_roles → memberships → UPDATE users SET role='doctor', status='active'

3. User logs in with same email/password →
   - API returns token + user with role='doctor', doctorId set
   - Frontend stores in localStorage (aip_doctor_session, aip_doctor_user, aip_doctor_token)

4. getActorFromSession() →
   - Reads session; if role==='doctor' and doctorId → returns { kind: 'doctor', doctorId, practiceId?, roleInPractice? }
   - So Referrals, Announcements, View Practice (and any page that needs “current doctor”) get a doctor actor even for API-created doctors.

5. Layout loads doctor via getDoctor(doctorId) →
   - Doctor object (with practiceId, possibly empty locations/insurance) is in DoctorContext.
   - View Practice uses doctor.practiceId from context to load practice.
   - Profile/Locations/Insurance use doctor with null-safe access so sparse data doesn’t crash.
```

---

## Part 5: Files and Roles (Quick Reference)

| Area | Key files |
|------|-----------|
| **Approval backend** | `aip-backend/src/routes/approval-requests.ts` (approve, reject, apply-side-effects, GET list/detail; `applyApprovalSideEffects`) |
| **Don’t overwrite** | `aip-backend/src/routes/join-requests.ts` (PUT guard: don’t set approved/rejected back to pending) |
| **Session → actor** | `src/lib/services/permissionService.ts` (`getActorFromSession` trusts session for doctorId + role) |
| **Doctor context** | `src/components/dashboard/DoctorContext.tsx`; layout loads doctor and provides it to all dashboard pages |
| **Null-safe doctor UI** | `OverviewSection`, `EditProfileSection`, `LocationsSection`, `InsuranceSection`; practice-info (practiceId from context); practice/locations (practice.locations ?? []) |
| **Docs** | `docs/APPROVAL_FLOW_DEEP_DIVE.md`, `docs/APPROVAL_SETUP_FILES_AND_SCHEMA.md`, `docs/FULL_SYSTEM_UNDERSTANDING.md` (this file) |

---

## Part 6: Invariants to Keep

1. **Approval** is written only in the approve (and reject) handlers; one standalone UPDATE for the status, no transaction around it.
2. **join-requests** must never set `admin_status` (or practice_admin_status) back to `pending` when it is already `approved` or `rejected`.
3. **getActorFromSession()** must return a doctor actor whenever the session has `role === 'doctor'` and `doctorId`, without requiring the doctor to be in the static `doctors` array.
4. **Doctor portal pages** that use `doctor` must treat `locations`, `insurance`, and other optional fields as possibly undefined/null (use `?? []` or `?.` and `?? ''` for controlled inputs).
5. **View Practice** must resolve `practiceId` from the doctor in context first (`doctor.practiceId` from API), then fallback to `actor.practiceId`.
6. **Backend** side effects must match the Cloud SQL schema (practices, practice_locations, doctors, practice_roles, memberships, approval_history) so INSERTs/UPDATEs don’t fail.

This is the full picture of what we did and why it works end-to-end.
