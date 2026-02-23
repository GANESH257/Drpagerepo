# Super Admin Portal Redesign – Implementation Status

## Reference: Proposed AIP Super Admin Structure

| # | Section | Route | Purpose |
|---|---------|--------|---------|
| 1 | Dashboard | `/admin` | Key metrics, feed of pending approvals, quick links |
| 2 | Membership Approvals | `/admin/approvals` | Two tabs: Practice Approvals, Doctor Approvals |
| 3 | Member Management | (parent) | — |
| ↳ | Manage Practices | `/admin/members/practices` | List practices; edit profile; view doctors; membership status |
| ↳ | Manage Doctors | `/admin/members/doctors` | List doctors; edit profile; reset password; Active/Inactive |
| 4 | Content Management | (parent) | — |
| ↳ | Announcements & Events | `/admin/content/announcements`, `/admin/content/events` | Create, edit, publish news and events |
| ↳ | Policy Documents | `/admin/content/policies` | Bylaws, versions |
| ↳ | Leadership & Committees | `/admin/content/leadership` | Committees and members |
| 5 | Platform Configuration | (parent) | — |
| ↳ | Membership Plans | `/admin/config/plans` | Tiers, features, pricing |
| ↳ | Medical Data Lists | `/admin/config/medical-data` | Specialties, Insurance, Conditions & Treatments (+ suggestions queue) |
| ↳ | System Settings | `/admin/config/settings` | Email templates, global settings |
| 6 | Reporting & Analytics | `/admin/reports` | Growth, distribution, KPIs |
| 7 | Community Moderation | (parent) | — |
| ↳ | Reported Posts Queue | `/admin/community/reports` | Flagged posts; Dismiss / Delete |
| ↳ | Forum Management | `/admin/community/forum` | View forum; delete post/topic |
| ↳ | User Moderation | `/admin/community/users` | Suspend / Ban users |

---

## Done (Backend)

- **Migration 005** (`aip-backend/migrations/005_admin_portal_tables.sql`): New tables `community_post_reports`, `community_user_moderation`, `insurance_providers`, `specialties`, `conditions`, `treatments`, `condition_treatments`, `condition_treatment_suggestions`, `system_settings`, `email_templates`; `doctors.status` column added.
- **Practices:** `PUT /api/practices/:id` (admin only); `GET /api/practices/:id` already existed.
- **Doctors:** `status` allowed in `PUT /api/doctors/:id`.
- **Committees:** `POST/GET/PUT/DELETE /api/committees`, `POST/PUT/DELETE /api/committees/:id/members/:memberId` (admin only).
- **Community:** `POST /api/community/posts/:id/report` (doctors), `DELETE /api/community/posts/:id`, `DELETE /api/community/comments/:id` (admin only).
- **Admin community:** `GET/PATCH /api/admin/community/reports`, `GET /api/admin/community/moderation`, `PUT /api/admin/community/users/:doctorId/moderation`.
- **Admin settings:** `GET/PUT /api/admin/settings`.
- **Medical data:** `GET/POST/GET/:id/PUT/:id/DELETE/:id` for `insurance-providers`, `specialties`, `conditions`, `treatments`; `GET/POST/DELETE` for `condition-treatments`.
- All new routes mounted in `aip-backend/src/index.ts`.

---

## Done (Frontend API)

- **Practices:** `getPractice`, `updatePractice` in `src/lib/api/practices.ts`.
- **Committees:** Full CRUD + members in `src/lib/api/committees.ts`.
- **Admin stats:** `getAdminStats()` in `src/lib/api/admin-stats.ts`.
- **Admin community:** `getCommunityReports`, `patchCommunityReport`, `getCommunityModerationList`, `setUserModeration` in `src/lib/api/admin-community.ts`.
- **Community:** `deleteCommunityPost`, `deleteCommunityComment` in `src/lib/api/community.ts`.
- **Medical data:** `insurance-providers.ts`, `specialties.ts`, `conditions.ts`, `treatments.ts`, `condition-treatments.ts`.
- **Admin settings:** `getAdminSettings`, `updateAdminSettings` in `src/lib/api/admin-settings.ts`.

---

## Done (Frontend – Admin UI)

1. **Admin nav:** `AdminShell.tsx` uses new Super Admin structure (flat list).
2. **Routes:** `approvals`, `approvals/[id]`, `members/practices`, `members/doctors`, `content/announcements`, `content/events`, `content/policies`, `content/leadership`, `config/plans`, `config/medical-data`, `config/settings`, `reports`, `community/reports`, `community/forum`, `community/users`. Redirects: `requests-v2` → `approvals`, `members` → `members/doctors`, `practices` → `members/practices`.
3. **Dashboard:** Uses `getAdminStats()` for Total Practices, Total Doctors, Pending Approvals; quick links to new routes; feed from `getJoinRequests()`; links to `/admin/approvals` and `/admin/approvals/[id]`. **StatsCards** uses `getDoctors` (API) and `getJoinRequests`, `getMembershipPlans` (no localStorage).
4. **Membership Approvals:** Two-tab (Practice / Doctor) list and detail; `backHref="/admin/approvals"`.
5. **Manage Practices:** Full table (name, city, state, doctor count, status); Edit dialog with `getPractice`/`updatePractice`; “View doctors” link.
6. **Manage Doctors:** Full table (name, email, practice, specialty, status); Edit dialog with `getDoctor`/`updateDoctor` (status Active/Inactive); Reset password placeholder.
7. **Content:** Announcements/Events/Policies redirect to existing pages; Leadership & Committees loads committees (API), placeholder for full CRUD UI.
8. **Config:** Plans redirects to `/admin/memberships`; Medical Data has Specialties, Insurance, Conditions & Treatments tabs with full CRUD (API); System Settings has key-value form with `getAdminSettings`/`updateAdminSettings`.
9. **Reports:** Charts from `getJoinRequests()` and existing chart components.
10. **Community Moderation:** Reported Posts table with Dismiss report / Delete post; Forum Management with section selector and Delete post; User Moderation table with Restore / Suspend / Ban.

---

## Remaining (optional / follow-up)

- **Leadership & Committees:** Full CRUD UI for committees and members (API exists; page currently shows count and placeholder).
- **Reset password:** Backend endpoint and UI for admin-triggered password reset.
- **Doctor suggestions queue:** Optional tab under Medical Data for `condition_treatment_suggestions` review.

---

## Doctor Portal (Context)

- **Layout:** `src/app/doctor/dashboard/layout.tsx` – auth, then `CompleteProfileGate` (only complete-profile) or `DashboardLayout` (full nav).
- **Gating:** Full portal only after profile complete and approved (`profileStatus !== 'pending_profile'`, `verified === true`).
- **Nav:** `DashboardLayout` uses `PortalShell` with `baseDoctorNavItems` and optional `practiceAdminNavItems`; API-only for referrals, contacts, profile stats, membership, etc.
