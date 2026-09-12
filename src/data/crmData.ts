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
  capacity: number;
  capacityUnit: "HP" | "TR";
  valueLakhs: number;
  status: LeadStatus;
  projectStartDate?: string;
  projectEndDate?: string;
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

export const SALES_ENGINEERS = [
  "Rajan Mehta",
  "Priya Desai",
  "Amit Kulkarni",
  "Suresh Pillai",
  "Deepak Verma",
];

export const MONTHLY_LABELS = [
  "Apr 2026", "May 2026", "Jun 2026", "Jul 2026", "Aug 2026", "Sep 2026",
  "Oct 2026", "Nov 2026", "Dec 2026", "Jan 2027", "Feb 2027", "Mar 2027",
];

export const leads: Lead[] = [
  {
    id: "L001", srNo: 1,
    projectName: "Bharat Forge Plant Expansion",
    salesEngineer: "Rajan Mehta",
    clientType: "Corporate",
    enquirySource: "Client",
    sourceName: "Mr. Ramesh Patil",
    application: "Factory",
    location: "Pune",
    systemType: "CHW",
    capacity: 200, capacityUnit: "TR",
    valueLakhs: 48.5,
    status: "Negotiation",
    expectedBookingDate: "2026-09-15",
    nextFollowUp: "2026-09-02",
    leadOwner: "Rajan Mehta",
    probability: 70,
    clientName: "Bharat Forge Ltd",
    clientContact: "Mr. Ramesh Patil",
    clientEmail: "ramesh.patil@bharatforge.com",
    remarks: "Client wants extended warranty. Price negotiation ongoing.",
    enquiryDate: "2026-06-12",
    lastActivity: "2026-08-28",
    activities: [
      { id: "a1", type: "Enquiry", date: "2026-06-12", description: "Enquiry received via direct contact. Plant expansion of 3000 sqft cooling area.", by: "Rajan Mehta" },
      { id: "a2", type: "Call", date: "2026-06-18", description: "Initial discussion with Mr. Ramesh Patil. Requirements confirmed.", by: "Rajan Mehta" },
      { id: "a3", type: "Site Visit", date: "2026-06-28", description: "Site survey done. Measured heat loads. Two chiller units required.", by: "Rajan Mehta" },
      { id: "a4", type: "Quotation", date: "2026-07-05", description: "Sent detailed quotation for 2x100TR Chiller units with full installation.", by: "Rajan Mehta" },
      { id: "a5", type: "Negotiation", date: "2026-08-15", description: "Client requested 5% price reduction and 3-yr AMC. Counter-offer sent.", by: "Rajan Mehta" },
      { id: "a6", type: "Follow-up", date: "2026-08-28", description: "Follow-up call. Client reviewing internally. Decision expected by Sept 10.", by: "Rajan Mehta" },
    ],
  },
  {
    id: "L002", srNo: 2,
    projectName: "Apollo Hospitals HVAC Upgrade",
    salesEngineer: "Priya Desai",
    clientType: "Corporate",
    enquirySource: "Consultant",
    sourceName: "Dr. Sunil Rao",
    application: "Hospital",
    location: "Mumbai",
    systemType: "CHW",
    capacity: 300, capacityUnit: "TR",
    valueLakhs: 72.0,
    status: "Quotation Sent",
    expectedBookingDate: "2026-10-01",
    nextFollowUp: "2026-09-05",
    leadOwner: "Priya Desai",
    probability: 55,
    clientName: "Apollo Hospitals",
    clientContact: "Dr. Sunil Rao",
    clientEmail: "sunil.rao@apollohospitals.com",
    remarks: "Tender process expected. Need to submit lowest quote.",
    enquiryDate: "2026-07-01",
    lastActivity: "2026-08-20",
    activities: [
      { id: "b1", type: "Enquiry", date: "2026-07-01", description: "Received referral from Dr. Sunil Rao. Hospital expansion project.", by: "Priya Desai" },
      { id: "b2", type: "Site Visit", date: "2026-07-12", description: "Visited new hospital wing. 4 floors, 300TR total capacity needed.", by: "Priya Desai" },
      { id: "b3", type: "Quotation", date: "2026-08-05", description: "Comprehensive quote submitted for 3x100TR chiller + AHU units.", by: "Priya Desai" },
    ],
  },
  {
    id: "L003", srNo: 3,
    projectName: "Tata Motors Assembly Line Cooling",
    salesEngineer: "Amit Kulkarni",
    clientType: "Corporate",
    enquirySource: "PMC",
    sourceName: "Tata Motors Procurement",
    application: "Factory",
    location: "Pune",
    systemType: "Ventilation",
    capacity: 500, capacityUnit: "HP",
    valueLakhs: 35.0,
    status: "Won",
    projectStartDate: "2026-08-26",
    projectEndDate: "2026-11-15",
    expectedBookingDate: "2026-08-25",
    nextFollowUp: "2026-09-10",
    leadOwner: "Amit Kulkarni",
    probability: 95,
    clientName: "Tata Motors Ltd",
    clientContact: "Mr. Vijay Patkar",
    clientEmail: "vijay.patkar@tatamotors.com",
    remarks: "Booking confirmed. PO expected next week.",
    enquiryDate: "2026-05-15",
    lastActivity: "2026-08-25",
    activities: [
      { id: "c1", type: "Enquiry", date: "2026-05-15", description: "Tender notice received from Tata Motors procurement portal.", by: "Amit Kulkarni" },
      { id: "c2", type: "Quotation", date: "2026-06-01", description: "Technical bid submitted with 500HP cooling tower specs.", by: "Amit Kulkarni" },
      { id: "c3", type: "Negotiation", date: "2026-07-20", description: "Price negotiation. Agreed on final price. Terms finalized.", by: "Amit Kulkarni" },
      { id: "c4", type: "Booking", date: "2026-08-25", description: "Booking letter received. PO being processed.", by: "Amit Kulkarni" },
    ],
  },
  {
    id: "L004", srNo: 4,
    projectName: "DLF IT Park Data Center",
    salesEngineer: "Priya Desai",
    clientType: "Builder / Developer",
    enquirySource: "Consultant",
    sourceName: "M/s TechCool Consultants",
    application: "Office",
    location: "Hyderabad",
    systemType: "CHW",
    capacity: 500, capacityUnit: "TR",
    valueLakhs: 142.0,
    status: "Site Visit",
    expectedBookingDate: "2026-11-30",
    nextFollowUp: "2026-09-08",
    leadOwner: "Priya Desai",
    probability: 40,
    clientName: "DLF Limited",
    clientContact: "Mr. Arun Sharma",
    clientEmail: "arun.sharma@dlf.in",
    remarks: "Very high-value opportunity. Multiple vendors being evaluated.",
    enquiryDate: "2026-08-01",
    lastActivity: "2026-08-22",
    activities: [
      { id: "d1", type: "Enquiry", date: "2026-08-01", description: "Consultant introduced opportunity. 500TR data center cooling project.", by: "Priya Desai" },
      { id: "d2", type: "Site Visit", date: "2026-08-22", description: "Visited site. Preliminary assessment done. Detailed thermal study needed.", by: "Priya Desai" },
    ],
  },
  {
    id: "L005", srNo: 5,
    projectName: "Cipla Pharma Cold Storage",
    salesEngineer: "Suresh Pillai",
    clientType: "Corporate",
    enquirySource: "Client",
    sourceName: "Mr. Kiran Bhat",
    application: "Factory",
    location: "Bangalore",
    systemType: "DX",
    capacity: 120, capacityUnit: "HP",
    valueLakhs: 18.5,
    status: "Won",
    projectStartDate: "2026-08-18",
    projectEndDate: "2026-10-20",
    expectedBookingDate: "2026-08-10",
    nextFollowUp: "2026-09-15",
    leadOwner: "Suresh Pillai",
    probability: 100,
    clientName: "Cipla Ltd",
    clientContact: "Mr. Kiran Bhat",
    clientEmail: "kiran.bhat@cipla.com",
    remarks: "Advance of 30% received. Installation scheduled Sept 2026.",
    enquiryDate: "2026-04-20",
    lastActivity: "2026-08-10",
    activities: [
      { id: "e1", type: "Enquiry", date: "2026-04-20", description: "Enquiry for pharma-grade cold storage cooling system.", by: "Suresh Pillai" },
      { id: "e2", type: "Site Visit", date: "2026-05-02", description: "Site visit done. Cold storage room measurement and insulation check.", by: "Suresh Pillai" },
      { id: "e3", type: "Quotation", date: "2026-05-15", description: "Quote sent for 120HP DX system with validation support.", by: "Suresh Pillai" },
      { id: "e4", type: "Booking", date: "2026-07-01", description: "PO received. Installation timeline confirmed.", by: "Suresh Pillai" },
      { id: "e5", type: "Advance", date: "2026-08-10", description: "30% advance payment received. Material procurement started.", by: "Suresh Pillai" },
    ],
  },
  {
    id: "L006", srNo: 6,
    projectName: "Infosys Campus VRF System",
    salesEngineer: "Deepak Verma",
    clientType: "Corporate",
    enquirySource: "Consultant",
    sourceName: "Mr. Anand Joshi",
    application: "Office",
    location: "Chennai",
    systemType: "VRV",
    capacity: 150, capacityUnit: "TR",
    valueLakhs: 28.0,
    status: "Follow-up",
    expectedBookingDate: "2026-10-15",
    nextFollowUp: "2026-09-03",
    leadOwner: "Deepak Verma",
    probability: 45,
    clientName: "Infosys Ltd",
    clientContact: "Mr. Anand Joshi",
    clientEmail: "anand.joshi@infosys.com",
    remarks: "Budget approval pending at HQ level.",
    enquiryDate: "2026-07-10",
    lastActivity: "2026-08-20",
    activities: [
      { id: "f1", type: "Enquiry", date: "2026-07-10", description: "Referral from existing client. New campus block VRF requirement.", by: "Deepak Verma" },
      { id: "f2", type: "Call", date: "2026-07-18", description: "Conference call with FM team. Requirements finalized: 150TR VRF system.", by: "Deepak Verma" },
      { id: "f3", type: "Quotation", date: "2026-07-28", description: "Quotation sent with energy savings report.", by: "Deepak Verma" },
      { id: "f4", type: "Follow-up", date: "2026-08-20", description: "Budget under review. Follow-up again in 2 weeks.", by: "Deepak Verma" },
    ],
  },
  {
    id: "L007", srNo: 7,
    projectName: "Reliance Retail Warehouse Cooling",
    salesEngineer: "Rajan Mehta",
    clientType: "Corporate",
    enquirySource: "Client",
    sourceName: "Mr. Sanjay Kapoor",
    application: "Others",
    location: "Nagpur",
    systemType: "DX Ductable",
    capacity: 200, capacityUnit: "HP",
    valueLakhs: 22.0,
    status: "Qualified",
    expectedBookingDate: "2026-11-01",
    nextFollowUp: "2026-09-04",
    leadOwner: "Rajan Mehta",
    probability: 30,
    clientName: "Reliance Retail",
    clientContact: "Mr. Sanjay Kapoor",
    clientEmail: "sanjay.kapoor@relianceretail.com",
    remarks: "Early stage. Need to do technical presentation.",
    enquiryDate: "2026-08-18",
    lastActivity: "2026-08-26",
    activities: [
      { id: "g1", type: "Enquiry", date: "2026-08-18", description: "Direct inquiry for new warehouse cold storage.", by: "Rajan Mehta" },
      { id: "g2", type: "Call", date: "2026-08-26", description: "Qualifying call done. Budget confirmed at ~20-25L range.", by: "Rajan Mehta" },
    ],
  },
  {
    id: "L008", srNo: 8,
    projectName: "HDFC Bank Data Center",
    salesEngineer: "Suresh Pillai",
    clientType: "Corporate",
    enquirySource: "Consultant",
    sourceName: "CoolTech Solutions",
    application: "Office",
    location: "Pune",
    systemType: "CHW",
    capacity: 250, capacityUnit: "TR",
    valueLakhs: 65.0,
    status: "Won",
    projectStartDate: "2026-09-01",
    projectEndDate: "2026-12-15",
    expectedBookingDate: "2026-09-30",
    nextFollowUp: "2026-09-01",
    leadOwner: "Suresh Pillai",
    probability: 65,
    clientName: "HDFC Bank Ltd",
    clientContact: "Ms. Kavita Iyer",
    clientEmail: "kavita.iyer@hdfcbank.com",
    remarks: "Technical specs approved. Commercial terms under negotiation.",
    enquiryDate: "2026-06-05",
    lastActivity: "2026-08-28",
    activities: [
      { id: "h1", type: "Enquiry", date: "2026-06-05", description: "Consultant referred 250TR data center project for HDFC Bank.", by: "Suresh Pillai" },
      { id: "h2", type: "Site Visit", date: "2026-06-20", description: "Site survey. Redundancy requirement: N+1 configuration needed.", by: "Suresh Pillai" },
      { id: "h3", type: "Quotation", date: "2026-07-10", description: "Technical + commercial bid submitted. Three vendor comparison.", by: "Suresh Pillai" },
      { id: "h4", type: "Negotiation", date: "2026-08-15", description: "Technical discussion passed. Now in commercial negotiations.", by: "Suresh Pillai" },
      { id: "h5", type: "Follow-up", date: "2026-08-28", description: "Final price submission requested. Deadline: Sep 5.", by: "Suresh Pillai" },
    ],
  },
  {
    id: "L009", srNo: 9,
    projectName: "Oberoi Hotel HVAC Retrofit",
    salesEngineer: "Deepak Verma",
    clientType: "Corporate",
    enquirySource: "Consultant",
    sourceName: "Arch. Meera Pillai",
    application: "Hotel",
    location: "Mumbai",
    systemType: "CHW",
    capacity: 180, capacityUnit: "TR",
    valueLakhs: 42.0,
    status: "New Enquiry",
    expectedBookingDate: "2026-12-01",
    nextFollowUp: "2026-09-06",
    leadOwner: "Deepak Verma",
    probability: 20,
    clientName: "Oberoi Hotels",
    clientContact: "Mr. Vikram Oberoi",
    clientEmail: "vikram@oberoisupport.com",
    remarks: "Very early. Meeting to be scheduled for next week.",
    enquiryDate: "2026-08-27",
    lastActivity: "2026-08-27",
    activities: [
      { id: "i1", type: "Enquiry", date: "2026-08-27", description: "Architect referral for 180TR hotel HVAC retrofit project.", by: "Deepak Verma" },
    ],
  },
  {
    id: "L010", srNo: 10,
    projectName: "Mahindra Auto Factory",
    salesEngineer: "Amit Kulkarni",
    clientType: "Corporate",
    enquirySource: "Client",
    sourceName: "ACREX 2026",
    application: "Factory",
    location: "Nashik",
    systemType: "AHU with VRV",
    capacity: 300, capacityUnit: "HP",
    valueLakhs: 31.0,
    status: "Site Visit",
    expectedBookingDate: "2026-10-30",
    nextFollowUp: "2026-09-09",
    leadOwner: "Amit Kulkarni",
    probability: 50,
    clientName: "Mahindra & Mahindra",
    clientContact: "Mr. Rohit Deshpande",
    clientEmail: "rohit.deshpande@mahindra.com",
    remarks: "Met at ACREX exhibition. Site visit scheduled.",
    enquiryDate: "2026-08-05",
    lastActivity: "2026-08-26",
    activities: [
      { id: "j1", type: "Enquiry", date: "2026-08-05", description: "Met Mr. Rohit at ACREX 2026. Factory ventilation project discussed.", by: "Amit Kulkarni" },
      { id: "j2", type: "Call", date: "2026-08-14", description: "Follow-up call. Technical specifications collected.", by: "Amit Kulkarni" },
      { id: "j3", type: "Site Visit", date: "2026-08-26", description: "Site visit done. 3 factory sections, total 300HP AHU system.", by: "Amit Kulkarni" },
    ],
  },
  {
    id: "L011", srNo: 11,
    projectName: "Sun Pharma Cleanroom HVAC",
    salesEngineer: "Suresh Pillai",
    clientType: "Corporate",
    enquirySource: "Client",
    sourceName: "Mr. Dinesh Khanna",
    application: "Factory",
    location: "Vadodara",
    systemType: "AHU with DX",
    capacity: 180, capacityUnit: "HP",
    valueLakhs: 55.0,
    status: "Won",
    projectStartDate: "2026-07-05",
    projectEndDate: "2026-08-05",
    expectedBookingDate: "2026-07-01",
    nextFollowUp: "2026-09-20",
    leadOwner: "Suresh Pillai",
    probability: 100,
    clientName: "Sun Pharmaceutical",
    clientContact: "Mr. Dinesh Khanna",
    clientEmail: "dinesh.khanna@sunpharma.com",
    remarks: "Project won and under execution. Milestone billing in progress.",
    enquiryDate: "2026-03-10",
    lastActivity: "2026-08-01",
    activities: [
      { id: "k1", type: "Enquiry", date: "2026-03-10", description: "Cleanroom HVAC upgrade for pharmaceutical manufacturing unit.", by: "Suresh Pillai" },
      { id: "k2", type: "Site Visit", date: "2026-03-22", description: "Detailed site assessment. Clean room class requirements mapped.", by: "Suresh Pillai" },
      { id: "k3", type: "Quotation", date: "2026-04-05", description: "GMP-compliant HVAC system quotation submitted.", by: "Suresh Pillai" },
      { id: "k4", type: "Booking", date: "2026-05-15", description: "Order placed. Project execution started.", by: "Suresh Pillai" },
    ],
  },
  {
    id: "L012", srNo: 12,
    projectName: "Godrej Properties Office Complex",
    salesEngineer: "Rajan Mehta",
    clientType: "Builder / Developer",
    enquirySource: "Consultant",
    sourceName: "M/s Sterling Engineers",
    application: "Office",
    location: "Mumbai",
    systemType: "VRV",
    capacity: 120, capacityUnit: "TR",
    valueLakhs: 24.0,
    status: "Lost",
    expectedBookingDate: "2026-07-30",
    nextFollowUp: "",
    leadOwner: "Rajan Mehta",
    probability: 0,
    clientName: "Godrej Properties",
    clientContact: "Ms. Sheela Nair",
    clientEmail: "sheela.nair@godrejproperties.com",
    remarks: "Lost to competitor Daikin on price. 8% cheaper offer.",
    enquiryDate: "2026-05-10",
    lastActivity: "2026-08-01",
    activities: [
      { id: "l1", type: "Enquiry", date: "2026-05-10", description: "Consultant referred 120TR VRF project for commercial office.", by: "Rajan Mehta" },
      { id: "l2", type: "Quotation", date: "2026-06-01", description: "Submitted quote for modular VRF system.", by: "Rajan Mehta" },
      { id: "l3", type: "Note", date: "2026-08-01", description: "Lost to Daikin. Client selected based purely on pricing.", by: "Rajan Mehta" },
    ],
  },
];

