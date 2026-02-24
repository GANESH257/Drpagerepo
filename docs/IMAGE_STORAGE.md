# Image storage: doctors, practices, badges & awards

## Where images are stored

| What | Database | File storage |
|------|----------|--------------|
| **Doctor profile photo** | `doctors.profile_image_url` (path like `/uploads/photo-123.jpg`) | Backend disk: `UPLOAD_DIR` (default `./uploads`) |
| **Practice logo** | `practices.logo_url` | Same: `UPLOAD_DIR` |
| **Badges & awards** | `doctors.badges_awards` JSON array; each item can have `imageUrl` (same path style) | Same: `UPLOAD_DIR` |
| **Board certifications** | `doctors.board_certifications` JSON; each item can have `imageUrl` | Same: `UPLOAD_DIR` |

- **Upload flow:** Frontend calls `POST /api/upload` with the image file (auth required). Backend saves the file under `UPLOAD_DIR` and returns a path (e.g. `/uploads/filename.jpg`). The frontend then saves that path in the relevant place (doctor profile, practice logo, or inside certification/badge item `imageUrl`).
- **Serving:** The backend serves files from `UPLOAD_DIR` at the `/uploads` route (see `app.use('/uploads', express.static(uploadDir))` in `aip-backend/src/index.ts`). The frontend builds the full image URL as `API_BASE_URL + path` (e.g. `getUploadFullUrl(path)`).

## Why images disappear when you restart

The **database keeps the path** (e.g. `profile_image_url`, `logo_url`, `imageUrl`), but the **file lives only on the server’s filesystem**. If that filesystem is not persistent, the file is gone after a restart.

Typical cases:

1. **Containers (Docker, Cloud Run, etc.)**  
   The app runs in a container whose filesystem is ephemeral. Anything written to `./uploads` is lost when the container stops or is replaced. So after restart/deploy, the DB still points to `/uploads/xyz.jpg`, but the file no longer exists → broken images.

2. **Different working directory**  
   If you start the backend from a different folder, `process.cwd()` changes and the default `UPLOAD_DIR` points somewhere else. Old uploads are no longer in that folder.

3. **Clean /tmp or temp directories**  
   If `UPLOAD_DIR` (or `process.cwd()`) is set to a temp directory that the OS or platform clears on restart, uploads are removed.

So you “lose” images because the **files** are gone; the **paths** in the DB remain.

## How to fix it (persistent images)

### Option A: Persistent directory on the server

- Set **`UPLOAD_DIR`** to a path that is **not** wiped on restart (e.g. a volume in Docker, or a directory that survives deploys).
- Example (Docker): mount a volume at `/data/uploads` and set `UPLOAD_DIR=/data/uploads`.
- Example (local): set `UPLOAD_DIR=/var/app/uploads` (or any path that is not inside a temp or build directory).

Then the same server (or same volume) always has the files, so images survive restarts.

### Option B: Cloud storage (recommended for production)

- Store files in **Google Cloud Storage (GCS)** or **S3** instead of local disk.
- After upload, save the **public URL** (e.g. `https://storage.googleapis.com/...`) in the database instead of `/uploads/...`.
- No dependency on the server’s local disk; images persist across restarts and deploys.

The current code does **not** implement GCS/S3; it only uses local disk. Adding cloud storage would require changes in `aip-backend/src/routes/upload.ts` (and optionally env vars for bucket name and credentials).

## Summary

- **Doctors:** profile image path in `doctors.profile_image_url`; file in `UPLOAD_DIR`.
- **Practices:** logo path in `practices.logo_url`; file in `UPLOAD_DIR`.
- **Badges/awards/certifications:** image paths in JSON `imageUrl`; files in `UPLOAD_DIR`.
- **Why they’re lost on restart:** Uploaded files are only on local/container disk; if that storage is ephemeral, files disappear while DB paths remain.
- **Fix:** Use a persistent `UPLOAD_DIR` (e.g. volume) or move to cloud storage and store public URLs in the DB.
