# Field & Data-Model Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the Leads data model, Add Lead form, and Leads table with the real STAR Airwell enquiry-sheet vocabulary, and add the two missing fields (`managerId`, `targetAmount`) to User Management — sub-project 1 of the 6-part feature request.

**Architecture:** Change four `Lead` union types and replace `hp`/`tr` with a single `capacity`/`capacityUnit` pair in `src/data/crmData.ts`, remap the 12 mock leads' values to the new vocabulary, update every file that reads `.hp`/`.tr`, rebuild `Leads.tsx`'s `AddLeadModal` to expose every field the table shows, and extend `UserManagement.tsx`'s `User` type/form with manager assignment and a target amount.

**Tech Stack:** React 19, TypeScript 5.7, Vite 8 — no new dependencies.

**Spec:** `docs/superpowers/specs/2026-09-12-fields-alignment-design.md`

**Note on repo state:** the separate architecture-restructure plan (`docs/superpowers/plans/2026-09-12-architecture-restructure.md`) has **not** been executed — files are still at their original flat locations (`src/components/Leads.tsx`, `src/data/crmData.ts`, etc.). This plan targets those current paths.

## Global Constraints

- No dependency in `package.json` is added, removed, or version-bumped.
- No test framework exists in this repo — "testing" a task means `pnpm exec tsc --noEmit` (typecheck), plus `pnpm build` and a manual check on the last task.
- `LeadStatus` (the 10-stage pipeline vocabulary) is not touched by this plan.
- The sales-engineer roster (`Rajan Mehta`, `Priya Desai`, `Amit Kulkarni`, `Suresh Pillai`, `Deepak Verma`) is not renamed.
- The mock lead count stays at 12 — no bulk import of real rows.

---

### Task 1: Update `Lead`'s union types and replace `hp`/`tr` with `capacity`/`capacityUnit`

**Files:**
- Modify: `src/data/crmData.ts:13-36`

**Interfaces:**
- Produces: `ClientType`, `EnquirySource`, `Application`, `SystemType` with their new value sets, and `Lead.capacity: number` / `Lead.capacityUnit: "HP" | "TR"` replacing `Lead.hp` / `Lead.tr` — every later task in this plan reads these exact names.

- [ ] **Step 1: Replace the four union type declarations**

In `src/data/crmData.ts`, change:
```ts
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
```
to:
```ts
export type ClientType = "Individual" | "Corporate" | "Builder / Developer" | "TKC" | "Government";
export type EnquirySource = "Client" | "Architect" | "PMC" | "TKC" | "Consultant";
export type Application =
  | "Residence"
  | "Office"
  | "Others"
  | "Villa"
  | "Apartment"
  | "Club House"
  | "Showroom"
  | "Banquet / Convention Hall"
  | "Factory"
  | "Hospital"
  | "Hotel"
  | "Restaurant"
  | "Airport";
export type SystemType =
  | "VRV"
  | "DX"
  | "DX Ductable"
  | "DX Cassette"
  | "DX Hi Wall"
  | "Ventilation"
  | "CHW"
  | "FITOUT"
  | "AHU with VRV"
  | "AHU with DX";
```

- [ ] **Step 2: Replace `hp`/`tr` on the `Lead` interface**

Change:
```ts
  hp: number;
  tr: number;
```
to:
```ts
  capacity: number;
  capacityUnit: "HP" | "TR";
```

- [ ] **Step 3: Typecheck (errors expected — later tasks fix them)**

Run: `pnpm exec tsc --noEmit`
Expected: many errors in `src/data/crmData.ts` itself (the 12 leads still use `hp`/`tr` and old enum values) and in `src/components/Leads.tsx`, `LeadDetail.tsx`, `Pipeline.tsx`, `ProjectDirectory.tsx`, `MonthlyReview.tsx`. This is expected — Task 2 and Task 3 (of this plan) fix them. Do not commit yet.

---

### Task 2: Remap the 12 mock leads to the new vocabulary

**Files:**
- Modify: `src/data/crmData.ts` (12 lead entries, `id: "L001"` through `id: "L012"`)

**Interfaces:**
- Consumes: the types from Task 1.

Apply exactly this mapping to each lead (values not listed are unchanged):

