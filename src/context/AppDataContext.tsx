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

// Demo receipts backing the Bank Transfer installments below.
const DEMO_PAYMENT_DOCUMENTS: LeadDocument[] = [
  { id: "doc-pay-demo-1", leadId: "L003", name: "tata-motors-advance-transfer.pdf", category: "Payment Receipt", uploadedAt: "2026-08-30", uploadedBy: "Amit Kulkarni" },
  { id: "doc-pay-demo-2", leadId: "L005", name: "cipla-panels-bank-transfer.pdf", category: "Payment Receipt", uploadedAt: "2026-08-25", uploadedBy: "Suresh Pillai" },
  { id: "doc-pay-demo-3", leadId: "L008", name: "hdfc-advance-loi-transfer.pdf", category: "Payment Receipt", uploadedAt: "2026-09-03", uploadedBy: "Suresh Pillai" },
  { id: "doc-pay-demo-4", leadId: "L008", name: "hdfc-milestone2-chw-transfer.pdf", category: "Payment Receipt", uploadedAt: "2026-09-08", uploadedBy: "Suresh Pillai" },
];

// Demo installments for 3 of the 4 Won leads (Sun Pharma is left with none,
// to also show the empty-state "record the first payment" prompt).
const DEMO_PAYMENTS: Payment[] = [
  // L003 — Tata Motors Assembly Line Cooling (Value ₹35L)
  { id: "pay-demo-1", leadId: "L003", amount: 15, method: "Bank Transfer", note: "Advance received on PO confirmation", date: "2026-08-30", documentId: "doc-pay-demo-1" },
  { id: "pay-demo-2", leadId: "L003", amount: 10, method: "Cash", note: "Second installment collected on-site", date: "2026-09-05" },
  // L005 — Cipla Pharma Cold Storage (Value ₹18.5L)
  { id: "pay-demo-3", leadId: "L005", amount: 2, method: "Cash", note: "Token advance on order confirmation", date: "2026-08-20" },
  { id: "pay-demo-4", leadId: "L005", amount: 1, method: "Bank Transfer", note: "Partial payment for cold storage panels", date: "2026-08-25", documentId: "doc-pay-demo-2" },
  { id: "pay-demo-5", leadId: "L005", amount: 2.35, method: "Cash", note: "Additional installment for DX units", date: "2026-08-30" },
  // L008 — HDFC Bank Data Center (Value ₹65L)
  { id: "pay-demo-6", leadId: "L008", amount: 20, method: "Bank Transfer", note: "Advance payment against LOI", date: "2026-09-03", documentId: "doc-pay-demo-3" },
  { id: "pay-demo-7", leadId: "L008", amount: 15, method: "Bank Transfer", note: "Second milestone payment — CHW piping complete", date: "2026-09-08", documentId: "doc-pay-demo-4" },
];

export interface AppNotification {
  id: string;
  message: string;
  date: string;
  read: boolean;
  forUserId?: string;
  leadId?: string;
}

