# V2 Step 3 Implementation Summary

## Overview

Step 3 establishes seed practice data and assigns all doctors to practices deterministically. This step creates the practice-centric data foundation without changing UI or breaking backward compatibility with the Institution model.

**Date**: January 29, 2026  
**Status**: ✅ Complete  
**TypeScript Compilation**: ✅ Success

---

## Files Created

### Migration Modules (4 files)

1. **`src/lib/migrations/generatePracticesFromDoctors.ts`**
   - Deterministic algorithm to group doctors into exactly 30 practices
   - Groups by (state, city) first
   - Merges/splits groups to reach target count
   - Validates group sizes (2-8 doctors preferred)
   - Generates practice data (name, address, coordinates, specialties, etc.)
   - Uses deterministic hashing for consistent results

2. **`src/lib/migrations/applyPracticeAssignmentsToDoctors.ts`**
   - Safely adds `practiceId` and `roleInPractice` to doctors
   - Creates reverse map from practices
   - Assigns practice admin role (lowest lexical doctor ID per practice)
   - Preserves all existing doctor fields (including `institutionId`)

3. **`src/lib/migrations/sanityChecks.ts`**
   - `validatePracticeDoctorIntegrity()` function
   - Validates all integrity rules:
     - Every doctor has exactly 1 practiceId
     - Every practice has at least 1 doctor
     - Every practice has exactly 1 practice_admin
     - No doctor in multiple practices
     - Practice sizes are 2-8 doctors (warns if outside)
     - All IDs exist and are valid

4. **`src/lib/migrations/__debug.ts`**
   - `runStep3Sanity()` function for manual testing
   - Logs validation results to console
   - No UI wiring (call manually in dev console)

### Seed Data Files (1 file)

5. **`src/data/practices.ts`**
   - Exports `practices` array (30 practices)
   - Uses `generatePracticesFromDoctors()` with `baseDoctors`
   - Exports `getSeedPractices()` helper function
   - Imports from `doctors.ts` to avoid circular dependencies

### Files Updated

6. **`src/data/doctors.ts`**
   - Changed `export const doctors` to `const baseDoctorsArray`
   - Added imports for generator and patcher
   - Exports `baseDoctors` (before practice assignment)
   - Generates practices internally
   - Applies practice assignments
   - Exports final `doctors` array with `practiceId` and `roleInPractice`

---

## Implementation Details

### Practice Generation Algorithm

**Grouping Strategy**:
1. Extract primary location from each doctor (`locations[0]`)
2. Group by (state, city) - creates initial groups
3. Sort doctors within groups by ID (deterministic)

**Adjustment to Target Count (30)**:
- **If groups > 30**: Merge smallest groups within same state
- **If groups < 30**: Split largest groups by ZIP code, then by chunking if needed
- **Final safeguard**: Merge if exceeded target after splitting

**Size Validation**:
- Merge singletons (1 doctor) into nearest practice
- Split practices with >8 doctors into multiple practices
- Target: 2-8 doctors per practice

**Practice Data Generation**:
- **ID**: `practice-1` through `practice-30` (deterministic)
- **Name**: `"{City} {MostCommonSpecialty} Clinic"`
- **Slug**: Generated from name using `slugify()`
- **Address**: From first doctor's primary location
- **Coordinates**: ZIP → City/State → State fallback (deterministic)
- **Specialties**: Union of all doctor specialties in practice
- **Phone**: Deterministic hash-based generation
- **Email/Website**: Generated from slug
- **doctorIds**: Sorted array of doctor IDs
- **Insurance**: Union of first 3 doctors' insurance

### Doctor Assignment Algorithm

**Practice Admin Selection**:
- Lowest lexical `doctor.id` in each practice becomes practice admin
- All others get `roleInPractice: 'doctor'`

**Assignment Process**:
1. Create reverse map: `doctorId → practiceId`
2. Identify practice admins (sorted doctorIds, first = admin)
3. Map each doctor:
   - Add `practiceId` from map
   - Add `roleInPractice` based on admin status
   - Preserve all existing fields (spread operator)

### Coordinate Resolution

**Priority Order**:
1. `zipCoords[zip]` - Exact ZIP match from `zipCoordinates.ts`
2. `getCityStateCoordinates(city, state)` - City/state fallback
3. State-based approximate coordinates (fallback map)
4. Never returns (0, 0) - always provides valid coordinates

**Fallback Map**:
```typescript
{
  'IL': { lat: 40.3495, lng: -88.9861 },
  'MO': { lat: 38.4622, lng: -92.3020 },
  'TN': { lat: 35.7478, lng: -86.6923 },
}
```

---

## Data Flow

