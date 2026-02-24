# Approval Engine and saveDoctorOverride – What They Do

## Approval engine (`@/lib/services/approvalEngine.ts`)

The **approval engine** runs the approval workflow for membership and practice changes:

1. **Submit** – User (or practice admin) submits a request → `createApprovalRequest()` sends it to the **backend API**. The backend stores the request and is the source of truth.
2. **Decide** – Admin or practice admin approves/rejects via **API** (`approveRequest()` / `rejectRequest()`). The **backend applies the real side effects** (e.g. updating doctor’s `practice_id`, practice’s `doctor_ids`, roles).
3. **Side effects** – The engine also has a function `applyApprovedRequestSideEffects()` that **used to** apply the same changes **locally** (so the frontend didn’t have to refetch). It writes to:
   - **saveDoctorOverride** – localStorage `aip_doctor_overrides`: doctor’s `practiceId`, `roleInPractice`, etc.
   - **savePracticeOverride** – practice’s `doctorIds`, locations, etc.

**Important:** In the current flow, **approve/reject only call the API**. They do **not** call `applyApprovedRequestSideEffects()`. So today the backend is the only place that actually updates doctor/practice data when an approval is granted. The engine still uses:

- **`doctors` from `@/data/doctors`** in `decideAsAdmin()` for **validation** (e.g. “does this doctor exist?”, “already in another practice?”). That has been switched to **API** (e.g. `getAllDoctorsArray(getToken())` or `getDoctor(id)`) so validation uses live data.
- **`saveDoctorOverride` / `savePracticeOverride`** only inside `applyApprovedRequestSideEffects()`, which is **not** in the current approve path. So “saveDoctorOverride when applying approvals” refers to that **legacy/local side-effect function**. Going fully API-based means: **no** local overrides when approving; the backend is the only writer. If something still needs to run after approval, it should be done via API (e.g. `updateDoctor` / `updatePractice`) or by refetching from the API.

## saveDoctorOverride (`@/lib/memberStorage.ts`)

- **What it does:** Saves a **partial doctor** (e.g. `practiceId`, `roleInPractice`) into **localStorage** under `aip_doctor_overrides`. The app then merges these overrides with base doctor data so the UI shows the updated state without refetching.
- **Where it was used:** In the approval engine’s `applyApprovedRequestSideEffects()` (add/remove doctor from practice, assign practice admin), in **adminHelpers** (assign practice admin role), in **PracticeRosterSection** (add/remove/promote), and in **MemberEditDialog** (save profile/role).
- **API-based replacement:** Use **`updateDoctor(doctorId, payload, token)`** from `@/lib/api/doctors` so the backend is updated. The UI should refetch or use the API response instead of relying on localStorage overrides.

Summary: **approvalEngine** = workflow that talks to the API to approve/reject; **saveDoctorOverride** = old way of updating doctor data locally. Making the rest API-based means using **updateDoctor** (and **updatePractice** where needed) and dropping local overrides for these flows.
