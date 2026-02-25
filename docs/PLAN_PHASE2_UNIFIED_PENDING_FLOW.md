# Phase 2: Unified pending flow (no Complete Profile Gate)

## Context: what we are doing

**Project:** Doctor portal for AIP (Alliance of Independent Physicians). After a doctor’s **first** approval (e.g. join request “new practice with admin doctor” or “doctor join practice” approved), they have `profile_status === 'pending_profile'` and are not yet verified. They must complete profile (and for practice admins, practice + locations) and submit **one** approval request; after admin approves that, they get full dashboard access.

**Change:** Remove the separate “Complete Profile” gate and page. **All** pending doctors (practice admin and doctor-only) use the **same dashboard** (normal portal shell) with a **restricted sidebar**. They see only the steps they need (Edit profile; for PA only, Edit practice) and submit for approval **from the dashboard**. No redirect to `/doctor/dashboard/complete-profile`.

---

## Goal

- **No CompleteProfileGate.** Any doctor with `profile_status === 'pending_profile'` (or not yet verified) uses the **same dashboard** with a **restricted nav** and submits approval **from the dashboard**.

**Pending practice admin (PA):**
- **Restricted nav:** Edit Profile, Edit Practice, Account Settings.
- **Overview:** 2-step card (Edit profile → Edit practice) + single **Submit for approval** → `practice_admin_profile_practice_completion`.
- **Edit profile:** One page = profile fields + services/insurance.
- **Edit practice:** One page = practice details + locations.

**Pending doctor-only (non-PA):**
- **Restricted nav:** Edit Profile only (+ Account Settings). No practice.
- **Overview:** 1-step card ("Edit your profile" — includes services/insurance) + single **Submit for approval** → `doctor_profile_completion`.
- **Edit profile:** One page = profile fields + services/insurance (no practice).

Approval is always sent from the dashboard overview card, not from a separate complete-profile page.

---

## Architecture (high level)

- **Layout:** For **any** pending doctor (PA or doctor-only), render `DashboardLayout` with `doctor` and `children` wrapped in `PendingRouteGuard`. **Remove** `CompleteProfileGate`; no one is sent to `/doctor/dashboard/complete-profile` for this flow.
- **Nav:** When pending: **Pending PA** → Edit Profile, Edit Practice, Account Settings; **Pending doctor-only** → Edit Profile, Account Settings (no Edit Practice).
- **Route guard:** `PendingRouteGuard` allows only routes in the current nav (dashboard, profile, practice + practice/locations for PA only, settings). Redirects any other path to `/doctor/dashboard`.
- **Overview:** **Pending PA:** 2-step card + Submit → `practice_admin_profile_practice_completion`. **Pending doctor-only:** 1-step card + Submit → `doctor_profile_completion`. No "Your profile is live" until verified.
- **Profile page:** When **pending** (PA or doctor-only), show EditProfileSection + InsuranceSection on one page.
- **Practice page:** When **pending PA** only, show practice details + locations on one page. Doctor-only do not see practice in nav.
- **Submit:** From dashboard — PA: one request (profile + practice + locations); doctor-only: one request (profile only).

---

## Implementation plan

### 1. Layout: remove CompleteProfileGate; all pending use dashboard

**File:** `src/app/doctor/dashboard/layout.tsx`

- Remove the branch that renders `CompleteProfileGate` for `isPendingProfilePA` or `isPendingProfileDoctorOnly`.
- For **any** authenticated doctor (including pending PA and pending doctor-only), render: `DashboardLayout` with `doctor` and `children` wrapped in `PendingRouteGuard`: `<DashboardLayout doctor={doctor}><PendingRouteGuard doctor={doctor}>{children}</PendingRouteGuard></DashboardLayout>`.
- Remove or stop importing `CompleteProfileGate` from this layout.

### 2. Pending route guard

**New component:** `src/components/dashboard/PendingRouteGuard.tsx`

