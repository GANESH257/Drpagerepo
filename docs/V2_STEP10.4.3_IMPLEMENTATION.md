# V2 Step 10.4.3 Implementation: Practice Admin Portal - Edit Location Request UI

## Overview

This document describes the implementation of the **Edit Location Request UI** for Practice Admins, extending Step 10.4.2's Add Location functionality with the ability to submit approval requests to edit existing practice locations.

**Implementation Date:** January 29, 2026  
**Status:** ✅ Complete  
**TypeScript Errors:** 0  
**Breaking Changes:** None

---

## Objective

Enable Practice Admins to submit approval requests to edit existing practice locations through a user-friendly form interface. All location edits must go through the approval workflow (admin + practice admin dual approval) before being applied to the practice.

---

## Key Requirements

### Functional Requirements

1. **Edit Button**
   - Visible on each Location card header (top-right)
   - Outline/secondary variant, small size
   - Opens edit dialog with pre-filled location data

2. **Edit Dialog**
   - Title: "Request Location Edit"
   - Description: "This submits an edit request for approval. Your location won't change until approved."
   - Pre-filled with selected location's current values
   - Same field schema as Add dialog:
     - **Required:** Address, City, State (2-letter), ZIP (5-digit), Coordinates (lat/lng)
     - **Optional:** Location Name, Phone, Hours, Directions URL
   - Location ID displayed (read-only)
   - Identity strip showing "Currently editing: [Location Name]"

3. **Coordinate Handling**
   - Same UX as Add dialog:
     - Primary: ZIP geocoding with auto-geocode on blur
     - Manual "Get Coordinates" button
     - Manual coordinates toggle switch
     - Pre-filled coordinates from existing location

4. **Approval Request Submission**
   - Type: `'practice_location_edit_request'`
   - Payload structure:
     ```typescript
     {
       practiceId: practice.id,
       locationId: originalLocation.id,  // Must match existing location
       updatedLocation: PracticeLocation  // Must have same id as locationId
     }
     ```
   - Target: `{ practiceId: practice.id }`
   - No direct practice mutation

5. **Client-Side Validation**
   - Reuses shared validation helper
   - Additional rule: `updatedLocation.id === locationId` (immutable)
   - State: 2-letter uppercase
   - ZIP: 5-digit numeric
   - Coordinates: Required, valid ranges
   - directionsUrl: If present, must start with http:// or https://

6. **Duplicate Detection (Different from Add)**
   - **Duplicate Address Check:**
     - Normalizes address for comparison
     - Excludes current location being edited (`excludeLocationId`)
     - If another location has same address → BLOCK with toast error
     - If matches current location → ALLOW (user can keep same address)
   - **Duplicate Coordinates Check:**
     - Excludes current location being edited
     - If another location has same lat/lng → Show non-blocking Alert warning
     - Still allows submission

### Technical Requirements

1. **No Direct Mutations**
   - Must NOT call `savePracticeOverride()` directly
   - Must NOT modify `practice.locations` directly
   - Only creates approval requests

2. **Code Reuse**
   - Shared helper functions for validation and duplicate detection
   - Refactored Add dialog to use shared helpers
   - Consistent UI patterns with Add dialog

3. **TypeScript**
   - Strict typing throughout
   - 0 compilation errors

4. **Integration**
   - Uses existing approval engine (`submitApprovalRequest`)
   - Uses existing geocoding service (`geocodeZip`)
   - Uses existing UI components (shadcn/ui)

---

## Implementation Details

### File Modified

**`src/app/doctor/dashboard/practice/locations/page.tsx`**

Extended the locations page (Step 10.4.1 + 10.4.2) with:
- Edit dialog component
- Edit form state management
- Edit-specific handlers
- Shared helper functions
- Refactored Add dialog to use shared helpers

### Key Components Added

#### 1. Shared Helper Functions

**`normalizeAddress(address, city, state, zip)`**
```typescript
function normalizeAddress(address: string, city: string, state: string, zip: string): string {
  return `${address.trim()}, ${city.trim()}, ${state.trim().toUpperCase()} ${zip.trim().replace(/\D/g, '')}`.toLowerCase();
}
```
- Normalizes address string for comparison
- Used by both Add and Edit duplicate detection

