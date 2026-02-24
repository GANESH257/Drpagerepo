# localStorage / sessionStorage Reference

All keys used in the app. **The admin API migration did not remove or alter any of these.** Auth, session, and every other storage key remain in use where they were originally.

---

## Essential (auth / session)

| Key | Where used | Purpose |
|-----|------------|--------|
| `aip_doctor_token` | `api/config.ts`, `useDoctorSession.ts`, admin login, ApplicationReview | JWT for API auth (doctor + admin) |
| `aip_doctor_user` | `useDoctorSession.ts`, `api/utils.ts`, permissionService, admin/doctor login, my-practice pages | Current user payload |
| `aip_doctor_session` | `useDoctorSession.ts`, permissionService | Session / doctor context |
| `aip_admin_session` | `adminSession.ts`, `useDoctorSession.ts` (remove on doctor login) | Admin session when logged in as admin |
| `aip_temp_password` | SignUpForm (setItem), ApplicationReview (getItem/removeItem) | **sessionStorage** – temp password during join flow |

---

## Join / onboarding

| Key | Where used | Purpose |
|-----|------------|--------|
| `aip_join_email` | joinRequestStorage | Email during join flow |
| `aip_join_request_draft` | joinRequestStorage | Draft join request |
| `aip_onboarding_draft_${email}` | onboardingStorage | Onboarding draft per email |

---

## Doctor / practice / institution (overrides and cache)

| Key | Where used | Purpose |
|-----|------------|--------|
| `aip_doctor_overrides` | memberStorage | Local doctor overrides (e.g. createNewDoctor until API has POST) |
| `aip_deleted_doctors` | memberStorage | Soft-deleted doctor IDs |
| `aip_doctor_profile_${doctorId}` | doctorStorage | Cached profile (if still used) |
| `aip_doctor_passwords` | passwordUtils | Dev/demo password reset storage |
| `aip_doctor_membership_${doctorId}` | membershipStorage | Per-doctor membership (plan, etc.); still used by doctor dashboard / MembershipSection |
| `aip_practice_*` | practiceStorage (keys in storage/keys.ts) | Practice overrides, created practices |
| `aip_institution_overrides` / `aip_deleted_institutions` | institutionStorage | Institution overrides |

---

## Other app state

| Key | Where used | Purpose |
|-----|------------|--------|
| `aip_join_requests` | adminStorage, mockJoinRequests | Legacy join-requests list (dashboard uses API) |
| `aip_contact_enquiries` | contactStorage | Contact form submissions |
| `aip_dark_mode` | useDarkMode | UI theme preference |
| `aip_membership_plans_override` | adminStorage | Override membership plans |
| `aip_policies_override` | adminStorage | Override policies |
| `aip_global_medical_events_override` | adminStorage | Override events |
| `aip_board_meetings_override` | adminStorage | Override board meetings |
| `aip_notifications_${doctorId}` | notificationStorage | Per-doctor notifications |
| `aip_approval_*` / `aip_referrals` / etc. | approvalStorage, referralStorage, etc. | Various V2 storage (see storage/keys.ts) |

---

## What the API migration changed (no keys removed)

- **MemberEditDialog** – Stopped *reading* `aip_doctor_membership_${doctorId}` for the edit dialog only; membership display now uses API doctor fields when present. All other code (e.g. doctor dashboard, MembershipSection) still uses membershipStorage where it did before.
- **adminAnalytics.getDoctorsPerPlan** – Stopped *reading* `aip_doctor_membership_*` for the chart; plan comes from API doctor or default `'basic'`. No keys were removed.
- **approvalEngine** – Stopped *writing* to `aip_doctor_overrides` / practice overrides when applying approvals; uses REST (updateDoctor / updatePractice) instead. Reads still happen elsewhere; logout/admin clear still clears overrides.

No essential localStorage (auth/session) or any other key was removed or disabled app-wide. Tokens, session, user, and all other keys above remain in use as before.