| Lead | clientType | enquirySource | application | systemType | capacity / capacityUnit (was hp/tr) |
|---|---|---|---|---|---|
| L001 | `"Corporate"` | `"Client"` | `"Factory"` | `"CHW"` | `200, "TR"` (was `hp:0, tr:200`) |
| L002 | `"Corporate"` | `"Consultant"` | `"Hospital"` | `"CHW"` | `300, "TR"` (was `hp:0, tr:300`) |
| L003 | `"Corporate"` | `"PMC"` | `"Factory"` | `"Ventilation"` | `500, "HP"` (was `hp:500, tr:0`) |
| L004 | `"Builder / Developer"` | `"Consultant"` | `"Office"` | `"CHW"` | `500, "TR"` (was `hp:0, tr:500`) |
| L005 | `"Corporate"` | `"Client"` | `"Factory"` | `"DX"` | `120, "HP"` (was `hp:120, tr:0`) |
| L006 | `"Corporate"` | `"Consultant"` | `"Office"` | `"VRV"` | `150, "TR"` (was `hp:0, tr:150`) |
| L007 | `"Corporate"` | `"Client"` | `"Others"` | `"DX Ductable"` | `200, "HP"` (was `hp:200, tr:0`) |
| L008 | `"Corporate"` | `"Consultant"` | `"Office"` | `"CHW"` | `250, "TR"` (was `hp:0, tr:250`) |
| L009 | `"Corporate"` | `"Consultant"` | `"Hotel"` | `"CHW"` | `180, "TR"` (was `hp:0, tr:180`) |
| L010 | `"Corporate"` | `"Client"` | `"Factory"` | `"AHU with VRV"` | `300, "HP"` (was `hp:300, tr:0`) |
| L011 | `"Corporate"` | `"Client"` | `"Factory"` | `"AHU with DX"` | `180, "HP"` (was `hp:180, tr:0`) |
| L012 | `"Builder / Developer"` | `"Consultant"` | `"Office"` | `"VRV"` | `120, "TR"` (was `hp:0, tr:120`) |

- [ ] **Step 1: L001 (Bharat Forge Plant Expansion)**

Change:
```ts
    clientType: "Industrial",
    enquirySource: "Direct",
    sourceName: "Mr. Ramesh Patil",
    application: "Process Cooling",
    location: "Pune",
    systemType: "Chiller",
    hp: 0, tr: 200,
```
to:
```ts
    clientType: "Corporate",
    enquirySource: "Client",
    sourceName: "Mr. Ramesh Patil",
    application: "Factory",
    location: "Pune",
    systemType: "CHW",
    capacity: 200, capacityUnit: "TR",
```

- [ ] **Step 2: L002 (Apollo Hospitals HVAC Upgrade)**

Change:
```ts
    clientType: "Institutional",
    enquirySource: "Referral",
    sourceName: "Dr. Sunil Rao",
    application: "Comfort AC",
    location: "Mumbai",
    systemType: "Chiller",
    hp: 0, tr: 300,
```
to:
```ts
    clientType: "Corporate",
    enquirySource: "Consultant",
    sourceName: "Dr. Sunil Rao",
    application: "Hospital",
    location: "Mumbai",
    systemType: "CHW",
    capacity: 300, capacityUnit: "TR",
```

- [ ] **Step 3: L003 (Tata Motors Assembly Line Cooling)**

Change:
```ts
    clientType: "Industrial",
    enquirySource: "Tender",
    sourceName: "Tata Motors Procurement",
    application: "Industrial HVAC",
    location: "Pune",
    systemType: "Cooling Tower",
    hp: 500, tr: 0,
```
to:
```ts
    clientType: "Corporate",
    enquirySource: "PMC",
    sourceName: "Tata Motors Procurement",
    application: "Factory",
    location: "Pune",
    systemType: "Ventilation",
    capacity: 500, capacityUnit: "HP",
```

- [ ] **Step 4: L004 (DLF IT Park Data Center)**

Change:
```ts
    clientType: "Commercial",
    enquirySource: "Consultant",
    sourceName: "M/s TechCool Consultants",
    application: "Data Center Cooling",
    location: "Hyderabad",
    systemType: "Chiller",
    hp: 0, tr: 500,
```
to:
```ts
    clientType: "Builder / Developer",
    enquirySource: "Consultant",
    sourceName: "M/s TechCool Consultants",
    application: "Office",
    location: "Hyderabad",
    systemType: "CHW",
    capacity: 500, capacityUnit: "TR",
```

- [ ] **Step 5: L005 (Cipla Pharma Cold Storage)**

Change:
```ts
    clientType: "Industrial",
    enquirySource: "Direct",
    sourceName: "Mr. Kiran Bhat",
    application: "Pharma",
    location: "Bangalore",
    systemType: "DX Split",
    hp: 120, tr: 0,
```
to:
```ts
    clientType: "Corporate",
    enquirySource: "Client",
    sourceName: "Mr. Kiran Bhat",
    application: "Factory",
    location: "Bangalore",
    systemType: "DX",
    capacity: 120, capacityUnit: "HP",
```

