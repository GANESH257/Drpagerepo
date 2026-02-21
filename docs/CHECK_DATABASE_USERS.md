# How to Check Users in Database

## Method 1: Using GCP Console (Easiest)

1. **Go to GCP Console**: https://console.cloud.google.com/sql/instances
2. **Click** on your Cloud SQL instance: `aip-database`
3. **Click** "Databases" tab (left sidebar)
4. **Click** on database: `aip_production`
5. **Click** "SQL Editor" or "Query" tab
6. **Run this query**:

```sql
SELECT id, email, role, status, created_at 
FROM users 
ORDER BY created_at DESC;
```

This shows all users with their status.

---

## Method 2: Using Cloud Shell (Command Line)

1. **Open Cloud Shell** in GCP Console
2. **Connect to database**:

```bash
gcloud sql connect aip-database --user=postgres --database=aip_production
```

3. **Enter password** when prompted
4. **Run query**:

```sql
SELECT id, email, role, status, created_at 
FROM users 
ORDER BY created_at DESC;
```

5. **To see only active users**:

```sql
SELECT id, email, role, status, created_at 
FROM users 
WHERE status = 'active'
ORDER BY created_at DESC;
```

---

## Method 3: Using psql (If installed locally)

```bash
# Connect to Cloud SQL
psql -h 35.225.60.9 -U postgres -d aip_production

# Enter password when prompted

# Then run:
SELECT id, email, role, status, created_at 
FROM users 
ORDER BY created_at DESC;
```

---

## Quick Queries

### See all users:
```sql
SELECT id, email, role, status, created_at 
FROM users 
ORDER BY created_at DESC;
```

### See only active users:
```sql
SELECT id, email, role, status, created_at 
FROM users 
WHERE status = 'active'
ORDER BY created_at DESC;
```

### See pending users (new signups):
```sql
SELECT id, email, role, status, created_at 
FROM users 
WHERE status = 'pending'
ORDER BY created_at DESC;
```

### Count users by status:
```sql
SELECT status, COUNT(*) as count 
FROM users 
GROUP BY status;
```

### See users with their doctor IDs (if they're doctors):
```sql
SELECT u.id, u.email, u.role, u.status, d.id as doctor_id
FROM users u
LEFT JOIN doctors d ON d.user_id = u.id
ORDER BY u.created_at DESC;
```

---

## Activate a User for Testing

If you want to activate a user for testing:

```sql
-- Activate a specific user by email
UPDATE users 
SET status = 'active', role = 'doctor' 
WHERE email = 'test@example.com';

-- Or activate by user ID
UPDATE users 
SET status = 'active', role = 'doctor' 
WHERE id = 'user-1234567890';
```

**Note**: After activating, you'll also need to create a doctor record if they should be a doctor:

```sql
-- Create doctor record for the user
INSERT INTO doctors (
  id, 
  user_id, 
  full_name, 
  email, 
  specialty, 
  verified, 
  status
) VALUES (
  'doctor-' || extract(epoch from now())::text,  -- Generate unique ID
  'user-1234567890',  -- User ID from users table
  'Test Doctor',  -- Full name
  'test@example.com',  -- Email
  'General Practice',  -- Specialty
  true,  -- Verified
  'active'  -- Status
);
```

---

## Check if User Can Sign In

After activating, test sign-in:
1. Go to `/join-us` page
2. Use the email and password you set during signup
3. Should get `200 OK` response with token
4. Should redirect to dashboard (if doctor) or show approval message (if applicant)

---

## Common Status Values

- `pending` - User signed up but not approved yet
- `active` - User approved and can sign in
- `inactive` - User deactivated
- `suspended` - User suspended

---

## Quick Check Script

If you want to quickly check users from command line:

```bash
# In Cloud Shell
gcloud sql connect aip-database --user=postgres --database=aip_production <<EOF
SELECT email, role, status FROM users ORDER BY created_at DESC LIMIT 10;
EOF
```
