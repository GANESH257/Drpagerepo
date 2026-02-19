# V2 Implementation Roadmap

## Overview

This document provides a detailed implementation roadmap for migrating from AIP v1 to v2. It breaks down the work into tracks, phases, and specific tasks with estimated timelines.

**Last Updated**: January 29, 2026  
**Version**: 2.0

---

## Implementation Tracks

The Master Plan identifies 9 implementation tracks. This roadmap organizes them into phases with dependencies and priorities.

---

## Phase 1: Foundation & Data Model (Week 1-2)

### Track 1: Data Model + localStorage Keys + Migration Plan

**Priority**: 🔴 Critical (Blocks other work)

**Tasks**:

1. **Create Practice Entity**
   - [ ] Create `src/types/practice.ts` with Practice interface
   - [ ] Create `src/data/practices.ts` seed file
   - [ ] Migrate existing institutions to practices
   - [ ] Update TypeScript types export

2. **Update Doctor Entity**
   - [ ] Add `practiceId: string` to Doctor interface
   - [ ] Update all existing doctors with practiceId
   - [ ] Create migration script for v1 → v2 data

3. **Create Practice Roles System**
   - [ ] Create `src/lib/practiceRoles.ts` utility
   - [ ] Implement `aip_practice_roles` localStorage structure
   - [ ] Create helper functions (isPracticeAdmin, getDoctorRole, etc.)

4. **Create Approval Request Entity**
   - [ ] Create `src/types/approval.ts` with ApprovalRequest interface
   - [ ] Implement `aip_approval_requests` localStorage structure
   - [ ] Create approval request CRUD functions

5. **Create Supporting Entities**
   - [ ] Create PracticeInvitation interface
   - [ ] Create Notification interface
   - [ ] Create enhanced Referral interface
   - [ ] Implement localStorage structures

6. **Migration Script**
   - [ ] Create migration script for existing join requests
   - [ ] Create migration script for doctor → practice assignment
   - [ ] Test migration on sample data
   - [ ] Document migration process

**Estimated Time**: 5-7 days

**Dependencies**: None

**Deliverables**:
- Updated type definitions
- Seed data files
- Migration scripts
- localStorage utility functions

---

## Phase 2: Approval System (Week 2-3)

### Track 2: Approval Queue Redesign

**Priority**: 🔴 Critical

**Tasks**:

1. **Admin Approval UI**
   - [ ] Redesign `/admin/requests` page
   - [ ] Create unified approval queue component
   - [ ] Add request type badges and filters
   - [ ] Create request detail view with diff
   - [ ] Implement approve/reject actions with reason fields
   - [ ] Add status indicators (both approvals)

2. **Practice Admin Approval UI**
   - [ ] Create `/doctor/dashboard/practice/approvals` route
   - [ ] Create approval screen for Practice Admins
   - [ ] Show only practice-specific requests
   - [ ] Implement approve/reject actions
   - [ ] Show admin approval status

3. **Approval Workflow Implementation**
   - [ ] Implement Scenario A (doctor joins practice)
   - [ ] Implement Scenario B (practice creation)
   - [ ] Implement Scenario C (invitation flow)
   - [ ] Implement Scenario D (practice edits)
   - [ ] Add status transition logic
   - [ ] Add validation and error handling

4. **Notification System (Basic)**
   - [ ] Create notification storage functions
   - [ ] Implement notification triggers for approvals
   - [ ] Create notification display component
   - [ ] Add notification badges/counters

**Estimated Time**: 6-8 days

**Dependencies**: Phase 1 (Data Model)

**Deliverables**:
- Admin approval queue UI
- Practice Admin approval UI
- Approval workflow functions
- Basic notification system

---

## Phase 3: Practice Entity & Directory (Week 3-4)

### Track 3: Practice Entity Pages + Directory Search Update

**Priority**: 🟡 High

**Tasks**:

1. **Practice Seed Data**
   - [ ] Create practices from existing institutions
   - [ ] Assign doctors to practices
   - [ ] Set Practice Admins
   - [ ] Add practice locations, insurance, services

