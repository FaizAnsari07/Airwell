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

export const fieldEmployees: FieldEmployee[] = [
  {
    id: "E001",
    name: "Rajan Mehta",
    initials: "RM",
    designation: "Senior Sales Engineer",
    department: "Sales",
    phone: "+91 98765 43210",
    email: "rajan.mehta@starairwell.com",
    status: "At Customer Site",
    locationSharingEnabled: true,
    currentPosition: { lat: 18.6139, lng: 73.8141 },
    currentAddress: "Bharat Forge Campus, Mundhwa, Pune",
    currentActivity: "Client Negotiation",
    currentProjectName: "Bharat Forge Plant Expansion",
    currentLeadId: "L001",
    lastUpdated: "10:32 min ago",
    firstCheckIn: "09:05 AM",
    lastCheckIn: "10:15 AM",
    todayVisits: 2,
    completedVisits: 1,
    distanceTravelled: 24.3,
    color: "#253580",
    todayRoute: [
      {
        id: "r1", index: 1, type: "office",
        label: "STAR Airwell Office",
        address: "Baner Road, Pune 411 045",
        position: { lat: 18.5604, lng: 73.7827 },
        arrivalTime: "08:50 AM", departureTime: "09:05 AM", duration: "15 min",
        purpose: "Day start / briefing",
      },
      {
        id: "r2", index: 2, type: "customer",
        label: "Reliance Retail Warehouse",
        address: "MIDC Nagpur Road, Nagpur",
        position: { lat: 18.6139, lng: 73.8141 },
        arrivalTime: "10:15 AM", departureTime: "11:45 AM", duration: "1h 30m",
        purpose: "Technical presentation",
        projectName: "Reliance Retail Warehouse Cooling",
        leadId: "L007",
        notes: "Presented Package Unit specs. Client wants revised quote.",
        followUpRequired: true,
      },
      {
        id: "r3", index: 3, type: "customer",
        label: "Bharat Forge Campus",
        address: "Mundhwa, Pune 411 036",
        position: { lat: 18.6180, lng: 73.8210 },
        arrivalTime: "12:30 PM",
        purpose: "Price negotiation — 200TR Chiller",
        projectName: "Bharat Forge Plant Expansion",
        leadId: "L001",
        notes: "Final price discussion ongoing.",
        followUpRequired: false,
      },
    ],
    customerVisits: [
      {
        id: "cv1", customerName: "Reliance Retail", projectName: "Warehouse Cooling", location: "Pune",
        address: "MIDC, Pune", position: { lat: 18.6139, lng: 73.8141 },
        checkIn: "10:15 AM", checkOut: "11:45 AM", duration: "1h 30m",
        purpose: "Technical Presentation", notes: "Revised quote requested by next week.",
        followUpRequired: true, leadId: "L007", status: "Completed",
      },
      {
        id: "cv2", customerName: "Bharat Forge Ltd", projectName: "Plant Expansion", location: "Pune",
        address: "Mundhwa, Pune", position: { lat: 18.6180, lng: 73.8210 },
        checkIn: "12:30 PM",
        purpose: "Negotiation", notes: "Ongoing — final decision expected by Sep 10.",
        followUpRequired: false, leadId: "L001", status: "Ongoing",
      },
    ],
  },
  {
    id: "E002",
    name: "Priya Desai",
    initials: "PD",
    designation: "Sales Engineer",
    department: "Sales",
    phone: "+91 87654 32109",
    email: "priya.desai@starairwell.com",
    status: "In Field",
    locationSharingEnabled: true,
    currentPosition: { lat: 19.0430, lng: 72.8478 },
    currentAddress: "Western Express Hwy, Andheri, Mumbai",
    currentActivity: "Travelling to Apollo Hospitals",
    currentProjectName: "Apollo Hospitals HVAC Upgrade",
    currentLeadId: "L002",
    lastUpdated: "3 min ago",
    firstCheckIn: "08:45 AM",
    lastCheckIn: "11:20 AM",
    todayVisits: 3,
    completedVisits: 2,
    distanceTravelled: 41.7,
    color: "#39B849",
    todayRoute: [
      {
        id: "r1", index: 1, type: "office",
        label: "STAR Airwell Mumbai Branch",
        address: "Andheri East, Mumbai 400 069",
        position: { lat: 19.1136, lng: 72.8697 },
        arrivalTime: "08:30 AM", departureTime: "08:45 AM", duration: "15 min",
        purpose: "Morning briefing",
      },
      {
        id: "r2", index: 2, type: "customer",
        label: "DLF IT Park — Site Visit",
        address: "Powai, Mumbai",
        position: { lat: 19.1176, lng: 72.9060 },
        arrivalTime: "09:30 AM", departureTime: "11:00 AM", duration: "1h 30m",
        purpose: "Data center thermal survey",
        projectName: "DLF IT Park Data Center",
        leadId: "L004",
        notes: "Survey completed. Drawings to be shared with design team.",
        followUpRequired: true,
      },
      {
        id: "r3", index: 3, type: "customer",
        label: "Apollo Hospitals",
        address: "Navi Mumbai, Maharashtra",
        position: { lat: 19.0244, lng: 73.0072 },
        arrivalTime: "11:20 AM", departureTime: "12:50 PM", duration: "1h 30m",
        purpose: "Quotation follow-up",
        projectName: "Apollo Hospitals HVAC Upgrade",
        leadId: "L002",
        notes: "Client reviewing quote. Asked for energy savings report.",
        followUpRequired: true,
      },
      {
        id: "r4", index: 4, type: "customer",
        label: "Apollo Hospitals — 2nd Visit",
        address: "Vashi, Navi Mumbai",
        position: { lat: 18.9936, lng: 72.9997 },
        arrivalTime: "2:30 PM",
        purpose: "HVAC demo walk-through",
        projectName: "Apollo Hospitals HVAC Upgrade",
        leadId: "L002",
      },
    ],
    customerVisits: [
      {
        id: "cv1", customerName: "DLF Limited", projectName: "IT Park Data Center", location: "Mumbai",
        address: "Powai, Mumbai", position: { lat: 19.1176, lng: 72.9060 },
        checkIn: "09:30 AM", checkOut: "11:00 AM", duration: "1h 30m",
        purpose: "Site Survey", notes: "Thermal survey completed.",
        followUpRequired: true, leadId: "L004", status: "Completed",
      },
      {
        id: "cv2", customerName: "Apollo Hospitals", projectName: "HVAC Upgrade", location: "Navi Mumbai",
        address: "Navi Mumbai", position: { lat: 19.0244, lng: 73.0072 },
        checkIn: "11:20 AM", checkOut: "12:50 PM", duration: "1h 30m",
        purpose: "Quotation Discussion", notes: "Energy savings report requested.",
        followUpRequired: true, leadId: "L002", status: "Completed",
      },
      {
        id: "cv3", customerName: "Apollo Hospitals", projectName: "HVAC Upgrade", location: "Navi Mumbai",
        address: "Vashi", position: { lat: 18.9936, lng: 72.9997 },
        checkIn: "2:30 PM",
        purpose: "Demo Walk-through",
        followUpRequired: false, leadId: "L002", status: "Ongoing",
      },
    ],
  },
  {
    id: "E003",
    name: "Amit Kulkarni",
    initials: "AK",
    designation: "Sales Engineer",
    department: "Sales",
    phone: "+91 76543 21098",
    email: "amit.kulkarni@starairwell.com",
    status: "At Customer Site",
    locationSharingEnabled: true,
    currentPosition: { lat: 18.5304, lng: 73.8767 },
    currentAddress: "Tata Motors Plant, Pimpri, Pune",
    currentActivity: "PO Follow-up & Inspection",
    currentProjectName: "Tata Motors Assembly Line Cooling",
    currentLeadId: "L003",
    lastUpdated: "18 min ago",
    firstCheckIn: "09:30 AM",
    lastCheckIn: "01:10 PM",
    todayVisits: 2,
    completedVisits: 1,
    distanceTravelled: 18.5,
    color: "#7C3AED",
    todayRoute: [
      {
        id: "r1", index: 1, type: "office",
        label: "STAR Airwell Office",
        address: "Baner Road, Pune",
        position: { lat: 18.5604, lng: 73.7827 },
        arrivalTime: "09:00 AM", departureTime: "09:30 AM", duration: "30 min",
        purpose: "Collect samples / documents",
      },
      {
        id: "r2", index: 2, type: "customer",
        label: "Mahindra Auto Factory",
        address: "Chakan, Pune",
        position: { lat: 18.7627, lng: 73.8580 },
        arrivalTime: "10:30 AM", departureTime: "12:00 PM", duration: "1h 30m",
        purpose: "Site visit + AHU layout discussion",
        projectName: "Mahindra Auto Factory",
        leadId: "L010",
        notes: "Layout approved. Quotation revision needed.",
        followUpRequired: true,
      },
      {
        id: "r3", index: 3, type: "customer",
        label: "Tata Motors Plant",
        address: "Pimpri-Chinchwad, Pune",
        position: { lat: 18.5304, lng: 73.8767 },
        arrivalTime: "01:10 PM",
        purpose: "PO follow-up & cooling tower inspection",
        projectName: "Tata Motors Assembly Line Cooling",
        leadId: "L003",
        notes: "PO expected by end of week. Site clearance done.",
        followUpRequired: false,
      },
    ],
    customerVisits: [
      {
        id: "cv1", customerName: "Mahindra & Mahindra", projectName: "Auto Factory", location: "Pune",
        address: "Chakan, Pune", position: { lat: 18.7627, lng: 73.8580 },
        checkIn: "10:30 AM", checkOut: "12:00 PM", duration: "1h 30m",
        purpose: "Site Visit", notes: "AHU layout approved.",
        followUpRequired: true, leadId: "L010", status: "Completed",
      },
      {
        id: "cv2", customerName: "Tata Motors Ltd", projectName: "Assembly Line Cooling", location: "Pune",
        address: "Pimpri-Chinchwad", position: { lat: 18.5304, lng: 73.8767 },
        checkIn: "01:10 PM",
        purpose: "PO Follow-up", notes: "PO expected Friday.",
        followUpRequired: false, leadId: "L003", status: "Ongoing",
      },
    ],
  },
  {
    id: "E004",
    name: "Suresh Pillai",
    initials: "SP",
    designation: "Senior Sales Engineer",
    department: "Sales",
    phone: "+91 65432 10987",
    email: "suresh.pillai@starairwell.com",
    status: "In Office",
    locationSharingEnabled: true,
    currentPosition: { lat: 18.5604, lng: 73.7827 },
    currentAddress: "STAR Airwell HQ, Baner, Pune",
    currentActivity: "Preparing HDFC Bank proposal",
    currentProjectName: "HDFC Bank Data Center",
    currentLeadId: "L008",
    lastUpdated: "1 min ago",
    firstCheckIn: "09:00 AM",
    lastCheckIn: "09:00 AM",
    todayVisits: 0,
    completedVisits: 0,
    distanceTravelled: 0,
    color: "#D97706",
    todayRoute: [
      {
        id: "r1", index: 1, type: "office",
        label: "STAR Airwell HQ",
        address: "Baner Road, Pune",
        position: { lat: 18.5604, lng: 73.7827 },
        arrivalTime: "09:00 AM",
        purpose: "Office day — proposal preparation",
      },
    ],
    customerVisits: [],
  },
  {
    id: "E005",
    name: "Deepak Verma",
    initials: "DV",
    designation: "Sales Engineer",
    department: "Sales",
    phone: "+91 54321 09876",
    email: "deepak.verma@starairwell.com",
    status: "At Customer Site",
    locationSharingEnabled: true,
    currentPosition: { lat: 13.0067, lng: 80.2206 },
    currentAddress: "Infosys Campus, Sholinganallur, Chennai",
    currentActivity: "VRF System Demo",
    currentProjectName: "Infosys Campus VRF System",
    currentLeadId: "L006",
    lastUpdated: "5 min ago",
    firstCheckIn: "08:00 AM",
    lastCheckIn: "10:45 AM",
    todayVisits: 2,
    completedVisits: 1,
    distanceTravelled: 32.1,
    color: "#DC2626",
    todayRoute: [
      {
        id: "r1", index: 1, type: "office",
        label: "Chennai Branch",
        address: "OMR Road, Chennai",
        position: { lat: 12.9716, lng: 80.2137 },
        arrivalTime: "08:00 AM", departureTime: "09:00 AM", duration: "1h",
        purpose: "Morning start + document collection",
      },
      {
        id: "r2", index: 2, type: "customer",
        label: "Oberoi Hotel",
        address: "Anna Salai, Chennai",
        position: { lat: 13.0673, lng: 80.2525 },
        arrivalTime: "09:45 AM", departureTime: "10:30 AM", duration: "45 min",
        purpose: "Initial site visit — HVAC scope",
        projectName: "Oberoi Hotel HVAC Retrofit",
        leadId: "L009",
        notes: "Hotel GM met. Scope confirmed — 180TR system.",
        followUpRequired: true,
      },
      {
        id: "r3", index: 3, type: "customer",
        label: "Infosys Campus",
        address: "Sholinganallur, Chennai",
        position: { lat: 13.0067, lng: 80.2206 },
        arrivalTime: "10:45 AM",
        purpose: "VRF System Demo & Budget discussion",
        projectName: "Infosys Campus VRF System",
        leadId: "L006",
      },
    ],
    customerVisits: [
      {
        id: "cv1", customerName: "Oberoi Hotels", projectName: "HVAC Retrofit", location: "Chennai",
        address: "Anna Salai, Chennai", position: { lat: 13.0673, lng: 80.2525 },
        checkIn: "09:45 AM", checkOut: "10:30 AM", duration: "45 min",
        purpose: "Site Visit", notes: "180TR scope confirmed.",
        followUpRequired: true, leadId: "L009", status: "Completed",
      },
      {
        id: "cv2", customerName: "Infosys Ltd", projectName: "Campus VRF System", location: "Chennai",
        address: "Sholinganallur, Chennai", position: { lat: 13.0067, lng: 80.2206 },
        checkIn: "10:45 AM",
        purpose: "VRF Demo", notes: "Budget approval discussion ongoing.",
        followUpRequired: false, leadId: "L006", status: "Ongoing",
      },
    ],
  },
  {
    id: "E006",
    name: "Kavya Sharma",
    initials: "KS",
    designation: "Field Support Engineer",
    department: "Service",
    phone: "+91 43210 98765",
    email: "kavya.sharma@starairwell.com",
    status: "In Field",
    locationSharingEnabled: true,
    currentPosition: { lat: 20.0059, lng: 73.7700 },
    currentAddress: "Mumbai-Agra Highway, Near Nashik",
    currentActivity: "Travelling to AMC Service Visit",
    lastUpdated: "8 min ago",
    firstCheckIn: "07:30 AM",
    lastCheckIn: "10:00 AM",
    todayVisits: 1,
    completedVisits: 1,
    distanceTravelled: 85.2,
    color: "#0891B2",
    todayRoute: [
      {
        id: "r1", index: 1, type: "office",
        label: "STAR Airwell HQ",
        address: "Baner Road, Pune",
        position: { lat: 18.5604, lng: 73.7827 },
        arrivalTime: "07:30 AM", departureTime: "08:00 AM", duration: "30 min",
        purpose: "Collect service kit",
      },
      {
        id: "r2", index: 2, type: "customer",
        label: "Mahindra Industrial Park",
        address: "Igatpuri, Nashik",
        position: { lat: 19.6985, lng: 73.5598 },
        arrivalTime: "10:00 AM", departureTime: "11:30 AM", duration: "1h 30m",
        purpose: "Quarterly AMC service — Chiller",
        notes: "Filter replacement done. All readings normal.",
        followUpRequired: false,
      },
    ],
    customerVisits: [
      {
        id: "cv1", customerName: "Mahindra Industrial Park", projectName: "Quarterly AMC", location: "Nashik",
        address: "Igatpuri, Nashik", position: { lat: 19.6985, lng: 73.5598 },
        checkIn: "10:00 AM", checkOut: "11:30 AM", duration: "1h 30m",
        purpose: "AMC Service Visit", notes: "Chiller serviced. All OK.",
        followUpRequired: false, status: "Completed",
      },
    ],
  },
  {
    id: "E007",
    name: "Nikhil Patil",
    initials: "NP",
    designation: "Technical Support",
    department: "Service",
    phone: "+91 32109 87654",
    email: "nikhil.patil@starairwell.com",
    status: "On Leave",
    locationSharingEnabled: false,
    lastUpdated: "Yesterday",
    firstCheckIn: undefined,
    lastCheckIn: undefined,
    todayVisits: 0,
    completedVisits: 0,
    distanceTravelled: 0,
    color: "#64748B",
    todayRoute: [],
    customerVisits: [],
  },
];

