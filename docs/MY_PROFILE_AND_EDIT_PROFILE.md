# My Profile & Edit Profile — Doctor vs Practice Admin

## Summary

**My Profile** and **Edit Profile** work the same for both **doctors** and **practice admins**. Both roles edit their **own doctor record** on the same page. Practice admins get **additional** sidebar items (Practice Management) to manage the **practice**; the profile page itself does not change by role.

---

## How Save Works — Approval by Role

When you change data in **Edit Profile** and click **Save Changes**, behavior depends on **who** is saving:

| Who | What happens |
|-----|----------------|
| **Admin** | Direct save: `PUT /api/doctors/:id` → profile is updated **immediately**. Admin can change anything. |
| **Practice admin** | **No** direct save. An approval request of type `practice_admin_profile_edit` is created. A **system admin** must approve it; once approved, the backend applies the profile changes. |
| **Doctor** (non–practice admin) | **No** direct save. An approval request of type `doctor_profile_edit` is created. The **practice admin** for that doctor’s practice must approve it; once approved, the backend applies the profile changes. |

So:

1. **Admin:** `EditProfileSection` calls `saveDoctorProfileToAPI(doctor.id, doctor)` → `PUT /api/doctors/:id` → DB updated immediately.
2. **Practice admin:** Frontend creates an approval request (`practice_admin_profile_edit`) with `target_doctor_id` and `payload.doctor`. Admin sees it in the admin approvals list and approves/rejects. On approval, backend runs side effects that `UPDATE doctors SET ...` from the payload.
3. **Doctor:** Frontend creates an approval request (`doctor_profile_edit`) with `practice_id`, `target_doctor_id`, and `payload.doctor`. Practice admin sees it in Practice Management → Approvals and approves/rejects. On approval, backend runs side effects that update the doctor row.

- **Admin** can still change any doctor’s profile from the admin panel (direct PUT).
- **Practice admin’s** own profile edits require **admin approval** to go live.
- **Doctor’s** profile edits require **practice admin approval** to go live.

### Pending state and resubmit

- **Pending badge:** If the latest profile-edit approval request for this doctor is still pending (e.g. `practice_admin_profile_edit` awaiting admin, or `doctor_profile_edit` awaiting practice admin), the Edit Profile page shows a **“Pending approval”** badge next to the title and a short notice.
- **What data is shown when you reopen Edit Profile after submitting?** The form always shows the **current saved (live) profile** from the API, not the submitted-but-pending changes. So after you submit, if you navigate away and come back, you see the same live data; the pending request’s payload is only applied after approval.
- **Submitting again while a request is pending:** The backend **overwrites** the existing pending request of the same type for the same doctor (same behavior as profile completion). So you do not get multiple pending profile-edit requests; the latest submit replaces the pending one.

---

## When Approvals *Are* Used (Complete Profile Flow)

Approvals are used in a **different** flow: the **Complete Profile** flow for **newly approved** members.

- After a join request is approved, the new doctor has `profile_status = 'pending_profile'` and is forced (by `CompleteProfileGate`) to the **Complete Profile** screens (e.g. `/doctor/dashboard/complete-profile`).
- There they fill in **profile** (and, if practice admin, **practice** details) and **submit**. That submission does **not** call `PUT /api/doctors/:id` directly. Instead it creates an **approval request**:
  - **Practice admin:** type `practice_admin_profile_practice_completion` (profile + practice data).
  - **Regular doctor:** type `doctor_profile_completion` (profile data only).
- An **admin** then approves or rejects that request. On approval, the backend runs side effects that update the `doctors` (and, for PA, practice/locations) rows.

So:

| Flow | Who | Save action | Approval? |
|------|-----|-------------|-----------|
| **Edit Profile** (dashboard) | **Admin** | `PUT /api/doctors/:id` → direct DB update | **No** |
| **Edit Profile** (dashboard) | **Practice admin** | Create `practice_admin_profile_edit` → **admin** approves → side effects update DB | **Yes** (admin) |
| **Edit Profile** (dashboard) | **Doctor** | Create `doctor_profile_edit` → **practice admin** approves → side effects update DB | **Yes** (PA) |
| **Complete Profile** (post-join) | New doctor or PA | Submit → create approval request → admin approves → side effects update DB | **Yes** |

---

## Navigation

