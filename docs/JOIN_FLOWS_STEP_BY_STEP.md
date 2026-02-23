# How a New Practice Admin or a New Doctor Joins the Practice

Step-by-step flows based on the current codebase (admin portal, doctor portal, practice admin, approval system, and APIs).

---

## Flow 1: New Practice Admin (person creating a new practice)

This is a **first-time applicant** who will become the **Practice Admin** of a **new** practice. Approval type: **`new_practice_with_admin_doctor`**. Only **Admin** approves (there is no Practice Admin yet).

### Step-by-step

**1. User goes to Join Us**

- Opens `/join-us`.
- Chooses **Create Account** (signup tab in `AuthCard` / `SignUpForm`).

**2. Sign up (create account)**

- Enters email, password, full name.
- Frontend calls `POST /api/auth/signup` with `{ email, password, fullName }`.
- Backend creates a row in **`users`**: `role = 'applicant'`, `status = 'pending'`.
- Frontend stores:
  - Signup email in localStorage (e.g. for join flow).
  - Password in **sessionStorage** as `aip_temp_password` (used once to log in and submit the application).
- User is then directed to the application (e.g. `/join-us/application`).

**3. Application – Step 1: Basic details + practice choice**

- Fills: full name, credentials, specialty, email, phone, city, state.
- In **Practice** section (`PracticeSelectionSection`), chooses **“Create new practice”** (type `new`).
- Enters **new practice name** and optionally website.
- Clicks Continue → step 2.

**4. Application – Step 2: Plan**

- Selects membership plan and billing (monthly/annual).
- Continue → step 3.

**5. Application – Step 3: Payment method**

- Selects PayPal or card (and optional card details).
- Continue → step 4.

**6. Application – Step 4: Review and submit**

- Reviews all details, checks “information is accurate”.
- Clicks **Submit Join Request**.

  - Frontend does a **silent login**: `POST /api/auth/login` with email and `aip_temp_password` from sessionStorage.
  - Receives JWT (userId, role `applicant`).
  - Calls **`POST /api/approval-requests`** with:
    - `type: 'new_practice_with_admin_doctor'`
    - `practice_id`: not set (new practice)
    - `target_doctor_id`: temporary id (e.g. `temp-doctor-...`)
    - `payload`: `{ practice: { name, website, address }, doctor: { email, fullName, credentials, specialty, phone }, plan: { planId, billingCycle }, paymentMethod, paymentDetails }`
  - Backend creates row in **`approval_requests`** with `requested_by = user.id`, `requested_by_type = 'applicant'`, `admin_status = 'pending'`, `practice_admin_status = null` (N/A for this type).
  - Frontend clears `aip_temp_password` and draft, redirects to **`/join-us/submitted`**.

**7. Admin reviews**

- Admin logs in at `/admin/login`, goes to **Approval Requests** (`/admin/requests-v2`).
- Sees the request as type “New Practice” / **New Practice with Admin Doctor**.
- For `new_practice_with_admin_doctor` there is **no Practice Admin step** (no practice yet), so only Admin acts.
- Admin opens the request, then clicks **Approve** (optionally with notes).
- Frontend calls **`POST /api/approval-requests/:id/approve`**.

**8. Backend side effects (on Admin approve)**

- In **`applyApprovalSideEffects`** for `new_practice_with_admin_doctor` the backend, in one transaction:
  - Creates **`practices`** row (id, slug, name, description, phone, website, address fields from payload).
  - Creates **`practice_locations`** row (e.g. “Main Office”) from practice address.
  - Optionally adds **`practice_specialties`** from doctor specialty.
  - Creates **`doctors`** row (id, user_id, practice_id, slug, name, credentials, specialty, email, etc.).
  - Inserts **`practice_roles`** with `role = 'practice_admin'` for that doctor and practice.
  - Creates **`memberships`** row for that doctor (plan, billing, dates, payment method).
  - Updates **`users`**: sets `role = 'doctor'`, `status = 'active'` for the applicant’s user id.
- After this, the user has a **doctor** record and is **Practice Admin** of the new practice.

**9. User can use the doctor dashboard**

