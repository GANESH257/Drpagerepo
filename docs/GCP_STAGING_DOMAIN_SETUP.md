# GCP Setup: Serve Site at https://staging.aipstl.org (Instead of localhost:3001)

This doc lists **every place** to change (inside the repo and in GCP) so the site works at **https://staging.aipstl.org**.

---

## 1. Architecture (quick reference)

| Component | Where it runs | URL |
|-----------|----------------|-----|
| **Frontend** (Next.js) | Firebase Hosting (staging.aipstl.org) | **https://staging.aipstl.org** |
| **Backend** (Node/Express API) | GCP Cloud Run | e.g. **https://aip-backend-112180822704.us-central1.run.app** |
| **Database** | GCP Cloud SQL (PostgreSQL) | Internal; no public URL. Backend connects via env vars. |

- **staging.aipstl.org** = the *frontend* URL users see.
- **Cloud SQL** holds data; no “URL” to change for the domain. Only connection env vars (used by the backend).
- **Backend** must allow requests *from* `https://staging.aipstl.org` (CORS). That’s done via backend env vars and/or code.

---

## 2. Changes OUTSIDE the repo (GCP / hosting)

### 2.1 Backend: Cloud Run env vars

So the API accepts requests from the browser at **https://staging.aipstl.org**, set:

| Variable | Value | Notes |
|----------|--------|--------|
| `FRONTEND_URL` | `https://staging.aipstl.org` | Required for CORS from staging. |
| `FRONTEND_URL_WWW` | `https://www.staging.aipstl.org` | Only if you use www.staging. |

**Where to set:**  
GCP Console → **Cloud Run** → select your backend service → **Edit & deploy new revision** → **Variables & secrets** → add/update the above.

Or when deploying with `deploy-to-gcp.sh`, when prompted for “frontend URL” enter:  
`https://staging.aipstl.org`

**No changes needed in Cloud SQL** for the domain. Cloud SQL is only connected by the backend using:

- `DB_SOCKET_PATH` or `DB_HOST` (Cloud SQL connection)
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`

Those stay as they are for your existing instance; they don’t reference staging.aipstl.org.

### 2.2 Frontend: Firebase Hosting (staging.aipstl.org)

The staging frontend is a **Firebase app** (Firebase Hosting). Do the following.

#### A. Set API URL at build time

`NEXT_PUBLIC_API_URL` is baked into the client bundle at **build** time. Set it before building the app you deploy to staging.

**Option 1 – .env.production (recommended)**  
Create or edit `.env.production` in the project root:

```bash
NEXT_PUBLIC_API_URL=https://aip-backend-112180822704.us-central1.run.app
```

Then run `npm run build`. The built files in `out/` will use this URL.

**Option 2 – Inline when building**

```bash
NEXT_PUBLIC_API_URL=https://aip-backend-112180822704.us-central1.run.app npm run build
```

(Use your real backend URL if different.)

#### B. Build and deploy to Firebase Hosting

1. **Build** (from project root): `npm run build` → produces static export in `out/`.
2. **Configure Firebase:** In `firebase.json`, set hosting `public` to `out` (for Next.js static export). Example:
   ```json
   { "hosting": { "public": "out", "ignore": ["firebase.json", "**/.*", "**/node_modules/**"] } }
   ```
3. **Deploy:** `firebase deploy` or `firebase deploy --only hosting`.

#### C. Custom domain staging.aipstl.org

Firebase Console → your project → **Hosting** → **Add custom domain** → enter **staging.aipstl.org** → add the A/AAAA or CNAME records Firebase shows. After DNS propagates, the site is served at **https://staging.aipstl.org**.

**Summary for Firebase:** Set `NEXT_PUBLIC_API_URL` → build → deploy to Firebase Hosting → add custom domain **staging.aipstl.org**. Backend CORS is set in Cloud Run (`FRONTEND_URL`) so the API accepts requests from staging.

### 2.3 Summary: “Outside” checklist

- [ ] **Cloud Run (backend):** Set `FRONTEND_URL=https://staging.aipstl.org` (and `FRONTEND_URL_WWW` if you use www).
- [ ] **Cloud SQL:** No change for staging domain; keep existing connection env vars.
- [ ] **Frontend hosting (Firebase):** Build with `NEXT_PUBLIC_API_URL` set → deploy to Firebase Hosting → add custom domain **staging.aipstl.org** in Firebase Console.

