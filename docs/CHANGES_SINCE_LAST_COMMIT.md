# Changes Since Last Commit – Understanding Everything

Reference for (1) **what the last commit did** and (2) **what changed after it** (current uncommitted / session changes). Use this to understand the full picture from the last commit onward.

---

## 1. Last commit: `d242096` – “Staging: approvals, messages, community, referrals, practices, build fixes”

**Scope:** 98 files changed (~6,899 insertions, ~1,275 deletions).

### Highlights from that commit

- **Approvals**
  - Approval screen shows profile/cert/badge images in `RequestedChangesRenderer`.
  - Approval-related types and transforms updated.
- **Messages**
  - Messages use query param `?otherDoctorId=` for static export; dynamic route handling adjusted.
- **Community**
  - Community redesign: search, section sidebar, post list (`CommunityView`).
- **Doctor profile**
  - “Request Appointment” removed from doctor profile.
- **Practices**
  - Practice view: `/practices/view?slug=...` (static export friendly); `PracticeProfileClient`, `PracticeCard`, `DoctorMiniCard` updated.
- **Referrals**
  - Referral status types: `considering` / `accepted` / `no_show` / `cancelled`; backend referrals route and types aligned.
- **Build / types**
  - Fixes for lat/lng and `ReferralStatus` type errors for build.
- **Backend**
  - Backend and DB changes (migrations, approval-requests, referrals, doctors, practices, upload), deploy scripts, env example.
- **Docs**
  - PROJECT_UNDERSTANDING_THOROUGH, GCS setup, image storage, approval flows, deploy guides, etc.
- **Doctor dashboard**
  - Layout, complete-profile gate, edit profile section, insurance section, practice pages (locations, approvals, profile, practice page), find-physician, referrals page, messages.
- **Admin**
  - Approvals detail (query `?id=`), requests-v2, members, referrals table, practice roster.
- **Other**
  - `DoctorProfile`, `DoctorCard`, `ReferralDialog`, `ApprovalTypeBadge`, `doctorProfileUrl`, `useDoctorSession`, `permissionService`, `approvalEngine`, `practiceDirectoryService`, `referralEngine`, plus new/updated docs and backend routes.

So the **last commit** is a large staging pass: approvals UI, messages/static export, community redesign, practices view, referral types, build fixes, backend and docs.

---

## 2. Uncommitted changes (after last commit) – “We did a lot of changes”

**Scope:** 43 modified files (~1,151 insertions, ~848 deletions) plus **new** docs and a few new files. These are the changes **since** the last commit (current working tree).

### 2.1 Doctor portal – API instead of local/memberStorage

All of these now use **API** for doctor list and (where applicable) plan data; no `getAllDoctors()` from memberStorage or `loadMembership()` for plan display.

| Location | Change |
|----------|--------|
| **Dashboard history** (`doctor/dashboard/history/page.tsx`) | `getAllDoctors()` → `getAllDoctorsArray(getToken())` for current doctor and for name lookup; on error `setAllDoctors([])`. |
| **Practice history** (`doctor/dashboard/practice/history/page.tsx`) | `getAllDoctors()` → `getAllDoctorsArray(getToken())` for doctor selector list. |
| **Practice doctors** (`doctor/dashboard/practice/doctors/page.tsx`) | Removed `loadMembership` and `membershipPlans` from data. Plan from API doctor: `planId` / `plan_id` / `membership_plan_id`; plan names from `getMembershipPlans()` API. Badge only when plan present. |
| **Referrals page** (`doctor/dashboard/referrals/page.tsx`) | `getAllDoctorsArray()` → `getAllDoctorsArray(getToken())` for network doctors. |
| **MessagesSection** (`dashboard/MessagesSection.tsx`) | `getAllDoctors()` → `getAllDoctorsArray(getToken())` for recipient list. |
| **InstitutionDetailClient** | `getAllDoctors()` → `getAllDoctorsArray(getToken())`; try/catch sets doctors to `[]` on failure. |
| **institutionSearch** | `getAllDoctors()` → `getAllDoctorsArray(getToken() ?? undefined)` (SSR-safe). |
| **DashboardZones** | Uses `getDoctors({ limit: 1 }, getToken())` for network size. |

So: **Doctor-side** history, practice history, practice doctors (plan), referrals, messages, institution detail/search, and dashboard zones are now **API-based** for doctors (and plans where relevant).

### 2.2 Admin portal – API consistency and approval engine

