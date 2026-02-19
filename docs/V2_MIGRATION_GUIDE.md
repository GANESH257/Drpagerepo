# V2 Migration Guide

## Overview

This document provides a detailed guide for migrating from AIP v1 (doctor-centric) to v2 (practice-centric) architecture. This is a fundamental architectural shift that requires careful planning and implementation.

**Last Updated**: January 29, 2026  
**Version**: 2.0

---

## Key Changes Summary

### v1 Architecture (Current)

- **Primary Entity**: Doctors
- **Secondary Entity**: Institutions (minimal role)
- **Join Flow**: Doctor membership requests → Admin approval
- **Doctor Portal**: Profile, locations, insurance, appointments, referrals, membership
- **Admin Portal**: Manages requests, members (doctors), plans, policies, events
- **Approval**: Single-party (Admin only)

### v2 Architecture (New)

- **Primary Entity**: Practices (clinics)
- **Secondary Entity**: Doctors (belong to practices)
- **Join Flow**: Multi-party approval (Admin + Practice Admin)
- **Doctor Portal**: Enhanced with practice management (for Practice Admins)
- **Admin Portal**: Unified approval queue with multi-party workflows
- **Approval**: Multi-party (Admin + Practice Admin when applicable)

---

## Migration Strategy

### Phase 1: Data Model Migration

#### Step 1.1: Create Practice Entity

**Action**: Create `src/data/practices.ts` (or rename `institutions.ts`)

**Practice Fields Required**:
```typescript
{
  id: string;
  slug: string;
  name: string;
  description: string;
  phone: string;
  email: string;
  website?: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  location: {
    lat: number;
    lng: number;
  };
  logo?: string;
  images: string[];
  specialties: string[];
  services: string[];
  insurance: Insurance[];
  locationList: Location[];
  doctorIds: string[];
  createdAt: string;
  updatedAt: string;
}
```

#### Step 1.2: Update Doctor Entity

**Action**: Add `practiceId` field to all doctors

**Changes Required**:
- Add `practiceId: string` (required) to Doctor type
- Migrate existing doctors to practices:
  - Option A: Create default practice for each doctor
  - Option B: Group doctors by existing institution
  - Option C: Manual assignment

**Migration Script Logic**:
```typescript
// For each doctor in v1:
// 1. Find or create practice
// 2. Assign doctor.practiceId = practice.id
// 3. Add doctor.id to practice.doctorIds[]
```

#### Step 1.3: Create Practice Roles System

**Action**: Implement `aip_practice_roles` localStorage structure

**Structure**:
```typescript
{
  [practiceId]: {
    adminDoctorId: string,  // Practice Admin doctor ID
    doctorRoles: {
      [doctorId]: 'practice_admin' | 'doctor'
    }
  }
}
```

**Initial Setup**:
- Doctor who creates practice → becomes Practice Admin
- Doctors joining practice → role = 'doctor'

---

### Phase 2: Approval System Migration

#### Step 2.1: Unified Approval Queue

**Action**: Create `aip_approval_requests` structure

**Request Types**:
- `doctor_join_existing_practice`
- `practice_create_with_admin`
- `practice_edit`
- `doctor_add_to_practice`
- `practice_location_change`
- `practice_insurance_change`
- `practice_services_change`

**Request Structure**:
```typescript
{
  id: string;
  type: ApprovalRequestType;
  requestedBy: string; // doctorId or email
  practiceId?: string;
  payload: any; // Proposed changes
  adminStatus: 'pending' | 'approved' | 'rejected';
  practiceAdminStatus?: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  practiceAdminNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### Step 2.2: Migrate Existing Join Requests

**Action**: Convert `aip_join_requests` to new approval structure

**Migration Logic**:
```typescript
// For each existing join request:
// 1. Determine request type:
//    - If doctor selected practice → doctor_join_existing_practice
//    - If doctor created practice → practice_create_with_admin
// 2. Map status:
//    - pending → adminStatus: 'pending'
//    - approved → adminStatus: 'approved', practiceAdminStatus: 'approved'
//    - rejected → adminStatus: 'rejected'
// 3. Create new approval request record
```

---

### Phase 3: UI Component Migration

#### Step 3.1: Update Search/Directory

**Changes Required**:
- Primary results: Practices (not doctors)
- Search filters: Specialty, ZIP, Radius (unchanged)
- Name search: Practices first, then doctors
- Practice cards replace doctor cards as primary

**Files to Update**:
- `src/components/DoctorFilters.tsx`
- `src/components/DoctorCard.tsx` → Create `PracticeCard.tsx`
- `src/app/doctors/page.tsx` → Update to show practices

#### Step 3.2: Create Practice Pages

**New Routes**:
- `/practices/[slug]/page.tsx` - Practice detail page
- Update `/doctors/[slug]/page.tsx` - Show practice context

**Practice Page Sections**:
1. Overview (name, description, contacts)
2. Locations list
3. Insurance + Services
4. Doctors section (filterable by specialty)

#### Step 3.3: Update Doctor Portal

**New Routes**:
- `/doctor/dashboard/notifications` - Notifications screen
- `/doctor/dashboard/practice` - Practice management (Practice Admin only)
- `/doctor/dashboard/practice/locations` - Practice locations (Practice Admin)
- `/doctor/dashboard/practice/doctors` - Practice doctors management (Practice Admin)

**Enhanced Routes**:
- `/doctor/dashboard/referrals` - Add Sent/Received tabs
- `/doctor/dashboard/profile` - Show practice context

---

### Phase 4: Permission System Migration

#### Step 4.1: Role Detection

**Action**: Create role detection utilities

**Functions Needed**:
```typescript
// Check if doctor is Practice Admin
function isPracticeAdmin(doctorId: string, practiceId: string): boolean

