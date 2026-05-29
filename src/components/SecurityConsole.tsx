import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Database, 
  Eye, 
  AlertTriangle, 
  Cpu, 
  Activity, 
  ChevronRight,
  Fingerprint,
  RefreshCw,
  Server,
  Zap,
  Terminal,
  ShieldAlert,
  Radar,
  Users
} from 'lucide-react';
import { motion } from 'motion/react';

interface ModuleConfig {
  id: string;
  name: string;
  status: string;
  desc: string;
  icon: React.ReactNode;
  completed: boolean;
  category: string;
  badge: string;
}

const SecurityConsole: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<null | "passed" | "warning">(null);
  const [scanProgress, setScanProgress] = useState(0);

  const [isPentesting, setIsPentesting] = useState(false);
  const [pentestLogs, setPentestLogs] = useState<string[]>([]);
  const [pentestScore, setPentestScore] = useState<number | null>(null);

  const [institutions, setInstitutions] = useState([
    { id: "inst-1", name: "مرکز وکلای قوه قضائیه", type: "government", activeFeatures: ["aiAnalysis", "securityCheck"], students: 4500 },
    { id: "inst-2", name: "کانون وکلای دادگستری مرکز", type: "ngo", activeFeatures: ["aiAnalysis", "customSimulator", "whiteLabel"], students: 12000 },
    { id: "inst-3", name: "موسسه آموزش عالی چتر دانش", type: "private", activeFeatures: ["aiAnalysis", "customSimulator", "securityCheck", "whiteLabel"], students: 8500 }
  ]);

  const [modules, setModules] = useState<ModuleConfig[]>([
    { 
      id: "audit", 
      name: "سامانه پایش رفتار داوطلبان (Audit Trail & Telemetry)", 
      status: "stable", 
      desc: "ثبت بی‌وقفه تمام رویدادها، تغییر سوالات توسط ارزیابان، دانلود و محاسبات AI با متادیتای صوتی و ترازگیری داوطلب.",
      icon: <Eye size={18} className="text-emerald-500" />,
      completed: true,
      category: "core",
      badge: "پیاده‌سازی شده"
    },
    { 
      id: "sanitizer", 
      name: "پاکسازی هوشمند استایل‌های کارنامه خروجی PDF (Crash Barrier)", 
      status: "stable", 
      desc: "تحلیل و جایگزینی کدهای رنگی مدرن oklch و oklab به صورت بلادرنگ در لایه‌های HTML پیش از تبدیل به کارنامه دیجیتال جهت ممانعت از کرش در پروسه تولید خروجی.",
      icon: <ShieldCheck size={18} className="text-emerald-500" />,
      completed: true,
      category: "core",
      badge: "فعال و عملیاتی"
    },
    { 
      id: "rules", 
      name: "قوانین تفکیک چندمستاجری (Firestore Isolation Rules)", 
      status: "stable", 
      desc: "تعریف مدل تفکیک داده‌ای موسسات در سطح پایگاه داده Firebase و اعتبارسنجی نقش‌ها (role validation) جهت صیانت از حریم خصوصی داوطلبان چتر دانش.",
      icon: <Database size={18} className="text-emerald-500" />,
      completed: true,
      category: "core",
      badge: "یکپارچه شده"
    },
    { 
      id: "input_shield", 
      name: "سیستم صیانت از ورودی کلاینت (NoSQL SQL-Injection Guard)", 
      status: "stable", 
      desc: "اعمال پکیج‌های فیلتراسیون کدهای مخرب و فیلتر کاراکترهای نامعتبر روی پین کد کانون وکلا و فیلدهای تلفن همراه داوطلبان در فرم ورود.",
      icon: <Terminal size={18} className="text-emerald-500" />,
      completed: true,
      category: "core",
      badge: "پایدار و ایمن"
    },
    { 
      id: "mfa", 
      name: "احراز هویت چند عاملی پیامکی (SMS MFA Gateway)", 
      status: "in_dev", 
      desc: "ارسال رمز پویای دو مرحله‌ای از طریق اتصال وب‌سرویس درگاه پیامکی پیش از تایید ورود داوطلب و مدیر به سیستم.",
      icon: <Fingerprint size={18} className="text-amber-500" />,
      completed: false,
      category: "roadmap",
      badge: "در دست توسعه"
    },
    { 
      id: "crypt", 
      name: "رمزنگاری سراسری داده‌های حساس (E2E P2C Encryption)", 
      status: "in_dev", 
      desc: "کدگذاری کلیدهای شخصی و اطلاعات هویتی به روش نامتقارن پیش از ذخیره در پایگاه داده همگام‌ساز کلود.",
      icon: <Lock size={18} className="text-amber-500" />,
      completed: false,
      category: "roadmap",
      badge: "در دست توسعه"
    },
    { 
      id: "blockchain", 
      name: "راستی‌آزمایی زنجیره‌ای کارنامه‌ها (Hash Integrity Check)", 
      status: "in_dev", 
      desc: "محاسبه اثر انگشت دیجیتال و ثبت هش یکتای کارنامه چتر دانش بر روی دفتر کل توزیع‌شده جهت ممانعت از جعل مدارک رسمی وکلا.",
      icon: <Zap size={18} className="text-indigo-500" />,
      completed: false,
      category: "roadmap",
      badge: "طراحی پروپوزال"
    }
  ]);

  const toggleFeature = (instId: string, feature: string) => {
    setInstitutions(prev => prev.map(inst => {
      if (inst.id === instId) {
        const features = inst.activeFeatures.includes(feature)
          ? inst.activeFeatures.filter(f => f !== feature)
          : [...inst.activeFeatures, feature];
        return { ...inst, activeFeatures: features };
      }
      return inst;
    }));
  };

  const runPentest = () => {
    setIsPentesting(true);
    setPentestLogs(["[INIT] برانگیختن موتور شبیه‌ساز حمله...", "[AUTH] تلاش برای نفوذ به لایه احراز هویت با توکن‌های جعلی..."]);
    setPentestScore(null);

    const attacks = [
      { msg: "[FIREBASE] تست دسترسی غیرمجاز به متادیتای داوطلبان (Rules Check)...", result: "BLOCKED", delay: 1000 },
      { msg: "[TENANCY] شبیه‌سازی تلاش برای نفوذ از فضای یک موسسه به دیتابیس موسسه دیگر (SaaS Isolation)...", result: "ISOLATED", delay: 2000 },
      { msg: "[INJECTION] تزریق کدهای مخرب NoSQL در فیلدهای جستجوی اطلس کلیدواژه...", result: "SANITIZED", delay: 3500 },
      { msg: "[XSS] تلاش برای درج اسکریپت در کارنامه نهایی جهت سرقت کوکی‌های مدیریت...", result: "ENCODED", delay: 4500 },
      { msg: "[BRUTE_FORCE] شبیه‌سازی ۱۰۰۰ ورود همزمان جهت بررسی نرخ پایداری لایه Load Balancer...", result: "THROTTLED", delay: 5500 },
      { msg: "[SPOOFING] تلاش برای تغییر نقش (Role) از داوطلب به ادمین در سطح دیتابیس مرکزی...", result: "REJECTED_BY_SERVER", delay: 6500 },
      { msg: "[SUMMARY] تحلیل نهایی لایه‌های دفاعی SaaS چتر دانش تکمیل شد.", result: "SUCCESS", delay: 7500 }
    ];

    attacks.forEach((attack, index) => {
      setTimeout(() => {
        setPentestLogs(prev => [...prev, `${attack.msg} [${attack.result}]`]);
        if (index === attacks.length - 1) {
          setIsPentesting(false);
          setPentestScore(98);
        }
      }, attack.delay);
    });
  };

  const toggleModuleCompleted = (modId: string) => {
    setModules(prev => prev.map(m => {
      if (m.id === modId) {
        const nextCompleted = !m.completed;
        return {
          ...m,
          completed: nextCompleted,
          status: nextCompleted ? "stable" : "in_dev",
          badge: nextCompleted ? "فعال شده (پایدار)" : "در دست توسعه"
        };
      }
      return m;
    }));
  };

  const completedCount = modules.filter(m => m.completed).length;
  const totalCount = modules.length;
  const resiliencePercent = Math.min(100, Math.round((completedCount / totalCount) * 100));

  const handleRunSecurityTest = () => {
    setIsScanning(true);
    setScanProgress(0);
    setScanResult(null);
    
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setScanResult("passed");
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans" dir="rtl">
      <header className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
            <ShieldCheck size={36} className="text-indigo-600" />
            کنسول امنیتی و مدیریت زیرساخت (Sana-OS)
          </h1>
          <p className="text-slate-500 font-bold mt-1 text-sm bg-indigo-50 inline-block px-3 py-1 rounded-full border border-indigo-100">
            پایش هوشمند لایه‌های امنیتی و یکپارچگی داده‌های حقوقی
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
          <div className="text-left">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Server Status</p>
            <p className="text-xs font-black text-emerald-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              عملیاتی (Online)
            </p>
          </div>
          <div className="w-px h-8 bg-slate-100 mx-2" />
          <Server size={24} className="text-slate-400" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Right Column: Roadmap & Stats */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Security Integrity Test Module */}
          <section className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-black mb-2 flex items-center gap-2">
                    <Activity className="text-indigo-400" />
                    ماژول تست امنیت و پایداری (Integrity Check)
                  </h2>
                  <p className="text-slate-400 text-xs font-medium">بررسی خودکار ساختارهای دیتابیس و توکن‌های دسترسی داوطلبان</p>
                </div>
                <button 
                  onClick={handleRunSecurityTest}
                  disabled={isScanning}
                  className="bg-white text-slate-900 px-6 py-2.5 rounded-2xl text-xs font-black hover:bg-indigo-50 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isScanning ? "در حال اجرای تست..." : "شروع خودارزیابی امنیتی"}
                </button>
              </div>

              {isScanning && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex justify-between text-[10px] font-mono text-indigo-300">
                    <span>SYSTEM_SCAN_ACTIVE</span>
                    <span>{scanProgress}%</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-indigo-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${scanProgress}%` }}
                    />
                  </div>
                  <div className="flex gap-4 overflow-hidden h-6">
                    <p className="text-[10px] font-mono text-slate-500">
                      [INFO] Checking database indexing... [OK] | [INFO] Validating Auth Tokens... [WAITING] | [WARN] 2 endpoints remain public...
                    </p>
                  </div>
                </div>
              )}

              {scanResult === "passed" && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-4"
                >
                  <ShieldCheck className="text-emerald-500 shrink-0" size={32} />
                  <div>
                    <p className="text-sm font-black text-emerald-400">یکپارچگی سیستم تایید شد</p>
                    <p className="text-[10px] text-emerald-500/70">تمامی توکن‌ها معتبر و ساختار دیتابیس مطابق با استاندارد ISO-27001 کدگذاری شده است.</p>
                  </div>
                </motion.div>
              )}
            </div>
          </section>

          {/* Automated Penetration Test (Simulation) */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <ShieldAlert size={20} className="text-rose-600" />
                شبیه‌ساز تست نفوذ خودکار (Penetration Test)
              </h2>
              <button 
                onClick={runPentest}
                disabled={isPentesting}
                className="bg-slate-900 text-white text-[10px] px-4 py-2 rounded-xl font-black flex items-center gap-2 hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
              >
                {isPentesting ? <RefreshCw size={12} className="animate-spin" /> : <Radar size={12} />}
                اجرای سناریوی حمله (Simulation)
              </button>
            </div>

            <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                 <div className="h-full w-full bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]" />
               </div>

               <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="md:col-span-2 space-y-3 font-mono text-[10px]">
                   <div className="flex items-center gap-2 text-slate-500 mb-4 border-b border-slate-800 pb-2">
                     <Terminal size={14} />
                     <span>LIVE_ATTACK_FEED</span>
                   </div>
                   <div className="h-48 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                     {pentestLogs.length === 0 ? (
                       <p className="text-slate-700 italic">موتور شبیه‌ساز آماده به کار...</p>
                     ) : (
                       pentestLogs.map((log, i) => (
                         <div key={i} className="flex gap-2">
                           <span className="text-indigo-500 shrink-0 select-none">❯</span>
                           <span className={log.includes("BLOCKED") || log.includes("ISOLATED") || log.includes("SANITIZED") ? "text-emerald-400" : log.includes("REJECTED") ? "text-amber-400" : "text-slate-300"}>
                             {log}
                           </span>
                         </div>
                       ))
                     )}
                   </div>
                 </div>

                 <div className="flex flex-col items-center justify-center border-l border-slate-800/50 pr-4">
                     <p className="text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest text-center">Defensive Score</p>
                     <div className="relative w-24 h-24 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90">
                          <circle cx="48" cy="48" r="40" fill="transparent" stroke="currentColor" strokeWidth="6" className="text-slate-900" />
                          <circle 
                            cx="48" cy="48" r="40" 
                            fill="transparent" 
                            stroke="currentColor" 
                            strokeWidth="6" 
                            strokeDasharray={251.2}
                            strokeDashoffset={pentestScore ? (251.2 - (251.2 * pentestScore) / 100) : 251.2}
                            className={`${pentestScore && pentestScore > 90 ? "text-emerald-500" : "text-indigo-500"} transition-all duration-1000`}
                          />
                        </svg>
                        <span className="absolute text-xl font-black text-white">{pentestScore ? `${pentestScore}%` : "---"}</span>
                     </div>
                     {pentestScore && (
                       <div className="mt-4 text-center">
                         <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full font-black font-mono">HIGH RESILIENCE</span>
                       </div>
                     )}
                  </div>
               </div>
            </div>
          </section>

          {/* Multi-Tenant Institution Manager & Feature Toggles */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Users size={20} className="text-indigo-600" />
                مدیریت چندمستاجری (Multi-Tenant Manager)
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                  مدل SaaS کلود (Isolate Schema)
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {institutions.map(inst => (
                <div key={inst.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition group overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-1 h-full bg-indigo-600 opacity-0 group-hover:opacity-100 transition" />
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-sm font-black text-slate-800">{inst.name}</h3>
                        <span className="text-[9px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-bold uppercase tracking-tight">
                          {inst.type}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold flex items-center gap-2">
                        <Database size={10} />
                        تعداد داوطلبان متصل: {inst.students.toLocaleString('fa-IR')} نفر
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: "aiAnalysis", label: "تحلیل هوش مصنوعی", icon: <Cpu size={12} /> },
                        { key: "customSimulator", label: "شبیه‌ساز تستی", icon: <Activity size={12} /> },
                        { key: "securityCheck", label: "پایش امنیتی", icon: <Lock size={12} /> },
                        { key: "whiteLabel", label: "شخصی‌سازی برند", icon: <Zap size={12} /> }
                      ].map(feature => (
                        <button
                          key={feature.key}
                          onClick={() => toggleFeature(inst.id, feature.key)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black transition border cursor-pointer ${
                            inst.activeFeatures.includes(feature.key)
                              ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-100"
                              : "bg-slate-50 text-slate-400 border-slate-100 grayscale"
                          }`}
                        >
                          {feature.icon}
                          {feature.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Module Proposals & Architecture Compliance Checklist */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Lock size={20} className="text-indigo-600" />
                  چک‌لیست تطابق معماری و لایه‌های امنیتی فعال (Sana-OS Certification)
                </h2>
                <p className="text-xs font-bold text-slate-400">
                  برای ارزیابی و شبیه‌سازی، می‌توانید تیک مربوط به وضعیت هر لایه حفاظتی را تغییر دهید.
                </p>
              </div>
              <div className="bg-indigo-50 px-4 py-3 rounded-2xl border border-indigo-120 flex items-center gap-3 shrink-0">
                <ShieldCheck size={28} className="text-indigo-600" />
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">شاخص امنیتی سیستم</p>
                  <p className="text-base font-black text-indigo-900 tracking-tight">
                    {resiliencePercent}% تاب‌آوری فعال
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modules.map((mod) => (
                <div 
                  key={mod.id} 
                  onClick={() => toggleModuleCompleted(mod.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer select-none relative overflow-hidden group ${
                    mod.completed 
                      ? "bg-white border-emerald-200 shadow-lg shadow-emerald-50/50 hover:border-emerald-300"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
                  }`}
                >
                   {/* Background Glow for Active items */}
                   {mod.completed && (
                     <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full translate-x-1/3 -translate-y-1/3" />
                   )}

                   <div className="flex justify-between items-start mb-4 relative z-10">
                     <div className="flex items-center gap-3">
                       <div className={`p-2.5 rounded-xl transition-all ${
                         mod.completed 
                           ? "bg-emerald-50 text-emerald-600" 
                           : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"
                       }`}>
                         {mod.icon}
                       </div>
                       <div className="text-right">
                         <h3 className="text-xs font-black text-slate-800 line-clamp-1">{mod.name}</h3>
                         <span className="text-[9px] font-mono text-slate-400 mt-0.5 block">{mod.id.toUpperCase()}_GUARD</span>
                       </div>
                     </div>
                     
                     <div className="flex items-center gap-2">
                       <span className={`text-[9px] px-2.5 py-1 rounded-full font-black ${
                         mod.completed 
                           ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20" 
                           : "bg-amber-500/10 text-amber-700 border border-amber-500/20"
                       }`}>
                         {mod.badge}
                       </span>
                       <input 
                         type="checkbox"
                         checked={mod.completed}
                         onChange={() => {}} // handled by parent div click
                         className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer accent-emerald-500"
                       />
                     </div>
                   </div>
                   
                   <p className="text-[10px] leading-relaxed text-slate-500 font-bold min-h-[40px] block relative z-10">
                     {mod.desc}
                   </p>
 
                   <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center relative z-10">
                     <span className={`text-[9.5px] font-bold ${mod.completed ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}>
                       {mod.completed ? "✓ فعال و عملیاتی در هسته برنامه" : "⏳ کلیک جهت فعال‌سازی تست آزمایشی"}
                     </span>
                     <ChevronRight size={14} className={mod.completed ? "text-emerald-500" : "text-slate-300"} />
                   </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Left Column: Security Infrastructure Info */}
        <div className="space-y-8">
          
          {/* Database Structure Summary */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-md font-black text-slate-900 mb-6 flex items-center gap-2">
              <Database size={18} className="text-indigo-600" />
              ساختار دیتابیس (Schema Analysis)
            </h2>
            
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between mb-2">
                  <span className="text-[10px] font-black text-slate-700">مجموعه اسناد: Users</span>
                  <span className="text-[10px] font-mono text-slate-400">AES-256</span>
                </div>
                <div className="h-1 bg-slate-200 rounded-full">
                  <div className="h-full bg-slate-400 w-full rounded-full" />
                </div>
                <p className="text-[9px] text-slate-400 mt-2">محافظت از حریم خصوصی داוطلبان توسط قوانین Firestore</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between mb-2">
                  <span className="text-[10px] font-black text-slate-700">مجموعه اسناد: ExamResults</span>
                  <span className="text-[10px] font-mono text-slate-400">SHARDED</span>
                </div>
                <div className="h-1 bg-slate-200 rounded-full">
                  <div className="h-full bg-indigo-500 w-[70%] rounded-full" />
                </div>
                <p className="text-[9px] text-slate-400 mt-2">ذخیره‌سازی هوشمند ترازها و تحلیل‌های AI برای مراجعات آتی</p>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-900 text-white shadow-xl shadow-indigo-100">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={14} className="text-amber-400" />
                  <span className="text-[10px] font-black">هشدار امنیتی:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-indigo-100 font-medium italic">
                  "اطمینان حاصل کنید که توکن‌های دسترسی API هر ۳۰ روز یکبار بازشماری شوند تا از هرگونه نشت اطلاعات احتمالی جلوگیری گردد."
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
              <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Active Users</p>
              <p className="text-xl font-black text-slate-900 tracking-tight">1,204+</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
              <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Audit Logs</p>
              <p className="text-xl font-black text-slate-900 tracking-tight">8.5k</p>
            </div>
          </div>

          <div className="bg-indigo-600 text-white p-6 rounded-3xl shadow-xl shadow-indigo-200">
             <div className="flex items-center gap-3 mb-4">
               <Cpu size={24} />
               <span className="text-sm font-black italic uppercase">Brain Logic V4</span>
             </div>
             <p className="text-xs leading-relaxed opacity-90 font-medium">
               این سامانه از متدهای رمزنگاری زنجیره‌ای برای محافظت از سوالات آزمون نهایی استفاده می‌کند. هرگونه دسترسی غیرمجاز به دیتابیس به صورت خودکار توسط لایه «چک امنیتی» شناسایی و مسدود می‌گردد.
             </p>
          </div>
        </div>

      </main>
    </div>
  );
};

export default SecurityConsole;
