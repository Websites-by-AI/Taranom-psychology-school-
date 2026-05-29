import React, { useState } from "react";
import { GraduationCap, Phone, Lock, Hash, ShieldCheck, UserCheck } from "lucide-react";
import { motion } from "motion/react";
import { Student } from "../types";
import { signInAnonymously } from "firebase/auth";
import { auth } from "../firebase";
import { saveInstitutionUser, appendSecurityLog } from "../firebaseSync";

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

  const mockStudents: Student[] = [
    { id: "1", name: "فاطمه حسینی", code: "9812405", field: "bar_exam", grade: "داوطلب وکالت" },
    { id: "2", name: "علیرضا رضایی", code: "9786431", field: "judiciary", grade: "داوطلب قضاوت" },
    { id: "3", name: "امیرمحمد امیری", code: "9921477", field: "notary", grade: "داوطلب سردفتری" }
  ];

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
    }, 800);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode !== "1234" && otpCode !== "12345") {
      alert("کد تایید نادرست است. (برای شبیه‌سازی از '1234' استفاده کنید)");
      return;
    }

    setLoading(true);
    try {
      // 1. Authenticate with Firebase Auth anonymously to obtain uid
      const userCredential = await signInAnonymously(auth);
      const uid = userCredential.user.uid;

      // 2. Prepare user profile and save to Firestore
      const userRole = activeTab === "admin" ? "admin" : "student";
      const matched = activeTab === "student" 
        ? (mockStudents.find(s => s.code === kanoonCode) || mockStudents[0])
        : mockStudents[0];

      await saveInstitutionUser("inst-3", {
        userId: uid,
        email: `${uid.substring(0, 8)}@chatre-danesh.ir`,
        role: userRole,
        displayName: matched.name,
      });

      // 3. Create active audit/security logs
      await appendSecurityLog({
        userId: uid,
        action: "SIGN_IN",
        details: `موفقیت‌آمیز ورود کاربر با نقش ${userRole === "admin" ? "مدیر" : "دانشجو"} و شماره موبایل ${mobileNumber}`,
        severity: "low",
      });
      
      setLoading(false);
      onLogin(matched, activeTab);
    } catch (err: any) {
      console.warn("Firebase authentication bypassed or failed:", err);
      // Fail gracefully: proceed with UI login experience
      const matched = activeTab === "student" 
        ? (mockStudents.find(s => s.code === kanoonCode) || mockStudents[0])
        : mockStudents[0];
      setLoading(false);
      onLogin(matched, activeTab);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
         initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100"
        id="login-card-container"
      >
        <div className="bg-gradient-to-tr from-blue-900 to-indigo-950 p-8 text-center text-white relative">
          <div className="absolute top-2 right-2 opacity-5">
            <GraduationCap size={150} />
          </div>
          <div className="mx-auto w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md border border-white/20">
            <GraduationCap size={36} className="text-amber-400" />
          </div>
          <h1 className="text-xl font-black tracking-tight mb-2">موسسه آموزش عالی حقوقی چتر دانش</h1>
          <p className="text-blue-200/95 text-xs">سامانه هوشمند تحلیل کارنامه و شخصی‌سازی برنامه آزمون حقوقی</p>
        </div>

        {/* Roles Tabs */}
        <div className="flex bg-slate-50/50 p-1.5 sm:p-2 gap-1.5 border-b border-slate-100" id="login-role-tabs">
          {(["student", "parent", "admin"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setOtpSent(false);
                setOtpCode("");
              }}
              className={`flex-1 py-3 text-[10px] xs:text-xs font-black rounded-xl transition duration-200 active:scale-95 flex items-center justify-center min-h-[44px] ${
                activeTab === tab
                  ? "bg-white text-blue-900 shadow-sm border border-slate-150 font-black"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
              }`}
              id={`tab-button-${tab}`}
            >
              {tab === "student" && "🎓 داوطلب"}
              {tab === "parent" && "👥 همکار"}
              {tab === "admin" && "🛡️ پنل مدیریت"}
            </button>
          ))}
        </div>

        <div className="p-5 xs:p-8">
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4 xs:space-y-5" id="send-otp-form">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">شماره تلفن همراه</label>
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
                    className="w-full pl-3 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono tracking-widest text-slate-800 transition duration-150 text-sm xs:text-base"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">کد تایید یکبار مصرف پیامکی (OTP) برای این شماره ارسال خواهد شد.</p>
              </div>

              {activeTab === "student" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">کد داوطلبی چتر دانش (اختیاری)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                      <Hash size={18} />
                    </div>
                    <input
                      type="text"
                      placeholder="کد کارنامه آزمون چتر دانش"
                      value={kanoonCode}
                      onChange={(e) => setKanoonCode(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full pl-3 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono tracking-widest text-slate-800 transition duration-150 text-sm xs:text-base"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 leading-relaxed font-mono">مثال: 9812405 (برای اتصال به آزمون‌های سراسری چتر دانش)</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-900 text-white min-h-[48px] xs:min-h-[52px] py-3.5 px-4 rounded-xl font-bold hover:bg-blue-950 active:scale-[0.98] transition duration-150 shadow-md flex items-center justify-center gap-2 text-sm xs:text-base cursor-pointer"
                id="btn-send-otp"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>ارسال کد تأیید ورود</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4 xs:space-y-5" id="verify-otp-form">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
                <ShieldCheck className="text-blue-600 flex-shrink-0" size={20} />
                <div className="text-xs text-blue-900 leading-relaxed">
                  کد تایید یکبار مصرف به شماره <strong className="font-mono">{mobileNumber}</strong> پیامک شد.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">کد تأیید چهار رقمی</label>
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
                    className="w-full pl-3 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono tracking-widest text-slate-800 text-lg sm:text-xl transition duration-150"
                  />
                </div>
                <div className="flex justify-between items-center mt-2.5">
                  <span className="text-xs text-slate-400 font-bold">رمز تست: 1234</span>
                  <button 
                    type="button" 
                    onClick={() => setOtpSent(false)} 
                    className="text-xs font-black text-blue-600 hover:text-blue-800 cursor-pointer min-h-[36px] flex items-center"
                  >
                    تغییر شماره تماس
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-900 text-white min-h-[48px] xs:min-h-[52px] py-3.5 px-4 rounded-xl font-bold hover:bg-blue-950 active:scale-[0.98] transition duration-150 shadow-md flex items-center justify-center gap-2 text-sm xs:text-base cursor-pointer"
                id="btn-verify-login"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <UserCheck size={18} />
                    <span>تأیید و ورود به سامانه</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Direct Sandbox Buttons for easy evaluation */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-[11px] font-bold text-slate-400 mb-3.5">ورود سریع برای ارزیابی (بدون نیاز به پین پیامکی)</p>
            <div className="flex flex-wrap justify-center gap-2">
              <button 
                type="button"
                onClick={() => onLogin(mockStudents[0], "student")}
                className="flex-1 min-w-[100px] py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-xs rounded-xl transition border border-indigo-100 cursor-pointer active:scale-95 min-h-[40px] flex items-center justify-center"
              >
                دانش‌آموز تستی
              </button>
              <button 
                type="button"
                onClick={() => onLogin(mockStudents[0], "parent")}
                className="flex-1 min-w-[100px] py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-700 font-black text-xs rounded-xl transition border border-amber-100 cursor-pointer active:scale-95 min-h-[40px] flex items-center justify-center"
              >
                والدین تستی
              </button>
              <button 
                type="button"
                onClick={() => onLogin(mockStudents[0], "admin")}
                className="flex-1 min-w-[100px] py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-black text-xs rounded-xl transition border border-emerald-100 cursor-pointer active:scale-95 min-h-[40px] flex items-center justify-center"
              >
                مدیر تستی
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
