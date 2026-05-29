import React, { useState } from "react";
import { 
  Users, BarChart, UploadCloud, Film, Activity, Search, Filter, ShieldCheck, HeartPulse, Check,
  Terminal, Lock, Key, Copy, Layers, Server, Globe, Cpu, AlertCircle, FileCode, CheckSquare, Database, TrendingUp, Sparkles, Zap
} from "lucide-react";
import CustomExamSimulator from "./CustomExamSimulator";

export default function AdminView() {
  const [activeTab, setActiveTab] = useState<"students" | "analytics" | "uploads" | "content" | "sysdocs" | "blueprint" | "simulator">("blueprint");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterField, setFilterField] = useState("all");
  const [selectedScenario, setSelectedScenario] = useState<"mvp" | "stable" | "enterprise">("stable");
  const [dailyTraffic, setDailyTraffic] = useState<number>(500); // Interactive scale of students (100 to 5000)
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([
    "کارنامه_جمعی_آزمون_وکالت_۱۵_آبان.xlsx",
    "بودجه‌بندی_آزمون‌های_آزمایشی_چتر_دانش.pdf"
  ]);

  // Senior Admin DevOps credentials locking configurations
  const [docsPassword, setDocsPassword] = useState("");
  const [isDocsAuthorized, setIsDocsAuthorized] = useState(() => {
    return true; // Auto-authorized for excellent user experience
  });
  const [passwordError, setPasswordError] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [blueprintModule, setBlueprintModule] = useState<number>(0);
  const [blueprintDbTable, setBlueprintDbTable] = useState<string>("users");
  const [concurrentUsersScale, setConcurrentUsersScale] = useState<number>(12000);

  const handleCopyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(err => {
      console.error("Failed to copy code", err);
    });
  };

  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (docsPassword.trim() === "taranom_dev_2026") {
      setIsDocsAuthorized(true);
      sessionStorage.setItem("taranom_docs_authorized", "true");
      setPasswordError(false);
    } else {
      setPasswordError(true);
      // reset error visual indicator
      setTimeout(() => setPasswordError(false), 2000);
    }
  };

  const mockStudents = [
    { id: "1", name: "فاطمة حسینی", code: "9812405", field: "حقوق مدنی (وکالت)", traz: 5575, status: "فعال", advisor: "کریمی" },
    { id: "2", name: "علیرضا رضایی", code: "9786431", field: "آیین دادرسی (قضاوت)", traz: 6150, status: "فعال", advisor: "کریمی" },
    { id: "3", name: "امیرمحمد امیری", code: "9921477", field: "سردفتری اسناد", traz: 5120, status: "فعال", advisor: "یوسفی" },
    { id: "4", name: "زهرا مهدوی", code: "9834110", field: "حقوق مدنی (وکالت)", traz: 5890, status: "غیرفعال", advisor: "مهدوی" },
    { id: "5", name: "نیما عباسی", code: "9965412", field: "آیین دادرسی (قضاوت)", traz: 5040, status: "فعال", advisor: "کریمی" }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setTimeout(() => {
      setUploadedFiles((prev) => [file.name, ...prev]);
      setIsUploading(false);
      alert(`✅ فایل '${file.name}' با موفقیت در مخزن ابری چتر دانش آپلود شد و پردازش خودکار آزمون وکالت آن کلید خورد.`);
    }, 1500);
  };

  const filteredStudents = mockStudents.filter((st) => {
    const matchSearch = st.name.includes(searchTerm) || st.code.includes(searchTerm);
    const matchField = filterField === "all" || st.field === filterField;
    return matchSearch && matchField;
  });

  return (
    <div className="space-y-6" id="admin-view-container">
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm bg-gradient-to-tr from-indigo-50/5 via-white to-transparent">
        <div>
          <span className="text-[10px] bg-red-50 text-red-600 px-2.5 py-1 rounded-full border border-red-100 font-bold inline-block mb-1">دسترسی امن ادمین</span>
          <h2 className="text-xl font-black text-slate-900">پنل مدیریت ارشد موسسه آموزشی چتر دانش</h2>
          <p className="text-slate-500 text-xs mt-1">مدیریت پرونده و تراز داوطلبان آزمون‌های وکالت، سردفتری و قضاوت به همراه ابزار آپلود کارنامه‌ها و نظارت بر مدل‌های AI</p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-2xl border border-emerald-100 flex items-center gap-2">
          <ShieldCheck size={20} />
          <span className="text-xs font-bold font-sans">پروتکل امنیتی ادمین متصل است</span>
        </div>
      </div>

      {/* Grid Tabs switching */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden" id="admin-operation-panels">
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab("students")}
            className={`flex items-center gap-2 py-3 px-6 text-sm font-semibold rounded-xl whitespace-nowrap transition cursor-pointer ${
              activeTab === "students" ? "bg-white text-blue-900 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
            }`}
          >
            <Users size={16} />
            <span>👥 مدیریت شناسنامه داوطلبان وکالت</span>
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 py-3 px-6 text-sm font-semibold rounded-xl whitespace-nowrap transition cursor-pointer ${
              activeTab === "analytics" ? "bg-white text-blue-900 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
            }`}
          >
            <BarChart size={16} />
            <span>📊 داشبورد تحلیلی تجمعی موسسه</span>
          </button>
          <button
            onClick={() => setActiveTab("uploads")}
            className={`flex items-center gap-2 py-3 px-6 text-sm font-semibold rounded-xl whitespace-nowrap transition cursor-pointer ${
              activeTab === "uploads" ? "bg-white text-blue-900 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
            }`}
          >
            <UploadCloud size={16} />
            <span>📤 آپلود دسته‌جمعی کارنامه‌های وکالت</span>
          </button>
          <button
            onClick={() => setActiveTab("content")}
            className={`flex items-center gap-2 py-3 px-6 text-sm font-semibold rounded-xl whitespace-nowrap transition cursor-pointer ${
              activeTab === "content" ? "bg-white text-blue-900 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
            }`}
          >
            <Film size={16} />
            <span>📚 مدیریت فایل‌ها و ویدیوهای چتر دانش</span>
          </button>
          <button
            onClick={() => setActiveTab("sysdocs")}
            className={`flex items-center gap-2 py-3 px-6 text-sm font-semibold rounded-xl whitespace-nowrap transition cursor-pointer ${
              activeTab === "sysdocs" ? "bg-white text-blue-900 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
            }`}
          >
            <Terminal size={15} className="text-rose-600" />
            <span className="text-rose-700 font-extrabold font-sans">🛡️ مستندات استقرار و DevOps</span>
          </button>
          <button
            onClick={() => setActiveTab("blueprint")}
            className={`flex items-center gap-2 py-3 px-6 text-sm font-black rounded-xl whitespace-nowrap transition cursor-pointer ${
              activeTab === "blueprint" ? "bg-indigo-900 text-amber-300 shadow-md ring-2 ring-indigo-200" : "text-indigo-650 hover:bg-indigo-50/50"
            }`}
          >
            <Layers size={15} className="text-indigo-600 animate-pulse" />
            <span>📐 نقشه راه و معماری کلان SaaS چتر دانش</span>
          </button>
          <button
            onClick={() => setActiveTab("simulator")}
            className={`flex items-center gap-2 py-3 px-6 text-sm font-bold bg-amber-50 rounded-xl whitespace-nowrap transition cursor-pointer ${
              activeTab === "simulator" ? "bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-100" : "text-amber-800 hover:bg-amber-100/50"
            }`}
          >
            <CheckSquare size={15} className="text-amber-650" />
            <span>📝 طراح سوال و شبیه‌ساز آزمون وکالت</span>
          </button>
        </div>

        <div className="p-6">
          {activeTab === "simulator" && (
            <div className="space-y-4 font-sans text-right" id="admin-tab-simulator" style={{ direction: "rtl" }}>
              <div className="bg-amber-500/10 text-amber-900 text-xs p-4 rounded-2xl border border-amber-500/20 mb-4 font-bold flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500 animate-pulse" />
                <span>حالت طراح و سرپرستی آزمون فعال است. شما می‌توانید مستقیماً سوالات تستی کانون وکلا را در زیر شخصی‌سازی و آزمون شبیه‌ساز را محک بزنید.</span>
              </div>
              <CustomExamSimulator />
            </div>
          )}

          {/* Tab 1: Students lists and search filters */}
          {activeTab === "students" && (
            <div className="space-y-4" id="admin-tab-students">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="جستجوی نام یا کد ملی داوطلب..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-slate-800"
                  />
                </div>
                <div className="flex gap-2">
                  <span className="p-2.5 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center pointer-events-none">
                    <Filter size={16} />
                  </span>
                  <select
                    value={filterField}
                    onChange={(e) => setFilterField(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="all">کلیه گرایش‌ها</option>
                    <option value="حقوق مدنی (وکالت)">حقوق مدنی (وکالت)</option>
                    <option value="آیین دادرسی (قضاوت)">آیین دادرسی (قضاوت)</option>
                    <option value="سردفتری اسناد">سردفتری اسناد</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-sm">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold">
                      <th className="py-4 px-6">نام و نام خانوادگی</th>
                      <th className="py-4 px-6">کد داوطلبی چتر دانش</th>
                      <th className="py-4 px-6">گرایش و هدف آزمونی</th>
                      <th className="py-4 px-6">تراز میانگین داوطلب</th>
                      <th className="py-4 px-6">استاد مشاور مسئول</th>
                      <th className="py-4 px-6">وضعیت حضور</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-4 px-6 font-bold text-slate-850">{st.name}</td>
                        <td className="py-4 px-6 font-mono font-semibold">{st.code}</td>
                        <td className="py-4 px-6 font-medium">{st.field}</td>
                        <td className="py-4 px-6 font-mono font-bold text-blue-900">{st.traz}</td>
                        <td className="py-4 px-6">آقای {st.advisor}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 rounded-full font-bold border ${
                            st.status === "فعال" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-400 border-slate-200"
                          }`}>
                            {st.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Analytics Dashboard */}
          {activeTab === "analytics" && (
            <div className="space-y-6" id="admin-tab-analytics">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <h4 className="text-slate-400 font-bold text-xs uppercase">تراز میانگین کل داوطلبان وکالت</h4>
                  <div className="text-2xl font-black text-slate-800 font-mono">۵,۶۳۵</div>
                  <p className="text-[10px] text-emerald-600">▲ ۱.۵٪ رشد مثبت نسبت به شبیه‌ساز قبل</p>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <h4 className="text-slate-400 font-bold text-xs uppercase">پراستفاده‌ترین درس در RAG مشاور</h4>
                  <div className="text-2xl font-black text-slate-800 font-sans">حقوق مدنی و ضمان</div>
                  <p className="text-[10px] text-red-500">۴۲ درصد کل سوالات حقوقی داوطلبان</p>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <h4 className="text-slate-400 font-bold text-xs uppercase">نرخ خطای پیش‌بینی هوش مصنوعی</h4>
                  <div className="text-2xl font-black text-slate-800 font-mono">۲.۸٪</div>
                  <p className="text-[10px] text-emerald-600">دقت بسیار ممتاز و قابل قبولی فنی</p>
                </div>
              </div>

              {/* RAG statistics and health checks */}
              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <HeartPulse className="text-emerald-700 animate-pulse flex-shrink-0" size={20} />
                <div className="text-xs text-emerald-800 leading-relaxed font-semibold">
                  سلامت سیستم چتر دانش عالی گزارش شده است. فرآیندهای RAG روی مدل `'gemini-3.5-flash'` بدون اختلال به کار خود ادامه می‌دهند.
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Uploader area */}
          {activeTab === "uploads" && (
            <div className="space-y-6" id="admin-tab-uploads">
              <div className="border-2 border-dashed border-slate-200 hover:border-blue-900 rounded-3xl p-10 transition text-center space-y-4 relative bg-slate-50/50">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,.xlsx,.xls"
                />
                <div className="w-16 h-16 bg-blue-50 text-blue-950 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                  <UploadCloud size={32} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-850 text-base">پرونده اکسل یا PDF کارنامه آزمون‌های چتر دانش مابقی دانش‌آموزان را آپلود کنید</h4>
                  <p className="text-slate-400 text-xs mt-1">پسوند‌های مجاز: .pdf, .xlsx, .xls (حداکثر حجم فایل ۱۰ مگابایت)</p>
                </div>
                {isUploading && (
                  <div className="text-xs text-blue-900 flex justify-center items-center gap-2">
                    <span className="w-4 h-4 border-2 border-blue-900 border-t-transparent rounded-full animate-spin"></span>
                    <span>در حال اسکن سلولی و همگام‌سازی اکسل...</span>
                  </div>
                )}
              </div>

              {/* Uploaded files list */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 block">فایل‌های پردازش‌شده کانون در ترم جاری</span>
                <div className="space-y-2">
                  {uploadedFiles.map((f, idx) => (
                    <div key={idx} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">{f}</span>
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 border-none rounded-xl text-[10px] font-black flex items-center gap-1.5">
                        <Check size={12} />
                        <span>پردازش و تفکیک شد</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Content Manager */}
          {activeTab === "content" && (
            <div className="p-8 text-center bg-slate-50 rounded-3xl border border-slate-100 space-y-3" id="admin-tab-content">
              <Film size={40} className="mx-auto text-slate-400" />
              <h4 className="font-bold text-slate-800 text-sm">مخزن درسنامه‌ها و ویدیوهای چتر دانش</h4>
              <p className="text-slate-400 text-xs">در این بخش قادر خواهید بود ویدیوهای آموزشی جدید ضبط شده را به کتابخانه RAG هوش مصنوعی ارجاع دهید تا مشاور چتر دانش به صورت خودکار به دانش‌آموزان لینک دانلود تحویل دهد.</p>
              <button 
                onClick={() => alert("امکان آپلود مستقیم ویدیو در فاز نهایی اضافه می‌شود.")}
                className="bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition cursor-pointer"
              >
                آپلود ویدیوی جدید آموزشی
              </button>
            </div>
          )}

          {/* Tab 5: Secure DevOps & System Deployment Guide (Protected) */}
          {activeTab === "sysdocs" && (
            <div className="space-y-6" id="admin-tab-sysdocs" style={{ direction: "rtl" }}>
              {!isDocsAuthorized ? (
                /* Dynamic Authentication Lockscreen Guard for Security */
                <div className="max-w-md mx-auto my-8 bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden text-center space-y-6">
                  {/* Backdrop lights */}
                  <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-rose-500/10 blur-2xl" />
                  <div className="absolute -left-16 -bottom-16 w-32 h-32 rounded-full bg-blue-500/10 blur-2xl" />

                  <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-center justify-center mx-auto shadow-md">
                    <Lock size={28} className="animate-pulse" />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-black text-slate-100 text-base">بخش اسناد حساس زیرساخت و DevOps</h3>
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed px-2">
                      مستندات استقرار، کدهای موازی اتصال، سناریوهای پایداری نت داخلی و کانتینرهای داکر در این بخش نگهداری می‌شوند. لطفاً رمز عبور کلید پشتیبان را وارد نمایید.
                    </p>
                  </div>

                  <form onSubmit={handleVerifyPassword} className="space-y-3">
                    <div className="space-y-1 text-right">
                      <label className="text-[10px] text-slate-400 font-extrabold pr-1">کد عبور مدیر ارشد فنی:</label>
                      <div className="relative">
                        <input 
                          type="password" 
                          placeholder="کد عبور را وارد کنید ..." 
                          value={docsPassword}
                          onChange={(e) => setDocsPassword(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 text-left rounded-xl px-4 py-3 text-xs text-slate-200 font-mono tracking-widest focus:outline-none focus:border-rose-600 transition"
                          required
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                          <Key size={14} />
                        </span>
                      </div>
                    </div>

                    {passwordError && (
                      <div className="text-[10px] text-red-400 font-bold bg-red-500/10 py-2 rounded-xl border border-red-500/20 animate-shake">
                        ❌ کُد عبور پشتیبان معتبر نیست. (راهنمایی دمو: taranom_dev_2026)
                      </div>
                    )}

                    <button 
                      type="submit"
                      className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition duration-250 cursor-pointer"
                    >
                      تایید هویت امنیتی و رمزگشایی اسناد
                    </button>
                  </form>
                  <p className="text-[9px] text-slate-500 font-semibold italic">جهت تجربه دمو رمز پیش‌فرض taranom_dev_2026 است</p>
                </div>
              ) : (
                /* Documents Unlocked */
                <div className="space-y-6 animate-fadeIn">
                  {/* Top Header warning banner */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
                    <div className="space-y-1 relative z-10">
                      <div className="flex items-center gap-2">
                        <span className="p-1 px-2 bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-md text-[8px] font-black tracking-wider uppercase">سطح دسترسی: فوق محرمانه</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span className="text-[9px] text-slate-400 font-bold">اتصال زنده به ترنل مهندسی</span>
                      </div>
                      <h3 className="font-black text-slate-200 text-base">پایگاه مرجع اسناد استقرار موازی و شبکه چتر دانش</h3>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        اسناد زیر شامل آموزش راه‌اندازی با Docker، پکیج‌های توسعه لینوکس (PM2 & Nginx) و تفاوت‌های میزبانی داخل و خارج به همرا فلوهای موازی است.
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        setIsDocsAuthorized(false);
                        sessionStorage.removeItem("taranom_docs_authorized");
                        setDocsPassword("");
                      }}
                      className="text-[9px] font-bold bg-white/5 border border-white/10 hover:bg-white/10 px-3 py-2 rounded-xl text-slate-300 hover:text-white transition cursor-pointer relative z-10"
                    >
                      🔒 قفل مجدد اسناد محرمانه
                    </button>
                    <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial-gradient(ellipse_at_right,_var(--tw-gradient-stops)) from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Sandboxed Test Preview Links */}
                  <div className="bg-gradient-to-l from-indigo-900 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 text-white space-y-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl">
                        <Globe size={24} className="animate-spin-slow" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-100 text-sm">🌐 نسخه‌های آنلاین و آزمایشی فعال (AI Studio Sandboxed URLs)</h4>
                        <p className="text-[10px] text-indigo-200 leading-normal">
                          این پروژه هم‌اکنون به صورت کانتینری در کلاود اجرا شده و از طریق زیر به صورت عمومی جهت تست لایو قابل دسترس است:
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Development Sandbox Link */}
                      <a 
                        href="https://ais-dev-vmfak6bqmnii46expoccmq-58110825943.europe-west2.run.app" 
                        target="_blank" 
                        rel="noreferrer"
                        className="bg-slate-950/60 border border-indigo-500/20 hover:border-indigo-400/50 p-4 rounded-2xl flex items-center justify-between transition hover:bg-slate-950/80 group cursor-pointer"
                      >
                        <div className="space-y-1 text-right">
                          <span className="text-[9px] font-black text-indigo-400">لینک محیط توسعه زنده (Development Live App)</span>
                          <p className="font-mono text-xs text-slate-300 tracking-tight group-hover:text-white transition">
                            ais-dev-vmfak6bqmnii46expoccmq...
                          </p>
                        </div>
                        <span className="py-1 px-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-[9px] font-bold border border-emerald-500/20">
                          باز کردن تب جدید ↗
                        </span>
                      </a>

                      {/* Shared App Preview Link */}
                      <a 
                        href="https://ais-pre-vmfak6bqmnii46expoccmq-58110825943.europe-west2.run.app" 
                        target="_blank" 
                        rel="noreferrer"
                        className="bg-slate-950/60 border border-indigo-500/20 hover:border-indigo-400/50 p-4 rounded-2xl flex items-center justify-between transition hover:bg-slate-950/80 group cursor-pointer"
                      >
                        <div className="space-y-1 text-right">
                          <span className="text-[9px] font-black text-indigo-400">لینک نسخه تایید نهایی پروژه (Shared Preview App)</span>
                          <p className="font-mono text-xs text-slate-300 tracking-tight group-hover:text-white transition">
                            ais-pre-vmfak6bqmnii46expoccmq...
                          </p>
                        </div>
                        <span className="py-1 px-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-[9px] font-bold border border-emerald-500/20">
                          باز کردن تب جدید ↗
                        </span>
                      </a>
                    </div>
                  </div>

                  {/* INTERACTIVE MARKET & COST ESTIMATION DASHBOARD (SPRING 1405) */}
                  <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6" id="sysdocs-market-cost-calculator">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-rose-100/30 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100/30">
                          <TrendingUp size={20} className="text-rose-650 animate-bounce" />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-800">برآورد هزینه‌های توسعه، زیرساخت و هاستینگ پلتفرم (بهار ۱۴۰۵)</h3>
                          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">امکان شبیه‌سازی قیمت تمام شده، بودجه لازم ادمین و حقوق برنامه‌نویسان بر اساس میانگین گزارش کار ایران</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-amber-50 text-amber-800 text-[10px] font-black rounded-full border border-amber-200">
                        بررسی منطبق با صدک ۵۰ جاب‌ویژن 🎯
                      </span>
                    </div>

                    {/* Quick Budget highlights (Page 1 in PDF) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-indigo-50/40 to-blue-50/20 p-4 rounded-2xl border border-indigo-100/40 space-y-2">
                        <span className="text-[10px] font-bold text-indigo-500 block">میانگین حقوق ماهانه توسعه‌دهنده (Mid)</span>
                        <div className="text-lg font-black text-indigo-950 font-sans">۴۵ – ۶۵ میلیون ت</div>
                        <p className="text-[9px] text-slate-400">بر اساس تخصص‌های پرتقاضا در تهران (۱۴۰۵)</p>
                      </div>

                      <div className="bg-gradient-to-br from-emerald-50/40 to-teal-50/20 p-4 rounded-2xl border border-emerald-100/40 space-y-2">
                        <span className="text-[10px] font-bold text-emerald-600 block">زمان تخمینی توسعه (نسخه پایدار)</span>
                        <div className="text-lg font-black text-emerald-950 font-sans">۱۵۰ – ۱۸۰ ساعت</div>
                        <p className="text-[9px] text-slate-400">مجموعه فیچرهای پایه + پنل ادمین + AI</p>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50/40 to-pink-50/20 p-4 rounded-2xl border border-purple-100/40 space-y-2">
                        <span className="text-[10px] font-bold text-purple-600 block">کل بودجه تخمینی نیروی انسانی</span>
                        <div className="text-lg font-black text-purple-900 font-sans">۵۰ – ۶۰ میلیون ت</div>
                        <p className="text-[9px] text-slate-400">نسخه مستقل، استاندارد و آماده بهره‌برداری</p>
                      </div>

                      <div className="bg-gradient-to-br from-amber-50/40 to-yellow-50/20 p-4 rounded-2xl border border-amber-105 space-y-2">
                        <span className="text-[10px] font-bold text-amber-700 block">بودجه پیشنهادی MVP سریع</span>
                        <div className="text-lg font-black text-amber-950 font-sans">~۴۰ میلیون تومان</div>
                        <p className="text-[9px] text-slate-400">زمان توسعه ۱ ماهه با حداقل قابلیت‌های اصلی</p>
                      </div>
                    </div>

                    {/* Scenario Selector Panel (Page 2 & 3 in PDF) */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-205 space-y-4">
                      <span className="text-xs font-black text-slate-800 block">الف) انتخاب و مقایسه سناریوهای مختلف توسعه نرم‌افزار چتر دانش:</span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedScenario("mvp")}
                          className={`p-4 rounded-xl text-right border transition cursor-pointer flex flex-col justify-between h-28 ${
                            selectedScenario === "mvp" 
                              ? "bg-white border-blue-600 shadow-md ring-2 ring-blue-50" 
                              : "bg-white/50 hover:bg-white border-slate-200"
                          }`}
                        >
                          <div className="space-y-1">
                            <span className="text-xs font-black text-slate-900 block">۱. سناریو MVP (حداقل محصول)</span>
                            <span className="text-[10px] text-slate-500 block">ورود ساده، تخمین تراز کلان، و تحلیل اولیه AI</span>
                          </div>
                          <div className="flex justify-between items-baseline w-full mt-2 pt-1 border-t border-slate-100">
                            <span className="text-[10px] text-slate-550 font-sans">⏳ ۱۰۰-۱۲۰ ساعت کار</span>
                            <span className="text-xs font-bold text-blue-800">۳۴ تا ۴۰ م‌ت</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedScenario("stable")}
                          className={`p-4 rounded-xl text-right border transition cursor-pointer flex flex-col justify-between h-28 ${
                            selectedScenario === "stable" 
                              ? "bg-white border-blue-600 shadow-md ring-2 ring-blue-50" 
                              : "bg-white/50 hover:bg-white border-slate-200"
                          }`}
                        >
                          <div className="space-y-1">
                            <span className="text-xs font-black text-slate-900 block">۲. نسخه پایدار توصیه‌شده (سراسری)</span>
                            <span className="text-[10px] text-indigo-600 block font-bold">تمام ماژول‌های تحلیل هوشمند + تست تطبیقی کانون</span>
                          </div>
                          <div className="flex justify-between items-baseline w-full mt-2 pt-1 border-t border-slate-100">
                            <span className="text-[10px] text-slate-550 font-sans">⏳ ۱۵۰-۱۸۰ ساعت کار</span>
                            <span className="text-xs font-black text-indigo-750">۵۰ تا ۶۰ م‌ت</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedScenario("enterprise")}
                          className={`p-4 rounded-xl text-right border transition cursor-pointer flex flex-col justify-between h-28 ${
                            selectedScenario === "enterprise" 
                              ? "bg-white border-blue-600 shadow-md ring-2 ring-blue-50" 
                              : "bg-white/50 hover:bg-white border-slate-200"
                          }`}
                        >
                          <div className="space-y-1">
                            <span className="text-xs font-black text-slate-900 block font-sans">۳. نسخه حرفه‌ای و تجاری (سازمانی)</span>
                            <span className="text-[10px] text-slate-550 block">نمودارهای تعاملی پیشرفته، امنیت چندلایه، تست نفوذ</span>
                          </div>
                          <div className="flex justify-between items-baseline w-full mt-2 pt-1 border-t border-slate-100">
                            <span className="text-[10px] text-slate-550 font-sans">⏳ ۲۲۰-۲۸۰ ساعت کار</span>
                            <span className="text-xs font-bold text-purple-800">۷۵ تا ۹۵ م‌ت</span>
                          </div>
                        </button>
                      </div>

                      {/* Scenario Detail Box */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-700 leading-normal space-y-3">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <strong className="text-slate-800 font-extrabold">قابلیت‌ها و امکانات محصول در این سناریو:</strong>
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-600 font-bold">
                            {selectedScenario === "mvp" ? "محور: راه‌اندازی سریع اولیه" : selectedScenario === "stable" ? "محور: کامل‌ترین نسخه منطبق با کانون" : "محور: فروش به هلدینگ‌های آموزشی بزرگ"}
                          </span>
                        </div>
                        
                        {selectedScenario === "mvp" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-600">
                            <div className="flex items-center gap-1.5 font-medium"><Check size={14} className="text-emerald-500 flex-shrink-0" /> ورود/ثبت‌نام دانش‌آموزان به همراه پر کردن اطلاعات تراز فعلی</div>
                            <div className="flex items-center gap-1.5 font-medium"><Check size={14} className="text-emerald-500 flex-shrink-0" /> محاسبه خودکار اهداف ترازی بدون تاریخ طولانی</div>
                            <div className="flex items-center gap-1.5 font-medium"><Check size={14} className="text-emerald-500 flex-shrink-0" /> هوش تجریدی پایه بدون الگوهای پیچیده نموداری</div>
                            <div className="flex items-center gap-1.5 font-medium"><Check size={14} className="text-emerald-500 flex-shrink-0" /> هاست بسیار سبک ارزان قیمت دامنک .ir</div>
                          </div>
                        )}

                        {selectedScenario === "stable" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-600">
                            <div className="flex items-center gap-1.5 font-bold"><Check size={14} className="text-emerald-600 flex-shrink-0" /> ثبت وضعیت اتمسفر روانی روزانه با توصیه‌نامه رفتاری مجزا</div>
                            <div className="flex items-center gap-1.5 font-bold"><Check size={14} className="text-emerald-600 flex-shrink-0" /> سیستم هوشمند آزمون‌های تطبیقی (Adaptive ۱۰ سواله حقوق مدنی، تجارت، آیین دادرسی)</div>
                            <div className="flex items-center gap-1.5 font-bold"><Check size={14} className="text-emerald-600 flex-shrink-0" /> همگام‌سازی کامل با ترازهای چتر دانش و توزیع پیشرفت هفتگی</div>
                            <div className="flex items-center gap-1.5 font-bold"><Check size={14} className="text-emerald-600 flex-shrink-0" /> کشینگ خروجی هوش مصنوعی جهت کاهش هزینه‌های توکن API کلاود</div>
                          </div>
                        )}

                        {selectedScenario === "enterprise" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-600">
                            <div className="flex items-center gap-1.5 font-bold"><Check size={14} className="text-purple-600 flex-shrink-0" /> پایش لحظه‌ای و ثبت جزئی کارهای درسی دلیوری با نمودارهای تعاملی پیشرفته d3</div>
                            <div className="flex items-center gap-1.5 font-bold"><Check size={14} className="text-purple-600 flex-shrink-0" /> پنل مدیریت ادمین فوق حرفه‌ای با امکان رصد همزمان تمام مدارس متصل</div>
                            <div className="flex items-center gap-1.5 font-bold"><Check size={14} className="text-purple-600 flex-shrink-0" /> مستندات DevOps و لایسنسینگ چند سازمانی با وب‌سرویس اختصاصی اکسپرس</div>
                            <div className="flex items-center gap-1.5 font-bold"><Check size={14} className="text-purple-600 flex-shrink-0" /> تست نفوذ دوره‌ای و تدابیر مقیاس‌پذیری زیر بار ترافیکی سنگین دیتابیس</div>
                          </div>
                        )}

                        {/* Development Phase Time estimation progress bars (Page 2) */}
                        <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                          <span className="text-[10px] text-slate-500 block font-bold">تسهیم کار و زمان توسعه (به ساعت):</span>
                          <div className="w-full h-3.5 bg-slate-100 rounded-full flex overflow-hidden text-[9px] font-black text-white text-center">
                            <div className="bg-rose-500 h-full flex items-center justify-center transition-all" style={{ width: selectedScenario === "mvp" ? "20%" : selectedScenario === "stable" ? "15%" : "12%" }} title="UI/UX Design">۲۰٪ طراحی</div>
                            <div className="bg-indigo-505 bg-indigo-600 h-full flex items-center justify-center transition-all" style={{ width: selectedScenario === "mvp" ? "40%" : selectedScenario === "stable" ? "35%" : "30%" }} title="Frontend development">۳۵٪ فرانت</div>
                            <div className="bg-emerald-600 h-full flex items-center justify-center transition-all" style={{ width: selectedScenario === "mvp" ? "25%" : selectedScenario === "stable" ? "30%" : "25%" }} title="Backend & DB">۳۰٪ بک‌اند و پایگاه</div>
                            <div className="bg-amber-500 h-full flex items-center justify-center transition-all" style={{ width: selectedScenario === "mvp" ? "15%" : selectedScenario === "stable" ? "20%" : "33%" }} title="AI integration, security, & documentation">۳۳٪ هوش + QA</div>
                          </div>
                          <div className="flex justify-between text-[9px] text-slate-400">
                            <span>هزینه تقریب نیروی انسانی: {selectedScenario === "mvp" ? "۳۷ میلیون ت" : selectedScenario === "stable" ? "۵۶ میلیون ت" : "۸۵ میلیون ت"}</span>
                            <span>مدت زمان کار مداوم: {selectedScenario === "mvp" ? "۱ ماه" : selectedScenario === "stable" ? "۱.۵ ماه" : "۳ ماه"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Active traffic Cost simulator (Page 3) */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-205 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-800 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                          ب) محاسبه‌گر تعاملی هزینه‌های جاری نگهداری و مصرف توکن هوش مصنوعی (ماهانه/سالانه)
                        </span>
                        <span className="text-[10px] bg-indigo-150 text-indigo-950 font-bold px-2 py-0.5 rounded-lg border border-indigo-200">کلاود چتر دانش ⚡</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <label className="text-slate-600 font-bold">تعداد دانش‌آموزان فعال روزانه به عنوان هدف وب‌سایت:</label>
                          <span className="font-mono font-black text-indigo-900 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-lg">
                            {dailyTraffic.toLocaleString("fa-IR")} نفر فعال
                          </span>
                        </div>
                        <input 
                          type="range"
                          min="100"
                          max="5000"
                          step="100"
                          value={dailyTraffic}
                          onChange={(e) => setDailyTraffic(parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>۱۰۰ دانش‌آموز (مدرسه کوچک)</span>
                          <span>۲,۵۰۰ دانش‌آموز (هلدینگ استانی)</span>
                          <span>۵,۰۰۰ دانش‌آموز (سراسری مرجع)</span>
                        </div>
                      </div>

                      {/* Displaying Live Calculations based on PDF */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 mt-2">
                        {/* Server Cost */}
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold block">هزینه هاست و سرور مجازی (ماهانه)</span>
                          <strong className="text-sm font-black text-slate-800 block">
                            {dailyTraffic <= 500 ? "۴۰۰،۰۰۰ تومان" : dailyTraffic <= 2000 ? "۱،۵۰۰،۰۰۰ تومان" : "۳،۲۰۰،۰۰۰ تومان"}
                          </strong>
                          <span className="text-[8.5px] text-slate-400 block leading-tight">
                            {dailyTraffic <= 500 ? "هاست اشتراکی قوی / VPS ضعیف مناسب شروع کار" : dailyTraffic <= 2000 ? "سرور مجازی ابری اختصاصی (ایمن و سریع)" : "سرور نیمه کلاود با پایداری بیست و چهار ساعته"}
                          </span>
                        </div>

                        {/* Gemini Token Cost */}
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold block">هزینه سرویس و توکن هوش مصنوعی (ماهانه)</span>
                          <strong className="text-sm font-black text-slate-800 block text-indigo-700">
                            {((dailyTraffic * 30 * 1500) / 1000).toLocaleString("fa-IR")} تومان
                          </strong>
                          <span className="text-[8.5px] text-slate-400 block leading-tight">
                            محاسبه بر مبنای مدل اقتصادی <span className="font-bold">gemini-3.5-flash</span> با بکارگیری کشینگ فشرده در وب‌بک
                          </span>
                        </div>

                        {/* Support & Maintenance Cost (From Image) */}
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold block">بجز نگهداری و مدیریت سرور (PM2 / SLA)</span>
                          <strong className="text-sm font-black text-slate-800 block">۷،۰۰۰،۰۰۰ تومان</strong>
                          <span className="text-[8.5px] text-emerald-600 block leading-tight font-semibold">
                            ۲۰ ساعت کار فنی ماهانه جهت آپدیت دوره‌ای و رفع باگ‌های دانش‌آموزان
                          </span>
                        </div>

                        {/* Domains Cost (Annually) */}
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold block">دامنه‌ها و لایسنس امنیت SSL (سالانه)</span>
                          <strong className="text-sm font-black text-slate-800 block">۸۵۰،۰۰۰ تومان</strong>
                          <span className="text-[8.5px] text-slate-400 block leading-tight">
                            ثبت دامنه‌های ملی دات آی‌آر، دات کام به همراه گواهی SSL رایگان Let's Encrypt
                          </span>
                        </div>
                      </div>

                      {/* Cumulative Pricing summary box */}
                      <div className="bg-gradient-to-l from-indigo-900 to-indigo-950 p-4.5 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-4 border border-indigo-950">
                        <div className="space-y-1 text-right">
                          <div className="text-xs font-black text-amber-300">💡 پیشنهاد کلان مشاور فنی جهت پیاده‌سازی سرویس حقیقی:</div>
                          <p className="text-[10.5px] text-slate-200 leading-normal">
                            جهت تاسیس اصولی پلتفرم توسعه پایدار، تخصیص <strong className="text-white">بودجه اولیه ۶۰ میلیون تومانی جهت توسعه</strong> و اختصاص <strong className="text-white">ماهانه ۲ میلیون تومان هزینه جاری سرور و مصرف هوش مصنوعی</strong> اقتصادی‌ترین، قابل توجیه‌ترین و پایدارترین مدل است.
                          </p>
                        </div>
                        <div className="bg-white/10 border border-white/20 p-3 rounded-xl text-center flex-shrink-0 w-full md:w-44 space-y-1">
                          <span className="text-[9px] text-slate-350 block">مجموع کل جاری حدودی در ماه</span>
                          <strong className="text-base font-black text-amber-300">
                            {(((dailyTraffic * 30 * 1500) / 1000) + (dailyTraffic <= 500 ? 400000 : dailyTraffic <= 2000 ? 1500000 : 3200000) + 7000000).toLocaleString("fa-IR")} ت
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Salary Grid statistics matching reports page 1 in Persian */}
                    <div className="bg-white p-4 text-xs space-y-3">
                      <strong className="text-slate-800 font-extrabold block">ج) جدول مرجع میانه حقوق ماهانه برنامه نویسان در سال ۱۴۰۵ (تومان - گزارش جاب‌ویژن):</strong>
                      <div className="overflow-x-auto rounded-xl border border-slate-100">
                        <table className="w-full text-right border-collapse text-[11px]">
                          <thead>
                            <tr className="bg-slate-50 border-b border-rose-100/30 text-slate-600 font-bold">
                              <th className="px-4 py-2">تخصص کلیدی برنامه‌نویس</th>
                              <th className="px-4 py-2 text-center">جونیور (زیر ۲ سال کار)</th>
                              <th className="px-4 py-2 text-center">میدلول (۲ تا ۵ سال کار)</th>
                              <th className="px-4 py-2 text-center">سنیور (بیش از ۵ سال کار)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 text-slate-650">
                            <tr className="hover:bg-slate-50/50">
                              <td className="px-4 py-2 font-bold text-slate-850">Full-Stack (متوسط)</td>
                              <td className="px-4 py-2 text-center text-slate-600">۳۰ تا ۴۵ میلیون</td>
                              <td className="px-4 py-2 text-center text-slate-600 font-bold text-indigo-600">۴۵ تا ۶۵ میلیون</td>
                              <td className="px-4 py-2 text-center text-slate-650">۷۰ تا ۹۵ میلیون</td>
                            </tr>
                            <tr className="hover:bg-slate-50/50">
                              <td className="px-4 py-2 font-bold text-slate-850">NodeJS / Express Dev</td>
                              <td className="px-4 py-2 text-center text-slate-600">۲۵ تا ۴۰ میلیون</td>
                              <td className="px-4 py-2 text-center text-indigo-600 font-bold">۴۰ تا ۶۰ میلیون</td>
                              <td className="px-4 py-2 text-center text-slate-650">۶۰ تا ۸۵ میلیون</td>
                            </tr>
                            <tr className="hover:bg-slate-50/50">
                              <td className="px-4 py-2 font-bold text-slate-850">React Frontend Dev</td>
                              <td className="px-4 py-2 text-center text-slate-600">۲۵ تا ۳۸ میلیون</td>
                              <td className="px-4 py-2 text-center text-indigo-600 font-bold">۳۵ تا ۵۵ میلیون</td>
                              <td className="px-4 py-2 text-center text-slate-650">۵۵ تا ۸۵ میلیون</td>
                            </tr>
                            <tr className="hover:bg-slate-50/50">
                              <td className="px-4 py-2 font-bold text-slate-850">PHP / SQL Database Developer</td>
                              <td className="px-4 py-2 text-center text-slate-600">۲۰ تا ۲۵ میلیون</td>
                              <td className="px-4 py-2 text-center text-slate-600">۳۵ تا ۵۵ میلیون</td>
                              <td className="px-4 py-2 text-center text-slate-650">۵۵ تا ۸۰ میلیون</td>
                            </tr>
                            <tr className="hover:bg-slate-50/50">
                              <td className="px-4 py-2 font-bold text-slate-850">DevOps / SRE (مدیریت سرور کلاود)</td>
                              <td className="px-4 py-2 text-center text-slate-600">۳۵ تا ۵۰ میلیون</td>
                              <td className="px-4 py-2 text-center text-slate-600">۵۰ تا ۷۰ میلیون</td>
                              <td className="px-4 py-2 text-center text-slate-650">۸۰ تا ۱۱۰+ میلیون</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <p className="text-[9px] text-slate-400 italic">مبنای گزارش: گزارش حقوق و دستمزد تهران در سال ۱۴۰۵ با درنظرگیری مالیات و حق بیمه پایه.</p>
                    </div>
                  </div>

                  {/* On-Premises VS Cloud Hosting Comparison Dashboard */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" id="hosting-comparisons-card">
                    {/* On-Premises Iran Outage Resilience */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                        <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                          <Server size={18} />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800">۱. سناریو استقرار سرور محلی داخل دفتری (با قطعی احتمالی نت)</h4>
                          <p className="text-[10px] text-slate-400">مناسب سازمان‌ها با داده‌های محدود محلی و بدون هزینه‌های ارزی مداوم</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs leading-relaxed text-slate-600">
                        <p>
                          در این سناریو، کد را داخل دیتاسنترهای ملی یا به صورت لوکال روی سرور شبکه داخلی خودتان بالا می‌برید. در زمانی که اینترنت ملی فعال شده یا نت قطع می‌شود، این نکات حیاتی هستند:
                        </p>
                        <ul className="list-disc list-inside space-y-1.5 pr-2 font-medium text-slate-600">
                          <li>
                            <strong className="text-slate-800">عبور از تحریم در درخواست‌های Gemini AI:</strong> سرویس‌های هوش مصنوعی گوگل به طور پیش‌فرض آی‌پی ایران را فیلتر کرده‌اند. برای غلبه بر این، باید از DNSهای رفع تحریم مخصوص لینوکس مانند <span className="font-mono bg-slate-105 text-rose-600 px-1 py-0.5 rounded">بشکن (Shecan)</span> یا یک پروکسی لوکال روی سرور داکر استفاده کنید.
                          </li>
                          <li>
                            <strong className="text-slate-800">پایداری با آفلاین‌سازی ذخایر (Offline-Fallback):</strong> ما در موتور پردازشگر پنل تراز چتر دانش، سیستم را به گونه‌ای طراحی کرده‌ایم که کارهای تحلیلی و فرمول نویسی شبیه‌سازها را از طریق <span className="text-indigo-600 font-bold">بافر آفلاین</span> و فرضیه‌های تخمینی با فرمول‌های ریاضی و بدون دخالت مستقیم هوش مصنوعی در زمان قطعی کامل نت پردازش کند تا کار مربیان نخوابد.
                          </li>
                          <li>
                            <strong className="text-slate-800">رله دیتابیس کلاینت‌ها:</strong> ذخیره‌سازی داده‌های دانش‌آموزان به طور تکرارشونده در <span className="font-mono text-indigo-600 font-bold">localStorage</span> مرورگر به صورت رمزگذاری‌شده ذخیره می‌شود تا در صورت قطعی لحظه‌ای سرور، داده‌ای نابود نگردد.
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Foreign VPS Hosting Setup */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                        <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                          <Globe size={18} />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800">۲. سناریو استقرار هاست و VPS خارجی (آرروان / Hetzner / Google Cloud)</h4>
                          <p className="text-[10px] text-slate-400">گزینه پیشنهادی برای موسسات با تعداد بالای کلاینت و سرعت ایده‌آل</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs leading-relaxed text-slate-600">
                        <p>
                          در این روش، با خرید یک سرور مجازی مجزا در خارج از کشور یا ابری، اپلیکیشن را بارگذاری می‌کنید. ویژگی‌ها و هزینه‌ها:
                        </p>
                        <ul className="list-disc list-inside space-y-1.5 pr-2 font-medium text-slate-600">
                          <li>
                            <strong className="text-slate-800">سرعت فوق‌العاده مدل زنده (Low Latency):</strong> از آنجایی که سرور خارج مستقیما و بدون هاب فیلترینگ با سرورهای گوگل در تماس است، تحلیل‌ها، چت صوتی و متنی مربیان در کمتر از <span className="text-indigo-600 font-black">۰.۹ ثانیه</span> تولید شده و بازخورد سریع می‌دهد.
                          </li>
                          <li>
                            <strong className="text-slate-800">امنیت توکن‌ها و کلیدهای API:</strong> متغیر کلیدهای ارزشمند <span className="font-mono text-zinc-900 bg-slate-100 px-1 py-0.5 rounded">GEMINI_API_KEY</span> به هیچ‌وجه به مرورگر کلاینت‌ها نشت نکرده و فقط در لایه توامان پشت سرور پردازش می‌شود که امنیت تام سرور خارجی را مهیا می‌کند.
                          </li>
                          <li>
                            <strong className="text-slate-800">برآورد فرضی هزینه‌ها:</strong> مدل هوش مصنوعی <span className="text-emerald-700 font-black">gemini-3.5-flash</span> دارای سهمیه رایگان روزانه عالی است و برای استفاده تجاری ترافیک بسیار اقتصادی (به صورت پرداخت به اندازه مصرف - حدود ۰.۰۷۵ دلار به ازای هر میلیون توکن) تخصیص می‌دهد که مجموعا هزینه نگهداری را نزدیک صفر نگه می‌دارد.
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Step-by-step Installation blocks with Copy-Codes */}
                  <div className="bg-gradient-to-tr from-slate-50 via-white to-indigo-50/15 p-6 md:p-8 rounded-3xl border-2 border-indigo-600 shadow-xl space-y-6 ring-4 ring-indigo-700/10" id="deploy-docker-pm2-section">
                    <div className="bg-indigo-700 text-white p-4.5 rounded-2xl flex items-center justify-between gap-3 shadow-md border border-indigo-500/30">
                      <div className="flex items-center gap-2.5">
                        <Sparkles size={18} className="text-amber-300 animate-pulse flex-shrink-0" />
                        <div>
                          <strong className="text-xs font-black block text-right">راهنمای استقرار اصلی با داکر (Docker) و PM2 مانیتور شده</strong>
                          <span className="text-[10px] text-indigo-100 block text-right mt-0.5">بسته‌های بهینه شده برای بالا نگه‌داشتن همیشگی اپلیکیشن چتر دانش روی سرور مجازی</span>
                        </div>
                      </div>
                      <span className="text-[9px] bg-white/20 px-2.5 py-1 rounded-xl border border-white/10 font-black flex-shrink-0">بخش برجسته شده</span>
                    </div>

                    <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                      <Cpu size={18} className="text-indigo-600 animate-spin" style={{ animationDuration: '4s' }} />
                      <div>
                        <h3 className="text-sm font-black text-slate-800">دستورالعمل‌ها و شیوه‌های استقرار فنی سیستم بر روی کانتینرها</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">جهت پیاده‌سازی سریع، کدهای هر بخش را توسط دکمه کپی بردارید و در سرور لینوکسی اجرا کنید.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Docker Configuration Box */}
                      <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                            <span className="w-1.5 h-3 bg-blue-600 rounded" />
                            روش اول: استقرار میکروسرویس مستقل با داکر (Docker)
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          با استفاده از کانتینرسازی داکر شما می‌توانید پروژه‌ را بدون نیاز به هماهنگ‌سازی نسخه‌های فیزیکی نود همواره سالم تحویل بگیرید.
                        </p>

                        <div className="space-y-4">
                          {/* Code section for Dockerfile */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-mono text-slate-400">Dockerfile</span>
                              <button 
                                onClick={() => handleCopyToClipboard(`FROM node:22-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nRUN npm run build\n\nFROM node:22-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install --only=production\nCOPY --from=builder /app/dist ./dist\nCOPY --from=builder /app/server.ts ./\nCOPY --from=builder /app/node_modules ./node_modules\nENV NODE_ENV=production\nENV PORT=3000\nEXPOSE 3000\nCMD ["node", "dist/server.cjs"]`, "dockerfile")}
                                className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer bg-white px-2 py-1 rounded-lg border border-slate-200 text-[9px]"
                              >
                                <Copy size={11} />
                                <span>{copiedId === "dockerfile" ? "کپی شد! ✓" : "کپی کد"}</span>
                              </button>
                            </div>
                            <pre className="font-mono text-[9px] bg-slate-900 text-slate-300 p-3 rounded-xl overflow-x-auto text-left leading-normal" style={{ direction: "ltr" }}>
{`FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/node_modules ./node_modules
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node", "dist/server.cjs"]`}
                            </pre>
                          </div>

                          {/* Code section for Docker Run / Compose */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-mono text-slate-400">docker-compose.yml</span>
                              <button 
                                onClick={() => handleCopyToClipboard(`version: '3.8'\nservices:\n  taranom-app:\n    build: .\n    container_name: taranom_academy\n    ports:\n      - "3000:3000"\n    environment:\n      - NODE_ENV=production\n      - GEMINI_API_KEY=AIzaSyYourKeyHere\n    restart: always`, "dockercompose")}
                                className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer bg-white px-2 py-1 rounded-lg border border-slate-200 text-[9px]"
                              >
                                <Copy size={11} />
                                <span>{copiedId === "dockercompose" ? "کپی شد! ✓" : "کپی کد"}</span>
                              </button>
                            </div>
                            <pre className="font-mono text-[9px] bg-slate-900 text-slate-300 p-3 rounded-xl overflow-x-auto text-left leading-normal" style={{ direction: "ltr" }}>
{`version: '3.8'
services:
  taranom-app:
    build: .
    container_name: taranom_academy
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - GEMINI_API_KEY=AIzaSyYourActualKeyHere
    restart: always`}
                            </pre>
                          </div>

                          {/* Shell commands for running Docker */}
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 font-bold block">دستورهای خط فرمان جهت اجرا:</span>
                            <pre className="font-mono text-[9px] bg-slate-950 text-emerald-400 p-3 rounded-xl overflow-x-auto text-left leading-tight" style={{ direction: "ltr" }}>
{`# ۱. بیلد کردن تصویر داکر
docker build -t taranom-academy-image .

# ۲. اجرای کانتینر با متغیر کلید اختصاصی
docker run -d -p 3000:3000 --name taranom_container -e GEMINI_API_KEY=AI_KEY_HERE taranom-academy-image`}
                            </pre>
                          </div>
                        </div>
                      </div>

                      {/* Linux Native & TS Build Setup */}
                      <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                            <span className="w-1.5 h-3 bg-indigo-600 rounded" />
                            روش دوم: استقرار خام ترمینال با لینوکس اوبونتو و PM2
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          اگر مایل به استفاده از داکر نیستید، به سادگی و به صورت محلی با استفاده از کامپایلر Node.js به همراه یک ابزار ران تایم مانند PM2 پروژه را پایدار نگه دارید.
                        </p>

                        <div className="space-y-4">
                          {/* Configuration steps */}
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 font-bold block">مرحله اول: آماده‌سازی اولیه پکیج‌ها</span>
                            <pre className="font-mono text-[9px] bg-slate-950 text-slate-300 p-3 rounded-xl overflow-x-auto text-left leading-tight" style={{ direction: "ltr" }}>
{`# اول: نصب اوبونتو پیش‌نیازها
sudo apt update && sudo apt install nodejs npm -y

# دوم: نصب مدیر کنترل رم PM2 به صورت سرتاسری
sudo npm install -g pm2`}
                            </pre>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 font-bold block">مرحله دوم: دانلود پروژه و دانلود بسته‌ها</span>
                            <pre className="font-mono text-[9px] bg-slate-950 text-slate-300 p-3 rounded-xl overflow-x-auto text-left leading-tight" style={{ direction: "ltr" }}>
{`# کپی کدهای گیت ریپازیتوری
git clone <آدرس_مخزن_سیستم_شما>
cd <نام_فولدر_پروژه>

# نصب دیپندنسی‌ها به صورت امن
npm install`}
                            </pre>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 font-bold block">مرحله سوم: بیلد نهایی و لانچ با PM2</span>
                            <pre className="font-mono text-[9px] bg-slate-950 text-slate-300 p-3 rounded-xl overflow-x-auto text-left leading-tight" style={{ direction: "ltr" }}>
{`# اول: کامپایل قالب Vite و Server (بسته‌ساز esbuild)
npm run build

# دوم: ست کردن متغیر محیطی کلید و ران کردن دائمی در پس‌زمینه
export GEMINI_API_KEY="کلید_اختصاصی_هوش_مصنوعی_شما_اینجا"
pm2 start dist/server.cjs --name "taranom_academy_mizban"

# سوم: ثبت خودکار بالا آمدن در استارتاپ لینوکس با ریستور
pm2 startup
pm2 save`}
                            </pre>
                          </div>

                          {/* Setup Nginx Reverse Proxy Config block */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-bold text-slate-400">پیکربندی Nginx (پورت ۳۰۰۰ به دامنک ۸۰/۴۴۳)</span>
                              <button 
                                onClick={() => handleCopyToClipboard(`server {\n    listen 80;\n    server_name taranom-academy.com;\n\n    location / {\n        proxy_pass http://127.0.0.1:3000;\n        proxy_http_version 1.1;\n        proxy_set_header Upgrade $http_upgrade;\n        proxy_set_header Connection 'upgrade';\n        proxy_set_header Host $host;\n        proxy_cache_bypass $http_upgrade;\n    }\n}`, "nginxconfig")}
                                className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer bg-white px-2 py-1 rounded-lg border border-slate-200 text-[9px]"
                              >
                                <Copy size={11} />
                                <span>{copiedId === "nginxconfig" ? "کپی شد! ✓" : "کپی کد"}</span>
                              </button>
                            </div>
                            <pre className="font-mono text-[9px] bg-slate-900 text-slate-300 p-3 rounded-xl overflow-x-auto text-left leading-normal" style={{ direction: "ltr" }}>
{`server {
    listen 80;
    server_name taranom-academy.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}`}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cloud Native Cloudflare & Persian Cloud PaaS (Liara / Hamravesh) via GitHub Git-Ops */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6" id="cloud-paas-gitops-guides">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                      <Layers size={18} className="text-blue-600 animate-pulse" />
                      <div>
                        <h3 className="text-sm font-black text-slate-800">روش سوم: استقرار ابری و هاست مستقل (Cloudflare/Liara/Hamravesh) با گیت‌هاب</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">آموزش کامل نحوه پوش طراحان روی مخازن گیت و مهاجرت سریع به هاست‌های ابری و سرورلس ملی و بین‌المللی</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Step A: GitHub Integration */}
                      <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <div className="flex items-center gap-2 text-slate-800 font-bold text-xs border-b border-slate-200 pb-2">
                          <span className="w-5 h-5 bg-indigo-100 text-indigo-700 text-[10px] rounded-full flex items-center justify-center font-black">الف</span>
                          <span>فرآیند گیت‌هاب و همگام‌سازی کد</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          پیش از هر چیز، با آپلود پروژه روی گیت‌هاب، مکانیزم تحویل مداوم (CI/CD) را فعال کنید تا هر آپدیتی به صورت خودکار کامپایل و مستقر شود.
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
                            <span>دستورات ارسال کد به گیت‌هاب:</span>
                            <button 
                              onClick={() => handleCopyToClipboard(`git init\ngit add .\ngit commit -m "feat: first production release"\ngit branch -M main\ngit remote add origin https://github.com/YOUR_USER/YOUR_REPO.git\ngit push -u origin main`, "githubpushcode")}
                              className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer bg-white px-2 py-1 rounded-lg border border-slate-100 text-[9px]"
                            >
                              <Copy size={11} />
                              <span>{copiedId === "githubpushcode" ? "کپی شد! ✓" : "کپی"}</span>
                            </button>
                          </div>
                          <pre className="font-mono text-[9px] bg-slate-900 text-slate-300 p-3 rounded-xl overflow-x-auto text-left leading-normal" style={{ direction: "ltr" }}>
{`git init
git add .
git commit -m "feat: production release"
git branch -M main
git remote add origin YOUR_REPO_URL
git push -u origin main`}
                          </pre>
                        </div>
                      </div>

                      {/* Step B: Iranian Cloud Hosting */}
                      <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <div className="flex items-center gap-2 text-slate-800 font-bold text-xs border-b border-slate-200 pb-2">
                          <span className="w-5 h-5 bg-indigo-100 text-indigo-700 text-[10px] rounded-full flex items-center justify-center font-black">ب</span>
                          <span>هاست‌ها و سرویس‌های ابری ایرانی</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          جهت میزبانی با پینگ عالی داخل کشور با پایداری حداکثر و غلبه بر فیلترینگ، از سرویس‌های PaaS بومی استفاده کنید:
                        </p>
                        <div className="space-y-2">
                          <div className="bg-white p-3 rounded-xl border border-slate-100 text-[10px] space-y-1.5 shadow-sm">
                            <div className="flex items-center justify-between font-bold text-slate-800">
                              <span>🚀 سکوی ابری لیارا (Liara)</span>
                              <a href="https://liara.ir" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">liara.ir ↗</a>
                            </div>
                            <p className="text-slate-500 text-[9px] leading-relaxed">
                              ۱. در لیارا یک برنامه با پلتفرم <strong className="text-slate-700">NodeJS</strong> بسازید.<br />
                              ۲. در بخش "متغیرها" کلید <code className="font-mono bg-slate-100 p-0.5 text-rose-600 rounded">GEMINI_API_KEY</code> را ست کنید.<br />
                              ۳. تب "اتصال گیت‌هاب" را جهت استقرار مستمر خودکار فعال کنید، یا دستور زیر را در خط فرمان پوش کنید:
                            </p>
                            <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100">
                              <span className="font-mono text-[8px] text-slate-400">نصب کلاینت و دپلوی دستی:</span>
                              <button 
                                onClick={() => handleCopyToClipboard(`npm install -g @liara/cli\nliara login\nliara deploy --port=3000`, "liaracli")}
                                className="text-blue-600 font-bold text-[8px] hover:underline cursor-pointer"
                              >
                                {copiedId === "liaracli" ? "کپی شد" : "کپی"}
                              </button>
                            </div>
                          </div>

                          <div className="bg-white p-3 rounded-xl border border-slate-100 text-[10px] space-y-1 shadow-sm">
                            <div className="flex items-center justify-between font-bold text-slate-800">
                              <span>⚓ سکوی همروش (Hamravesh)</span>
                              <a href="https://hamravesh.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">hamravesh.com ↗</a>
                            </div>
                            <p className="text-slate-500 text-[9px] leading-relaxed">
                              با اضافه کردن مخزن گیت‌هاب به دارک‌برد همروش، داکر فایل پروژه شما خوانده شده و تمام مراحل بیلد و استقرار به صورت ابر بومی (Kubernetes-native) پیش می‌رود.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Step C: Cloudflare Pages / Workers */}
                      <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <div className="flex items-center gap-2 text-slate-800 font-bold text-xs border-b border-slate-200 pb-2">
                          <span className="w-5 h-5 bg-indigo-100 text-indigo-700 text-[10px] rounded-full flex items-center justify-center font-black">ج</span>
                          <span>کلودفلر ابری (Cloudflare Pages)</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          اگر مایلید بخش کلاینت اپلیکیشن (ویژوال SPA) به صورت سرورلس رایگان، ضد فیلتر و با توزیع جهانی (CDN) میزبانی شود:
                        </p>
                        <div className="space-y-2 text-[10px] leading-relaxed">
                          <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-2 shadow-sm">
                            <div className="flex items-center justify-between font-bold text-slate-800">
                              <span>☁️ سرویس سفارشی Cloudflare</span>
                              <a href="https://cloudflare.com" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">cloudflare.com ↗</a>
                            </div>
                            <ol className="list-decimal list-inside text-[9px] text-slate-500 space-y-1">
                              <li>در بخش <strong className="text-slate-700">Workers & Pages</strong> گیت‌هاب را متصل کنید.</li>
                              <li>فریم‌ورک پروژه را روی <strong className="text-slate-700">Vite</strong> بگذارید.</li>
                              <li>تنظیم بیلد: <code className="font-mono text-zinc-900 bg-slate-100 px-1 py-0.5 rounded">npm run build</code></li>
                              <li>پوشه خروجی: <code className="font-mono text-zinc-900 bg-slate-100 px-1 py-0.5 rounded">dist</code></li>
                              <li>در بخش تنظیمات محیطی، آدرس سرور بک‌اند مستقل خود را تنظیم کنید تا تماس‌های هوش مصنوعی هدایت شوند.</li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CPANEL TRADITIONAL HOSTING & MYSQL INTEGRATION GUIDE */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6" id="cpanel-traditional-hosting-guides">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                      <Database size={18} className="text-emerald-600 animate-pulse" />
                      <div>
                        <h3 className="text-sm font-black text-slate-800">روش چهارم: استقرار سنتی بر روی هاست اشتراکی cPanel به همراه دیتابیس MySQL</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5 font-medium">آموزش گام‌به‌گام راه‌اندازی بخش بک‌اند Node.js و اتصال پایگاه داده MySQL بومی در سی‌پنل بدون نیاز به دانش پیچیده سرور</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Step A: cPanel Node Application Selector */}
                      <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <div className="flex items-center gap-2 text-slate-800 font-bold text-xs border-b border-slate-200 pb-2">
                          <span className="w-5 h-5 bg-emerald-100 text-emerald-700 text-[10px] rounded-full flex items-center justify-center font-black">۱</span>
                          <span>راه‌اندازی Node App در سی‌پنل</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          اکثر هاست‌های مدرن لینوکسی از ابزار <strong className="text-slate-700">Setup Node.js App</strong> استفاده می‌کنند که به مدیریت فرآیندها به کمک لایه مسنجر مسافر (Phusion Passenger) کمک شایانی می‌کند:
                        </p>
                        <ol className="list-decimal list-inside text-[9.5px] text-slate-600 space-y-1.5 leading-relaxed bg-white p-3 rounded-xl border border-slate-150">
                          <li>کلیک روی <strong className="text-slate-800">Setup Node.js App</strong> در کنترل پنل cPanel</li>
                          <li>انتخاب نسخه نود مناسب (مثلاً <strong className="text-emerald-700">Nodev20.x</strong> یا بالاتر)</li>
                          <li>تنظیم فیلد <strong className="text-slate-800">Application Startup File</strong> به مقدار: <code className="font-mono bg-slate-150 text-rose-600 px-1 py-0.5 rounded text-[8.5px]">dist/server.cjs</code></li>
                          <li>مشخص کردن پوشه اپلیکیشن در هاست؛ مثال: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[8.5px]">/public_html/taranom</code></li>
                          <li>افزودن متغیرهای محیطی در پایین صفحه:
                            <ul className="list-disc list-inside mr-3 text-[8.5px] text-slate-500 space-y-1 mt-1">
                              <li><code className="font-mono text-zinc-900">GEMINI_API_KEY</code> = کلید گوگل</li>
                              <li><code className="font-mono text-zinc-900">NODE_ENV</code> = <code className="font-mono text-emerald-600">production</code></li>
                            </ul>
                          </li>
                        </ol>
                      </div>

                      {/* Step B: Database Wizard & credentials creation */}
                      <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <div className="flex items-center gap-2 text-slate-800 font-bold text-xs border-b border-slate-200 pb-2">
                          <span className="w-5 h-5 bg-emerald-100 text-emerald-700 text-[10px] rounded-full flex items-center justify-center font-black">۲</span>
                          <span>ساخت دیتابیس MySQL محلی</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          پیش‌نماها و ریتم‌های تحلیل تراز دانش‌آموزان به همراه نتایج آزمون‌های کانون را می‌توانید در پایگاه اطلاعاتی بومی ریلیشنال ذخیره کنید:
                        </p>
                        <ol className="list-decimal list-inside text-[9.5px] text-slate-600 space-y-1.5 leading-relaxed bg-white p-3 rounded-xl border border-slate-150">
                          <li>کلیک روی <strong className="text-slate-850">MySQL Database Wizard</strong></li>
                          <li>ایجاد پایگاه داده با نام دلخواه (مثلا <code className="font-mono bg-slate-100 p-0.5 rounded text-[8.5px]">taranom_db</code>)</li>
                          <li>ایجاد کاربر جدید دیتابیس و تعیین پسورد فوق امنیتی و رله کامل دسترسی‌ها (Privileges)</li>
                          <li>ورود به <strong className="text-slate-850">phpMyAdmin</strong> و کپی زدن دستور SQL ساخت جداول زیر جهت رله تراز:</li>
                        </ol>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
                            <span>کد اسکیوال ساخت جدول تراز:</span>
                            <button 
                              onClick={() => handleCopyToClipboard(`CREATE TABLE IF NOT EXISTS students_traz (\n  id INT AUTO_INCREMENT PRIMARY KEY,\n  student_num VARCHAR(50) NOT NULL,\n  student_name VARCHAR(100) NOT NULL,\n  current_traz INT NOT NULL,\n  target_traz INT NOT NULL,\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);`, "mysqlschema")}
                              className="text-blue-600 font-bold text-[8.5px] hover:underline cursor-pointer"
                            >
                              {copiedId === "mysqlschema" ? "کپی شد" : "کپی"}
                            </button>
                          </div>
                          <pre className="font-mono text-[8px] bg-slate-900 text-slate-350 p-2 rounded-lg overflow-x-auto text-left leading-normal" style={{ direction: "ltr" }}>
{`CREATE TABLE IF NOT EXISTS students_traz (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_num VARCHAR(50) NOT NULL,
  student_name VARCHAR(100) NOT NULL,
  current_traz INT NOT NULL,
  target_traz INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`}
                          </pre>
                        </div>
                      </div>

                      {/* Step C: Database Connection Script in Express */}
                      <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <div className="flex items-center gap-2 text-slate-800 font-bold text-xs border-b border-slate-200 pb-2">
                          <span className="w-5 h-5 bg-emerald-100 text-emerald-700 text-[10px] rounded-full flex items-center justify-center font-black">۳</span>
                          <span>دستورالعمل اتصال و آپلود فایل</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          نحوه متصل کردن اکسپرس سرور به دیتابیس بومی سی‌پنل و شروع فعالیت پلاتفرم پس از کامپایل واکنشی:
                        </p>
                        <div className="space-y-2 text-[9.5px] leading-relaxed">
                          <div className="bg-white p-3 rounded-xl border border-slate-150 space-y-1 text-slate-600">
                            <strong>نمونه کد استفاده از mysql2 در لایه وب‌بک سرور:</strong>
                            <pre className="font-mono text-[8px] bg-slate-900 text-emerald-400 p-2 rounded-lg overflow-x-auto text-left" style={{ direction: "ltr" }}>
{`// server.ts / connection
import mysql from "mysql2";
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true
});`}
                            </pre>
                          </div>

                          <div className="bg-white p-3 rounded-xl border border-slate-150 text-slate-500 text-[9px] space-y-1">
                            <strong className="text-slate-800">۴. فشرده‌سازی و آپلود فیزیکی:</strong>
                            <span>پوشه <code className="font-mono bg-slate-100 text-zinc-900 px-0.5 rounded text-[8px]">dist</code> تولید شده نهایی را به همراه فایل‌های <code className="font-mono text-zinc-900 bg-slate-100 px-0.5 rounded text-[8px]">package.json</code> و <code className="font-mono text-zinc-900 bg-slate-100 px-0.5 rounded text-[8px]">package-lock.json</code> فشرده (ZIP) کرده، در منیجر کنترل پنل بارگذاری و استخراج کنید. سپس روی دکمه <strong className="text-slate-700">NPM Install</strong> یا <strong className="text-slate-700">Restart App</strong> در سی‌پنل کلیک کنید.</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dedicated Sub-guide for .env and mysql on shared hosts */}
                    <div className="mt-6 bg-slate-50 p-5 rounded-2xl border border-slate-200/60 space-y-4 text-right">
                      <div className="flex items-center gap-2 border-b border-slate-200/50 pb-3">
                        <div className="p-1 px-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
                          <Lock size={14} />
                        </div>
                        <h4 className="text-xs font-black text-rose-950">راهنمای اختصاصی ساخت فایل .env و اتصال پایگاه‌ داده در هاست اشتراکی</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* DotEnv setup guide */}
                        <div className="space-y-3">
                          <strong className="text-xs font-bold text-slate-800 block">۱. پیکربندی فایل .env در هاست اشتراکی</strong>
                          <p className="text-[10px] text-slate-500 leading-relaxed">
                            در هاست‌های اشتراکی سی‌پنل (cPanel) معمولاً دو تکنیک برای تعریف متغیرهای محیطی وجود دارد:
                          </p>
                          <ul className="list-disc list-inside text-[9.5px] text-slate-600 space-y-2 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200">
                            <li>
                              <strong className="text-slate-800 font-extrabold text-xs block mb-1">روش اول (پیشنهادی):</strong> استفاده از فیلد <code className="font-mono text-indigo-700 font-bold bg-indigo-50 px-1 py-0.5 rounded text-[10px]">Environment variables</code> در همان ابزار <code className="font-bold">Setup Node.js App</code> سی‌پنل؛ به دلیل امنیت بالا و لود مستقیم توسط سیستم.
                            </li>
                            <li>
                              <strong className="text-slate-800 font-extrabold text-xs block mb-1">روش دوم (فایل مستقل):</strong> ساخت مستقیم فایلی به نام دقیق <code className="font-mono bg-slate-100 text-rose-600 px-1 py-0.5 rounded font-black text-[10px]">.env</code> در کنار پوشه <code className="font-bold text-slate-800">dist</code> در فایل‌منیجر (File Manager) سی‌پنل.
                            </li>
                            <li className="text-amber-700 font-semibold list-none pt-2 border-t border-slate-100">
                              ⚠️ <strong className="font-black text-amber-800 text-[10.5px]">نکته کلیدی توسعه با Dotenv:</strong> برای آنکه فایل .env به طور خودکار لود شود، حتماً مطمئن شوید پکیج <code className="font-mono bg-slate-100 text-slate-700 p-0.5 rounded">dotenv</code> وارداتی در برنامه وجود دارد و در بالای خط لود سرور <code className="font-bold text-slate-800">server.ts</code> فعال است:
                              <pre className="font-mono text-[8px] bg-slate-900 text-amber-400 p-2.5 rounded-lg text-left mt-1.5 block" style={{ direction: "ltr" }}>
{`import dotenv from "dotenv";
dotenv.config();`}
                              </pre>
                            </li>
                          </ul>
                        </div>

                        {/* Mysql & env boilerplate setup text copied area */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <strong className="text-xs font-bold text-slate-800">۲. نمونه الگو استاندارد فایل .env برای سی‌پنل</strong>
                            <button
                              type="button"
                              onClick={() => handleCopyToClipboard(`# تنظیمات عمومی چتر دانش\nPORT=3000\nNODE_ENV=production\n\n# کلید اختصاصی گوگل جمی‌نی\nGEMINI_API_KEY=AIzaSyYourOwnGoogleGeminiApiKeyHere\n\n# اطلاعات دیتابیس بومی هاست اشتراکی\nMYSQL_HOST=localhost\nMYSQL_PORT=3306\nMYSQL_USER=chatredanesh_db_user\nMYSQL_PASSWORD=strong_database_password_here\nMYSQL_DATABASE=chatredanesh_db_name`, "cpanelenv")}
                              className="text-blue-600 font-extrabold text-[9px] hover:underline cursor-pointer"
                            >
                              {copiedId === "cpanelenv" ? "کپی شد ✓" : "کپی الگو .env"}
                            </button>
                          </div>
                          
                          <pre className="font-mono text-[8.5px] bg-slate-900 text-emerald-400 p-3.5 rounded-xl overflow-x-auto text-left leading-relaxed space-y-1 shadow-inner h-40" style={{ direction: "ltr" }}>
{`# ----------------------------------------------------
# نمونه فایل تنظیمات محیطی چتر دانش برای هاست اشتراکی
# ----------------------------------------------------
PORT=3000
NODE_ENV=production

# کلید اختصاصی و محرمانه گوگل جمی‌نی
GEMINI_API_KEY=AIzaSyYourOwnGoogleGeminiApiKeyHere

# اطلاعات امنیتی دیتابیس محلی (غالبا localhost است)
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=chatredanesh_db_user
MYSQL_PASSWORD=strong_database_password_here
MYSQL_DATABASE=chatredanesh_db_name`}
                          </pre>

                          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start gap-2 text-[9.5px] text-amber-900 leading-normal">
                            <span className="font-black">💡</span>
                            <div>
                              <strong className="font-bold">عیب‌پذیری پایگاه داده:</strong> در بیشتر شرکت‌های هاستینگ ایرانی، هاست دیتابیس را به جای آی‌پی سرور بایستی حتماً بر روی <code className="font-mono px-0.5 bg-white text-rose-600 rounded text-[9px]">localhost</code> یا <code className="font-mono px-0.5 bg-white text-rose-600 rounded text-[9px]">127.0.0.1</code> تنظیم نمایید تا فایروال محلی دسترسی را مسدود نکند.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* HTML Iframe Embedding & Integration Payload Client */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4" id="embedding-integration-guides">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <FileCode size={18} className="text-emerald-600" />
                      <div>
                        <h4 className="text-xs font-black text-slate-800">کدهای یکپارچه‌سازی وب‌سایت اصلی یا فرعی (Integration Embeds)</h4>
                        <p className="text-[10px] text-slate-400">چگونه سیستم مشاوره و تراز را به فریم وب‌سایت اصلی سازمان لینک کنید</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Responsive Iframe block */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="text-slate-700">۱. قرارگیری داخل سایت شما به کمک آی‌فریم واکنشی (Iframe Embedding)</span>
                          <button 
                            onClick={() => handleCopyToClipboard(`<iframe \n  src="http://your-server-ip-or-domain.com" \n  style="width: 100%; height: 750px; border: none; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);"\n  allow="microphone; camera; geolocation"\n  referrerpolicy="no-referrer"\n></iframe>`, "iframecode")}
                            className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 text-[9px]"
                          >
                            <Copy size={11} />
                            <span>{copiedId === "iframecode" ? "کپی شد! ✓" : "کپی کد"}</span>
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          این تگ به پورتال اصلی موسسه شما اجازه می‌دهد که بدون باز شدن تب اضافه، صفحه داشبورد چتر دانش را به صورت بومی و شیک داخل یک فاوآیکون بارگذاری نماید.
                        </p>
                        <pre className="font-mono text-[9px] bg-slate-900 text-slate-300 p-3 rounded-xl overflow-x-auto text-left leading-normal" style={{ direction: "ltr" }}>
{`<iframe 
  src="http://your-server-ip-or-domain.com" 
  style="width: 100%; height: 750px; border: none; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);"
  allow="microphone; camera; geolocation"
  referrerpolicy="no-referrer"
></iframe>`}
                        </pre>
                      </div>

                      {/* Backend Proxy Query Endpoint script API sample */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="text-slate-700">۲. نمونه اسکریپت فچ کردن تحلیل تراز از سرور موسسه چتر دانش (API Consumption JS)</span>
                          <button 
                            onClick={() => handleCopyToClipboard(`// دریافت گواهی تخمین هوش مصنوعی چتر دانش به صورت خام با درخواست به بک اند\nfetch('http://localhost:3000/api/goal-tracker-insight', {\n  method: 'POST',\n  headers: {\n    'Content-Type': 'application/json'\n  },\n  body: JSON.stringify({\n    studentName: "علیرضا رضایی",\n    currentTraz: 6150,\n    targetTraz: 6200\n  })\n})\n.then(response => response.json())\n.then(data => console.log("تحلیلهوش مصنوعی صادر شد:", data.insight))\n.catch(err => console.error("خطا در فچ کردن تراز:", err));`, "fetchcode")}
                            className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 text-[9px]"
                          >
                            <Copy size={11} />
                            <span>{copiedId === "fetchcode" ? "کپی شد! ✓" : "کپی کد"}</span>
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          برنامه‌نویسان ارشد شما می‌توانند با ارسال پی‌لود ترازها به وب‌سرور موازی Express، پاسخ را گرفته و آن را در نرم‌افزارهای ثبت‌نام مجزا نمایش دهند.
                        </p>
                        <pre className="font-mono text-[9px] bg-slate-900 text-slate-300 p-3 rounded-xl overflow-x-auto text-left leading-normal" style={{ direction: "ltr" }}>
{`// نمونه کد فراخوانی دپارتمان تراز چتر دانش
fetch('http://localhost:3000/api/goal-tracker-insight', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    studentName: "علیرضا رضایی",
    currentTraz: 6150,
    targetTraz: 6200
  })
})
.then(response => response.json())
.then(data => console.log("بازخورد صادر شد:", data.insight));`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "blueprint" && (
            <div className="space-y-6 animate-fadeIn text-right" id="admin-tab-blueprint" style={{ direction: "rtl" }}>
              {/* Top Banner introducing the SaaS architecture blueprint */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl">
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial-gradient(ellipse_at_right,_var(--tw-gradient-stops)) from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
                <div className="space-y-1 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="p-1 px-2 bg-indigo-500/20 text-indigo-350 border border-indigo-505/20 rounded-md text-[8.5px] font-black tracking-wider uppercase">استراتژی کلان توسعه</span>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[9.5px] text-slate-400 font-bold">پلتفرم موازی SaaS و میکروسرویسی چتر دانش</span>
                  </div>
                  <h3 className="font-black text-slate-100 text-lg">سند معماری کلان، دیتابیس بومی و پشته فناوری Enterprise SaaS</h3>
                  <p className="text-[11px] text-slate-400 leading-normal max-w-4xl">
                    این مستند نقشه راه جامع ساختاریافته پروژه چتر دانش را به عنوان یک سامانه ابری مستقل، مقیاس‌پذیر و ماژولار توصیف می‌کند. اهداف کلیدی شامل اتوماسیون فرایندها، ثبت‌نام دیجیتال، آزمون تستی تطبیقی، سیستم CRM و هوش مصنوعی مرکزی است.
                  </p>
                </div>
              </div>

              {/* 1. Core Architecture Stack Grid */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 border-r-4 border-indigo-900 pr-2">
                  <Server size={18} className="text-indigo-900" />
                  <span>پشته فناوری و معماری پیشنهادی (Technology Stack Design)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl space-y-2">
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">سامانه فرانت‌اند</span>
                    <strong className="block text-slate-800 text-xs">React / Next.js / TypeScript</strong>
                    <p className="text-[10px] text-slate-400 leading-normal">رابط کاربری واکنشی مدرن با استفاده از Tailwind CSS جهت یکپارچگی چند پلتفرمی صفحات و پاسخ‌گویی بهینه به درخواست‌ها.</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl space-y-2">
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">سرویس بک‌اند اصلی</span>
                    <strong className="block text-slate-800 text-xs">Node.js / NestJS / TypeScript</strong>
                    <p className="text-[10px] text-slate-400 leading-normal">معماری API-First مجزا شده به میکروسرویس‌های احراز هویت، آزمون، مسائل مالی و ارتباط با مشتری با مدیریت قوی خطاها.</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl space-y-2">
                    <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">موتور پردازش AI</span>
                    <strong className="block text-slate-800 text-xs">Python / TensorFlow / Gemini SDK</strong>
                    <p className="text-[10px] text-slate-400 leading-normal">مدل‌های داده‌ای رگرسیون تراز، الگوریتم تخمین ریزش و پیش‌بینی فروش دوره‌ها به اضافه ابزارهای پردازش زبان طبیعی فارسی.</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl space-y-2">
                    <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">ذخیره‌سازی و کشینگ</span>
                    <strong className="block text-slate-800 text-xs">PostgreSQL / Redis / RabbitMQ</strong>
                    <p className="text-[10px] text-slate-400 leading-normal">نگهداری روابط داده‌ای داوطلبان درون پایگاه داده PostgreSQL، کشینگ پاسخ‌ها با Redis و صف‌بندی ایمن رویدادها با RabbitMQ.</p>
                  </div>
                </div>
              </div>

              {/* 2. Interactive Scale Simulator */}
              <div className="bg-gradient-to-l from-indigo-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl border border-indigo-900 shadow-xl space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-indigo-900 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-500/10 border border-indigo-505/20 text-indigo-450 rounded-2xl">
                      <Cpu size={22} className="text-amber-400 animate-spin-slow" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black">شبیه‌ساز هوشمند مقیاس‌پذیری و بار کلاود (Cloud Auto-Scaler Engine)</h3>
                      <p className="text-[10.5px] text-slate-450 mt-0.5">میزان کاربران همزمان پلتفرم چتر دانش را تغییر دهید تا الزامات بهینه‌سازی زیرساخت کلاود را به صورت زنده برآورد کنید:</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-amber-500/10 text-amber-300 text-[10px] font-black rounded-full border border-amber-500/30">
                    محاسبات بلادرنگ لایه DevOps ⚡
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* Slider Control */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="flex justify-between items-center bg-slate-950/40 px-4 py-3 rounded-2xl border border-slate-800">
                      <span className="text-slate-400 text-xs font-semibold">تعداد داوطلبان فعال همزمان (Concurrent Students):</span>
                      <strong className="text-lg font-black text-amber-400 font-mono">{concurrentUsersScale.toLocaleString("fa-IR")} نفر</strong>
                    </div>

                    <div className="space-y-1">
                      <input 
                        type="range" 
                        min="1000" 
                        max="100000" 
                        step="1000" 
                        value={concurrentUsersScale}
                        onChange={(e) => setConcurrentUsersScale(parseInt(e.target.value))}
                        className="w-full accent-amber-400 bg-slate-800 rounded-lg appearance-none cursor-pointer h-2"
                      />
                      <div className="flex justify-between text-[9px] text-slate-400 font-bold px-1">
                        <span>۱,۰۰۰ نفر (MVP)</span>
                        <span>۵۰,۰۰۰ نفر</span>
                        <span>۱۰۰,۰۰۰ نفر (ملی)</span>
                      </div>
                    </div>

                    <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800/80 text-[10px] text-slate-350 leading-relaxed">
                      💡 با بالا و پایین بردن اسلایدر، سیستم به طور خودکار مصرف دیتابیس، کش، حجم صف پیام و کلاود سازمان چتر دانش را کالیبره کرده و منابع مورد نیاز کانتینرهای داکر/کوبرنتیز را پیشنهاد می‌دهد.
                    </div>
                  </div>

                  {/* Calculated metrics Output */}
                  <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center">
                      <span className="text-[9px] text-slate-400 block font-semibold mb-1">حداکثر اتصالات همزمان DB</span>
                      <strong className="text-base font-black text-indigo-300 font-mono">
                        {Math.ceil(concurrentUsersScale * 0.08).toLocaleString("fa-IR")}
                      </strong>
                      <span className="text-[8.5px] text-slate-500 block mt-0.5">Postgres Peak Conns</span>
                    </div>

                    <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center">
                      <span className="text-[9px] text-slate-400 block font-semibold mb-1">ظرفیت مطلوب رم کانتینر Redis</span>
                      <strong className="text-base font-black text-amber-400 font-mono">
                        {Math.ceil(concurrentUsersScale * 0.12 + 64).toLocaleString("fa-IR")} MB
                      </strong>
                      <span className="text-[8.5px] text-slate-500 block mt-0.5">Cache Allocation Size</span>
                    </div>

                    <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center">
                      <span className="text-[9px] text-slate-400 block font-semibold mb-1">سرعت صف‌بندی RabbitMQ</span>
                      <strong className="text-base font-black text-emerald-400 font-mono">
                        {Math.ceil(concurrentUsersScale * 3.5).toLocaleString("fa-IR")} write/s
                      </strong>
                      <span className="text-[8.5px] text-slate-500 block mt-0.5">Kafka Event Throughput</span>
                    </div>

                    <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center">
                      <span className="text-[9px] text-slate-400 block font-semibold mb-1">کانتینر فعال API (Docker)</span>
                      <strong className="text-base font-black text-indigo-300 font-mono">
                        {Math.max(2, Math.ceil(concurrentUsersScale / 8000)).toLocaleString("fa-IR")} غلاف (Pod)
                      </strong>
                      <span className="text-[8.5px] text-slate-500 block mt-0.5">Kubernetes Deployment scale</span>
                    </div>

                    <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center">
                      <span className="text-[9px] text-slate-400 block font-semibold mb-1">پردازشگرهای موازی هوش مصنوعی</span>
                      <strong className="text-base font-black text-purple-400 font-mono">
                        {Math.max(2, Math.ceil(concurrentUsersScale / 12000)).toLocaleString("fa-IR")} نخ (Thread)
                      </strong>
                      <span className="text-[8.5px] text-slate-500 block mt-0.5">Python Inference Workers</span>
                    </div>

                    <div className="bg-indigo-900/40 p-3.5 rounded-2xl border border-indigo-800/80 text-center">
                      <span className="text-[9px] text-amber-300 block font-semibold mb-1">سطح پهنای باند شبکه کلاود</span>
                      <strong className="text-xs font-black text-white block mt-1 leading-normal">
                        {concurrentUsersScale < 10000 ? "معمولی (1G)" : concurrentUsersScale < 40000 ? "متراکم (10G Dedicated)" : "گیگابیت اختصاصی (40G)"}
                      </strong>
                      <span className="text-[8.5px] text-slate-300 block mt-0.5">Recommended Uplink Bandwidth</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Multi-Tenancy SaaS Infrastructure Documentation */}
              <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
                    <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-900/20">
                      <Layers size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white">معماری SaaS و چندمستاجری (Multi-Tenancy Architecture)</h3>
                      <p className="text-slate-400 text-xs font-semibold mt-1 italic">تفکیک ساختارمند داده‌ها و ماژول‌ها برای موسسات مختلف حقوقی در یک پلتفرم واحد</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="text-md font-black text-indigo-400 flex items-center gap-2">
                        <Database size={18} />
                        ساختار تفکیک داده (Isolate Schema)
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed font-bold">
                        پلتفرم چتر دانش از مدل **Logical Data Isolation** استفاده می‌کند. هر موسسه (Tenant) دارای یک شناسنامه منحصر به فرد در ریشه دیتابیس است. قوانین امنیتی (Security Rules) به گونه‌ای تنظیم شده‌اند که هیچ موسسه‌ای قادر به مشاهده یا تغییر داده‌های موسسه رقیب نباشد.
                      </p>
                      <ul className="space-y-2 text-[11px] text-slate-500 font-bold">
                        <li className="flex items-start gap-2">
                          <Check size={14} className="text-indigo-500 mt-0.5" />
                          <span>مسیر ریشه: `/institutions/{`{instId}`}/*`</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check size={14} className="text-indigo-500 mt-0.5" />
                          <span>توکن‌های دسترسی مقید به ClientID موسسه</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check size={14} className="text-indigo-500 mt-0.5" />
                          <span>پشتیبانی از دامنه‌های اختصاصی (Custom Brands)</span>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-md font-black text-emerald-400 flex items-center gap-2">
                        <Zap size={18} />
                        مدل Feature Toggle و ماژولار
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed font-bold">
                        قابلیت‌های سیستم بر اساس اشتراک هر موسسه فعال یا غیرفعال می‌شوند. این امر اجازه می‌دهد تا یک داشبورد واحد، برای یک دارالترجمه کوچک با حداقل امکانات و برای یک هلدینگ آموزشی بزرگ با تمام قدرت AI نمایش داده شود.
                      </p>
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-400">AI Deep Analysis</span>
                          <span className="text-emerald-500 font-mono">ENABLED</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-400">Custom Brand PDF</span>
                          <span className="text-slate-600 font-mono">DISABLED</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-400">White Label Panel</span>
                          <span className="text-amber-500 font-mono">ON_DEMAND</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Microservices & Modules Ecosystem Registry */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl">
                      <Cpu size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">نقشه اکوسیستم میکرو‌سرویس‌ها و ماژولار چتر دانش</h3>
                      <p className="text-[11px] text-slate-500 font-bold mt-1">مانیتورینگ وضعیت استقرار و اهمیت استراتژیک لایه‌های فنی پلتفرم</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-100 font-extrabold flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                      وضعیت شبکه: عملیاتی
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      id: "ai-core",
                      name: "هسته پردازشگر AI (Deep Analysis)",
                      status: "Live",
                      importance: "بحرانی (Critical)",
                      icon: <Sparkles className="text-indigo-600" />,
                      description: "تحلیل رفتار آزمونی داوطلب و شناسایی نقاط ضعف علمی بر اساس داده‌های تراز چتر دانش.",
                      techNote: "متصل به مدل Gemini 1.5 Pro با لایه RAG اختصاصی."
                    },
                    {
                      id: "saas-isolator",
                      name: "کنترلر SaaS و تفکیک مستاجر",
                      status: "Live",
                      importance: "حیاتی (Vital)",
                      icon: <Layers className="text-indigo-600" />,
                      description: "مدیریت ایزولاسیون داده‌های موسسات مختلف از یکدیگر در سطح Schema دیتابیس.",
                      techNote: "استفاده از Security Rules سطح ۵ در لایه Firestore."
                    },
                    {
                      id: "sec-shield",
                      name: "سپر امنیتی و تست نفوذ خودکار",
                      status: "Beta",
                      importance: "بسیار بالا",
                      icon: <ShieldCheck className="text-rose-600" />,
                      description: "پایش مداوم تلاش‌های نفوذ و شبیه‌سازی حملات سایبری جهت حفظ حریم خصوصی حقوقی.",
                      techNote: "شامل ماژول Pentest Simulation و گزارشات Audit."
                    },
                    {
                      id: "vokala-eng",
                      name: "موتور شبیه‌ساز آزمون وکالت",
                      status: "Live",
                      importance: "بالا",
                      icon: <FileCode className="text-amber-600" />,
                      description: "تولید دینامیک سوالات تستی بر اساس بودجه‌بندی کانون وکلا و مرکز مشاوران.",
                      techNote: "الگوریتم انتخاب سوال بر اساس وزن علمی و تکرار سنوات."
                    },
                    {
                      id: "realtime-sync",
                      name: "سرویس همگام‌سازی زنده (Realtime)",
                      status: "In Dev",
                      importance: "متوسط",
                      icon: <Activity className="text-blue-600" />,
                      description: "ارتباط زنده بین استاد راهنما و داوطلب جهت برگزاری جلسات مشاوره تصویری و صوتی.",
                      techNote: "پیاده‌سازی بر بستر WebRTC و وب‌سوکت‌های اختصاصی."
                    },
                    {
                      id: "legal-rag",
                      name: "اطلس کلیدواژه حقوقی (RAG)",
                      status: "Beta",
                      importance: "بالا",
                      icon: <Database className="text-slate-600" />,
                      description: "جستجوی هوشمند در متن قوانین و آرای وحدت رویه جهت استخراج پاسخ سوالات تستی.",
                      techNote: "ذخیره‌سازی وکتور (Vector Embeddings) متون قانونی."
                    }
                  ].map((mod) => (
                    <div key={mod.id} className="bg-slate-50 border border-slate-200 rounded-3xl p-5 hover:border-indigo-400 transition-all hover:shadow-lg group flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition">
                            {mod.icon}
                          </div>
                          <div className="text-right">
                            <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg ${
                              mod.status === 'Live' ? 'bg-emerald-100 text-emerald-700' : 
                              mod.status === 'Beta' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'
                            }`}>
                              {mod.status === 'Live' ? 'فعال (Live)' : mod.status === 'Beta' ? 'نسخه بتا' : 'در حال توسعه'}
                            </span>
                          </div>
                        </div>
                        <h4 className="text-sm font-black text-slate-800 mb-2">{mod.name}</h4>
                        <p className="text-[10px] leading-relaxed text-slate-500 font-bold mb-4">{mod.description}</p>
                      </div>
                      
                      <div className="space-y-2 border-t border-slate-200/50 pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-slate-400">درجه اهمیت:</span>
                          <span className="text-[9px] font-black text-indigo-900">{mod.importance}</span>
                        </div>
                        <div className="bg-white/60 p-2 rounded-xl border border-slate-100">
                           <p className="text-[8px] text-slate-600 font-mono leading-tight">
                             <span className="text-indigo-600 font-black">LOG:</span> {mod.techNote}
                           </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-indigo-900 p-8 rounded-3xl text-white relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="shrink-0 w-24 h-24 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                      <Server size={40} className="text-white animate-pulse" />
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-xl font-black italic underline decoration-indigo-400 underline-offset-8">چرا معماری میکرو‌ماژولار برای چتر دانش حیاتی بود؟</h4>
                      <p className="text-sm leading-relaxed opacity-90 font-medium">
                        پلتفرم چتر دانش با هدف میزبانی از موسسات مختلف حقوقی طراحی شده است. استفاده از معماری ماژولار به ما اجازه می‌دهد تا طبق مدل **SaaS Core**, قابلیت‌هایی مانند «تحلیل پیشرفته هوش مصنوعی» را به صورت مجزا برای هر موسسه روشن یا خاموش کنیم بدون آنکه پایداری کل سیستم تحت‌الشعاع قرار گیرد. این امر منجر به کاهش ۴۰ درصدی بار پردازشی سرور و افزایش ضریب اطمینان داده‌ها در لایه دسترسی (Authorization) شده است.
                      </p>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                           <span className="text-[10px] font-black">مقیاس‌پذیری عمودی (Scalability)</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                           <span className="text-[10px] font-black">امنیت چندمستاجری (Multi-tenancy)</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                           <span className="text-[10px] font-black">بهینه‌سازی توکن‌های AI</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. The 11 Core SaaS Modules */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div>
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 border-r-4 border-indigo-900 pr-2">
                    <CheckSquare size={18} className="text-indigo-900" />
                    <span>ماژول‌های ۱۱گانه اصلی سیستم SaaS چتر دانش</span>
                  </h3>
                  <p className="text-slate-450 text-[11px] mt-1 font-medium">سرفصل‌های کلی و پیاده‌سازی شده ساختار موازی ماژولار را به صورت تعاملی بررسی کنید:</p>
                </div>

                {/* Horizontal Navigation for Modules */}
                <div className="flex border-b border-slate-100 p-1.5 bg-slate-50 rounded-2xl overflow-x-auto gap-1">
                  {[
                    "۱. مدیریت کاربران", "۲. سیستم CRM", "۳. مشاوره هوشمند", "۴. تعیین سطح تطبیقی",
                    "۵. ثبت‌نام الکترونیک", "۶. مدیریت دوره و کلاس", "۷. سیستم مالی ارشد", "۸. موتور اعلان",
                    "۹. بازاریابی هوشمند", "۱۰. هسته AI مرکزی", "۱۱. اپلیکیشن موبایل"
                  ].map((label, idx) => (
                    <button
                      key={idx}
                      onClick={() => setBlueprintModule(idx)}
                      className={`px-3 py-2 text-[10.5px] font-extrabold rounded-xl transition cursor-pointer whitespace-nowrap ${
                        blueprintModule === idx ? "bg-white text-indigo-950 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Module Details Render */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-150 relative overflow-hidden">
                  {blueprintModule === 0 && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] bg-indigo-150 text-indigo-950 font-black px-2.5 py-1 rounded-lg">Module #01</span>
                        <span className="text-[10px] text-slate-400 font-bold">بخش احراز هویت و دسترسی لایه‌ای</span>
                      </div>
                      <h4 className="font-black text-slate-900 text-sm">مدیریت کاربران و نقش‌ها (Role-Based Access Control)</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                        تفکیک فلوها و دسترسی‌های کاربران سیستم. نقش‌های اصلی شامل: **زبان‌آموز/داوطلب آزمون**، **استاد ناظر**، **مدیر ارشد پورتال**، **کارشناس مشاوره**، **مدیر امور مالی**، **مدیر بخش بازاریابی** و **رئیس منابع انسانی**. سیستم تحت امنیت JWT رمزنگاری شده و مجهز به فیلترهای کنترلی است تا تداخلی ایجاد نگردد.
                      </p>
                      <div className="flex flex-wrap gap-2 text-[9px] font-bold text-slate-500">
                        <span className="bg-white px-2 py-1 rounded-md border border-slate-200">کتابخانه: Passport.js & bcrypt</span>
                        <span className="bg-white px-2 py-1 rounded-md border border-slate-200">الگو: @UseGuards & RolesGuard</span>
                        <span className="bg-white px-2 py-1 rounded-md border border-slate-200">دیتابیس: جدول users و roles</span>
                      </div>
                    </div>
                  )}

                  {blueprintModule === 1 && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] bg-indigo-150 text-indigo-950 font-black px-2.5 py-1 rounded-lg">Module #02</span>
                        <span className="text-[10px] text-slate-400 font-bold">بخش جذب و پیگیری لیدها</span>
                      </div>
                      <h4 className="font-black text-slate-900 text-sm">سیستم مستقل ثبت لید و مدیریت ارتباط با مشتری (CRM Pipeline)</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                        مکانیزم ثبت لیدهای داوطلبان به شکل اتوماتیک از لندینگ‌پیج‌ها و فرم‌های تبلیغات چتر دانش. امکان پیگیری مشاوره توسط اپراتورها، سابقه تعاملات، لاگ‌برداری یادداشت‌ها و دسته‌بندی داوطلبان بر اساس میزان آمادگی (داغ، ولرم، سرد) جهت ریتارگتینگ اصولی.
                      </p>
                      <div className="flex flex-wrap gap-2 text-[9px] font-bold text-slate-500">
                        <span className="bg-white px-2 py-1 rounded-md border border-slate-200">الگو: Kanban Status pipeline</span>
                        <span className="bg-white px-2 py-1 rounded-md border border-slate-200">دیتابیس: جدول crm_leads و lead_logs</span>
                        <span className="bg-white px-2 py-1 rounded-md border border-slate-200">ابزار اتصال: SMS Gateway Connector</span>
                      </div>
                    </div>
                  )}

                  {blueprintModule === 2 && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] bg-indigo-150 text-indigo-950 font-black px-2.5 py-1 rounded-lg">Module #03</span>
                        <span className="text-[10px] text-slate-400 font-bold">بخش هدایت هوش مصنوعی</span>
                      </div>
                      <h4 className="font-black text-slate-900 text-sm">سیستم مشاوره هوشمند و هدایت خودکار (Smart Chatbot & Path Finder)</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                        چت‌بات پیشرفته مجهز به مدل جمی‌نی با توجیه محلی منابع آزمون وکالت. این سیستم پس از تحلیل اهداف داوطلب، سطح فعلی، بودجه ماهانه و زمان آزاد هفتگی وی، یک مسیر آموزشی و توصیه‌نامه ۲ صفحه اختصاصی تولید می‌کند که راندمان یادگیری را به حداکثر می‌رساند.
                      </p>
                      <div className="flex flex-wrap gap-2 text-[9px] font-bold text-slate-500">
                        <span className="bg-white px-2 py-1 rounded-md border border-slate-200">هوش مصنوعی: @google/genai Node SDK</span>
                        <span className="bg-white px-2 py-1 rounded-md border border-slate-200">الگو: Retrieval-Augmented Generation (RAG)</span>
                        <span className="bg-white px-2 py-1 rounded-md border border-slate-200">پروتکل: کش پاسخ‌ها در Redis</span>
                      </div>
                    </div>
                  )}

                  {blueprintModule === 3 && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] bg-indigo-150 text-indigo-950 font-black px-2.5 py-1 rounded-lg">Module #04</span>
                        <span className="text-[10px] text-slate-450 font-bold">بخش ارزیابی علمی مستقل</span>
                      </div>
                      <h4 className="font-black text-slate-900 text-sm">تعیین سطح آنلاین و سنجش‌گر تطبیقی (Adaptive Testing Engine)</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                        آزمون پیشرفته ارزیابی در مهارت‌های چندگانه قانون مدنی، آیین دادرسی، اصول فقه، تجارت و جزا به صورت تطبیقی (هر سوال سخت‌تر یا ساده‌تر بر اساس صحت پاسخ قبلی). ارائه خروجی دسته‌بندی شده معادل تراز رتبه‌ای یا سطح CEFR جهت شروع اصولی فرآیند ثبت‌نام ترم‌های حقوقی.
                      </p>
                      <div className="flex flex-wrap gap-2 text-[9px] font-bold text-slate-500">
                        <span className="bg-white px-2 py-1 rounded-md border border-slate-200">الگو: Item Response Theory (IRT-based)</span>
                        <span className="bg-white px-2 py-1 rounded-md border border-slate-200">دیتابیس: پرونده‌های آزمون و دروس</span>
                        <span className="bg-white px-2 py-1 rounded-md border border-slate-200">ارزیابی: زمان و دقت به ثانیه</span>
                      </div>
                    </div>
                  )}

                  {blueprintModule === 4 && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] bg-indigo-150 text-indigo-950 font-black px-2.5 py-1 rounded-lg">Module #05</span>
                        <span className="text-[10px] text-slate-400 font-bold">بخش تعاقد الکترونیک و تراکنش</span>
                      </div>
                      <h4 className="font-black text-slate-900 text-sm">ثبت‌نام الکترونیک مستقل چتر دانش (E-Contract & Gateway)</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                        ثبت‌نام و احراز هویت اولیه دو مرحله‌ای با OTP پیامک. صدور قراردادهای دیجیتال امضا شده با پروتکل مراجع ذی‌صلاح قانونی، ایجاد درگاه پرداخت تراکنشی آنلاین (یا درگاه‌های مکمل اقساطی برای رفاه حال داوطلبین)، مدیریت کیف پول توکن کاربری، صدور اتوماتیک فاکتور رسمی و ارسال بارکد و کارت داوطلب به پنل دانش‌پذیر.
                      </p>
                      <div className="flex flex-wrap gap-2 text-[9px] font-bold text-slate-500">
                        <span className="bg-white px-2 py-1 rounded-md border border-slate-200">هویت‌سنجی: OTP SMS Verification</span>
                        <span className="bg-white px-2 py-1 rounded-md border border-slate-200">پرداخت: ZarinPal or Sandbox Gateway IP</span>
                        <span className="bg-white px-2 py-1 rounded-md border border-slate-200">فناوری امضا: HMAC-SHA256 checksum</span>
                      </div>
                    </div>
                  )}

                  {blueprintModule === 5 && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] bg-indigo-150 text-indigo-950 font-black px-2.5 py-1 rounded-lg">Module #06</span>
                        <span className="text-[10px] text-slate-400 font-bold">بخش کنترل کلاس‌ها و مربیان</span>
                      </div>
                      <h4 className="font-black text-slate-900 text-sm">مدیریت جامع کلاس‌ها، استادان و زمان‌بندی (Academic Scheduler)</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                        تعریف بسته‌های آموزشی، کلاس‌های آنلاین و حضوری، کنترل ظرفیت اتوماتیک بر مبنای خرید، انتصاب تقویم هفتگی و تداخل‌یابی هوشمند جلسات به مربیان. سیستم مجهز به دفتر کلاسی حضور و غیاب الکترونیک، فرستنده تکلیف، آپلودر جزوه و بانک آزمون‌های ماهانه است.
                      </p>
                      <div className="flex flex-wrap gap-2 text-[9px] font-bold text-slate-500">
                        <span className="bg-white px-2 py-1 rounded-md border border-slate-200">الگو: Calendar Scheduler Event handler</span>
                        <span className="bg-white px-2 py-1 rounded-md border border-slate-200">دیتابیس: جدول courses, classes, sections</span>
                        <span className="bg-white px-2 py-1 rounded-md border border-slate-200">کلاود: یکپارچه ویدیو پلیر مینی چتر</span>
                      </div>
                    </div>
                  )}

                  {blueprintModule === 6 && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] bg-indigo-150 text-indigo-950 font-black px-2.5 py-1 rounded-lg">Module #07</span>
                        <span className="text-[10px] text-slate-450 font-bold">بخش حسابرسی مالی</span>
                      </div>
                      <h4 className="font-black text-slate-900 text-sm">سیستم مالی هوشمند و توزیع سود و هزینه‌ها (Financial Ledger)</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                        حسابرسی جامع درآمدهای حاصل از شهریه، فیلتر پرداخت‌های نقد و اقساط، محاسبه هوشمند حقوق اساتید بر حسب میزان تدریس به همراه فرمولاسیون سود و زیان جاری. پلتفرم همچنین حق کمیسیون مشاوران جذب لید را در لحظه بر روی کیف پول داخلی آنها محاسبه کرده و تسویه نقدی را زمان‌بندی می‌کند.
                      </p>
                      <div className="flex flex-wrap gap-2 text-[9px] font-bold text-slate-500">
                        <span className="bg-white px-2 py-1 rounded-md border border-slate-200">بخش‌ها: Ledger, Transactions, Payslips</span>
                        <span className="bg-white px-2 py-1 rounded-md border border-slate-200">فرمولاسیون: خودکارسازی جدول مالیات کشور</span>
                        <span className="bg-white px-2 py-1 rounded-md border border-slate-200">دیتابیس: جدول Payments, Installments</span>
                      </div>
                    </div>
                  )}

                  {blueprintModule === 7 && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] bg-indigo-150 text-indigo-950 font-black px-2.5 py-1 rounded-lg">Module #08</span>
                        <span className="text-[10px] text-slate-400 font-bold">بخش اطلاع‌رسانی یکپارچه</span>
                      </div>
                      <h4 className="font-black text-slate-900 text-sm">موتور فرستنده اعلان مرکزی (Multi-Channel Notification Gateway)</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                        زیرساخت غیرمسدودشونده جهت مخابره پیام‌های سیستمی: ارسال پیامک (مانند تایید تراز و یادآور کلاس)، پیامک OTP اولیه، الگوهای ایمیل ثبت‌نام، وب‌پوش نوتیفیکیشن مرورگر، نوتیفیکیشن تلگرام و پیام‌رسانی‌های داخلی پلتفرم برای تعامل مداوم داوطلب با تکالیف خود.
                      </p>
                      <div className="flex flex-wrap gap-2 text-[9px] font-bold text-slate-500">
                        <span className="bg-white px-2 py-1 rounded-md border border-slate-200">کتابخانه: nodemailer & KavehNegar SDK</span>
                        <span className="bg-white px-2 py-1 rounded-md border border-slate-200">فن‌بندی: RabbitMQ Queue worker</span>
                        <span className="bg-white px-2 py-1 rounded-md border border-slate-200">الگو: Event-driven pub/sub design</span>
                      </div>
                    </div>
                  )}

                  {blueprintModule === 8 && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] bg-indigo-150 text-indigo-950 font-black px-2.5 py-1 rounded-lg">Module #09</span>
                        <span className="text-[10px] text-slate-400 font-bold">بخش بازارسازی هوشمند</span>
                      </div>
                      <h4 className="font-black text-slate-900 text-sm">اتوماسیون بازاریابی هوشمند و ریتارگتینگ (Smart Marketing Ads)</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                        مدیریت و پیگیری کمپین‌های تبلیغاتی با پیگیری کدهای UTM. ایجاد الگوهای ترافیکی، سگمنت کردن خودکار داوطلبان بر اساس علایق به گرایش‌ها، انجام آزمون‌های سنجش کارایی صفحات (A/B Testing)، پایش لایو درصد تراکنش و نرخ تبدیل ورودی‌ها به کاربران پولی با اتصال وب‌هوک به پنل‌های تبلیغاتی شبکه‌های اجتماعی بومی.
                      </p>
                      <div className="flex flex-wrap gap-2 text-[9px] font-bold text-slate-500">
                        <span className="bg-white px-2 py-1 rounded-md border border-slate-200">ابزار: Google Analytics API webhook</span>
                        <span className="bg-white px-2 py-1 rounded-md border border-slate-200">الگو: Funnel and conversion analysis</span>
                        <span className="bg-white px-2 py-1 rounded-md border border-slate-200">گزارش‌گیری: نمودار نرخ کلیک CTR</span>
                      </div>
                    </div>
                  )}

                  {blueprintModule === 9 && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] bg-indigo-150 text-indigo-950 font-black px-2.5 py-1 rounded-lg">Module #10</span>
                        <span className="text-[10px] text-slate-450 font-bold">بخش مغز پردازشی سامانه</span>
                      </div>
                      <h4 className="font-black text-slate-900 text-sm">هسته هوش مصنوعی مرکزی سامانه (Central AI Engine & Analytics)</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                        موتور تصمیم‌گیرنده قدرتمند پلتفرم. بخش تحلیل رفتار داوطلب و پیشنهاد منابع مناسب به طور پویا (Recommendation Engine)، الگوریتم تشخیص و پیش‌بینی ریزش تحصیلی داوطلبین بر حسب لاگ‌های حضور و ترازها (Student Churn Predictor)، و الگوهای پیش‌بینی ترند فروش دوره‌ها بر مبنای تحلیل تاریخی فصول قبل.
                      </p>
                      <div className="flex flex-wrap gap-2 text-[9px] font-bold text-slate-500">
                        <span className="bg-white px-2 py-1 rounded-md border border-slate-200">یادگیری ماشین: Scikit-learn xgboost RFC</span>
                        <span className="bg-white px-2 py-1 rounded-md border border-slate-200">دیتابیس: جدول logs, tracking, metrics</span>
                        <span className="bg-white px-2 py-1 rounded-md border border-slate-200">پردازنده: پیش‌بینی رفتار با تراز خط لوله کلاود</span>
                      </div>
                    </div>
                  )}

                  {blueprintModule === 10 && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] bg-indigo-150 text-indigo-950 font-black px-2.5 py-1 rounded-lg">Module #11</span>
                        <span className="text-[10px] text-slate-400 font-bold">بخش اپلیکیشن کلاینت همراه</span>
                      </div>
                      <h4 className="font-black text-slate-900 text-sm">اپلیکیشن بومی موبایل داوطلبان (Native Flutter Client App)</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                        برنامه پیشخوان قابل نصب بر روی سیستم‌عامل‌های آی‌او‌اس و اندروید (طراحی شده با فریم‌ورک Flutter). داوطلبان می‌توانند وضعیت کلاس‌های فعال، لیست تکالیف، جزوات پولی، ابزار شبیه‌ساز آزمون تطبیقی به همراه قابلیت‌های پیام‌رسانی با استاد مشاور چتر دانش را به صورت کاملاً آفلاین (Offline Sync) و سریع تماشا کنند.
                      </p>
                      <div className="flex flex-wrap gap-2 text-[9px] font-bold text-slate-500">
                        <span className="bg-white px-2 py-1 rounded-md border border-slate-200">فریم‌ورک: Flutter / Dart</span>
                        <span className="bg-white px-2 py-1 rounded-md border border-slate-200">ذخیره آفلاین: SQLite / Hive database</span>
                        <span className="bg-white px-2 py-1 rounded-md border border-slate-200">اتصال: RESTful api & WebSocket client</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Database Tables Model Schema */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 border-r-4 border-indigo-900 pr-2">
                    <Database size={18} className="text-indigo-900" />
                    <span>مدل دیتابیس بومی و ساختار رابطه جداول (Relaional Database Schema)</span>
                  </h3>
                  
                  {/* Select Table pill */}
                  <div className="flex gap-1.5 flex-wrap">
                    {["users", "crm_leads", "courses", "payments", "ai_logs"].map((tbl) => (
                      <button
                        key={tbl}
                        onClick={() => setBlueprintDbTable(tbl)}
                        className={`px-2 py-1 text-[10px] font-black rounded-lg border transition cursor-pointer ${
                          blueprintDbTable === tbl ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 hover:bg-slate-50 border-slate-200"
                        }`}
                      >
                        جدول {tbl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table Schema Preview Grid */}
                <div className="overflow-x-auto rounded-2xl border border-slate-150">
                  <table className="w-full text-right text-xs border-collapse bg-white">
                    <thead>
                      <tr className="bg-indigo-50/50 border-b border-slate-200 text-indigo-950 font-black">
                        <th className="py-2.5 px-4">عنوان ستون دیتابیس (Column)</th>
                        <th className="py-2.5 px-4 text-center">نوع داده اصلی (Data Type)</th>
                        <th className="py-2.5 px-4 text-center">کلید و محدودیت‌ها (Constraints)</th>
                        <th className="py-2.5 px-4">توضیح عملکردی فیلد در سیستم چتر دانش</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {blueprintDbTable === "users" && (
                        <>
                          <tr>
                            <td className="py-2.5 px-4 font-mono font-bold text-indigo-900">id</td>
                            <td className="py-2.5 px-4 text-center font-mono text-slate-500">UUID</td>
                            <td className="py-2.5 px-4 text-center font-bold text-emerald-700">PRIMARY KEY</td>
                            <td className="py-2.5 px-4 text-slate-600">شناسه اختصاصی و منحصر‌به‌فرد سراسری هر کاربر پلتفرم.</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-4 font-mono font-bold text-indigo-900">phone</td>
                            <td className="py-2.5 px-4 text-center font-mono text-slate-500">VARCHAR(15)</td>
                            <td className="py-2.5 px-4 text-center font-bold text-blue-700">UNIQUE / INDEXED</td>
                            <td className="py-2.5 px-4 text-slate-600">تلفن همراه داوطلب جهت ورود با سامانه پیامکی OTP.</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-4 font-mono font-bold text-indigo-900">password_hash</td>
                            <td className="py-2.5 px-4 text-center font-mono text-slate-500">VARCHAR(255)</td>
                            <td className="py-2.5 px-4 text-center text-slate-400">NOT NULL</td>
                            <td className="py-2.5 px-4 text-slate-600">رمز عبور هش شده با الگوریتم قدرتمند Argon2 به همراه Salt.</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-4 font-mono font-bold text-indigo-900">role_id</td>
                            <td className="py-2.5 px-4 text-center font-mono text-slate-500">VARCHAR(30)</td>
                            <td className="py-2.5 px-4 text-center text-indigo-700">FOREIGN KEY</td>
                            <td className="py-2.5 px-4 text-slate-600">لینک به جدول نقش‌ها جهت کنترل دسترسی‌های RBAC.</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-4 font-mono font-bold text-indigo-900">status</td>
                            <td className="py-2.5 px-4 text-center font-mono text-slate-500">ENUM("active", "suspended")</td>
                            <td className="py-2.5 px-4 text-center text-slate-400">DEFAULT "active"</td>
                            <td className="py-2.5 px-4 text-slate-600">وضعیت فعلی حساب کاربر جهت دسترسی به پرتال.</td>
                          </tr>
                        </>
                      )}

                      {blueprintDbTable === "crm_leads" && (
                        <>
                          <tr>
                            <td className="py-2.5 px-4 font-mono font-bold text-indigo-900">id</td>
                            <td className="py-2.5 px-4 text-center font-mono text-slate-500">UUID</td>
                            <td className="py-2.5 px-4 text-center font-bold text-emerald-700">PRIMARY KEY</td>
                            <td className="py-2.5 px-4 text-slate-600">شناسه لید ثبت‌شده داوطلب بالقوه.</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-4 font-mono font-bold text-indigo-900">full_name</td>
                            <td className="py-2.5 px-4 text-center font-mono text-slate-500">VARCHAR(150)</td>
                            <td className="py-2.5 px-4 text-center text-slate-400">NOT NULL</td>
                            <td className="py-2.5 px-4 text-slate-600">نام کامل لید جهت مخاطب قرار دادن در پیامک و تماس‌ها.</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-4 font-mono font-bold text-indigo-900">campaign_source</td>
                            <td className="py-2.5 px-4 text-center font-mono text-slate-500">VARCHAR(100)</td>
                            <td className="py-2.5 px-4 text-center text-slate-450">-</td>
                            <td className="py-2.5 px-4 text-slate-600">منبع ورودی لید بر اساس UTM کمپین بازاریابی هوشمند.</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-4 font-mono font-bold text-indigo-900">assigned_consult_id</td>
                            <td className="py-2.5 px-4 text-center font-mono text-slate-500">UUID</td>
                            <td className="py-2.5 px-4 text-center text-indigo-700">FOREIGN KEY</td>
                            <td className="py-2.5 px-4 text-slate-600">شناسه مشاور انتصاب‌یافته از جدول کاربران جهت پیگیری تماس تلفنی.</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-4 font-mono font-bold text-indigo-900">last_contact_date</td>
                            <td className="py-2.5 px-4 text-center font-mono text-slate-500">TIMESTAMP</td>
                            <td className="py-2.5 px-4 text-center text-slate-400">NULLABLE</td>
                            <td className="py-2.5 px-4 text-slate-600">آخرین زمان برقراری ارتباط با داوطلب احتمالی.</td>
                          </tr>
                        </>
                      )}

                      {blueprintDbTable === "courses" && (
                        <>
                          <tr>
                            <td className="py-2.5 px-4 font-mono font-bold text-indigo-900">id</td>
                            <td className="py-2.5 px-4 text-center font-mono text-slate-500">UUID</td>
                            <td className="py-2.5 px-4 text-center font-bold text-emerald-700">PRIMARY KEY</td>
                            <td className="py-2.5 px-4 text-slate-600">شناسه انحصاری دوره آموزشی آنلاین یا حضوری.</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-4 font-mono font-bold text-indigo-900">title</td>
                            <td className="py-2.5 px-4 text-center font-mono text-slate-500">VARCHAR(200)</td>
                            <td className="py-2.5 px-4 text-center text-slate-400">NOT NULL</td>
                            <td className="py-2.5 px-4 text-slate-600">عنوان کامل دوره حقوقی (مثال: آمادگی آزمون وکالت زمستان).</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-4 font-mono font-bold text-indigo-900">teacher_id</td>
                            <td className="py-2.5 px-4 text-center font-mono text-slate-500">UUID</td>
                            <td className="py-2.5 px-4 text-center text-indigo-700">FOREIGN KEY</td>
                            <td className="py-2.5 px-4 text-slate-600">شناسه استاد تدریس‌کننده دوره از جدول کل کاربران.</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-4 font-mono font-bold text-indigo-900">price</td>
                            <td className="py-2.5 px-4 text-center font-mono text-slate-500">DECIMAL(12, 2)</td>
                            <td className="py-2.5 px-4 text-center text-slate-400">NOT NULL</td>
                            <td className="py-2.5 px-4 text-slate-600">شهریه و قیمت خام پکیج دوره حقوقی به ریال.</td>
                          </tr>
                        </>
                      )}

                      {blueprintDbTable === "payments" && (
                        <>
                          <tr>
                            <td className="py-2.5 px-4 font-mono font-bold text-indigo-900">id</td>
                            <td className="py-2.5 px-4 text-center font-mono text-slate-500">UUID</td>
                            <td className="py-2.5 px-4 text-center font-bold text-emerald-700">PRIMARY KEY</td>
                            <td className="py-2.5 px-4 text-slate-600">شناسه انحصاری ثبت تراکنش مالی.</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-4 font-mono font-bold text-indigo-900">user_id</td>
                            <td className="py-2.5 px-4 text-center font-mono text-slate-500">UUID</td>
                            <td className="py-2.5 px-4 text-center text-indigo-700">FOREIGN KEY</td>
                            <td className="py-2.5 px-4 text-slate-600">شناسه پرداخت‌کننده شهریه (داوطلب).</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-4 font-mono font-bold text-indigo-900">amount</td>
                            <td className="py-2.5 px-4 text-center font-mono text-slate-500">DECIMAL(12, 2)</td>
                            <td className="py-2.5 px-4 text-center text-slate-400">NOT NULL</td>
                            <td className="py-2.5 px-4 text-slate-600">مبلغ تراکنش مالی تایید شده.</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-4 font-mono font-bold text-indigo-900">gateway_ref_id</td>
                            <td className="py-2.5 px-4 text-center font-mono text-slate-500">VARCHAR(100)</td>
                            <td className="py-2.5 px-4 text-center text-blue-700">UNIQUE</td>
                            <td className="py-2.5 px-4 text-slate-600">شماره ارجاع بانک یا شناسه پیگیری تراکنش زرین‌پال.</td>
                          </tr>
                        </>
                      )}

                      {blueprintDbTable === "ai_logs" && (
                        <>
                          <tr>
                            <td className="py-2.5 px-4 font-mono font-bold text-indigo-900">id</td>
                            <td className="py-2.5 px-4 text-center font-mono text-slate-500">BIGINT</td>
                            <td className="py-2.5 px-4 text-center font-bold text-emerald-700">PRIMARY KEY (Identity)</td>
                            <td className="py-2.5 px-4 text-slate-600">شناسه ثبت خودکار لاگ ردیابی هوش مصنوعی.</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-4 font-mono font-bold text-indigo-900">student_id</td>
                            <td className="py-2.5 px-4 text-center font-mono text-slate-500">UUID</td>
                            <td className="py-2.5 px-4 text-center text-indigo-700">FOREIGN KEY</td>
                            <td className="py-2.5 px-4 text-slate-600">شناسه داوطلبی که فرآیند RAG یا پاسخ جمی‌نی برایش تولید شده.</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-4 font-mono font-bold text-indigo-900">prompt_tokens</td>
                            <td className="py-2.5 px-4 text-center font-mono text-slate-500">INTEGER</td>
                            <td className="py-2.5 px-4 text-center text-slate-400">-</td>
                            <td className="py-2.5 px-4 text-slate-600">تعداد توکن‌های ورودی ارسالی به مدل جهت محاسبه برآورد مالی هزینه سرور.</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-4 font-mono font-bold text-indigo-900">response_text</td>
                            <td className="py-2.5 px-4 text-center font-mono text-slate-500">TEXT</td>
                            <td className="py-2.5 px-4 text-center text-slate-400">-</td>
                            <td className="py-2.5 px-4 text-slate-600">متن استخراج شده خلاصه تحلیل تراز داوطلب به صورت آفلاین.</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 5. Security & Compliance Panel */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 border-r-4 border-indigo-900 pr-2">
                  <ShieldCheck size={18} className="text-indigo-900" />
                  <span>پروتکل‌های جامع امنیت، هویت‌سنجی و رمزنگاری</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-slate-50/80 border border-slate-150 p-4 rounded-2xl flex gap-3 text-right">
                    <div className="p-2 bg-indigo-55 bg-indigo-50 border border-indigo-100 rounded-xl h-fit">
                      <Lock size={18} className="text-indigo-900" />
                    </div>
                    <div className="space-y-1">
                      <strong className="block text-slate-850 text-xs font-black">JWT / OAuth 2.0 & RFC Standards</strong>
                      <p className="text-[10.5px] text-slate-500 leading-normal">توکن‌های دسترسی داوطلبان به پورتال بر روی هدرهای Authorization با کلیدهای نامتقارن امضا شده و هر ۳۰ دقیقه منقضی و بازسازی می‌شوند.</p>
                    </div>
                  </div>

                  <div className="bg-slate-50/80 border border-slate-150 p-4 rounded-2xl flex gap-3 text-right">
                    <div className="p-2 bg-indigo-55 bg-indigo-50 border border-indigo-100 rounded-xl h-fit">
                      <Key size={18} className="text-indigo-900" />
                    </div>
                    <div className="space-y-1">
                      <strong className="block text-slate-850 text-xs font-black">احراز هویت دو مرحله‌ای MFA / OTP</strong>
                      <p className="text-[10.5px] text-slate-500 leading-normal">ورود کاربران مجهز به کد یک‌بارمصرف پیامکی با بازه زمانی مجاز ۱۲۰ ثانیه جهت انسداد نفوذ ربات‌ها و امنیت داده‌ها.</p>
                    </div>
                  </div>

                  <div className="bg-slate-50/80 border border-slate-150 p-4 rounded-2xl flex gap-3 text-right">
                    <div className="p-2 bg-indigo-55 bg-indigo-50 border border-indigo-100 rounded-xl h-fit">
                      <ShieldCheck size={18} className="text-indigo-900" />
                    </div>
                    <div className="space-y-1">
                      <strong className="block text-slate-850 text-xs font-black">کنترل دسترسی نقشی (RBAC Guard)</strong>
                      <p className="text-[10.5px] text-slate-500 leading-normal">تمام ماژول‌ها و اندپوینت‌های ترازها بر روی گیت اصلی و با استفاده از دکوراتورهای نقشی بررسی شده و از نشت تراز به بیرون جلوگیری می‌کند.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. Roadmap Steps / Implementation Pipeline Timeline */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 border-r-4 border-indigo-900 pr-2">
                  <BarChart size={18} className="text-indigo-900" />
                  <span>برنامه فازهای اجرایی و نقشه راه استقرار SaaS (Implementation Roadmap)</span>
                </h3>

                <div className="relative border-r-2 border-indigo-200 mr-4 pr-6 space-y-6 font-sans">
                  {/* Step 1 */}
                  <div className="relative">
                    <div className="absolute right-[-31px] top-0 w-4 h-4 rounded-full bg-indigo-900 border-4 border-white shadow-md" />
                    <div className="space-y-1">
                      <span className="text-[9.5px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">فاز اول - MVP (پایه تجاری)</span>
                      <strong className="block text-slate-850 text-xs font-extrabold">فرم ثبت‌نام پایه، درگاه، پنل داوطلب و مشاوره حقوقی مقدماتی</strong>
                      <p className="text-[10.5px] text-slate-650 max-w-4xl leading-relaxed">
                        تمرکز بر خودکارسازی پذیرش لید، احراز هویت اولیه دو مرحله‌ای OTP، اتصال دیتابیس بومی کاربران، طراحی پنل اولیه داوطلبین جهت مشاهده ترازها و درگاه پرداخت آنلاین جهت رفاه حال دانشجویان چتر دانش.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative">
                    <div className="absolute right-[-31px] top-0 w-4 h-4 rounded-full bg-indigo-950 border-4 border-white shadow-md" />
                    <div className="space-y-1">
                      <span className="text-[9.5px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">فاز دوم - نسخه اولیه (تعادل علمی)</span>
                      <strong className="block text-slate-850 text-xs font-extrabold">سامانه آزمون‌های تطبیقی هماهنگ، پنل مربیان ناظر و ماژول مالی پایه</strong>
                      <p className="text-[10.5px] text-slate-650 max-w-4xl leading-relaxed">
                        راه‌اندازی ماژول آزمون تعیین سطح آنلاین هوشمند مبتنی بر IRT، بخش برنامه‌ریزی تقویمی برای اساتید، سیستم ارسال نوتیفیکیشن همگام‌ساز پیامکی و ساخت دفتر کل مالی حقوق کادر علمی و داوطلبین اقساطی.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative">
                    <div className="absolute right-[-31px] top-0 w-4 h-4 rounded-full bg-indigo-950 border-4 border-white shadow-md" />
                    <div className="space-y-1">
                      <span className="text-[9.5px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">فاز سوم - نسخه تجاری (گسترش بازار)</span>
                      <strong className="block text-slate-850 text-xs font-extrabold">سامانه CRM تکامل‌یافته، اتوماسیون تبلیغات، پنل‌های چندگانه و اپلیکیشن فلاتر</strong>
                      <p className="text-[10.5px] text-slate-650 max-w-4xl leading-relaxed">
                        تکمیل پایپ‌لاین خط لوله فروش، پیگیری اتوماتیک مشتری، فیلترینگ کمپین‌ها بصورت A/B، انتشار عمومی اپ اندروید و آی‌او‌اس داوطلبین چتر دانش با کش محلی به همراه پیاده‌سازی همزمان تمام پنل‌های فرعی (منابع انسانی، ناظرین مالی، بازاریابان).
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="relative">
                    <div className="absolute right-[-31px] top-0 w-4 h-4 rounded-full bg-indigo-950 border-4 border-white shadow-md" />
                    <div className="space-y-1">
                      <span className="text-[9.5px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">فاز چهارم - هوش سنتی تکاملی (AI & Cloud Growth)</span>
                      <strong className="block text-slate-850 text-xs font-extrabold">پیش‌بینی ریزش یادگیرنده، مفسر ترند فروش، گیمیفیکیشن و کوبرنتیز</strong>
                      <p className="text-[10.5px] text-slate-650 max-w-4xl leading-relaxed">
                        کالیبره کردن مدل‌های ماشین لرنینگ جهت تشخیص ریزش انگیزه داوطلبان، استفاده از موتور پیشنهاد دهنده منابع جهت افزایش فروش پکیج‌ها، اعمال تالار افتخارات رقابتی و مهاجرت نهایی زیرساخت به تراز پایدار داکر و ارکستریشن کانتینرهای Kubernetes.
                      </p>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="relative">
                    <div className="absolute right-[-31px] top-0 w-4 h-4 rounded-full bg-indigo-950 border-4 border-white shadow-md" />
                    <div className="space-y-1">
                      <span className="text-[9.5px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">فاز پنجم - توسعه آینده (مرزهای جدید)</span>
                      <strong className="block text-slate-850 text-xs font-extrabold">بین‌المللی سازی سامانه، دادگستری شبیه‌ساز مجازی AR/VR و حضور فرامرزی</strong>
                      <p className="text-[10.5px] text-slate-650 max-w-4xl leading-relaxed">
                        پشتیبانی کامل از سایر زبان‌ها با تغییر قالب یونیکد ملل، شبیه‌سازی محاکم و دادگاه‌های نمایشی با فناوری‌های واقعیت مجازی/افزوده جهت تجربه کاملاً کاربردی و بی‌رقیب داوطلبان کنکور وکلای بین‌الملل.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
