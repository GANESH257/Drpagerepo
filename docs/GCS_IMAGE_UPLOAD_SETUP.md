# Google Cloud Storage (GCS) for image uploads – setup and implementation

This guide walks you from zero to having the backend store doctor/practice/badge images in GCS and return public URLs. The frontend already supports full URLs (e.g. `getUploadFullUrl` uses URLs as-is when they start with `http`), so no frontend changes are required.

---

## Part 1: Google Cloud setup

### 1.1 Create or select a GCP project

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one (e.g. your production project).
3. Note the **Project ID** (e.g. `my-app-prod-12345`). You’ll use it as `GCS_PROJECT_ID` (optional if using Application Default Credentials).

### 1.2 Enable the Cloud Storage API

1. In the console, open **APIs & Services** → **Library** (or go to [Enable APIs](https://console.cloud.google.com/apis/library)).
2. Search for **Cloud Storage API**.
3. Open it and click **Enable**.

### 1.3 Create a storage bucket

1. Go to **Cloud Storage** → **Buckets** ([direct link](https://console.cloud.google.com/storage/browser)).
2. Click **Create bucket**.
3. Choose:
   - **Name:** globally unique (e.g. `my-app-uploads-prod`). This will be `GCS_BUCKET`.
   - **Location type:** Region (recommended) or Multi-region; pick a region close to your app.
   - **Storage class:** Standard.
   - **Access control:** **Uniform** (recommended).
   - **Public access:** We’ll make only the uploads folder public in the next step (or per-object in code).
4. Click **Create**.

### 1.4 Make uploaded objects publicly readable (for simple public URLs)

You have two options.

**Option A – Make the whole bucket public (simplest for “uploads” only buckets)**

1. Open your bucket → **Permissions**.
2. Click **Grant access**.
3. **New principals:** `allUsers`.
4. **Role:** **Cloud Storage** → **Storage Object Viewer**.
5. Save. Confirm the warning (bucket contents will be publicly readable).

**Option B – Keep bucket private; make each object public in code (recommended)**

- No console change. The backend will call `file.makePublic()` after each upload so only uploaded objects are public. The code in this repo does Option B by default.

### 1.5 Create a service account for the backend

1. Go to **IAM & Admin** → **Service accounts** ([link](https://console.cloud.google.com/iam-admin/serviceaccounts)).
2. Click **Create service account**.
3. **Name:** e.g. `aip-backend-upload`.
4. Click **Create and continue**.
5. **Grant access (optional):** Add role **Cloud Storage** → **Storage Object Admin** (so it can create/delete objects and optionally make them public). For minimal permissions use **Storage Object Creator** and ensure the code only uploads; making public may require **Storage Object Viewer** on the bucket for the signed URL path, but for public URLs with `makePublic()` you typically need **Storage Object Admin** or a custom role that includes `storage.objects.create` and `storage.objects.setIamPolicy` (for makePublic). Easiest: **Storage Object Admin** for the bucket.
6. Click **Done**.

### 1.6 Create and download a key for the service account

1. Open the service account you created.
2. **Keys** tab → **Add key** → **Create new key**.
3. Choose **JSON** → **Create**. A JSON file downloads (e.g. `my-project-xxxxx.json`).
4. Store this file somewhere safe and **never commit it to git**. For example:
   - **Local:** e.g. `aip-backend/config/gcs-key.json` and add `config/gcs-key.json` to `.gitignore`.
   - **Production (Cloud Run / GCE):** use Secret Manager or set `GOOGLE_APPLICATION_CREDENTIALS` to a path injected by your deployment (e.g. secret mounted as file).

### 1.7 (Optional) Use a dedicated “uploads” prefix in the bucket

- Object names will be like `uploads/photo-1234567890.jpg`. This keeps all app uploads under one prefix; you can set lifecycle rules or list/delete by prefix later. The implementation uses the prefix `uploads/` by default (configurable).

---

## Part 2: Backend configuration

### 2.1 Environment variables

Set these in `.env` (local) or in your deployment (Cloud Run, etc.):

| Variable | Required | Description |
|----------|----------|-------------|
| `GCS_BUCKET` | Yes (for GCS) | Bucket name (e.g. `my-app-uploads-prod`). |
| `GCS_PROJECT_ID` | No* | GCP project ID. Optional if using Application Default Credentials (e.g. on Cloud Run). |
| `GOOGLE_APPLICATION_CREDENTIALS` | No* | Path to the service account JSON key file. Optional on GCP (ADC); **required** when running locally with a key file. |
| `UPLOAD_STORAGE` | No | `gcs` = use GCS; unset or `local` = use local disk (`UPLOAD_DIR`). |

\* When running **locally**, you must either set `GOOGLE_APPLICATION_CREDENTIALS` to the key file path or run `gcloud auth application-default login` so ADC is set.  
When running on **Cloud Run** (or GCE), ADC is usually set automatically; you only need to give the Cloud Run service account the right Storage role (see below).

**Example `.env` (local, GCS):**

```bash
GCS_BUCKET=my-app-uploads-prod
GCS_PROJECT_ID=my-app-prod-12345
GOOGLE_APPLICATION_CREDENTIALS=./config/gcs-key.json
UPLOAD_STORAGE=gcs
```

**Example (Cloud Run):** Set only `GCS_BUCKET` and `UPLOAD_STORAGE=gcs`; grant the Cloud Run service account **Storage Object Admin** (or equivalent) on the bucket. No key file needed.

### 2.2 Dependencies

In `aip-backend`:

```bash
npm install @google-cloud/storage
```

Already added in this repo.

### 2.3 Code behavior

- **`UPLOAD_STORAGE=gcs` and `GCS_BUCKET` set:**  
  - Multer uses **memory storage** (no local file).  
  - After upload, the backend sends the buffer to GCS under the object name `uploads/<sanitized-name>-<timestamp>.<ext>`.  
  - Then it calls `file.makePublic()` (Option B above) and returns the public URL:  
    `https://storage.googleapis.com/<bucket>/uploads/<filename>`.  
  - Response: `{ "url": "https://storage.googleapis.com/..." }`. The frontend uses this as-is.

- **Otherwise (local):**  
  - Same as before: file is written to `UPLOAD_DIR`, response is `{ "url": "/uploads/<filename>" }`.  
  - Frontend continues to use `getUploadFullUrl(path)` (prepends `API_BASE_URL` for non-`http` URLs).

---

## Part 3: Deployment (e.g. Cloud Run)

### 3.1 Cloud Run service account

1. In **Cloud Run** → your service → **Security** (or **Edit & deploy**), note the **Service account** (e.g. `xxxxx@project.iam.gserviceaccount.com`).
2. In **IAM & Admin** → **IAM**, find that service account (or add it).
3. Grant it **Cloud Storage** → **Storage Object Admin** on the bucket (or a custom role with create + setIamPolicy for the bucket).  
   Alternatively, in **Cloud Storage** → your bucket → **Permissions**, add the Cloud Run service account with **Storage Object Admin**.

### 3.2 Set env vars in Cloud Run

In the Cloud Run service:

- `GCS_BUCKET` = your bucket name  
- `UPLOAD_STORAGE` = `gcs`  
- (Optional) `GCS_PROJECT_ID` = your project ID  

Do **not** set `GOOGLE_APPLICATION_CREDENTIALS`; Cloud Run uses ADC.

### 3.3 CORS (if frontend is on another domain)

If your frontend is on a different origin (e.g. `https://myapp.com`) and you load images from `https://storage.googleapis.com/...`, the browser may enforce CORS when you use images in `<img>` or canvas. For plain `<img src="https://...">`, CORS usually does not block. If you need to fetch the image via JavaScript or use CORS-dependent features, configure CORS on the bucket:

1. [Configure CORS on the bucket](https://cloud.google.com/storage/docs/configuring-cors) (e.g. allow your frontend origin and `GET`).
2. The backend does not need to send CORS headers for the image URL; the browser requests the URL from GCS directly.

---

## Part 4: Checklist

- [ ] GCP project created / selected  
- [ ] Cloud Storage API enabled  
- [ ] Bucket created; name noted as `GCS_BUCKET`  
- [ ] Service account created; key JSON downloaded and stored safely  
- [ ] `GOOGLE_APPLICATION_CREDENTIALS` set (local) or ADC used (Cloud Run)  
- [ ] `GCS_BUCKET` and `UPLOAD_STORAGE=gcs` set in backend env  
- [ ] Backend restarted; upload an image and confirm response has `https://storage.googleapis.com/...`  
- [ ] In DB, `profile_image_url` / `logo_url` / `imageUrl` contain the full GCS URL  
- [ ] Frontend shows the image (no change needed if it already handles `http` URLs)  
- [ ] For production: Cloud Run service account has Storage Object Admin (or equivalent) on the bucket  

---

## Part 5: Switching back to local storage

Set `UPLOAD_STORAGE=local` (or unset it) and ensure `UPLOAD_DIR` is set if needed. New uploads will go to disk again. Existing DB URLs that are full GCS URLs will still work in the frontend.

---

## Reference: response format

- **Local:** `{ "url": "/uploads/photo-1234567890.jpg" }` → frontend uses `API_BASE_URL + url`.  
- **GCS:** `{ "url": "https://storage.googleapis.com/your-bucket/uploads/photo-1234567890.jpg" }` → frontend uses `url` as-is.

The frontend’s `getUploadFullUrl(pathOrUrl)` already treats any string starting with `http` as a full URL and returns it unchanged, so both formats work without code changes.