**`checkDuplicateAddress(practice, normalizedAddress, excludeLocationId?)`**
```typescript
function checkDuplicateAddress(
  practice: Practice,
  normalizedAddress: string,
  excludeLocationId?: string
): { hasDuplicate: boolean; warning?: string }
```
- Checks for duplicate addresses
- Excludes `excludeLocationId` if provided (for Edit flow)
- Returns blocking error if duplicate found

**`checkDuplicateCoords(practice, lat, lng, excludeLocationId?)`**
```typescript
function checkDuplicateCoords(
  practice: Practice,
  lat: number | null,
  lng: number | null,
  excludeLocationId?: string
): { hasDuplicate: boolean; warning?: string }
```
- Checks for duplicate coordinates
- Excludes `excludeLocationId` if provided (for Edit flow)
- Returns non-blocking warning if duplicate found

**`validateLocationForm(formData, isEdit?, locationId?)`**
```typescript
function validateLocationForm(
  formData: {
    address: string;
    city: string;
    state: string;
    zip: string;
    directionsUrl: string;
    lat: number | null;
    lng: number | null;
  },
  isEdit: boolean = false,
  locationId?: string
): { valid: boolean; error?: string }
```
- Unified validation for Add and Edit flows
- Validates required fields, formats, coordinate ranges
- Validates directionsUrl format if present
- Reusable across both dialogs

#### 2. Edit Dialog State Management

```typescript
// Edit dialog state
const [showEditDialog, setShowEditDialog] = useState(false);
const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
const [isGeocodingEdit, setIsGeocodingEdit] = useState(false);
const [manualCoordsModeEdit, setManualCoordsModeEdit] = useState(false);

const [editFormData, setEditFormData] = useState<{
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  hours: string;
  directionsUrl: string;
  lat: number | null;
  lng: number | null;
}>({ /* ... */ });
```

#### 3. Edit Dialog Handlers

**`handleOpenEditDialog(location)`**
- Pre-fills `editFormData` with location's current values
- Sets `editingLocationId` to location.id
- Opens edit dialog
- Resets manual coordinates mode

**`handleEditGeocodeZip()`**
- Geocodes ZIP code for edit dialog
- Updates `editFormData.lat` and `editFormData.lng`
- Shows loading state (`isGeocodingEdit`)
- Handles errors with toast notifications

**`handleEditZipBlur()`**
- Auto-geocodes on ZIP blur (when manual mode disabled)
- Includes guards:
  - Manual mode check
  - Geocoding in progress check
  - Valid ZIP format check

**`validateEditForm()`**
- Validates edit form data
- Ensures `editingLocationId` is set
- Uses shared `validateLocationForm()` helper
- Returns validation result

**`checkEditDuplicates()`**
- Checks for duplicate address (excluding current location)
- Checks for duplicate coordinates (excluding current location)
- Uses shared helper functions with `excludeLocationId` parameter

**`handleEditSubmit()`**
- Validates form data
- Checks for duplicates
- Builds `PracticeLocation` with `id: editingLocationId` (CRITICAL)
- Submits approval request with type `'practice_location_edit_request'`
- Payload structure:
  ```typescript
  {
    practiceId: practice.id,
    locationId: editingLocationId,
    updatedLocation: PracticeLocation
  }
  ```
- Shows success/error toasts
- Closes dialog on success

#### 4. Location Card Updates

**Before:**
```tsx
<CardHeader>
  <div className="flex items-center justify-between">
    <CardTitle className="text-lg">{locationName}</CardTitle>
    {index === 0 && (
      <Badge variant="default">Primary Location</Badge>
    )}
  </div>
</CardHeader>
```

**After:**
```tsx
<CardHeader>
  <div className="flex items-center justify-between">
    <div>
      <CardTitle className="text-lg">{locationName}</CardTitle>
      <p className="text-sm text-gray-500 mt-1">
        {location.city}, {location.state} {location.zip}
      </p>
    </div>
    <div className="flex items-center gap-2">
      {index === 0 && (
        <Badge variant="default">Primary Location</Badge>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleOpenEditDialog(location)}
      >
        <Pencil className="h-4 w-4 mr-1" />
        Edit
      </Button>
    </div>
  </div>
</CardHeader>
```