2. **Practice Directory**
   - [ ] Create `/practices` page (list view)
   - [ ] Update search to show practices first
   - [ ] Create PracticeCard component
   - [ ] Implement practice filtering (specialty, ZIP, radius)
   - [ ] Update name search (practices first, then doctors)

3. **Practice Detail Page**
   - [ ] Create `/practices/[slug]/page.tsx`
   - [ ] Create practice overview section
   - [ ] Create practice locations section
   - [ ] Create practice insurance/services section
   - [ ] Create practice doctors section (with specialty filters)
   - [ ] Implement contact visibility rules

4. **Update Doctor Pages**
   - [ ] Update `/doctors/[slug]/page.tsx`
   - [ ] Add practice context section
   - [ ] Update contact visibility (show practice contact for public)
   - [ ] Add "Send Referral" button (for logged-in doctors)
   - [ ] Show personal contacts (for logged-in doctors)

5. **Search Updates**
   - [ ] Update search algorithm (practices primary)
   - [ ] Update filters to work with practices
   - [ ] Update search results UI
   - [ ] Add practice/doctor toggle (optional)

**Estimated Time**: 7-9 days

**Dependencies**: Phase 1 (Data Model)

**Deliverables**:
- Practice directory pages
- Practice detail pages
- Updated search functionality
- Updated doctor pages

---

## Phase 4: Doctor Portal Enhancements (Week 4-5)

### Track 4: Doctor Portal Upgrades

**Priority**: 🟡 High

**Tasks**:

1. **Notifications Screen**
   - [ ] Create `/doctor/dashboard/notifications` route
   - [ ] Create notifications list component
   - [ ] Implement mark as read functionality
   - [ ] Add notification filters (type, read/unread)
   - [ ] Add notification badges to header

2. **Enhanced Referrals**
   - [ ] Update `/doctor/dashboard/referrals` page
   - [ ] Add "Sent" and "Received" tabs
   - [ ] Update referral status (new/attended/removed)
   - [ ] Add send referral from doctor profile page
   - [ ] Create referral form/dialog

3. **Practice Context in Profile**
   - [ ] Show practice information in profile
   - [ ] Add link to practice page
   - [ ] Show practice membership status
   - [ ] Update profile completion calculation

4. **Membership Updates**
   - [ ] Show practice-level membership (if applicable)
   - [ ] Show doctor-level membership
   - [ ] Update membership display

**Estimated Time**: 4-5 days

**Dependencies**: Phase 1 (Data Model), Phase 2 (Notifications)

**Deliverables**:
- Notifications screen
- Enhanced referrals UI
- Updated doctor dashboard

---

## Phase 5: Practice Admin Portal (Week 5-6)

### Track 7: Practice Admin Screens

**Priority**: 🟡 High

**Tasks**:

1. **Practice Management**
   - [ ] Create `/doctor/dashboard/practice` route
   - [ ] Create practice overview/edit screen
   - [ ] Implement practice edit form (with approval workflow)
   - [ ] Show approval status for pending edits
   - [ ] Add practice info display

2. **Practice Locations Management**
   - [ ] Create `/doctor/dashboard/practice/locations` route
   - [ ] Create locations list/edit screen
   - [ ] Implement add/edit/remove locations (with approval)
   - [ ] Show approval status
   - [ ] Add location form dialog

3. **Practice Insurance & Services**
   - [ ] Create `/doctor/dashboard/practice/insurance` route
   - [ ] Create insurance/services edit screen
   - [ ] Implement edit functionality (with approval)
   - [ ] Show approval status
   - [ ] Add insurance/services forms

4. **Practice Doctors Management**
   - [ ] Create `/doctor/dashboard/practice/doctors` route
   - [ ] Create doctors list screen
   - [ ] Implement invite doctor functionality
   - [ ] Implement approve/deny join requests
   - [ ] Implement remove doctor (with approval if needed)
   - [ ] Show doctor details/edit (with permissions)

5. **Permissions Screen**
   - [ ] Create permissions display component
   - [ ] Show what Practice Admin can/can't do
   - [ ] Show approval states
   - [ ] Add help/documentation links

**Estimated Time**: 6-8 days

