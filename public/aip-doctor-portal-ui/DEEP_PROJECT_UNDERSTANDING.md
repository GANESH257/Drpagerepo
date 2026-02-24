# AIP Doctor Portal UI — Deep Project Understanding

This document describes **`public/aip-doctor-portal-ui`** in detail: what it is, how it’s built, how it runs, and how it relates to the rest of the repo.

---

## 1. What This Project Is

| Aspect | Description |
|--------|-------------|
| **Name** | `aip-doctor-portal` (from `package.json`). |
| **Purpose** | A **standalone doctor-facing portal** UI: dashboard, find physician, referrals, community (forum, announcements, leadership), my practice, my profile, messages, membership, settings. |
| **Relationship to main repo** | **Separate app.** It lives under `public/` of the main Next.js site (EnsembleDrPage) but is **not** part of the Next.js build or routing. The main doctor dashboard is in `src/app/doctor/dashboard/` and uses Firebase; this is a **different**, self-contained React SPA (likely a prototype or alternate UI). |
| **Data** | **All mock/local.** No backend is wired. Data is hardcoded in `Portal.tsx` (e.g. `DOCTOR`, `PHYSICIANS`, `REFERRALS`, `ANNOUNCEMENTS`, `EVENTS`, `BOARD`, `COMMITTEES`, `MESSAGES`, `CONDITIONS`). |
| **Auth** | No real auth. Sign out and login are toasts (“coming soon”). `const.ts` has `getLoginUrl()` for OAuth (env: `VITE_OAUTH_PORTAL_URL`, `VITE_APP_ID`) but it’s not used in the current UI flow. |

---

## 2. High-Level Architecture

```
public/aip-doctor-portal-ui/
├── package.json              # Single package: deps + scripts (dev, build, preview). Uses pnpm.
├── README.md
├── DEEP_PROJECT_UNDERSTANDING.md  # This file
└── client/                    # The actual Vite/React app
    ├── index.html             # Entry HTML; <script type="module" src="/src/main.tsx">
    ├── public/                # Static assets (e.g. __manus__/debug-collector.js)
    └── src/
        ├── main.tsx           # React root: createRoot, renders <App />
        ├── App.tsx            # Router (wouter) + ThemeProvider + Toaster + ErrorBoundary
        ├── index.css          # Tailwind + AIP theme (light/dark, --aip-teal, --aip-gold, glass-card)
        ├── const.ts           # getLoginUrl(); re-exports COOKIE_NAME, ONE_YEAR_MS from "@shared/const" (broken in standalone)
        ├── contexts/          # ThemeContext (light/dark, switchable)
        ├── hooks/             # usePersistFn, useMobile, useComposition
        ├── lib/               # utils.ts (cn = clsx + tailwind-merge)
        ├── pages/             # Portal.tsx (main app), Home.tsx (example), NotFound.tsx (404)
        └── components/        # ui/* (shadcn-style Radix components), Map, ManusDialog, ErrorBoundary
```

- **No `server/` folder.** The `package.json` build script runs `esbuild server/index.ts`; that will fail in this repo because `server/` does not exist.
- **No `vite.config.ts`** in the tree. So by default, `vite` is run from the **aip-doctor-portal-ui** root and looks for `index.html` in that root; the real `index.html` is under `client/`. So **without a vite config that sets `root: 'client'`**, `pnpm dev` will not find the entry and the app won’t run as intended. The README refers to an added `vite.config.ts` that may not be present in your branch.

---

## 3. Tech Stack (from package.json)

- **Runtime:** React 19, React DOM 19.
- **Build:** Vite 7, TypeScript 5.6, @vitejs/plugin-react.
- **Styling:** Tailwind CSS 4, @tailwindcss/vite, tw-animate-css, tailwind-merge, class-variance-authority.
- **UI:** Radix UI (accordion, alert-dialog, avatar, checkbox, dialog, dropdown, tabs, tooltip, etc.), shadcn-style components in `client/src/components/ui/`.
- **Routing:** wouter (Route, Switch, useLocation).
- **Forms:** react-hook-form, @hookform/resolvers, zod.
- **Icons:** lucide-react.
- **Other:** framer-motion, recharts, sonner (toasts), axios, nanoid, next-themes, vaul (drawer), cmdk, react-day-picker, input-otp, streamdown.
- **Package manager:** pnpm (with patched wouter and tailwind>nanoid override).

---

