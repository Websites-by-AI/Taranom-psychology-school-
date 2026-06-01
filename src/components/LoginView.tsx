import React, { useState } from "react";
import { Sparkles, Phone, Lock, Hash, ShieldCheck, UserCheck, Layers, BookOpen, Activity, Wallet, CreditCard } from "lucide-react";
import { motion } from "motion/react";
import { Student } from "../types";

interface LoginViewProps {
  onLogin: (student: Student, role: "student" | "parent" | "admin") => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [activeTab, setActiveTab] = useState<"student" | "parent" | "admin">("student");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [kanoonCode, setKanoonCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [regName, setRegName] = useState("");
  const [isOrg, setIsOrg] = useState(false);

  // داوطلبان و لاین‌های فعال در ترنم مهر
  const mockStudents: Student[] = [
    { id: "1", name: "مریم حسینی (رشته علوم تجربی - هدف پزشکی تهران)", code: "9812405", field: "tajrobi", grade: "رتبه فرضی ۴۷ کشوری - تراز ۱۰/۴۵۰" },
    { id: "2", name: "علیرضا رضایی (رشته ریاضی فیزیک - هدف مهندسی کامپیوتر شریف)", code: "9786431", field: "riazi", grade: "رتبه فرضی ۲۴ کشوری - تراز ۱۰/۱۲۰" },
    { id: "3", name: "امیرمحمد اکبری (رشته علوم انسانی - هدف حقوق دانشگاه تهران)", code: "9921477", field: "ensani", grade: "رتبه فرضی ۱۲ کشوری - تراز ۹/۹۵۰" }
  ];

  const handlePaymentAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber.startsWith("09") || mobileNumber.length !== 11) {
      alert("لطفاً شماره موبایل معتبر وارد کنید.");
      return;
    }
    setLoading(true);
    
    const amount = isOrg ? 10000000 : 450000;
    const description = isOrg 
      ? `درخواست پنل اختصاصی برای موسسه ${regName}` 
      : `ثبت‌نام داوطلب ${regName} در سیستم هوشمند ترنم مهر`;

