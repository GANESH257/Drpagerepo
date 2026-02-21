# API Migration Complete

## Summary

The frontend has been successfully migrated from localStorage-based data storage to API calls using the deployed Cloud Run backend.

## Changes Made

### 1. API Client Infrastructure ✅
- **Created**: `src/lib/api/config.ts` - Base API client with HTTP methods
- **Created**: `src/lib/api/auth.ts` - Authentication API functions
- **Created**: `src/lib/api/doctors.ts` - Doctor API functions  
- **Created**: `src/lib/api/practices.ts` - Practice API functions

### 2. Authentication Migration ✅
- **Updated**: `src/lib/useDoctorSession.ts` - Now stores JWT tokens instead of session objects
  - New methods: `getToken()`, `getUser()`, `setToken(token, user)`
  - Legacy methods maintained for backward compatibility
- **Updated**: `src/components/join-us/SignInForm.tsx` - Uses `/api/auth/login` API
- **Updated**: `src/components/join-us/SignUpForm.tsx` - Uses `/api/auth/signup` API

### 3. Data Fetching Migration ✅
- **Updated**: `src/lib/doctorStorage.ts` - Added API methods:
  - `loadDoctorProfileFromAPI()` - Loads from API
  - `saveDoctorProfileToAPI()` - Saves to API
  - Legacy methods maintained for fallback
- **Updated**: `src/app/doctor/dashboard/layout.tsx` - Loads doctor profile from API
- **Updated**: `src/app/doctors/page.tsx` - Fetches doctor list from API
- **Updated**: `src/components/dashboard/EditProfileSection.tsx` - Saves profile updates to API

### 4. Environment Configuration ✅
- **Updated**: `next.config.js` - Exposes `NEXT_PUBLIC_API_URL` environment variable
- **Created**: `.env.local.example` - Template for environment variables

## API Endpoints Used

- `POST /api/auth/login` - User authentication
- `POST /api/auth/signup` - User registration
- `GET /api/doctors` - Get all doctors (public)
- `GET /api/doctors/:id` - Get single doctor
- `PUT /api/doctors/:id` - Update doctor profile (authenticated)

## Backward Compatibility

- Legacy localStorage functions still work as fallback
- `findDoctorByEmail()` maintained for compatibility
- Session format maintained for components that haven't migrated yet
- Appointment requests and referrals remain localStorage-based (no backend endpoints yet)

## Deployment Steps

1. **Set Environment Variable** (optional - defaults to Cloud Run URL):
   ```bash
   # Create .env.local file
   echo "NEXT_PUBLIC_API_URL=https://aip-backend-112180822704.us-central1.run.app" > .env.local
   ```

2. **Build Static Export**:
   ```bash
   npm run build
   ```

3. **Deploy to GoDaddy**:
   - Upload contents of `/out` folder to `public_html` directory

## Testing Checklist

- [x] API client configuration created
- [x] Authentication uses JWT tokens
- [x] Sign-in form calls API
- [x] Sign-up form calls API
- [x] Dashboard loads doctor from API
- [x] Profile updates save to API
- [x] Doctor listing page loads from API
- [x] Error handling implemented
- [x] Fallback to localStorage on API failure
- [x] Environment variable configuration

## Notes

- Admin authentication remains localStorage-based (can be migrated later)
- Appointment requests and referrals remain localStorage-based until backend endpoints are added
- CORS is already configured on backend for `ensembledemospace.com`
- JWT tokens expire after 7 days (configurable via backend)

## Next Steps (Optional)

1. Add backend endpoints for appointment requests
2. Add backend endpoints for referrals
3. Migrate admin authentication to API
4. Add token refresh mechanism
5. Add request retry logic for failed API calls