**Changes:**
- Added city/state/zip display under location name
- Added Edit button with Pencil icon
- Improved card header layout

#### 5. Edit Dialog Component

**Structure:**
- DialogHeader with title and description
- Identity strip (Location ID + "Currently editing" message)
- Basic Information section (name, phone, address, city, state, zip)
- Optional Information section (hours, directionsUrl)
- Duplicate Coordinates Warning (Alert component)
- Coordinates Section (same UX as Add dialog)
- DialogFooter with Cancel and Submit buttons

**Key Features:**
- Pre-filled form fields
- Same geocoding UX as Add dialog
- Separate loading states (`isSubmittingEdit`, `isGeocodingEdit`)
- Duplicate warning Alert (non-blocking)
- Form validation and error handling

#### 6. Refactored Add Dialog

**Changes:**
- `validateForm()` now uses shared `validateLocationForm()` helper
- `checkDuplicates()` now uses shared `checkDuplicateAddress()` and `checkDuplicateCoords()` helpers
- Maintains same functionality, improved code reuse

---

## Code Changes Summary

### New Imports

```typescript
import { Pencil } from 'lucide-react';  // Added for Edit button icon
```

### New Helper Functions (Top-level)

1. `normalizeAddress()` - Address normalization
2. `checkDuplicateAddress()` - Duplicate address detection with exclusion
3. `checkDuplicateCoords()` - Duplicate coordinates detection with exclusion
4. `validateLocationForm()` - Unified form validation

### New State Variables

- `showEditDialog` - Controls edit dialog visibility
- `editingLocationId` - Tracks which location is being edited
- `isSubmittingEdit` - Loading state for edit submission
- `isGeocodingEdit` - Loading state for edit geocoding
- `manualCoordsModeEdit` - Manual coordinates mode for edit dialog
- `editFormData` - Form data for edit dialog

### New Handler Functions

- `handleOpenEditDialog(location)` - Opens edit dialog with pre-filled data
- `handleEditGeocodeZip()` - Geocodes ZIP for edit dialog
- `handleEditZipBlur()` - Auto-geocodes on ZIP blur (edit)
- `validateEditForm()` - Validates edit form
- `checkEditDuplicates()` - Checks duplicates excluding current location
- `handleEditSubmit()` - Submits edit approval request

### Refactored Functions

- `validateForm()` - Now uses `validateLocationForm()` helper
- `checkDuplicates()` - Now uses shared duplicate detection helpers

### New UI Components

- Edit button in Location card headers
- Edit Location Dialog (full form component)
- Duplicate coordinates warning Alert in edit dialog

### Modified UI Components

- Location card headers (added city/state/zip display, Edit button)

---

## Integration Points

### Approval Engine

The implementation uses the existing approval engine (`src/lib/services/approvalEngine.ts`):

- **Function:** `submitApprovalRequest(actor, input)`
- **Type:** `practice_location_edit_request`
- **Validation:** Early validation via `validateLocationApprovalRequest()`
- **Approval Flow:** Dual approval (admin + practice admin)
- **History:** Automatic history logging via `appendApprovalHistory()`
- **Notifications:** Automatic notifications to admin and practice admin
- **Side Effects:** On approval, location is replaced in `practice.locations[]` array

### Geocoding Service

Uses existing geocoding service (`src/lib/services/geocodingService.ts`):

- **Function:** `geocodeZip(zip: string): Promise<{lat, lng, label}>`
- **Implementation:** Google Geocoding API (client-side)
- **Error Handling:** Returns error message on failure

### UI Components