// Get doctor role in practice
function getDoctorRole(doctorId: string, practiceId: string): 'practice_admin' | 'doctor'

// Check if doctor can edit practice
function canEditPractice(doctorId: string, practiceId: string): boolean

// Check if doctor can approve join requests
function canApproveJoinRequests(doctorId: string, practiceId: string): boolean
```

#### Step 4.2: Contact Visibility Rules

**Action**: Implement login-state dependent display

**Rules**:
- Public: Show practice contact, hide doctor personal contact
- Logged in doctor: Show doctor personal contact + practice section
- Practice Admin: Full access to practice data

**Implementation**:
- Update `DoctorProfile.tsx` component
- Add conditional rendering based on `isAuthenticated()`
- Create `PracticeContactSection.tsx` component

---

### Phase 5: Data Storage Migration

#### Step 5.1: localStorage Key Migration

**Rename/Migrate Keys**:
- `aip_institution_overrides` → `aip_practice_overrides` (or keep key, change meaning)
- `aip_deleted_institutions` → `aip_deleted_practices` (or keep key)

**New Keys to Add**:
- `aip_practice_roles`
- `aip_approval_requests`
- `aip_practice_invitations`
- `aip_notifications_{doctorId}`
- `aip_referrals` (or per-doctor keys)

#### Step 5.2: Seed Data Migration

**Action**: Convert existing seed data

**Process**:
1. Review `src/data/doctors.ts`
2. Group doctors by institution (if exists)
3. Create practices from institutions
4. Assign `practiceId` to each doctor
5. Set Practice Admin (first doctor or specified)

---

## Migration Checklist

### Pre-Migration

- [ ] Backup all localStorage data
- [ ] Document current v1 data structure
- [ ] Review all existing join requests
- [ ] Identify doctors without institutions
- [ ] Plan practice creation strategy

### Data Migration

- [ ] Create `practices.ts` seed file
- [ ] Add `practiceId` to all doctors
- [ ] Create `aip_practice_roles` structure
- [ ] Migrate join requests to approval queue
- [ ] Update localStorage keys

### Code Migration

- [ ] Update TypeScript types
- [ ] Create Practice components
- [ ] Update search/directory UI
- [ ] Create practice pages
- [ ] Update doctor portal routes
- [ ] Implement role detection
- [ ] Add contact visibility rules

### Testing

- [ ] Test practice creation flow
- [ ] Test doctor join existing practice
- [ ] Test Practice Admin approval flow
- [ ] Test Admin approval flow
- [ ] Test contact visibility rules
- [ ] Test referral sending
- [ ] Test notifications system

### Deployment

- [ ] Deploy seed data updates
- [ ] Run migration script (if needed)
- [ ] Verify localStorage structure
- [ ] Monitor for errors
- [ ] Update documentation

---

## Rollback Plan

If migration issues occur:

1. **Keep v1 code branch**: Maintain v1 functionality
2. **Gradual rollout**: Migrate practices incrementally
3. **Data backup**: Restore from localStorage backup
4. **Feature flags**: Use flags to toggle v1/v2 features

---

## Migration Timeline Estimate

- **Phase 1 (Data Model)**: 2-3 days
- **Phase 2 (Approval System)**: 2-3 days
- **Phase 3 (UI Components)**: 3-4 days
- **Phase 4 (Permissions)**: 2 days
- **Phase 5 (Data Storage)**: 1-2 days
- **Testing**: 2-3 days
- **Total**: ~12-17 days

---

## Post-Migration Tasks

1. **Monitor**: Watch for errors in approval flows
2. **User Training**: Update user guides
3. **Documentation**: Update all docs to reflect v2
4. **Analytics**: Track adoption of new features
5. **Feedback**: Collect user feedback on new workflows

---

## Common Migration Issues & Solutions

### Issue: Doctors without practices

**Solution**: 
- Create default practice for each doctor
- Or group by city/specialty
- Or prompt admin to assign manually

### Issue: Existing join requests

**Solution**:
- Migrate to new approval structure
- Set appropriate statuses
- Preserve rejection reasons

### Issue: Practice Admin assignment

**Solution**:
- First doctor in practice → Practice Admin
- Or admin assigns manually
- Or based on creation request

### Issue: Contact visibility confusion

**Solution**:
- Clear UI indicators
- Tooltips explaining visibility rules
- Consistent implementation across pages

---

**Next Steps**: See `V2_ENTITY_MODELS.md` for detailed data structures.