- [ ] **Step 6: L006 (Infosys Campus VRF System)**

Change:
```ts
    clientType: "Commercial",
    enquirySource: "Referral",
    sourceName: "Mr. Anand Joshi",
    application: "Comfort AC",
    location: "Chennai",
    systemType: "VRF",
    hp: 0, tr: 150,
```
to:
```ts
    clientType: "Corporate",
    enquirySource: "Consultant",
    sourceName: "Mr. Anand Joshi",
    application: "Office",
    location: "Chennai",
    systemType: "VRV",
    capacity: 150, capacityUnit: "TR",
```

- [ ] **Step 7: L007 (Reliance Retail Warehouse Cooling)**

Change:
```ts
    clientType: "Commercial",
    enquirySource: "Direct",
    sourceName: "Mr. Sanjay Kapoor",
    application: "Cold Storage",
    location: "Nagpur",
    systemType: "Package Unit",
    hp: 200, tr: 0,
```
to:
```ts
    clientType: "Corporate",
    enquirySource: "Client",
    sourceName: "Mr. Sanjay Kapoor",
    application: "Others",
    location: "Nagpur",
    systemType: "DX Ductable",
    capacity: 200, capacityUnit: "HP",
```

- [ ] **Step 8: L008 (HDFC Bank Data Center)**

Change:
```ts
    clientType: "Commercial",
    enquirySource: "Consultant",
    sourceName: "CoolTech Solutions",
    application: "Data Center Cooling",
    location: "Pune",
    systemType: "Chiller",
    hp: 0, tr: 250,
```
to:
```ts
    clientType: "Corporate",
    enquirySource: "Consultant",
    sourceName: "CoolTech Solutions",
    application: "Office",
    location: "Pune",
    systemType: "CHW",
    capacity: 250, capacityUnit: "TR",
```

- [ ] **Step 9: L009 (Oberoi Hotel HVAC Retrofit)**

Change:
```ts
    clientType: "Commercial",
    enquirySource: "Referral",
    sourceName: "Arch. Meera Pillai",
    application: "Comfort AC",
    location: "Mumbai",
    systemType: "Chiller",
    hp: 0, tr: 180,
```
to:
```ts
    clientType: "Corporate",
    enquirySource: "Consultant",
    sourceName: "Arch. Meera Pillai",
    application: "Hotel",
    location: "Mumbai",
    systemType: "CHW",
    capacity: 180, capacityUnit: "TR",
```

- [ ] **Step 10: L010 (Mahindra Auto Factory)**

Change:
```ts
    clientType: "Industrial",
    enquirySource: "Exhibition",
    sourceName: "ACREX 2026",
    application: "Industrial HVAC",
    location: "Nashik",
    systemType: "AHU",
    hp: 300, tr: 0,
```
to:
```ts
    clientType: "Corporate",
    enquirySource: "Client",
    sourceName: "ACREX 2026",
    application: "Factory",
    location: "Nashik",
    systemType: "AHU with VRV",
    capacity: 300, capacityUnit: "HP",
```

- [ ] **Step 11: L011 (Sun Pharma Cleanroom HVAC)**

Change:
```ts
    clientType: "Industrial",
    enquirySource: "Direct",
    sourceName: "Mr. Dinesh Khanna",
    application: "Pharma",
    location: "Vadodara",
    systemType: "AHU",
    hp: 180, tr: 0,
```
to:
```ts
    clientType: "Corporate",
    enquirySource: "Client",
    sourceName: "Mr. Dinesh Khanna",
    application: "Factory",
    location: "Vadodara",
    systemType: "AHU with DX",
    capacity: 180, capacityUnit: "HP",
```

- [ ] **Step 12: L012 (Godrej Properties Office Complex)**

Change:
```ts
    clientType: "Commercial",
    enquirySource: "Consultant",
    sourceName: "M/s Sterling Engineers",
    application: "Comfort AC",
    location: "Mumbai",
    systemType: "VRF",
    hp: 0, tr: 120,
```
to:
```ts
    clientType: "Builder / Developer",
    enquirySource: "Consultant",
    sourceName: "M/s Sterling Engineers",
    application: "Office",
    location: "Mumbai",
    systemType: "VRV",
    capacity: 120, capacityUnit: "TR",
```

- [ ] **Step 13: Verify every lead was updated**

Run: `grep -n "hp:\|tr:" src/data/crmData.ts`
Expected: no matches (the `Activity` fields and everything else in this file never used `hp`/`tr` as field names, so a clean grep miss confirms all 12 leads converted).