Uses shadcn/ui components:
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTrigger`
- `Input`, `Label`, `Textarea`
- `Button`, `Switch`, `Separator`, `Alert`
- `SectionHeader` (shared component)
- `Card`, `CardHeader`, `CardTitle`, `CardContent`

---

## User Flow

1. **View Locations**
   - Practice Admin navigates to `/doctor/dashboard/practice/locations`
   - Sees existing locations with Edit button on each card

2. **Open Edit Dialog**
   - Clicks "Edit" button on a location card
   - Dialog opens with form pre-filled with location data
   - Location ID displayed (read-only)
   - "Currently editing" message shown

3. **Edit Form**
   - User modifies location fields
   - ZIP geocoding works same as Add dialog
   - Manual coordinates toggle available
   - Duplicate warnings shown if applicable

4. **Validation**
   - Client-side validation runs on submit
   - Checks required fields, formats, coordinate ranges
   - Checks for duplicate addresses (excluding current location)
   - Checks for duplicate coordinates (excluding current location)

5. **Submit Request**
   - If valid, creates approval request via `submitApprovalRequest()`
   - Type: `practice_location_edit_request`
   - Payload includes `locationId` and `updatedLocation`
   - Success toast: "Edit request submitted. Waiting for admin approval."
   - Dialog closes

6. **Approval Process**
   - Request appears in Admin approval queue
   - Request appears in Practice Admin approval queue (if applicable)
   - Both must approve before location is updated
   - Once approved, location is replaced in `practice.locations[]`

---

## Testing Checklist

### Functional Tests

- [x] **Edit Button**
  - Button visible on each location card
  - Button opens edit dialog
  - Button disabled for non-practice-admins (permission check)

- [x] **Edit Dialog**
  - Dialog opens with pre-filled data
  - Location ID displayed correctly
  - "Currently editing" message shown
  - All fields editable

- [x] **Form Pre-filling**
  - All fields pre-filled with location data
  - Coordinates pre-filled correctly
  - Optional fields handled correctly

- [x] **ZIP Geocoding**
  - Manual "Get Coordinates" button works
  - Auto-geocode on blur works (when manual mode disabled)
  - Loading state during geocoding
  - Error handling for invalid ZIP

- [x] **Manual Coordinates**
  - Toggle switch enables/disables manual mode
  - Manual lat/lng inputs work correctly
  - Geocoding disabled when manual mode enabled

- [x] **Validation**
  - Required field validation works
  - State format validation (2-letter uppercase)
  - ZIP format validation (5-digit)
  - Coordinate range validation
  - directionsUrl format validation
  - Location ID immutability enforced
  - Error messages displayed correctly

- [x] **Duplicate Detection**
  - Duplicate address blocks submission (excluding current location)
  - Same address as current location allows submission
  - Duplicate coordinates warns but allows submission (excluding current location)
  - Same coordinates as current location allows submission

- [x] **Submission**
  - Creates approval request correctly
  - Payload structure matches `PracticeLocationEditPayload`
  - `updatedLocation.id` matches `locationId`
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

- [x] **Code Reuse**
  - Shared helper functions used by Add and Edit
  - Consistent validation logic
  - Consistent duplicate detection logic

- [x] **SSR Safety**
  - All form logic client-only
  - Geocoding only in browser context

- [x] **Integration**
  - Approval engine integration correct
  - Geocoding service integration correct
  - UI components render correctly

---

## Files Modified

### `src/app/doctor/dashboard/practice/locations/page.tsx`

**Lines Added:** ~600 lines  
**Lines Modified:** ~50 lines

**Additions:**
- Helper functions: `normalizeAddress()`, `checkDuplicateAddress()`, `checkDuplicateCoords()`, `validateLocationForm()`
- Edit dialog state variables (6 new state variables)
- Edit dialog handlers (6 new handler functions)
- Edit Location Dialog component (full form UI)
- Edit button in Location card headers
- Pencil icon import

**Modifications:**
- Refactored `validateForm()` to use shared helper
- Refactored `checkDuplicates()` to use shared helpers
- Updated Location card headers (added city/state/zip display, Edit button)

---

## Dependencies

### Existing (No New Dependencies)

- `@/lib/services/approvalEngine` - Approval request submission
- `@/lib/services/geocodingService` - ZIP geocoding
- `@/lib/services/permissionService` - Permission checks
- `@/components/ui/*` - shadcn/ui components
- `@/lib/toast` - Toast notifications
- `lucide-react` - Icons (Pencil added)

---

## Approval Workflow

When a Practice Admin submits a location edit request:

1. **Request Created**
   - Type: `practice_location_edit_request`
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
   - Both must approve for location to be updated

5. **Side Effects (on Approval)**
   - Location replaced in `practice.locations[]` array (preserves order)
   - Practice override saved to localStorage
   - History updated with approval action

---

## Edge Cases Handled

1. **Missing Practice**
   - Permission check ensures practice exists
   - Error state shown if practice not found

2. **Invalid ZIP**
   - Geocoding fails gracefully
   - Error toast displayed
   - User can enter coordinates manually

3. **Duplicate Address (Different Location)**
   - Validation prevents submission
   - Clear error message: "Another location with this address already exists."

4. **Duplicate Address (Same Location)**
   - Allowed (user can keep same address)
   - No error shown

5. **Duplicate Coordinates (Different Location)**
   - Warning shown but submission allowed
   - Alert: "These coordinates match another location; map markers may overlap."

6. **Duplicate Coordinates (Same Location)**
   - Allowed (user can keep same coordinates)
   - No warning shown

7. **Missing Coordinates**
   - Validation prevents submission
   - Clear error message guides user

8. **Location ID Immutability**
   - Enforced in validation
   - `updatedLocation.id` must equal `locationId`
   - Prevents accidental ID changes

9. **Form Reset**
   - Form pre-fills when dialog opens
   - Manual coordinates mode resets

---

## Differences from Add Location Flow

| Aspect | Add Location | Edit Location |
|--------|-------------|---------------|
| **Button Location** | SectionHeader actions | Each Location card header |
| **Dialog Title** | "Add New Location" | "Request Location Edit" |
| **Form Pre-filling** | Empty form | Pre-filled with location data |
| **Location ID** | Auto-generated | Read-only display of existing ID |
| **Duplicate Address** | Blocks if any match | Blocks only if different location matches |
| **Duplicate Coordinates** | Warns if any match | Warns only if different location matches |
| **Payload Structure** | `{ practiceId, location }` | `{ practiceId, locationId, updatedLocation }` |
| **ID Handling** | New ID generated | Must match existing location ID |

---

## Future Enhancements (Not Implemented)

1. **Remove Location Requests**
   - UI for removing locations
   - (Step 10.4.4)

2. **Bulk Edit**
   - Edit multiple locations at once
   - Batch approval requests

3. **Edit History**
   - View edit history for a location
   - Track changes over time

4. **Location Validation**
   - Address validation service integration
   - Coordinate verification

---

## Related Documentation

- **Step 10.1:** Multi-Location Migration (`docs/V2_STEP10.1_IMPLEMENTATION.md`)
- **Step 10.2:** Multi-Location Engine Expansion (`docs/V2_STEP10.2_IMPLEMENTATION.md`)
- **Step 10.3:** Approval Engine Extension - Location Actions (`docs/V2_STEP10.3_IMPLEMENTATION.md`)
- **Step 10.4.1:** Practice Admin Portal - Locations Tab (Read-Only UI) (`docs/V2_STEP10.4.1_IMPLEMENTATION.md`)
- **Step 10.4.2:** Practice Admin Portal - Add Location Request UI (`docs/V2_STEP10.4.2_IMPLEMENTATION.md`)
- **Approval Workflows:** `docs/V2_APPROVAL_WORKFLOWS.md`
- **Entity Models:** `docs/V2_ENTITY_MODELS.md`

---

## Summary

Step 10.4.3 successfully extends the Practice Admin Locations page with comprehensive "Edit Location" request functionality. The implementation:

✅ Provides Edit button on each location card  
✅ Opens dialog with pre-filled location data  
✅ Reuses validation and duplicate detection logic via shared helpers  
✅ Correctly excludes current location from duplicate checks  
✅ Submits approval requests with correct payload structure  
✅ Maintains strict separation (no direct practice mutations)  
✅ Handles all edge cases gracefully  
✅ Compiles with 0 TypeScript errors  
✅ Maintains code consistency with Add Location flow  

The feature is production-ready and follows all architectural patterns established in previous steps. Practice Admins can now submit location edit requests that require admin approval before being applied to the practice.