- Props: `doctor: Doctor`, `children: ReactNode`.
- If not pending (e.g. `doctor.profileStatus !== 'pending_profile'` and `doctor.verified === true`), render `children` as-is.
- If **pending PA** (`profileStatus === 'pending_profile'` and `roleInPractice === 'practice_admin'`): allow only `/doctor/dashboard`, `/doctor/dashboard/profile`, `/doctor/dashboard/practice`, `/doctor/dashboard/practice/locations`, `/doctor/dashboard/settings`. Else `router.replace('/doctor/dashboard')`.
- If **pending doctor-only** (pending and not practice_admin): allow only `/doctor/dashboard`, `/doctor/dashboard/profile`, `/doctor/dashboard/settings`. Else `router.replace('/doctor/dashboard')`.
- Use `usePathname()` to decide; optionally show a minimal loading state while redirecting.
- **Integration:** Layout always uses DashboardLayout + PendingRouteGuard (no CompleteProfileGate); guard no-ops when not pending.

### 3. Pending-only sidebar in DashboardLayout

**File:** `src/components/dashboard/DashboardLayout.tsx`

- Compute `isPending = currentDoctor.profileStatus === 'pending_profile' || currentDoctor.verified !== true` (same rule as layout).
- **Pending PA nav tree:** Edit Profile → `/doctor/dashboard/profile`, Edit Practice → `/doctor/dashboard/practice`, Account Settings → `/doctor/dashboard/settings`.
- **Pending doctor-only nav tree:** Edit Profile → `/doctor/dashboard/profile`, Account Settings → `/doctor/dashboard/settings` (no Edit Practice).
- When `isPending && roleInPractice === 'practice_admin'` → use pending PA nav. When `isPending && roleInPractice !== 'practice_admin'` → use pending doctor-only nav. Otherwise keep current full nav logic.
- Pass `navTree` to `PortalShell` as today.

### 4. Dashboard overview: 1-step (doctor-only) or 2-step (PA) card and Submit

**File:** `src/components/dashboard/DashboardZones.tsx`

- When `isIncomplete && doctor.roleInPractice === 'practice_admin'` (pending PA):
  - Do not show "Continue Setup" → complete-profile.
  - Show card: Step 1 "Edit your profile" → `/doctor/dashboard/profile`, Step 2 "Edit practice info (with location)" → `/doctor/dashboard/practice`, and **Submit for approval** (enabled when profile + practice validation pass). On submit: build payload (doctor + practice + locations) as in `complete-profile/page.tsx`, call `createApprovalRequest({ type: 'practice_admin_profile_practice_completion', ... })`. On success: show "Submission received" or `?submitted=1`.
- When `isIncomplete && doctor.roleInPractice !== 'practice_admin'` (pending doctor-only):
  - Do not show "Continue Setup" → complete-profile.
  - Show card: Step 1 "Edit your profile" (includes services/insurance) → `/doctor/dashboard/profile`, and **Submit for approval** (enabled when profile validation passes). On submit: build doctor payload only, call `createApprovalRequest({ type: 'doctor_profile_completion', target_doctor_id: doctor.id, payload: { doctorId: doctor.id, doctor: doctorPayload } })`. On success: show "Submission received" or `?submitted=1`.
- In both cases, do not show "Your profile is live" / "View profile" until verified.
- Reuse or extract validation and payload building from `complete-profile/page.tsx` so the dashboard can validate and build the same payloads from current API data.

### 5. One "Edit profile" screen for pending (profile + insurance)

**File:** `src/app/doctor/dashboard/profile/page.tsx`

- When `doctor.profileStatus === 'pending_profile'` (PA or doctor-only), render both `EditProfileSection` and `InsuranceSection` on one page. Data from `DoctorProvider`; no "View Public Profile" link when pending.
- For non-pending, keep current behavior (only EditProfileSection with link to insurance page).

### 6. One "Edit practice" screen for pending PA (details + locations)

**File:** `src/app/doctor/dashboard/practice/page.tsx`

- When pending PA, show one page: practice details (name, description, phone, website, primary address) + practice locations. Reuse or embed locations UI from `practice/locations/page.tsx`. Persistence: prefer saving practice/locations to API when user saves so dashboard "Submit" can use current API state; if backend does not support draft updates, use client state and have dashboard Submit read from that store or a "Review and submit" step.
- For non-pending PA, keep current behavior (practice profile + "Request Edit" dialog; locations on separate page).

### 7. "Submit for approval" payloads and success state

