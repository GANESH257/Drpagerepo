# Approval Flow — Complete Deep Dive

This document explains **what we built and why**, so the approval system is fully understood and not accidentally broken later.

---

## 1. The Problem We Solved

### What was going wrong

- Admin clicked **Approve** → API returned `admin_status: 'approved'` and the UI showed success.
- After "Back to queue" or refresh, the **list and detail** still showed **Pending**, and the DB row stayed `admin_status = 'pending'`.
- So: the approve **response** was correct, but the **approval was not persisting** in the database that GET (and the SQL console) read from.

### Root cause (before our changes)

- The approve handler used a **transaction**: `BEGIN` → UPDATE row → INSERT history → run side effects → `COMMIT`.
- In some environments (e.g. Cloud SQL with connection pooling), the committed row was not immediately visible to other connections (or even to a follow-up read on the same pool). So GET/list kept seeing the old state.
- There was also a **second issue**: after approval, the **side effects** (create practice, create doctor, set user to `role = 'doctor'`) sometimes **failed** (e.g. a bug in the practices INSERT). When they failed, we still returned success; the user stayed `applicant` and had no doctor record, so they couldn’t log in as a doctor.

### What we wanted

1. **Click Approve → DB is updated to approved** and that state **persists**; GET and list always see it.
2. **Nothing overwrites that approval** (e.g. no other API or “Back to queue” flow setting it back to pending).
3. **Side effects** (practice, doctor, user role) run when appropriate and don’t leave the system in a half-broken state; we also have a way to **repair** if they failed once.

---

## 2. Design Principles We Followed

| Principle | Meaning |
|-----------|--------|
| **Approval is the source of truth** | The only place that sets `admin_status = 'approved'` (or practice_admin equivalent) for an approval request is the approve endpoint. Nothing else should set it back to pending. |
| **One write, no transaction for the approval** | We persist the approval with a **single** `pool.query(UPDATE ... SET admin_status = 'approved' ... RETURNING *)`. No `BEGIN`/`COMMIT` around that UPDATE. Each `pool.query` auto-commits, so the new state is visible to every connection immediately. |
| **Don’t overwrite decided state** | Other routes (e.g. join-requests PUT) must not set `admin_status` (or practice_admin_status) back to `pending` when it is already `approved` or `rejected`. |
| **Side effects after approval** | Creating practice/doctor and updating the user happens **after** the approval row is written. If side effects fail, we log and return success for the approval; the approval itself is already saved. We do not roll back the approval. |
| **Repair path** | If side effects failed once, we can re-run them for an already-approved request via a dedicated endpoint, without changing the request back to pending. |

---

## 3. Backend: Approval Request Lifecycle

### 3.1 GET list and GET single (read-only)

- **GET /api/approval-requests** and **GET /api/approval-requests/:id** only **read** from `approval_requests`. They never write.
- We set **Cache-Control: no-store, no-cache** and **Pragma: no-cache** so browsers/proxies don’t cache the JSON and show stale “pending” after an approval.
- Frontend also uses cache-busting query params (e.g. `?_=Date.now()`) when calling these so the client doesn’t reuse an old response.

So: **whoever reads the DB sees the same state we wrote** — no transaction visibility issues, no stale cache.

### 3.2 POST /api/approval-requests/:id/approve — the main approve flow

Flow is intentionally **sequential and simple**:

1. **Auth and load**
   - Require `admin` or `practice_admin`.
   - Load the approval request by id. If not found → 404.
   - For practice_admin, verify they are admin for this request’s practice.

2. **Persist the approval (the only place we set approved)**
   - Run **one** UPDATE:
     - Admin:  
       `UPDATE approval_requests SET admin_status = 'approved', admin_notes = $1, admin_reviewed_at = NOW(), updated_at = NOW() WHERE id = $2 RETURNING *`
     - Practice admin:  
       Same idea for `practice_admin_status`, `practice_admin_notes`, `practice_admin_reviewed_at`.
   - Uses **pool.query** (no transaction). So this UPDATE commits immediately.
   - If `rowCount === 0` → 500 "Approval could not be saved" (we don’t return success if the row wasn’t updated).
   - We keep the **returned row** as `savedRow` and never write to `approval_requests` again in this request.

