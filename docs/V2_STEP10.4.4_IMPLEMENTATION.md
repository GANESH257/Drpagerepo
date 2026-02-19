# V2 Step 10.4.4 Implementation: Practice Admin Portal - Remove Location Request UI

## Overview

This document describes the implementation of the **Remove Location Request UI** for Practice Admins, completing the CRUD operations for practice locations by adding the ability to submit approval requests to remove existing practice locations.

**Implementation Date:** January 29, 2026  
**Status:** ✅ Complete  
**TypeScript Errors:** 0  
**Breaking Changes:** None

---

## Objective

Enable Practice Admins to submit approval requests to remove existing practice locations through a confirmation dialog. All location removals must go through the approval workflow (admin + practice admin dual approval) before being applied to the practice.

---

## Key Requirements

### Functional Requirements

1. **Remove Button**
   - Visible on each Location card header (next to Edit button)
   - Destructive variant (red styling)
   - Small size (matches Edit button)
   - Trash2 icon from lucide-react
   - Disabled when `locations.length <= 1`
   - Tooltip: "At least one location is required." when disabled

2. **Confirmation Dialog (AlertDialog)**
   - Title: "Request Location Removal"
   - Description: Clearly states:
     - This creates an approval request
     - Location will NOT be removed immediately
     - Admin approval is required
   - Location Summary Box:
     - Location name (with fallback logic)
     - Address line
     - City, State ZIP
     - Location ID (monospace, small)
   - Footer: Cancel + "Submit Removal Request" (destructive styling)

3. **Last Location Protection**
   - **Hard UI rule:** Cannot remove last location
   - Button disabled when `locations.length <= 1`
   - Validation in `handleOpenRemoveDialog()` (early check)
   - Validation in `handleRemoveSubmit()` (safety check)
   - Toast error if attempted: "Cannot remove the last remaining location. Practice must retain at least one location."

4. **Approval Request Submission**
   - Type: `'practice_location_remove_request'`
   - Payload structure:
     ```typescript
     {
       practiceId: practice.id,
       locationId: removingLocationId,
     }
     ```
   - Target: `{ practiceId: practice.id }`
   - No direct practice mutation

5. **Loading States**
   - `isSubmittingRemove` state
   - Disable Cancel and Submit buttons during submission
   - Show spinner in Submit button: "Submitting..." with Loader2 icon
   - Prevent double submission

### Technical Requirements

1. **No Direct Mutations**
   - Must NOT call `savePracticeOverride()` directly
   - Must NOT modify `practice.locations` directly
   - Only creates approval requests

2. **Code Consistency**
   - Follows same patterns as Add/Edit dialogs
   - Uses AlertDialog (confirmation, not form)
   - Consistent error handling and toast notifications

3. **TypeScript**
   - Strict typing throughout
   - 0 compilation errors

4. **Integration**
   - Uses existing approval engine (`submitApprovalRequest`)
   - Uses existing UI components (shadcn/ui)
   - Uses existing toast utility

---

## Implementation Details

### File Modified

**`src/app/doctor/dashboard/practice/locations/page.tsx`**

Extended the locations page (Step 10.4.1 + 10.4.2 + 10.4.3) with:
- Remove button on location cards
- Remove dialog state management
- Remove handlers
- AlertDialog confirmation component

### Key Components Added

#### 1. Remove Dialog State Management

```typescript
// Remove dialog state
const [showRemoveDialog, setShowRemoveDialog] = useState(false);
const [removingLocationId, setRemovingLocationId] = useState<string | null>(null);
const [isSubmittingRemove, setIsSubmittingRemove] = useState(false);
```

#### 2. Remove Dialog Handlers

**`handleOpenRemoveDialog(locationId: string)`**
```typescript
const handleOpenRemoveDialog = (locationId: string) => {
  if (!practice) return;
  
  // Check if last location
  if (practice.locations.length <= 1) {
    toast.error('Cannot remove the last remaining location. Practice must retain at least one location.');
    return;
  }
  
  setRemovingLocationId(locationId);
  setShowRemoveDialog(true);
};
```

**Behavior:**
- Validates last location rule before opening dialog
- Shows toast error if last location
- Sets `removingLocationId` and opens dialog