export const salesEngineers: SalesEngineer[] = [
  {
    name: "Rajan Mehta",
    target: 200, achieved: 118, enquiries: 24, bookingValue: 70.5, billingValue: 48.0, collection: 42.0, pipelineValue: 140.5,
    monthlyData: [
      { month: "Apr", target: 14, achieved: 10 }, { month: "May", target: 16, achieved: 14 },
      { month: "Jun", target: 18, achieved: 16 }, { month: "Jul", target: 18, achieved: 20 },
      { month: "Aug", target: 20, achieved: 15 }, { month: "Sep", target: 22, achieved: 0 },
    ],
  },
  {
    name: "Priya Desai",
    target: 250, achieved: 142, enquiries: 18, bookingValue: 72.0, billingValue: 60.0, collection: 55.0, pipelineValue: 214.0,
    monthlyData: [
      { month: "Apr", target: 18, achieved: 14 }, { month: "May", target: 20, achieved: 18 },
      { month: "Jun", target: 22, achieved: 24 }, { month: "Jul", target: 22, achieved: 28 },
      { month: "Aug", target: 25, achieved: 22 }, { month: "Sep", target: 28, achieved: 0 },
    ],
  },
  {
    name: "Amit Kulkarni",
    target: 180, achieved: 95, enquiries: 15, bookingValue: 35.0, billingValue: 28.0, collection: 20.0, pipelineValue: 98.0,
    monthlyData: [
      { month: "Apr", target: 12, achieved: 10 }, { month: "May", target: 14, achieved: 12 },
      { month: "Jun", target: 16, achieved: 14 }, { month: "Jul", target: 18, achieved: 16 },
      { month: "Aug", target: 20, achieved: 18 }, { month: "Sep", target: 22, achieved: 0 },
    ],
  },
  {
    name: "Suresh Pillai",
    target: 220, achieved: 168, enquiries: 22, bookingValue: 73.5, billingValue: 68.0, collection: 62.0, pipelineValue: 120.0,
    monthlyData: [
      { month: "Apr", target: 16, achieved: 16 }, { month: "May", target: 18, achieved: 20 },
      { month: "Jun", target: 20, achieved: 22 }, { month: "Jul", target: 22, achieved: 24 },
      { month: "Aug", target: 24, achieved: 22 }, { month: "Sep", target: 26, achieved: 0 },
    ],
  },
  {
    name: "Deepak Verma",
    target: 160, achieved: 72, enquiries: 12, bookingValue: 28.0, billingValue: 18.0, collection: 12.0, pipelineValue: 70.0,
    monthlyData: [
      { month: "Apr", target: 10, achieved: 8 }, { month: "May", target: 12, achieved: 10 },
      { month: "Jun", target: 14, achieved: 12 }, { month: "Jul", target: 14, achieved: 14 },
      { month: "Aug", target: 16, achieved: 14 }, { month: "Sep", target: 18, achieved: 0 },
    ],
  },
];

