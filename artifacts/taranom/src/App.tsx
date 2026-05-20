import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/queryClient";
import { getStoredStudent, getAdminToken, getNationalCode } from "@/lib/auth";
import { setExtraHeadersGetter } from "@workspace/api-client-react";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import NewRecord from "@/pages/NewRecord";
import RecordDetail from "@/pages/RecordDetail";
import Exam from "@/pages/Exam";
import Stats from "@/pages/Stats";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminStudents from "@/pages/AdminStudents";
import AdminQuestions from "@/pages/AdminQuestions";
import AdminSettings from "@/pages/AdminSettings";
import NotFound from "@/pages/not-found";

setExtraHeadersGetter(() => {
  const headers: Record<string, string> = {};
  const nc = getNationalCode();
  if (nc) headers["x-national-code"] = nc;
  const adminToken = getAdminToken();
  if (adminToken) headers["x-admin-token"] = adminToken;
  return headers;
});

function StudentGuard({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const student = getStoredStudent();
  if (!student) {
    setLocation("/");
    return null;
  }
  return <>{children}</>;
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const token = getAdminToken();
  if (!token) {
    setLocation("/admin");
    return null;
  }
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />

      <Route path="/dashboard">
        <StudentGuard><Dashboard /></StudentGuard>
      </Route>
      <Route path="/record/new">
        <StudentGuard><NewRecord /></StudentGuard>
      </Route>
      <Route path="/record/:id">
        <StudentGuard><RecordDetail /></StudentGuard>
      </Route>
      <Route path="/exam">
        <StudentGuard><Exam /></StudentGuard>
      </Route>
      <Route path="/stats">
        <StudentGuard><Stats /></StudentGuard>
      </Route>

      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/dashboard">
        <AdminGuard><AdminDashboard /></AdminGuard>
      </Route>
      <Route path="/admin/students">
        <AdminGuard><AdminStudents /></AdminGuard>
      </Route>
      <Route path="/admin/questions">
        <AdminGuard><AdminQuestions /></AdminGuard>
      </Route>
      <Route path="/admin/settings">
        <AdminGuard><AdminSettings /></AdminGuard>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
