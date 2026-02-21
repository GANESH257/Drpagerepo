# Deploy Frontend to GoDaddy cPanel

Follow these steps to build the frontend and deploy it to GoDaddy (or any cPanel host) without missing anything.

---

## What Gets Deployed

Only the **built static files** go to GoDaddy — no Node.js, no `node_modules`, no source code. After build, everything needed is inside the **`out/`** folder. The deployment ZIP contains exactly the contents of `out/`:

| Item | Description |
|------|-------------|
| `index.html` | Homepage (root) |
| `404.html` | Not-found page |
| `_next/` | Next.js assets (JS, CSS, chunks) — **required** |
| `doctors/` | Doctor directory and profile pages |
| `join-us/` | Join / signup / application flow |
| `doctor/` | Doctor dashboard (after login) |
| `admin/` | Admin dashboard |
| `contact-us/`, `membership/`, `patients/`, `physicians/`, etc. | Other static routes |
| `Icons/`, images, PDFs, etc. | Everything from `public/` (copied into `out/` at build) |

---

## Step 1: Environment (Optional but Recommended)

The backend API URL is **baked in at build time**. If you don’t set it, the app uses the default in `next.config.js`:

- Default: `https://aip-backend-112180822704.us-central1.run.app`

To use a **different backend URL** (e.g. your own Cloud Run URL):

1. In the **project root** (same folder as `package.json`), create a file named **`.env.local`**.
2. Add one line (replace with your URL if needed):

   ```env
   NEXT_PUBLIC_API_URL=https://aip-backend-112180822704.us-central1.run.app
   ```

3. Save the file. **Do not** upload `.env.local` to GoDaddy — it’s only used when you run `npm run build`. The value is embedded into the built JS.

Other optional variables (only if you use them):

- `NEXT_PUBLIC_BASE_PATH` — e.g. `/myapp` if the site is at `yourdomain.com/myapp`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — for maps (if used)

---

## Step 2: Build and Create the ZIP

On your computer, in the project root:

```bash
# Option A: Run the script directly
chmod +x build-and-zip-for-godaddy.sh   # first time only
./build-and-zip-for-godaddy.sh

# Option B: Use npm script
npm run deploy:godaddy
```

This script will:

1. Use `.env.local` if present (for `NEXT_PUBLIC_*`).
2. Run `npm install` if `node_modules` is missing.
3. Run `npm run build` (creates/updates `out/`).
4. Create **`aip-frontend-godaddy.zip`** with the **entire contents** of `out/`.

The ZIP is created in the project root. If `zip` is not installed, the script creates a `.tar.gz` instead; you can extract it and re-zip in cPanel if needed.

---

## Step 3: Upload to GoDaddy cPanel

1. Log in to **GoDaddy cPanel** for your domain.
2. Open **File Manager**.
3. Go to **`public_html`** (or the folder that serves your domain root).
4. **Backup**: If you already have a site, download or rename the current contents.
5. **Upload** the file **`aip-frontend-godaddy.zip`** into `public_html`.
6. In File Manager, **right‑click the ZIP** → **Extract** (or use the Extract button).
7. Choose to extract **into the current directory** (`public_html`).
8. After extraction you should see:
   - `index.html` in the root of `public_html`
   - `_next/` folder
   - `doctors/`, `join-us/`, `admin/`, etc.
9. **Delete** the uploaded `aip-frontend-godaddy.zip` from the server after a successful extract (to save space).

**Important:** Extract so that `index.html` is **directly inside** `public_html`, not inside a subfolder. If you extract and get `public_html/aip-frontend-godaddy/index.html`, move everything from that subfolder up into `public_html`.

---

## Step 4: Verify

1. Open your domain in the browser: `https://yourdomain.com`
2. Check:
   - Homepage loads.
   - Navigate to `/doctors/`, `/join-us/`, etc.
   - Login (Join Us → login or application flow) and ensure API calls work (backend URL was set at build time in Step 1).

---

## Troubleshooting

| Problem | What to do |
|--------|------------|
| 404 on every page | Ensure `index.html` and `_next/` are in the **root** of `public_html`, not in a subfolder. |
| Blank page / JS errors | Confirm you extracted the **contents** of the ZIP into `public_html`, not the ZIP itself. Check browser console for 404s to missing files under `_next/`. |
| API calls fail (login, dashboard) | Rebuild with the correct `NEXT_PUBLIC_API_URL` in `.env.local`, then re-run the build script and re-upload the new ZIP. |
| “zip: command not found” | Script will create a `.tar.gz`. Extract it locally or in cPanel; some panels accept `.tar.gz` for extract. |
| Build fails | Run `npm run build` manually and fix any errors (e.g. missing deps: `npm install`). Then run `./build-and-zip-for-godaddy.sh` again. |

---

## Quick Checklist

- [ ] `.env.local` created (if you need a custom backend URL) with `NEXT_PUBLIC_API_URL=...`
- [ ] `./build-and-zip-for-godaddy.sh` run successfully
- [ ] `aip-frontend-godaddy.zip` (or `.tar.gz`) created in project root
- [ ] ZIP uploaded to cPanel `public_html`
- [ ] ZIP extracted so `index.html` and `_next/` are in `public_html` root
- [ ] Old ZIP removed from server after extract
- [ ] Site and key routes tested in the browser

You’re done. The frontend is deployed and will use the backend URL that was set at build time; no `.env` is needed on GoDaddy.