- User goes to `/join-us` and logs in with the **same email and password** (the one they used at signup).
- Backend returns JWT with `role: 'doctor'` and `doctorId`.
- Frontend redirects to **`/doctor/dashboard`**.
- Because `doctor.roleInPractice === 'practice_admin'`, the dashboard shows **Practice Admin** nav (Practice, Practice Approvals, Practice Doctors, etc.).

---

## Flow 2: New doctor joins an existing practice (applicant path)

This is a **first-time applicant** who will become a **doctor** (not Practice Admin) in an **existing** practice. Approval type: **`doctor_join_practice`**. **Practice Admin** must approve first, then **Admin**.

### Path A: Application without invitation (user picks existing practice)

**1. User goes to Join Us and signs up**

- Same as Flow 1: `/join-us` → Create Account → `POST /api/auth/signup` → user created as `applicant`, password stored in sessionStorage as `aip_temp_password`.

**2. Application – Step 1: Basic details + practice choice**

- Fills basic info (name, credentials, specialty, email, phone, city, state).
- In **Practice** section, chooses **“Join an existing practice”** (type `existing`).
- Selects the **practice** from a dropdown (practices loaded from `GET /api/practices`).
- Continue → steps 2 and 3 (plan, payment) → step 4 (review).

**3. Submit**

- On Submit:
  - Silent login with email + `aip_temp_password` → JWT.
  - **`POST /api/approval-requests`** with:
    - `type: 'doctor_join_practice'`
    - `practice_id: <selected practice id>`
    - `target_doctor_id`: temporary id
    - `payload`: `{ practiceId, doctorId (temp), doctor: { email, fullName, credentials, specialty, phone }, plan, paymentMethod, paymentDetails }`
  - Backend creates **`approval_requests`** row with `requested_by = user.id`, `admin_status = 'pending'`, `practice_admin_status = null`.
- Redirect to `/join-us/submitted`.

**4. Practice Admin approves first**

- A **Practice Admin** of that practice opens **`/doctor/dashboard/practice/approvals`**.
- Sees the request (type **Doctor Join Practice**).
- Opens it, then clicks **Approve** (or Reject).
- Frontend calls **`POST /api/approval-requests/:id/approve`**; backend sets **`practice_admin_status = 'approved'`** and records in **`approval_history`**.  
- No side effects yet (both PA and Admin must approve).

**5. Admin approves**

- Admin goes to **`/admin/requests-v2`**.
- For `doctor_join_practice`, Admin **only sees the request after** `practice_admin_status = 'approved'`.
- Admin opens it and approves → **`POST /api/approval-requests/:id/approve`**.
- Backend sets **`admin_status = 'approved'`**. Since both PA and Admin are approved, **side effects** run.

**6. Backend side effects (for `doctor_join_practice`)**

- In **`applyApprovalSideEffects`** for `doctor_join_practice` the backend, in one transaction:
  - Loads **user** by `request.requested_by`.
  - Uses **existing** `practice_id` from the request (no new practice).
  - Creates **`doctors`** row (id, user_id, **practice_id**, slug, name, credentials, specialty, email, etc.).
  - Inserts **`practice_roles`** with `role = 'doctor'` (not practice_admin).
  - Creates **`memberships`** row.
  - Updates **`users`**: `role = 'doctor'`, `status = 'active'`.
- Applicant is now a **doctor** in that practice and can log in to the doctor dashboard (no Practice Admin nav, unless later made PA).

---

### Path B: Application via invitation link (same approval type)

Used when a **Practice Admin** has invited someone by email; the invitee may not have an account yet.

**1. Practice Admin sends invitation**

- PA goes to **`/doctor/dashboard/practice/doctors`**.
- Clicks invite, enters **email** (and optional message).
- Frontend creates an **invitation** in local storage (`invitationStorage`) with:
  - Unique invitation id, practice id, email, invitation link:  
    **`/join-us/invitation/<invitationId>`**  
    (or in some implementations the link may point to **`/join-us/application?invitation=<invitationId>`**).
- PA copies/sends the link to the invitee.
- (Optionally, a **`practice_doctor_add_request`** is also created when the PA “invites” an **existing** doctor by email; that’s a different flow – see below.)

**2. Invitee opens the link**

- Invitee opens **`/join-us/invitation/<invitationId>`**.
- **InvitationLandingClient** loads the invitation from storage, validates it, shows “Invitation valid – redirecting to application…” and redirects to **`/join-us/application?invitation=<invitationId>`**.

