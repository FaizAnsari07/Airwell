# Sub-project 1: Field & data-model alignment — design spec

Date: 2026-09-12

## Context

This is the first of 6 sub-projects decomposing a larger feature request
(numbered items 1-15 from the user's message). The full breakdown and
build order, as agreed with the user:

1. **Field & data-model alignment** (this spec) — items 1, 2, 3, 4, 10
2. Role-based visibility (Super Admin → Manager → Staff) — items 8, 12, 13
3. Documents & notifications framework — items 5, 6, 11
4. Payments & receipts — item 7
5. Won workflow & assignment — items 9, 14
6. Project Update tab (daily site photos) — item 15

Persistence for all sub-projects: **in-memory only for now** (no
localStorage, no backend) — confirmed with the user; state resets on
page refresh, matching the app's current behavior.

This spec covers sub-project 1 only.

## Goal

Align the Leads data model, Add/Edit Lead form, and Leads table with
the real business vocabulary from `src/imports/Enquiry_Sheet_-_STAR_Airwell-2.xlsx`
(the actual STAR Airwell enquiry tracking sheet), and add the two
missing fields to User Management (`Reports to` / manager assignment,
`Target Amount`). No UI redesign — same layout, same visual style,
same components — only the dropdown option sets, the underlying types,
and the specific fields present on each form change.

## Source-of-truth data (extracted from the real xlsx)

The pasted Excel excerpt in the original request had a couple of
columns that don't exist in the actual file (`Advanced Received in
Lakhs`, `Balance Amount`) — those are deferred to sub-project 4
(Payments), which will compute running balances from a payment ledger
rather than track them as static Lead fields. The real file's columns
are: Sr. No, Name of the Project, Sales Engg, Type of Client, Source
of Enquiry, Source Name, Application, Location, Type of System, HP/TR
(one combined numeric column), Value (in Lakhs), then per-month status
snapshots (Dec-25 through Aug-26), Remarks, Reason for Lost.

Distinct values found across all 294 populated rows:

- **Type of Client:** Individual, Corporate, Builder / Developer, TKC, Government
- **Source of Enquiry:** Client, Architect, PMC, TKC, Consultant
- **Application:** Residence, Office, Others, Villa, Apartment, Club House, Showroom, Banquet / Convention Hall, Factory, Hospital, Hotel, Restaurant, Airport
- **Type of System:** VRV, DX, DX Ductable, DX Cassette, DX Hi Wall, Ventilation, CHW, FITOUT, AHU with VRV, AHU with DX
- **HP / TR:** a single numeric column — never two separate numbers

Per the user's decisions:
- The pipeline-stage vocabulary (`LeadStatus`, 10 stages) is **not**
  changed in this sub-project — kept exactly as today. The real
  sheet's 6-stage vocabulary and the new "Won" semantics are handled
  by sub-project 5, not here.
- The mock lead list stays at its current size (12 leads, not the 294
  real rows) — only the *shape* of each field is corrected.
- Sales engineer names (`Rajan Mehta`, `Priya Desai`, `Amit Kulkarni`,
  `Suresh Pillai`, `Deepak Verma`) are **not** renamed to the real
  roster (`Vasiq`, `Faisal`, `Shehwar`, `Deepak`) in this pass. That
  was never one of the 15 requested items — it surfaced only from
  reading the xlsx — and renaming would force collapsing 5 names into
  4, which means merging two people's stats in the `salesEngineers`
  performance array (used by Sales Performance / Monthly Review),
  silently changing reported target/achieved numbers. Out of scope
  without an explicit ask.

## Type changes (`src/data/crmData.ts`, `src/types/crm.ts` after the
architecture refactor — same file either way, this spec doesn't
depend on which restructure state the repo is in)

```ts
export type ClientType = "Individual" | "Corporate" | "Builder / Developer" | "TKC" | "Government";
export type EnquirySource = "Client" | "Architect" | "PMC" | "TKC" | "Consultant";
export type Application =
  | "Residence" | "Office" | "Others" | "Villa" | "Apartment"
  | "Club House" | "Showroom" | "Banquet / Convention Hall"
  | "Factory" | "Hospital" | "Hotel" | "Restaurant" | "Airport";
export type SystemType =
  | "VRV" | "DX" | "DX Ductable" | "DX Cassette" | "DX Hi Wall"
  | "Ventilation" | "CHW" | "FITOUT" | "AHU with VRV" | "AHU with DX";
```

`Lead.hp: number; Lead.tr: number` becomes:

```ts
capacity: number;
capacityUnit: "HP" | "TR";
```

## Mock lead remapping (all 12 existing leads keep their story, only
the enum values and hp/tr shape change)

| Lead | clientType | enquirySource | application | systemType | hp/tr → capacity/unit |
|---|---|---|---|---|---|
| L001 Bharat Forge Plant Expansion | Industrial→**Corporate** | Direct→**Client** | Process Cooling→**Factory** | Chiller→**CHW** | tr:200 → capacity:200, unit:"TR" |
| L002 Apollo Hospitals HVAC Upgrade | Institutional→**Corporate** | Referral→**Consultant** | Comfort AC→**Hospital** | Chiller→**CHW** | tr:300 → capacity:300, unit:"TR" |
| L003 Tata Motors Assembly Line Cooling | Industrial→**Corporate** | Tender→**PMC** | Industrial HVAC→**Factory** | Cooling Tower→**Ventilation** | hp:500 → capacity:500, unit:"HP" |
| L004 DLF IT Park Data Center | Commercial→**Builder / Developer** | Consultant→**Consultant** | Data Center Cooling→**Office** | Chiller→**CHW** | tr:500 → capacity:500, unit:"TR" |
| L005 Cipla Pharma Cold Storage | Industrial→**Corporate** | Direct→**Client** | Pharma→**Factory** | DX Split→**DX** | hp:120 → capacity:120, unit:"HP" |
| L006 Infosys Campus VRF System | Commercial→**Corporate** | Referral→**Consultant** | Comfort AC→**Office** | VRF→**VRV** | tr:150 → capacity:150, unit:"TR" |
| L007 Reliance Retail Warehouse Cooling | Commercial→**Corporate** | Direct→**Client** | Cold Storage→**Others** | Package Unit→**DX Ductable** | hp:200 → capacity:200, unit:"HP" |
| L008 HDFC Bank Data Center | Commercial→**Corporate** | Consultant→**Consultant** | Data Center Cooling→**Office** | Chiller→**CHW** | tr:250 → capacity:250, unit:"TR" |
| L009 Oberoi Hotel HVAC Retrofit | Commercial→**Corporate** | Referral→**Consultant** | Comfort AC→**Hotel** | Chiller→**CHW** | tr:180 → capacity:180, unit:"TR" |
| L010 Mahindra Auto Factory | Industrial→**Corporate** | Exhibition→**Client** | Industrial HVAC→**Factory** | AHU→**AHU with VRV** | hp:300 → capacity:300, unit:"HP" |
| L011 Sun Pharma Cleanroom HVAC | Industrial→**Corporate** | Direct→**Client** | Pharma→**Factory** | AHU→**AHU with DX** | hp:180 → capacity:180, unit:"HP" |
| L012 Godrej Properties Office Complex | Commercial→**Builder / Developer** | Consultant→**Consultant** | Comfort AC→**Office** | VRF→**VRV** | tr:120 → capacity:120, unit:"TR" |

This exercises 3 of 5 `ClientType` values, 3 of 5 `EnquirySource`
values, 6 of 13 `Application` values, and 7 of 10 `SystemType` values
across the 12 rows — every value not hit by a sample row is still a
valid, selectable dropdown option, just not pre-populated on a mock
row.

## Add Lead form (`AddLeadModal` in `Leads.tsx`)

Today's form only has: Project Name, Client Name, Client Contact,
Client Email, Location, Sales Engineer (select), System Type (select,
old vocab), Value, Expected Booking Date. It's missing Client Type,
Enquiry Source, Source Name, Application, and any HP/TR input at all
— exactly item 2/3's complaint that the form doesn't match the table.

New field set (all in the existing 2-column grid layout, same modal
chrome):
- Project Name (text, full width) — unchanged
- Client Name, Client Contact, Client Email — unchanged
- Location (text) — unchanged (stays free text; see below)
- Sales Engineer (select) — unchanged options
- **Client Type (select, new)** — Individual/Corporate/Builder / Developer/TKC/Government
- **Enquiry Source (select, new)** — Client/Architect/PMC/TKC/Consultant
- **Source Name (text, new)** — matches the existing `sourceName` data field, which the form never exposed
- **Application (select, new)** — the 13-value list above
- System Type (select) — same field, options updated to the 10 real values
- **Capacity (number) + unit radio (new)** — replaces "no HP/TR input existed before"; a number field paired with two radio buttons labeled "HP" and "TR"
- Value (₹ Lakhs) — unchanged
- Expected Booking Date — unchanged

Status is not selectable on the Add form (new leads default to `"New
Enquiry"`), matching today's behavior of not exposing status there.

## Leads table & filters

- The `HP/TR` column body changes from `{l.hp > 0 ? l.hp+"HP" : l.tr+"TR"}`
  to `{l.capacity}{l.capacityUnit}`; the header label stays "HP/TR".
- The Location filter's hardcoded 8-city list (`Pune, Mumbai,
  Hyderabad, Bangalore, Chennai, Nagpur, Nashik, Vadodara`) no longer
  matches the granular real localities (Kokapet, Kondapur, Gandipet,
  ...). It's replaced with an options list derived at render time from
  the distinct `location` values actually present in `leads` — no
  fixed city list to maintain, and it naturally stays correct however
  the mock/real data changes later.
- The `APPLICATIONS`/`SYSTEM_TYPES`/`CLIENT_TYPES` local option arrays
  in `Leads.tsx` (used for the toolbar filter dropdowns) are updated
  to the new value sets.

## User Management

`User` interface gains:
```ts
managerId?: string;   // id of the Sales Manager this user reports to
targetAmount?: number; // ₹ Lakhs
```

`UserModal` (Add/Edit form) gains two fields in its existing grid:
- **Reports to (select, new)** — options are every user in the current
  list whose `role === "Sales Manager"`, plus a blank "— None —"
  default. Shown for every role (a Super Admin might still report to
  no one; a Sales Manager might report to another Sales Manager in a
  larger org — the field doesn't restrict by the editing user's own
  role, since enforcement of who-sees-whom is sub-project 2's job, not
  this one).
- **Target Amount (₹ Lakhs) (number, new)**

Mock `USERS` data gains a `managerId` pointing every Sales Engineer
and Field Support user at `U002` (Anita Rao, the one existing Sales
Manager), and a `targetAmount` for every user with a sales-adjacent
role (Sales Manager, Sales Engineer) — Super Admin, Field Support, and
Viewer leave it unset. No table column is added for these two fields
in this pass (per the design discussion, table changes to surface
manager hierarchy belong to sub-project 2, which implements the
actual visibility rules that make the column meaningful).

## Non-goals (explicit, so nothing here gets read as a gap)

- No change to `LeadStatus` / pipeline stages.
- No change to the sales-engineer roster or performance data.
- No bulk import of the 294 real rows.
- No `Advance Received` / `Balance Amount` fields (sub-project 4).
- No enforcement of the manager→staff visibility rule (sub-project 2)
  — this sub-project only adds the `managerId` field and the form
  control to set it.

## Verification

No test framework exists in this repo (see the architecture spec).
Verification is:
1. `pnpm exec tsc --noEmit` passes.
2. `pnpm build` succeeds.
3. Manual check in the dev server: Add Lead form shows all 11 fields
   listed above with the correct dropdown options; the Leads table's
   HP/TR column renders correctly for all 12 mock leads; the Location
   filter dropdown lists exactly the locations present in the data
   (no stale Pune/Mumbai/etc. entries unless a lead actually uses
   them); User Management's Add/Edit modal shows "Reports to" and
   "Target Amount" fields.