3. **History (best-effort)**
   - INSERT into `approval_history` (who approved, when, notes). If this fails we log and continue; we do **not** change the approval row.

4. **Side effects (only when “both” approvals are done)**
   - For types that need only admin (e.g. `new_practice_with_admin_doctor`): “both approved” = admin_status is approved.
   - For types that need practice admin too: we require both `admin_status` and `practice_admin_status` approved.
   - When both are approved we call **applyApprovalSideEffects(client, savedRow, payload)**:
     - Uses a **new** client from the pool (we don’t wrap this in a transaction; each statement auto-commits).
     - If this throws we **catch**, log, and still return `savedRow` with 200. So the **approval stays approved**; only the side effects are “best effort” and can be fixed later with the repair endpoint.

5. **Response**
   - We return `savedRow` plus:
     - **sideEffectsApplied**: `true` if account setup (practice, doctor, user) completed; `false` if we didn’t run it (e.g. practice admin still pending) or it failed.
     - **sideEffectsError**: present only when setup was run and failed (e.g. `"Account setup failed: User not found"`). The UI can show “Approval saved. Account setup failed: … [Retry]” and call `POST .../apply-side-effects` to retry.

Important: **We never again UPDATE `approval_requests` in this handler.** So nothing in approve can overwrite the approval.

---

## 4. What “Side Effects” Actually Do (Join Requests)

For **new_practice_with_admin_doctor** (and similarly for **doctor_join_practice**), `applyApprovalSideEffects`:

1. Loads the **user** by `request.requested_by`.
2. **new_practice_with_admin_doctor**:
   - Inserts a row into **practices** (from payload: name, address, etc.).
   - Optionally inserts **practice_locations** and **practice_specialties**.
3. **doctor_join_practice**: uses existing `practice_id` from the request/payload.
4. Inserts a row into **doctors** (linking to `user.id` and the practice).
5. Inserts **practice_roles** (e.g. admin for new practice, doctor for join).
6. Inserts **memberships** (plan, billing cycle, start/end date).
7. Updates **users**: `SET role = 'doctor', status = 'active'` for that user.

So after a successful run, the applicant has a **doctor** record and can log in as a doctor; the login flow checks `users.role === 'doctor'` and looks up `doctors` by `user_id` to get `doctorId`.

### One procedure, one transaction

- **Account setup for join requests is one procedure:** load user → create practice (if new) → create doctor → practice_roles → memberships → update user to `role = 'doctor'`, `status = 'active'`. Either **all** of these steps succeed or **none** do.
- They run inside a **single transaction** (`BEGIN` … `COMMIT`). If any step throws, we `ROLLBACK` and rethrow with a clear message (`Account setup failed: …`). So the DB is never left with a practice but no doctor, or a doctor but user still `applicant`.
- **Validation** at the start: `request.requested_by` and a valid `payload` are required; otherwise we throw before `BEGIN`.
- **Logging:** Each step is logged (`[Approval setup] Loading user`, `Creating practice`, `Creating doctor`, `Updating user role/status`, `Done`). If something fails, Cloud Run logs show the exact step and error.

### Bug we fixed in side effects

- The **practices** INSERT had **14 values** in the array but only **13 placeholders** ($1–$13); `created_at`/`updated_at` were correctly set with `NOW()`. The extra value was `new Date().toISOString()`, which could cause the driver to error or bind incorrectly.
- We **removed** that extra value so the INSERT has exactly 13 parameters. This avoids the first side-effect query failing and preventing the rest (doctor, user update) from running.

---

## 5. Repair Endpoint: Apply Side Effects for an Already-Approved Request

- **POST /api/approval-requests/:id/apply-side-effects** (admin only).
- Use when the request is **already** approved in the DB but side effects failed (e.g. user still `applicant`, no doctor row).

Behavior:

1. Load the approval request; if not found or not approved → 404/400.
2. If type is not a join type (`new_practice_with_admin_doctor`, `doctor_join_practice`) → 400.
3. **Idempotency**: If the user **already has** a doctor record (by `request.requested_by`), we only run:
   - `UPDATE users SET role = 'doctor', status = 'active'` for that user.
   - Return `{ ok: true, message: 'User already had doctor record; role and status updated.' }`
4. Otherwise we call **applyApprovalSideEffects** (create practice, doctor, membership, update user) and return `{ ok: true, message: 'Side effects applied.' }`.

So: we never create a **second** practice/doctor for the same user from this endpoint; we either fix the user role or run the full side effects once.

---

## 6. Join-Requests: Never Overwrite Approved/Rejected

- **PUT /api/join-requests/:id** can update status (e.g. set “pending” or “under_review”). It maps to `admin_status` on `approval_requests`.
- **Risk**: Something (e.g. “Back to queue”) could send status = pending and overwrite an already approved request.

**Guard we added:**

- Before running the UPDATE, we **read** the current row from `approval_requests`.
- If the **new** status we’re about to write is **pending** and the **current** `admin_status` is **approved** or **rejected**, we **do not** UPDATE. We return the existing row (optionally with updated notes). So we **never** set an approved/rejected request back to pending from this route.

No other route in the codebase is supposed to set `admin_status` (or practice_admin_status) back to pending; only approve and reject set the decided state.

---

## 7. Approval History Schema

- The table uses **performed_by** and **performed_by_type** (not actor_id/actor_type). All INSERTs in approval-requests and join-requests use these column names so they match the migration and don’t fail.

---

## 8. End-to-End Data Flow (Mental Model)

```
User submits application
  → approval_requests row created (admin_status = 'pending')

Admin clicks Approve
  → 1) UPDATE approval_requests SET admin_status='approved', ... RETURNING *
  → 2) INSERT approval_history
  → 3) If both approvals done → applyApprovalSideEffects (practice, doctor, membership, user role)

GET list / GET single
  → SELECT from approval_requests (same DB) → always sees approved if step 1 succeeded

Login as applicant
  → Backend checks users.role; if 'doctor' and doctors row exists → JWT has doctorId → dashboard access
  → If side effects never ran → user still applicant → "Access after membership approved"
```

**Invariants we maintain:**

- Approval state is written **once** in approve, with a single auto-committing UPDATE.
- GET and list read that same state; we avoid caching and use cache-busting.
- No other code path sets an approved/rejected request back to pending (join-requests guard).
- Side effects are a separate step; if they fail, approval is still persisted and can be repaired with apply-side-effects (or by resetting to pending in DB and re-approving once, if no doctor exists yet).

---

## 9. If You Need to “Re-Approve” (Reset to Pending and Approve Again)

Only safe when the user **does not** already have a doctor from this request:

1. In DB:  
   `UPDATE approval_requests SET admin_status = 'pending', admin_reviewed_at = NULL, admin_notes = NULL, updated_at = NOW() WHERE id = ?`
2. Redeploy backend (so the fixed side effects and approve flow are live).
3. In admin UI, open that request and click **Approve** again.

Then the same flow runs: one UPDATE to approved, then history, then side effects. If the user already has a doctor, use the **apply-side-effects** endpoint instead of re-approving to avoid duplicate practice/doctor.

---

## 10. Summary Table

| Component | Purpose |
|-----------|--------|
| **POST .../approve** | Single UPDATE to set approved; then history; then side effects. Never overwrites approval. |
| **GET list / GET :id** | Read-only; no cache; cache-busting on frontend. |
| **applyApprovalSideEffects** | Creates practice, doctor, membership, sets user role/status for join types. Fixed practices INSERT param count. |
| **POST .../apply-side-effects** | Re-run side effects for an already-approved request; idempotent if doctor already exists. |
| **PUT join-requests/:id** | Guard: do not set admin_status to pending if current state is approved/rejected. |
| **approval_history** | All INSERTs use performed_by / performed_by_type. |

Together, this gives: **approve once → DB shows approved everywhere → side effects run once (or can be repaired) → nothing overwrites the approval.**
