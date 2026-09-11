# STAR-Airwell architecture restructure — design spec

Date: 2026-09-11

## Goal

Restructure this codebase to follow the "reusable architecture pattern"
(absolute imports, ordered bootstrap, centralized lazy-loaded routing,
context-driven layout, config/nav as typed data, generic data-binding
building blocks, three-tier component structure, domain-split types)
described in `AGENTS.md`/the prompt this spec was built from — **without**:

- changing any rendered UI, styling, colors, or copy
- adding, removing, or renaming any dependency or version in `package.json`
- inventing dummy data or wiring any real integration/API

This is a pure structural refactor: files move, wiring changes from
props/if-chains to context/tables, behavior and pixels stay identical.

## Non-goals

- No react-router (or any router) is added. There is no URL-based
  navigation today (`App.tsx` swaps pages via `useState`), and the
  instructions this pattern came with are explicit: match the existing
  stack, don't introduce new libraries. The "centralized route table +
  Loadable HOC" pattern is implemented with plain React state instead.
- No generic API-fetching `DataTable<T>`/`CustomList<T>` component.
  Every page reads from in-memory arrays in `src/data/*.ts` — there is
  no backend, no pagination, no loading/error states to genericize.
  Forcing bespoke filter/sort/selection UIs (e.g. `Leads.tsx`'s 6
  filter dropdowns + sortable columns + row selection) through one
  generic fetch-owning component would risk changing behavior, which
  is explicitly out of scope.
- No `BlankLayout` — there is no auth/blank-shell screen in this app
  today, so only one layout shell (`FullLayout`) is needed.
- No Flowbite/UI-kit theme provider — this project uses static
  Tailwind only; `App.tsx`'s "theme provider" responsibility from the
  reference pattern is not applicable here.

## Current state (baseline)