Run: `grep -n '"Industrial"\|"Institutional"\|"Residential"\|"Process Cooling"\|"Comfort AC"\|"Data Center Cooling"\|"Cold Storage"\|"Industrial HVAC"\|"Pharma"\|"Chiller"\|"VRF"\|"DX Split"\|"Package Unit"\|"Cooling Tower"\|"Direct"\|"Referral"\|"Tender"\|"Exhibition"\|"Online"' src/data/crmData.ts`
Expected: no matches (every old-vocabulary value has been replaced). Note: plain `"AHU"` is intentionally NOT in this grep list since `"AHU with VRV"` and `"AHU with DX"` legitimately contain the substring "AHU" — that's fine.

- [ ] **Step 14: Commit**

```bash
git add src/data/crmData.ts
git commit -m "$(cat <<'EOF'
Align Lead types and mock data with real enquiry-sheet vocabulary

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Update every consumer of `Lead.hp`/`Lead.tr`

**Files:**
- Modify: `src/components/LeadDetail.tsx:50`
- Modify: `src/components/LeadDetail.tsx:219`
- Modify: `src/components/Pipeline.tsx:156`
- Modify: `src/components/ProjectDirectory.tsx:86`
- Modify: `src/components/MonthlyReview.tsx:290`
- Modify: `src/components/Leads.tsx:178`

**Interfaces:**
- Consumes: `Lead.capacity: number`, `Lead.capacityUnit: "HP" | "TR"` from Task 1.

- [ ] **Step 1: `src/components/LeadDetail.tsx:50`**

Change:
```tsx
          <InfoCell label="Capacity" value={lead.hp > 0 ? `${lead.hp}HP` : `${lead.tr}TR`} mono />
```
to:
```tsx
          <InfoCell label="Capacity" value={`${lead.capacity}${lead.capacityUnit}`} mono />
```

- [ ] **Step 2: `src/components/LeadDetail.tsx:219`**

Change:
```tsx
                <DetailRow label="Capacity" value={lead.hp > 0 ? `${lead.hp} HP` : `${lead.tr} TR`} mono />
```
to:
```tsx
                <DetailRow label="Capacity" value={`${lead.capacity} ${lead.capacityUnit}`} mono />
```

- [ ] **Step 3: `src/components/Pipeline.tsx:156`**

Change:
```tsx
            <span>❄️</span> {card.systemType} · {card.hp > 0 ? `${card.hp}HP` : `${card.tr}TR`}
```
to:
```tsx
            <span>❄️</span> {card.systemType} · {card.capacity}{card.capacityUnit}
```

- [ ] **Step 4: `src/components/ProjectDirectory.tsx:86`**

Change:
```tsx
                <td className="px-4 py-3 font-mono text-slate-600">{p.hp > 0 ? `${p.hp}HP` : `${p.tr}TR`}</td>
```
to:
```tsx
                <td className="px-4 py-3 font-mono text-slate-600">{p.capacity}{p.capacityUnit}</td>
```

- [ ] **Step 5: `src/components/MonthlyReview.tsx:290`**

Change:
```tsx
                <td className="px-4 py-3 font-mono text-slate-600">{l.hp > 0 ? `${l.hp}HP` : `${l.tr}TR`}</td>
```
to:
```tsx
                <td className="px-4 py-3 font-mono text-slate-600">{l.capacity}{l.capacityUnit}</td>
```

- [ ] **Step 6: `src/components/Leads.tsx:178`**

Change:
```tsx
                <td className="px-3 py-2 text-right font-mono text-slate-600">
                  {l.hp > 0 ? `${l.hp}HP` : `${l.tr}TR`}
                </td>
```
to:
```tsx
                <td className="px-3 py-2 text-right font-mono text-slate-600">
                  {l.capacity}{l.capacityUnit}
                </td>
```

- [ ] **Step 7: Typecheck**

Run: `pnpm exec tsc --noEmit 2>&1 | grep -v "Leads.tsx\|AddLeadModal"`

(Task 4 still hasn't updated `AddLeadModal`'s hardcoded old-vocabulary `<option>` lists, so `Leads.tsx` may still show errors from that specific block — this filter isolates whether the `.hp`/`.tr` fix itself is clean.)

Expected: empty output.

- [ ] **Step 8: Commit**

```bash
git add src/components/LeadDetail.tsx src/components/Pipeline.tsx src/components/ProjectDirectory.tsx src/components/MonthlyReview.tsx src/components/Leads.tsx
git commit -m "$(cat <<'EOF'
Update capacity display to use capacity/capacityUnit fields

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Rebuild `AddLeadModal` with the full field set