- **PA:** Same payload shape as `complete-profile/page.tsx` for `practice_admin_profile_practice_completion`: `payload: { doctorId, practiceId, doctor: doctorPayload, practice: { ... }, locations }`. Validation: profile (fullName, bio, phone, website, npi, medicalSchool) and practice (name, phone, at least one location).
- **Doctor-only:** `createApprovalRequest({ type: 'doctor_profile_completion', practice_id: doctor.practiceId ?? undefined, target_doctor_id: doctor.id, payload: { doctorId: doctor.id, doctor: doctorPayload } })`. Validation: profile only (same required fields).
- **Success:** After successful submit, show "Submission received" and optionally `?submitted=1` so the card updates (hide Submit, show message).

### 8. Optional: Deprecate complete-profile and remove CompleteProfileGate

- In `complete-profile/page.tsx`: Redirect any pending doctor (PA or doctor-only) to `/doctor/dashboard` so the standalone flow is no longer used. Alternatively remove the route once the new flow is stable.
- Remove `CompleteProfileGate` from the codebase once layout no longer uses it.

---

## File summary

| File | Action |
|------|--------|
| `src/app/doctor/dashboard/layout.tsx` | Remove CompleteProfileGate; for all doctors (including pending PA and doctor-only) render DashboardLayout + PendingRouteGuard |
| `src/components/dashboard/PendingRouteGuard.tsx` | **New:** redirect disallowed paths when doctor is pending — PA: allow dashboard, profile, practice, practice/locations, settings; doctor-only: allow dashboard, profile, settings |
| `src/components/dashboard/DashboardLayout.tsx` | Add pending PA nav tree and pending doctor-only nav tree; use when doctor is pending_profile (by role) |
| `src/components/dashboard/DashboardZones.tsx` | Pending PA: 2-step card + Submit (practice_admin_profile_practice_completion). Pending doctor-only: 1-step card + Submit (doctor_profile_completion). Reuse payload/validation from complete-profile |
| `src/app/doctor/dashboard/profile/page.tsx` | When pending (PA or doctor-only), render EditProfileSection + InsuranceSection on one page; hide "View Public Profile" when pending |
| `src/app/doctor/dashboard/practice/page.tsx` | When pending PA, render practice details + locations on one page; ensure data available for dashboard Submit (API or draft) |
| `src/app/doctor/dashboard/complete-profile/page.tsx` | Optional: redirect any pending to /doctor/dashboard; or remove route |
| `src/components/dashboard/CompleteProfileGate.tsx` | Remove once layout no longer uses it |

---

## Data flow for Submit

**Pending PA:**
1. User fills Edit profile (and services/insurance) → saved via existing profile/insurance save (API or local).
2. User fills Edit practice (details + locations) → saved via API (if supported) or client state.
3. User opens dashboard overview → sees Step 1, Step 2, and "Submit for approval".
4. "Submit" enabled when profile + practice validation pass. On click: fetch doctor + practice (and locations) from API (and merge client state if needed); build payload; call `createApprovalRequest(practice_admin_profile_practice_completion, ...)`.
5. Backend approves → sets profile_status = 'active', verified = true; PA sees full nav and "Your profile is live".

**Pending doctor-only:**
1. User fills Edit profile (and services/insurance) → saved via existing profile/insurance save.
2. User opens dashboard overview → sees Step 1 "Edit your profile" and "Submit for approval".
3. "Submit" enabled when profile validation passes. On click: fetch doctor from API; build doctor payload; call `createApprovalRequest(doctor_profile_completion, ...)`.
4. Backend approves → sets profile_status = 'active', verified = true; doctor sees full nav and "Your profile is live".

---

## Order of implementation

1. Layout: remove CompleteProfileGate; always render DashboardLayout + PendingRouteGuard for authenticated doctors.
2. PendingRouteGuard: new component; allowlist by pending PA vs pending doctor-only.
3. DashboardLayout: pending PA nav tree and pending doctor-only nav tree; use when isPending by role.
4. DashboardZones: pending PA 2-step card + Submit; pending doctor-only 1-step card + Submit; reuse validation/payload from complete-profile.
5. Profile page: when pending, render EditProfileSection + InsuranceSection; hide View Public Profile.
6. Practice page: when pending PA, render practice details + locations on one page; ensure data available for Submit.
7. Optional: redirect from complete-profile to dashboard; remove CompleteProfileGate.
