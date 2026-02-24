# AIP Doctor Portal UI

Standalone **doctor portal** UI: a React + Vite + Tailwind app that lives inside this repo at `public/aip-doctor-portal-ui/`. It is a **separate app** from the main Next.js site (EnsembleDrPage).

---

## What This Project Is

| Aspect | Details |
|--------|---------|
| **Purpose** | Doctor-facing portal: dashboard, referrals, announcements, community, practice, profile, settings. |
| **Stack** | React 19, Vite 7, TypeScript, Tailwind CSS 4, Radix UI, wouter (routing), Framer Motion, Recharts. |
| **Structure** | Single `client/` app; `package.json` and scripts at repo root of this folder. |
| **Data** | Largely **mock/local** in `Portal.tsx` (e.g. `DOCTOR`, `PHYSICIANS`, `REFERRALS`, `ANNOUNCEMENTS`). No backend wired by default. |
| **Routes** | `/` and `/portal` → `Portal.tsx`; `/404` → `NotFound`. |
| **Theme** | Dark/light via `ThemeContext`; default dark, switchable. |

---

## Folder Layout

```
public/aip-doctor-portal-ui/
├── package.json          # Deps + scripts (dev, build, preview). Uses pnpm.
├── vite.config.ts        # Root = client, alias @ → client/src (added so app can run standalone)
├── client/
│   ├── index.html        # Entry HTML; script points to /src/main.tsx
│   ├── public/           # Static assets (e.g. __manus__)
│   └── src/
│       ├── main.tsx      # React root
│       ├── App.tsx       # Router + Theme + Toaster
│       ├── index.css     # Tailwind + theme variables
│       ├── const.ts      # getLoginUrl(), re-exports (COOKIE_NAME, ONE_YEAR_MS) — was @shared, now local for standalone
│       ├── contexts/     # ThemeContext
│       ├── hooks/        # usePersistFn, useMobile, useComposition
│       ├── pages/        # Portal.tsx (main UI), Home.tsx, NotFound.tsx
│       └── components/   # ui/* (shadcn-style), Map, ManusDialog, ErrorBoundary
```

- **No `server/`** in this tree; `package.json` build script references `server/index.ts` for a separate backend that isn’t in this folder. So **build** may fail at the server step; **dev** and **preview** work for the UI only.

---

## Key Files

- **`client/src/pages/Portal.tsx`**  
  Main dashboard: sidebar, zones (Overview, Find Physician, Referrals, Community, Practice, Profile, etc.). Uses hardcoded data (e.g. `DOCTOR`, `PHYSICIANS`, `REFERRALS`, `ANNOUNCEMENTS`, `EVENTS`, `BOARD`, `COMMITTEES`).

- **`client/src/App.tsx`**  
  Wouter routes: `/` and `/portal` → Portal; `/404` → NotFound. Wraps app in `ThemeProvider`, `TooltipProvider`, `Toaster`, `ErrorBoundary`.

- **`client/src/const.ts`**  
  Exports `getLoginUrl()` (OAuth portal URL from env) and cookie/constants. Standalone run uses local constants instead of `@shared/const`.

---

## Can You Run Just This Project?

**Yes.** From the **aip-doctor-portal-ui** folder:

```bash
cd public/aip-doctor-portal-ui
pnpm install
pnpm dev
```

- Dev server runs with **Vite** (script: `vite --host`). With the added `vite.config.ts`, `root` is `client` and `@` resolves to `client/src`, so the app runs as a standalone client.
- Open the URL Vite prints (e.g. `http://localhost:5173`). You get the portal UI with mock data; no backend required for basic UI.

**Optional env (e.g. `.env` in `public/aip-doctor-portal-ui`):**

- `VITE_OAUTH_PORTAL_URL`, `VITE_APP_ID` — for `getLoginUrl()` (OAuth).
- `VITE_ANALYTICS_*` — index.html has placeholders; can be left empty.

**Notes:**

- **`pnpm build`** may fail on the `esbuild server/index.ts` step if there is no `server/` in this folder. You can still use **`pnpm dev`** and **`pnpm preview`** (after a client-only build if you temporarily change the build script).
- This app is **independent** of the main Next.js app; it’s just stored under `public/` for convenience. The main site does not serve or build this Vite app automatically.

---

## Relation to the Main Repo

- The **main** doctor dashboard lives in the Next.js app: `src/app/doctor/dashboard/`, `MessagesSection`, Firebase messaging, etc.
- **This** folder is a separate, self-contained portal UI (likely a prototype or alternate UI). Running it does not affect the main site.
