# Files to Upload to Cloud Shell - Complete List

**Date**: January 29, 2026  
**Purpose**: Deploy new API endpoints to Cloud Run

---

## 📋 Summary

**Total Files to Upload**: 10 files  
**Location in Cloud Shell**: `~/aip-backend/src/` (or wherever your backend code is)

---

## ✅ NEW FILES TO CREATE/UPLOAD (7 files)

These are **brand new** route files that don't exist in Cloud Shell yet:

### 1. `src/routes/departments.ts`
**Path**: `aip-backend/src/routes/departments.ts`  
**Action**: Create new file in Cloud Shell  
**Purpose**: Get all departments/specialties from database

### 2. `src/routes/membership-plans.ts`
**Path**: `aip-backend/src/routes/membership-plans.ts`  
**Action**: Create new file in Cloud Shell  
**Purpose**: Get membership plans from database

### 3. `src/routes/approval-requests.ts`
**Path**: `aip-backend/src/routes/approval-requests.ts`  
**Action**: Create new file in Cloud Shell  
**Purpose**: CRUD operations for approval requests

### 4. `src/routes/referrals.ts`
**Path**: `aip-backend/src/routes/referrals.ts`  
**Action**: Create new file in Cloud Shell  
**Purpose**: CRUD operations for referrals

### 5. `src/routes/appointments.ts`
**Path**: `aip-backend/src/routes/appointments.ts`  
**Action**: Create new file in Cloud Shell  
**Purpose**: CRUD operations for appointment requests

### 6. `src/routes/messages.ts`
**Path**: `aip-backend/src/routes/messages.ts`  
**Action**: Create new file in Cloud Shell  
**Purpose**: Message threads and messages

### 7. `src/routes/notifications.ts`
**Path**: `aip-backend/src/routes/notifications.ts`  
**Action**: Create new file in Cloud Shell  
**Purpose**: User notifications

---

## 🔄 FILES TO UPDATE/REPLACE (3 files)

These files already exist but need to be **updated** with new code:

### 8. `src/index.ts`
**Path**: `aip-backend/src/index.ts`  
**Action**: Replace entire file  
**Changes**: Added imports for 7 new route files and registered them

**What changed**:
- Added imports for new routes
- Added `app.use()` calls to register new routes

### 9. `src/routes/doctors.ts`
**Path**: `aip-backend/src/routes/doctors.ts`  
**Action**: Replace entire file  
**Changes**: Added filters, search, and pagination to GET endpoint

**What changed**:
- `GET /api/doctors` now supports query params: `specialty`, `city`, `state`, `search`, `page`, `limit`
- Returns paginated response with `doctors` array and `pagination` object

### 10. `src/routes/practices.ts`
**Path**: `aip-backend/src/routes/practices.ts`  
**Action**: Replace entire file  
**Changes**: Added filters, search, and pagination to GET endpoint

**What changed**:
- `GET /api/practices` now supports query params: `city`, `state`, `specialty`, `search`, `page`, `limit`
- Returns paginated response with `practices` array and `pagination` object

---

## 📁 File Structure in Cloud Shell

After uploading, your Cloud Shell should have this structure:

```
~/aip-backend/
├── src/
│   ├── index.ts                    ← UPDATE (replace)
│   ├── db/
│   │   └── connection.ts          ← Already exists (no change needed)
│   └── routes/
│       ├── auth.ts                 ← Already exists (no change)
│       ├── doctors.ts              ← UPDATE (replace)
│       ├── practices.ts            ← UPDATE (replace)
│       ├── departments.ts          ← NEW (create)
│       ├── membership-plans.ts     ← NEW (create)
│       ├── approval-requests.ts    ← NEW (create)
│       ├── referrals.ts            ← NEW (create)
│       ├── appointments.ts         ← NEW (create)
│       ├── messages.ts             ← NEW (create)
│       └── notifications.ts        ← NEW (create)
├── package.json                    ← Already exists (no change)
├── tsconfig.json                   ← Already exists (no change)
└── Dockerfile                      ← Already exists (no change)
```

---

## 🚀 Upload Methods

### Method 1: Cloud Shell Editor (Easiest)

1. **Open Cloud Shell**: https://shell.cloud.google.com
2. **Click "Open Editor"** (pencil icon at top)
3. **Navigate to**: `~/aip-backend/src/routes/`
4. **For NEW files**:
   - Click "New File" button
   - Name it (e.g., `departments.ts`)
   - Copy content from local file
   - Paste into Cloud Shell editor
   - Save (Ctrl+S or Cmd+S)

