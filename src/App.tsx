import { useState } from "react";
import { 
  GraduationCap, LogOut, LayoutDashboard, FileSpreadsheet, 
  Calendar, MessageSquare, LineChart, Users, BellRing, Sparkles,
  BookOpen, CheckSquare, ShieldCheck
} from "lucide-react";
import { Student } from "./types";
import LoginView from "./components/LoginView";
import DashboardView from "./components/DashboardView";
import ReportCardView from "./components/ReportCardView";
import StudyPlanView from "./components/StudyPlanView";
import CounselorView from "./components/CounselorView";
import ProgressView from "./components/ProgressView";
import ParentsView from "./components/ParentsView";
import AdminView from "./components/AdminView";
import CustomExamSimulator from "./components/CustomExamSimulator";
import SecurityConsole from "./components/SecurityConsole";
import CrmView from "./components/CrmView";


const mockStudents: Student[] = [
  { id: "1", name: "Fatemeh Hosseini", namePersian: "فاطمه حسینی", code: "9812405", field: "bar_exam", grade: "داوطلب وکالت" } as any,
  { id: "2", name: "Alireza Rezaei", namePersian: "علیرضا رضایی", code: "9786431", field: "judiciary", grade: "داوطلب قضاوت" } as any,
  { id: "3", name: "Amir امیری", namePersian: "امیرمحمد امیری", code: "9921477", field: "notary", grade: "داوطلب سردفتری" } as any
];

