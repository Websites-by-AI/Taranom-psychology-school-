import { useState } from "react";
import { INSTITUTIONS, BRAND_CONFIG, setBrandById } from "./constants";
import { 
  Plus, LogOut, LayoutDashboard, FileSpreadsheet, 
  Calendar, MessageSquare, LineChart, Users, BellRing, Sparkles, Layers, Shield, Target,
  Palette, Building2, Menu, X, ChevronLeft, Pipette
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Student } from "./types";
import LoginView from "./components/LoginView";
import DashboardView from "./components/DashboardView";
import ManovaDashboard from "./components/ManovaDashboard";
import ReportCardView from "./components/ReportCardView";
import StudyPlanView from "./components/StudyPlanView";
import CounselorView from "./components/CounselorView";
import ProgressView from "./components/ProgressView";
import ParentsView from "./components/ParentsView";
import AdminView from "./components/AdminView";
import TestTrapsView from "./components/TestTrapsView";
import CustomQuizGenerator from "./components/CustomQuizGenerator";
import AiPsychologyView from "./components/AiPsychologyView";
import AssessmentView from "./components/AssessmentView";
import ProfileSettingsView from "./components/ProfileSettingsView";
import { Brain, Settings } from "lucide-react";
import SmartNotifications from "./components/SmartNotifications";
import FocusChallengeOverlay from "./components/FocusChallengeOverlay";

