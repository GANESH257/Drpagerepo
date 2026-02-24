# New GCP Deployment Checklist

Use this when you have a **new GCP project** with Cloud SQL tables already created (from `CLOUD_SQL_FULL_FRESH_SETUP.sql`) and need to connect everything.

---

## 1. Set Admin Password in Cloud SQL

The setup script inserts an admin user with a placeholder hash. You must replace it before login will work.

**Option A: Run this in Cloud SQL Studio**

1. Generate a bcrypt hash locally:
   ```bash
   cd aip-backend
   node -e "const bcrypt=require('bcrypt');bcrypt.hash('Admin@12345',10).then(h=>console.log(h));"
   ```
2. Copy the output (e.g. `$2b$10$...`).
3. In Cloud SQL Studio, run:
   ```sql
   UPDATE users 
   SET password_hash = 'PASTE_YOUR_BCRYPT_HASH_HERE',
       updated_at = NOW()
   WHERE email = 'admin@aip.com';
   ```
4. Replace `PASTE_YOUR_BCRYPT_HASH_HERE` with the hash from step 1.

**Default admin credentials after this:** `admin@aip.com` / `Admin@12345` — change in production.

---

## 2. Get Your New Cloud SQL Connection Details

From GCP Console → SQL → your instance:

- **Public IP** (for local testing): Connections → copy the IP
- **Database name**: usually `postgres` or the one you created (e.g. `aip_production`)
- **User**: `postgres` or your DB user
- **Password**: the one you set when creating the instance

**Authorized networks:** Add your machine’s IP under Connections → Authorized networks so the backend can connect.

---

## 3. Update Backend `.env`

Edit `aip-backend/.env`:

```env
# Database — use your NEW Cloud SQL instance
DB_HOST=YOUR_NEW_CLOUD_SQL_PUBLIC_IP
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=YOUR_DB_PASSWORD

# JWT — use a strong secret in production
JWT_SECRET=your-super-secret-key-min-32-characters-long-change-this

# CORS — your frontend URL (or http://localhost:3000 for local dev)
FRONTEND_URL=http://localhost:3000
FRONTEND_URL_WWW=http://localhost:3000

# Server
PORT=8080
NODE_ENV=development
```

Replace `YOUR_NEW_CLOUD_SQL_PUBLIC_IP`, `YOUR_DB_PASSWORD`, and `DB_NAME` if different.

---

## 4. Test Database Connection

```bash
cd aip-backend
node test-db-connection.js
```

You should see: `✅ SUCCESS: Database connected!`

If it fails:
- Confirm your IP is in Cloud SQL **Authorized networks**
- Check `DB_HOST`, `DB_PASSWORD`, `DB_NAME`, `DB_USER`
- Ensure the instance is running

---

## 5. Start Backend and Test Admin Login

```bash
cd aip-backend
npm run dev
```

In another terminal, or in the browser:

1. Set frontend to use local backend:
   ```bash
   echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env.local
   ```
2. Start frontend:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000/admin/login`
4. Log in with `admin@aip.com` / `Admin@12345`

If login works, the backend and database are correctly configured.

---

## 6. Deploy Backend to Cloud Run (New GCP)

When ready for production:

1. Build and push the Docker image to your new GCP project’s Artifact Registry.
2. Deploy to Cloud Run with:
   - **Cloud SQL connection**: `--add-cloudsql-instances PROJECT:REGION:INSTANCE`
   - **Env vars**: `DB_SOCKET_PATH=/cloudsql/PROJECT:REGION:INSTANCE`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `FRONTEND_URL`, `FRONTEND_URL_WWW`
3. Get the Cloud Run service URL.
4. Update frontend `.env.local` (or build env): `NEXT_PUBLIC_API_URL=https://YOUR-CLOUD-RUN-URL`
5. Rebuild and deploy the frontend.

---

## Quick Reference

| Step | What | Status |
|------|------|--------|
| 1 | Set admin password in Cloud SQL | ☐ |
| 2 | Get Cloud SQL IP, DB name, user, password | ☐ |
| 3 | Update `aip-backend/.env` | ☐ |
| 4 | Run `node test-db-connection.js` | ☐ |
| 5 | Start backend, test admin login | ☐ |
| 6 | Deploy to Cloud Run (when ready) | ☐ |
