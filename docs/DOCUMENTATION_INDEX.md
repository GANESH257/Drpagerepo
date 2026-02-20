# Documentation Index

**Date**: January 29, 2026  
**Version**: 2.0  
**Status**: Production Ready

---

## Overview

This index provides quick access to all V2 documentation. Each document serves a specific purpose and audience.

---

## Documentation Structure

### 1. Complete Features Documentation
**File**: `COMPLETE_FEATURES_DOCUMENTATION.md`

**Purpose**: Comprehensive overview of all system features with function references

**Contents**:
- Core features (10 major features)
- User roles & portals
- Feature details with function references
- Data models
- Storage architecture
- Key service files
- UI component structure

**Best For**: 
- Developers implementing new features
- Understanding system capabilities
- Finding function locations

**Key Sections**:
- Practice Management
- Doctor Management
- Approval Workflows
- Referral System
- Messaging System
- Notification System
- Multi-Location Support
- Contact Visibility Rules
- Membership Management
- Announcements

---

### 2. Hierarchy and Approval Processes
**File**: `HIERARCHY_AND_APPROVAL_PROCESSES.md`

**Purpose**: Detailed explanation of role hierarchy, approval workflows, and governance rules

**Contents**:
- Role hierarchy (Admin → Practice Admin → Doctor → Applicant → Public)
- Approval system architecture
- All 8 approval types with detailed workflows
- Status management
- Permission enforcement
- Governance rules (7 key rules)
- Approval history
- Notification triggers

**Best For**:
- Understanding approval workflows
- Implementing permission checks
- Understanding governance rules
- Debugging approval issues

**Key Sections**:
- Role Definitions
- Approval Request Structure
- Approval Workflows (8 types)
- Status Transitions
- Permission Enforcement Points
- Governance Rules

---

### 3. Flow Diagrams
**File**: `FLOW_DIAGRAMS.md`

**Purpose**: Visual representation of system flows using Mermaid diagrams

**Contents**:
- System overview flow
- Approval workflows (5 detailed flows)
- User authentication flow
- Referral flow
- Messaging flow
- Practice management flow
- Contact visibility flow
- Notification flow
- Data flow diagrams
- Error handling flow

**Best For**:
- Visual understanding of workflows
- Onboarding new developers
- System architecture overview
- Process documentation

**Key Diagrams**:
- Doctor Joins Practice (sequence diagram)
- Practice Creation (sequence diagram)
- Practice Edit Request (sequence diagram)
- Location Management (sequence diagram)
- Roster Management (sequence diagram)
- Approval Request Lifecycle (state diagram)

---

### 4. Feature Explanations with Functions
**File**: `FEATURE_EXPLANATIONS_WITH_FUNCTIONS.md`

**Purpose**: Simple, practical explanations with code examples and function references

**Contents**:
- Practice Management (3 functions)
- Doctor Management (3 functions)
- Approval System (5 functions)
- Referral System (4 functions)
- Messaging System (4 functions)
- Notification System (4 functions)
- Location Management (2 functions)
- Contact Visibility (2 functions)
- Authentication & Permissions (6 functions)
- Common patterns
- Error handling

**Best For**:
- Quick function lookups
- Copy-paste code examples
- Understanding how to use functions
- Implementation reference

**Key Features**:
- Simple "What It Does" explanations
- Function signatures with locations
- Usage examples with code
- "What Happens" explanations

---

## Quick Reference Guide

### By Role

#### Admin
- **Features**: `COMPLETE_FEATURES_DOCUMENTATION.md` → Admin Portal
- **Permissions**: `HIERARCHY_AND_APPROVAL_PROCESSES.md` → Role Definitions → Admin
- **Functions**: `FEATURE_EXPLANATIONS_WITH_FUNCTIONS.md` → Authentication & Permissions

#### Practice Admin
- **Features**: `COMPLETE_FEATURES_DOCUMENTATION.md` → Practice Admin Portal
- **Permissions**: `HIERARCHY_AND_APPROVAL_PROCESSES.md` → Role Definitions → Practice Admin
- **Workflows**: `FLOW_DIAGRAMS.md` → Practice Management Flow

#### Doctor
- **Features**: `COMPLETE_FEATURES_DOCUMENTATION.md` → Doctor Portal
- **Permissions**: `HIERARCHY_AND_APPROVAL_PROCESSES.md` → Role Definitions → Doctor
- **Functions**: `FEATURE_EXPLANATIONS_WITH_FUNCTIONS.md` → Referral System, Messaging System

---

### By Feature