export default function App() {
  // Start with no user logged in to present the beautiful Login and Role Selection screen first
  const [student, setStudent] = useState<Student | null>(null);
  const [role, setRole] = useState<"student" | "parent" | "admin" | null>(null);
  const [view, setView] = useState<string>("dashboard");

  const handleLogin = (matchedStudent: Student, selectedRole: "student" | "parent" | "admin") => {
    setStudent(matchedStudent);
    setRole(selectedRole);
    if (selectedRole === "parent") {
      setView("parents");
    } else if (selectedRole === "admin") {
      setView("admin");
    } else {
      setView("dashboard");
    }
  };

  const handleLogout = () => {
    setStudent(null);
    setRole(null);
    setView("dashboard");
  };

  // Demo Switch Handler for absolute best presentation
  const handleQuickSwitch = (selectedRole: "student" | "parent" | "admin" | "logout") => {
    if (selectedRole === "logout") {
      handleLogout();
    } else {
      const targetUser = mockStudents[0];
      setStudent(targetUser);
      setRole(selectedRole);
      if (selectedRole === "parent") {
        setView("parents");
      } else if (selectedRole === "admin") {
        setView("admin");
      } else {
        setView("dashboard");
      }
    }
  };

  if (!role || !student) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between" id="app-auth-wrapper">
        {/* Top Floating Help Banner */}
        <div className="bg-indigo-900 text-white text-xs text-center py-2 px-4 shadow-sm flex items-center justify-center gap-2 font-sans font-semibold">
          <Sparkles size={14} className="text-amber-400 animate-pulse" />
          <span>حالت دمو هوشمند چتر دانش: می‌توانید بر روی دکمه‌های ورود سریع ادمین در زیر کارت کلیک کنید تا سند معماری SaaS را مشاهده نمایید.</span>
        </div>

        <main className="flex-grow flex items-center justify-center py-10">
          <LoginView onLogin={handleLogin} />
        </main>
        <footer className="py-6 border-t border-slate-100 bg-white text-center text-xs text-slate-400">
          <div>© موسسه حقوقی چتر دانش | سامانه شخصی‌سازی آموزش و مشاوره تحصیلی با هوش مصنوعی</div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between animate-fade-in" id="app-dashboard-wrapper">
      {/* Dynamic Demo Control Bar */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 text-white text-xs border-b border-indigo-950/20 py-2.5 px-4 shadow-sm" id="demo-global-bar">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-extrabold pr-1 text-right">سامانه ابری و میکروسرویسی چتر دانش فعال است</span>
            <span className="text-indigo-200 hidden lg:inline">• نقش کاربری آزمایشی را مستقیماً سوئیچ کنید:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5" id="demo-switcher-buttons">
            <button
              onClick={() => handleQuickSwitch("admin")}
              className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                role === "admin" 
                  ? "bg-amber-400 text-slate-950 shadow-md scale-105" 
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              📐 سند معماری و نقشه راه SaaS (ادمین)
            </button>
            <button
              onClick={() => handleQuickSwitch("student")}
              className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                role === "student" 
                  ? "bg-blue-400 text-slate-950 shadow-md scale-105" 
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              🎓 پرتال داوطلب کنکور چتر دانش
            </button>
            <button
              onClick={() => handleQuickSwitch("parent")}
              className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                role === "parent" 
                  ? "bg-emerald-400 text-slate-950 shadow-md scale-105" 
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              👥 سامانه نظارت آنلاین والدین
            </button>
            <button
              onClick={() => handleQuickSwitch("logout")}
              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition-all cursor-pointer"
            >
              🔑 خروج به لاگین
            </button>
          </div>
        </div>
      </div>

      {/* Prime Navigation Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm" id="app-master-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Left side: Logo & Branding */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-900 to-indigo-950 text-white rounded-xl shadow-md flex items-center justify-center">
                <GraduationCap size={22} className="text-amber-400" />
              </div>
              <div>
                <span className="font-black text-slate-800 text-base block leading-none">چتر دانش</span>
                <span className="text-[10px] text-blue-900 font-bold block mt-1 flex items-center gap-0.5">
                  <Sparkles size={8} />
                  <span>سامانه هوشمند آموزشی</span>
                </span>
              </div>
            </div>

            {/* Middle: Active Navigation tabs */}
            <nav className="hidden lg:flex gap-1" id="desktop-navbar">
              {role === "student" && (
                <>
                  <button
                    onClick={() => setView("dashboard")}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                      view === "dashboard" ? "bg-slate-100 text-blue-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
                    }`}
                  >
                    <LayoutDashboard size={14} />
                    <span>داشبورد من</span>
                  </button>
                  <button
                    onClick={() => setView("report")}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                      view === "report" ? "bg-slate-100 text-blue-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
                    }`}
                  >
                    <FileSpreadsheet size={14} />
                    <span>کارنامه هوشمند</span>
                  </button>
                  <button
                    onClick={() => setView("schedule")}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                      view === "schedule" ? "bg-slate-100 text-blue-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
                    }`}
                  >
                    <Calendar size={14} />
                    <span>برنامه‌ریزی AI</span>
                  </button>
                  <button
                    onClick={() => setView("counselor")}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                      view === "counselor" ? "bg-slate-100 text-blue-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
                    }`}
                  >
                    <MessageSquare size={14} />
                    <span>مشاور هوشمند</span>
                  </button>
                  <button
                    onClick={() => setView("progress")}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                      view === "progress" ? "bg-slate-100 text-blue-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
                    }`}
                  >
                    <LineChart size={14} />
                    <span>نمودار رشد و پیشرفت</span>
                  </button>
                  <button
                    onClick={() => setView("exam")}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                      view === "exam" ? "bg-slate-100 text-blue-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
                    }`}
                  >
                    <BookOpen size={14} className="text-indigo-600" />
                    <span className="font-extrabold text-slate-800">شبیه‌ساز آزمون تستی</span>
                    <span className="px-1.5 py-0.5 bg-amber-400 text-[8px] font-black rounded text-slate-950 animate-pulse">جدید</span>
                  </button>
                </>
              )}

              {role === "parent" && (
                <>
                  <button
                    onClick={() => setView("parents")}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                      view === "parents" ? "bg-slate-100 text-blue-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
                    }`}
                  >
                    <BellRing size={14} />
                    <span>داشبورد والدین</span>
                  </button>
                  <button
                    onClick={() => setView("report")}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                      view === "report" ? "bg-slate-100 text-blue-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
                    }`}
                  >
                    <FileSpreadsheet size={14} />
                    <span>کارنامه فرزند</span>
                  </button>
                </>
              )}

              {role === "admin" && (
                <>
                  <button
                    onClick={() => setView("admin")}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                      view === "admin" ? "bg-slate-100 text-blue-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
                    }`}
                  >
                    <Users size={14} />
                    <span>پنل مدیریت ارشد</span>
                  </button>
                  <button
                    onClick={() => setView("crm")}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                      view === "crm" ? "bg-slate-150 text-blue-980 ring-1 ring-slate-100" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
                    }`}
                  >
                    <Users size={14} className="text-emerald-600" />
                    <span>سیستم مدیریت لید (CRM)</span>
                  </button>
                  <button
                    onClick={() => setView("security")}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                      view === "security" ? "bg-slate-100 text-blue-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
                    }`}
                  >
                    <ShieldCheck size={14} className="text-indigo-600" />
                    <span>کنسول امنیت و زیرساخت</span>
                  </button>
                </>
              )}
            </nav>

            {/* Right side: User Profile & Logout */}
            <div className="flex items-center gap-4">
              <div className="text-left hidden md:block">
                <span className="font-bold text-slate-800 text-xs block text-right">{student.name}</span>
                <span className="text-[10px] text-slate-400 font-bold block text-right mt-0.5">
                  {role === "student" && `دانش‌آموز پایه ${student.grade}`}
                  {role === "parent" && "پنل والدین مستقل"}
                  {role === "admin" && "مدیر ارشد موسسه"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-700 transition rounded-xl border border-slate-100 hover:border-red-100 cursor-pointer"
                title="خروج از سامانه"
                id="btn-nav-logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>

          {/* Mobile Tab Navigation bar */}
          <div className="flex lg:hidden overflow-x-auto pb-3 gap-1.5 scrollbar-none" id="mobile-navbar">
            {role === "student" && (
              <>
                <button
                  onClick={() => setView("dashboard")}
                  className={`px-3.5 py-2 text-[11px] font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
                    view === "dashboard" ? "bg-blue-900 text-white" : "text-slate-500 bg-slate-50"
                  }`}
                >
                  داشبورد دفتری
                </button>
                <button
                  onClick={() => setView("report")}
                  className={`px-3.5 py-2 text-[11px] font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
                    view === "report" ? "bg-blue-900 text-white" : "text-slate-500 bg-slate-50"
                  }`}
                >
                  کارنامه هوشمند
                </button>
                <button
                  onClick={() => setView("schedule")}
                  className={`px-3.5 py-2 text-[11px] font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
                    view === "schedule" ? "bg-blue-900 text-white" : "text-slate-500 bg-slate-50"
                  }`}
                >
                  برنامه AI
                </button>
                <button
                  onClick={() => setView("counselor")}
                  className={`px-3.5 py-2 text-[11px] font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
                    view === "counselor" ? "bg-blue-900 text-white" : "text-slate-500 bg-slate-50"
                  }`}
                >
                  مشاور
                </button>
                <button
                  onClick={() => setView("progress")}
                  className={`px-3.5 py-2 text-[11px] font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
                    view === "progress" ? "bg-blue-900 text-white" : "text-slate-500 bg-slate-50"
                  }`}
                >
                  پیشرفت صعودی
                </button>
                <button
                  onClick={() => setView("exam")}
                  className={`px-3.5 py-2 text-[11px] font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
                    view === "exam" ? "bg-indigo-900 text-white font-extrabold animate-pulse" : "text-slate-500 bg-amber-100"
                  }`}
                >
                  📝 شبیه‌ساز آزمون تستی
                </button>
              </>
            )}

            {role === "parent" && (
              <>
                <button
                  onClick={() => setView("parents")}
                  className={`px-3.5 py-2 text-[11px] font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
                    view === "parents" ? "bg-blue-900 text-white" : "text-slate-500 bg-slate-50"
                  }`}
                >
                  هشدارهای والدین
                </button>
                <button
                  onClick={() => setView("report")}
                  className={`px-3.5 py-2 text-[11px] font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
                    view === "report" ? "bg-blue-900 text-white" : "text-slate-500 bg-slate-50"
                  }`}
                >
                  تحلیل کارنامه فرزند
                </button>
              </>
            )}

             {role === "admin" && (
               <>
                 <button
                   onClick={() => setView("admin")}
                   className={`px-3.5 py-2 text-[11px] font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
                     view === "admin" ? "bg-blue-900 text-white" : "text-slate-500 bg-slate-50"
                   }`}
                 >
                   مدیریت و آپلودر چتر دانش
                 </button>
                 <button
                   onClick={() => setView("crm")}
                   className={`px-3.5 py-2 text-[11px] font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
                     view === "crm" ? "bg-blue-900 text-white" : "text-slate-500 bg-slate-50"
                   }`}
                 >
                   سیستم CRM چتر دانش
                 </button>
               </>
             )}
          </div>
        </div>
      </header>

      {/* Main View Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full" id="main-content-layout">
        {role === "student" && (
          <>
            {view === "dashboard" && <DashboardView student={student} onNavigate={(target) => setView(target)} />}
            {view === "report" && <ReportCardView student={student} />}
            {view === "schedule" && <StudyPlanView />}
            {view === "counselor" && <CounselorView student={student} />}
            {view === "progress" && <ProgressView />}
            {view === "exam" && <CustomExamSimulator />}
          </>
        )}

        {role === "parent" && (
          <>
            {view === "parents" && <ParentsView student={student} />}
            {view === "report" && <ReportCardView student={student} />}
          </>
        )}

        {role === "admin" && (
          <>
            {view === "admin" && <AdminView />}
            {view === "security" && <SecurityConsole />}
            {view === "crm" && <CrmView />}
          </>
        )}
      </main>

      {/* Persistent Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400 mt-10">
        <div>پلتفرم هوشمند آموزشی و برنامه‌ریزی درسی چتر دانش بر اساس مدل ارزیابی آزمون‌های حقوقی وکالت • کپی‌رایت ۱۴۰۵</div>
      </footer>
    </div>
  );
}
