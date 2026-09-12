# Architecture Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure this React+Vite CRM app into the layered architecture described in the spec (typed domain interfaces, config/nav-as-data, context-driven layout, a centralized lazy-loaded route table, three-tier components) with zero change to rendered UI, styling, dependencies, or data.

**Architecture:** Extract domain types out of the data files into `src/types/`, replace `App.tsx`'s local page-state with a `NavigationContext` + `UIContext`, replace the `page === "x" && <X/>` if-chain with a `routes` table rendered through a generic `Loadable` (lazy+Suspense) wrapper, and move the 11 feature components from the flat `src/components/` into `src/views/<domain>/`, reading navigation from context instead of props.

**Tech Stack:** React 19, TypeScript 5.7, Vite 8 — no new dependencies (no router library, no test framework is added; this project has none today).

**Spec:** `docs/superpowers/specs/2026-09-11-architecture-restructure-design.md`

## Global Constraints

- No dependency in `package.json` is added, removed, or version-bumped.
- No visual output, className, copy, or data value changes anywhere.
- No dummy data is invented; no API/integration is wired.
- No test framework exists in this repo — "testing" a task means `pnpm exec tsc --noEmit` (typecheck) plus, on the last task, `pnpm build` and a manual click-through. Do not add a test framework to satisfy this plan's structure.
- Never leave an unused old file behind — every `git mv`/extraction task ends with the old file deleted or fully hollowed out, verified by `git status`.
- Use the `@/*` alias for every new/edited import (it already resolves to `./src/*` in `vite.config.ts` and `tsconfig.json` — do not change that config).

## Scope decisions carried from the spec (not their own task)

- **No generic `DataTable<T>`/`views/shared/` table-chrome component is added.** The spec's data-binding section calls for extracting *only* genuinely duplicated chrome. An audit (`grep -rln "FilterSelect" src/components/*.tsx`) found `FilterSelect` defined once, only in `Leads.tsx` — no other list page duplicates it, and none of the other list pages (Pipeline, ProjectDirectory, FollowUps, EmployeeTracking, UserManagement, AccessManagement) share a sortable-header or pagination-footer implementation either. There is nothing to extract, so `views/shared/` ends up holding only `ComingSoon.tsx` (Task 7) — that's the correct outcome per the spec, not a missed task.
- **`UserManagement.tsx`'s and `AccessManagement.tsx`'s inline types (`Role`, `UserStatus`, `User`, `Permission`) are not moved to `src/types/`.** They're each used only within their own file, unlike the `Lead`/`FieldEmployee` families which are shared across many pages — moving them would be motion without benefit. This is called out again inline in Task 13.

---

### Task 1: Extract CRM domain types to `src/types/crm.ts`

**Files:**
- Create: `src/types/crm.ts`
- Modify: `src/data/crmData.ts:1-83`
- Modify: `src/components/LeadDetail.tsx:3`
- Modify: `src/components/FollowUps.tsx:3`
- Modify: `src/components/Leads.tsx:3`
- Modify: `src/components/Pipeline.tsx:3`
- Modify: `src/components/ProjectDirectory.tsx:3`

**Interfaces:**
- Produces: `src/types/crm.ts` exporting `LeadStatus`, `ClientType`, `EnquirySource`, `Application`, `SystemType`, `Lead`, `Activity`, `SalesEngineer`, `MonthlyData` — every later task that needs these types imports `from "@/types/crm"`.

- [ ] **Step 1: Create `src/types/crm.ts`** with exactly this content (moved verbatim from `crmData.ts` lines 1-82):

```ts
export type LeadStatus =
  | "New Enquiry"
  | "Qualified"
  | "Site Visit"
  | "Quotation Sent"
  | "Follow-up"
  | "Negotiation"
  | "Booking Confirmed"
  | "Advance Received"
  | "Won"
  | "Lost";

export type ClientType = "Industrial" | "Commercial" | "Institutional" | "Residential" | "Government";
export type EnquirySource = "Direct" | "Referral" | "Consultant" | "Tender" | "Exhibition" | "Online";
export type Application =
  | "Process Cooling"
  | "Comfort AC"
  | "Data Center Cooling"
  | "Cold Storage"
  | "Industrial HVAC"
  | "Pharma";
export type SystemType = "Chiller" | "VRF" | "AHU" | "DX Split" | "Package Unit" | "Cooling Tower";

export interface Lead {
  id: string;
  srNo: number;
  projectName: string;
  salesEngineer: string;
  clientType: ClientType;
  enquirySource: EnquirySource;
  sourceName: string;
  application: Application;
  location: string;
  systemType: SystemType;
  hp: number;
  tr: number;
  valueLakhs: number;
  status: LeadStatus;
  expectedBookingDate: string;
  nextFollowUp: string;
  leadOwner: string;
  probability: number;
  clientName: string;
  clientContact: string;
  clientEmail: string;
  remarks: string;
  enquiryDate: string;
  lastActivity: string;
  activities: Activity[];
}

export interface Activity {
  id: string;
  type: "Enquiry" | "Call" | "Site Visit" | "Quotation" | "Negotiation" | "Follow-up" | "Booking" | "Advance" | "Note";
  date: string;
  description: string;
  by: string;
}

export interface SalesEngineer {
  name: string;
  target: number;
  achieved: number;
  enquiries: number;
  bookingValue: number;
  billingValue: number;
  collection: number;
  pipelineValue: number;
  monthlyData: { month: string; target: number; achieved: number }[];
}

export interface MonthlyData {
  month: string;
  bookingForecast: number;
  bookingAchieved: number;
  collectionForecast: number;
  collectionAchieved: number;
  billingForecast: number;
  billingAchieved: number;
  enquiryTarget: number;
  enquiryGenerated: number;
}
```

- [ ] **Step 2: Replace the type block in `src/data/crmData.ts`**

Delete lines 1-83 of `src/data/crmData.ts` (everything from `export type LeadStatus =` through the blank line after `export interface MonthlyData { ... }`, up to but not including `export const SALES_ENGINEERS = [`) and replace with:

```ts
import type {
  LeadStatus,
  ClientType,
  EnquirySource,
  Application,
  SystemType,
  Lead,
  Activity,
  SalesEngineer,
  MonthlyData,
} from "@/types/crm";
```