| Item | Route | Who sees it |
|------|--------|-------------|
| **My Profile** (parent) | `/doctor/dashboard/profile` | All doctors |
| **Edit Profile** (child) | `/doctor/dashboard/profile` | All doctors |
| **Services & Insurance** (child) | `/doctor/dashboard/insurance` | All doctors |
| **View Public Profile** (child) | `/doctor/dashboard/profile/public` | All doctors |

So **My Profile** is the nav group; **Edit Profile** is the first child and points to the same URL. Clicking either goes to the profile edit page.

---

## How it works

### 1. Dashboard layout

- Layout loads the logged-in doctor with `getDoctor(doctorId)` and puts them in **DoctorContext**.
- **Sidebar** is built from a nav tree:
  - **All doctors** get: Dashboard, Find a Physician, My Practice, **My Profile** (with Edit Profile, Services & Insurance, View Public Profile), Referrals, Community, Messages, Membership, Settings.
  - **Practice admins** get the same list **plus**: Practice Management (Approvals, Manage Doctors, Edit Practice Profile, Manage Practice Locations), Membership & Billing.

So the only difference for a practice admin is **extra items** in the sidebar; the My Profile / Edit Profile links and target page are unchanged.

### 2. Profile page (`/doctor/dashboard/profile`)

- **Route:** `src/app/doctor/dashboard/profile/page.tsx`
- **Behavior:**
  - Reads `doctor` and `updateDoctor` from **DoctorContext** (the same doctor loaded in the layout).
  - Renders **EditProfileSection** with that doctor and an `onProfileUpdate` that updates context (and thus the layout’s doctor state).

So this page always edits the **current user’s doctor record**, whether they are a normal doctor or a practice admin.

### 3. EditProfileSection (what you actually edit)

- **Component:** `src/components/dashboard/EditProfileSection.tsx`
- **Edits:** The **doctor** entity only:
  - Basic: first name, last name, full name, credentials, specialty, profile image.
  - Bio, about.
  - Credentials: board certifications, badges/awards, hospital privileges, medical school, residency, etc.
  - Status/settings: verified, featured, accepts new patients, NPI, profile status.

It does **not** edit:

- Practice name, address, or description.
- Practice locations.
- Other doctors in the practice.

Those are under **Practice Management** (practice admin only).

---

## Doctor vs Practice Admin

| Aspect | Doctor | Practice Admin |
|--------|--------|----------------|
| **My Profile / Edit Profile** | Same page, edits own doctor profile | Same page, edits own doctor profile |
| **Profile URL** | `/doctor/dashboard/profile` | `/doctor/dashboard/profile` |
| **Practice-level edits** | No (read-only via My Practice) | Yes, under **Practice Management** (Edit Practice Profile, Manage Practice Locations, etc.) |

So:

- **“My Profile”** = your professional (doctor) profile.
- **“Edit Profile”** = the screen where you edit that doctor profile; same for both roles.
- **Practice admins** additionally use **Practice Management → Edit Practice Profile / Manage Practice Locations** to change the practice itself.

---

## Data flow

1. User logs in → JWT has `doctorId`.
2. Dashboard layout runs `getDoctor(doctorId)` → loads full doctor (including `practiceId`, `roleInPractice`).
3. Layout wraps children in **DoctorProvider** with that doctor.
4. Profile page uses **useDoctorContext()** → gets same doctor, passes to **EditProfileSection**.
5. Saving uses **saveDoctorProfileToAPI** (and local storage) to persist the **doctor** row; no practice fields are written from this page.

---

## Possible next improvements

If you want to extend or clarify behavior:

1. **Copy/labels**  
   Add a short line on the Edit Profile page: e.g. “You’re editing your personal physician profile. Practice admins can edit practice details under Practice Management.”

2. **Practice admin hint in sidebar**  
   Under “My Profile”, optionally show a one-line note for practice admins: “Practice details → Practice Management.”

3. **Role-specific checks**  
   If you ever need to restrict certain profile fields by role, you’d do it inside `EditProfileSection` using `doctor.roleInPractice === 'practice_admin'`; today there are no such restrictions.

4. **Separate “Practice profile” for PA**  
   If you want a single “Edit Practice Profile” entry that’s clearer, you could add a direct link under My Profile for practice admins (e.g. “Edit practice (admin)”) that goes to `/doctor/dashboard/practice` or the practice edit flow, without changing how Edit Profile works.

If you tell me which of these you want (or what’s broken), I can implement the exact changes next.
