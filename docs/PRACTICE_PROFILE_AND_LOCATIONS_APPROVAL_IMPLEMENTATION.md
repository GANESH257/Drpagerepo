# Practice Profile & Practice Locations Approval Flows — Implementation Summary

**Feature:** Edit Practice Profile and Manage Practice Locations (Practice Admin) now use **admin-only approval** flows with **pending badges**, matching the pattern used for profile and insurance edits.

**Date:** January 2026

---

## 1. What Was Implemented

- **Edit Practice Profile** (Practice Management → Edit Practice Profile):  
  Practice admin edits practice details (description, phone, website, etc.) and submits. **Only admin** can approve. Changes apply to the DB when admin approves. A **“Pending approval”** badge and message appear when there is a pending request for that practice.

- **Manage Practice Locations** (Practice Management → Manage Practice Locations):  
  Practice admin adds/edits/removes locations in a **draft**. One **“Submit for approval”** sends the full list as a single request. **Only admin** can approve. On approval, all practice locations are replaced with the submitted list. A **“Pending approval”** badge and message appear when there is a pending request.

- **Overwrite behavior:** One pending request per practice per type. Submitting again (profile or locations) **updates** the existing pending request instead of creating a duplicate.

---

## 2. Files Changed (Complete List)

### Backend (aip-backend)

| File | Changes |
|------|--------|
| `aip-backend/src/routes/approval-requests.ts` | • Added `practice_admin_practice_profile_edit` and `practice_admin_practice_locations_edit` to `ADMIN_APPROVAL_ONLY_TYPES`<br>• Added `OVERWRITE_TYPES_PRACTICE` and overwrite block in POST (by `practice_id` + type + `requested_by`)<br>• In `applyApprovalSideEffects`: branches for `practice_admin_practice_profile_edit` (update `practices`, `practice_services`, `practice_insurance`) and `practice_admin_practice_locations_edit` (DELETE then INSERT `practice_locations`; columns: id, practice_id, name, address, city, state, zip, phone, created_at, updated_at) |

**No new migration file.** Existing tables `approval_requests` and `practice_locations` are used as-is.

---

### Frontend (src)

| File | Changes |
|------|--------|
| `src/types/approvals.ts` | Added `practice_admin_practice_profile_edit` and `practice_admin_practice_locations_edit` to `ApprovalType` union |
| `src/lib/utils/approvalTypeLabels.ts` | Labels, category, and type options for both new types |
| `src/components/shared/approvals/ApprovalTypeBadge.tsx` | Badge config for both new types |
| `src/components/shared/approvals/RequestedChangesRenderer.tsx` | • `LocationsBulkEditView` component for `practice_admin_practice_locations_edit`<br>• `practice_admin_practice_profile_edit` → `PracticeEditDiffView`<br>• `practice_admin_practice_locations_edit` → `LocationsBulkEditView` |
| `src/components/shared/approvals/SearchAndFilterBar.tsx` | Filter dropdown: “Practice Profile Edit” and “Practice Locations Edit” |
| `src/app/admin/requests-v2/[id]/ApprovalRequestDetailClient.tsx` | Effect descriptions for both types (already present in codebase) |
| `src/app/doctor/dashboard/practice/page.tsx` | • Use `createApprovalRequest` with type `practice_admin_practice_profile_edit` (no longer `practice_edit_request`)<br>• `getApprovalRequests({ status: 'pending' })` and filter by `practice_id` + type for **pending badge**<br>• Amber “Pending approval” message and badge when pending |
| `src/app/doctor/dashboard/practice/locations/page.tsx` | • **Draft state:** `draftLocations` (init from `practice.locations`)<br>• Add/Edit/Remove only update `draftLocations` (no per-action API)<br>• Single **“Submit for approval”** → `createApprovalRequest` with type `practice_admin_practice_locations_edit` and `payload.locations` = full draft<br>• Pending check and **pending badge** (same pattern as profile)<br>• `checkDuplicateAddressInList` for draft; duplicate checks use `draftLocations`<br>• Dialog copy updated for “draft” + “Submit for approval” |
| `src/app/doctor/dashboard/practice/history/page.tsx` | Added `practice_admin_practice_profile_edit` and `practice_admin_practice_locations_edit` to `getAllowedPracticeAdminTypes()` so these requests appear in Practice Approvals history |

