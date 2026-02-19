# V2 Step 7 Implementation: Practice as Primary Entity

## Overview

Step 7 establishes Practice as the primary entity in public-facing UI, ensures specialties are accurately derived from doctor rosters, and tightens Institution fallback rules for v1 backward compatibility.

**Last Updated**: January 29, 2026  
**Version**: 2.0

---

## Goals

### Step 7.1: Doctor Profile Page - Practice is Primary
- Always show Practice section first (above Institution fallback)
- Load practice via `practiceDirectoryService.getPracticeById()`
- Show practice details, contact card, and "View Practice" link
- Display warning banners for edge cases (practice missing, legacy records)
- Hide Institution section when practice exists

### Step 7.2: Practice Page - Derive Specialties Correctly
- Derive specialties from doctors in practice using `getDoctorsForPractice()`
- Normalize, deduplicate, and sort specialties alphabetically
- Fallback to `practice.specialties` if no doctors
- Update PracticeCard to display derived specialties

### Step 7.3: Tighten Institution Fallback Rules
- Only show Institution if Practice is missing or not found
- Label Institution section as "Institution (Legacy)"
- Remove Institution links from v2 components
- Prefer practice links over institution links in DoctorCard

---

## Implementation Details

### 1. Doctor Profile Page Updates

**File**: `src/components/DoctorProfile.tsx`

#### Changes Made:

1. **Practice Section (Primary)**
   - Always rendered first when `doctor.practiceId` exists and practice is found
   - Displays practice name, location, contact info (via `contactCard`)
   - Shows description excerpt (first 200 characters)
   - Includes "View Practice" button linking to `/practices/${practice.slug}`
   - Uses vibrant styling (brand-teal border) to indicate primary status

2. **Warning Banners**
   - **Practice Missing**: Shown when `doctor.practiceId` exists but practice not found
     - Message: "This doctor is linked to a practice that is not available in the directory."
   - **Legacy Record**: Shown when `doctor.practiceId` is missing
     - Message: "Legacy doctor record missing practice association."
   - Uses `Alert` component with amber styling for visibility

3. **Institution Section (Legacy Fallback)**
   - Only rendered when no practice exists
   - Explicitly labeled "Institution (Legacy)"
   - Uses muted styling (gray-200 border, gray-600 text)
   - **Removed**: "View Institution" link (Step 7.3 requirement)

#### Code Structure:

```typescript
{/* Practice Section (Primary) */}
{(() => {
  let practice = null;
  if (doctor.practiceId) {
    practice = getPracticeById(doctor.practiceId);
  }
  
  if (practice) {
    return (
      <Card className="card-vibrant border-2 border-brand-teal/20">
        {/* Practice details */}
        <Link href={`/practices/${practice.slug}`}>View Practice</Link>
      </Card>
    );
  }
  
  if (doctor.practiceId && !practice) {
    return (
      <Alert variant="default" className="bg-amber-50 border-amber-200">
        <AlertDescription>
          This doctor is linked to a practice that is not available in the directory.
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
})()}

{/* Institution Section (Legacy Fallback) */}
{(() => {
  let practice = null;
  if (doctor.practiceId) {
    practice = getPracticeById(doctor.practiceId);
  }
  
  if (practice) return null; // Don't show institution if practice exists
  
  // Show institution fallback...
})()}
```

---

### 2. Practice Page - Specialty Derivation

**File**: `src/app/practices/[slug]/page.tsx`

#### Changes Made:

1. **Helper Function**
   - Added `deriveSpecialtiesFromDoctors()` function
   - Extracts specialties from `doctor.specialty` and `doctor.specialties[]`
   - Normalizes (trim), deduplicates (Set), and sorts alphabetically

2. **Specialty Computation**
   - After loading doctors via `getDoctorsForPractice()`
   - Computes `derivedSpecialties` from doctor roster
   - Falls back to `practice.specialties` if no doctors found
   - Falls back to "Specialties not available" if neither exists

3. **Display Updates**
   - Hero area: Shows derived specialties (if any)
   - Sidebar: Uses `derivedSpecialties` for specialty badges
   - Stats card: Uses `derivedSpecialties.length` for count

#### Code Structure:

