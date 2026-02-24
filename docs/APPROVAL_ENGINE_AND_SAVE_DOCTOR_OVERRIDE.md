# Approval Engine and saveDoctorOverride – What It Is

## What is “approvalEngine – saveDoctorOverride when applying approvals”?

When an **approval request** (e.g. “doctor join practice”, “practice doctor add”, “practice doctor remove”, “new practice with admin doctor”) is **approved**, the system must apply **side effects**: update the doctor’s practice and role, and the practice’s roster.

- **Historically (local):** The **approval engine** applied these changes **in the browser** by writing to **localStorage**:
  - **saveDoctorOverride(doctorId, { practiceId, roleInPractice, … })** – stored in `aip_doctor_overrides`
  - **savePracticeOverride(practiceId, { doctorIds, … })** – stored in practice overrides

  So “saveDoctorOverride when applying approvals” means: **when an approval was applied, the engine updated the in-memory/local view of doctors and practices by saving “overrides” into localStorage.**

- **Now (API-based):** The **backend** applies the real changes when the admin (or practice admin) calls **approveRequest(requestId)**. The backend updates the doctor and practice in the database. The frontend no longer needs to write doctor or practice overrides for approvals; it only needs to:
  - **Validate** before approve/reject (e.g. “does this doctor exist?”, “is the practice valid?”) using **API data** (e.g. `getAllDoctorsArray`, `getPracticeById`).
  - **Call the approve API**; the backend performs the actual updates.

So the migration is:

1. **Stop using** `saveDoctorOverride` / `savePracticeOverride` in the approval engine for applying approvals (use backend as source of truth).
2. **Fix** the engine so it does not rely on a global `doctors` array (which was undefined); load doctors from the **API** where needed (e.g. `getAllDoctorsArray(getToken())`).
3. Where the engine still had to “apply” side effects (e.g. in `applyApprovedRequestSideEffects`), use **REST APIs** instead of overrides: **updateDoctor**, **updatePractice** (so any code path that updates doctor/practice is API-based).

## Summary

- **“approvalEngine – saveDoctorOverride when applying approvals”** = the old behavior of writing approved doctor/practice changes to localStorage when an approval was applied.
- **Current intent:** Approvals are applied by the **backend** when the frontend calls the approve API. The frontend uses the **doctors and practices APIs** for validation and for any remaining updates, and no longer uses `saveDoctorOverride` (or practice overrides) for applying approvals.