## 4. Entry and Routing

- **HTML:** `client/index.html` has `<div id="root">` and `<script type="module" src="/src/main.tsx">`.
- **JS entry:** `main.tsx` creates a root and renders `<App />`; imports `./index.css`.
- **App.tsx:**
  - Wraps the app in: `ErrorBoundary` → `ThemeProvider` (defaultTheme="dark", switchable) → `TooltipProvider` → `Toaster` → router.
  - **Router (wouter):**
    - `/` → `Portal`
    - `/portal` → `Portal`
    - `/404` → `NotFound`
    - Default → `NotFound`

So the only “pages” the user normally sees are **Portal** (main app) and **NotFound** (404). **Home** is not routed; it’s an example page.

---

## 5. Portal.tsx — The Main Application

`Portal.tsx` is one large file (~1,224 lines) that implements the entire doctor portal as a **single-page app with client-side “pages”** (no URL change; state `activePage` drives what’s rendered).

### 5.1 Data (all in file)

- **DOCTOR** — Current user: Dr. Sarah Johnson, Cardiology, St. Louis Heart Associates, NPI, status “Pending AIP Review”, onboarding 75%.
- **PHYSICIANS** — List of 6 physicians (name, specialty, practice, city, insurance, badge, accepting).
- **REFERRALS** — Sent/received referrals (patient, physician, specialty, status, date, type).
- **ANNOUNCEMENTS** — AIP announcements (title, date, excerpt, optional action).
- **EVENTS** — Upcoming events (icon, title, date, location).
- **FORUM_POSTS** — Community forum (author, title, replies, views, time, tags).
- **BOARD** — Board of directors (initials, name, role, specialty).
- **COMMITTEES** — Committees (name, chair, members, focus).
- **MESSAGES** — Inbox (from, subject, preview, time, unread).
- **CONDITIONS** — Conditions treated and treatments (for Services & Insurance).

### 5.2 Navigation (NAV_ITEMS)

- **Dashboard** — Overview.
- **Find a Physician** — Search/filter physicians, add to contacts.
- **My Practice** (expandable): View Practice Profile, View Locations.
- **My Profile** (expandable): Edit Profile, Services & Insurance, View Public Profile.
- **Referrals** — List/filter referrals; “New Referral” toast.
- **Community & News** (expandable): Community Forum, Announcements & Events, Leadership & Committees.
- **Messages** — Inbox + detail (badge 3).
- **Membership & Billing** — Plan, invoices, features.
- **Account Settings** — Login/password, notifications.

Navigation is **state-based:** `activePage` and `expanded` (for sidebar groups). Clicking a nav item calls `navigate(id)` which sets `activePage` and optionally expands a parent. No URL updates.

### 5.3 Layout

- **Sidebar (left):** AIP logo, full nav tree, user footer (avatar, name, specialty, sign out).
- **Main (right):** Top bar (theme toggle, bell, user avatar + name) and scrollable content area.
- **Content:** `renderPage()` switches on `activePage` and returns one of the “page” components (e.g. DashboardPage, FindPhysicianPage, EditProfilePage, ReferralsPage, MessagesPage, etc.).

### 5.4 “Pages” (all inside Portal.tsx)

- **DashboardPage** — Welcome, onboarding progress, metric cards (referrals sent/received, network, messages), recent referrals table, latest announcements + upcoming events.
- **FindPhysicianPage** — Search/filter by name/specialty/accepting, grid of physician cards, “Add to Contacts”, floating “My Contacts” button.
- **EditProfilePage** — Tabs: Basic Info, Credentials & Licenses, Biography & Awards, Status & Settings; form fields and toasts.
- **ServicesInsurancePage** — Conditions treated + procedures; accepted insurance list.
- **ReferralsPage** — Filter (all/sent/received/pending), table of referrals.
- **ForumPage** — List of forum posts (author, title, tags, replies/views).
- **AnnouncementsPage** — List of announcements + upcoming events sidebar.
- **LeadershipPage** — Board of directors grid + committees table.
- **MessagesPage** — Two-column inbox: thread list + message detail + reply input.
- **MembershipPage** — Current plan (Premium), price, renewal, View Invoices / Add Physician Seat, plan features list.
- **PracticeProfilePage** — Practice name, specialty, contact, physicians count.
- **PracticeLocationsPage** — List of office locations (name, address, phone, hours).
- **PublicProfilePage** — Preview of public profile (avatar, title, specialty, about, awards, insurance).
- **SettingsPage** — Login & Security (email, password change).