```typescript
function deriveSpecialtiesFromDoctors(doctors: Doctor[]): string[] {
  const specialtiesSet = new Set<string>();
  
  doctors.forEach(doctor => {
    if (doctor.specialty && doctor.specialty.trim()) {
      specialtiesSet.add(doctor.specialty.trim());
    }
    if (doctor.specialties && Array.isArray(doctor.specialties)) {
      doctor.specialties.forEach(spec => {
        if (spec && spec.trim()) {
          specialtiesSet.add(spec.trim());
        }
      });
    }
  });
  
  return Array.from(specialtiesSet).sort();
}

// In component:
const practiceDoctors = getDoctorsForPractice(practiceData.id);
setDoctors(practiceDoctors);

const specialties = practiceDoctors.length > 0
  ? deriveSpecialtiesFromDoctors(practiceDoctors)
  : (practiceData.specialties || []);
setDerivedSpecialties(specialties);
```

---

### 3. Practice Directory - Derived Specialties in Cards

**File**: `src/app/practices/page.tsx`

#### Changes Made:

1. **Helper Function**
   - Added `deriveSpecialtiesFromDoctors()` helper (same logic as practice page)
   - Kept local to file (not shared utility) for simplicity

2. **Specialty Computation**
   - After `searchPractices()` call, compute derived specialties for each practice
   - Use `useMemo` to avoid recomputation on every render
   - Fallback to `practice.specialties` if no doctors

3. **Card Updates**
   - Pass `derivedSpecialties` prop to `PracticeCard` components
   - Cards display derived specialties instead of stored `practice.specialties`

#### Code Structure:

```typescript
// Compute derived specialties for each practice
const practicesWithDerivedSpecialties = useMemo(() => {
  return searchResults.practices.map(practice => {
    const practiceDoctors = getDoctorsForPractice(practice.id);
    const derivedSpecialties = practiceDoctors.length > 0
      ? deriveSpecialtiesFromDoctors(practiceDoctors)
      : (practice.specialties || []);
    return { ...practice, derivedSpecialties };
  });
}, [searchResults.practices]);

// Render cards with derived specialties
{practicesWithDerivedSpecialties.map((practice) => (
  <PracticeCard 
    practice={practice} 
    derivedSpecialties={practice.derivedSpecialties}
    // ... other props
  />
))}
```

---

### 4. PracticeCard Component Updates

**File**: `src/components/public/practices/PracticeCard.tsx`

#### Changes Made:

1. **New Prop**
   - Added `derivedSpecialties?: string[]` to `PracticeCardProps` interface

2. **Display Logic**
   - Prioritizes `derivedSpecialties` if provided
   - Falls back to `practice.specialties` if not provided
   - Maintains backward compatibility

#### Code Structure:

```typescript
interface PracticeCardProps {
  practice: Practice;
  doctorCount?: number;
  distanceMiles?: number;
  originLabel?: string;
  derivedSpecialties?: string[]; // NEW
}

export function PracticeCard({ practice, derivedSpecialties, ... }: PracticeCardProps) {
  // Use derivedSpecialties if provided, otherwise fallback to practice.specialties
  const specialtiesToDisplay = derivedSpecialties || practice.specialties || [];
  
  // Display logic uses specialtiesToDisplay
  const displaySpecialties = specialtiesToDisplay.slice(0, 3);
  // ...
}
```

---

### 5. DoctorCard - Prefer Practice Links

**File**: `src/components/DoctorCard.tsx`

#### Changes Made:

1. **Import Update**
   - Added `getPracticeById` import from `practiceDirectoryService`

2. **Link Logic**
   - Check for `doctor.practiceId` first
   - If practice exists, show practice link (`/practices/${practice.slug}`)
   - Fallback to institution link only if no practice exists
   - Maintains v1 compatibility for legacy doctors

#### Code Structure:

```typescript
{showInstitution && (() => {
  // Prefer practice link if practiceId exists
  if (doctor.practiceId) {
    const practice = getPracticeById(doctor.practiceId);
    if (practice) {
      return (
        <Link href={`/practices/${practice.slug}`}>
          {practice.name}
        </Link>
      );
    }
  }
  // Fallback to institution if no practice
  if (doctor.institutionId) {
    const institution = getInstitutionById(doctor.institutionId);
    // ... institution link
  }
  return null;
})()}
```

---

## Testing Checklist

### Doctor Profile Page

- [x] Practice section shows first when practice exists
- [x] Practice section displays correct practice details
- [x] "View Practice" link navigates correctly
- [x] Warning banner shows when practiceId exists but practice not found
- [x] Warning banner shows when practiceId is missing (legacy)
- [x] Institution section only shows when practice missing
- [x] Institution section labeled "Institution (Legacy)"
- [x] No Institution links in v2 flows
- [x] Contact visibility rules still work
- [x] Referral button still works