#### Approval System
- **Overview**: `COMPLETE_FEATURES_DOCUMENTATION.md` → Approval Workflows
- **Details**: `HIERARCHY_AND_APPROVAL_PROCESSES.md` → Approval Workflows
- **Diagrams**: `FLOW_DIAGRAMS.md` → Approval Workflows
- **Functions**: `FEATURE_EXPLANATIONS_WITH_FUNCTIONS.md` → Approval System

#### Referral System
- **Overview**: `COMPLETE_FEATURES_DOCUMENTATION.md` → Referral System
- **Flow**: `FLOW_DIAGRAMS.md` → Referral Flow
- **Functions**: `FEATURE_EXPLANATIONS_WITH_FUNCTIONS.md` → Referral System

#### Messaging System
- **Overview**: `COMPLETE_FEATURES_DOCUMENTATION.md` → Messaging System
- **Flow**: `FLOW_DIAGRAMS.md` → Messaging Flow
- **Functions**: `FEATURE_EXPLANATIONS_WITH_FUNCTIONS.md` → Messaging System

#### Practice Management
- **Overview**: `COMPLETE_FEATURES_DOCUMENTATION.md` → Practice Management
- **Flow**: `FLOW_DIAGRAMS.md` → Practice Management Flow
- **Functions**: `FEATURE_EXPLANATIONS_WITH_FUNCTIONS.md` → Practice Management

---

### By Task

#### Implementing a New Feature
1. Read: `COMPLETE_FEATURES_DOCUMENTATION.md` → Related feature section
2. Check: `HIERARCHY_AND_APPROVAL_PROCESSES.md` → Permission requirements
3. Review: `FLOW_DIAGRAMS.md` → Related flow diagram
4. Reference: `FEATURE_EXPLANATIONS_WITH_FUNCTIONS.md` → Function examples

#### Understanding Approval Workflow
1. Start: `HIERARCHY_AND_APPROVAL_PROCESSES.md` → Approval Workflows
2. Visualize: `FLOW_DIAGRAMS.md` → Approval Workflows
3. Implement: `FEATURE_EXPLANATIONS_WITH_FUNCTIONS.md` → Approval System

#### Debugging Permission Issues
1. Check: `HIERARCHY_AND_APPROVAL_PROCESSES.md` → Permission Enforcement
2. Verify: `FEATURE_EXPLANATIONS_WITH_FUNCTIONS.md` → Authentication & Permissions
3. Review: `COMPLETE_FEATURES_DOCUMENTATION.md` → User Roles & Portals

#### Adding a New Approval Type
1. Understand: `HIERARCHY_AND_APPROVAL_PROCESSES.md` → Approval Types
2. Implement: `FEATURE_EXPLANATIONS_WITH_FUNCTIONS.md` → Approval System
3. Test: `FLOW_DIAGRAMS.md` → Approval Workflows (create new diagram)

---

## Function Reference Quick Links

### Approval Engine
- `submitApprovalRequest()` - `src/lib/services/approvalEngine.ts:304`
- `decideAsAdmin()` - `src/lib/services/approvalEngine.ts:470`
- `decideAsPracticeAdmin()` - `src/lib/services/approvalEngine.ts:580`

### Referral Engine
- `createReferral()` - `src/lib/services/referralEngine.ts:83`
- `updateReferralStatus()` - `src/lib/services/referralEngine.ts:165`

### Permission Service
- `getActorFromSession()` - `src/lib/services/permissionService.ts:32`
- `assertAdmin()` - `src/lib/services/permissionService.ts:109`
- `assertPracticeAdmin()` - `src/lib/services/permissionService.ts:132`
- `canSendReferral()` - `src/lib/services/permissionService.ts:179`

### Messaging
- `sendMessage()` - `src/lib/messageStorage.ts:20`
- `subscribeToConversation()` - `src/lib/messageStorage.ts:76`
- `markConversationAsRead()` - `src/lib/messageStorage.ts:147`

### Storage
- `getApprovalRequests()` - `src/lib/storage/approvalStorage.ts`
- `getReferrals()` - `src/lib/storage/referralStorage.ts`
- `getNotifications()` - `src/lib/storage/notificationStorage.ts`

---

## Related Documentation

### Implementation Documentation
- `V2_COMPLETE_IMPLEMENTATION_SUMMARY.md` - Implementation timeline
- `V2_ENTITY_MODELS.md` - Data structures
- `V2_ROLES_PERMISSIONS.md` - Permission matrix
- `V2_APPROVAL_WORKFLOWS.md` - Workflow details
- `V2_QUICK_REFERENCE.md` - Quick lookup guide

