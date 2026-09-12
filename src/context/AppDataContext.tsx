import { createContext, useContext, useState, type ReactNode } from "react";
import { USERS, type User } from "../data/usersData";

// Real Star Airwell project photos (starairwell.com project gallery),
// reused here since these are the company's own completed HVAC jobs.
const REAL_PROJECT_PHOTOS = {
  factory: "https://starairwell.com/wp-content/uploads/2026/06/image-4.webp", // Fabience Factory
  dataCenter: "https://starairwell.com/wp-content/uploads/2026/06/pexels-brett-sayles-4597280.webp", // Amazon Data Center
  corporate: "https://starairwell.com/wp-content/uploads/2026/06/image-2.webp", // Wells Fargo
  industrial: "https://starairwell.com/wp-content/uploads/2026/06/image-5.webp", // Welspun Flooring
  healthcare: "https://starairwell.com/wp-content/uploads/2026/06/image-3.webp", // Asian Spine Hospitals
  residential: "https://starairwell.com/wp-content/uploads/2026/06/image-6.webp", // Honer Homes
};

export interface LeadDocument {
  id: string;
  leadId: string;
  name: string;
  category: "Stage Change" | "Payment Receipt" | "Project Update" | "General";
  uploadedAt: string;
  uploadedBy: string;
  previewUrl?: string;
}

export interface Payment {
  id: string;
  leadId: string;
  amount: number;
  method: "Cash" | "Bank Transfer";
  note: string;
  date: string;
  documentId?: string;
}

export interface AppNotification {
  id: string;
  message: string;
  date: string;
  read: boolean;
  forUserId?: string;
}

export interface ProjectAssignment {
  leadId: string;
  managerId: string;
  staffId?: string;
  assignedAt: string;
}

export interface ProjectUpdatePhoto {
  id: string;
  leadId: string;
  imageName: string;
  previewUrl: string;
  date: string;
  engineerName: string;
  caption?: string;
}

