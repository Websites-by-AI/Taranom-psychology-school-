import { useState, useEffect } from "react";
import { 
  Sparkles, Calendar, TrendingUp, AlertTriangle, CheckSquare, Target, 
  Quote, ChevronLeft, Zap, Smile, HeartPulse, Brain, Compass, BookOpen, Clock, Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Student, Weakness, DailyPlan } from "../types";
import GoalTracker from "./GoalTracker";

interface DashboardViewProps {
  student: Student;
  onNavigate: (view: "report" | "schedule" | "counselor" | "progress") => void;
}

export default function DashboardView({ student, onNavigate }: DashboardViewProps) {
  const [quote, setQuote] = useState("تلاش امروز تو، ترازِ درخشان فرداست. امروز هم با قدرت بجنگ؛ تو لایقِ رتبه‌هایِ رویایی هستی!");
  const [loadingQuote, setLoadingQuote] = useState(true);
  
  // Mood / Mental state interactive manager
  const [userMood, setUserMood] = useState<string | null>(null);
  const [moodAdvice, setMoodAdvice] = useState<string>("");

  const [todayTasks, setTodayTasks] = useState<DailyPlan[]>([
    { day: "امروز", morningPlan: "رفع اشکال جامع مباحث 'تعهدات و ضمان قهری' حقوق مدنی", afternoonPlan: "حل ۴۰ تست شایستگی از کتاب آزمون چتر دانش", totalQuestions: 40, completed: false },
    { day: "امروز", morningPlan: "مطالعه مواعد شکایت از آرا در آیین دادرسی مدنی", afternoonPlan: "حل ۲۵ تست تالیفی استاندارد کانون وکلا", totalQuestions: 25, completed: true }
  ]);

  const mockWeaknesses: Weakness[] = [
    { topic: "عقود معین و ایقاعات (مدنی ۵ و ۶)", subject: "حقوق مدنی", percentage: 25, recommendation: "صفحه ۴۵ کتاب قوانین نموداری چتر دانش؛ حل تست‌های سری دوم", questionsCount: 45, severity: "critical" },
    { topic: "صلاحیت ذاتی و محلی مراجع قضایی", subject: "آیین دادرسی مدنی", percentage: 32, recommendation: "قواعد صلاحیت ذاتی و شایستگی؛ یادگیری از ویدیوهای کارگاهی چتر دانش", questionsCount: 30, severity: "critical" },
    { topic: "مسئولیت تضامنی در اسناد تجاری", subject: "حقوق تجارت", percentage: 41, recommendation: "مرور تطبیقی مواد قانون تجارت و قانون جدید چک؛ ۲۵ تست زمان‌دار", questionsCount: 25, severity: "warning" }
  ];

  // Resilient fetch with exponential backoff retry to guard against startup race conditions
  const fetchWithRetry = async (url: string, options?: RequestInit, retries = 4, delay = 600): Promise<Response> => {
    try {
      const response = await fetch(url, options);
      if (!response.ok && retries > 0 && [500, 502, 503, 504].includes(response.status)) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 1.5);
      }
      return response;
    } catch (err) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 1.5);
      }
      throw err;
    }
  };

  // Fetch motivational quote on mount
  useEffect(() => {
    let active = true;
    async function fetchQuote() {
      try {
        const res = await fetchWithRetry("/api/motivational");
        if (res.ok) {
          const data = await res.json();
          if (active && data.quote) {
            setQuote(data.quote);
          }
        }
      } catch (err) {
        console.warn("Could not fetch fresh motivational quote, using local offline fallback quote.", err);
      } finally {
        if (active) {
          setLoadingQuote(false);
        }
      }
    }
    fetchQuote();
    return () => {
      active = false;
    };
  }, []);

  const handleMoodSelect = (mood: string) => {
    setUserMood(mood);
    switch (mood) {
      case "energetic":
        setMoodAdvice("🔥 عالیه قهرمان! این انرژی بالا فوق‌العاده‌ست. امروز از این فرصت طلایی استفاده کن و سخت‌ترین و چالش‌برانگیزترین مسائل حقوق مدنی و آیین دادرسی را با تست‌های زمان‌دار حل کن.");
        break;
      case "tired":
        setMoodAdvice("🥱 خستگی کاملاً طبیعیه و بخشی از مسیر رشده. امروز اصلاً به مغزت فشار صددرصدی نیار. قانون پومودورو (۲۵ دقیقه مطالعه قوانین خاص، ۵ دقیقه استراحت کامل) رو پیاده کن و روی تست‌های آموزشی بدون زمان تمرکز کن.");
        break;
      case "stressed":
        setMoodAdvice("😰 استرس نشونه اینه که به هدفت اهمیت میدی. نگران نباش! همین الان چشمات رو ببند، ۳ نفس عمیق شکمی بکش، تایمر رو متوقف کن و فقط روی حل ۵ تست ساده‌تر قانون تجارت تمرکز کن تا ترست بریزه.");
        break;
      case "focused":
        setMoodAdvice("🎯 تمرکزت عالیه! بزرگترین سرمایه‌ت حضور ذهن توئه. پیشنهاد می‌کنم فصل‌های بحرانی مثل 'عقود معین' یا 'مواعد آیین دادرسی' رو جلو ببری و نکات کلیدی را در کتاب قوانین نموداری خلاصه نویسی کنی.");
        break;
      default:
        setMoodAdvice("");
    }
  };

  const toggleTask = (index: number) => {
    const updated = [...todayTasks];
    updated[index].completed = !updated[index].completed;
    setTodayTasks(updated);
  };

  const totalTasksCount = todayTasks.length;
  const completedTasksCount = todayTasks.filter(t => t.completed).length;
  const taskProgressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <div className="space-y-6" id="dashboard-view-container">
      
      {/* Prime Header Dashboard Welcomer */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-50/40 rounded-full blur-2xl pointer-events-none" />
        
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-50 text-blue-800 text-[10px] font-black rounded-full border border-blue-100 animate-pulse">
              پنل بهسازی علمی فعال است ⚡
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-[11px] text-slate-500 font-semibold">
              {student.field === "bar_exam" ? "داوطلب آزمون وکالت" : student.field === "judiciary" ? "داוطلب قضاوت" : student.field === "notary" ? "داوطلب سردفتری" : "داوطلب ارشد حقوق"}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
            سلام، {student.name} عزیز؛ وقت درخشش توئه! 👋
          </h1>
          <p className="text-xs text-slate-500">
            بر اساس تحلیل هوش مصنوعی آزمون‌های مکاتبی چتر دانش، مسیر رشد شما با دقت ۹۸.۴٪ نقشه‌برداری شده است.
          </p>
        </div>

        <div className="flex gap-2 relative z-10">
          <button 
            onClick={() => onNavigate("report")}
            className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-sm cursor-pointer"
          >
            آخرین تحلیل کارنامه
          </button>
          <button 
            onClick={() => onNavigate("counselor")}
            className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-xl text-xs font-bold border border-blue-100 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            گفتگو با پشتیبان AI
          </button>
        </div>
      </div>

      {/* Dynamic Motivational Quote featuring deep beautiful mesh background */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-indigo-950/20"
        id="motivational-banner"
      >
        <div className="absolute right-0 top-0 bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 text-white/[0.04] rotate-12 pointer-events-none">
          <Quote size={240} />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 bg-amber-400/10 text-amber-300 border border-amber-400/20 rounded-lg text-[9px] font-black tracking-wider flex items-center gap-1 uppercase">
                <Sparkles size={11} className="text-amber-400 animate-spin-slow" />
                <span>رهنمود انگیزشی هوشمند چتر دانش</span>
              </span>
            </div>
            
            <h2 className="text-base md:text-lg font-bold text-slate-100 leading-relaxed font-sans first-letter:capitalize">
              {loadingQuote ? (
                <span className="inline-block h-4 w-48 bg-white/20 animate-pulse rounded"></span>
              ) : (
                `« ${quote} »`
              )}
            </h2>
            
            <p className="text-[11px] text-indigo-200">صادر شده بر مبنای آخرین مخزن پاسخ‌برگ شما و هدف‌گذاری هوش سنج چتر دانش</p>
          </div>

          <div className="flex-shrink-0 bg-white/5 border border-white/10 rounded-2xl p-4 w-full lg:w-80 backdrop-blur-sm space-y-3">
            <h3 className="text-[11px] font-black text-amber-300 flex items-center gap-1.5 justify-start">
              <HeartPulse size={12} />
              <span>پایش اتمسفر روانی - حس امروزت چیه؟</span>
            </h3>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: "energetic", icon: "⚡", label: "عالی" },
                { id: "tired", icon: "🥱", label: "خسته" },
                { id: "focused", icon: "🎯", label: "تمرکز" },
                { id: "stressed", icon: "😰", label: "مضطرب" }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleMoodSelect(m.id)}
                  type="button"
                  className={`py-1.5 px-1 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center gap-1 border ${
                    userMood === m.id
                      ? "bg-amber-450 border-amber-400 text-slate-950 font-extrabold scale-105"
                      : "bg-white/5 border-white/5 hover:bg-white/10 text-slate-350"
                  }`}
                >
                  <span className="text-base">{m.icon}</span>
                  <span className="text-[9px]">{m.label}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {userMood && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="bg-indigo-950/70 border border-indigo-400/15 p-2.5 rounded-xl text-[10px] text-indigo-100 leading-relaxed text-right"
                >
                  {moodAdvice}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Metrics Cards Grid - Ultra Slick Redesigned */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="metrics-grid">
        
        {/* Traz Score Metric Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between h-[152px]" id="metric-traz">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 block pb-0.5">پایه کنجکاوی و تراز سنجی</span>
              <p className="text-sm font-black text-slate-700">برآورد کلان تراز چتر دانش</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center transition-transform group-hover:scale-110">
              <TrendingUp size={24} />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-2 border-t border-slate-100/60">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-800 font-mono">۵,۵۷۵</span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">▲ ۱۲۸+</span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold">آخرین آزمون سراسری</span>
          </div>
        </div>

        {/* Avg Correct Percentage Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between h-[152px]" id="metric-percentage">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 block pb-0.5">تصحیح و پردازش پاسخ‌ها</span>
              <p className="text-sm font-black text-slate-700">میانگین تصحیح درصدها</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center transition-transform group-hover:scale-110">
              <Target size={24} />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-2 border-t border-slate-100/60">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-800 font-mono">۵۹٪</span>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">هدف لایق: ۶۸٪</span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold text-left">فاصله ۹ پله‌ای</span>
          </div>
        </div>

        {/* Severe Weakness Count Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between h-[152px]" id="metric-weaknesses">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 block pb-0.5">زنجیره‌های آسیب تحصیلی</span>
              <p className="text-sm font-black text-slate-700">نقاط اضطراری و بحرانی</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center transition-transform group-hover:scale-110">
              <AlertTriangle size={24} className="animate-pulse" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-2 border-t border-slate-100/60">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-red-600 font-mono">۳</span>
              <span className="text-[10px] text-slate-505 text-slate-500 font-black mr-1">زیرمبحث آسیب‌زا</span>
            </div>
            <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-md font-bold border border-red-100">اقدام فوری!</span>
          </div>
        </div>

        {/* Study Streak Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between h-[152px]" id="metric-streak">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 block pb-0.5">پایداری کلان تلاش</span>
              <p className="text-sm font-black text-slate-700">پیوستگی روزهای مطالعه</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center transition-transform group-hover:scale-110">
              <Zap size={24} className="text-emerald-600 fill-emerald-100" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-2 border-t border-slate-100/60">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-700 font-mono">۱۴ روز</span>
              <span className="text-[10px] font-black px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">رکورد عالی 🔥</span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold">بدون گسستگی</span>
          </div>
        </div>
      </div>

      {/* Goal Tracking Core Section */}
      <div className="relative">
        <div className="absolute top-0 left-0 bg-blue-100/30 text-blue-900 border border-blue-200/50 py-1 px-3.5 rounded-bl-3xl rounded-tr-3xl text-[9px] font-extrabold z-10 pointer-events-none">
          پروژه رشد همگام چتر دانش
        </div>
        <GoalTracker student={student} />
      </div>

      {/* Two Columns Bento-Grid: Tasks of today & AI weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Today's study list with awesome interactive list style */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between min-h-[500px]" id="today-remedial-tasks-card">
          <div className="space-y-4 flex-1 flex flex-col justify-start">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <CheckSquare size={16} />
                </span>
                <div>
                  <h2 className="text-base font-black text-slate-800">برنامه‌های بهسازی امروز شما</h2>
                  <p className="text-[10px] text-slate-400">رفع ایرادات عمیق علمی شناسایی‌شده توسط هوش مصنوعی</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] bg-slate-50 text-slate-600 font-bold px-2 py-1 rounded-lg border border-slate-100">
                <Brain size={12} className="text-indigo-600" />
                <span>شخصی‌ساز چتر دانش</span>
              </div>
            </div>

            {/* Task Progression Header */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">پیشرفت وظایف امروز شما:</span>
                <span className="font-mono font-black text-blue-900">{completedTasksCount} از {totalTasksCount} مورد ({taskProgressPercent}٪)</span>
              </div>
              <div className="w-full bg-slate-250 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-900 h-full rounded-full transition-all duration-300"
                  style={{ width: `${taskProgressPercent}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              {todayTasks.map((task, idx) => (
                <div 
                  key={idx}
                  onClick={() => toggleTask(idx)}
                  className={`group p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex gap-4 items-start select-none ${
                    task.completed 
                      ? "bg-emerald-50/30 border-emerald-200/80 hover:bg-emerald-50/50" 
                      : "bg-white border-slate-100/90 hover:border-slate-200 hover:shadow-sm"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition duration-150 mt-0.5 ${
                    task.completed 
                      ? "bg-emerald-600 border-emerald-600 text-white" 
                      : "border-slate-350 group-hover:border-blue-900 bg-white"
                  }`}>
                    {task.completed && <Check size={11} strokeWidth={3} />}
                  </div>
                  <div className="flex-1 space-y-1 text-right">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-bold text-sm leading-6 ${task.completed ? "text-slate-400 line-through" : "text-slate-800"}`}>
                        {task.morningPlan}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black border ${
                        task.completed 
                          ? "bg-slate-100 text-slate-400 border-slate-200" 
                          : idx === 0 
                            ? "bg-indigo-50 text-indigo-700 border-indigo-100" 
                            : "bg-amber-50 text-amber-700 border-amber-100"
                      }`}>
                        {idx === 0 ? "🎯 اولویت بحرانی" : "📚 مهارتی"}
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed ${task.completed ? "text-slate-350" : "text-slate-500"}`}>
                      عصر: {task.afternoonPlan} <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-bold">({task.totalQuestions} تست تخصصی)</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ⏱️ Premium Interactive Study Focus Session Logger to eliminate blank spaces */}
            <div className="bg-gradient-to-l from-blue-50/60 to-indigo-50/40 p-4 border border-blue-100/50 rounded-2xl flex items-center justify-between mt-auto">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-slate-700 text-[10px] font-black">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>ثبت مطالعه مداوم امروز</span>
                </div>
                <div className="text-xs font-black text-slate-800">۴ ساعت و ۳۰ دقیقه تمرکز عمیق</div>
                <p className="text-[9px] text-slate-400">پیشرفت روزانه: ۸۰٪ از هدف ۵.۵ ساعته</p>
              </div>
              <button 
                type="button"
                className="px-3 py-1.5 bg-white hover:bg-slate-50 text-blue-950 border border-slate-250 rounded-xl text-[10px] font-extrabold transition shadow-xs cursor-pointer active:scale-95"
                onClick={(e) => {
                  e.stopPropagation();
                  alert("کوشش علمی پیوسته شما ثبت شد! ۱ ساعت با تمرکز طلایی به آمار امروز اصافه گردید.");
                }}
              >
                ⏱️ ثبت ۱ ساعت دیگر
              </button>
            </div>
          </div>

          <button 
            onClick={() => onNavigate("schedule")}
            className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-250 text-slate-700 py-3 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer mt-4 hover:text-slate-900"
          >
            <span>مشاهده و تنظیم برنامه‌ریزی هفتگی هوشمند</span>
            <ChevronLeft size={14} />
          </button>
        </div>

        {/* AI Identified weaknesses list - upgraded visually */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between min-h-[500px]" id="ai-weakness-recs-card">
          <div className="space-y-4 flex-1 flex flex-col justify-start">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-red-50 text-red-600 rounded-xl">
                  <AlertTriangle size={16} />
                </span>
                <div>
                  <h2 className="text-base font-black text-slate-800">نقاط ضعف نیازمند مرمت و مهار</h2>
                  <p className="text-[10px] text-slate-400">مباحث با درصد کاهشی که تراز آزمون چتر دانش شما را تحت شعاع قرار داده‌اند</p>
                </div>
              </div>
              <span className="text-[10px] bg-rose-50 text-rose-600 px-2.5 py-1 rounded-lg font-black border border-rose-150 animate-pulse">
                بررسی فوری
              </span>
            </div>

            <div className="space-y-3">
              {mockWeaknesses.map((weak, idx) => (
                <div key={idx} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/95 hover:border-slate-250 hover:bg-slate-50 transition space-y-2.5 relative">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-black text-indigo-600 block">{weak.subject}</span>
                      <strong className="text-xs font-extrabold text-slate-800 block leading-relaxed">{weak.topic}</strong>
                    </div>
                    <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-lg border ${
                      weak.severity === "critical" 
                        ? "bg-rose-50 text-rose-600 border-rose-100" 
                        : "bg-amber-50 text-amber-600 border-amber-100"
                    }`}>
                      درصد: {weak.percentage}٪
                    </span>
                  </div>
                  
                  {/* Subtle decorative progress representing mastery */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${weak.severity === "critical" ? "bg-red-500" : "bg-amber-500"}`}
                        style={{ width: `${weak.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-400">
                      <span>فهم مبحث: {weak.percentage}٪</span>
                      <span>تراز مفقود شده: ~{100 - weak.percentage * 2}واحد</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-white/70 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-extrabold text-indigo-700">توصیه دکتر کریمی: </span>{weak.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => onNavigate("report")}
            className="w-full bg-blue-900 hover:bg-blue-950 text-white py-3 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer mt-4 hover:scale-[1.01]"
          >
            <span>تحلیل عمیق آزمون و استخراج جزوات رفع اشکال</span>
            <ChevronLeft size={14} />
          </button>
        </div>

      </div>

      {/* Advanced AI Resources & Tips Panel */}
      <div className="bg-gradient-to-l from-indigo-50/50 to-blue-50/50 rounded-3xl p-6 border border-indigo-100/40 grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="flex gap-3.5 items-start">
          <div className="p-3 bg-white text-indigo-700 rounded-2xl shadow-sm border border-slate-100 flex-shrink-0">
            <Compass size={18} />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-black text-slate-800">پشتیبانی همگام ۲۴ ساعته</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              هر زمان حین حل مسائل خسته شدید یا نیاز به توضیح اضافه داشتید، در پنل مشاور پیام بدهید.
            </p>
          </div>
        </div>

        <div className="flex gap-3.5 items-start">
          <div className="p-3 bg-white text-amber-600 rounded-2xl shadow-sm border border-slate-100 flex-shrink-0">
            <BookOpen size={18} />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-black text-slate-800">کتب و جزوات چتر دانش</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              تطابق حداکثری پاسخ‌نماها با خطوط سوالات سراسری و نکات کلیدی برای مهار تله‌های چندگزینه‌ای.
            </p>
          </div>
        </div>

        <div className="flex gap-3.5 items-start">
          <div className="p-3 bg-white text-emerald-600 rounded-2xl shadow-sm border border-slate-100 flex-shrink-0">
            <Clock size={18} />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-black text-slate-800">تکنیک مدیریت زمان دو خودکار</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              برای غلبه بر فشار محدود زمان، مسائل پیشنهادی مباحث ضعیف را یک‌بار بدون زمان و یک‌بار با زمان بزنید.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