### Practice Page

- [x] Specialties derived from doctor roster
- [x] Specialties normalized (trimmed)
- [x] Specialties deduplicated
- [x] Specialties sorted alphabetically
- [x] Fallback to `practice.specialties` when no doctors
- [x] Fallback to "Specialties not available" when neither exists
- [x] Hero area displays derived specialties
- [x] Sidebar displays derived specialties
- [x] Stats card uses correct count

### Practice Directory

- [x] Cards display derived specialties
- [x] Specialties computed once per results load (useMemo)
- [x] No performance regression
- [x] Fallback to `practice.specialties` works
- [x] Map/distance features still work (Step 6.3)

### DoctorCard

- [x] Practice link shown when practiceId exists
- [x] Institution link shown only as fallback
- [x] Links navigate correctly
- [x] v1 compatibility maintained

---

## Edge Cases Handled

1. **Practice Missing**
   - Doctor has `practiceId` but practice not found
   - Shows warning banner
   - Falls back to Institution if available

2. **Legacy Doctors**
   - Doctor missing `practiceId`
   - Shows warning banner
   - Falls back to Institution if available

3. **No Doctors in Practice**
   - Practice has no doctors
   - Falls back to `practice.specialties`
   - Shows "Specialties not available" if neither exists

4. **Empty Specialties**
   - Doctor has no specialty fields
   - Handled gracefully (empty array)
   - Falls back appropriately

5. **Specialty Normalization**
   - Handles whitespace (trim)
   - Handles duplicates (Set)
   - Sorts alphabetically for consistency

---

## Performance Considerations

1. **Specialty Computation**
   - Uses `useMemo` in practices directory to avoid recomputation
   - Computed once per search results update
   - No expensive per-card computation

2. **Practice Lookup**
   - `getPracticeById()` is O(n) but acceptable for small datasets
   - Consider caching if performance becomes an issue

3. **Doctor Roster Lookup**
   - `getDoctorsForPractice()` filters all doctors
   - Acceptable for current dataset size
   - Consider indexing if dataset grows significantly

---

## Backward Compatibility

### v1 Institution Support

- Institution model still exists in codebase
- Institution pages still accessible (`/institutions/[slug]`)
- Institution links removed from v2 components
- DoctorCard falls back to institution links for legacy doctors

### Data Migration

- No data migration required
- Existing doctors with `practiceId` work immediately
- Legacy doctors without `practiceId` show warnings
- Gradual migration path available

---

## Files Modified

1. `src/components/DoctorProfile.tsx`
   - Added Practice section (primary)
   - Added warning banners
   - Updated Institution section (legacy fallback)
   - Removed Institution link

2. `src/app/practices/[slug]/page.tsx`
   - Added `deriveSpecialtiesFromDoctors()` helper
   - Computes derived specialties from doctor roster
   - Updates display to use derived specialties

3. `src/app/practices/page.tsx`
   - Added `deriveSpecialtiesFromDoctors()` helper
   - Computes derived specialties for search results
   - Passes `derivedSpecialties` to PracticeCard

4. `src/components/public/practices/PracticeCard.tsx`
   - Added `derivedSpecialties` prop
   - Updated specialty display logic

5. `src/components/DoctorCard.tsx`
   - Updated to prefer practice links
   - Falls back to institution links

---

## TypeScript Compilation

- ✅ 0 errors
- ✅ All types properly defined
- ✅ No `any` types introduced
- ✅ Proper null/undefined handling

---

## Next Steps

1. **Monitor Performance**
   - Watch for performance issues with specialty computation
   - Consider caching if needed

2. **Data Quality**
   - Ensure all doctors have `practiceId` assigned
   - Migrate legacy doctors to practices

3. **User Testing**
   - Test all edge cases with real data
   - Verify warning banners are helpful
   - Confirm fallback behavior works correctly

---

## Related Documentation

- `V2_ENTITY_MODELS.md` - Data structures reference
- `V2_MIGRATION_GUIDE.md` - Migration strategy
- `V2_STEP6_IMPLEMENTATION.md` - Practice directory implementation
- `V2_STEP6.3_IMPLEMENTATION.md` - Map and distance features

---

**Status**: ✅ Complete  
**TypeScript Errors**: 0  
**Linter Errors**: 0  
**Breaking Changes**: None (backward compatible)
