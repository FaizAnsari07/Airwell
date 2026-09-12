export type Role = "Super Admin" | "Sales Manager" | "Sales Engineer" | "Site Engineer" | "Field Support" | "Viewer";
export type UserStatus = "Active" | "Inactive" | "Suspended" | "Invited";

export interface User {
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

export const USERS: User[] = [
  { id: "U001", name: "Sunil Mehta", email: "sunil.mehta@starairwell.com", phone: "+91 98765 00001", role: "Super Admin", department: "Super Admin", status: "Active", lastLogin: "2026-08-31 09:12", createdAt: "2024-01-15", locationSharing: false, initials: "SM", color: "#253580" },
  { id: "U002", name: "Anita Rao", email: "anita.rao@starairwell.com", phone: "+91 98765 00002", role: "Sales Manager", department: "Sales Manager", status: "Active", lastLogin: "2026-08-31 08:45", createdAt: "2024-03-10", locationSharing: false, initials: "AR", color: "#3D50A0", targetAmount: 500 },
  { id: "U003", name: "Rajan Mehta", email: "rajan.mehta@starairwell.com", phone: "+91 98765 43210", role: "Sales Engineer", department: "Sales Engineer", status: "Active", lastLogin: "2026-08-31 08:50", createdAt: "2024-04-01", locationSharing: true, initials: "RM", color: "#253580", managerId: "U002", targetAmount: 180 },
  { id: "U004", name: "Priya Desai", email: "priya.desai@starairwell.com", phone: "+91 87654 32109", role: "Sales Engineer", department: "Sales Engineer", status: "Active", lastLogin: "2026-08-31 08:30", createdAt: "2024-04-01", locationSharing: true, initials: "PD", color: "#39B849", managerId: "U002", targetAmount: 180 },
  { id: "U005", name: "Amit Kulkarni", email: "amit.kulkarni@starairwell.com", phone: "+91 76543 21098", role: "Sales Engineer", department: "Sales Engineer", status: "Active", lastLogin: "2026-08-30 17:22", createdAt: "2024-05-15", locationSharing: true, initials: "AK", color: "#7C3AED", managerId: "U002", targetAmount: 160 },
  { id: "U006", name: "Suresh Pillai", email: "suresh.pillai@starairwell.com", phone: "+91 65432 10987", role: "Sales Engineer", department: "Sales Engineer", status: "Active", lastLogin: "2026-08-31 09:00", createdAt: "2024-05-15", locationSharing: true, initials: "SP", color: "#D97706", managerId: "U002", targetAmount: 160 },
  { id: "U007", name: "Deepak Verma", email: "deepak.verma@starairwell.com", phone: "+91 54321 09876", role: "Sales Engineer", department: "Sales Engineer", status: "Active", lastLogin: "2026-08-31 07:55", createdAt: "2024-06-01", locationSharing: true, initials: "DV", color: "#DC2626", managerId: "U002", targetAmount: 150 },
  { id: "U008", name: "Kavya Sharma", email: "kavya.sharma@starairwell.com", phone: "+91 43210 98765", role: "Site Engineer", department: "Site Engineer", status: "Active", lastLogin: "2026-08-31 07:30", createdAt: "2024-07-01", locationSharing: true, initials: "KS", color: "#0891B2", managerId: "U002" },
  { id: "U009", name: "Nikhil Patil", email: "nikhil.patil@starairwell.com", phone: "+91 32109 87654", role: "Site Engineer", department: "Site Engineer", status: "Inactive", lastLogin: "2026-08-25 16:00", createdAt: "2024-07-15", locationSharing: false, initials: "NP", color: "#64748B", managerId: "U002" },
  { id: "U010", name: "Meera Joshi", email: "meera.joshi@starairwell.com", phone: "+91 21098 76543", role: "Viewer", department: "Viewer", status: "Invited", lastLogin: "Never", createdAt: "2026-08-28", locationSharing: false, initials: "MJ", color: "#9333EA" },
];

/** Department is derived from Role — the two are always in sync, never chosen independently. */
export function departmentForRole(role: Role): string {
  return role;
}

export const ROLE_COLORS: Record<Role, string> = {
  "Super Admin":    "bg-red-50 text-red-700 border-red-200",
  "Sales Manager":  "bg-[#eef0f9] text-[#253580] border-[#c5cbea]",
  "Sales Engineer": "bg-blue-50 text-blue-700 border-blue-200",
  "Site Engineer":  "bg-teal-50 text-teal-700 border-teal-200",
  "Field Support":  "bg-cyan-50 text-cyan-700 border-cyan-200",
  "Viewer":         "bg-slate-100 text-slate-600 border-slate-200",
};

export const STATUS_COLORS: Record<UserStatus, string> = {
  "Active":    "bg-green-50 text-green-700",
  "Inactive":  "bg-slate-100 text-slate-500",
  "Suspended": "bg-red-50 text-red-600",
  "Invited":   "bg-amber-50 text-amber-700",
};

export function visibleUsersFor(currentUser: User, allUsers: User[]): User[] {
  if (currentUser.role === "Super Admin") return allUsers;
  if (currentUser.role === "Sales Manager") {
    return allUsers.filter((u) => u.id === currentUser.id || u.managerId === currentUser.id);
  }
  return allUsers.filter((u) => u.id === currentUser.id);
}