export default function App() {
  const [student, setStudent] = useState<Student | null>(null);
  const [role, setRole] = useState<"student" | "parent" | "admin" | null>(null);
  const [view, setView] = useState<string>("dashboard");
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem("taranom_app_theme") || BRAND_CONFIG.theme || "classic";
  });
  const [activeBrandId, setActiveBrandId] = useState(BRAND_CONFIG.id);

  const switchBrand = (id: string) => {
    setBrandById(id);
    setActiveBrandId(id);
    setTheme(BRAND_CONFIG.theme || "classic");
    localStorage.setItem("taranom_app_theme", BRAND_CONFIG.theme || "classic");
    // Force a small refresh of states if needed, but since BRAND_CONFIG is mutated 
    // and we trigger state update for activeBrandId, components using BRAND_CONFIG 
    // will see the new values on next render.
  };
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFocusChallengeOpen, setIsFocusChallengeOpen] = useState(false);

  const navigationItems = {
    student: [
      { id: "dashboard", label: "پرتال داوطلب کنکور", icon: LayoutDashboard },
      { id: "manova", label: "داشبورد مانوا", icon: Sparkles, highlight: true },
      { id: "report", label: "کارنامه ترازها", icon: FileSpreadsheet },
      { id: "schedule", label: "برنامه‌ریزی و تقویم", icon: Calendar },
      { id: "counselor", label: "مشاور هوشمند کنکور", icon: MessageSquare },
      { id: "progress", label: "بهبود تراز", icon: LineChart },
      { id: "traps", label: "بانک تله‌های تستی", icon: Target },
      { id: "quiz", label: "آزمون سفارشی", icon: Brain },
      { id: "psychology", label: "پایش روانی (AI)", icon: Brain },
    ],
    parent: [
      { id: "parents", label: "نظارت آنلاین والدین", icon: Users },
      { id: "manova", label: "داشبورد مانوا آکادمی", icon: Sparkles, highlight: true },
      { id: "report", label: "کارنامه‌ها و گزارش‌ها", icon: FileSpreadsheet },
      { id: "psychology", label: "پایش روحی داوطلب", icon: Brain },
    ],
    admin: [
      { id: "admin", label: "نقشه راه SaaS", icon: Users },
      { id: "manova", label: "داشبورد مدیریتی مانوا", icon: Sparkles, highlight: true },
    ]
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudent(updatedStudent);
    // In a real app we'd save to DB, here setStudent is enough for the session
  };
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("taranom_app_theme", newTheme);
  };

  const getThemeCSS = (activeTheme: string) => {
    switch (activeTheme) {
      case "emerald":
        return `
          :root {
            --color-blue-900: #064e3b !important;
            --color-blue-950: #022c22 !important;
            --color-indigo-900: #0f765e !important;
            --color-indigo-950: #115e50 !important;
            --color-blue-50: #f0fdf4 !important;
            --color-blue-100: #dcfce7 !important;
            --color-amber-400: #10b981 !important;
            --color-indigo-50: #f0fdf4 !important;
            --color-indigo-100: #dcfce7 !important;
          }
        `;
      case "ruby":
        return `
          :root {
            --color-blue-900: #881337 !important;
            --color-blue-950: #4c0519 !important;
            --color-indigo-900: #be123c !important;
            --color-indigo-950: #9f1239 !important;
            --color-blue-50: #fff1f2 !important;
            --color-blue-100: #ffe4e6 !important;
            --color-amber-400: #f43f5e !important;
            --color-indigo-50: #fff1f2 !important;
            --color-indigo-100: #ffe4e6 !important;
          }
        `;
      case "amber":
        return `
          :root {
            --color-blue-900: #78350f !important;
            --color-blue-950: #451a03 !important;
            --color-indigo-900: #b45309 !important;
            --color-indigo-950: #92400e !important;
            --color-blue-50: #fffbeb !important;
            --color-blue-100: #fef3c7 !important;
            --color-amber-400: #d97706 !important;
            --color-indigo-50: #fffbeb !important;
            --color-indigo-100: #fef3c7 !important;
          }
        `;
      case "obsidian":
        return `
          :root {
            --color-blue-900: #334155 !important;
            --color-blue-950: #0f172a !important;
            --color-indigo-900: #475569 !important;
            --color-indigo-950: #1e293b !important;
            --color-blue-50: #f8fafc !important;
            --color-blue-100: #f1f5f9 !important;
            --color-amber-400: #64748b !important;
            --color-indigo-50: #f8fafc !important;
            --color-indigo-100: #f1f5f9 !important;
          }
        `;
      default:
        return "";
    }
  };

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

  if (!role || !student) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between" id="app-auth-wrapper">
        {/* Parallel Font Loading Layer - Optimized via index.html Preconnect/Preload */}
        <style dangerouslySetInnerHTML={{ __html: getThemeCSS(theme) }} />
        <main className="flex-grow flex items-center justify-center py-10">
          <LoginView onLogin={handleLogin} />
        </main>
        <footer className="py-6 border-t border-slate-100 bg-white text-center text-xs text-slate-400">
          <div>© {BRAND_CONFIG.fullName} | {BRAND_CONFIG.slogan} با هوش مصنوعی مرکزی</div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between" id="app-dashboard-wrapper">
      <style dangerouslySetInnerHTML={{ __html: getThemeCSS(theme) }} />
      {/* SaaS Status Bar */}
      <div className="bg-slate-900 text-white py-1 px-4 text-[9px] font-black flex justify-between items-center select-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>سامانه ابری و میکروسرویسی ترنم مهر فعال است</span>
          </span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/10">پروتکل امنیتی ادمین متصل است</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400">LOGS: 0 ERRORS</span>
          <span className="font-mono text-amber-300">CLOUD_INGRESS_STABLE_3000</span>
        </div>
      </div>

      {/* Prime Navigation Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm" id="app-master-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Left side: Logo & Branding */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="lg:hidden p-2 -mr-2 text-slate-500 hover:bg-slate-50 rounded-xl transition"
                id="mobile-menu-trigger"
              >
                <Menu size={24} />
              </button>
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-900 via-slate-900 to-indigo-950 text-white rounded-xl shadow-md flex items-center justify-center">
                <Layers size={22} className="text-amber-400" />
              </div>
              <div className="text-right hidden sm:block">
                <span className="font-black text-slate-850 text-base block leading-none text-blue-950">{BRAND_CONFIG.name}</span>
                <span className="text-[10px] text-emerald-600 font-black block mt-1 flex items-center gap-0.5 justify-end">
                  <Sparkles size={8} />
                  <span>{BRAND_CONFIG.slogan}</span>
                </span>
              </div>
            </div>

            {/* Middle: Active Navigation tabs */}
            <nav className="hidden lg:flex gap-1" id="desktop-navbar">
              {role && navigationItems[role].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setView(item.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                      view === item.id ? "bg-slate-100 text-blue-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
                    }`}
                  >
                    <Icon size={14} className={item.highlight ? "text-amber-500" : ""} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right side: User Profile & Theme switcher & Logout */}
            <div className="flex items-center gap-4 relative">
              <SmartNotifications onAction={(type) => {
                if (type === "challenge") setIsFocusChallengeOpen(true);
                if (type === "nudge") setView("assessment");
              }} />
              
              <div className="text-left hidden md:block">
                <span className="font-bold text-slate-800 text-xs block text-right">{student.name}</span>
                <span className="text-[10px] text-slate-400 font-bold block text-right mt-0.5">
                  {role === "student" && "داوطلب آزمون‌های کنکور سراسری"}
                  {role === "parent" && "سیستم نظارتی و پایش والدین"}
                  {role === "admin" && "مدیر کل و معمار ارشد آکادمی"}
                </span>
              </div>

              {/* Theme Customizer Selector */}
              <div className="relative" id="customizer-theme-switcher flex">
                <button
                  onClick={() => setShowThemeMenu(!showThemeMenu)}
                  className={`p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-blue-900 transition rounded-xl border border-slate-100 cursor-pointer flex items-center justify-center gap-2 shadow-sm active:scale-95 ${
                    theme !== "classic" ? "ring-2 ring-blue-500" : ""
                  }`}
                  title="تغییر تم رنگی سامانه"
                  id="btn-nav-theme"
                >
                  <Pipette size={24} className="text-amber-500" />
                  <span className="hidden sm:inline text-xs font-bold text-slate-600">پوسته</span>
                </button>

                {showThemeMenu && (
                  <div className="absolute left-0 mt-2.5 w-64 bg-white rounded-2xl border border-slate-150 shadow-xl z-50 p-4 space-y-2 animate-fade-in text-right">
                    <div className="text-[10px] text-slate-400 font-black border-b border-slate-100 pb-1.5 mb-1.5 flex justify-between items-center">
                      <span>انتخاب پالت رنگ عمومی</span>
                      <Palette size={12} className="text-slate-400" />
                    </div>
                    <div className="space-y-1">
                      {[
                        { id: "classic", name: "سورمه‌ای اصیل (ترنم مهر)", color: "bg-blue-900" },
                        { id: "emerald", name: "سبز کانون (آموزشی)", color: "bg-emerald-800" },
                        { id: "ruby", name: "یاقوت درخشان (زرشکی)", color: "bg-rose-900" },
                        { id: "amber", name: "کهربایی گرم (طلایی)", color: "bg-amber-850" },
                        { id: "obsidian", name: "فولاد دودی (مدرن)", color: "bg-slate-705" }
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            handleThemeChange(t.id);
                            setShowThemeMenu(false);
                          }}
                          className={`w-full text-right p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                            theme === t.id ? "bg-slate-50 border border-slate-200" : "hover:bg-slate-50 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-3.5 h-3.5 rounded-full ${t.color} border border-white shadow-xs`} />
                            <span>{t.name}</span>
                          </div>
                          {theme === t.id && (
                            <span className="text-[9px] text-blue-900 font-black bg-blue-50 px-2 py-0.5 rounded-md">فعال</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Institution Switcher (SaaS Feature) */}
              {role === "student" && (
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="p-2 bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition rounded-xl border border-slate-100 cursor-pointer flex items-center justify-center gap-1.5"
                  title="تنظیمات پروفایل هوشمند"
                >
                  <Settings size={18} />
                  <span className="hidden sm:inline text-xs font-black">پروفایل</span>
                </button>
              )}

              {role === "admin" && (
                <div className="relative group">
                  <button className="p-2 bg-slate-50 hover:bg-indigo-50 text-indigo-600 transition rounded-xl border border-slate-100 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm">
                    <Building2 size={18} />
                    <span className="hidden sm:inline text-xs font-black">انتخاب موسسه</span>
                  </button>
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-2xl border border-slate-150 shadow-xl z-50 p-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition text-right">
                    {INSTITUTIONS.map(inst => (
                      <button
                        key={inst.id}
                        onClick={() => switchBrand(inst.id)}
                        className={`w-full text-right p-2 rounded-xl text-[10px] font-black flex items-center justify-between hover:bg-slate-50 transition ${activeBrandId === inst.id ? "text-indigo-600 bg-indigo-50/50" : "text-slate-500"}`}
                      >
                        <span>{inst.fullName}</span>
                        {activeBrandId === inst.id && <Shield size={10} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="p-2 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-700 transition rounded-xl border border-slate-100 hover:border-red-100 cursor-pointer"
                title="🔑 خروج به لاگین"
                id="btn-nav-logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer (WordPress Style) */}
          <AnimatePresence>
            {isMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMenuOpen(false)}
                  className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden"
                />
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white shadow-2xl z-[101] lg:hidden overflow-y-auto flex flex-col"
                  id="mobile-drawer"
                >
                  {/* Drawer Header */}
                  <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-900 text-white rounded-lg flex items-center justify-center">
                        <Layers size={18} />
                      </div>
                      <span className="font-black text-blue-950 text-sm">{BRAND_CONFIG.name}</span>
                    </div>
                    <button 
                      onClick={() => setIsMenuOpen(false)}
                      className="p-2 text-slate-400 hover:text-slate-600 transition"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Navigation Links */}
                  <div className="flex-grow p-4 space-y-1">
                    <div className="px-3 mb-4">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right mb-2 opacity-60">منوی اصلی سامانه</div>
                      <div className="h-[1px] bg-slate-100 w-full" />
                    </div>
                    {role && navigationItems[role].map((item) => {
                      const Icon = item.icon;
                      const isActive = view === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setView(item.id);
                            setIsMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
                            isActive 
                              ? "bg-blue-50 text-blue-900 border-r-4 border-blue-900" 
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl transition-colors ${isActive ? "bg-blue-100 text-blue-900" : "bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-slate-600"}`}>
                              <Icon size={18} className={item.highlight ? "text-amber-500" : ""} />
                            </div>
                            <span className={`text-xs font-black ${isActive ? "text-blue-900" : "text-slate-700"}`}>{item.label}</span>
                          </div>
                          {isActive ? (
                            <ChevronLeft size={16} className="text-blue-900" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-slate-300" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Drawer Footer */}
                  <div className="p-6 border-t border-slate-100 bg-slate-50 mt-auto">
                    <div className="flex items-center gap-3 mb-4 text-right">
                       <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold overflow-hidden border-2 border-white shadow-sm">
                         {student.name.charAt(0)}
                       </div>
                       <div className="flex flex-col">
                         <span className="text-xs font-black text-slate-900 leading-none mb-1">{student.name}</span>
                         <span className="text-[10px] text-slate-400 font-bold">{student.grade} - {student.school}</span>
                       </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-red-600 hover:bg-red-50 hover:border-red-100 transition shadow-sm"
                    >
                      <LogOut size={14} />
                      <span>خروج از پنل کاربری</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main View Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full" id="main-content-layout">
        {role === "student" && (
          <>
            {view === "dashboard" && <DashboardView student={student} onNavigate={(target) => setView(target)} />}
            {view === "manova" && <ManovaDashboard student={student} onNavigate={(target) => setView(target)} />}
            {view === "report" && <ReportCardView student={student} onNavigate={(target) => setView(target)} />}
            {view === "schedule" && <StudyPlanView />}
            {view === "counselor" && <CounselorView student={student} onNavigate={(target) => setView(target)} />}
            {view === "progress" && <ProgressView />}
            {view === "traps" && <TestTrapsView student={student} />}
            {view === "quiz" && <CustomQuizGenerator student={student} />}
            {view === "psychology" && <AssessmentView student={student} onNavigateChange={(target) => setView(target)} />}
          </>
        )}

        {role === "parent" && (
          <>
            {view === "parents" && <ParentsView student={student} />}
            {view === "manova" && <ManovaDashboard student={student} onNavigate={(target) => setView(target)} />}
            {view === "report" && <ReportCardView student={student} />}
            {view === "psychology" && <AssessmentView student={student} onNavigateChange={(target) => setView(target)} />}
          </>
        )}

        {role === "admin" && (
          <>
            {view === "admin" && <AdminView student={student} />}
            {view === "manova" && <ManovaDashboard student={student} onNavigate={(target) => setView(target)} />}
          </>
        )}

        {student && (
          <ProfileSettingsView 
            student={student} 
            isOpen={isProfileOpen} 
            onClose={() => setIsProfileOpen(false)} 
            onUpdate={handleUpdateStudent}
          />
        )}

        <FocusChallengeOverlay 
          isActive={isFocusChallengeOpen} 
          onClose={() => setIsFocusChallengeOpen(false)} 
          onComplete={(score) => {
             console.log("Challenge completed with score:", score);
          }}
        />
      </main>

      {/* Persistent Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400 mt-10">
        <div>پلتفرم هوشمند آموزشی و برنامه‌ریزی درسی {BRAND_CONFIG.fullName} بر اساس مدل ارزیابی کنکور سراسری • کپی‌رایت ۱۴۰۵</div>
      </footer>
    </div>
  );
}