**Files:**
- Modify: `src/components/Leads.tsx:1-13` (imports and top-level consts)
- Modify: `src/components/Leads.tsx:261-310` (`AddLeadModal`)

**Interfaces:**
- Consumes: `ClientType`, `EnquirySource`, `Application`, `SystemType` from `../data/crmData` (Task 1).

- [ ] **Step 1: Update the top-of-file imports and option consts**

Change:
```tsx
import { leads, STATUS_CONFIG, SALES_ENGINEERS } from "../data/crmData";
import type { Lead, LeadStatus, ClientType, Application, SystemType } from "../data/crmData";

const ALL_STATUSES: LeadStatus[] = [
  "New Enquiry", "Qualified", "Site Visit", "Quotation Sent",
  "Follow-up", "Negotiation", "Booking Confirmed", "Advance Received", "Won", "Lost",
];

const LOCATIONS = ["Pune", "Mumbai", "Hyderabad", "Bangalore", "Chennai", "Nagpur", "Nashik", "Vadodara"];
const APPLICATIONS: Application[] = ["Process Cooling", "Comfort AC", "Data Center Cooling", "Cold Storage", "Industrial HVAC", "Pharma"];
const SYSTEM_TYPES: SystemType[] = ["Chiller", "VRF", "AHU", "DX Split", "Package Unit", "Cooling Tower"];
const CLIENT_TYPES: ClientType[] = ["Industrial", "Commercial", "Institutional", "Government"];
```
to:
```tsx
import { leads, STATUS_CONFIG, SALES_ENGINEERS } from "../data/crmData";
import type { Lead, LeadStatus, ClientType, EnquirySource, Application, SystemType } from "../data/crmData";

const ALL_STATUSES: LeadStatus[] = [
  "New Enquiry", "Qualified", "Site Visit", "Quotation Sent",
  "Follow-up", "Negotiation", "Booking Confirmed", "Advance Received", "Won", "Lost",
];

const LOCATIONS = Array.from(new Set(leads.map((l) => l.location))).sort();
const APPLICATIONS: Application[] = [
  "Residence", "Office", "Others", "Villa", "Apartment", "Club House",
  "Showroom", "Banquet / Convention Hall", "Factory", "Hospital", "Hotel", "Restaurant", "Airport",
];
const SYSTEM_TYPES: SystemType[] = [
  "VRV", "DX", "DX Ductable", "DX Cassette", "DX Hi Wall", "Ventilation", "CHW", "FITOUT", "AHU with VRV", "AHU with DX",
];
const CLIENT_TYPES: ClientType[] = ["Individual", "Corporate", "Builder / Developer", "TKC", "Government"];
const ENQUIRY_SOURCES: EnquirySource[] = ["Client", "Architect", "PMC", "TKC", "Consultant"];
```

- [ ] **Step 2: Replace `AddLeadModal`'s field grid**

Change:
```tsx
function AddLeadModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Add New Lead</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-lg leading-none">×</button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          {[
            { label: "Project Name", type: "text", span: 2 },
            { label: "Client Name", type: "text" },
            { label: "Client Contact", type: "text" },
            { label: "Client Email", type: "email" },
            { label: "Location", type: "text" },
          ].map((f) => (
            <div key={f.label} className={f.span === 2 ? "col-span-2" : ""}>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">{f.label}</label>
              <input type={f.type} className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400" />
            </div>
          ))}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Sales Engineer</label>
            <select className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400">
              {SALES_ENGINEERS.map(se => <option key={se}>{se}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">System Type</label>
            <select className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400">
              {["Chiller", "VRF", "AHU", "DX Split", "Package Unit", "Cooling Tower"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Value (₹ Lakhs)</label>
            <input type="number" className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Expected Booking Date</label>
            <input type="date" className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400" />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-200">
          <button onClick={onClose} className="px-4 py-1.5 text-xs text-slate-600 border border-slate-200 rounded hover:bg-slate-50">Cancel</button>
          <button className="px-4 py-1.5 text-xs font-semibold text-white rounded" style={{ background: "#253580" }}>Save Lead</button>
        </div>
      </div>
    </div>
  );
}
```
to:
```tsx
function AddLeadModal({ onClose }: { onClose: () => void }) {
  const [capacityUnit, setCapacityUnit] = useState<"HP" | "TR">("TR");

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Add New Lead</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-lg leading-none">×</button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          {[
            { label: "Project Name", type: "text", span: 2 },
            { label: "Client Name", type: "text" },
            { label: "Client Contact", type: "text" },
            { label: "Client Email", type: "email" },
            { label: "Location", type: "text" },
            { label: "Source Name", type: "text" },
          ].map((f) => (
            <div key={f.label} className={f.span === 2 ? "col-span-2" : ""}>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">{f.label}</label>
              <input type={f.type} className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400" />
            </div>
          ))}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Sales Engineer</label>
            <select className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400">
              {SALES_ENGINEERS.map(se => <option key={se}>{se}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Client Type</label>
            <select className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400">
              {CLIENT_TYPES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Enquiry Source</label>
            <select className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400">
              {ENQUIRY_SOURCES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Application</label>
            <select className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400">
              {APPLICATIONS.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">System Type</label>
            <select className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400">
              {SYSTEM_TYPES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Capacity</label>
            <div className="flex gap-2">
              <input type="number" className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400" />
              <div className="flex items-center gap-2 flex-shrink-0 text-[11px] text-slate-600">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="capacityUnit"
                    checked={capacityUnit === "HP"}
                    onChange={() => setCapacityUnit("HP")}
                  />
                  HP
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="capacityUnit"
                    checked={capacityUnit === "TR"}
                    onChange={() => setCapacityUnit("TR")}
                  />
                  TR
                </label>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Value (₹ Lakhs)</label>
            <input type="number" className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Expected Booking Date</label>
            <input type="date" className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400" />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-200">
          <button onClick={onClose} className="px-4 py-1.5 text-xs text-slate-600 border border-slate-200 rounded hover:bg-slate-50">Cancel</button>
          <button className="px-4 py-1.5 text-xs font-semibold text-white rounded" style={{ background: "#253580" }}>Save Lead</button>
        </div>
      </div>
    </div>
  );
}
```