export const monthlyData: MonthlyData[] = [
  { month: "Apr 2026", bookingForecast: 85, bookingAchieved: 78, collectionForecast: 70, collectionAchieved: 72, billingForecast: 65, billingAchieved: 60, enquiryTarget: 20, enquiryGenerated: 18 },
  { month: "May 2026", bookingForecast: 92, bookingAchieved: 88, collectionForecast: 80, collectionAchieved: 74, billingForecast: 72, billingAchieved: 70, enquiryTarget: 22, enquiryGenerated: 24 },
  { month: "Jun 2026", bookingForecast: 100, bookingAchieved: 108, collectionForecast: 88, collectionAchieved: 85, billingForecast: 80, billingAchieved: 88, enquiryTarget: 24, enquiryGenerated: 22 },
  { month: "Jul 2026", bookingForecast: 110, bookingAchieved: 115, collectionForecast: 95, collectionAchieved: 102, billingForecast: 88, billingAchieved: 90, enquiryTarget: 25, enquiryGenerated: 28 },
  { month: "Aug 2026", bookingForecast: 120, bookingAchieved: 89, collectionForecast: 100, collectionAchieved: 76, billingForecast: 92, billingAchieved: 72, enquiryTarget: 26, enquiryGenerated: 20 },
  { month: "Sep 2026", bookingForecast: 130, bookingAchieved: 0, collectionForecast: 110, collectionAchieved: 0, billingForecast: 98, billingAchieved: 0, enquiryTarget: 28, enquiryGenerated: 0 },
  { month: "Oct 2026", bookingForecast: 140, bookingAchieved: 0, collectionForecast: 120, collectionAchieved: 0, billingForecast: 105, billingAchieved: 0, enquiryTarget: 30, enquiryGenerated: 0 },
  { month: "Nov 2026", bookingForecast: 135, bookingAchieved: 0, collectionForecast: 115, collectionAchieved: 0, billingForecast: 102, billingAchieved: 0, enquiryTarget: 28, enquiryGenerated: 0 },
  { month: "Dec 2026", bookingForecast: 125, bookingAchieved: 0, collectionForecast: 108, collectionAchieved: 0, billingForecast: 96, billingAchieved: 0, enquiryTarget: 26, enquiryGenerated: 0 },
  { month: "Jan 2027", bookingForecast: 115, bookingAchieved: 0, collectionForecast: 100, collectionAchieved: 0, billingForecast: 90, billingAchieved: 0, enquiryTarget: 24, enquiryGenerated: 0 },
  { month: "Feb 2027", bookingForecast: 120, bookingAchieved: 0, collectionForecast: 105, collectionAchieved: 0, billingForecast: 95, billingAchieved: 0, enquiryTarget: 25, enquiryGenerated: 0 },
  { month: "Mar 2027", bookingForecast: 145, bookingAchieved: 0, collectionForecast: 130, collectionAchieved: 0, billingForecast: 120, billingAchieved: 0, enquiryTarget: 32, enquiryGenerated: 0 },
];

