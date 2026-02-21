# API Migration Status

## Completed ✅

### Backend API Endpoints Created
- ✅ `/api/departments` - Get all departments/specialties
- ✅ `/api/membership-plans` - Get membership plans
- ✅ `/api/approval-requests` - CRUD for approval requests
- ✅ `/api/referrals` - CRUD for referrals
- ✅ `/api/appointments` - CRUD for appointment requests
- ✅ `/api/messages` - Message threads and messages
- ✅ `/api/notifications` - User notifications
- ✅ `/api/doctors` - Extended with filters/search/pagination
- ✅ `/api/practices` - Extended with filters/search/pagination

### Frontend API Clients Created
- ✅ `src/lib/api/departments.ts`
- ✅ `src/lib/api/membership-plans.ts`
- ✅ `src/lib/api/approval-requests.ts`
- ✅ `src/lib/api/referrals.ts`
- ✅ `src/lib/api/appointments.ts`
- ✅ `src/lib/api/messages.ts`
- ✅ `src/lib/api/notifications.ts`
- ✅ `src/lib/api/doctors.ts` - Updated with filters
- ✅ `src/lib/api/practices.ts` - Updated with filters
- ✅ `src/lib/api/utils.ts` - Token/user utilities

### Storage Functions Migrated
- ✅ `src/lib/doctorStorage.ts` - Now uses API for profiles, appointments, referrals
- ✅ `src/lib/memberStorage.ts` - Now uses API for doctors
- ✅ `src/lib/services/practiceDirectoryService.ts` - Partially migrated (getAllPractices, searchPractices)

### Components Migrated
- ✅ `src/components/join-us/PracticeSelectionSection.tsx` - Uses API
- ✅ `src/app/doctors/page.tsx` - Uses API
- ✅ `src/components/DoctorFilters.tsx` - Uses API for departments
- ✅ `src/components/dashboard/EditProfileSection.tsx` - Already using API
- ✅ `src/app/doctor/dashboard/layout.tsx` - Already using API
- ✅ `src/components/join-us/SignInForm.tsx` - Already using API
- ✅ `src/components/join-us/SignUpForm.tsx` - Already using API

## In Progress / Needs Migration ⚠️

### Components Still Using Seed Data
These components import from `@/data/departments` and need migration:
- ⚠️ `src/components/dashboard/EditProfileSection.tsx`
- ⚠️ `src/components/join-us/ApplicationBasicDetailsForm.tsx`
- ⚠️ `src/components/admin/MemberEditDialog.tsx`
- ⚠️ `src/components/public/practices/PracticeFilters.tsx`
- ⚠️ `src/components/DepartmentsMarquee.tsx`
- ⚠️ `src/components/onboarding/OnboardingBasicDetailsForm.tsx`
- ⚠️ `src/components/Departments.tsx`
- ⚠️ `src/components/Hero.tsx`

### Components Using Old Storage Functions
These components call `getAllPractices()` or `getAllDoctors()` synchronously:
- ⚠️ `src/components/dashboard/MessagesSection.tsx`
- ⚠️ `src/components/admin/ReferralsTable.tsx`
- ⚠️ `src/components/admin/MembersTable.tsx`
- ⚠️ `src/components/admin/PracticeRosterSection.tsx`
- ⚠️ `src/components/public/practices/PracticeFilters.tsx`
- ⚠️ `src/components/InstitutionDetailClient.tsx`
- ⚠️ `src/app/admin/*` - Multiple admin pages
- ⚠️ `src/app/doctor/dashboard/*` - Multiple dashboard pages

### Functions Still Using Seed Data
- ⚠️ `src/lib/services/practiceDirectoryService.ts` - `getPracticeBySlug()` needs async migration
- ⚠️ `src/lib/memberStorage.ts` - Still has localStorage overrides (can be removed)

## Next Steps

1. **Migrate remaining components** that use `departments` from `@/data/departments` to use `getDepartments()` API
2. **Update async function calls** - Convert all `getAllPractices()` and `getAllDoctors()` calls to async with proper loading states
3. **Remove seed data imports** - Remove all imports from `@/data/doctors`, `@/data/departments`, `@/data/practices`
4. **Test thoroughly** - Ensure all API calls work correctly and handle errors gracefully
5. **Update admin pages** - Migrate admin components to use API endpoints

## Notes

- All API endpoints are registered in `aip-backend/src/index.ts`
- Token management is centralized in `src/lib/api/utils.ts` and `src/lib/api/config.ts`
- Backward compatibility is maintained where possible (deprecated functions still exist)
- localStorage is still used for JWT token storage (as intended)
- Some localStorage caching may remain for offline capabilities
