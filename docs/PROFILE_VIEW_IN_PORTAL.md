# Profile View in Portal – Reference

This document describes how **View Profile** works inside the **Doctor** and **Admin** portals: URLs, APIs, data, and where every in-portal profile link lives. Use it when adding or changing the in-portal profile popup/modal.

---

## 1. Profile URL helpers

- **File:** `src/lib/doctorProfileUrl.ts`
- **Public profile route:** `/doctors/profile?slug=...` or `/doctors/profile?id=...` (static-friendly; no `[slug]` dynamic segment)

| Function | Use |
|---------|-----|
| `getDoctorProfileUrl(doctor)` | `doctor` has `slug?` and `id`. Uses slug if present, else id. |
| `getDoctorProfileUrlBySlug(slug)` | Returns `/doctors/profile?slug=...` |
| `getDoctorProfileUrlById(id)` | Returns `/doctors/profile?id=...` |

---

## 2. APIs used to load profile data

### Doctor

- **File:** `src/lib/api/doctors.ts`
- **Endpoints:**
  - `GET /api/doctors/:id` → `getDoctor(id, token?)` → single doctor (camelCase normalized)
  - `GET /api/doctors/slug/:slug` → `getDoctorBySlug(slug, token?)` → single doctor
- **Normalization:** `normalizeDoctorFromAPI(raw)` maps API snake_case to frontend `Doctor` (camelCase, `conditionServices`, `locations`, `insurance`, `image` from `profile_image_url`, etc.).

### Practice (for profile page)

- **File:** `src/lib/api/practices.ts`
- **Endpoint:** `GET /api/practices/:id` → `getPractice(id, token?)`
- Used when `doctor.practiceId` is set. Profile page also falls back to `getPracticeById` from `src/lib/services/practiceDirectoryService` if API fails.

### Contact visibility

- **File:** `src/lib/services/visibilityService.ts`
- **Function:** `getContactCard(actor, doctor, practice)` → `ContactCard` (phone, email, website, source, mode).
- **Permission:** `canViewDoctorPrivateContact(actor, doctor)` from `src/lib/services/permissionService` decides if logged-in user sees doctor's personal contact vs practice-only.

### Upload base URL (images)

- **File:** `src/lib/api/upload.ts`
- **Function:** `getUploadFullUrl(path)` – profile image and badge images use this when path is not already absolute.

---

## 3. Doctor type (relevant fields for profile)

- **File:** `src/types/index.ts` (and `ConditionServiceRow`, `CertificationItem`)

Key fields used on the profile page:

- Identity: `id`, `slug`, `firstName`, `lastName`, `fullName`, `credentials`, `npi`
- Display: `image`, `specialty`, `specialties[]`, `verified`, `bio`, `about`
- Practice: `practiceId`, `practiceName`, `institutionId` (legacy)
- Contact: `phone`, `website`, `bookingUrl`
- Professional: `medicalSchool`, `internship`, `residency`, `boardCertifications`, `badgesAwards`, `hospitalPrivileges`, `statesLicensedIn`
- Clinical: `conditionServices[]`, `conditionsAndServices[]`, `acceptsNewPatients`, `insurance[]`
- Locations: `locations[]` (or from practice)
- Legacy: `institutionId` (fallback via `getInstitutionById`)

---

## 4. Full profile page and component

- **Page:** `src/app/doctors/profile/page.tsx`  
  - Reads `?slug=` or `?id=` from search params; loads doctor via `getDoctorBySlug(slug)` or `getDoctor(id)`; renders `<DoctorProfile doctor={doctor} />`.
- **Component:** `src/components/DoctorProfile.tsx`  
  - Renders: hero (name, specialty, verified, Book Directly, Send Referral, Message), About, Practice (or Institution legacy), Professional Credentials, Specialties, Conditions & Services, Locations, Accepted Insurance, sidebar (image, website, office hours, Quick Info), CTA, Related Doctors.
  - **Data it uses:**
    - Doctor (from API).
    - Practice: `getPractice(doctor.practiceId)` then normalized address; locations from `p.locations` mapped to `Location`.
    - Contact card: `getContactCard(actor, doctor, practice)` (and optionally `getPracticeById` / `getInstitutionById` for practice source).
    - Image: `doctor.image` with `getUploadFullUrl` if not absolute.
    - Related doctors: from `doctors` in `src/data/doctors.ts` (same specialty, verified) – optional for modal.

---

## 5. In-portal "View Profile" locations (use modal, don't leave portal)

All of these should open the **in-portal profile popup** instead of navigating to `/doctors/profile?...`.

### Doctor portal (`/doctor/dashboard/...`)

| Location | File | Current behavior | Notes |
|---------|------|------------------|--------|
| Find Physician | `src/app/doctor/dashboard/find-physician/page.tsx` | `<Link href={getDoctorProfileUrl(d)} target="_blank">` + "View Profile" button | Replace with open modal by id/slug. |
| Find Physician → Contacts | `src/app/doctor/dashboard/find-physician/contacts/page.tsx` | `<Link href={getDoctorProfileUrl({ slug: c.slug, id: c.id })} target="_blank">` + "View Profile" | Same: open modal. |
| Practice → Doctors | `src/app/doctor/dashboard/practice/doctors/page.tsx` | `<Button onClick={() => router.push(getDoctorProfileUrl(doctor))}>` "View Profile" | Replace with open modal. |
| Referrals | `src/app/doctor/dashboard/referrals/page.tsx` | `<Link href={profileHref}>` "View Profile" (in "New referral" dialog list) | Replace with open modal. |
| Leadership & Committees | `src/app/doctor/dashboard/community/leadership/page.tsx` | `<Link href={getDoctorProfileUrl({ slug: m.doctor_slug, id: m.doctor_id })}>` on member name | Replace with open modal. |

### Admin portal (`/admin/...`)

- **Manage Doctors** (`src/app/admin/members/doctors/page.tsx`): "View Profile" button opens the in-portal profile modal (same `ProfileViewModal` as doctor portal). Edit and Reset password remain. Admin layout wraps content with `ProfileViewProvider` so `useProfileView()` is available.

### Not in portal (keep linking to full page)

- Public site: `DoctorCard`, `FeaturedDoctors`, `FeaturedDoctorsSection`, `DoctorMiniCard`, medical-students articles author link. These should continue to go to `/doctors/profile?slug=...` or `?id=...` (full page), not the modal.

---

## 6. In-portal profile modal (design)

- **Purpose:** Show full profile data (same as doctor profile page) inside a modal so the user never leaves the portal.
- **Data loading:** Same as full page: `getDoctor(id)` or `getDoctorBySlug(slug)`; then `getPractice(doctor.practiceId)`; then `getContactCard(actor, doctor, practice)`.
- **UI:** Scrollable modal (dialog), image + name + specialty + verified, then sections: About, Practice, Credentials, Specialties, Conditions & Services, Locations, Insurance, Quick Info. Optional: "Open full profile" link to `/doctors/profile?...` for new tab.
- **Theme:** Must support both **light** and **dark** mode (e.g. Tailwind `dark:` and portal theme from `PortalThemeContext` / `.dark` on wrapper).