Note: `useState` is already imported at the top of `Leads.tsx` (`import { useState, useMemo } from "react";`) — no new import needed for the radio-toggle state.

- [ ] **Step 3: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/Leads.tsx
git commit -m "$(cat <<'EOF'
Rebuild Add Lead form with full field set matching the table

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Manual verification of the Leads changes

**Files:** none (verification only)

- [ ] **Step 1: Full typecheck and build**

Run: `pnpm exec tsc --noEmit && pnpm build`
Expected: both succeed with no errors.

- [ ] **Step 2: Manual check in the dev server**

Open the Leads page and verify:
- The table's "HP/TR" column shows values like `200TR`, `500HP` for each of the 12 rows (no `undefinedHP` or blank cells).
- Clicking "+ Add Lead" opens a form with: Project Name, Client Name, Client Contact, Client Email, Location, Source Name, Sales Engineer, Client Type, Enquiry Source, Application, System Type, Capacity (with HP/TR radio buttons), Value (₹ Lakhs), Expected Booking Date.
- The Client Type filter dropdown in the toolbar lists Individual/Corporate/Builder / Developer/TKC/Government.
- The Location filter dropdown lists exactly the locations used by the 12 leads (Pune, Mumbai, and whatever others appear in the data) — not the old fixed 8-city list.
- Open a lead's detail page (`LeadDetail`) — the "Capacity" stat and the "Capacity" row under Project Information both show the correct `<number><unit>` value, matching the table.
- Open the Pipeline board — each card's system-type line shows `<systemType> · <capacity><unit>` correctly.
- Open Project Directory and Monthly Review — their HP/TR columns render correctly for any Won leads shown there.

- [ ] **Step 3: No commit needed for this task** (verification only — if any issue is found, fix it in the relevant file and commit that fix with a message describing what was wrong, before moving to Task 6).

---

### Task 6: Add `managerId` and `targetAmount` to User Management

**Files:**
- Modify: `src/components/UserManagement.tsx:6-32` (types and mock data)
- Modify: `src/components/UserManagement.tsx:209` (pass `users` into the modal)
- Modify: `src/components/UserManagement.tsx:214-267` (`UserModal`)

**Interfaces:**
- Produces: `User.managerId?: string`, `User.targetAmount?: number` — no other task in this plan depends on these, but they establish the fields sub-project 2 (role-based visibility) will enforce against.

- [ ] **Step 1: Add the two fields to the `User` interface**

Change:
```ts
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  department: string;
  status: UserStatus;
  lastLogin: string;
  createdAt: string;
  locationSharing: boolean;
  initials: string;
  color: string;
}
```
to:
```ts
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  department: string;
  status: UserStatus;
  lastLogin: string;
  createdAt: string;
  locationSharing: boolean;
  initials: string;
  color: string;
  managerId?: string;
  targetAmount?: number;
}
```

- [ ] **Step 2: Populate the mock `USERS` array**

