import { useState } from "react";
import Layout from "./components/Layout";
import type { NavPage } from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Leads from "./components/Leads";
import LeadDetail from "./components/LeadDetail";
import Pipeline from "./components/Pipeline";
import MonthlyReview from "./components/MonthlyReview";
import FollowUps from "./components/FollowUps";
import SalesPerformance from "./components/SalesPerformance";
import ProjectDirectory from "./components/ProjectDirectory";
import EmployeeTracking from "./components/EmployeeTracking";
import Tasks from "./components/Tasks";
import Issues from "./components/Issues";
import Notifications from "./components/Notifications";
import UserManagement from "./components/UserManagement";
import AccessManagement from "./components/AccessManagement";

export default function App() {
  const [page, setPage] = useState<NavPage>("dashboard");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  function openLead(id: string) {
    setSelectedLeadId(id);
    setPage("leads");
  }

  function navigate(p: NavPage) {
    setPage(p);
    if (p !== "leads") setSelectedLeadId(null);
  }

  return (
    <Layout activePage={page} onNavigate={navigate}>
      {page === "dashboard" && (
        <Dashboard onLeadClick={openLead} />
      )}
      {page === "leads" && !selectedLeadId && (
        <Leads onLeadClick={(id) => setSelectedLeadId(id)} />
      )}
      {page === "leads" && selectedLeadId && (
        <LeadDetail
          leadId={selectedLeadId}
          onBack={() => setSelectedLeadId(null)}
        />
      )}
      {page === "pipeline" && (
        <Pipeline onLeadClick={openLead} />
      )}
      {page === "projects" && (
        <ProjectDirectory onLeadClick={openLead} />
      )}
      {page === "followups" && (
        <FollowUps onLeadClick={openLead} />
      )}
      {page === "employee-tracking" && (
        <EmployeeTracking onLeadClick={openLead} />
      )}
      {page === "tasks" && (
        <Tasks onLeadClick={openLead} />
      )}
      {page === "issues" && (
        <Issues onLeadClick={openLead} />
      )}
      {page === "notifications" && (
        <Notifications onLeadClick={openLead} />
      )}
      {page === "sales-performance" && (
        <SalesPerformance />
      )}
      {page === "monthly-review" && (
        <MonthlyReview onLeadClick={openLead} />
      )}
      {page === "user-management" && <UserManagement />}
      {page === "access-management" && <AccessManagement />}
      {(page === "reports" || page === "settings") && <Placeholder page={page} />}
    </Layout>
  );
}

function Placeholder({ page }: { page: NavPage }) {
  const labels: Record<string, string> = {
    bookings: "Bookings",
    collections: "Collections",
    billing: "Billing",
    "enquiry-gen": "Enquiry Generation",
    reports: "Reports",
    settings: "Settings",
  };
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400">
      <div className="text-5xl mb-4">🚧</div>
      <div className="text-sm font-medium text-slate-600">{labels[page] || page}</div>
      <div className="text-xs mt-1">This section is coming soon</div>
    </div>
  );
}
