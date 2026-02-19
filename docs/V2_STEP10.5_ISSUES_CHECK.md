# Step 10.5 - Common Issues Verification Report

## Verification Date
January 29, 2026

## Status: ⚠️ ISSUES FOUND - FIXES REQUIRED

---

## Issue 1: History Drawer Snapshot Shape Mismatch ⚠️

**Status**: ⚠️ **ISSUE FOUND**

**Location**: `src/app/admin/history/approvals/page.tsx` lines 523-545

**Problem**: 
- Constructed `requestLike` object uses `selectedRecord.payloadSnapshot` directly as `payload`
- However, `payloadSnapshot` might not have `practiceId` field if it's stored in `target.practiceId` instead
- Renderer components access `payload.practiceId` directly without fallback

**Current Code**:
```typescript
payload: selectedRecord.payloadSnapshot,
```

**Issue**: If `payloadSnapshot` doesn't have `practiceId`, renderer will fail when accessing `payload.practiceId`.

**Fix Required**: Add fallback logic:
```typescript
payload: {
  ...selectedRecord.payloadSnapshot,
  practiceId: selectedRecord.payloadSnapshot?.practiceId ?? selectedRecord.practiceId,
}
```

---

## Issue 2: getPracticeById() Import is Server-Only ⚠️

**Status**: ✅ **OK** (but needs verification)

**Location**: All admin pages are `'use client'` components

**Analysis**:
- `getPracticeById()` uses `getAllPractices()` which reads from localStorage
- All admin pages (`requests-v2/[id]/page.tsx`, `requests-v2/page.tsx`, `history/approvals/page.tsx`) are `'use client'`
- `getPracticeById()` is called inside `useMemo` hooks, which is client-side safe
- Function uses `localStorage` via `getCreatedPractices()` and `getAllPractices()`

**Verdict**: ✅ **SAFE** - Function is client-safe because it uses localStorage utilities that are client-only.

---

## Issue 3: Renderer Assumes payload.practiceId Always Exists ⚠️

**Status**: ⚠️ **ISSUE FOUND**

**Location**: `src/components/shared/approvals/RequestedChangesRenderer.tsx`

**Problem**:
- `LocationAddView` line 35: `getPracticeById(payload.practiceId)` - no fallback
- `LocationRemoveView` line 110: `getPracticeById(payload.practiceId)` - no fallback  
- `LocationEditDiffView` line 173: `getPracticeById(payload.practiceId)` - no fallback

**Current Code**:
```typescript
return getPracticeById(payload.practiceId);
```

**Issue**: If `payload.practiceId` is undefined, `getPracticeById(undefined)` will fail or return null, but we should fallback to `request.target?.practiceId`.

**Fix Required**: Add fallback:
```typescript
return getPracticeById(payload.practiceId ?? request.target?.practiceId ?? '');
```

---

## Issue 4: Remove Request Resolution Fails When Location Already Removed ✅

**Status**: ✅ **OK**

**Location**: `src/components/shared/approvals/RequestedChangesRenderer.tsx` lines 116-119, 125-135

**Analysis**:
- Location resolution returns `null` if not found: `practice.locations.find(...) || null`
- Component checks `{location ? <LocationSummary /> : <Alert />}`
- Shows "Location Not Found" alert when location is undefined
- Does not crash

**Verdict**: ✅ **HANDLED CORRECTLY**

---

## Issue 5: Diff Helper Treating 0 as Empty ⚠️

**Status**: ⚠️ **ISSUE FOUND**

**Location**: `src/lib/utils/locationDiff.ts` line 39-42

**Problem**:
- `roundCoord()` function checks `if (n === null || n === undefined)` but NOT `if (n === 0)`
- However, `toStr()` function (line 25-36) treats `0` as valid number: `if (typeof v === 'number') return String(v);`
- So `0` should be handled correctly in `toStr()`, but `roundCoord()` might have issues

**Current Code**:
```typescript
function roundCoord(n: number | null | undefined, decimals = 6): string {
  if (n === null || n === undefined) return NA;
  if (Number.isNaN(n)) return NA;
  return Number(n.toFixed(decimals)).toString();
}
```

**Analysis**: 
- `roundCoord(0)` will return `"0"` (correct)
- `roundCoord(null)` returns `"—"` (correct)
- `roundCoord(undefined)` returns `"—"` (correct)
- However, if `lat` or `lng` is `0`, it's a valid coordinate (Gulf of Guinea)

**Verdict**: ✅ **OK** - `0` is handled correctly, not treated as empty.

---

## Issue 6: Coord Rounding vs Comparison Mismatch ⚠️

**Status**: ⚠️ **ISSUE FOUND**

**Location**: 
- Comparison: `src/components/shared/approvals/RequestedChangesRenderer.tsx` lines 49-52, 197-200
- Display: `src/lib/utils/locationDiff.ts` line 39-42