const DEMO_PROJECT_UPDATES: ProjectUpdatePhoto[] = [
  // L011 — Sun Pharma Cleanroom HVAC
  {
    id: "upd-demo-1",
    leadId: "L011",
    imageName: "site-mobilization.jpg",
    previewUrl: REAL_PROJECT_PHOTOS.industrial,
    date: "2026-07-06",
    engineerName: "Kavya Sharma",
    caption: "Material delivered on site, cleanroom access secured. Team mobilized.",
  },
  {
    id: "upd-demo-2",
    leadId: "L011",
    imageName: "ductwork-layout-marking.jpg",
    previewUrl: REAL_PROJECT_PHOTOS.factory,
    date: "2026-07-09",
    engineerName: "Kavya Sharma",
    caption: "Layout marked for AHU ducting as per approved drawing.",
  },
  {
    id: "upd-demo-3",
    leadId: "L011",
    imageName: "ahu-unit-positioning.jpg",
    previewUrl: REAL_PROJECT_PHOTOS.factory,
    date: "2026-07-12",
    engineerName: "Nikhil Patil",
    caption: "AHU unit lifted and positioned on the mounting frame.",
  },
  {
    id: "upd-demo-4",
    leadId: "L011",
    imageName: "ductwork-install-section-a.jpg",
    previewUrl: REAL_PROJECT_PHOTOS.industrial,
    date: "2026-07-15",
    engineerName: "Kavya Sharma",
    caption: "Section A ducting installed and insulated.",
  },
  {
    id: "upd-demo-5",
    leadId: "L011",
    imageName: "ductwork-install-section-b.jpg",
    previewUrl: REAL_PROJECT_PHOTOS.industrial,
    date: "2026-07-15",
    engineerName: "Kavya Sharma",
    caption: "Section B ducting installed same day, ahead of schedule.",
  },
  {
    id: "upd-demo-6",
    leadId: "L011",
    imageName: "electrical-control-panel.jpg",
    previewUrl: REAL_PROJECT_PHOTOS.dataCenter,
    date: "2026-07-18",
    engineerName: "Nikhil Patil",
    caption: "Control panel wiring completed, ready for power-on.",
  },
  {
    id: "upd-demo-7",
    leadId: "L011",
    imageName: "system-testing-commissioning.jpg",
    previewUrl: REAL_PROJECT_PHOTOS.dataCenter,
    date: "2026-07-22",
    engineerName: "Kavya Sharma",
    caption: "System powered on. Airflow and temperature readings within spec.",
  },
  // L003 — Tata Motors Assembly Line Cooling
  {
    id: "upd-demo-8",
    leadId: "L003",
    imageName: "ventilation-install-mobilization.jpg",
    previewUrl: REAL_PROJECT_PHOTOS.factory,
    date: "2026-08-28",
    engineerName: "Nikhil Patil",
    caption: "Ventilation ductwork mobilization at assembly line factory floor.",
  },
  {
    id: "upd-demo-9",
    leadId: "L003",
    imageName: "extraction-fans-mounted.jpg",
    previewUrl: REAL_PROJECT_PHOTOS.industrial,
    date: "2026-09-02",
    engineerName: "Kavya Sharma",
    caption: "High-volume extraction fans mounted over assembly bay.",
  },
  // L005 — Cipla Pharma Cold Storage
  {
    id: "upd-demo-10",
    leadId: "L005",
    imageName: "coldroom-panel-fitting.jpg",
    previewUrl: REAL_PROJECT_PHOTOS.healthcare,
    date: "2026-08-20",
    engineerName: "Kavya Sharma",
    caption: "Insulated panel fitting for pharma cold storage room.",
  },
  {
    id: "upd-demo-11",
    leadId: "L005",
    imageName: "dx-unit-installation.jpg",
    previewUrl: REAL_PROJECT_PHOTOS.factory,
    date: "2026-08-25",
    engineerName: "Nikhil Patil",
    caption: "DX condensing units installed and piped.",
  },
  // L008 — HDFC Bank Data Center
  {
    id: "upd-demo-12",
    leadId: "L008",
    imageName: "server-room-chw-piping.jpg",
    previewUrl: REAL_PROJECT_PHOTOS.dataCenter,
    date: "2026-09-05",
    engineerName: "Kavya Sharma",
    caption: "Chilled water piping routed to server room CRAC units.",
  },
  {
    id: "upd-demo-13",
    leadId: "L008",
    imageName: "bms-integration.jpg",
    previewUrl: REAL_PROJECT_PHOTOS.corporate,
    date: "2026-09-09",
    engineerName: "Nikhil Patil",
    caption: "BMS integration and redundancy testing at the data center.",
  },
];

export interface StatusChangeLog {
  id: string;
  leadId: string;
  fromStatus: string;
  toStatus: string;
  note: string;
  documentId?: string;
  changedAt: string;
  changedBy: string;
}

export type LeadOptionField = "clientType" | "enquirySource" | "application" | "systemType" | "salesEngineer";

interface AppDataContextValue {
  currentUser: User;
  setCurrentUserId: (id: string) => void;

  customLeadOptions: Record<LeadOptionField, string[]>;
  addCustomLeadOption: (field: LeadOptionField, value: string) => void;

  documents: LeadDocument[];
  addDocument: (doc: Omit<LeadDocument, "id">) => LeadDocument;
  documentsForLead: (leadId: string) => LeadDocument[];

  payments: Payment[];
  addPayment: (payment: Omit<Payment, "id">) => void;
  paymentsForLead: (leadId: string) => Payment[];
  paidTotalForLead: (leadId: string) => number;

  notifications: AppNotification[];
  addNotification: (message: string, forUserId?: string) => void;
  markNotificationRead: (id: string) => void;
  notificationsForCurrentUser: () => AppNotification[];

  assignments: ProjectAssignment[];
  assignProject: (leadId: string, managerId: string, staffId?: string) => void;
  assignmentForLead: (leadId: string) => ProjectAssignment | undefined;

