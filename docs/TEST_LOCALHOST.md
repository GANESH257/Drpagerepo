# Testing API Integration on Localhost

## Step 1: Start Development Server

```bash
npm run dev
```

Server will start on: `http://localhost:3001`

---

## Step 2: Open Browser Developer Tools

1. Open `http://localhost:3001` in your browser
2. Press `F12` or `Right-click → Inspect` to open Developer Tools
3. Go to **Network** tab (to see API calls)
4. Go to **Console** tab (to see any errors)

---

## Step 3: Test Sign Up (Create Account)

1. Navigate to `/join-us` page
2. Click "Create Account" tab
3. Fill in:
   - Email: `test@example.com`
   - Password: `Test123456` (min 8 characters)
   - Confirm Password: `Test123456`
   - Check "I agree to terms"
4. Click "Create Account"

### What to Check:

**In Network Tab:**
- Look for request to: `https://aip-backend-112180822704.us-central1.run.app/api/auth/signup`
- Status should be `201 Created` (success) or `400` (if email exists)
- Click on the request → **Response** tab should show:
  ```json
  {
    "message": "Account created successfully",
    "userId": "user-..."
  }
  ```

**In Console Tab:**
- Should see no errors
- If error: Check the error message

**Expected Result:**
- Redirects to `/join-us/application` page
- User created in Cloud SQL database

---

## Step 4: Test Sign In

1. Navigate to `/join-us` page
2. Click "Sign In" tab
3. Enter credentials:
   - Email: `test@example.com` (or any user you created)
   - Password: `Test123456`
4. Click "Sign In"

### What to Check:

**In Network Tab:**
- Look for request to: `https://aip-backend-112180822704.us-central1.run.app/api/auth/login`
- Status should be `200 OK` (success) or `401` (invalid credentials)
- Click on the request → **Response** tab should show:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-...",
      "email": "test@example.com",
      "role": "applicant",
      "doctorId": null
    }
  }
  ```

**In Application Tab (Storage):**
- Go to **Application** → **Local Storage** → `http://localhost:3001`
- Should see:
  - `aip_doctor_token` = JWT token string
  - `aip_doctor_user` = User info JSON
  - `aip_doctor_session` = Session object (legacy)

**Expected Result:**
- If user is a doctor: Redirects to `/doctor/dashboard`
- If user is applicant: Shows "Access is available after approval" message
- Token stored in localStorage

---

## Step 5: Test Doctor Dashboard (If Signed In as Doctor)

1. After signing in as a doctor, you should be on `/doctor/dashboard`
2. Check Network tab for API calls

### What to Check:

**In Network Tab:**
- Look for request to: `https://aip-backend-112180822704.us-central1.run.app/api/doctors/[doctor-id]`
- Status should be `200 OK`
- Request Headers should include:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- Response should contain doctor profile data

**Expected Result:**
- Dashboard loads with doctor's profile information
- No errors in console

---

## Step 6: Test Doctor Listing Page

1. Navigate to `/doctors` page
2. Check Network tab

### What to Check:

**In Network Tab:**
- Look for request to: `https://aip-backend-112180822704.us-central1.run.app/api/doctors`
- Status should be `200 OK`
- Response should be an array of doctor objects

**Expected Result:**
- Page displays list of doctors from database
- Doctors load from API (not localStorage)

---

## Step 7: Test Profile Update (If on Dashboard)

1. Navigate to `/doctor/dashboard/profile`
2. Make a change (e.g., update bio)
3. Click "Save Changes"

### What to Check:

**In Network Tab:**
- Look for `PUT` request to: `https://aip-backend-112180822704.us-central1.run.app/api/doctors/[doctor-id]`
- Status should be `200 OK`
- Request should include updated data in body

**Expected Result:**
- Success message appears
- Changes saved to database

---

## Troubleshooting

### Issue: API calls failing with CORS error

**Solution:** CORS is already configured on backend. If you see CORS errors:
- Check that backend URL is correct: `https://aip-backend-112180822704.us-central1.run.app`
- Verify backend is running (check Cloud Run console)

### Issue: 401 Unauthorized

**Possible causes:**
- Token expired or invalid
- User not authenticated
- Token not being sent in request headers

**Solution:**
- Sign out and sign in again
- Check localStorage for `aip_doctor_token`
- Verify token is being included in Authorization header

### Issue: 500 Internal Server Error

**Possible causes:**
- Backend database connection issue
- Backend code error

**Solution:**
- Check backend logs in Cloud Run console
- Verify database is accessible
- Test backend health endpoint: `curl https://aip-backend-112180822704.us-central1.run.app/health`

### Issue: Network request failed

**Possible causes:**
- Internet connection issue
- Backend URL incorrect
- Backend not deployed

**Solution:**
- Check internet connection
- Verify backend URL in `.env.local` or code
- Test backend directly: `curl https://aip-backend-112180822704.us-central1.run.app/health`

---

## Quick Verification Checklist

- [ ] Dev server starts without errors
- [ ] Browser console shows no errors
- [ ] Sign up creates user (check Network tab for 201 response)
- [ ] Sign in returns token (check Network tab for 200 response)
- [ ] Token stored in localStorage
- [ ] Dashboard loads doctor from API (check Network tab)
- [ ] Doctor listing page loads from API
- [ ] Profile updates save to API

---

## Test Backend Directly

You can also test the backend API directly:

```bash
# Health check
curl https://aip-backend-112180822704.us-central1.run.app/health

# Expected response:
# {"status":"ok","database":"connected",...}

# Test login (replace with real credentials)
curl -X POST https://aip-backend-112180822704.us-central1.run.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456"}'
```

---

## Summary

If all checks pass:
✅ Frontend is connecting to Cloud Run backend
✅ API calls are working
✅ Authentication is functional
✅ Data is being saved to Cloud SQL database

You're ready to build and deploy to GoDaddy!