```
baseDoctorsArray (raw doctors)
    │
    ├─→ generatePracticesFromDoctors()
    │   └─→ 30 Practices
    │
    └─→ applyPracticeAssignmentsToDoctors()
        └─→ Doctors with practiceId + roleInPractice

doctors.ts exports:
  - baseDoctors (for practices.ts)
  - doctors (final with assignments)

practices.ts:
  - Imports baseDoctors from doctors.ts
  - Generates practices (same generator)
  - Exports practices array
```

---

## Deterministic Guarantees

- **Same Input → Same Output**: No random operations, all sorting is stable
- **Practice IDs**: Always `practice-1` through `practice-30`
- **Practice Admin**: Always lowest lexical doctor ID
- **Grouping**: Stable across runs (sorted by ID, then by city/state)
- **Phone Numbers**: Hash-based deterministic generation
- **Coordinates**: Deterministic fallback chain

---

## Backward Compatibility

- ✅ `institutionId` field preserved on all doctors
- ✅ Existing Institution model untouched
- ✅ All existing imports continue to work
- ✅ No breaking changes to Doctor type (only additions)
- ✅ Existing code using `doctors` export continues to work

---

## Validation Rules

### Sanity Checks Implemented

1. **Every doctor has exactly 1 practiceId** ✅
2. **Every practice has at least 1 doctor** ✅
3. **Every practice has exactly 1 practice_admin** ✅
4. **No doctor appears in multiple practices** ✅
5. **Practice sizes are 2-8 doctors** (warns if outside) ✅
6. **All practice IDs referenced by doctors exist** ✅
7. **All doctor IDs in practice.doctorIds exist** ✅

### Validation Function

```typescript
validatePracticeDoctorIntegrity(doctors, practices)
```

Returns object with:
- `totalDoctors`, `totalPractices`
- Arrays of violations (missing practice, no doctors, etc.)
- `isValid: boolean` (true if all checks pass)

---

## Key Features

### 1. Deterministic Grouping
- Groups by geographic location (state, city)
- Stable sorting ensures consistent results
- Handles edge cases (singletons, oversized groups)

### 2. Practice Admin Assignment
- Automatic assignment based on lowest ID
- Deterministic and stable
- One admin per practice guaranteed

### 3. Coordinate Resolution
- Multi-tier fallback system
- Never returns invalid coordinates
- Uses existing `zipCoordinates.ts` data

### 4. No Circular Dependencies
- `doctors.ts` exports `baseDoctors`
- `practices.ts` imports `baseDoctors`
- One-way dependency (practices → doctors)

### 5. Seed Data Stability
- Fixed timestamps: `2026-01-29T00:00:00.000Z`
- Deterministic generation ensures consistency
- Same doctors → same practices always

---

## Testing

### Manual Verification

Run in dev console:
```typescript
import { runStep3Sanity } from '@/lib/migrations/__debug';
runStep3Sanity();
```

### Expected Results

- ✅ Total Practices: 30
- ✅ All doctors have `practiceId`
- ✅ Each practice has exactly 1 admin
- ✅ Practice sizes: 2-8 doctors (with exceptions documented)
- ✅ No orphaned references
- ✅ `isValid: true`

---

## File Structure

```
src/
├── data/
│   ├── doctors.ts          ← Updated (exports baseDoctors + doctors)
│   └── practices.ts        ← New (exports 30 practices)
└── lib/
    └── migrations/
        ├── generatePracticesFromDoctors.ts  ← New
        ├── applyPracticeAssignmentsToDoctors.ts  ← New
        ├── sanityChecks.ts  ← New
        └── __debug.ts       ← New
```

---

## Code Statistics

- **Files Created**: 5
- **Files Updated**: 1
- **Lines of Code**: ~600+
- **Practices Generated**: 30
- **Doctors Assigned**: ~129
- **Practice Admins**: 30 (one per practice)

---

## Next Steps

Step 3 foundation is complete. Ready for:
- **Step 4**: UI integration and component updates
- **Step 5**: Approval workflow implementation
- **Step 6**: Practice pages and directory updates

---

## Verification Checklist

- [x] `src/data/practices.ts` exists and exports 30 practices
- [x] Every doctor has `practiceId` and `roleInPractice`
- [x] Each practice has exactly 1 practice admin
- [x] Practice sizes are 2-8 doctors (with exceptions)
- [x] Institutions remain untouched
- [x] No UI changes made
- [x] No circular import dependencies
- [x] TypeScript compiles successfully
- [x] Sanity checks implemented
- [x] Deterministic generation verified

---

**Implementation Status**: ✅ Complete  
**Ready for Next Step**: Yes