    try {
      const response = await fetch("/api/payment/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount, 
          description,
          mobile: mobileNumber
        })
      });
      
      const data = await response.json();
      if (data.url) {
        // In a real app, we would redirect. In this preview, we'll simulate the successful return.
        if (confirm("درخواست پرداخت به زرین‌پال ارسال شد. آیا می‌خواهید پرداخت شبیه‌سازی شده موفق را تایید کنید؟")) {
          // Success simulation
          onLogin({
            id: Date.now().toString(),
            name: regName,
            code: "NEW_" + Math.floor(Math.random() * 1000),
            field: "tajrobi",
            grade: "داوطلب جدید - در انتظار تعیین سطح"
          }, "student");
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("خطا در برقراری ارتباط با درگاه پرداخت.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber.startsWith("09") || mobileNumber.length !== 11) {
      alert("لطفاً شماره موبایل معتبر ۱۱ رقمی وارد نمایید. (شروع با ۰۹)");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
    }, 700);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode !== "1234" && otpCode !== "12345") {
      alert("کد تایید نادرست است. (جهت ارزیابی از '1234' استفاده کنید)");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (activeTab === "student") {
        const matched = mockStudents.find(s => s.code === kanoonCode) || mockStudents[0];
        onLogin(matched, "student");
      } else if (activeTab === "parent") {
        onLogin(mockStudents[0], "parent");
      } else {
        onLogin(mockStudents[0], "admin");
      }
    }, 900);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl shadow-indigo-900/10 overflow-hidden border border-slate-200"
        id="login-card-container"
      >
        <div className="bg-gradient-to-tr from-blue-950 via-slate-900 to-indigo-950 p-8 text-center text-white relative">
          <div className="absolute top-2 right-2 opacity-10">
            <Layers size={150} />
          </div>
          <div className="mx-auto w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md border border-white/20">
            <Sparkles size={36} className="text-amber-400" />
          </div>
          <h1 className="text-2xl font-black tracking-tight mb-2">ترنم مهر</h1>
          <p className="text-blue-200/90 text-xs">سامانه هوشمند مانیتورینگ تراز، کایزن درسی و آمادگی کنکور سراسری</p>
        </div>

        {/* Roles Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-1" id="login-role-tabs">
          {(["student", "parent", "admin"] as const).map((tab) => (
            <motion.button
              key={tab}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setActiveTab(tab);
                setOtpSent(false);
                setOtpCode("");
              }}
              className={`flex-1 py-3 text-[10px] sm:text-xs font-black rounded-xl transition-all duration-300 cursor-pointer relative overflow-hidden flex items-center justify-center ${
                activeTab === tab
                  ? "text-white shadow-lg shadow-indigo-600/20"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/30"
              }`}
              id={`tab-button-${tab}`}
            >
              <span className="relative z-10">
                {tab === "student" && "🎓 داوطلب"}
                {tab === "parent" && "👥 والدین"}
                {tab === "admin" && "📐 ادمین"}
              </span>
              {activeTab === tab && (
                <motion.div 
                  layoutId="active-login-tab"
                  className="absolute inset-0 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          ))}
        </div>

        <div className="p-8">
          <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-6 border border-slate-150 shadow-inner">
            <button 
              onClick={() => setIsRegistering(false)}
              className={`flex-1 py-2.5 text-[11px] font-black rounded-xl transition-all ${!isRegistering ? 'bg-white text-blue-900 shadow-sm border border-slate-100' : 'text-slate-400'}`}
            >
              ورود داوطلبان قبلی
            </button>
            <button 
              onClick={() => setIsRegistering(true)}
              className={`flex-1 py-2.5 text-[11px] font-black rounded-xl transition-all ${isRegistering ? 'bg-white text-blue-900 shadow-sm border border-slate-100' : 'text-slate-400'}`}
            >
              ثبت‌نام جدید و پرداخت
            </button>
          </div>

          {isRegistering ? (
            <div className="space-y-6 animate-fade-in" id="registration-plans-container">
              <div className="text-center mb-6">
                <h3 className="text-sm font-black text-slate-800">انتخاب پکیج هوشمند اشتراک ترنم مهر</h3>
                <p className="text-[10px] text-slate-500 font-bold mt-1">تخمین هزینه و فعال‌سازی خدمات بر اساس نقش کاربری</p>
              </div>

              <div className="space-y-4">
                {/* Student Plan */}
                <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm hover:border-indigo-400 transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                      <BookOpen size={20} />
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] font-black text-slate-400 block">پکیج پایه</span>
                      <span className="text-sm font-black text-slate-900">ویژه داوطلب</span>
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-500 leading-relaxed text-right mb-4">دسترسی کامل به ماژول پومودورو، تحلیل تراز AI و بانک تله‌های تستی. مناسب برای مطالعه خودمحور.</p>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                    <div className="text-right">
                      <span className="text-xs font-black text-indigo-700">۴۵۰,۰۰۰ تومان</span>
                      <span className="text-[8px] text-slate-400 block">اشتراک سالیانه</span>
                    </div>
                    <button 
                      onClick={() => setRegName("داوطلب پایه")} 
                      className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black rounded-xl hover:bg-indigo-700 transition"
                    >
                      انتخاب و ثبت‌نام
                    </button>
                  </div>
                </div>

                {/* Parent + Student Plan */}
                <div className="p-5 bg-indigo-50 border border-indigo-200 rounded-3xl shadow-sm relative overflow-hidden group">
                  <div className="absolute -top-2 -left-2 bg-amber-400 text-white text-[8px] font-black px-4 py-2 rotate-[-12deg] shadow-sm z-10">پیشنهادی</div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2 bg-white text-indigo-600 rounded-xl shadow-sm">
                      <UserCheck size={20} />
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] font-black text-indigo-400 block">پکیج مربیگری</span>
                      <span className="text-sm font-black text-indigo-900">داوطلب + والدین</span>
                    </div>
                  </div>
                  <p className="text-[9px] text-indigo-700 leading-relaxed text-right mb-4">شامل اپلیکیشن اختصاصی والدین برای مانیتورینگ لحظه‌ای، گزارش‌های هفتگی پیامکی و تحلیل مقایسه‌ای عملکرد.</p>
                  <div className="flex justify-between items-center pt-3 border-t border-indigo-100">
                    <div className="text-right">
                      <span className="text-xs font-black text-indigo-900">۸۵۰,۰۰۰ تومان</span>
                      <span className="text-[8px] text-indigo-400 block">شامل ۲ دسترسی مجزا</span>
                    </div>
                    <button 
                      onClick={() => setRegName("اشتراک خانوادگی")} 
                      className="px-4 py-2 bg-indigo-900 text-white text-[10px] font-black rounded-xl hover:bg-slate-900 transition shadow-lg shadow-indigo-900/20"
                    >
                      انتخاب و فعال‌سازی
                    </button>
                  </div>
                </div>

                {/* Institutional Plan */}
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2 bg-slate-800 text-amber-400 rounded-xl">
                      <Layers size={20} />
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] font-black text-slate-500 block">SaaS سازمان</span>
                      <span className="text-sm font-black text-white">پکیج موسسات و مدارس</span>
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-400 leading-relaxed text-right mb-4">پنل مدیریت یکپارچه برای مشاوران و مدارس، دیتابیس اختصاصی و برندینگ سفارشی برای مجموعه شما.</p>
                  
                  <div className="space-y-2 mb-4">
                    <span className="text-[8px] font-black text-slate-500 block text-right mb-1">مشاهده نمونه دمو موسسات همکار:</span>
                    <div className="flex gap-2">
                       <button onClick={() => { setRegName("آکادمی نخبگان البرز"); setIsOrg(true); }} className="flex-1 py-1.5 px-2 bg-slate-800 rounded-lg text-[8px] font-black text-slate-300 hover:bg-slate-700 border border-slate-700 transition">آکادمی نخبگان</button>
                       <button onClick={() => { setRegName("دبیرستان هوشمند آتیه"); setIsOrg(true); }} className="flex-1 py-1.5 px-2 bg-slate-800 rounded-lg text-[8px] font-black text-slate-300 hover:bg-slate-700 border border-slate-700 transition">دبیرستان آتیه</button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-black text-amber-400">۱۰,۰۰۰,۰۰۰</span>
                        <span className="text-[8px] text-slate-500">تومان</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setRegName("ثبت‌نام موسسه جدید"); setIsOrg(true); }} 
                      className="px-4 py-2 bg-amber-500 text-slate-900 text-[10px] font-black rounded-xl hover:bg-amber-400 transition"
                    >
                      درخواست پنل اختصاصی
                    </button>
                  </div>
                </div>
              </div>

              {regName && (
                <form onSubmit={handlePaymentAndRegister} className="space-y-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-2 mb-2 p-3 bg-slate-50 rounded-2xl border border-slate-150">
                    <Activity size={16} className="text-indigo-600" />
                    <span className="text-[10px] font-black text-slate-700">{isOrg ? "نام موسسه/سازمان:" : "درحال ثبت‌نام برای:"} <span className="text-indigo-900 underline">{regName}</span></span>
                    <button onClick={() => { setRegName(""); setIsOrg(false); }} className="mr-auto text-[10px] text-rose-500 font-bold">تغییر پلن</button>
                  </div>
                  
                  {isOrg ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-black text-slate-600 mb-1">نام نهایی موسسه / برند آموزشی</label>
                        <input 
                          type="text" 
                          value={regName === "ثبت‌نام موسسه جدید" ? "" : regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="نام مجموعه خود را وارد کنید" 
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-right text-xs focus:ring-2 focus:ring-amber-500 outline-none" 
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-600 mb-1">نام مدیر/مسئول فنی</label>
                        <input type="text" placeholder="مثال: دکتر علوی" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-right text-xs focus:ring-2 focus:ring-amber-500 outline-none" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-600 mb-1">تعداد حدودی دانش‌آموزان</label>
                        <select className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-right text-xs focus:ring-2 focus:ring-amber-500 outline-none">
                          <option>تا ۵۰ نفر</option>
                          <option>۵۰ تا ۲۰۰ نفر</option>
                          <option>بیش از ۲۰۰ نفر (سازمانی)</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">نام و نام خانوادگی داوطلب</label>
                      <input
                        type="text"
                        required
                        placeholder="نام کامل خود را وارد کنید"
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-sm transition duration-150"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">شماره همراه مسئول/رابط</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                        <Phone size={18} />
                      </div>
                      <input
                        type="tel"
                        required
                        maxLength={11}
                        placeholder="09..."
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9]/g, ""))}
                        className="w-full pl-3 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white font-mono tracking-widest text-slate-800 text-sm transition duration-150"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-950 text-white py-3.5 rounded-xl font-bold hover:bg-slate-900 transition duration-150 shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Wallet size={18} />
                        <span>تایید و هدایت به درگاه پرداخت</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          ) : !otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-5" id="send-otp-form">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">شماره تلفن همراه پرسنلی</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <Phone size={18} />
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={11}
                    placeholder="مثال: 09123456789"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full pl-3 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white font-mono tracking-widest text-slate-800 text-sm transition duration-150"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">رمز تایید یکبار مصرف امنیتی برای ورود به پرتال سازمانی ارسال خواهد شد.</p>
              </div>

              {activeTab === "student" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">کد داوطلب / شناسه کارنامه ترنم مهر (اختیاری)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                      <Hash size={18} />
                    </div>
                    <input
                      type="text"
                      placeholder="مانند: 9812405 یا 9786431"
                      value={kanoonCode}
                      onChange={(e) => setKanoonCode(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full pl-3 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white font-mono tracking-widest text-slate-800 text-sm transition duration-150"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed font-mono">مثال: 9812405 (برای اتصال به مریم حسینی - داوطلب تجربی)</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-950 text-white py-3.5 rounded-xl font-bold hover:bg-slate-900 transition duration-150 shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
                id="btn-send-otp"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>ارسال پین امنیتی ورود</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5" id="verify-otp-form">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
                <ShieldCheck className="text-blue-600 flex-shrink-0" size={20} />
                <div className="text-xs text-blue-950 leading-relaxed">
                  کد ورود یکبار مصرف به شماره موبایل پرسنلی <strong className="font-mono">{mobileNumber}</strong> تلگراف شد.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">کد یکبار مصرف امنیتی</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="کد ۴ یا ۵ رقمی"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full pl-3 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white font-mono tracking-widest text-slate-800 text-lg transition duration-150"
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-slate-400">رمز شبیه‌ساز تست: 1234</span>
                  <button 
                    type="button" 
                    onClick={() => setOtpSent(false)} 
                    className="text-xs font-bold text-blue-800 hover:text-blue-900 cursor-pointer"
                  >
                    تغییر شماره همراه
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-950 text-white py-3.5 rounded-xl font-bold hover:bg-slate-900 transition duration-150 shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
                id="btn-verify-login"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <UserCheck size={18} />
                    <span>تأیید پین و ورود به سیستم</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Direct Sandbox Buttons for easy evaluation */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 mb-3">دسترسی سریع توسعه‌دهنده جهت بررسی نقش‌های کاربری</p>
            <div className="flex flex-wrap justify-center gap-2">
              <button 
                type="button"
                onClick={() => onLogin(mockStudents[0], "student")}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg transition border border-indigo-100 cursor-pointer"
              >
                 داوطلب ۱ (تجربی / پزشکی)
              </button>
              <button 
                type="button"
                onClick={() => onLogin(mockStudents[1], "student")}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-lg transition border border-blue-100 cursor-pointer"
              >
                 داوطلب ۲ (ریاضی / مهندسی)
              </button>
              <button 
                type="button"
                onClick={() => onLogin(mockStudents[0], "parent")}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-lg transition border border-amber-100 cursor-pointer"
              >
                پورتال نظارتی والدین ترنم مهر
              </button>
              <button 
                type="button"
                onClick={() => onLogin(mockStudents[0], "admin")}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-lg transition border border-emerald-100 cursor-pointer"
              >
                پورتال ادمین / معماری SaaS
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