**Dependencies**: Phase 1 (Data Model), Phase 2 (Approval System)

**Deliverables**:
- Practice Admin portal screens
- Practice management UI
- Doctor management UI

---

## Phase 6: Permissions & Visibility (Week 6)

### Track 8: Permission-Based UI Rendering + Contact Visibility Rules

**Priority**: 🟡 High

**Tasks**:

1. **Permission Utilities**
   - [ ] Create `src/lib/permissions.ts` utility
   - [ ] Implement role detection functions
   - [ ] Implement permission check functions
   - [ ] Add permission hooks for React

2. **Contact Visibility Implementation**
   - [ ] Update DoctorProfile component
   - [ ] Implement public view (practice contact only)
   - [ ] Implement logged-in view (personal contacts)
   - [ ] Update practice pages
   - [ ] Add visibility indicators

3. **UI Rendering Rules**
   - [ ] Update all components with permission checks
   - [ ] Show/hide buttons based on role
   - [ ] Update navigation based on role
   - [ ] Add role-based feature flags

4. **Testing**
   - [ ] Test all permission scenarios
   - [ ] Test contact visibility rules
   - [ ] Test UI rendering for each role

**Estimated Time**: 3-4 days

**Dependencies**: Phase 1 (Data Model), Phase 4 (Doctor Portal)

**Deliverables**:
- Permission utility functions
- Updated UI components
- Contact visibility implementation

---

## Phase 7: Referrals Enhancement (Week 6-7)

### Track 6: Referrals (Send + Inbox/Outbox)

**Priority**: 🟢 Medium

**Tasks**:

1. **Referral Storage**
   - [ ] Decide on storage structure (global vs per-doctor)
   - [ ] Implement referral CRUD functions
   - [ ] Create referral utilities

2. **Send Referral**
   - [ ] Create referral form component
   - [ ] Add "Send Referral" button to doctor profile pages
   - [ ] Implement referral creation
   - [ ] Add validation
   - [ ] Send notifications

3. **Referral Inbox/Outbox**
   - [ ] Update referrals page with tabs
   - [ ] Implement sent referrals list
   - [ ] Implement received referrals list
   - [ ] Add status filters
   - [ ] Add status update functionality

4. **Referral Notifications**
   - [ ] Notification on referral received
   - [ ] Notification on status change
   - [ ] Update notification system

**Estimated Time**: 3-4 days

**Dependencies**: Phase 4 (Notifications), Phase 1 (Data Model)

**Deliverables**:
- Enhanced referrals UI
- Send referral functionality
- Referral inbox/outbox

---

## Phase 8: Chat Scaffolding (Week 7)

### Track 9: Chat Scaffolding (Data Structures + Placeholder UI)

**Priority**: 🟢 Low (Future-proofing)

**Tasks**:

1. **Chat Data Structures**
   - [ ] Create ChatThread interface
   - [ ] Create ChatMessage interface
   - [ ] Implement localStorage structures
   - [ ] Create chat utilities

2. **Placeholder UI**
   - [ ] Create chat component shell
   - [ ] Add chat route (placeholder)
   - [ ] Show "Coming Soon" message
   - [ ] Add chat icon to navigation

3. **Permission Planning**
   - [ ] Document chat permissions
   - [ ] Plan admin announcements
   - [ ] Plan practice announcements
   - [ ] Plan direct messaging

**Estimated Time**: 2-3 days

**Dependencies**: Phase 1 (Data Model)

**Deliverables**:
- Chat data structures
- Placeholder UI
- Permission documentation

---

## Testing & QA Phase (Week 8)

### Comprehensive Testing

**Tasks**:

1. **Unit Tests**
   - [ ] Test data model functions
   - [ ] Test approval workflows
   - [ ] Test permission checks
   - [ ] Test notification triggers

2. **Integration Tests**
   - [ ] Test complete approval flows
   - [ ] Test practice creation flow
   - [ ] Test doctor join flow
   - [ ] Test referral flow

3. **UI/UX Testing**
   - [ ] Test all user roles
   - [ ] Test contact visibility
   - [ ] Test responsive design
   - [ ] Test accessibility

