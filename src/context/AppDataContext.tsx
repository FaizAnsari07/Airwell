import { createContext, useContext, useState, type ReactNode } from "react";
import { USERS, type User } from "../data/usersData";

function stockPhoto(seed: string): string {
  return `https://picsum.photos/seed/${seed}/600/400`;
}

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
  {
    id: "upd-demo-1",
    leadId: "L011",
    imageName: "site-mobilization.jpg",
    previewUrl: stockPhoto("site-mobilization"),
    date: "2026-07-06",
    engineerName: "Kavya Sharma",
    caption: "Material delivered on site, cleanroom access secured. Team mobilized.",
  },
  {
    id: "upd-demo-2",
    leadId: "L011",
    imageName: "ductwork-layout-marking.jpg",
    previewUrl: stockPhoto("ductwork-layout-marking"),
    date: "2026-07-09",
    engineerName: "Kavya Sharma",
    caption: "Layout marked for AHU ducting as per approved drawing.",
  },
  {
    id: "upd-demo-3",
    leadId: "L011",
    imageName: "ahu-unit-positioning.jpg",
    previewUrl: stockPhoto("ahu-unit-positioning"),
    date: "2026-07-12",
    engineerName: "Nikhil Patil",
    caption: "AHU unit lifted and positioned on the mounting frame.",
  },
  {
    id: "upd-demo-4",
    leadId: "L011",
    imageName: "ductwork-install-section-a.jpg",
    previewUrl: stockPhoto("ductwork-install-section-a"),
    date: "2026-07-15",
    engineerName: "Kavya Sharma",
    caption: "Section A ducting installed and insulated.",
  },
  {
    id: "upd-demo-5",
    leadId: "L011",
    imageName: "ductwork-install-section-b.jpg",
    previewUrl: stockPhoto("ductwork-install-section-b"),
    date: "2026-07-15",
    engineerName: "Kavya Sharma",
    caption: "Section B ducting installed same day, ahead of schedule.",
  },
  {
    id: "upd-demo-6",
    leadId: "L011",
    imageName: "electrical-control-panel.jpg",
    previewUrl: stockPhoto("electrical-control-panel"),
    date: "2026-07-18",
    engineerName: "Nikhil Patil",
    caption: "Control panel wiring completed, ready for power-on.",
  },
  {
    id: "upd-demo-7",
    leadId: "L011",
    imageName: "system-testing-commissioning.jpg",
    previewUrl: stockPhoto("testing-commissioning"),
    date: "2026-07-22",
    engineerName: "Kavya Sharma",
    caption: "System powered on. Airflow and temperature readings within spec.",
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

interface AppDataContextValue {
  currentUser: User;
  setCurrentUserId: (id: string) => void;

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

  const currentUser = USERS.find((u) => u.id === currentUserId) ?? USERS[0];

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
