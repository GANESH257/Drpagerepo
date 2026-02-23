# Practice locations and showing practices on the map

## How locations work today

### 1. Where locations are stored

- **Database:** `practice_locations` has address fields (`address_line1`, `city`, `state`, `zip`, `phone`) and **`latitude`**, **`longitude`** (and `directions_url`). So the schema supports coordinates for maps.
- **Backend:** When creating or updating locations (approval side effects or location approval types), the code currently **does not save** `latitude`/`longitude`. Only address text is persisted, so coordinates are always NULL unless we change this.

### 2. Where locations are added

| Flow | Where | Coordinates today |
|------|--------|-------------------|
| **Complete-profile (new PA)** | `/doctor/dashboard/complete-profile` Step 2 | One “Primary location address” (name, line1, city, state, zip). **No lat/lng** collected or sent. |
| **After activation – Manage Locations** | `/doctor/dashboard/practice/locations` | PA can add/edit/remove locations. Form has **ZIP geocoding** (`geocodeZip`) to set lat/lng. Submits `practice_location_add_request` (or edit/remove). Backend **does not persist** lat/lng on INSERT. |
| **Admin approval** | Approval side effects | Create/replace `practice_locations` with address only; no latitude/longitude. |

### 3. How the map / distance features use locations

- **Frontend** expects each location to have **`lat`** and **`lng`** (see `PracticeLocation` in `src/types/practice.ts`, `practiceDirectoryService.ts` for distance and “practice has coords”).
- **Distance / “near me”:** `practiceDirectoryService` uses `locations[].lat` and `locations[].lng` for radius search and distance; if they’re missing, the practice is excluded from distance-based results.
- **Display:** Doctor profile and practice pages show locations (address, MapPin, directions link). A real map widget would use the same lat/lng.

So: **practices can only be shown on a map (or used in distance search) if each location has latitude and longitude stored and exposed.**

---

## How to add locations and show practice on the map

### Option A – After activation (current UX, once backend persists coords)

1. PA goes to **Dashboard → Practice → Locations** (or “Manage Locations”).
2. Clicks **Add location**, fills name, address, city, state, **ZIP**, phone, etc.
3. Uses **“Set from ZIP”** (or ZIP blur) to run **geocoding** (`geocodeZip` from `geocodingService`): ZIP → lat/lng, stored in form state.
4. Submits a **practice_location_add_request** (or edit) with `location.lat` and `location.lng`.
5. **Backend** must **persist** `latitude` and `longitude` when inserting/updating `practice_locations` (see “Backend changes” below).
6. Once saved, that location has coords → practice can show on map and in “near me” search.

So: **they add a location** via the existing Locations page; **we enable map display** by ensuring the backend saves and returns lat/lng for those locations.

### Option B – At completion (first location has coords from day one)

1. On **complete-profile** Step 2, keep the single “Primary location address” (name, line1, city, state, zip).
2. Before submit (e.g. on “Set location for map” or when ZIP is filled), call **geocoding** (same `geocodeZip` or a full-address geocode) and store lat/lng in state.
3. Send in the completion payload **one location** with `address_line1`, `city`, `state`, `zip`, and **`latitude`**, **`longitude`**.
4. **Backend** in `practice_admin_profile_practice_completion` INSERTs into `practice_locations` **including** `latitude` and `longitude` when present.
5. First location then has coords immediately after admin approval, so the practice can show on the map without a second step.

---

## What needs to change in code

### Backend (required for map to work)

- In **all** places that INSERT or UPDATE `practice_locations`, include **`latitude`** and **`longitude`** when the payload contains them:
  - `practice_admin_profile_practice_completion` (replace locations).
  - `practice_location_add_request` (single location add).
  - `practice_location_edit_request` (single location update).
  - `practice_location_change_request` (bulk replace).
  - `new_practice_with_admin_doctor` (first main office location) if you want that one on the map too.
- API already returns `practice_locations` rows; Postgres columns are `latitude` / `longitude`. Frontend should treat `loc.lat ?? loc.latitude` and `loc.lng ?? loc.longitude` so map/distance code works.

### Frontend – complete-profile (optional but recommended)

- In **complete-profile** Step 2, add a way to set coordinates for the primary location (e.g. “Set location for map” that calls `geocodeZip(practiceAddress.zip)` and stores result in state).
- Include **latitude** and **longitude** in the **locations** array sent in `practice_admin_profile_practice_completion` payload so the first location is saved with coords.

### Frontend – normalization

- When reading practice from API, normalize each location so that `lat` / `lng` exist (e.g. `lat: loc.lat ?? loc.latitude`, `lng: loc.lng ?? loc.longitude`) so existing map/distance logic keeps working with the backend’s snake_case columns.

---

## Geocoding

- **Service:** `src/lib/services/geocodingService.ts` – `geocodeZip(zip)` returns `{ lat, lng, label }`.
- Uses static ZIP→coords data first, then **Google Geocoding API** if `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set.
- For **ZIP-only** geocoding (good enough for “show on map” and radius search), use `geocodeZip`. For more precise placement, you could add a full-address geocode (same API, different query) later.

---

## Summary

- **How they add a location:** Either in **complete-profile** (one primary location) or later in **Dashboard → Practice → Locations** (multiple locations, with “Set from ZIP” for coords).
- **How the practice can be shown on the map:** Each location must have **latitude and longitude** stored in `practice_locations` and exposed as `lat`/`lng` to the frontend. That requires:
  1. **Backend** to save `latitude`/`longitude` on every location INSERT/UPDATE when provided.
  2. **Frontend** to send lat/lng (e.g. from geocoding) and to normalize API locations to `lat`/`lng` for map and distance features.

## Implemented changes

- **Backend:** All `practice_locations` INSERTs/UPDATEs (practice_admin_profile_practice_completion, practice_location_add_request, practice_location_edit_request, practice_location_change_request) now persist `latitude` and `longitude` when present in the payload.
- **Complete-profile:** Step 2 geocodes the primary location from ZIP (via `geocodeZip`) before submit and sends `latitude`/`longitude` in the locations payload so the first location can show on the map after approval.
- **Frontend:** `practiceDirectoryService` normalizes API locations so `lat`/`lng` are set from `latitude`/`longitude`, and `address` from `address_line1` when needed.

**Note:** If your database was created from `aip-backend/migrations/001_approval_requests_schema.sql` only, the `practice_locations` table may not have `latitude`/`longitude` columns. Add them (e.g. `ALTER TABLE practice_locations ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8), ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);`) or use `docs/GCP_FULL_SETUP.sql` which includes them.