export const STATUS_CONFIG: Record<LeadStatus, { color: string; bg: string; dot: string }> = {
  "New Enquiry":        { color: "text-slate-700", bg: "bg-slate-100", dot: "bg-slate-400" },
  "Qualified":          { color: "text-blue-700",  bg: "bg-blue-50",   dot: "bg-blue-500" },
  "Site Visit":         { color: "text-purple-700", bg: "bg-purple-50", dot: "bg-purple-500" },
  "Quotation Sent":     { color: "text-cyan-700",   bg: "bg-cyan-50",   dot: "bg-cyan-500" },
  "Follow-up":          { color: "text-amber-700",  bg: "bg-amber-50",  dot: "bg-amber-500" },
  "Negotiation":        { color: "text-orange-700", bg: "bg-orange-50", dot: "bg-orange-500" },
  "Booking Confirmed":  { color: "text-indigo-700", bg: "bg-indigo-50", dot: "bg-indigo-500" },
  "Advance Received":   { color: "text-teal-700",   bg: "bg-teal-50",   dot: "bg-teal-500" },
  "Won":                { color: "text-green-700",  bg: "bg-green-50",  dot: "bg-green-500" },
  "Lost":               { color: "text-red-700",    bg: "bg-red-50",    dot: "bg-red-500" },
};

export const ACTIVITY_ICONS: Record<string, string> = {
  "Enquiry": "📋", "Call": "📞", "Site Visit": "🏗️", "Quotation": "📄",
  "Negotiation": "🤝", "Follow-up": "🔔", "Booking": "✅", "Advance": "💰", "Note": "📝",
};

export const PIPELINE_STAGES: LeadStatus[] = [
  "New Enquiry", "Qualified", "Site Visit", "Quotation Sent",
  "Follow-up", "Negotiation", "Booking Confirmed", "Advance Received", "Won", "Lost",
];