4. **Migration Testing**
   - [ ] Test data migration scripts
   - [ ] Test v1 → v2 conversion
   - [ ] Test localStorage migration
   - [ ] Test rollback procedures

**Estimated Time**: 4-5 days

---

## Deployment Phase (Week 9)

### Production Deployment

**Tasks**:

1. **Pre-Deployment**
   - [ ] Final code review
   - [ ] Update documentation
   - [ ] Create deployment checklist
   - [ ] Backup v1 data

2. **Deployment**
   - [ ] Deploy seed data updates
   - [ ] Run migration scripts
   - [ ] Deploy code updates
   - [ ] Verify deployment

3. **Post-Deployment**
   - [ ] Monitor for errors
   - [ ] Verify functionality
   - [ ] Collect user feedback
   - [ ] Address issues

**Estimated Time**: 2-3 days

---

## Timeline Summary

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Foundation & Data Model | 5-7 days | None |
| Phase 2: Approval System | 6-8 days | Phase 1 |
| Phase 3: Practice Entity & Directory | 7-9 days | Phase 1 |
| Phase 4: Doctor Portal Enhancements | 4-5 days | Phase 1, Phase 2 |
| Phase 5: Practice Admin Portal | 6-8 days | Phase 1, Phase 2 |
| Phase 6: Permissions & Visibility | 3-4 days | Phase 1, Phase 4 |
| Phase 7: Referrals Enhancement | 3-4 days | Phase 4, Phase 1 |
| Phase 8: Chat Scaffolding | 2-3 days | Phase 1 |
| Testing & QA | 4-5 days | All phases |
| Deployment | 2-3 days | Testing |

**Total Estimated Time**: 42-56 days (~6-8 weeks)

---

## Parallel Work Opportunities

Some phases can be worked on in parallel:

- **Phase 3** (Practice Pages) can start after Phase 1
- **Phase 4** (Doctor Portal) can start after Phase 1
- **Phase 7** (Referrals) can start after Phase 4 begins
- **Phase 8** (Chat) can start anytime after Phase 1

**Optimized Timeline**: ~35-45 days (~5-6 weeks) with parallel work

---

## Risk Mitigation

### High-Risk Areas

1. **Data Migration**
   - Risk: Data loss or corruption
   - Mitigation: Comprehensive backups, test migrations, rollback plan

2. **Approval Workflows**
   - Risk: Complex logic, edge cases
   - Mitigation: Detailed testing, clear documentation, user training

3. **Permission System**
   - Risk: Security vulnerabilities
   - Mitigation: Thorough testing, code review, server-side validation (future)

### Contingency Plans

- **Feature Flags**: Use flags to toggle v1/v2 features
- **Gradual Rollout**: Migrate practices incrementally
- **Rollback Plan**: Keep v1 code branch, restore from backups

---

## Success Criteria

### Phase Completion Criteria

1. **Phase 1**: All data models created, migration scripts tested
2. **Phase 2**: Approval workflows working, UI functional
3. **Phase 3**: Practice pages live, search updated
4. **Phase 4**: Notifications working, referrals enhanced
5. **Phase 5**: Practice Admin portal functional
6. **Phase 6**: Permissions working, visibility rules implemented
7. **Phase 7**: Referrals fully functional
8. **Phase 8**: Chat structures in place

### Overall Success Criteria

- ✅ All v1 functionality preserved
- ✅ All v2 features working
- ✅ No data loss during migration
- ✅ All user roles functional
- ✅ Approval workflows tested and working
- ✅ Documentation complete

---

## Next Steps

1. **Review and Approve Roadmap**
2. **Assign Tracks to Developers**
3. **Set Up Development Environment**
4. **Begin Phase 1: Foundation & Data Model**
5. **Daily Standups to Track Progress**
6. **Weekly Reviews of Completed Phases**

---

**Related Documents**:
- `V2_MIGRATION_GUIDE.md` - Detailed migration steps
- `V2_ENTITY_MODELS.md` - Data structures reference
- `V2_ROLES_PERMISSIONS.md` - Permission matrix
- `V2_APPROVAL_WORKFLOWS.md` - Workflow documentation