All actions (Save, Submit, Add, etc.) are **toasts or placeholders** (“coming soon”); no API calls.

### 5.5 Theming and Styling

- **ThemeContext** stores `theme` (light/dark), toggled from the header; default is dark.
- **index.css** defines:
  - **AIP tokens:** `--aip-teal`, `--aip-navy`, `--aip-gold`, `--aip-silver`, `--radius`.
  - **Light/dark:** Full set of semantic variables (background, foreground, card, primary, sidebar, etc.) for `:root` and `.dark`.
  - **Utilities:** `.glass-card` (glass effect), `.page-glow::before` (decorative glow), badge classes (e.g. badge-accepted, badge-pending).

Portal uses these plus inline styles (e.g. `style={{ color: "var(--aip-teal)" }}`, gradients like `#1A8C7A` / `#1B3A6B`) for AIP branding.

---

## 6. Other Key Files

- **const.ts** — `export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const"` — **this will fail** in a standalone run because there is no `@shared` package or alias. The file also defines `getLoginUrl()` using `import.meta.env.VITE_OAUTH_PORTAL_URL` and `VITE_APP_ID`.
- **ThemeContext.tsx** — Provides theme state and optional toggle; persists to localStorage when switchable.
- **ErrorBoundary** — Class component; on error shows message, stack, and “Reload Page” button.
- **ManusDialog** — Modal dialog used for login/auth UX (logo, title, open state, onLogin, onOpenChange, onClose).
- **Home.tsx** — Example page (Loader, Streamdown, Button); not used in routes.
- **NotFound.tsx** — 404 card with “Go Home” (wouter setLocation("/")).

---

## 7. Path Aliases

- Code uses **`@/`** for imports (e.g. `@/components/ui/button`, `@/contexts/ThemeContext`, `@/pages/Portal`). So the build tool must resolve `@` to `client/src`. **Vite** does this via `resolve.alias` in `vite.config`; without a config that sets `root: 'client'` and `resolve.alias['@'] = path.resolve(__dirname, 'client/src')` (or similar), both the entry and `@` imports will be wrong when running from `aip-doctor-portal-ui` root.

---

## 8. Can You Run Just This Project?

**Intended (per README):** From `public/aip-doctor-portal-ui` run:

```bash
cd public/aip-doctor-portal-ui
pnpm install
pnpm dev
```

**Current blockers:**

1. **No `vite.config.ts`** — Vite’s default root is the folder where you run `vite`. So from `aip-doctor-portal-ui` it looks for `index.html` in `aip-doctor-portal-ui/`, but the file is in `aip-doctor-portal-ui/client/`. So either:
   - Add a **vite.config.ts** in `aip-doctor-portal-ui` with `root: 'client'` and `resolve.alias: { '@': path.resolve(__dirname, 'client/src') }`, and run `pnpm dev` from `aip-doctor-portal-ui`, or
   - Run Vite from **inside** `client/` (and put a `package.json` + vite config in `client/`), which would require restructuring.

2. **`const.ts`** — The line `export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const"` will fail at build/run because `@shared` is not defined. For standalone run, replace that with local constants (e.g. `export const COOKIE_NAME = '...'; export const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;` or similar).

3. **`pnpm build`** — The script runs `vite build && esbuild server/index.ts ...`. The second part fails (no `server/`). So full build is broken; dev/preview can work once the above two items are fixed.

---

## 9. Summary Table

| Item | Status / Note |
|------|----------------|
| **What it is** | Standalone React SPA for AIP doctor portal (dashboard, referrals, community, practice, profile, messages, membership, settings). |
| **Data** | 100% mock in `Portal.tsx`; no backend. |
| **Routing** | wouter: `/` and `/portal` → Portal; `/404` → NotFound. Portal itself is state-based (no URL for sub-pages). |
| **Theme** | Light/dark, switchable, AIP colors (teal, navy, gold). |
| **Run standalone** | Possible only after adding vite config (root + alias) and fixing `const.ts` (@shared). |
| **Build** | Full `pnpm build` fails on server step; client-only build possible if script is adjusted. |
| **Relation to main site** | Independent; main doctor dashboard is Next.js + Firebase in `src/app/doctor/dashboard/`. |

This is the complete picture of **public/aip-doctor-portal-ui** and how it fits into the repo.