| Location | Change |
|----------|--------|
| **MembersTable** | Uses `getAllDoctorsArray(token)`, `deleteDoctor` (API); no memberStorage for list. |
| **PracticeRosterSection** | Doctors and updates via API; doctor list from `getAllDoctorsArray(token)`. |
| **ReferralsTable** | `getAllDoctorsArray(token)` for doctor list. |
| **MemberEditDialog** | Plan display from API doctor (`planId` / `membership_plan_id`) only; no `loadMembership`. |
| **DoctorsPerDepartmentChart** | Uses `getAllDoctorsArray(getToken())` and API departments. |
| **adminAnalytics.getDoctorsPerPlan** | Plan from API doctor or default `'basic'`; no `loadMembership`. |
| **adminHelpers** | Deduplicated imports; **createNewDoctor** uses `updatePractice` (API) for roster update; still uses `saveDoctorOverride` for the create-doctor step (no POST doctor API yet). |
| **approvalEngine** | Uses `getAllDoctorsArray(getToken())` for validation; **no `saveDoctorOverride`** when applying approvals; side effects via **updateDoctor** / **updatePractice** (API). Backend applies state on approve. |
| **approvalHistoryHelpers** | Normalizer can receive doctors from API; uses `getAllDoctorsArray(getToken())` when needed. |
| **AdminMessagesWrapper** | Uses API for doctor list (e.g. `getAllDoctorsArray`). |
| **Admin approval/history pages** | Use `getAllDoctorsArray(getToken())` for doctor list. |

So: **Admin** members, roster, referrals, member edit (plan), charts, and approval engine are **API-based** for doctor/practice data, and the approval engine no longer writes overrides when applying approvals.

### 2.3 Static export and Next 15 params

| Location | Change |
|----------|--------|
| **admin/messages/[otherDoctorId]** | Page now **redirects** to `/admin/messages?otherDoctorId=...`. **generateStaticParams()** returns `[]` (no pre-generated paths) so static export succeeds. No `getAllDoctors()` in build. |
| **public-health/articles/[slug]** | **params** typed as `Promise<{ slug: string }>`; **generateMetadata** and default export **await params** and use resolved `slug`. |
| **medical-students/articles/[slug]** | Same: **params** as Promise; **generateMetadata** and page **await params**. |
| **trustee-board/announcements/[slug]** | Same: **params** as Promise; **generateMetadata** and page **await params**. |

So: **Dynamic routes** either have **generateStaticParams** (messages) or **params as Promise + await** (articles/announcements) so the app is correct for static export and Next 15.

### 2.4 API and services

| File | Change |
|------|--------|
| **api/doctors.ts** | Normalization/fields for API doctor (e.g. plan_id / planId) and any small fixes. |
| **api/announcements.ts** | Announcement API usage/options. |
| **api/messages.ts** | Message API (e.g. unread count) for FloatingMessageIcon. |
| **practiceDirectoryService** | Uses `getAllDoctorsArray(token)` for practice doctors (API). |
| **FloatingMessageIcon** | Uses `getUnreadCount()` from `@/lib/api/messages`; admin link to `/admin/messages`. |

### 2.5 Dashboard bells and messages

- **AnnouncementBell, MessageBell, NotificationBell, MessagesSectionWrapper, MembershipSection**  
  Adjusted for API or token usage where needed (e.g. messages API, membership from API where used).

### 2.6 New files (untracked)

- **docs/APPROVAL_ENGINE_AND_SAVE_DOCTOR_OVERRIDE.md** – Explains no saveDoctorOverride when applying approvals; backend is source of truth.
- **docs/APPROVAL_ENGINE_AND_DOCTOR_OVERRIDES.md** – Related approval/override notes.
- **docs/PORTALS_AUDIT.md** – Admin vs Doctor portal: what is API vs local.
- **docs/LOCAL_STORAGE_REFERENCE.md** – All localStorage/sessionStorage keys; notes that migration did not remove auth/session keys.
- **docs/DEEP_UNDERSTANDING.md** – Single deep-dive: architecture, auth, data, approval engine, portals, static export.
- **src/components/dashboard/MessagesSectionAPI.tsx** – Shared messages UI using API (used by doctor and admin).
- **src/lib/api/leadership.ts** – Leadership/committees API client.
- **aip-backend:** `migrations/008_board_of_directors.sql`, `routes/leadership.ts` (new).

---

## 3. Summary

- **Last commit (d242096):** Big staging pass – approvals UI, messages/static export, community redesign, practices view, referral types, build fixes, backend and docs.
- **Since last commit (current changes):**
  - **Doctor portal:** History, practice history, practice doctors (plan), referrals, messages, institution detail/search, dashboard zones → **API** for doctors (and plans).
  - **Admin portal:** Members, roster, referrals, member edit (plan), charts, approval engine → **API** for doctor/practice data; **approval engine no longer uses saveDoctorOverride** when applying approvals.
  - **Static export / Next 15:** generateStaticParams for admin messages route; **params as Promise + await** for article/announcement [slug] pages.
  - **New docs:** Approval override, portals audit, localStorage reference, deep understanding; new MessagesSectionAPI and leadership API.

Together, the **last commit** and these **uncommitted changes** give you: one place (this doc) to “understand everything” from the last commit onward.