5. **For UPDATED files**:
   - Open existing file (e.g., `index.ts`)
   - Select all (Ctrl+A or Cmd+A)
   - Delete
   - Copy content from local file
   - Paste
   - Save

### Method 2: Manual Copy-Paste

1. **Open local file** in your editor
2. **Select all** (Ctrl+A / Cmd+A)
3. **Copy** (Ctrl+C / Cmd+C)
4. **Open Cloud Shell Editor**
5. **Create/open file**
6. **Paste** (Ctrl+V / Cmd+V)
7. **Save**

### Method 3: Using gcloud CLI (Advanced)

If you have `gcloud` installed locally:

```bash
# From your local machine
cd /Users/ganesh/Desktop/DRPLatest/EnsembleDrPage-main/aip-backend

# Upload new files
gcloud cloud-shell scp src/routes/departments.ts user@cloudshell:~/aip-backend/src/routes/
gcloud cloud-shell scp src/routes/membership-plans.ts user@cloudshell:~/aip-backend/src/routes/
# ... repeat for all new files

# Upload updated files
gcloud cloud-shell scp src/index.ts user@cloudshell:~/aip-backend/src/index.ts
gcloud cloud-shell scp src/routes/doctors.ts user@cloudshell:~/aip-backend/src/routes/
gcloud cloud-shell scp src/routes/practices.ts user@cloudshell:~/aip-backend/src/routes/
```

---

## ✅ Verification Checklist

After uploading, verify in Cloud Shell:

```bash
cd ~/aip-backend

# Check all route files exist
ls -la src/routes/

# Should see:
# - auth.ts
# - doctors.ts
# - practices.ts
# - departments.ts ✅
# - membership-plans.ts ✅
# - approval-requests.ts ✅
# - referrals.ts ✅
# - appointments.ts ✅
# - messages.ts ✅
# - notifications.ts ✅

# Verify index.ts has new imports
grep "import.*Routes" src/index.ts

# Should see imports for all new routes
```

---

## 📝 Quick Upload Order

**Recommended order**:

1. ✅ Upload **NEW route files first** (7 files)
   - departments.ts
   - membership-plans.ts
   - approval-requests.ts
   - referrals.ts
   - appointments.ts
   - messages.ts
   - notifications.ts

2. ✅ Then upload **UPDATED files** (3 files)
   - doctors.ts
   - practices.ts
   - index.ts (last - depends on route files existing)

---

## 🎯 What Each File Does

| File | Endpoints | Purpose |
|------|-----------|---------|
| `departments.ts` | `GET /api/departments` | List all medical specialties |
| `membership-plans.ts` | `GET /api/membership-plans`, `GET /api/membership-plans/:id` | Get membership plans |
| `approval-requests.ts` | `GET/POST/PUT /api/approval-requests`, `POST /api/approval-requests/:id/approve`, `POST /api/approval-requests/:id/reject` | Manage approval requests |
| `referrals.ts` | `GET/POST/PUT /api/referrals`, `GET /api/referrals/:id` | Manage referrals |
| `appointments.ts` | `GET/POST/PUT /api/appointments`, `GET /api/appointments/:id` | Manage appointments |
| `messages.ts` | `GET/POST /api/messages/threads`, `GET /api/messages/threads/:id`, `POST /api/messages` | Manage messages |
| `notifications.ts` | `GET /api/notifications`, `PUT /api/notifications/:id/read`, `PUT /api/notifications/read-all` | Manage notifications |
| `doctors.ts` | `GET /api/doctors` (updated with filters) | List/search doctors |
| `practices.ts` | `GET /api/practices` (updated with filters) | List/search practices |
| `index.ts` | N/A | Registers all routes |

---

## ⚠️ Important Notes

1. **Don't upload** `connection.ts` - it's already correct
2. **Don't upload** `auth.ts` - no changes needed
3. **Don't upload** `package.json` - no new dependencies
4. **Do upload** all 7 new route files
5. **Do replace** the 3 updated files

---

## 🐛 Troubleshooting

### File not found error:
- Make sure you're in the correct directory: `~/aip-backend/src/routes/`
- Check file names match exactly (case-sensitive)

### Import errors after upload:
- Verify all route files exist before updating `index.ts`
- Check import paths in `index.ts` match file names

### TypeScript errors:
- Run `npm run build` in Cloud Shell to check for errors
- Fix any syntax errors before deploying

---

## Summary

**Upload 10 files total**:
- 7 NEW route files → Create in `src/routes/`
- 3 UPDATED files → Replace in `src/` and `src/routes/`

**Location**: `~/aip-backend/src/` in Cloud Shell

**Method**: Cloud Shell Editor (easiest) or copy-paste

**Time**: ~10-15 minutes to upload all files
