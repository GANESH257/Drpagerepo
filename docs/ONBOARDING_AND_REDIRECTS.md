# Onboarding & Redirect Flow

This doc describes how join-approved vs portal-approved doctors are routed and how profile save works with the backend.

## Who sees onboarding

- **Onboarding** (`/doctor/onboard`) is **only** for doctors whose **join request was approved** but whose **profile is not yet approved** for the full portal (`profile_status === 'pending_profile'`).
- **Already-approved** doctors must **never** be shown onboarding; they go straight to the full dashboard.

## Redirect rules

### After login (SignInForm)

- Reads `profile_status` or `profileStatus` from the login response (backend may send either).
- **Only** when value is **exactly** `'active'` → redirect to `/doctor/dashboard`.
- Any other value (`'pending_profile'`, `undefined`, or missing) → redirect to `/doctor/onboard`.

So if the backend does not send profile status, the user is sent to onboard (safe default).

### Dashboard layout

- Renders immediately using a minimal doctor from session (no blocking on full `getDoctor`).
- If session has `user.profileStatus === 'pending_profile'` → redirect to `/doctor/onboard`.
- Loads full doctor in the background; when the response arrives, if `loadedDoctor.profileStatus === 'pending_profile'` → redirect to `/doctor/onboard` (safety net when login didn’t send status).

### Onboard dashboard page

- When the page loads, it may call `getDoctor` once. If the doctor is already approved (`profileStatus === 'active'` or `verified === true`) → redirect to `/doctor/dashboard`. So approved doctors who were sent to onboard (e.g. missing profile status on login) are sent to the dashboard after one fetch.

## Onboarding flow (steps)

1. **Step 1 – Edit Profile** (`/doctor/onboard/profile`): Basic info, conditions & services, insurance. One **Save** persists via API; **Submit for approval** is Step 3 on the onboard dashboard.
2. **Step 2 – Edit Practice** (`/doctor/onboard/practice`): Shown only for practice admins (PA). One Save.
3. **Step 3 – Submit for approval**: On the onboard dashboard. Submits profile (and practice if PA) for approval. After success, shows “Submitted” and **does not** redirect to the dashboard; copy explains they’ll get portal access after approval.

## Profile save (onboard & dashboard)

- **Save** calls `saveDoctorProfile` → `updateDoctor` in `src/lib/api/doctors.ts`.
- The frontend sends a **camelCase** `Doctor`; `updateDoctor` converts it to **snake_case** for the backend (`doctorPayloadToSnakeCase`): e.g. `full_name`, `conditions_and_services`, `first_name`, `last_name`, etc.
- If only `fullName` is set, `first_name` / `last_name` are derived from it for backends that require them.
- Only updatable fields are sent (no `id`, `slug`, `rating`, `profileStatus`, etc.).
- The API response is normalized with `normalizeDoctorFromAPI` and returned; the onboard profile page updates local state from this response so the UI matches the server.

## Key files

| File | Role |
|------|------|
| `src/components/join-us/SignInForm.tsx` | Login redirect: `active` → dashboard, else → onboard |
| `src/app/doctor/dashboard/layout.tsx` | Minimal doctor from session; redirect to onboard if pending; background load and redirect when full doctor is pending |
| `src/app/doctor/onboard/layout.tsx` | Onboarding shell (session-only auth, no blocking getDoctor) |
| `src/app/doctor/onboard/page.tsx` | Steps + Submit; redirect to dashboard if doctor already active |
| `src/app/doctor/onboard/profile/page.tsx` | Edit profile + Save; uses API response to update state |
| `src/lib/api/doctors.ts` | `updateDoctor` + `doctorPayloadToSnakeCase` (camelCase → snake_case), `normalizeDoctorFromAPI` |
| `src/lib/useDoctorSession.ts` | Session stores `profileStatus` (normalized from API `profile_status`) |

## Backend expectations

- **Login**: Ideally returns `profile_status: 'pending_profile' | 'active'` (or `profileStatus`) so the correct redirect can be done without an extra request.
- **PUT /api/doctors/:id**: Expects **snake_case** body (e.g. `full_name`, `conditions_and_services`, `first_name`, `last_name`, `insurance`, etc.). The frontend converts from camelCase and derives `first_name`/`last_name` from `full_name` when needed.
- **Errors**: `error` and optional `detail` are shown to the user; 403 is mapped to “Unauthorized to update this doctor”.