  projectUpdates: ProjectUpdatePhoto[];
  addProjectUpdate: (update: Omit<ProjectUpdatePhoto, "id">) => void;
  projectUpdatesForLead: (leadId: string) => ProjectUpdatePhoto[];

  statusChangeLogs: StatusChangeLog[];
  addStatusChangeLog: (log: Omit<StatusChangeLog, "id">) => void;
  statusChangeLogsForLead: (leadId: string) => StatusChangeLog[];
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

let nextId = 1;
function generateId(prefix: string) {
  return `${prefix}${nextId++}`;
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState<string>("U001");
  const [documents, setDocuments] = useState<LeadDocument[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [assignments, setAssignments] = useState<ProjectAssignment[]>([]);
  const [projectUpdates, setProjectUpdates] = useState<ProjectUpdatePhoto[]>(DEMO_PROJECT_UPDATES);
  const [statusChangeLogs, setStatusChangeLogs] = useState<StatusChangeLog[]>([]);
  const [customLeadOptions, setCustomLeadOptions] = useState<Record<LeadOptionField, string[]>>({
    clientType: [],
    enquirySource: [],
    application: [],
    systemType: [],
    salesEngineer: [],
  });

  const currentUser = USERS.find((u) => u.id === currentUserId) ?? USERS[0];

  function addCustomLeadOption(field: LeadOptionField, value: string) {
    setCustomLeadOptions((prev) =>
      prev[field].includes(value) ? prev : { ...prev, [field]: [...prev[field], value] }
    );
  }

  function addDocument(doc: Omit<LeadDocument, "id">): LeadDocument {
    const withId = { ...doc, id: generateId("doc") };
    setDocuments((prev) => [...prev, withId]);
    return withId;
  }

  function addPayment(payment: Omit<Payment, "id">) {
    setPayments((prev) => [...prev, { ...payment, id: generateId("pay") }]);
  }

  function addNotification(message: string, forUserId?: string) {
    setNotifications((prev) => [
      { id: generateId("notif"), message, date: new Date().toISOString().slice(0, 16).replace("T", " "), read: false, forUserId },
      ...prev,
    ]);
  }

  function markNotificationRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  function assignProject(leadId: string, managerId: string, staffId?: string) {
    setAssignments((prev) => [
      ...prev.filter((a) => a.leadId !== leadId),
      { leadId, managerId, staffId, assignedAt: new Date().toISOString().slice(0, 16).replace("T", " ") },
    ]);
  }

  function addProjectUpdate(update: Omit<ProjectUpdatePhoto, "id">) {
    setProjectUpdates((prev) => [...prev, { ...update, id: generateId("upd") }]);
  }

  function addStatusChangeLog(log: Omit<StatusChangeLog, "id">) {
    setStatusChangeLogs((prev) => [...prev, { ...log, id: generateId("log") }]);
  }

  const value: AppDataContextValue = {
    currentUser,
    setCurrentUserId,
    customLeadOptions,
    addCustomLeadOption,
    documents,
    addDocument,
    documentsForLead: (leadId) => documents.filter((d) => d.leadId === leadId),
    payments,
    addPayment,
    paymentsForLead: (leadId) => payments.filter((p) => p.leadId === leadId),
    paidTotalForLead: (leadId) => payments.filter((p) => p.leadId === leadId).reduce((s, p) => s + p.amount, 0),
    notifications,
    addNotification,
    markNotificationRead,
    notificationsForCurrentUser: () =>
      notifications.filter((n) => !n.forUserId || n.forUserId === currentUser.id),
    assignments,
    assignProject,
    assignmentForLead: (leadId) => assignments.find((a) => a.leadId === leadId),
    projectUpdates,
    addProjectUpdate,
    projectUpdatesForLead: (leadId) => projectUpdates.filter((u) => u.leadId === leadId),
    statusChangeLogs,
    addStatusChangeLog,
    statusChangeLogsForLead: (leadId) => statusChangeLogs.filter((l) => l.leadId === leadId),
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