**`handleRemoveSubmit()`**
```typescript
const handleRemoveSubmit = async () => {
  if (!practice || !removingLocationId) return;
  
  // Find location being removed
  const removingLocation = practice.locations.find(loc => loc.id === removingLocationId);
  
  if (!removingLocation) {
    toast.error('Location not found');
    setShowRemoveDialog(false);
    setRemovingLocationId(null);
    return;
  }
  
  // Validate last location rule again (safety check)
  if (practice.locations.length <= 1) {
    toast.error('Cannot remove the last remaining location. Practice must retain at least one location.');
    setShowRemoveDialog(false);
    setRemovingLocationId(null);
    return;
  }
  
  try {
    setIsSubmittingRemove(true);
    const actor = getActorFromSession();
    if (actor.kind !== 'doctor' || !actor.practiceId) {
      throw new PermissionDeniedError('Must be practice admin');
    }
    
    // Submit approval request
    const request = submitApprovalRequest(actor, {
      type: 'practice_location_remove_request',
      payload: {
        practiceId: practice.id,
        locationId: removingLocationId,
      },
      target: {
        practiceId: practice.id,
      },
    });
    
    toast.success('Removal request submitted. Waiting for admin approval.');
    setShowRemoveDialog(false);
    setRemovingLocationId(null);
  } catch (error: any) {
    toast.error(error.message || 'Failed to submit removal request');
  } finally {
    setIsSubmittingRemove(false);
  }
};
```

**Key Points:**
- Validates practice exists
- Validates location exists
- Validates last location rule (safety check)
- Submits approval request with correct payload
- Handles success/error with toasts
- Resets state on success

#### 3. Remove Button in Location Cards

**Before:**
```tsx
<div className="flex items-center gap-2">
  {index === 0 && (
    <Badge variant="default">Primary Location</Badge>
  )}
  <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(location)}>
    <Pencil className="h-4 w-4 mr-1" />
    Edit
  </Button>
</div>
```

**After:**
```tsx
<div className="flex items-center gap-2">
  {index === 0 && (
    <Badge variant="default">Primary Location</Badge>
  )}
  <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(location)}>
    <Pencil className="h-4 w-4 mr-1" />
    Edit
  </Button>
  <Button
    variant="destructive"
    size="sm"
    onClick={() => handleOpenRemoveDialog(location.id)}
    disabled={locations.length <= 1}
    title={locations.length <= 1 ? 'At least one location is required.' : 'Remove location'}
  >
    <Trash2 className="h-4 w-4 mr-1" />
    Remove
  </Button>
</div>
```

**Changes:**
- Added Remove button with destructive variant
- Disabled when `locations.length <= 1`
- Tooltip shows helper text when disabled

#### 4. AlertDialog Component