---

## 3. Changes INSIDE the repo (env and code)

### 3.1 Frontend env (build-time / runtime)

The frontend only needs to know the **backend API** URL. The *site* URL (staging.aipstl.org) is where you deploy the built app; it doesn’t require a separate “site URL” env in this codebase.

| File | Variable | Value | When |
|------|----------|--------|------|
| `.env.local` (local dev) | `NEXT_PUBLIC_API_URL` | `https://aip-backend-112180822704.us-central1.run.app` (or your backend URL) | So localhost:3001 calls the same API as staging. |
| **Staging build / deploy** | `NEXT_PUBLIC_API_URL` | Same backend URL as above | Set in your **staging** build (e.g. in CI or in your hosting’s env for the staging environment). |

So:

- **For localhost:3001:** use `.env.local` with `NEXT_PUBLIC_API_URL=<backend URL>`.
- **For https://staging.aipstl.org:** build the frontend with the **same** `NEXT_PUBLIC_API_URL` and deploy that build wherever staging.aipstl.org points. No “staging.aipstl.org” variable is required in the frontend.

Example **.env.local** (same for local and to mirror what staging should use):

```bash
NEXT_PUBLIC_API_URL=https://aip-backend-112180822704.us-central1.run.app
```

Optional (if you use them):

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
NEXT_PUBLIC_BASE_PATH=
```

### 3.2 Backend env (local / reference only)

Backend env in the repo is only for **local runs** or as a reference. On GCP, values come from **Cloud Run** (see §2.1).

| File | Variable | Example value (staging) |
|------|----------|--------------------------|
| `aip-backend/.env` (if you use it) | `FRONTEND_URL` | `https://staging.aipstl.org` |
| | `FRONTEND_URL_WWW` | `https://www.staging.aipstl.org` |
| | `DB_HOST` or `DB_SOCKET_PATH` | (unchanged; your Cloud SQL connection) |
| | `DB_NAME`, `DB_USER`, `DB_PASSWORD` | (unchanged) |
| | `JWT_SECRET`, `PORT`, etc. | (unchanged) |

`aip-backend/.env.example` is already the template; for staging you only “change” the frontend URL in real env (GCP or local .env).

### 3.3 Backend CORS (code)

**File:** `aip-backend/src/middleware/cors.ts`

Staging is already allowed in code:

- `https://staging.aipstl.org`
- `https://www.staging.aipstl.org`
- `http://localhost:3000` and `http://localhost:3001`

So even if `FRONTEND_URL` is not set in Cloud Run, staging still works. For production you should set `FRONTEND_URL` (and optionally `FRONTEND_URL_WWW`) in Cloud Run so CORS is explicit and you can restrict to your real domain.

**No SQL changes** are required for “seeing the site at staging.aipstl.org”. SQL only stores application data; the domain is a frontend/hosting and CORS concern.

---

## 4. Summary table: what to change for staging.aipstl.org

| Where | What to change |
|-------|----------------|
| **GCP Cloud Run (backend)** | Set `FRONTEND_URL=https://staging.aipstl.org` (and `FRONTEND_URL_WWW` if needed). |
| **GCP Cloud SQL** | Nothing for the domain. |
| **Firebase Hosting (frontend)** | Set `NEXT_PUBLIC_API_URL` at build time → `npm run build` → `firebase deploy` → add custom domain **staging.aipstl.org** in Firebase Console. |
| **Frontend build (staging)** | Set `NEXT_PUBLIC_API_URL` to your backend URL (same as or similar to .env.local). |
| **Repo: .env.local** | `NEXT_PUBLIC_API_URL=<backend URL>` (for local dev that matches staging API). |
| **Repo: aip-backend/.env** | Optional local backend: `FRONTEND_URL=https://staging.aipstl.org`. |
| **Repo: aip-backend CORS** | Already includes staging; no change required. |
| **SQL / migrations** | No changes. |

---

## 5. Quick test

1. Open **https://staging.aipstl.org** — site loads (frontend).
2. Log in or use a feature that calls the API — no CORS errors (backend allows staging).
3. If CORS errors appear, re-check Cloud Run env: `FRONTEND_URL=https://staging.aipstl.org` and redeploy the backend.