```
src/
  main.tsx            — ReactDOM.createRoot + StrictMode, no context, no Suspense
  App.tsx              — owns `page`/`selectedLeadId` state, if-chain over 11 pages,
                          threads onNavigate/onLeadClick as props into Layout + 5 pages
  components/
    Layout.tsx          — sidebar+topbar shell; owns sidebarOpen/searchQuery/notifOpen
                          local state; NAV_SECTIONS hardcoded as a const array with
                          inline JSX icons; receives activePage/onNavigate as props
    Dashboard.tsx, Leads.tsx, LeadDetail.tsx, Pipeline.tsx, MonthlyReview.tsx,
    FollowUps.tsx, SalesPerformance.tsx, ProjectDirectory.tsx,
    EmployeeTracking.tsx, EmployeeMap.tsx, UserManagement.tsx,
    AccessManagement.tsx  — 11 feature pages, flat in components/
  data/
    crmData.ts           — types (Lead, Activity, LeadStatus, ClientType,
                          EnquirySource, Application, SystemType, SalesEngineer,
                          MonthlyData, ...) + mock arrays, mixed together
    locationData.ts       — types + mock data, mixed together
vite.config.ts / tsconfig.json — already alias `@/*` → `./src/*` (pattern #1
                          is already satisfied; no change needed)
```

## Target structure

```
src/
  main.tsx
  App.tsx
  routes/
    Loadable.tsx        — generic Loadable(Component): React.lazy + Suspense + Spinner
    Router.tsx           — const routes: RouteEntry[] table
    AppRouter.tsx         — reads NavigationContext, renders the matching route
                          inside FullLayout
  layouts/
    FullLayout.tsx        — moved from components/Layout.tsx; reads
                          NavigationContext + UIContext instead of props
  context/
    NavigationContext.tsx — { activePage, navigate, selectedLeadId, openLead }
    UIContext.tsx          — { sidebarOpen, toggleSidebar }, seeded from config.ts
    config.ts               — default UI settings (sidebarOpen default, etc.)
  data/
    Sidebaritems.ts          — NAV_SECTIONS moved here as typed data
    crmData.ts                — unchanged mock arrays only, imports types from
                          types/crm.ts
    locationData.ts            — unchanged mock arrays only, imports types from
                          types/location.ts
  types/
    crm.ts                     — Lead, Activity, LeadStatus, ClientType,
                          EnquirySource, Application, SystemType, SalesEngineer,
                          MonthlyData (moved out of data/crmData.ts)
    location.ts                 — types moved out of data/locationData.ts
    layout.ts                    — NavPage, MenuItem, NavSection, RouteEntry
  components/
    shared/
      Spinner.tsx                — extracted for Loadable's fallback (new small
                          component, same visual treatment as any existing
                          loading affordance, or a minimal neutral spinner if
                          none exists today)
      icons/                       — icon functions already duplicated between
                          Layout.tsx's two "Users/Shield" sets etc., deduped
                          here if the audit below confirms duplication
  views/
    dashboard/Dashboard.tsx
    leads/Leads.tsx, LeadDetail.tsx
    pipeline/Pipeline.tsx
    projects/ProjectDirectory.tsx
    followups/FollowUps.tsx
    employees/EmployeeTracking.tsx, EmployeeMap.tsx
    reports/SalesPerformance.tsx, MonthlyReview.tsx
    admin/UserManagement.tsx, AccessManagement.tsx
    shared/                        — chrome extracted from the audit below
                          (e.g. FilterSelect, sortable <th>, pagination footer)
```

## Section detail

### 1. Imports
Already satisfied (`@/*` → `./src/*` in both `vite.config.ts` and
`tsconfig.json`). No change.

### 2. Bootstrap order
`main.tsx`:
```
<NavigationProvider>
  <UIProvider>
    <Suspense fallback={<Spinner/>}>
      <App/>
    </Suspense>
  </UIProvider>
</NavigationProvider>
```
`App.tsx` becomes: mount `<AppRouter/>`. No state, no if-chain, no
`Placeholder` helper (that moves to `AppRouter.tsx` or stays as a tiny
`views/shared/ComingSoon.tsx`, used for `reports`/`settings`).

### 3. Routing
- `Loadable.tsx`: generic HOC, `React.lazy(() => import(...))` wrapped
  in `Suspense` with the shared `Spinner`.
- `Router.tsx`: one array of `{ id: NavPage; element: ComponentType }`
  — every page wrapped in `Loadable`.
- `AppRouter.tsx`: `const activePage = useNavigation().activePage`,
  finds the matching route, renders it inside `FullLayout`.
- The leads list/detail toggle (`selectedLeadId`) is encapsulated in a
  small `LeadsRoute` component (in `views/leads/`) so `Router.tsx`
  stays a flat table — it's the one place where a route has
  sub-navigation state, matching how the reference handles this via
  nested routes without requiring an actual router library here.

### 4. Layout reads context, not props
`FullLayout.tsx` (renamed from `Layout.tsx`) drops `activePage`,
`onNavigate` props — reads `useNavigation()` instead. `sidebarOpen`
moves from local `useState` to `useUI()`. Visual output identical;
`searchQuery`/`notifOpen` remain page-local state in `FullLayout`
(they're not cross-cutting layout config, just local UI state, so
lifting them would be pattern-for-pattern's-sake, not a real win).

### 5. Config & nav as data
`context/config.ts` exports the default UI config object (currently
just `{ sidebarOpen: true }`); `UIContext` seeds `useState` from it.
`data/Sidebaritems.ts` exports `NAV_SECTIONS: NavSection[]` typed via
`types/layout.ts`'s `MenuItem`/`NavSection` interfaces — same content,
same icons, same order as today's inline const.

### 6. Data binding
Per the approved scope: no generic fetch/paginate component. An
implementation-time audit of the list pages (`Leads`, `Pipeline`,
`FollowUps`, `ProjectDirectory`, `EmployeeTracking`, `UserManagement`,
`AccessManagement`) identifies genuinely duplicated presentational
chrome (e.g. `Leads.tsx` already has a local `FilterSelect` helper —
check whether other pages duplicate it) and extracts only those pieces
into `views/shared/`. Each page keeps owning its filter/sort/selection
state and its own data reads from `src/data/*.ts`.

### 7. Component tiering
- `components/shared/` — presentation-only, no data: `Spinner`,
  deduped icon components.
- `views/shared/` — reusable-but-page-adjacent chrome from step 6.
- `views/<domain>/` — the 11 feature pages, thin, moved as-is (import
  paths updated to `@/...`), composed from the tiers above where the
  audit found real duplication.

### 8. Types
`types/crm.ts`, `types/location.ts`, `types/layout.ts` — interfaces
split out by domain. `data/crmData.ts` and `data/locationData.ts` keep
only the mock arrays/constants and `import type` their shapes back
from `types/`. No data values change.

## Migration mapping (file-level)

| Today | Becomes |
|---|---|
| `src/App.tsx` | `src/App.tsx` (gutted to router mount) |
| `src/main.tsx` | `src/main.tsx` (adds provider/Suspense wrapping) |
| `src/components/Layout.tsx` | `src/layouts/FullLayout.tsx` + nav data extracted to `src/data/Sidebaritems.ts` |
| `src/components/Dashboard.tsx` | `src/views/dashboard/Dashboard.tsx` |
| `src/components/Leads.tsx` | `src/views/leads/Leads.tsx` |
| `src/components/LeadDetail.tsx` | `src/views/leads/LeadDetail.tsx` |
| `src/components/Pipeline.tsx` | `src/views/pipeline/Pipeline.tsx` |
| `src/components/ProjectDirectory.tsx` | `src/views/projects/ProjectDirectory.tsx` |
| `src/components/FollowUps.tsx` | `src/views/followups/FollowUps.tsx` |
| `src/components/EmployeeTracking.tsx` | `src/views/employees/EmployeeTracking.tsx` |
| `src/components/EmployeeMap.tsx` | `src/views/employees/EmployeeMap.tsx` |
| `src/components/SalesPerformance.tsx` | `src/views/reports/SalesPerformance.tsx` |
| `src/components/MonthlyReview.tsx` | `src/views/reports/MonthlyReview.tsx` |
| `src/components/UserManagement.tsx` | `src/views/admin/UserManagement.tsx` |
| `src/components/AccessManagement.tsx` | `src/views/admin/AccessManagement.tsx` |
| `src/components/Airwell-Logo.webp`, `favicon.png` | stay in `src/components/` (static assets, not code) or move to `src/assets/` if that reads cleaner — implementation detail, no visible change either way |
| `src/data/crmData.ts` types | `src/types/crm.ts` |
| `src/data/locationData.ts` types | `src/types/location.ts` |

## Risks / how they're mitigated

- **Import breakage from the mass move**: every relocated file's
  imports need updating to `@/...`. Mitigated by doing the move
  file-by-file with a build/typecheck (`tsc --noEmit` / `vite build`)
  after each group, not one giant untested move.
- **Context migration changing behavior subtly** (e.g. sidebar state
  timing): mitigated by keeping the *shape* of the state identical
  (same initial value, same setter semantics), just relocated.
- **Prop-to-context migration for `onLeadClick`**: five call sites
  change from a prop to a hook call. Verified by manually exercising
  "click a lead from Dashboard/Pipeline/ProjectDirectory/FollowUps/
  EmployeeTracking → lands on LeadDetail" after the change, since this
  is the one behavioral wiring path being touched.
- **No automated test suite exists in this project** — verification is
  `tsc --noEmit` (typecheck) + `vite build` (build succeeds) + manual
  click-through of every nav item and the lead-detail flow in the dev
  server, comparing against current behavior.

## Verification plan

1. `tsc --noEmit` passes after the full move.
2. `vite build` succeeds.
3. Dev server: every sidebar nav item still renders its page; sidebar
   collapse/expand still works; clicking a lead from each of the 5
   entry points still opens `LeadDetail` and "back" still returns.
4. Visual diff by eye against current `main` for at least one page per
   moved file — no className/markup changes should exist outside the
   files this spec touches.