`Activity` is only used inside the `Lead.activities` field, which is already typed via the `Lead` interface itself — TypeScript won't complain about the unused named import because it's referenced structurally; if `tsc` flags `Activity` as unused (it isn't referenced by name elsewhere in this file), that's expected and fine to leave since `noUnusedLocals` is not set in `tsconfig.json` — verify this in Step 5.

- [ ] **Step 3: Update the three type-only imports that reference `Lead`/`LeadStatus`**

`src/components/Leads.tsx:3` — change:
```ts
import type { Lead, LeadStatus, ClientType, Application, SystemType } from "../data/crmData";
```
to:
```ts
import type { Lead, LeadStatus, ClientType, Application, SystemType } from "@/types/crm";
```

`src/components/Pipeline.tsx:3` — change:
```ts
import type { Lead, LeadStatus } from "../data/crmData";
```
to:
```ts
import type { Lead, LeadStatus } from "@/types/crm";
```

`src/components/ProjectDirectory.tsx:3` — change:
```ts
import type { LeadStatus } from "../data/crmData";
```
to:
```ts
import type { LeadStatus } from "@/types/crm";
```

`src/components/LeadDetail.tsx:3` — change:
```ts
import type { LeadStatus } from "../data/crmData";
```
to:
```ts
import type { LeadStatus } from "@/types/crm";
```

`src/components/FollowUps.tsx:3` — change:
```ts
import type { Lead } from "../data/crmData";
```
to:
```ts
import type { Lead } from "@/types/crm";
```

- [ ] **Step 4: Verify `crmData.ts` still exports its values unchanged**

Run: `grep -n "^export const\|^export type\|^export interface" src/data/crmData.ts`
Expected: only the value exports remain (`SALES_ENGINEERS`, `MONTHLY_LABELS`, `leads`, `salesEngineers`, `monthlyData`, `STATUS_CONFIG`, `ACTIVITY_ICONS`, `PIPELINE_STAGES`) — no `export type`/`export interface` lines.

- [ ] **Step 5: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/types/crm.ts src/data/crmData.ts src/components/Leads.tsx src/components/Pipeline.tsx src/components/ProjectDirectory.tsx src/components/LeadDetail.tsx src/components/FollowUps.tsx
git commit -m "$(cat <<'EOF'
Extract CRM domain types to src/types/crm.ts

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Extract location domain types to `src/types/location.ts`

**Files:**
- Create: `src/types/location.ts`
- Modify: `src/data/locationData.ts:1-75`
- Modify: `src/components/EmployeeMap.tsx:3`
- Modify: `src/components/EmployeeTracking.tsx:4`

**Interfaces:**
- Produces: `src/types/location.ts` exporting `EmployeeStatus`, `LatLng`, `RouteStop`, `CustomerVisit`, `FieldEmployee`.

- [ ] **Step 1: Create `src/types/location.ts`** with exactly this content (moved verbatim from `locationData.ts` lines 1-74):

```ts
export type EmployeeStatus =
  | "Online"
  | "In Field"
  | "At Customer Site"
  | "In Office"
  | "On Leave"
  | "Offline"
  | "Location Unavailable";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteStop {
  id: string;
  index: number;
  type: "office" | "customer" | "travel" | "break";
  label: string;
  address: string;
  position: LatLng;
  arrivalTime: string;
  departureTime?: string;
  duration?: string;
  purpose?: string;
  notes?: string;
  leadId?: string;
  projectName?: string;
  followUpRequired?: boolean;
}

export interface CustomerVisit {
  id: string;
  customerName: string;
  projectName: string;
  location: string;
  address: string;
  position: LatLng;
  checkIn: string;
  checkOut?: string;
  duration?: string;
  purpose: string;
  notes?: string;
  followUpRequired: boolean;
  leadId?: string;
  status: "Ongoing" | "Completed" | "Missed";
}

export interface FieldEmployee {
  id: string;
  name: string;
  initials: string;
  designation: string;
  department: string;
  phone: string;
  email: string;
  avatar?: string;
  status: EmployeeStatus;
  locationSharingEnabled: boolean;
  currentPosition?: LatLng;
  currentAddress?: string;
  currentActivity?: string;
  currentProjectName?: string;
  currentLeadId?: string;
  lastUpdated: string;
  firstCheckIn?: string;
  lastCheckIn?: string;
  todayVisits: number;
  completedVisits: number;
  distanceTravelled: number; // km
  todayRoute: RouteStop[];
  customerVisits: CustomerVisit[];
  color: string;
}
```

- [ ] **Step 2: Replace the type block in `src/data/locationData.ts`**

Delete lines 1-75 of `src/data/locationData.ts` (everything through the blank line after `export interface FieldEmployee { ... }`, up to but not including `export const fieldEmployees: FieldEmployee[] = [`) and replace with:

```ts
import type { EmployeeStatus, LatLng, RouteStop, CustomerVisit, FieldEmployee } from "@/types/location";
```

- [ ] **Step 3: Update the two type-only imports that reference these types**

`src/components/EmployeeMap.tsx:3` — change:
```ts
import type { FieldEmployee, EmployeeStatus, RouteStop } from "../data/locationData";
```
to:
```ts
import type { FieldEmployee, EmployeeStatus, RouteStop } from "@/types/location";
```

`src/components/EmployeeTracking.tsx:4` — change:
```ts
import type { FieldEmployee, CustomerVisit, RouteStop } from "../data/locationData";
```
to:
```ts
import type { FieldEmployee, CustomerVisit, RouteStop } from "@/types/location";
```

- [ ] **Step 4: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/types/location.ts src/data/locationData.ts src/components/EmployeeMap.tsx src/components/EmployeeTracking.tsx
git commit -m "$(cat <<'EOF'
Extract location domain types to src/types/location.ts

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Create layout types and nav-as-data file

**Files:**
- Create: `src/types/layout.ts`
- Create: `src/data/Sidebaritems.ts`
- Modify: `src/components/Layout.tsx:1-147`

**Interfaces:**
- Produces: `src/types/layout.ts` exporting `NavPage`, `MenuItem`, `NavSection`, `RouteEntry` — consumed by `NavigationContext` (Task 4), `Sidebaritems.ts` (this task), `Router.tsx` (Task 14), `AppRouter.tsx` (Task 15), `App.tsx` (Task 15), `ComingSoon.tsx` (Task 14).
- Produces: `src/data/Sidebaritems.ts` exporting `NAV_SECTIONS: NavSection[]` — consumed by `FullLayout.tsx` (Task 8).

- [ ] **Step 1: Create `src/types/layout.ts`**

```ts
import type { ComponentType, ReactNode } from "react";

export type NavPage =
  | "dashboard" | "leads" | "pipeline" | "projects" | "followups"
  | "sales-performance" | "monthly-review" | "employee-tracking"
  | "user-management" | "access-management"
  | "reports" | "settings";

export interface MenuItem {
  id: NavPage;
  icon: ReactNode;
  label: string;
  badge?: number;
}

export interface NavSection {
  label: string;
  items: MenuItem[];
}

export interface RouteEntry {
  id: NavPage;
  element: ComponentType;
}
```

- [ ] **Step 2: Create `src/data/Sidebaritems.ts`**

Moved verbatim from `src/components/Layout.tsx` lines 16-147 (all icon functions plus `NAV_SECTIONS`), retyped:

```tsx
import type { NavSection } from "@/types/layout";

function UsersIcon() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
function GridIcon_() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  );
}
function LeadsIcon_() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function PipelineIcon_() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
    </svg>
  );
}
function ProjectsIcon_() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    </svg>
  );
}
function FollowIcon_() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.82 12"/>
      <path d="M16 2a4 4 0 0 1 0 8"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
function PerfIcon_() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  );
}
function ReviewIcon_() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  );
}
function ReportsIcon_() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  );
}
function SettingsIcon_() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}
function LocationIcon_() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [
      { id: "dashboard", icon: <GridIcon_ />, label: "Dashboard" },
    ],
  },
  {
    label: "CRM",
    items: [
      { id: "leads",     icon: <LeadsIcon_ />,    label: "Leads" },
      { id: "pipeline",  icon: <PipelineIcon_ />, label: "Pipeline" },
      { id: "projects",  icon: <ProjectsIcon_ />, label: "Projects" },
      { id: "followups", icon: <FollowIcon_ />,   label: "Follow-ups", badge: 7 },
    ],
  },
  {
    label: "Field",
    items: [
      { id: "employee-tracking", icon: <LocationIcon_ />, label: "Employee Tracking", badge: 5 },
    ],
  },
  {
    label: "Reports",
    items: [
      { id: "sales-performance", icon: <PerfIcon_ />,    label: "Sales Performance" },
      { id: "monthly-review",    icon: <ReviewIcon_ />,  label: "Monthly Review" },
      { id: "reports",           icon: <ReportsIcon_ />, label: "Reports" },
    ],
  },
  {
    label: "Admin",
    items: [
      { id: "user-management",   icon: <UsersIcon />,    label: "User Management" },
      { id: "access-management", icon: <ShieldIcon />,   label: "Access Management" },
      { id: "settings",          icon: <SettingsIcon_ />, label: "Settings" },
    ],
  },
];
```

Note: this file must be named `Sidebaritems.ts` but contains JSX, so it must actually have a `.tsx` extension: create it as `src/data/Sidebaritems.tsx`.

- [ ] **Step 3: Remove the moved block from `Layout.tsx` and import the new module**

In `src/components/Layout.tsx`, delete lines 4-8 (the local `NavPage` type — it now lives in `src/types/layout.ts`) and lines 16-147 (every icon function plus `NAV_SECTIONS`). At the top of the file, change:

```ts
import { ReactNode, useState } from "react";
import airwellLogo from "./Airwell-Logo.webp";
```
to:
```ts
import { ReactNode, useState } from "react";
import airwellLogo from "./Airwell-Logo.webp";
import type { NavPage } from "@/types/layout";
import { NAV_SECTIONS } from "@/data/Sidebaritems";
```

(`LayoutProps`, further down, keeps referencing `NavPage` — now the imported type. No other change in this file yet; the props-to-context change happens in Task 8 when the file moves to `src/layouts/`.)

- [ ] **Step 4: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/types/layout.ts src/data/Sidebaritems.tsx src/components/Layout.tsx
git commit -m "$(cat <<'EOF'
Extract nav items to typed data file, add layout types

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Create `UIContext` (config-as-data + context)

**Files:**
- Create: `src/context/config.ts`
- Create: `src/context/UIContext.tsx`

**Interfaces:**
- Produces: `useUI()` returning `{ sidebarOpen: boolean; toggleSidebar: () => void }` — consumed by `FullLayout.tsx` (Task 8).

- [ ] **Step 1: Create `src/context/config.ts`**

```ts
export const uiConfig = {
  sidebarOpen: true,
};
```

- [ ] **Step 2: Create `src/context/UIContext.tsx`**

```tsx
import { createContext, useContext, useState, type ReactNode } from "react";
import { uiConfig } from "./config";

interface UIContextValue {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(uiConfig.sidebarOpen);

  function toggleSidebar() {
    setSidebarOpen((v) => !v);
  }

  return (
    <UIContext.Provider value={{ sidebarOpen, toggleSidebar }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within UIProvider");
  return ctx;
}
```

- [ ] **Step 3: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors (this context has no consumers yet, so this only checks the new file compiles).

- [ ] **Step 4: Commit**

```bash
git add src/context/config.ts src/context/UIContext.tsx
git commit -m "$(cat <<'EOF'
Add UIContext seeded from config.ts

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Create `NavigationContext`

**Files:**
- Create: `src/context/NavigationContext.tsx`

**Interfaces:**
- Consumes: `NavPage` from `@/types/layout` (Task 3).
- Produces: `useNavigation()` returning `{ activePage: NavPage; navigate: (page: NavPage) => void; selectedLeadId: string | null; openLead: (id: string) => void; closeLead: () => void }` — consumed by `FullLayout.tsx` (Task 8), `Dashboard.tsx`/`Pipeline.tsx`/`ProjectDirectory.tsx`/`FollowUps.tsx`/`EmployeeTracking.tsx` (Tasks 9 & 11), `LeadsRoute.tsx`/`Leads.tsx` (Task 10), `AppRouter.tsx` (Task 15).

This exactly reproduces the state machine currently in `src/App.tsx:16-28` (`page`/`selectedLeadId` state plus `openLead`/`navigate` functions) — just relocated to context so nothing needs to be prop-drilled.

- [ ] **Step 1: Create `src/context/NavigationContext.tsx`**

```tsx
import { createContext, useContext, useState, type ReactNode } from "react";
import type { NavPage } from "@/types/layout";

interface NavigationContextValue {
  activePage: NavPage;
  navigate: (page: NavPage) => void;
  selectedLeadId: string | null;
  openLead: (id: string) => void;
  closeLead: () => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [activePage, setActivePage] = useState<NavPage>("dashboard");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  function navigate(page: NavPage) {
    setActivePage(page);
    if (page !== "leads") setSelectedLeadId(null);
  }

  function openLead(id: string) {
    setSelectedLeadId(id);
    setActivePage("leads");
  }

  function closeLead() {
    setSelectedLeadId(null);
  }

  return (
    <NavigationContext.Provider value={{ activePage, navigate, selectedLeadId, openLead, closeLead }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error("useNavigation must be used within NavigationProvider");
  return ctx;
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/context/NavigationContext.tsx
git commit -m "$(cat <<'EOF'
Add NavigationContext holding activePage/selectedLeadId state

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Create `Spinner` and the generic `Loadable` HOC

**Files:**
- Create: `src/components/shared/Spinner.tsx`
- Create: `src/routes/Loadable.tsx`

**Interfaces:**
- Produces: `Loadable(factory)` — a function taking `() => Promise<{ default: ComponentType<any> }>` (the shape of a dynamic `import()`) and returning a component that lazy-loads it inside `Suspense`. Consumed by `Router.tsx` (Task 14).

- [ ] **Step 1: Create `src/components/shared/Spinner.tsx`**

```tsx
export default function Spinner() {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
    </div>
  );
}
```

- [ ] **Step 2: Create `src/routes/Loadable.tsx`**

```tsx
import { Suspense, lazy, type ComponentType } from "react";
import Spinner from "@/components/shared/Spinner";

export function Loadable(factory: () => Promise<{ default: ComponentType<any> }>) {
  const LazyComponent = lazy(factory);
  return function LoadableComponent(props: any) {
    return (
      <Suspense fallback={<Spinner />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}
```

- [ ] **Step 3: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/shared/Spinner.tsx src/routes/Loadable.tsx
git commit -m "$(cat <<'EOF'
Add Spinner and generic Loadable lazy-loading HOC

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Add `ComingSoon` view (moves `Placeholder` out of `App.tsx`)

**Files:**
- Create: `src/views/shared/ComingSoon.tsx`

**Interfaces:**
- Consumes: `NavPage` from `@/types/layout`.
- Produces: `ComingSoon({ page })` default export — consumed by `Router.tsx` (Task 14).

This is the exact `Placeholder` function currently at `src/App.tsx:69-85`, moved to its own file so `App.tsx` can be gutted in Task 15. Visual output is byte-for-byte identical.

- [ ] **Step 1: Create `src/views/shared/ComingSoon.tsx`**

```tsx
import type { NavPage } from "@/types/layout";

const LABELS: Record<string, string> = {
  bookings: "Bookings",
  collections: "Collections",
  billing: "Billing",
  "enquiry-gen": "Enquiry Generation",
  reports: "Reports",
  settings: "Settings",
};

export default function ComingSoon({ page }: { page: NavPage }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400">
      <div className="text-5xl mb-4">🚧</div>
      <div className="text-sm font-medium text-slate-600">{LABELS[page] || page}</div>
      <div className="text-xs mt-1">This section is coming soon</div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/views/shared/ComingSoon.tsx
git commit -m "$(cat <<'EOF'
Add ComingSoon view (extracted from App.tsx's Placeholder)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Move `Layout.tsx` to `src/layouts/FullLayout.tsx`, wire to context

**Files:**
- Create: `src/layouts/FullLayout.tsx` (moved from `src/components/Layout.tsx`)
- Delete: `src/components/Layout.tsx`

**Interfaces:**
- Consumes: `useNavigation()` (Task 5), `useUI()` (Task 4), `NAV_SECTIONS` (Task 3).
- Produces: `FullLayout({ children })` default export — consumed by `AppRouter.tsx` (Task 15).

- [ ] **Step 1: Move the file**

```bash
mkdir -p src/layouts
git mv src/components/Layout.tsx src/layouts/FullLayout.tsx
```

- [ ] **Step 2: Update the top of `src/layouts/FullLayout.tsx`**

Change:
```ts
import { ReactNode, useState } from "react";
import airwellLogo from "./Airwell-Logo.webp";
import type { NavPage } from "@/types/layout";
import { NAV_SECTIONS } from "@/data/Sidebaritems";
```
to:
```ts
import { ReactNode, useState } from "react";
import airwellLogo from "../components/Airwell-Logo.webp";
import type { NavPage } from "@/types/layout";
import { NAV_SECTIONS } from "@/data/Sidebaritems";
import { useNavigation } from "@/context/NavigationContext";
import { useUI } from "@/context/UIContext";
```

(The asset stays at `src/components/Airwell-Logo.webp` — only `.tsx` files move in this plan — so the relative path changes from `./Airwell-Logo.webp` to `../components/Airwell-Logo.webp`.)

- [ ] **Step 3: Update the props interface**

Change:
```ts
interface LayoutProps {
  children: ReactNode;
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
}
```
to:
```ts
interface FullLayoutProps {
  children: ReactNode;
}
```

- [ ] **Step 4: Update the component signature and state**

Change:
```tsx
export default function Layout({ children, activePage, onNavigate }: LayoutProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
```
to:
```tsx
export default function FullLayout({ children }: FullLayoutProps) {
  const { activePage, navigate } = useNavigation();
  const { sidebarOpen, toggleSidebar } = useUI();
  const [searchQuery, setSearchQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
```

- [ ] **Step 5: Update the two usages of the removed props**

Change:
```tsx
                    onClick={() => onNavigate(item.id as NavPage)}
```
to:
```tsx
                    onClick={() => navigate(item.id as NavPage)}
```

Change:
```tsx
            onClick={() => setSidebarOpen((v) => !v)}
```
to:
```tsx
            onClick={toggleSidebar}
```

- [ ] **Step 6: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: errors referencing `src/App.tsx` (it still imports the old `./components/Layout` — that's fixed in Task 15) — no errors from `src/layouts/FullLayout.tsx` itself. Confirm by running:
`pnpm exec tsc --noEmit 2>&1 | grep -v "App.tsx"`
Expected: empty output.

- [ ] **Step 7: Commit**

```bash
git add src/layouts/FullLayout.tsx
git commit -m "$(cat <<'EOF'
Move Layout to layouts/FullLayout, read nav/UI from context

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Move `Dashboard`, `EmployeeMap`, `EmployeeTracking` into `src/views/`

These three are interlinked (`Dashboard` imports from both `EmployeeTracking` and `EmployeeMap`; `EmployeeTracking` imports from `EmployeeMap`) so they move together to keep every intermediate `tsc` run clean.

**Files:**
- Create: `src/views/dashboard/Dashboard.tsx` (moved from `src/components/Dashboard.tsx`)
- Create: `src/views/employees/EmployeeMap.tsx` (moved from `src/components/EmployeeMap.tsx`)
- Create: `src/views/employees/EmployeeTracking.tsx` (moved from `src/components/EmployeeTracking.tsx`)
- Delete: `src/components/Dashboard.tsx`, `src/components/EmployeeMap.tsx`, `src/components/EmployeeTracking.tsx`

**Interfaces:**
- Consumes: `useNavigation()` (Task 5).
- Produces: `Dashboard()`, `EmployeeTracking()` — now zero-prop default exports, matching `RouteEntry.element: ComponentType` (Task 14). `EmployeeMap` default export and `StatusBadge`/`FieldActivityTimeline` named exports keep their existing signatures (unchanged, only their file path moves).

- [ ] **Step 1: Move the files**

```bash
mkdir -p src/views/dashboard src/views/employees
git mv src/components/Dashboard.tsx src/views/dashboard/Dashboard.tsx
git mv src/components/EmployeeMap.tsx src/views/employees/EmployeeMap.tsx
git mv src/components/EmployeeTracking.tsx src/views/employees/EmployeeTracking.tsx
```

- [ ] **Step 2: Fix imports in `src/views/dashboard/Dashboard.tsx`**

Change:
```ts
import { leads, salesEngineers, monthlyData, STATUS_CONFIG } from "../data/crmData";
import { fieldEmployees } from "../data/locationData";
import { FieldActivityTimeline } from "./EmployeeTracking";
import EmployeeMap, { StatusBadge } from "./EmployeeMap";
```
to:
```ts
import { leads, salesEngineers, monthlyData, STATUS_CONFIG } from "@/data/crmData";
import { fieldEmployees } from "@/data/locationData";
import { FieldActivityTimeline } from "@/views/employees/EmployeeTracking";
import EmployeeMap, { StatusBadge } from "@/views/employees/EmployeeMap";
import { useNavigation } from "@/context/NavigationContext";
```

- [ ] **Step 3: Update `Dashboard`'s signature to read `openLead` from context**

Change:
```tsx
export default function Dashboard({ onLeadClick }: { onLeadClick: (id: string) => void }) {
```
to:
```tsx
export default function Dashboard() {
  const { openLead } = useNavigation();
```

Then, in the same file, change every:
```tsx
                onClick={() => onLeadClick(l.id)}
```
(there are 3 occurrences, at what were lines 181, 211, 238) to:
```tsx
                onClick={() => openLead(l.id)}
```

- [ ] **Step 4: Fix imports in `src/views/employees/EmployeeMap.tsx`**

Change:
```ts
import { fieldEmployees, STATUS_STYLE } from "../data/locationData";
```
to:
```ts
import { fieldEmployees, STATUS_STYLE } from "@/data/locationData";
```
(its `import type {...} from "@/types/location"` line was already fixed in Task 2 — leave as-is.)

- [ ] **Step 5: Fix imports in `src/views/employees/EmployeeTracking.tsx`**

Change:
```ts
import EmployeeMap, { StatusBadge } from "./EmployeeMap";
import { fieldEmployees, STATUS_STYLE, FIELD_ACTIVITY_TIMELINE } from "../data/locationData";
```
to:
```ts
import EmployeeMap, { StatusBadge } from "@/views/employees/EmployeeMap";
import { fieldEmployees, STATUS_STYLE, FIELD_ACTIVITY_TIMELINE } from "@/data/locationData";
import { useNavigation } from "@/context/NavigationContext";
```
(its `import type {...} from "@/types/location"` line was already fixed in Task 2 — leave as-is.)

- [ ] **Step 6: Update `EmployeeTracking`'s top-level signature to read `openLead` from context**

`EmployeeTracking` currently accepts an *optional* `onLeadClick` and threads it down through `EmployeeQuickActions`, `EmployeeDetailCard`, `VisitsList`, and `VisitCard`. Only the top-level entry point changes — the internal prop-threading between these sibling sub-components stays exactly as-is (that's page-internal composition, not the App→page prop-drilling this refactor targets).

Change:
```tsx
export default function EmployeeTracking({ onLeadClick }: { onLeadClick?: (id: string) => void }) {
```
to:
```tsx
export default function EmployeeTracking() {
  const { openLead } = useNavigation();
```

Every other reference to `onLeadClick` in this file (the calls into `EmployeeQuickActions`, `EmployeeDetailCard`, `VisitsList`, and their own internal `onLeadClick?.(...)` calls) stays byte-for-byte unchanged — they still receive `onLeadClick` as a prop, it's just now sourced from the local `openLead` context value instead of a prop passed in from `App.tsx`. Only the 3 call sites where `EmployeeTracking` itself passes `onLeadClick` down need their source variable renamed from the removed prop to the new local — i.e. `<EmployeeQuickActions emp={selectedEmp} onLeadClick={onLeadClick} />` etc. keep the exact same text since `onLeadClick` is no longer a prop name in scope... to avoid ambiguity, rename the local variable to match: use `const onLeadClick = openLead;` right after the hook call instead of renaming every downstream reference:

```tsx
export default function EmployeeTracking() {
  const { openLead } = useNavigation();
  const onLeadClick = openLead;
```

This keeps every other line in the 448-line file — all the `onLeadClick`/`onLeadClick?.()` references in `EmployeeDetailCard`, `EmployeeQuickActions`, `VisitsList`, `VisitCard` — completely untouched.

- [ ] **Step 7: Typecheck**

Run: `pnpm exec tsc --noEmit 2>&1 | grep -v "App.tsx"`
Expected: empty output.

- [ ] **Step 8: Commit**

```bash
git add src/views/dashboard/Dashboard.tsx src/views/employees/EmployeeMap.tsx src/views/employees/EmployeeTracking.tsx
git commit -m "$(cat <<'EOF'
Move Dashboard, EmployeeMap, EmployeeTracking into src/views/

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: Move `Leads`/`LeadDetail` into `src/views/leads/`, add `LeadsRoute`

**Files:**
- Create: `src/views/leads/Leads.tsx` (moved from `src/components/Leads.tsx`)
- Create: `src/views/leads/LeadDetail.tsx` (moved from `src/components/LeadDetail.tsx`)
- Create: `src/views/leads/LeadsRoute.tsx`
- Delete: `src/components/Leads.tsx`, `src/components/LeadDetail.tsx`

**Interfaces:**
- Consumes: `useNavigation()` (Task 5).
- Produces: `LeadsRoute()` — zero-prop default export, the route table entry for `"leads"` (consumed by `Router.tsx`, Task 14). `LeadDetail({ leadId, onBack })` keeps its existing prop signature (it's route-detail state, analogous to a route param, not global nav state — so it stays a prop, just supplied by `LeadsRoute` instead of `App.tsx`).

- [ ] **Step 1: Move the files**

```bash
mkdir -p src/views/leads
git mv src/components/Leads.tsx src/views/leads/Leads.tsx
git mv src/components/LeadDetail.tsx src/views/leads/LeadDetail.tsx
```

- [ ] **Step 2: Fix imports and signature in `src/views/leads/Leads.tsx`**

Change:
```ts
import { leads, STATUS_CONFIG, SALES_ENGINEERS } from "../data/crmData";
import type { Lead, LeadStatus, ClientType, Application, SystemType } from "@/types/crm";
```
to:
```ts
import { leads, STATUS_CONFIG, SALES_ENGINEERS } from "@/data/crmData";
import type { Lead, LeadStatus, ClientType, Application, SystemType } from "@/types/crm";
import { useNavigation } from "@/context/NavigationContext";
```

Change:
```tsx
export default function Leads({ onLeadClick }: { onLeadClick: (id: string) => void }) {
```
to:
```tsx
export default function Leads() {
  const { openLead } = useNavigation();
```

Change (the single call site, originally at line 156):
```tsx
                onClick={() => onLeadClick(l.id)}
```
to:
```tsx
                onClick={() => openLead(l.id)}
```

- [ ] **Step 3: Fix imports in `src/views/leads/LeadDetail.tsx`**

Change:
```ts
import { leads, STATUS_CONFIG, ACTIVITY_ICONS, PIPELINE_STAGES } from "../data/crmData";
import type { LeadStatus } from "@/types/crm";
```
to:
```ts
import { leads, STATUS_CONFIG, ACTIVITY_ICONS, PIPELINE_STAGES } from "@/data/crmData";
import type { LeadStatus } from "@/types/crm";
```

`LeadDetail`'s signature (`{ leadId, onBack }`) does not change.

- [ ] **Step 4: Create `src/views/leads/LeadsRoute.tsx`**

This replaces the list/detail toggle that used to live in `src/App.tsx:35-43`:

```tsx
import Leads from "./Leads";
import LeadDetail from "./LeadDetail";
import { useNavigation } from "@/context/NavigationContext";

export default function LeadsRoute() {
  const { selectedLeadId, closeLead } = useNavigation();

  if (selectedLeadId) {
    return <LeadDetail leadId={selectedLeadId} onBack={closeLead} />;
  }
  return <Leads />;
}
```

- [ ] **Step 5: Typecheck**

Run: `pnpm exec tsc --noEmit 2>&1 | grep -v "App.tsx"`
Expected: empty output.

- [ ] **Step 6: Commit**

```bash
git add src/views/leads/Leads.tsx src/views/leads/LeadDetail.tsx src/views/leads/LeadsRoute.tsx
git commit -m "$(cat <<'EOF'
Move Leads/LeadDetail into src/views/leads/, add LeadsRoute

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: Move `Pipeline`, `ProjectDirectory`, `FollowUps` into `src/views/`

**Files:**
- Create: `src/views/pipeline/Pipeline.tsx` (moved from `src/components/Pipeline.tsx`)
- Create: `src/views/projects/ProjectDirectory.tsx` (moved from `src/components/ProjectDirectory.tsx`)
- Create: `src/views/followups/FollowUps.tsx` (moved from `src/components/FollowUps.tsx`)
- Delete: `src/components/Pipeline.tsx`, `src/components/ProjectDirectory.tsx`, `src/components/FollowUps.tsx`

**Interfaces:**
- Consumes: `useNavigation()` (Task 5).
- Produces: `Pipeline()`, `ProjectDirectory()`, `FollowUps()` — now zero-prop default exports.

- [ ] **Step 1: Move the files**

```bash
mkdir -p src/views/pipeline src/views/projects src/views/followups
git mv src/components/Pipeline.tsx src/views/pipeline/Pipeline.tsx
git mv src/components/ProjectDirectory.tsx src/views/projects/ProjectDirectory.tsx
git mv src/components/FollowUps.tsx src/views/followups/FollowUps.tsx
```

- [ ] **Step 2: Fix imports and signature in `src/views/pipeline/Pipeline.tsx`**

Change:
```ts
import { leads as initialLeads, STATUS_CONFIG, PIPELINE_STAGES } from "../data/crmData";
import type { Lead, LeadStatus } from "@/types/crm";
```
to:
```ts
import { leads as initialLeads, STATUS_CONFIG, PIPELINE_STAGES } from "@/data/crmData";
import type { Lead, LeadStatus } from "@/types/crm";
import { useNavigation } from "@/context/NavigationContext";
```

Change:
```tsx
export default function Pipeline({ onLeadClick }: { onLeadClick: (id: string) => void }) {
```
to:
```tsx
export default function Pipeline() {
  const { openLead } = useNavigation();
```

Change (the single call site, originally at line 103):
```tsx
                      onClick={() => onLeadClick(card.id)}
```
to:
```tsx
                      onClick={() => openLead(card.id)}
```

- [ ] **Step 3: Fix imports and signature in `src/views/projects/ProjectDirectory.tsx`**

Change:
```ts
import { leads, STATUS_CONFIG } from "../data/crmData";
import type { LeadStatus } from "@/types/crm";
```
to:
```ts
import { leads, STATUS_CONFIG } from "@/data/crmData";
import type { LeadStatus } from "@/types/crm";
import { useNavigation } from "@/context/NavigationContext";
```

Change:
```tsx
export default function ProjectDirectory({ onLeadClick }: { onLeadClick: (id: string) => void }) {
```
to:
```tsx
export default function ProjectDirectory() {
  const { openLead } = useNavigation();
```

Change (the single call site, originally at line 73):
```tsx
                onClick={() => onLeadClick(p.id)}
```
to:
```tsx
                onClick={() => openLead(p.id)}
```

- [ ] **Step 4: Fix imports and signature in `src/views/followups/FollowUps.tsx`**

Change:
```ts
import { leads, STATUS_CONFIG } from "../data/crmData";
import type { Lead } from "@/types/crm";
```
to:
```ts
import { leads, STATUS_CONFIG } from "@/data/crmData";
import type { Lead } from "@/types/crm";
import { useNavigation } from "@/context/NavigationContext";
```

Change:
```tsx
export default function FollowUps({ onLeadClick }: { onLeadClick: (id: string) => void }) {
```
to:
```tsx
export default function FollowUps() {
  const { openLead } = useNavigation();
```

Change every occurrence (there are 3, originally at lines 106, 147, 169):
```tsx
                          onClick={() => onLeadClick(lead.id)}
```
```tsx
                        <QuickAction icon="📝" label="Note" onClick={() => onLeadClick(lead.id)} />
```
```tsx
                onClick={() => onLeadClick(l.id)}
```
to use `openLead` in place of `onLeadClick` in each:
```tsx
                          onClick={() => openLead(lead.id)}
```
```tsx
                        <QuickAction icon="📝" label="Note" onClick={() => openLead(lead.id)} />
```
```tsx
                onClick={() => openLead(l.id)}
```

- [ ] **Step 5: Typecheck**

Run: `pnpm exec tsc --noEmit 2>&1 | grep -v "App.tsx"`
Expected: empty output.

- [ ] **Step 6: Commit**

```bash
git add src/views/pipeline/Pipeline.tsx src/views/projects/ProjectDirectory.tsx src/views/followups/FollowUps.tsx
git commit -m "$(cat <<'EOF'
Move Pipeline, ProjectDirectory, FollowUps into src/views/

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 12: Move `SalesPerformance`, `MonthlyReview` into `src/views/reports/`

Neither of these takes `onLeadClick` or any navigation prop — this is a pure file move plus import-path fix.

**Files:**
- Create: `src/views/reports/SalesPerformance.tsx` (moved from `src/components/SalesPerformance.tsx`)
- Create: `src/views/reports/MonthlyReview.tsx` (moved from `src/components/MonthlyReview.tsx`)
- Delete: `src/components/SalesPerformance.tsx`, `src/components/MonthlyReview.tsx`

- [ ] **Step 1: Move the files**

```bash
mkdir -p src/views/reports
git mv src/components/SalesPerformance.tsx src/views/reports/SalesPerformance.tsx
git mv src/components/MonthlyReview.tsx src/views/reports/MonthlyReview.tsx
```

- [ ] **Step 2: Fix the import in `src/views/reports/SalesPerformance.tsx`**

Change:
```ts
import { salesEngineers } from "../data/crmData";
```
to:
```ts
import { salesEngineers } from "@/data/crmData";
```

- [ ] **Step 3: Fix the import in `src/views/reports/MonthlyReview.tsx`**

Change:
```ts
import { monthlyData, leads, salesEngineers, MONTHLY_LABELS } from "../data/crmData";
```
to:
```ts
import { monthlyData, leads, salesEngineers, MONTHLY_LABELS } from "@/data/crmData";
```

- [ ] **Step 4: Typecheck**

Run: `pnpm exec tsc --noEmit 2>&1 | grep -v "App.tsx"`
Expected: empty output.

- [ ] **Step 5: Commit**

```bash
git add src/views/reports/SalesPerformance.tsx src/views/reports/MonthlyReview.tsx
git commit -m "$(cat <<'EOF'
Move SalesPerformance, MonthlyReview into src/views/reports/

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 13: Move `UserManagement`, `AccessManagement` into `src/views/admin/`

Neither imports from `src/data/`; both define their local types inline (`Role`, `UserStatus`, `User`, `Permission`) and are self-contained — this is a pure file move with no import changes at all.

**Files:**
- Create: `src/views/admin/UserManagement.tsx` (moved from `src/components/UserManagement.tsx`)
- Create: `src/views/admin/AccessManagement.tsx` (moved from `src/components/AccessManagement.tsx`)
- Delete: `src/components/UserManagement.tsx`, `src/components/AccessManagement.tsx`

- [ ] **Step 1: Move the files**

```bash
mkdir -p src/views/admin
git mv src/components/UserManagement.tsx src/views/admin/UserManagement.tsx
git mv src/components/AccessManagement.tsx src/views/admin/AccessManagement.tsx
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit 2>&1 | grep -v "App.tsx"`
Expected: empty output (no import lines needed changes in either file).

- [ ] **Step 3: Commit**

```bash
git add src/views/admin/UserManagement.tsx src/views/admin/AccessManagement.tsx
git commit -m "$(cat <<'EOF'
Move UserManagement, AccessManagement into src/views/admin/

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 14: Create the centralized route table (`src/routes/Router.tsx`)

At this point every feature view exists under `src/views/` and `src/components/` contains only the two static assets (`Airwell-Logo.webp`, `favicon.png`) — no `.tsx` files. `src/App.tsx` is still the only file with stale imports; it's rewritten in Task 15.

**Files:**
- Create: `src/routes/Router.tsx`

**Interfaces:**
- Consumes: `Loadable` (Task 6), `RouteEntry`/`NavPage` from `@/types/layout` (Task 3), `ComingSoon` (Task 7), every view's default export (Tasks 9-13).
- Produces: `routes: RouteEntry[]` — consumed by `AppRouter.tsx` (Task 15).

- [ ] **Step 1: Create `src/routes/Router.tsx`**

```tsx
import { Loadable } from "./Loadable";
import type { RouteEntry } from "@/types/layout";
import ComingSoon from "@/views/shared/ComingSoon";

const Dashboard = Loadable(() => import("@/views/dashboard/Dashboard"));
const LeadsRoute = Loadable(() => import("@/views/leads/LeadsRoute"));
const Pipeline = Loadable(() => import("@/views/pipeline/Pipeline"));
const ProjectDirectory = Loadable(() => import("@/views/projects/ProjectDirectory"));
const FollowUps = Loadable(() => import("@/views/followups/FollowUps"));
const EmployeeTracking = Loadable(() => import("@/views/employees/EmployeeTracking"));
const SalesPerformance = Loadable(() => import("@/views/reports/SalesPerformance"));
const MonthlyReview = Loadable(() => import("@/views/reports/MonthlyReview"));
const UserManagement = Loadable(() => import("@/views/admin/UserManagement"));
const AccessManagement = Loadable(() => import("@/views/admin/AccessManagement"));

export const routes: RouteEntry[] = [
  { id: "dashboard", element: Dashboard },
  { id: "leads", element: LeadsRoute },
  { id: "pipeline", element: Pipeline },
  { id: "projects", element: ProjectDirectory },
  { id: "followups", element: FollowUps },
  { id: "employee-tracking", element: EmployeeTracking },
  { id: "sales-performance", element: SalesPerformance },
  { id: "monthly-review", element: MonthlyReview },
  { id: "user-management", element: UserManagement },
  { id: "access-management", element: AccessManagement },
  { id: "reports", element: () => <ComingSoon page="reports" /> },
  { id: "settings", element: () => <ComingSoon page="settings" /> },
];
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit 2>&1 | grep -v "App.tsx"`
Expected: empty output.

- [ ] **Step 3: Commit**

```bash
git add src/routes/Router.tsx
git commit -m "$(cat <<'EOF'
Add centralized lazy-loaded route table

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 15: Wire `AppRouter`, gut `App.tsx`, update `main.tsx` bootstrap order

**Files:**
- Create: `src/routes/AppRouter.tsx`
- Modify: `src/App.tsx` (full rewrite)
- Modify: `src/main.tsx` (full rewrite)

**Interfaces:**
- Consumes: `FullLayout` (Task 8), `routes` (Task 14), `useNavigation()` (Task 5), `NavigationProvider` (Task 5), `UIProvider` (Task 4), `Spinner` (Task 6).

- [ ] **Step 1: Create `src/routes/AppRouter.tsx`**

```tsx
import FullLayout from "@/layouts/FullLayout";
import { routes } from "./Router";
import { useNavigation } from "@/context/NavigationContext";

export default function AppRouter() {
  const { activePage } = useNavigation();
  const route = routes.find((r) => r.id === activePage);
  const Page = route?.element;

  return (
    <FullLayout>
      {Page ? <Page /> : null}
    </FullLayout>
  );
}
```

- [ ] **Step 2: Rewrite `src/App.tsx`**

Replace the entire file content with:

```tsx
import AppRouter from "@/routes/AppRouter";

export default function App() {
  return <AppRouter />;
}
```

- [ ] **Step 3: Rewrite `src/main.tsx`**

Replace the entire file content with:

```tsx
import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { NavigationProvider } from './context/NavigationContext'
import { UIProvider } from './context/UIContext'
import Spinner from './components/shared/Spinner'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NavigationProvider>
      <UIProvider>
        <Suspense fallback={<Spinner />}>
          <App />
        </Suspense>
      </UIProvider>
    </NavigationProvider>
  </React.StrictMode>,
)
```

- [ ] **Step 4: Typecheck (full, no filtering this time)**

Run: `pnpm exec tsc --noEmit`
Expected: no errors anywhere in the project.

- [ ] **Step 5: Commit**

```bash
git add src/routes/AppRouter.tsx src/App.tsx src/main.tsx
git commit -m "$(cat <<'EOF'
Wire AppRouter and provider bootstrap; gut App.tsx to router mount

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 16: Final cleanup and verification

**Files:**
- Verify: no `.tsx`/`.ts` files remain in `src/components/` other than none (it should now hold only `Airwell-Logo.webp` and `favicon.png`)

- [ ] **Step 1: Confirm no leftover files or stale references**

Run: `ls src/components/`
Expected: only `Airwell-Logo.webp` and `favicon.png`.

Run: `grep -rn "from \"\.\./components\|from \"\./components" src/ --include=*.tsx --include=*.ts`
Expected: no matches (every consumer now imports views from `@/views/...` or the layout from `@/layouts/...`).

Run: `grep -rn "components/Layout\|components/Dashboard\|components/Leads\|components/Pipeline\|components/ProjectDirectory\|components/FollowUps\|components/EmployeeTracking\|components/EmployeeMap\|components/SalesPerformance\|components/MonthlyReview\|components/UserManagement\|components/AccessManagement" src/`
Expected: no matches.

- [ ] **Step 2: Full typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Production build**

Run: `pnpm build`
Expected: build succeeds with no errors or warnings about missing modules.

- [ ] **Step 4: Manual click-through in the dev server**

The dev server is already running per `AGENTS.md`. Open the preview and verify, comparing against the behavior on `main` before this refactor:
- Every sidebar nav item (Dashboard, Leads, Pipeline, Projects, Follow-ups, Employee Tracking, Sales Performance, Monthly Review, User Management, Access Management, Reports, Settings) renders its page with no visual difference.
- The sidebar collapse/expand toggle (hamburger icon in the topbar) still hides/shows the sidebar.
- Clicking a lead row/card from each of these 5 entry points still opens `LeadDetail`, and its "back" affordance still returns to the `Leads` list: Dashboard's recent-leads list, Leads' own row click, Pipeline's card click, ProjectDirectory's row click, FollowUps' lead click.
- Employee Tracking's "view lead" action (nested inside `EmployeeDetailCard`/`VisitCard`) still opens `LeadDetail`.
- No console errors appear in the browser dev tools during navigation.

- [ ] **Step 5: Commit only if Steps 1-4 required any fix-up**

If everything passed with no further changes, there is nothing to commit for this task — Task 15's commit is the final one. If any fix-ups were needed, stage exactly those files and commit:

```bash
git add -A
git commit -m "$(cat <<'EOF'
Fix up remaining references after architecture restructure

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```
