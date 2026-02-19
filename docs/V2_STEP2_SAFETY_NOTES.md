# V2 Step 2 Safety Notes & Future Improvements

## Overview

This document notes safety concerns identified during Step 2 implementation and planned improvements for future steps.

**Date**: January 29, 2026

---

## 1. DoctorOverride Type Safety

### Current Implementation

```typescript
export type DoctorOverride = Partial<Doctor>;
```

**Issue**: This allows overriding `id` and `slug` fields, which could be dangerous in admin flows where these identifiers should be immutable.

**Current Usage**:
- `src/lib/memberStorage.ts` - Uses `Partial<Doctor>` directly
- `src/components/admin/MemberEditDialog.tsx` - Uses `saveDoctorOverride()` with full Doctor object

**Risk**: Admin could accidentally change doctor ID or slug, breaking references and URLs.

### Solution for Step 4/5

Created `SafeDoctorOverride` type that excludes `id` and `slug`:

```typescript
export type SafeDoctorOverride = Partial<Omit<Doctor, 'id' | 'slug'>>;
```

**Action Items for Step 4/5**:
1. Update `memberStorage.ts` to use `SafeDoctorOverride` instead of `Partial<Doctor>`
2. Update `MemberEditDialog.tsx` to prevent id/slug editing
3. Add runtime validation in `saveDoctorOverride()` to strip id/slug if present
4. Consider creating separate types:
   - `DoctorOverride` - Full override (admin-only, use with caution)
   - `SafeDoctorOverride` - Standard override (prevents id/slug changes)

**Migration Path**:
- Keep `DoctorOverride` for backward compatibility
- Introduce `SafeDoctorOverride` in Step 4/5
- Gradually migrate admin flows to use `SafeDoctorOverride`
- Add validation to prevent id/slug overrides

---

## 2. Referral Type Migration

### Current State

**Legacy Referral (V1)**:
- Location: `src/types/index.ts` as `LegacyReferral` and `Referral` (alias)
- Status: `'New' | 'In Progress' | 'Closed'`
- Used by: `doctorStorage.ts`, `ReferralsSection.tsx`, `MonthlyReferralsChart.tsx`, `OverviewSection.tsx`

**V2 Referral**:
- Location: `src/types/referrals.ts`
- Status: `'new' | 'attended' | 'removed'`
- Used by: `referralStorage.ts` (new V2 storage)

### Backward Compatibility

✅ **No Breaking Changes**: 
- Existing code continues to use `LegacyReferral` via `Referral` alias
- New V2 code imports `Referral` directly from `'@/types/referrals'`
- Both types coexist without conflicts

**Verification**:
- ✅ TypeScript compiles without errors
- ✅ Existing imports work (`import { Referral } from '@/types'` → LegacyReferral)
- ✅ New imports work (`import { Referral } from '@/types/referrals'` → V2 Referral)
- ✅ No type conflicts detected

### Migration Path for Future Steps

**Step 3+**: When migrating doctor dashboard referrals:
1. Update `doctorStorage.ts` to use V2 `Referral` type
2. Migrate existing LegacyReferral data to V2 format
3. Update `ReferralsSection.tsx` to use V2 status values
4. Update `MonthlyReferralsChart.tsx` to use V2 status values
5. Remove `LegacyReferral` type once migration complete

**Status Mapping**:
- `'New'` → `'new'`
- `'In Progress'` → `'new'` (or create new status)
- `'Closed'` → `'attended'` or `'removed'`

---

## 3. PracticeOverride Type

### Current Implementation

```typescript
export type PracticeOverride = Partial<Omit<Practice, 'id' | 'slug'>>;
```

✅ **Already Safe**: PracticeOverride correctly excludes `id` and `slug` from the start.

**Pattern to Follow**: Use this same pattern for `SafeDoctorOverride` in Step 4/5.

---

## 4. Storage Function Safety

### Current Implementation

All storage functions are SSR-safe and never throw:
- ✅ Check `isBrowser()` before localStorage access
- ✅ Return safe fallbacks on error
- ✅ Log errors but don't crash

**No changes needed** - this is the correct pattern.

---

## Summary

### Immediate Actions (Step 2)
- ✅ Created `SafeDoctorOverride` type for future use
- ✅ Documented Referral type migration status
- ✅ Verified no breaking changes

### Future Actions (Step 4/5)
- [ ] Migrate `memberStorage.ts` to use `SafeDoctorOverride`
- [ ] Add validation to prevent id/slug overrides
- [ ] Update admin edit dialogs to use safe override type
- [ ] Migrate LegacyReferral to V2 Referral in doctor dashboard

### Risk Assessment

**Low Risk**:
- Current `DoctorOverride` usage is limited to admin flows
- Admin users are trusted
- Can be fixed in Step 4/5 before broader rollout

**No Risk**:
- Referral type migration is backward compatible
- Both types coexist without conflicts
- Migration can happen gradually

---

**Status**: ✅ Documented, ready for Step 4/5 improvements