**Problem**:
- Comparison uses: `Math.abs(loc.lat - location.lat) < 0.000001` (raw float comparison)
- Display uses: `roundCoord()` which rounds to 6 decimals
- These are consistent (0.000001 = 6 decimal precision), BUT the comparison should use the same rounding logic for consistency

**Current Comparison**:
```typescript
Math.abs(loc.lat - location.lat) < 0.000001
```

**Current Display**:
```typescript
roundCoord(n, 6) // rounds to 6 decimals
```

**Analysis**: 
- Tolerance `0.000001` matches 6 decimal precision
- However, for absolute consistency, should use same rounding function

**Verdict**: ⚠️ **MINOR ISSUE** - Works correctly but could be more consistent. Consider creating a comparison helper that uses same rounding.

---

## Issue 7: List Page Helpers Crash on Non-Location Payloads ✅

**Status**: ✅ **OK**

**Location**: `src/app/admin/requests-v2/page.tsx` lines 92-136

**Analysis**:
- `getLocationDisplay()` checks `if (!locationTypes.includes(request.type)) return null;` BEFORE casting
- Type guard is strict: checks request.type first
- Only then casts payload: `const payload = request.payload as PracticeLocationAddPayload`
- Wrapped in try-catch

**Verdict**: ✅ **SAFE** - Properly type-guarded.

---

## Issue 8: Accordion Raw JSON Not Accessible in Detail Page ✅

**Status**: ✅ **OK**

**Location**: `src/components/shared/approvals/RequestedChangesRenderer.tsx` lines 305-313

**Analysis**:
- Accordion is rendered for ALL request types (not just location requests)
- Default case shows `RawJsonPayload` AND accordion
- Location requests show formatted view AND accordion
- Accordion is always present: `<Accordion type="single" collapsible>`

**Verdict**: ✅ **OK** - Raw JSON is always accessible via accordion.

---

## Issue 9: Unused Imports / Wrong Icon Names ✅

**Status**: ✅ **OK**

**Location**: `src/components/shared/approvals/LocationSummary.tsx` line 5

**Analysis**:
- Import: `import { MapPin, Phone, Clock, Link as LinkIcon } from 'lucide-react';`
- Usage: `<LinkIcon className="..." />` (line 103)
- TypeScript compilation passed (no errors)
- Icon is used correctly

**Verdict**: ✅ **OK** - LinkIcon imported correctly as alias for Link.

---

## Issue 10: CSS/Layout Regression on Mobile ✅

**Status**: ✅ **OK**

**Location**: `src/components/shared/approvals/RequestedChangesRenderer.tsx` line 223

**Analysis**:
- Grid: `className="grid gap-4 md:grid-cols-2"`
- On mobile: single column (default)
- On desktop: two columns (`md:grid-cols-2`)
- Should collapse cleanly

**Verdict**: ✅ **OK** - Responsive grid implemented correctly.

---

## Summary

### Issues Found: 3

1. ⚠️ **History Drawer Snapshot Shape Mismatch** - Need fallback for `practiceId`
2. ⚠️ **Renderer Assumes payload.practiceId Always Exists** - Need fallback to `target.practiceId`
3. ⚠️ **Coord Rounding vs Comparison Mismatch** - Minor consistency issue

### Issues OK: 7

1. ✅ getPracticeById() Import is Server-Only - Safe (client-side)
2. ✅ Remove Request Resolution - Handled correctly
3. ✅ Diff Helper Treating 0 as Empty - Handled correctly
4. ✅ List Page Helpers Crash - Properly type-guarded
5. ✅ Accordion Raw JSON - Always accessible
6. ✅ Unused Imports - All used correctly
7. ✅ CSS/Layout Regression - Responsive correctly

---

## Required Fixes

### Fix 1: History Drawer Snapshot Shape
**File**: `src/app/admin/history/approvals/page.tsx`
**Line**: ~544
```typescript
payload: {
  ...selectedRecord.payloadSnapshot,
  practiceId: selectedRecord.payloadSnapshot?.practiceId ?? selectedRecord.practiceId,
}
```

### Fix 2: Renderer payload.practiceId Fallback
**File**: `src/components/shared/approvals/RequestedChangesRenderer.tsx`
**Lines**: 35, 110, 173
```typescript
const practiceId = (payload.practiceId ?? request.target?.practiceId) || '';
return getPracticeById(practiceId);
```

### Fix 3: Coord Comparison Consistency (Optional)
**File**: `src/components/shared/approvals/RequestedChangesRenderer.tsx`
**Lines**: 49-52, 197-200
Consider creating a helper function that uses same rounding logic for consistency.

---

## Next Steps

1. Apply Fix 1 (History drawer)
2. Apply Fix 2 (Renderer fallback)
3. Test with edge cases (missing practiceId, location already removed)
4. Verify TypeScript compilation still passes
5. Run runtime smoke tests