**3. Application form pre-fills practice**

- On **`/join-us/application`**, **ApplicationBasicDetailsForm** reads `invitation` from the URL.
- If present, it loads the invitation from storage and sets **preselectedPracticeId** and **practiceSelection** to **`{ type: 'existing', practiceId }`**.
- So “Join an existing practice” is selected and the **practice is pre-filled**; the user only confirms or adjusts.

**4. Rest of the flow**

- User must **sign up** if they don’t have an account (same as Flow 1).
- Then completes steps 1–4 (basic details with pre-filled practice, plan, payment, review) and **submits**.
- Submit sends **`doctor_join_practice`** with that **practice_id** (same as Path A).
- **Practice Admin** approves first at **`/doctor/dashboard/practice/approvals`**, then **Admin** approves at **`/admin/requests-v2`**.
- Side effects run as in Path A; the new doctor is created and linked to the invited practice.

So: **same approval type and backend flow as Path A**; the only difference is how the practice is chosen (invitation link pre-fills the existing practice).

---

## Flow 3: Add an existing doctor to the practice (different from “new doctor joins”)

When the **Practice Admin** wants to add a **doctor who already exists** in the system (already has a `doctors` row and possibly another practice or no practice), the PA uses “Add doctor by email” and the system creates a **`practice_doctor_add_request`** (not `doctor_join_practice`).

- PA goes to **`/doctor/dashboard/practice/doctors`**, enters the **existing doctor’s email**, submits.
- Frontend creates **`POST /api/approval-requests`** with:
  - `type: 'practice_doctor_add_request'`
  - `practice_id`, `target_doctor_id` or payload with **doctor email**.
- Backend expects a **doctor** with that email; no new user/doctor creation from signup.
- PA approves (then Admin approves for this type). Side effect: **`doctors.practice_id`** set, **`practice_roles`** inserted (role `doctor`), **`practice_specialties`** updated.

This is **not** “a new doctor joins the practice” in the sense of a new applicant; it’s “add an existing doctor to my practice.”

---

## Summary table

| Who joins              | Approval type                     | Who approves              | Side effect |
|------------------------|-----------------------------------|---------------------------|-------------|
| New Practice Admin     | `new_practice_with_admin_doctor`  | Admin only                | Create practice, doctor, PA role, membership; set user to doctor |
| New doctor (applicant) | `doctor_join_practice`            | PA first, then Admin      | Create doctor, attach to existing practice, doctor role, membership; set user to doctor |
| Existing doctor        | `practice_doctor_add_request`     | PA first, then Admin      | Attach existing doctor to practice (practice_id, practice_roles) |

---

## Files referenced

- **Signup:** `src/components/join-us/SignUpForm.tsx`, `src/lib/api/auth.ts` (signup), `aip-backend/src/routes/auth.ts` (POST signup).
- **Application steps:** `src/app/join-us/application/page.tsx`, `ApplicationBasicDetailsForm`, `PracticeSelectionSection`, `ApplicationReview`.
- **Submit:** `src/components/join-us/ApplicationReview.tsx` (login + `createApprovalRequest`), `src/lib/api/approval-requests.ts`.
- **Invitation:** `src/app/join-us/invitation/[invitationId]/InvitationLandingClient.tsx`, `src/app/doctor/dashboard/practice/doctors/page.tsx`, `src/lib/storage/invitationStorage.ts`.
- **Approval:** `aip-backend/src/routes/approval-requests.ts` (GET list, POST approve, `applyApprovalSideEffects`), `TYPES_REQUIRING_PRACTICE_ADMIN`.
- **Admin UI:** `src/app/admin/requests-v2/page.tsx`, `src/app/admin/requests-v2/[id]/ApprovalRequestDetailClient.tsx`.
- **PA approval UI:** `src/app/doctor/dashboard/practice/approvals/page.tsx`, `src/app/doctor/dashboard/practice/approvals/[id]/PracticeAdminApprovalDetailClient.tsx`.

This document reflects the behavior of the current codebase; for the planned “edit approval” behavior (e.g. PA-submitted practice edits auto-setting PA status), see **docs/EDIT_APPROVAL_SYSTEM_PLAN.md**.
