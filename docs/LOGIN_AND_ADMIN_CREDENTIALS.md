# Login and Admin Credentials – Steps and Behavior

This document describes how login works for doctors vs admins and what happens when admin credentials are used on the doctor (Join Us) login form.

---

## 1. Two login entry points

| Entry point | Route | Purpose |
|-------------|--------|--------|
| **Join Us (doctor) login** | `/join-us` (SignInForm) | For **doctors** and **applicants**. Redirects doctors to `/doctor/dashboard`; applicants see a message about approval. |
| **Admin login** | `/admin/login` | For **administrators** only. Sets admin session and redirects to `/admin`. |

Both use the **same backend endpoint**: `POST /api/auth/login` with `{ email, password }`. The backend returns `{ token, user: { id, email, role, doctorId? } }`. The **frontend** decides what to do based on `user.role`.

---

## 2. Steps: Doctor / applicant logs in (Join Us)

1. User opens **`/join-us`** and enters email + password in the SignInForm.
2. Frontend calls **`login(email, password)`** → `POST /api/auth/login`.
3. Backend looks up `users` by email, verifies password, returns `role` and (for doctors) `doctorId`.
4. **If `role === 'admin'`:**  
   - Frontend **does not** log the user in.  
   - Shows error: **"Please use the Admin login page to sign in as an administrator."**  
   - No token or session is stored. User stays on the Join Us form.  
   - **Stop here.**
5. **If `role === 'doctor'` and `doctorId`:**  
   - Frontend calls **`setToken(response.token, response.user)`** (stores `aip_doctor_token`, `aip_doctor_user`, legacy session).  
   - Redirects to **`/doctor/dashboard`**.
6. **If applicant or other role (no doctorId):**  
   - Frontend still calls **`setToken(response.token, response.user)`**.  
   - Shows message: **"Access is available after your membership is approved. Please submit a join request if you haven't already."**  
   - No redirect to dashboard.

---

## 3. Steps: Admin logs in (Admin login page)

1. User opens **`/admin/login`** and enters email + password.
2. Frontend calls **`login(email, password)`** → `POST /api/auth/login`.
3. Backend returns `{ token, user: { role: 'admin', ... } }`.
4. Frontend stores token and user:  
   `localStorage.setItem('aip_doctor_token', ...)`,  
   `localStorage.setItem('aip_doctor_user', ...)`.
5. Frontend calls **`setAdminSession(email)`** → sets **`aip_admin_session`** in localStorage.
6. Redirects to **`/admin`**.
7. Admin layout checks **`isAdminAuthenticated()`** (i.e. `getAdminSession() !== null`). Session exists, so the user stays on the admin portal.

---

## 4. Rule: Admin must not sign in from Join Us

**Requirement:** An admin must **not** be able to sign in from the **Join Us** form. They must use the **Admin login** page.

**Implementation (in `SignInForm`):**

1. After a successful `login(email, password)` call, check **`response.user.role === 'admin'`**.
2. If true:
   - **Do not** call `setToken(...)`.
   - **Do not** redirect to `/admin`.
   - Set error message: **"Please use the Admin login page to sign in as an administrator."**
   - Return (stay on the form, no session stored).
3. Otherwise, proceed as before (set token, redirect for doctors, or show message for applicants).

**File:** `src/components/join-us/SignInForm.tsx` (handleSubmit).

---

## 5. Summary

| Where | Admin credentials | Result |
|-------|-------------------|--------|
| **Join Us** (`/join-us`) | Entered | **Not logged in.** Error: "Please use the Admin login page to sign in as an administrator." No token/session stored. |
| **Admin login** (`/admin/login`) | Entered | Logged in as admin; session set; redirect to `/admin`. |

Doctors and applicants use Join Us; admins use `/admin/login` only.