export interface ProjectAssignment {
  leadId: string;
  managerId: string;
  staffIds?: string[];
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

export type TaskStatus = "To Do" | "In Progress" | "Blocked" | "Completed";

export interface AppTask {
  id: string;
  title: string;
  leadId?: string;
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  status: TaskStatus;
  assigneeId: string;
  assignedById: string;
  createdAt: string;
}

// Seeded against real leads/users so Tasks reads as connected data, not a
// disconnected demo list — same principle as Payments/Project Updates.
const DEMO_TASKS: AppTask[] = [
  { id: "task-demo-1", title: "Finalize CHW piping layout for server room", leadId: "L008", priority: "High", dueDate: "2026-09-16", status: "In Progress", assigneeId: "U003", assignedById: "U002", createdAt: "2026-09-10" },
  { id: "task-demo-2", title: "Site measurement for AHU room — Level 3", leadId: "L011", priority: "Medium", dueDate: "2026-09-18", status: "To Do", assigneeId: "U006", assignedById: "U002", createdAt: "2026-09-11" },
  { id: "task-demo-3", title: "Follow up on cold storage panel delivery", leadId: "L005", priority: "High", dueDate: "2026-09-14", status: "Blocked", assigneeId: "U006", assignedById: "U002", createdAt: "2026-09-09" },
  { id: "task-demo-4", title: "Submit test & balance report — Tata Motors", leadId: "L003", priority: "Medium", dueDate: "2026-09-08", status: "Completed", assigneeId: "U006", assignedById: "U002", createdAt: "2026-09-01" },
  { id: "task-demo-5", title: "Prepare quotation revision for Raheja Mindspace", leadId: "L004", priority: "Low", dueDate: "2026-09-20", status: "To Do", assigneeId: "U005", assignedById: "U002", createdAt: "2026-09-12" },
];

export type IssueStatus = "Open" | "Assigned" | "In Progress" | "Resolved";

export interface AppIssue {
  id: string;
  leadId?: string;
  category: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  status: IssueStatus;
  ownerId: string;
  dueDate: string;
  reportedById: string;
  createdAt: string;
}

// Field-reported issues — this is the same concept the mobile field app's
// "Report Issue" (site work) and "Report an Issue" (client visits) actions
// create, given a home here so the office side can actually see them
// instead of these only existing on a phone. Seeded against the same real
// leads/site engineers used in Project Updates and Tasks.
const DEMO_ISSUES: AppIssue[] = [
  { id: "issue-demo-1", leadId: "L008", category: "Civil Readiness", description: "Server room plinth not cured, blocking CRAC unit placement.", priority: "High", status: "Open", ownerId: "U008", dueDate: "2026-09-17", reportedById: "U008", createdAt: "2026-09-12" },
  { id: "issue-demo-2", leadId: "L011", category: "Material Shortage", description: "Cleanroom-grade ducting insulation short by 40 m for Level 3.", priority: "High", status: "Assigned", ownerId: "U009", dueDate: "2026-09-15", reportedById: "U008", createdAt: "2026-09-10" },
  { id: "issue-demo-3", leadId: "L005", category: "Access", description: "Cold storage chamber access delayed by client's ongoing racking work.", priority: "Medium", status: "In Progress", ownerId: "U008", dueDate: "2026-09-16", reportedById: "U006", createdAt: "2026-09-08" },
  { id: "issue-demo-4", leadId: "L003", category: "Testing", description: "Extraction fan vibration reading above spec — rebalancing required.", priority: "Medium", status: "Resolved", ownerId: "U009", dueDate: "2026-09-05", reportedById: "U008", createdAt: "2026-09-02" },
];

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
  addNotification: (message: string, forUserId?: string, leadId?: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  notificationsForCurrentUser: () => AppNotification[];

  assignments: ProjectAssignment[];
  assignProject: (leadId: string, managerId: string, staffIds?: string[]) => void;
  assignmentForLead: (leadId: string) => ProjectAssignment | undefined;

  projectUpdates: ProjectUpdatePhoto[];
  addProjectUpdate: (update: Omit<ProjectUpdatePhoto, "id">) => void;
  projectUpdatesForLead: (leadId: string) => ProjectUpdatePhoto[];

  statusChangeLogs: StatusChangeLog[];
  addStatusChangeLog: (log: Omit<StatusChangeLog, "id">) => void;
  statusChangeLogsForLead: (leadId: string) => StatusChangeLog[];

  tasks: AppTask[];
  addTask: (task: Omit<AppTask, "id" | "createdAt">) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;

  issues: AppIssue[];
  addIssue: (issue: Omit<AppIssue, "id" | "createdAt">) => void;
  updateIssueStatus: (id: string, status: IssueStatus) => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

let nextId = 1;
function generateId(prefix: string) {
  return `${prefix}${nextId++}`;
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState<string>("U001");
  const [documents, setDocuments] = useState<LeadDocument[]>(DEMO_PAYMENT_DOCUMENTS);
  const [payments, setPayments] = useState<Payment[]>(DEMO_PAYMENTS);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [assignments, setAssignments] = useState<ProjectAssignment[]>([]);
  const [projectUpdates, setProjectUpdates] = useState<ProjectUpdatePhoto[]>(DEMO_PROJECT_UPDATES);
  const [statusChangeLogs, setStatusChangeLogs] = useState<StatusChangeLog[]>([]);
  const [tasks, setTasks] = useState<AppTask[]>(DEMO_TASKS);
  const [issues, setIssues] = useState<AppIssue[]>(DEMO_ISSUES);
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

  function addNotification(message: string, forUserId?: string, leadId?: string) {
    setNotifications((prev) => [
      { id: generateId("notif"), message, date: new Date().toISOString().slice(0, 16).replace("T", " "), read: false, forUserId, leadId },
      ...prev,
    ]);
  }

  function markNotificationRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  function markAllNotificationsRead() {
    setNotifications((prev) =>
      prev.map((n) =>
        !n.forUserId || n.forUserId === currentUser.id ? { ...n, read: true } : n
      )
    );
  }

  function assignProject(leadId: string, managerId: string, staffIds?: string[]) {
    setAssignments((prev) => [
      ...prev.filter((a) => a.leadId !== leadId),
      { leadId, managerId, staffIds, assignedAt: new Date().toISOString().slice(0, 16).replace("T", " ") },
    ]);
  }

  function addProjectUpdate(update: Omit<ProjectUpdatePhoto, "id">) {
    setProjectUpdates((prev) => [...prev, { ...update, id: generateId("upd") }]);
  }

  function addStatusChangeLog(log: Omit<StatusChangeLog, "id">) {
    setStatusChangeLogs((prev) => [...prev, { ...log, id: generateId("log") }]);
  }

  function addTask(task: Omit<AppTask, "id" | "createdAt">) {
    setTasks((prev) => [
      { ...task, id: generateId("task"), createdAt: new Date().toISOString().slice(0, 10) },
      ...prev,
    ]);
  }

  function updateTaskStatus(id: string, status: TaskStatus) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  function addIssue(issue: Omit<AppIssue, "id" | "createdAt">) {
    setIssues((prev) => [
      { ...issue, id: generateId("issue"), createdAt: new Date().toISOString().slice(0, 10) },
      ...prev,
    ]);
  }

  function updateIssueStatus(id: string, status: IssueStatus) {
    setIssues((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
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
    markAllNotificationsRead,
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
    tasks,
    addTask,
    updateTaskStatus,
    issues,
    addIssue,
    updateIssueStatus,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