Change:
```ts
const USERS: User[] = [
  { id: "U001", name: "Sunil Mehta", email: "sunil.mehta@starairwell.com", phone: "+91 98765 00001", role: "Super Admin", department: "Management", status: "Active", lastLogin: "2026-08-31 09:12", createdAt: "2024-01-15", locationSharing: false, initials: "SM", color: "#253580" },
  { id: "U002", name: "Anita Rao", email: "anita.rao@starairwell.com", phone: "+91 98765 00002", role: "Sales Manager", department: "Sales", status: "Active", lastLogin: "2026-08-31 08:45", createdAt: "2024-03-10", locationSharing: false, initials: "AR", color: "#3D50A0" },
  { id: "U003", name: "Rajan Mehta", email: "rajan.mehta@starairwell.com", phone: "+91 98765 43210", role: "Sales Engineer", department: "Sales", status: "Active", lastLogin: "2026-08-31 08:50", createdAt: "2024-04-01", locationSharing: true, initials: "RM", color: "#253580" },
  { id: "U004", name: "Priya Desai", email: "priya.desai@starairwell.com", phone: "+91 87654 32109", role: "Sales Engineer", department: "Sales", status: "Active", lastLogin: "2026-08-31 08:30", createdAt: "2024-04-01", locationSharing: true, initials: "PD", color: "#39B849" },
  { id: "U005", name: "Amit Kulkarni", email: "amit.kulkarni@starairwell.com", phone: "+91 76543 21098", role: "Sales Engineer", department: "Sales", status: "Active", lastLogin: "2026-08-30 17:22", createdAt: "2024-05-15", locationSharing: true, initials: "AK", color: "#7C3AED" },
  { id: "U006", name: "Suresh Pillai", email: "suresh.pillai@starairwell.com", phone: "+91 65432 10987", role: "Sales Engineer", department: "Sales", status: "Active", lastLogin: "2026-08-31 09:00", createdAt: "2024-05-15", locationSharing: true, initials: "SP", color: "#D97706" },
  { id: "U007", name: "Deepak Verma", email: "deepak.verma@starairwell.com", phone: "+91 54321 09876", role: "Sales Engineer", department: "Sales", status: "Active", lastLogin: "2026-08-31 07:55", createdAt: "2024-06-01", locationSharing: true, initials: "DV", color: "#DC2626" },
  { id: "U008", name: "Kavya Sharma", email: "kavya.sharma@starairwell.com", phone: "+91 43210 98765", role: "Field Support", department: "Service", status: "Active", lastLogin: "2026-08-31 07:30", createdAt: "2024-07-01", locationSharing: true, initials: "KS", color: "#0891B2" },
  { id: "U009", name: "Nikhil Patil", email: "nikhil.patil@starairwell.com", phone: "+91 32109 87654", role: "Field Support", department: "Service", status: "Inactive", lastLogin: "2026-08-25 16:00", createdAt: "2024-07-15", locationSharing: false, initials: "NP", color: "#64748B" },
  { id: "U010", name: "Meera Joshi", email: "meera.joshi@starairwell.com", phone: "+91 21098 76543", role: "Viewer", department: "Finance", status: "Invited", lastLogin: "Never", createdAt: "2026-08-28", locationSharing: false, initials: "MJ", color: "#9333EA" },
];
```
to:
```ts
const USERS: User[] = [
  { id: "U001", name: "Sunil Mehta", email: "sunil.mehta@starairwell.com", phone: "+91 98765 00001", role: "Super Admin", department: "Management", status: "Active", lastLogin: "2026-08-31 09:12", createdAt: "2024-01-15", locationSharing: false, initials: "SM", color: "#253580" },
  { id: "U002", name: "Anita Rao", email: "anita.rao@starairwell.com", phone: "+91 98765 00002", role: "Sales Manager", department: "Sales", status: "Active", lastLogin: "2026-08-31 08:45", createdAt: "2024-03-10", locationSharing: false, initials: "AR", color: "#3D50A0", targetAmount: 500 },
  { id: "U003", name: "Rajan Mehta", email: "rajan.mehta@starairwell.com", phone: "+91 98765 43210", role: "Sales Engineer", department: "Sales", status: "Active", lastLogin: "2026-08-31 08:50", createdAt: "2024-04-01", locationSharing: true, initials: "RM", color: "#253580", managerId: "U002", targetAmount: 180 },
  { id: "U004", name: "Priya Desai", email: "priya.desai@starairwell.com", phone: "+91 87654 32109", role: "Sales Engineer", department: "Sales", status: "Active", lastLogin: "2026-08-31 08:30", createdAt: "2024-04-01", locationSharing: true, initials: "PD", color: "#39B849", managerId: "U002", targetAmount: 180 },
  { id: "U005", name: "Amit Kulkarni", email: "amit.kulkarni@starairwell.com", phone: "+91 76543 21098", role: "Sales Engineer", department: "Sales", status: "Active", lastLogin: "2026-08-30 17:22", createdAt: "2024-05-15", locationSharing: true, initials: "AK", color: "#7C3AED", managerId: "U002", targetAmount: 160 },
  { id: "U006", name: "Suresh Pillai", email: "suresh.pillai@starairwell.com", phone: "+91 65432 10987", role: "Sales Engineer", department: "Sales", status: "Active", lastLogin: "2026-08-31 09:00", createdAt: "2024-05-15", locationSharing: true, initials: "SP", color: "#D97706", managerId: "U002", targetAmount: 160 },
  { id: "U007", name: "Deepak Verma", email: "deepak.verma@starairwell.com", phone: "+91 54321 09876", role: "Sales Engineer", department: "Sales", status: "Active", lastLogin: "2026-08-31 07:55", createdAt: "2024-06-01", locationSharing: true, initials: "DV", color: "#DC2626", managerId: "U002", targetAmount: 150 },
  { id: "U008", name: "Kavya Sharma", email: "kavya.sharma@starairwell.com", phone: "+91 43210 98765", role: "Field Support", department: "Service", status: "Active", lastLogin: "2026-08-31 07:30", createdAt: "2024-07-01", locationSharing: true, initials: "KS", color: "#0891B2", managerId: "U002" },
  { id: "U009", name: "Nikhil Patil", email: "nikhil.patil@starairwell.com", phone: "+91 32109 87654", role: "Field Support", department: "Service", status: "Inactive", lastLogin: "2026-08-25 16:00", createdAt: "2024-07-15", locationSharing: false, initials: "NP", color: "#64748B", managerId: "U002" },
  { id: "U010", name: "Meera Joshi", email: "meera.joshi@starairwell.com", phone: "+91 21098 76543", role: "Viewer", department: "Finance", status: "Invited", lastLogin: "Never", createdAt: "2026-08-28", locationSharing: false, initials: "MJ", color: "#9333EA" },
];
```