---

## 3. Backend Deployment (GCP / Node)

- **No new environment variables.**
- **No new dependencies.**

**Steps:**

1. **Build and run locally (optional):**
   ```bash
   cd aip-backend
   npm ci
   npm run build   # if you have a build step
   npm start       # or node dist/index.js / node src/index.js
   ```

2. **Deploy to GCP (e.g. Cloud Run):**
   - Use your existing process (e.g. `gcloud run deploy`, Cloud Build, or CI/CD).
   - Redeploy the **aip-backend** service so it serves the updated `approval-requests.ts` (new types and side effects).
   - No change to service configuration (same port, same routes).

3. **Health check:**  
   After deploy, call `GET /api/approval-requests` (with auth) and optionally create/approve a test request of type `practice_admin_practice_profile_edit` or `practice_admin_practice_locations_edit` to confirm behavior.

---

## 4. Database (PostgreSQL)

- **No new migration is required for this feature.**
- All changes use existing schema:
  - **approval_requests:** `type` is already a string; new values `practice_admin_practice_profile_edit` and `practice_admin_practice_locations_edit` are stored like other types.
  - **practices:** Updated by existing columns (`name`, `description`, `phone`, `website`, etc.) in the profile-edit side effect.
  - **practice_locations:** Side effect uses only columns present in `001_approval_requests_schema.sql`: `id`, `practice_id`, `name`, `address`, `city`, `state`, `zip`, `phone`, `created_at`, `updated_at`. No `latitude`/`longitude` in this INSERT to stay compatible with the base migration.

**If you already ran migrations:**

- Do **nothing** in the DB for this feature.

**If you are setting up from scratch:**

- Run your existing migrations (e.g. `001_approval_requests_schema.sql` and any later ones) as you normally would. No extra script is needed for Practice Profile / Practice Locations approval.

---

## 5. Frontend Deployment (e.g. GoDaddy / static)

- Build and deploy the Next.js app as you do today (e.g. `npm run build`, upload `out/` or your deployment package).
- Ensure the frontend is configured to call the **correct backend base URL** (e.g. your GCP Cloud Run URL for `aip-backend`) for:
  - `POST /api/approval-requests` (create)
  - `GET /api/approval-requests` (list, for pending badges)
  - `POST /api/approval-requests/:id/approve` (admin approve)

No new env vars are required for this feature if the API base URL is already set.

---

## 6. Checklist (Nothing Missed)

- [x] Backend: New types in `ADMIN_APPROVAL_ONLY_TYPES`
- [x] Backend: Overwrite logic for practice-scoped types (one pending per practice per type)
- [x] Backend: Side effects for `practice_admin_practice_profile_edit` and `practice_admin_practice_locations_edit`
- [x] Backend: `practice_locations` INSERT uses only base migration columns (no lat/lng in INSERT)
- [x] Frontend: Types, labels, badges, renderers (including `LocationsBulkEditView`)
- [x] Frontend: Practice profile page uses new type + pending badge
- [x] Frontend: Practice locations page uses draft + single submit + pending badge
- [x] Frontend: Admin filter and detail effects for new types
- [x] Frontend: Practice history allowed types updated so new requests show in history
- [x] No new DB migration
- [x] GCP: Redeploy backend only; no DB or config changes

---

## 7. Quick Reference: New Approval Types

| Type | Who submits | Who approves | Side effect on approve |
|------|-------------|--------------|-------------------------|
| `practice_admin_practice_profile_edit` | Practice Admin | Admin only | Update `practices` (and `practice_services`, `practice_insurance`) from `payload.after` |
| `practice_admin_practice_locations_edit` | Practice Admin | Admin only | Replace all `practice_locations` for the practice with `payload.locations` |

Payload shapes:

- **practice_admin_practice_profile_edit:** `{ practiceId, before, after }` (same as existing practice edit; `after` has name, description, phone, website, services, insurances).
- **practice_admin_practice_locations_edit:** `{ practiceId, locations: [{ id, name, address, city, state, zip, phone, lat, lng, ... }] }`.