export const FIELD_ACTIVITY_TIMELINE = [
  { time: "09:05 AM", employee: "Rajan Mehta", icon: "🏢", event: "Checked out from STAR Airwell Office", type: "checkout" },
  { time: "09:30 AM", employee: "Amit Kulkarni", icon: "🏢", event: "Checked out from STAR Airwell Office", type: "checkout" },
  { time: "10:00 AM", employee: "Kavya Sharma", icon: "✅", event: "Completed AMC service at Mahindra Industrial Park", type: "complete" },
  { time: "10:15 AM", employee: "Rajan Mehta", icon: "📍", event: "Checked in at Reliance Retail Warehouse", type: "checkin" },
  { time: "10:30 AM", employee: "Amit Kulkarni", icon: "📍", event: "Checked in at Mahindra Auto Factory, Chakan", type: "checkin" },
  { time: "10:45 AM", employee: "Deepak Verma", icon: "📍", event: "Checked in at Infosys Campus, Chennai", type: "checkin" },
  { time: "11:00 AM", employee: "Priya Desai", icon: "✅", event: "Completed site survey at DLF IT Park", type: "complete" },
  { time: "11:20 AM", employee: "Priya Desai", icon: "📍", event: "Checked in at Apollo Hospitals, Navi Mumbai", type: "checkin" },
  { time: "11:45 AM", employee: "Rajan Mehta", icon: "✅", event: "Completed visit at Reliance Retail Warehouse", type: "complete" },
  { time: "12:00 PM", employee: "Amit Kulkarni", icon: "✅", event: "Completed visit at Mahindra Auto Factory", type: "complete" },
  { time: "12:30 PM", employee: "Rajan Mehta", icon: "📍", event: "Checked in at Bharat Forge Campus", type: "checkin" },
  { time: "12:50 PM", employee: "Priya Desai", icon: "✅", event: "Completed visit at Apollo Hospitals (1st)", type: "complete" },
  { time: "01:10 PM", employee: "Amit Kulkarni", icon: "📍", event: "Checked in at Tata Motors Plant, Pimpri", type: "checkin" },
  { time: "02:30 PM", employee: "Priya Desai", icon: "📍", event: "Checked in at Apollo Hospitals (2nd visit)", type: "checkin" },
];

export const STATUS_STYLE: Record<EmployeeStatus, { color: string; bg: string; dot: string; label: string }> = {
  "Online":                { color: "text-green-700",  bg: "bg-green-50",  dot: "bg-green-500",  label: "Online" },
  "In Field":              { color: "text-blue-700",   bg: "bg-blue-50",   dot: "bg-blue-500",   label: "In Field" },
  "At Customer Site":      { color: "text-indigo-700", bg: "bg-indigo-50", dot: "bg-indigo-500", label: "At Customer Site" },
  "In Office":             { color: "text-slate-700",  bg: "bg-slate-100", dot: "bg-slate-500",  label: "In Office" },
  "On Leave":              { color: "text-amber-700",  bg: "bg-amber-50",  dot: "bg-amber-400",  label: "On Leave" },
  "Offline":               { color: "text-slate-400",  bg: "bg-slate-100", dot: "bg-slate-300",  label: "Offline" },
  "Location Unavailable":  { color: "text-slate-400",  bg: "bg-slate-100", dot: "bg-slate-300",  label: "Unavailable" },
};