### Step-by-Step Implementation
- `V2_STEP2_IMPLEMENTATION.md` through `V2_STEP10.7_IMPLEMENTATION.md` - Individual step docs

### Testing & Verification
- `V2_TESTING_AND_VERIFICATION_GUIDE.md` - Testing procedures
- `V2_FINAL_VERIFICATION_SUMMARY.md` - Verification results

---

## Documentation Best Practices

### For Developers
1. **Start Here**: `COMPLETE_FEATURES_DOCUMENTATION.md` - Get overview
2. **Understand Flow**: `FLOW_DIAGRAMS.md` - Visualize workflows
3. **Find Functions**: `FEATURE_EXPLANATIONS_WITH_FUNCTIONS.md` - Quick reference
4. **Check Permissions**: `HIERARCHY_AND_APPROVAL_PROCESSES.md` - Permission rules

### For Product Managers
1. **Features**: `COMPLETE_FEATURES_DOCUMENTATION.md` - Feature list
2. **Workflows**: `FLOW_DIAGRAMS.md` - Process flows
3. **Roles**: `HIERARCHY_AND_APPROVAL_PROCESSES.md` - User capabilities

### For QA/Testing
1. **Test Guide**: `V2_TESTING_AND_VERIFICATION_GUIDE.md`
2. **Workflows**: `FLOW_DIAGRAMS.md` - Test scenarios
3. **Features**: `COMPLETE_FEATURES_DOCUMENTATION.md` - Feature details

---

## Key Concepts Quick Reference

### Approval Types
1. `new_practice_with_admin_doctor` - Create practice + admin
2. `doctor_join_practice` - Doctor joins practice
3. `practice_edit_request` - Edit practice info
4. `practice_location_add_request` - Add location
5. `practice_location_edit_request` - Edit location
6. `practice_location_remove_request` - Remove location
7. `practice_doctor_add_request` - Add doctor to roster
8. `practice_doctor_remove_request` - Remove doctor from roster

### User Roles
1. **Admin** - Full system control
2. **Practice Admin** - Practice management (elevated doctor)
3. **Doctor** - Normal member
4. **Applicant** - Pending approval
5. **Public** - Unauthenticated

### Approval Status
- `pending` - Awaiting review
- `approved` - Approved
- `rejected` - Rejected

### Referral Status
- `new` - New referral
- `attended` - Patient attended
- `removed` - Removed/cancelled

---

## Common Questions

### Q: How do I submit an approval request?
**A**: See `FEATURE_EXPLANATIONS_WITH_FUNCTIONS.md` → Approval System → Submit Approval Request

### Q: What approvals are required for doctor join?
**A**: See `HIERARCHY_AND_APPROVAL_PROCESSES.md` → Approval Workflows → Doctor Joins Existing Practice

### Q: How do I check if user is Practice Admin?
**A**: See `FEATURE_EXPLANATIONS_WITH_FUNCTIONS.md` → Authentication & Permissions → Assert Practice Admin

### Q: How does the referral system work?
**A**: See `FLOW_DIAGRAMS.md` → Referral Flow (diagram) and `FEATURE_EXPLANATIONS_WITH_FUNCTIONS.md` → Referral System

### Q: What are the governance rules?
**A**: See `HIERARCHY_AND_APPROVAL_PROCESSES.md` → Governance Rules

### Q: How do I implement a new approval type?
**A**: 
1. Add type to `ApprovalType` in `src/types/approvals.ts`
2. Update `submitApprovalRequest()` in `src/lib/services/approvalEngine.ts`
3. Add approval logic in `decideAsAdmin()` / `decideAsPracticeAdmin()`
4. Add renderer in `RequestedChangesRenderer.tsx`
5. Update documentation

---

## Document Maintenance

### When to Update

**COMPLETE_FEATURES_DOCUMENTATION.md**:
- When adding new features
- When changing feature behavior
- When adding new functions

**HIERARCHY_AND_APPROVAL_PROCESSES.md**:
- When changing approval workflows
- When adding new approval types
- When changing governance rules
- When changing permission logic

**FLOW_DIAGRAMS.md**:
- When workflows change
- When adding new features
- When process flows change

**FEATURE_EXPLANATIONS_WITH_FUNCTIONS.md**:
- When function signatures change
- When adding new functions
- When usage patterns change

---

## Version History

### Version 2.0 (January 29, 2026)
- Complete V2 documentation
- All features documented
- Flow diagrams created
- Function references added

---

**Last Updated**: January 29, 2026  
**Documentation Version**: 1.0