```tsx
<AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Request Location Removal</AlertDialogTitle>
      <AlertDialogDescription>
        This creates an approval request. The location will NOT be removed immediately. Admin approval is required before the location is removed from your practice.
      </AlertDialogDescription>
    </AlertDialogHeader>

    {/* Location Summary */}
    {removingLocationId && practice && (() => {
      const removingLocation = practice.locations.find(loc => loc.id === removingLocationId);
      if (!removingLocation) return null;
      
      const locationIndex = practice.locations.findIndex(loc => loc.id === removingLocationId);
      const locationName = removingLocation.name || (locationIndex === 0 ? 'Main Office' : `Location ${locationIndex + 1}`);
      
      return (
        <div className="p-3 bg-gray-50 rounded-md border border-gray-200 mt-4">
          <p className="font-semibold text-sm mb-2">{locationName}</p>
          <p className="text-sm text-gray-700">{removingLocation.address}</p>
          <p className="text-sm text-gray-700">
            {removingLocation.city}, {removingLocation.state} {removingLocation.zip}
          </p>
          <p className="text-xs text-gray-500 mt-2 font-mono">
            Location ID: {removingLocation.id}
          </p>
        </div>
      );
    })()}

    <AlertDialogFooter>
      <AlertDialogCancel disabled={isSubmittingRemove}>
        Cancel
      </AlertDialogCancel>
      <AlertDialogAction
        onClick={handleRemoveSubmit}
        disabled={isSubmittingRemove}
        className="bg-red-600 hover:bg-red-700"
      >
        {isSubmittingRemove ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Removal Request'
        )}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**Features:**
- Controlled open/close via `showRemoveDialog`
- Location summary display with fallback name logic
- Loading states (disabled buttons, spinner)
- Destructive styling for Submit button

---

## Code Changes Summary

### New Imports

```typescript
import { Trash2 } from 'lucide-react';  // Added for Remove button icon
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
```

### New State Variables

- `showRemoveDialog` - Controls AlertDialog visibility
- `removingLocationId` - Tracks which location is being removed
- `isSubmittingRemove` - Loading state for removal submission

### New Handler Functions

- `handleOpenRemoveDialog(locationId)` - Opens remove dialog with validation
- `handleRemoveSubmit()` - Submits removal approval request

### New UI Components

- Remove button in Location card headers
- AlertDialog confirmation component
- Location summary display in dialog

### Modified UI Components

- Location card headers (added Remove button)

---

## Integration Points

### Approval Engine

The implementation uses the existing approval engine (`src/lib/services/approvalEngine.ts`):

- **Function:** `submitApprovalRequest(actor, input)`
- **Type:** `practice_location_remove_request`
- **Payload:** `{ practiceId: string; locationId: string }`
- **Target:** `{ practiceId: string }`
- **Validation:** Early validation via `validateLocationApprovalRequest()`
  - Checks location exists
  - Prevents removal of last location (`practice.locations.length <= 1`)
- **Approval Flow:** Dual approval (admin + practice admin)
- **History:** Automatic history logging via `appendApprovalHistory()`
- **Notifications:** Automatic notifications to admin and practice admin
- **Side Effects:** On approval, location is removed from `practice.locations[]` array

### UI Components

Uses shadcn/ui components:
- `AlertDialog` components (AlertDialog, AlertDialogContent, AlertDialogHeader, etc.)
- `Button` component (destructive variant)
- `Trash2` icon from lucide-react
- Existing toast utility

---

## User Flow

1. **View Locations**
   - Practice Admin sees locations with Edit and Remove buttons
   - Remove button disabled if only one location exists

2. **Click Remove**
   - If last location: Toast error, button disabled
   - Otherwise: AlertDialog opens

3. **Review Confirmation**
   - User sees location summary
   - Reads description about approval requirement

4. **Confirm Removal**
   - Clicks "Submit Removal Request"
   - Loading state shown
   - Approval request submitted

5. **Success**
   - Toast: "Removal request submitted. Waiting for admin approval."
   - Dialog closes
   - Location remains visible until approval

6. **Approval Process**
   - Request appears in Admin approval queue
   - Request appears in Practice Admin approval queue
   - Both must approve before location is removed
   - Once approved, location removed from `practice.locations[]`

---

## Testing Checklist

### Functional Tests

- [x] **Remove Button**
  - Button visible on each location card
  - Button disabled when `locations.length <= 1`
  - Tooltip shows helper text when disabled
  - Button opens AlertDialog when clicked

- [x] **Confirmation Dialog**
  - Dialog opens when Remove clicked
  - Location summary displayed correctly
  - Description clearly states approval requirement

- [x] **Last Location Protection**
  - Button disabled when last location
  - Toast error if removal attempted
  - Validation in handler prevents submission

- [x] **Submission**
  - Creates approval request correctly
  - Payload structure matches `PracticeLocationRemovePayload`
  - No direct practice mutation
  - Success toast displayed
  - Dialog closes on success
  - Error handling works

### Technical Tests

- [x] **TypeScript**
  - 0 compilation errors
  - All types correct

- [x] **No Direct Mutations**
  - No `savePracticeOverride()` calls
  - No direct `practice.locations` modifications
  - Only `submitApprovalRequest()` used

- [x] **Loading States**
  - Buttons disabled during submission
  - Spinner shown in Submit button
  - Double submission prevented

- [x] **Integration**
  - Approval engine integration correct
  - UI components render correctly

---

## Files Modified

### `src/app/doctor/dashboard/practice/locations/page.tsx`

**Lines Added:** ~150 lines  
**Lines Modified:** ~10 lines (card headers)

**Additions:**
- Remove dialog state variables (3 new state variables)
- `handleOpenRemoveDialog()` function
- `handleRemoveSubmit()` function
- Remove button in Location card headers
- AlertDialog component for confirmation
- Trash2 icon import
- AlertDialog component imports

**Modifications:**
- Location card headers (added Remove button)

---

## Dependencies

### Existing (No New Dependencies)

- `@/lib/services/approvalEngine` - Approval request submission
- `@/lib/services/permissionService` - Permission checks
- `@/components/ui/*` - shadcn/ui components
- `@/lib/toast` - Toast notifications
- `lucide-react` - Icons (Trash2 added)

---

## Approval Workflow

When a Practice Admin submits a location removal request:

1. **Request Created**
   - Type: `practice_location_remove_request`
   - Status: `submitted`
   - Requires: Admin approval + Practice Admin approval (dual approval)

2. **History Logged**
   - Action: `submitted`
   - Recorded in `approvalHistory` storage
   - Visible in Practice Admin History (`/doctor/dashboard/practice/history`)

3. **Notifications Sent**
   - Admin notified (if admin UI exists)
   - Practice Admin notified (if different from submitter)

4. **Approval Process**
   - Admin approves/rejects
   - Practice Admin approves/rejects (if applicable)
   - Both must approve for location to be removed

5. **Side Effects (on Approval)**
   - Location removed from `practice.locations[]` array
   - Practice override saved to localStorage
   - History updated with approval action

---

## Edge Cases Handled

1. **Last Location**
   - Button disabled
   - Tooltip shown
   - Validation in handler prevents submission
   - Toast error if attempted

2. **Missing Practice**
   - Existing error states remain
   - Validation in handler

3. **Removing Location Not Found**
   - Toast error shown
   - Dialog closes
   - State reset

4. **Double Submit**
   - Prevented by `isSubmittingRemove` flag
   - Buttons disabled during submission

5. **Primary Location Removal**
   - Allowed if practice has 2+ locations
   - Engine handles removal by ID
   - No UI reordering needed

---

## Differences from Add/Edit Flows

| Aspect | Add Location | Edit Location | Remove Location |
|--------|-------------|---------------|-----------------|
| **Button Location** | SectionHeader actions | Each Location card | Each Location card |
| **Dialog Type** | Dialog (form) | Dialog (form) | AlertDialog (confirmation) |
| **Form Fields** | Full form | Pre-filled form | No form (summary only) |
| **Validation** | Field validation | Field validation | Last location check only |
| **Payload Structure** | `{ practiceId, location }` | `{ practiceId, locationId, updatedLocation }` | `{ practiceId, locationId }` |
| **Complexity** | High (form + geocoding) | High (form + geocoding) | Low (confirmation only) |

---

## Future Enhancements (Not Implemented)

1. **Bulk Remove**
   - Remove multiple locations at once
   - Batch approval requests

2. **Remove History**
   - View removal history for a practice
   - Track removed locations

3. **Soft Delete**
   - Archive removed locations instead of hard delete
   - Restore functionality

---

## Related Documentation

- **Step 10.1:** Multi-Location Migration (`docs/V2_STEP10.1_IMPLEMENTATION.md`)
- **Step 10.2:** Multi-Location Engine Expansion (`docs/V2_STEP10.2_IMPLEMENTATION.md`)
- **Step 10.3:** Approval Engine Extension - Location Actions (`docs/V2_STEP10.3_IMPLEMENTATION.md`)
- **Step 10.4.1:** Practice Admin Portal - Locations Tab (Read-Only UI) (`docs/V2_STEP10.4.1_IMPLEMENTATION.md`)
- **Step 10.4.2:** Practice Admin Portal - Add Location Request UI (`docs/V2_STEP10.4.2_IMPLEMENTATION.md`)
- **Step 10.4.3:** Practice Admin Portal - Edit Location Request UI (`docs/V2_STEP10.4.3_IMPLEMENTATION.md`)
- **Approval Workflows:** `docs/V2_APPROVAL_WORKFLOWS.md`
- **Entity Models:** `docs/V2_ENTITY_MODELS.md`

---

## Summary

Step 10.4.4 successfully completes the CRUD operations for Practice Admin location management by adding the Remove Location Request UI. The implementation:

✅ Provides Remove button on each location card  
✅ Prevents removal of last location (UI + validation)  
✅ Shows confirmation dialog with location summary  
✅ Submits approval requests with correct payload structure  
✅ Maintains strict separation (no direct practice mutations)  
✅ Handles all edge cases gracefully  
✅ Compiles with 0 TypeScript errors  
✅ Maintains consistency with Add/Edit flows  

The feature is production-ready and follows all architectural patterns established in previous steps. Practice Admins can now submit location removal requests that require admin approval before being applied to the practice.

**Complete CRUD Operations:** With Steps 10.4.1 (Read), 10.4.2 (Create), 10.4.3 (Update), and 10.4.4 (Delete), Practice Admins now have full location management capabilities through the approval workflow.