- [ ] **Step 3: Pass `users` into the modal so it can list Sales Managers**

Change:
```tsx
      {showModal && <UserModal mode={modalMode} user={selected} onClose={() => setShowModal(false)} />}
```
to:
```tsx
      {showModal && <UserModal mode={modalMode} user={selected} users={users} onClose={() => setShowModal(false)} />}
```

- [ ] **Step 4: Update `UserModal`'s signature and add the two new fields**

Change:
```tsx
function UserModal({ mode, user, onClose }: { mode: "add" | "edit"; user: User | null; onClose: () => void }) {
  return (
```
to:
```tsx
function UserModal({ mode, user, users, onClose }: { mode: "add" | "edit"; user: User | null; users: User[]; onClose: () => void }) {
  const managers = users.filter((u) => u.role === "Sales Manager");

  return (
```

Change:
```tsx
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Department</label>
            <select defaultValue={user?.department ?? "Sales"}
              className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400">
              {["Management","Sales","Service","Finance","Operations"].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="col-span-2 flex items-center gap-3 p-3 bg-slate-50 rounded border border-slate-200">
```
to:
```tsx
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Department</label>
            <select defaultValue={user?.department ?? "Sales"}
              className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400">
              {["Management","Sales","Service","Finance","Operations"].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Reports to</label>
            <select defaultValue={user?.managerId ?? ""}
              className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400">
              <option value="">— None —</option>
              {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Target Amount (₹ Lakhs)</label>
            <input type="number" defaultValue={user?.targetAmount ?? ""}
              className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400" />
          </div>
          <div className="col-span-2 flex items-center gap-3 p-3 bg-slate-50 rounded border border-slate-200">
```

- [ ] **Step 5: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/UserManagement.tsx
git commit -m "$(cat <<'EOF'
Add manager assignment and target amount to User Management

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Full typecheck and build**

Run: `pnpm exec tsc --noEmit && pnpm build`
Expected: both succeed with no errors.

- [ ] **Step 2: Manual check in the dev server**

Open User Management, click "+ Invite User": the modal now shows Full Name, Email, Phone, Role, Department, **Reports to** (listing "Anita Rao" and a "— None —" default), **Target Amount (₹ Lakhs)**, and the Location Sharing toggle. Click "Edit" on Rajan Mehta (or any Sales Engineer row) and confirm the modal opens with "Reports to" pre-selected to Anita Rao and Target Amount pre-filled with `180`.

- [ ] **Step 3: No commit needed** if Steps 1-2 pass cleanly. If any issue surfaces, fix it in the relevant file, verify again, and commit that fix with a message describing what was wrong.
