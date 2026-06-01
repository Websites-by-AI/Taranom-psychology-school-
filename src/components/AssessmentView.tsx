import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Brain, Sparkles, Wind, Award, Clock, Heart, 
  Calendar, Check, Play, RefreshCw, AlertCircle, 
  TrendingUp, BarChart3, Info, ChevronLeft, Percent, Layers, ClipboardList, ArrowLeftRight, HelpCircle,
  UserPlus, Home, GraduationCap, Target
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Student, Exam } from "../types";
import { addSystemLog } from "../lib/syslogs";

interface AssessmentViewProps {
  student: Student;
  onNavigateChange?: (view: string) => void;
}

interface PsychologyReport {
  id: string;
  date: string;
  cognitiveProfile: {
    focusIndex: number;
    resilience: number;
    academicDrive: number;
    stamina: number;
    anxietyManagement: number;
    sleepEfficacy: number;
  };
  stressLevel: number;
  diagnosis: string;
  cognitiveTrap: string;
  remedies: string[];
  meditationAdvice: string;
  breathingPaceSec: number;
}

export default function AssessmentView({ student, onNavigateChange }: AssessmentViewProps) {
  const [activeTab, setActiveTab] = useState<"exam-diagnostic" | "ai-synthesis" | "breathing" | "smart-profile">("exam-diagnostic");

  // Get the latest mock exam based on student's field
  const latestExam: Exam = useMemo(() => {
    if (student.field === "riazi") {
      return {
        id: "4",
        date: "۲۵ خرداد ۱۴۰۵",
        title: "آزمون جامع نهایی شبیه‌ساز کنکور سراسری ریاضی",
        traz: 6180,
        rank: 890,
        overallPercentage: 74,
        lessons: [
          { lessonName: "حسابان و ریاضیات", percentage: 55, correct: 22, wrong: 8, empty: 10 },
          { lessonName: "هندسه و گسسته", percentage: 65, correct: 26, wrong: 6, empty: 8 },
          { lessonName: "فیزیک تخصصی", percentage: 72, correct: 29, wrong: 5, empty: 6 },
          { lessonName: "شیمی تخصصی", percentage: 85, correct: 34, wrong: 2, empty: 4 }
        ]
      };
    } else if (student.field === "ensani") {
      return {
        id: "4",
        date: "۲۵ خرداد ۱۴۰۵",
        title: "آزمون جامع نهایی شبیه‌ساز کنکور سراسری انسانی",
        traz: 6180,
        rank: 890,
        overallPercentage: 74,
        lessons: [
          { lessonName: "جامعه‌شناسی", percentage: 55, correct: 22, wrong: 8, empty: 10 },
          { lessonName: "ادبیات فارسی تخصصی", percentage: 65, correct: 26, wrong: 6, empty: 8 },
          { lessonName: "عربی تخصصی", percentage: 72, correct: 29, wrong: 5, empty: 6 },
          { lessonName: "فلسفه و منطق", percentage: 85, correct: 34, wrong: 2, empty: 4 },
          { lessonName: "روان‌شناسی", percentage: 92, correct: 37, wrong: 1, empty: 2 }
        ]
      };
    } else {
      // tajrobi
      return {
        id: "4",
        date: "۲۵ خرداد ۱۴۰۵",
        title: "آزمون جامع نهایی شبیه‌ساز کنکور سراسری تجربی",
        traz: 6180,
        rank: 890,
        overallPercentage: 74,
        lessons: [
          { lessonName: "زیست‌شناسی", percentage: 55, correct: 22, wrong: 8, empty: 10 },
          { lessonName: "شیمی", percentage: 65, correct: 26, wrong: 6, empty: 8 },
          { lessonName: "فیزیک", percentage: 72, correct: 29, wrong: 5, empty: 6 },
          { lessonName: "ریاضیات تجربی", percentage: 85, correct: 34, wrong: 2, empty: 4 },
          { lessonName: "زمین‌شناسی", percentage: 92, correct: 37, wrong: 1, empty: 2 }
        ]
      };
    }
  }, [student.field]);

  // Derived psychological scores based on latest exam metrics
  const derivedParams = useMemo(() => {
    const totalCorrect = latestExam.lessons.reduce((sum, l) => sum + l.correct, 0);
    const totalWrong = latestExam.lessons.reduce((sum, l) => sum + l.wrong, 0);
    const totalEmpty = latestExam.lessons.reduce((sum, l) => sum + l.empty, 0);
    const totalQuestions = totalCorrect + totalWrong + totalEmpty || 1;

    const wrongRatio = totalWrong / totalQuestions;
    const emptyRatio = totalEmpty / totalQuestions;

    // Anxiety of Exam (0 to 10 scale): driven by wrong answers (negative marking) and general accuracy
    const anxietyScore = Math.min(10, Math.max(1, Math.round(wrongRatio * 20 + 2)));

    // Focus Score (1 to 10 scale): driven by overall percentage
    const focusScore = Math.min(10, Math.max(1, Math.round(latestExam.overallPercentage / 10)));

    // Perfectionism score (avoidance vs wrong answers): a lot of unattempted questions indicate high perfectionism/fear of negative mark
    const perfectionismScore = Math.min(10, Math.max(1, Math.round(emptyRatio * 22 + 2)));

    // Stamina/Mental endurance: drops or issues in analytical/last exams lessons
    const harderLesson = latestExam.lessons.find(l => l.lessonName.includes("ریاضی") || l.lessonName.includes("شیمی") || l.lessonName.includes("فلسفه"));
    const harderPercentage = harderLesson ? harderLesson.percentage : latestExam.overallPercentage;
    const staminaScore = Math.min(10, Math.max(1, Math.round(harderPercentage / 10)));

    return {
      anxiety: anxietyScore,
      focus: focusScore,
      perfectionism: perfectionismScore,
      sleep: 6, // general night recovery baseline
      stamina: staminaScore,
      totalCorrect,
      totalWrong,
      totalEmpty,
      totalQuestions
    };
  }, [latestExam]);

  // Assessment question states initialized precisely with derived values
  const [qAnxiety, setQAnxiety] = useState(derivedParams.anxiety);
  const [qFocus, setQFocus] = useState(derivedParams.focus);
  const [qPerfectionism, setQPerfectionism] = useState(derivedParams.perfectionism);
  const [qSleep, setQSleep] = useState(derivedParams.sleep);
  const [qStamina, setQStamina] = useState(derivedParams.stamina);

  // Life Context States
  const [city, setCity] = useState(student.city || "تهران");
  const [familyContext, setFamilyContext] = useState(student.familyContext || "حمایت متوسط");
  const [financialStatus, setFinancialStatus] = useState<"good" | "limited" | "challenging">(student.financialStatus || "limited");
  const [mainGoal, setMainGoal] = useState(student.mainGoal || "رتبه برتر کنکور");

  // Sync state if student/field/latestExam changes
  useEffect(() => {
    setQAnxiety(derivedParams.anxiety);
    setQFocus(derivedParams.focus);
    setQPerfectionism(derivedParams.perfectionism);
    setQSleep(derivedParams.sleep);
    setQStamina(derivedParams.stamina);
  }, [derivedParams]);

  const [loading, setLoading] = useState(false);
  const [currentReport, setCurrentReport] = useState<PsychologyReport | null>(null);
  const [reports, setReports] = useState<PsychologyReport[]>([]);

  // Breathing Chamber States
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale" | "rest">("inhale");
  const [breathTimer, setBreathTimer] = useState(4);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthIntervalRef = useRef<any>(null);

  // Initialize and load historical reports from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`taranom_psychology_reports_${student.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setReports(parsed);
        if (parsed.length > 0) {
          setCurrentReport(parsed[0]);
        }
      } catch (err) {
        console.error("Error loading historical reports", err);
      }
    } else {
      // Standard static starting report customized for latest exam
      const initialReport: PsychologyReport = {
        id: "PSY-942",
        date: "۱۴۰۶/۰۳/۰۴",
        cognitiveProfile: {
          focusIndex: derivedParams.focus * 10,
          resilience: Math.round((10 - derivedParams.anxiety) * 5 + derivedParams.stamina * 5),
          academicDrive: 84,
          stamina: derivedParams.stamina * 10,
          anxietyManagement: Math.round((10 - derivedParams.anxiety) * 10),
          sleepEfficacy: 65
        },
        stressLevel: Math.min(95, Math.max(15, Math.floor((derivedParams.anxiety * 4 + derivedParams.perfectionism * 3 + (10 - 6) * 3)))),
        diagnosis: `بر اساس آخرین نتایج شبیه‌ساز کنکور (${latestExam.title})، به علت وجود تله‌های منفی و غلط‌ های تکراری در دروس گلوگاهی، تنش کنکور داوطلب در کانون توجه شیفت عصرگاهی قرار دارد.`,
        cognitiveTrap: derivedParams.anxiety > 6 ? "تله شتاب‌زدگی و عجله در انتخاب گزینه‌های همسان" : "تله بیش‌پردازش شناختی (وسواس نزده‌ها)",
        remedies: [
          `اصلاح تله پاسخ‌های منفی در درس ${latestExam.lessons[0]?.lessonName || "زیست‌شناسی"} از طریق پاسخ‌دهی با کانون تمرکز پومودورو ۲۵ دقیقه‌ای.`,
          "پیاده‌سازی الگوریتم عبور از تست‌های شک‌دار در شیفت‌های تمرینی عصر.",
          "تثبیت روال خواب شبانه حداقل ۷ ساعت جهت بازیابی سلول‌های حامی حافظه شناختی."
        ],
        meditationAdvice: "روزانه ۲ مرتبه تمرین بیوفیدبک ریتمی ۴ ثانیه دم عمیق - ۴ ثانیه حبس - ۴ ثانیه بازدم.",
        breathingPaceSec: 4
      };
      
      const setupList = [initialReport];
      setReports(setupList);
      setCurrentReport(initialReport);
      localStorage.setItem(`taranom_psychology_reports_${student.id}`, JSON.stringify(setupList));
    }
  }, [student.id, derivedParams, latestExam]);

  // Submit derived or adjusted survey options to backend
  const handleAnalyze = async () => {
    setLoading(true);
    addSystemLog("درخواست پایش عصب‌سنجی از کارنامه", student.name, `ارزیابی روانی مبتنی بر کارنامه تراز ${latestExam.traz} آغاز شد.`);

    try {
      const response = await fetch("/api/psychology-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student: {
            ...student,
            city,
            familyContext,
            financialStatus,
            mainGoal
          },
          qAnxiety,
          qFocus,
          qPerfectionism,
          qSleep,
          qStamina
        })
      });

      if (!response.ok) {
        throw new Error("سرویس تحلیل هوش مصنوعی موقتا در دسترس نیست.");
      }

      const data = await response.json();
      
      const newReport: PsychologyReport = {
        id: `PSY-${Date.now().toString().slice(-4)}`,
        date: new Date().toLocaleDateString("fa-IR"),
        cognitiveProfile: data.cognitiveProfile,
        stressLevel: data.stressLevel,
        diagnosis: data.diagnosis,
        cognitiveTrap: data.cognitiveTrap,
        remedies: data.remedies,
        meditationAdvice: data.meditationAdvice,
        breathingPaceSec: data.breathingPaceSec || 4
      };

      const updatedHistory = [newReport, ...reports];
      setReports(updatedHistory);
      setCurrentReport(newReport);
      localStorage.setItem(`taranom_psychology_reports_${student.id}`, JSON.stringify(updatedHistory));
      
      addSystemLog("ثبت کارنامه سلامت روانی جدید", student.name, `تحلیل عصب‌شناختی مربی با موفقیت صادر شد. سطح تنش: ${newReport.stressLevel}٪`);
    } catch (err) {
      console.warn("AI psychology service error, using simulated local algorithm:", err);
      
      const stressSim = Math.min(95, Math.max(15, Math.floor((qAnxiety * 4 + qPerfectionism * 3 + (10 - qSleep) * 3))));
      const simulated: PsychologyReport = {
        id: `PSY-OFF-${Date.now().toString().slice(-3)}`,
        date: new Date().toLocaleDateString("fa-IR"),
        cognitiveProfile: {
          focusIndex: Math.round(qFocus * 10),
          resilience: Math.round((10 - qAnxiety) * 5 + qStamina * 5),
          academicDrive: 85,
          stamina: Math.round(qStamina * 10),
          anxietyManagement: Math.round((10 - qAnxiety) * 10),
          sleepEfficacy: Math.round(qSleep * 10)
        },
        stressLevel: stressSim,
        diagnosis: `بر اساس مدل‌های عصب‌شناختی، سطح خستگی کنکور شما معادل ${stressSim}٪ سنجیده می‌شود. بررسی جزئیات غلط‌های آزمون ${latestExam.title} نشان می‌دهد تله‌های انتخابی شما ناشی از شتاب تستی بوده است.`,
        cognitiveTrap: qAnxiety > 6 ? "تله استرس آزمونی و بیش‌فعالی عصب‌های پاسخ موازی." : "تله خستگی مفرط سیستم مربی‌گری شناختی در پارات‌های طولانی.",
        remedies: [
          `تلاش برای بهینه‌سازی درصد درس ${latestExam.lessons[0]?.lessonName || "زیست‌شناسی"} با مهار تله گزینه‌های دام‌دار مربی.`,
          "پیاده‌سازی ۵ دقیقه بازوبند آرامش عضلانی قبل از آزمون بعدی.",
          `تخصیص زمان خواب کافی و پرهیز جدی از بررسی نوسانات پاسخبرگ بعد از ساعت ۲۲:۳۰ شب.`
        ],
        meditationAdvice: "روزانه ۲ مرتبه تمرین تنفس مهارکننده تنش روحی (بیوفیدبک ۴ ثانیه‌ای) را در اتاق سکوت تکرار کنید.",
        breathingPaceSec: 4
      };

      const updatedHistory = [simulated, ...reports];
      setReports(updatedHistory);
      setCurrentReport(simulated);
      localStorage.setItem(`taranom_psychology_reports_${student.id}`, JSON.stringify(updatedHistory));
    } finally {
      setLoading(false);
    }
  };

  // Zen micro audio feedback synthesize
  const startZenSynth = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(130, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.01, ctx.currentTime);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();

      let phaseTicker = 0;
      synthIntervalRef.current = setInterval(() => {
        phaseTicker += 0.25;
        if (ctx.state !== "closed" && osc) {
          const baseFreq = breathPhase === "inhale" ? 132 : breathPhase === "exhale" ? 128 : 130;
          osc.frequency.setTargetAtTime(baseFreq + Math.sin(phaseTicker) * 1.5, ctx.currentTime, 0.4);
          
          let targetGain = 0.015;
          if (breathPhase === "inhale") targetGain = 0.04;
          if (breathPhase === "exhale") targetGain = 0.035;
          if (breathPhase === "hold") targetGain = 0.02;
          gainNode.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.5);
        }
      }, 250);

      (audioCtxRef as any).currentOsc = osc;
      (audioCtxRef as any).currentGain = gainNode;
    } catch (e) {
      console.warn("Web audio blocked or failed", e);
    }
  };

  const stopZenSynth = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    const currentOsc = (audioCtxRef as any).currentOsc;
    const currentGain = (audioCtxRef as any).currentGain;
    try {
      if (currentOsc) {
        currentOsc.stop();
        currentOsc.disconnect();
      }
      if (currentGain) {
        currentGain.disconnect();
      }
    } catch (e) {}
    (audioCtxRef as any).currentOsc = null;
    (audioCtxRef as any).currentGain = null;
  };

  useEffect(() => {
    let interval: any = null;
    if (isBreathingActive) {
      startZenSynth();
      interval = setInterval(() => {
        setBreathTimer((prev) => {
          if (prev <= 1) {
            setBreathPhase((current) => {
              switch (current) {
                case "inhale": return "hold";
                case "hold": return "exhale";
                case "exhale": return "rest";
                default: return "inhale";
              }
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      stopZenSynth();
      setBreathTimer(4);
      setBreathPhase("inhale");
    }

    return () => {
      clearInterval(interval);
      stopZenSynth();
    };
  }, [isBreathingActive, breathPhase]);

  const radarChartData = useMemo(() => {
    if (!currentReport) return [];
    const p = currentReport.cognitiveProfile;
    return [
      { subject: "تمرکز تستی", A: p.focusIndex, fullMark: 100 },
      { subject: "تاب‌آوری روانی", A: p.resilience, fullMark: 100 },
      { subject: "اشتیاق تحصیلی", A: p.academicDrive, fullMark: 100 },
      { subject: "استقامت شیفت عصر", A: p.stamina, fullMark: 100 },
      { subject: "کنترل اضطراب کایزن", A: p.anxietyManagement, fullMark: 100 },
      { subject: "راندمان خواب و مغز", A: p.sleepEfficacy, fullMark: 100 }
    ];
  }, [currentReport]);

  const toPersianNum = (num: number | string) => {
    const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return num.toString().replace(/\d/g, (x) => farsiDigits[parseInt(x)]);
  };

  return (
    <div className="space-y-8 animate-fade-in text-right" id="assessment-view-root" style={{ direction: "rtl" }}>
      {/* Prime Header Block */}
      <div className="bg-gradient-to-l from-slate-900 via-indigo-950 to-indigo-900 text-white p-8 rounded-3xl border border-indigo-950 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden" id="assess-header-layout">
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -top-20 w-60 h-60 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/25 border border-indigo-500/30 text-amber-300 text-xs font-black">
            <Sparkles size={14} className="animate-pulse text-amber-300" />
            <span>نارسایی‌سنجی و پایش روحی جامع</span>
          </div>
          <h1 className="text-3xl font-black font-sans leading-tight">پورتال پایش روان‌شناختی مبتنی بر آخرین کارنامه آزمون</h1>
          <p className="text-xs text-slate-350 font-bold max-w-2xl leading-relaxed">
            این پورتال به طور سیستماتیک تله‌های منفی‌بافی و ترازهای مهارتی شما را ممیزی کرده و با ترکیب نتایج ردیابی آسیب‌های تحصیلی آخرین آزمون ({latestExam.title})، الگوریتم‌های صوتی بیوفیدبک را برای توانمندسازی ذهن شما کالیبره می‌کند.
          </p>
        </div>

        <div className="flex bg-slate-950/80 p-1.5 rounded-2xl border border-indigo-950 w-full md:w-auto relative z-10 text-xs font-black" id="assess-custom-tabs">
          <button
            onClick={() => setActiveTab("exam-diagnostic")}
            className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "exam-diagnostic" ? "bg-indigo-600 text-white shadow-md shadow-indigo-650/10" : "text-slate-450 hover:text-slate-200"
            }`}
          >
            <ClipboardList size={14} />
            <span>آنالیز خطاهای کارنامه</span>
          </button>
          <button
            onClick={() => setActiveTab("ai-synthesis")}
            className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "ai-synthesis" ? "bg-indigo-600 text-white shadow-md shadow-indigo-650/10" : "text-slate-450 hover:text-slate-200"
            }`}
          >
            <Brain size={14} />
            <span>پایش عصب‌شناختی هوشمند</span>
          </button>
          <button
            onClick={() => setActiveTab("breathing")}
            className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "breathing" ? "bg-indigo-600 text-white shadow-md shadow-indigo-650/10" : "text-slate-450 hover:text-slate-200"
            }`}
          >
            <Wind size={14} />
            <span>بیوفیدبک و مهار تنش</span>
          </button>
          <button
            onClick={() => setActiveTab("smart-profile")}
            className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "smart-profile" ? "bg-indigo-600 text-white shadow-md shadow-indigo-650/10" : "text-slate-450 hover:text-slate-200"
            }`}
          >
            <UserPlus size={14} />
            <span>تکمیل شناسنامه هوشمند</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "smart-profile" && (
          <motion.div
            key="smart-profile-tab"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-8"
          >
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl space-y-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
               
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                 <div className="space-y-1">
                   <h2 className="text-xl font-black text-slate-900">تکمیل پروفایل و شناسنامه تحصیلی-روانشناختی</h2>
                   <p className="text-xs text-slate-400 font-bold">دقت در وارد کردن این اطلاعات، دقت تحلیل‌های هوش مصنوعی را تا ۹۵٪ افزایش می‌دهد.</p>
                 </div>
                 <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all">
                   <Check size={16} />
                   <span>ذخیره نهایی تغییرات</span>
                 </button>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                 {/* Left Column: Family & Context */}
                 <div className="space-y-8">
                   <div className="space-y-6">
                     <div className="flex items-center gap-3 text-indigo-600">
                        <Home size={20} />
                        <h3 className="text-sm font-black uppercase tracking-widest">بستر خانواده و محیط زیستی</h3>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">وضعیت تحصیلات پدر</label>
                         <input type="text" defaultValue="کارشناسی ارشد" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/10" />
                       </div>
                       <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">وضعیت تحصیلات مادر</label>
                         <input type="text" defaultValue="دیپلم" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/10" />
                       </div>
                       <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">تعداد فرزندان در منزل</label>
                         <input type="number" defaultValue="2" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/10" />
                       </div>
                       <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">میزان درآمد تقریبی</label>
                         <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold outline-none">
                           <option>متوسط (کارمندی)</option>
                           <option>برخوردار (تجاری)</option>
                           <option>حمایتی</option>
                         </select>
                       </div>
                     </div>
                   </div>

                   <div className="space-y-6">
                     <div className="flex items-center gap-3 text-rose-600">
                        <Heart size={20} />
                        <h3 className="text-sm font-black uppercase tracking-widest">اطلاعات تکمیلی و سلامت روان</h3>
                     </div>
                     <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">سایر داده‌های زمینه‌ای (کمک به مشاور)</label>
                          <textarea rows={3} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold outline-none resize-none" placeholder="مواردی مثل بیماری‌های خاص، شرایط خاص منزل، یا هر موضوعی که مایلید هوش مصنوعی در تحلیل‌هایش لحاظ کند..." />
                        </div>
                     </div>
                   </div>
                 </div>

                 {/* Right Column: Academic & Goals */}
                 <div className="space-y-8">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 text-amber-600">
                          <GraduationCap size={20} />
                          <h3 className="text-sm font-black uppercase tracking-widest">وضعیت تحصیلی و پایه درسی</h3>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">مقطع تحصیلی فعلی</label>
                            <input type="text" defaultValue="پایه دوازدهم (کنکوری)" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/10" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">معدل کتبی نهایی (یا تخمینی)</label>
                            <input type="number" defaultValue="19.45" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/10" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">میانگین ساعت مطالعه روزانه</label>
                            <input type="number" defaultValue="9" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/10" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">تراز هدف شبیه‌ساز</label>
                            <input type="number" defaultValue="8500" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/10" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-3 text-purple-600">
                          <Target size={20} />
                          <h3 className="text-sm font-black uppercase tracking-widest">اهداف، چشم‌انداز و انتظارات</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">هدف و رویای شخصی شما</label>
                          <textarea rows={2} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold outline-none resize-none" defaultValue="قبولی در رشته دندانپزشکی دانشگاه علوم پزشکی شهید بهشتی و مهاجرت تحصیلی در آینده" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">انتظارات و آرزوی خانواده برای شما</label>
                          <textarea rows={2} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold outline-none resize-none" defaultValue="پدرم آرزو دارد من به عنوان یک پزشک موفق در شهر خودمان خدمت کنم." />
                        </div>
                      </div>
                    </div>
                 </div>
               </div>

               <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 flex items-center gap-4 relative z-10">
                  <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm">
                    <Sparkles size={20} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-indigo-900">پیشنهاد هوش مصنوعی ترنم مهر:</h4>
                    <p className="text-[10px] text-indigo-700 font-bold leading-relaxed">با توجه به معدل ۱۹.۴۵ شما و هدف دندانپزشکی شهید بهشتی، پیشنهاد می‌شود روی مباحث زمین‌شناسی و زیست‌شناسی گیاهی تمرکز بیشتری بگذارید تا تراز هدف ۸۵۰۰ محقق شود.</p>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
        {activeTab === "exam-diagnostic" && (
          <motion.div
            key="exam-diagnostic-tab"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Exam Summary details */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-6 flex flex-col justify-between" id="metric-exam-card">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-950 border-b border-slate-100 pb-3">
                  <ClipboardList size={18} className="text-indigo-600" />
                  <h2 className="text-sm font-black">شناسنامه عارضه‌یابی آخرین آزمون آزمایشی</h2>
                </div>

                <div className="p-4 bg-gradient-to-br from-indigo-50/50 to-blue-50/20 rounded-2xl border border-indigo-100/30 space-y-3">
                  <span className="text-[10px] bg-indigo-100 text-indigo-750 font-black px-2 py-0.5 rounded-full inline-block">آخرین کارنامه ثبت‌شده در سیستم</span>
                  <h3 className="text-sm font-black text-slate-850 leading-relaxed font-sans">{latestExam.title}</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-150 font-bold text-slate-600">
                    <div>تاریخ برگزاری: <span className="text-indigo-950 font-black">{latestExam.date}</span></div>
                    <div>تراز کسب شده: <span className="text-emerald-600 font-extrabold tracking-tight">{toPersianNum(latestExam.traz)}</span></div>
                    <div>رتبه کشوری: <span className="text-indigo-950 font-black">{toPersianNum(latestExam.rank)}</span></div>
                    <div>میانگین درصد کل: <span className="text-indigo-950 font-black">{toPersianNum(latestExam.overallPercentage)}٪</span></div>
                  </div>
                </div>

                {/* Behavioral indicators derived from this scorecard */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                    <Info size={14} className="text-emerald-500" />
                    <span>سنجش‌های رفتاری تخمین‌زده شده از پاسخبرگ:</span>
                  </h3>

                  <div className="grid grid-cols-1 gap-2.5">
                    <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center text-xs font-bold text-slate-650">
                      <span>پاسخ‌های صحیح (منجر به ارتقای تراز):</span>
                      <span className="text-emerald-600 font-black px-2 py-0.5 bg-emerald-50 rounded-lg">{toPersianNum(derivedParams.totalCorrect)} تست</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center text-xs font-bold text-slate-650">
                      <span>خطاهای منفی (تله شتاب‌زدگی و عجله تستی):</span>
                      <span className="text-rose-600 font-black px-2 py-0.5 bg-rose-50 rounded-lg">{toPersianNum(derivedParams.totalWrong)} تست غلط</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center text-xs font-bold text-slate-650">
                      <span>تست‌های بدون پاسخ (وسواس فکری و مهار ریسک):</span>
                      <span className="text-amber-600 font-black px-2 py-0.5 bg-amber-50 rounded-lg">{toPersianNum(derivedParams.totalEmpty)} تست نزده</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seamless Action Link to Psychology */}
              <button
                onClick={() => setActiveTab("ai-synthesis")}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-2xl text-xs font-black transition-all shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles size={14} className="text-amber-300 animate-pulse" />
                <span>بارگذاری پارامترها و همگام‌سازی با هوش روانشناسی</span>
              </button>
            </div>

            {/* Visual detailed logs and lesson tables for diagnostic */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-indigo-950 flex items-center gap-2">
                  <BarChart3 size={15} className="text-indigo-650" />
                  <span>ماتریس خطاها و ممیزی نمرات به تفکیک عنوان درسی</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-400">STATUS: AUDITED</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-black text-[10px]">
                      <th className="pb-3 pr-2">عنوان درس تخصصی</th>
                      <th className="pb-3 text-center">میزان درصد</th>
                      <th className="pb-3 text-center">پاسخ صحیح</th>
                      <th className="pb-3 text-center">غلط (نمره منفی)</th>
                      <th className="pb-3 text-center">سفید (نزده)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestExam.lessons.map((lesson, idx) => {
                      const totalSub = lesson.correct + lesson.wrong + lesson.empty || 1;
                      const wrongRatioSub = lesson.wrong / totalSub;
                      const isHighAnxiety = wrongRatioSub > 0.15;
                      
                      return (
                        <tr key={idx} className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/40 transition">
                          <td className="py-3.5 pr-2">
                            <div className="flex items-center gap-2 font-black text-slate-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                              <span>{lesson.lessonName}</span>
                            </div>
                          </td>
                          <td className="py-3.5 text-center font-extrabold text-slate-900 tracking-tight">
                            {toPersianNum(lesson.percentage)}٪
                          </td>
                          <td className="py-3.5 text-center font-black text-emerald-600">
                            {toPersianNum(lesson.correct)}
                          </td>
                          <td className="py-3.5 text-center font-black text-rose-600">
                            <div className="inline-flex gap-1 items-center justify-center">
                              <span>{toPersianNum(lesson.wrong)}</span>
                              {isHighAnxiety && (
                                <span className="text-[8px] px-1 py-0.5 rounded bg-rose-50 text-rose-500 font-black animate-pulse">تنش بالا</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 text-center font-black text-slate-500">
                            {toPersianNum(lesson.empty)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Informative advice about correction */}
              <div className="p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100/45 text-[10px] font-semibold text-slate-600 leading-relaxed">
                <span className="text-emerald-800 font-black flex items-center gap-1.5 mb-1 text-xs">
                  <Wind size={13} className="text-emerald-600 animate-spin" />
                  <span>آسیب‌شناسی مشاور داوطلبان ترنم مهر:</span>
                </span>
                خطاهای منفی و غلط‌های درسی شما به شدت ریشه در استرس جلسه آزمون و وسواس ذهنی روی گزینه‌های نزدیک به هم دارد. تحلیل هوش مصنوعی زیر به شما کمک خواهد کرد با تنظیم بهینه فواصل مطالعاتی و تنفس عضلانی، این خطاها را تا ۷۰ درصد در شبیه‌ساز بعدی برطرف سازید.
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "ai-synthesis" && (
          <motion.div
            key="ai-synthesis-tab"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Adjustable sliders initialized from exam derived metrics */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-6" id="life-context-widget">
                <div className="flex items-center gap-2 text-indigo-950 border-b border-slate-100 pb-3">
                  <Layers size={18} className="text-emerald-600" />
                  <h2 className="text-sm font-black">پروفایل زیست‌محیطی داوطلب</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500">🏙️ شهر محل سکونت</label>
                    <input 
                      type="text" value={city} onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500">🏠 جو خانواده و حمایت</label>
                    <input 
                      type="text" value={familyContext} onChange={(e) => setFamilyContext(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500">💰 وضعیت اقتصادی و مالی</label>
                    <select 
                      value={financialStatus} onChange={(e) => setFinancialStatus(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer"
                    >
                      <option value="good">مناسب و تامین</option>
                      <option value="limited">محدود و نیازمند مدیریت</option>
                      <option value="challenging">دشوار و پرچالش</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500">🎯 هدف غایی (رویای شما)</label>
                    <input 
                      type="text" value={mainGoal} onChange={(e) => setMainGoal(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-6" id="survey-calibration-widget">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-950 border-b border-slate-100 pb-3">
                  <Brain size={18} className="text-indigo-600" />
                  <h2 className="text-sm font-black">کالیبراسیون شاخص‌های عصبی کارنامه</h2>
                </div>
                <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                  این پرسشنامه براساس اطلاعات عینی کارنامه شما کالیبره شده است. در صورت تمایل می‌توانید پارامترها را مجدداً تصحیح کنید تا آنالیز دقیق‌تری متناسب با شرایط فیزیکی شما صادر شود.
                </p>

                {/* Slider 1 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-black">
                    <span className="text-slate-700">اضطراب و استرس جلسه آزمون آزمایشی</span>
                    <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg">{toPersianNum(qAnxiety)} از ۱۰</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" 
                    value={qAnxiety} 
                    onChange={(e) => setQAnxiety(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                {/* Slider 2 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-black">
                    <span className="text-slate-700">توان تمرکز مستمر (دیپ پومودورو)</span>
                    <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{toPersianNum(qFocus)} از ۱۰</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" 
                    value={qFocus} 
                    onChange={(e) => setQFocus(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                {/* Slider 3 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-black">
                    <span className="text-slate-700">کمال‌گرایی منفی (وسواس زمان‌سنجی تستی)</span>
                    <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">{toPersianNum(qPerfectionism)} از ۱۰</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" 
                    value={qPerfectionism} 
                    onChange={(e) => setQPerfectionism(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                {/* Slider 4 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-black">
                    <span className="text-slate-700">کیفیت خواب و ریکاوری شبانه عصب</span>
                    <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">{toPersianNum(qSleep)} از ۱۰</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" 
                    value={qSleep} 
                    onChange={(e) => setQSleep(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                {/* Slider 5 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-black">
                    <span className="text-slate-700">مقاومت بدنی و ذهنی دهر شیفت بعد از ظهر</span>
                    <span className="text-violet-600 bg-violet-50 px-2 py-0.5 rounded-lg">{toPersianNum(qStamina)} از ۱۰</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" 
                    value={qStamina} 
                    onChange={(e) => setQStamina(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>
            </div>

            <button
              _id="btn-calibration-assess"
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white py-3.5 rounded-2xl text-xs font-black transition-all shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>کلاسیفایر هوش مصنوعی در حال اجرای تحلیل...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="text-amber-400" />
                    <span>اجرای دایاکتولوژی عصب‌شناختی هوشمند</span>
                  </>
                )}
              </button>
            </div>

            {/* Response Section */}
            <div className="lg:col-span-8 space-y-6">
              {currentReport ? (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Gauge Card: Stress & Burnout Metric */}
                  <div className="md:col-span-5 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between items-center text-center">
                    <div className="w-full flex justify-between items-center border-b border-slate-100 pb-3">
                      <h3 className="text-xs font-black text-slate-700">سطح کل تنش و فرسودگی</h3>
                      <span className="text-[10px] font-black text-slate-400">شناسه: {currentReport.id}</span>
                    </div>

                    <div className="my-6 relative flex items-center justify-center">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="52" stroke="#f1f5f9" strokeWidth="10" fill="transparent" />
                        <circle 
                          cx="64" cy="64" r="52" 
                          stroke={currentReport.stressLevel > 70 ? "#ef4444" : currentReport.stressLevel > 45 ? "#f97316" : "#10b981"} 
                          strokeWidth="10" fill="transparent" 
                          strokeDasharray={2 * Math.PI * 52}
                          strokeDashoffset={2 * Math.PI * 52 * (1 - currentReport.stressLevel / 100)}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute text-center">
                        <span className="text-3xl font-black text-slate-800 tracking-tighter">{toPersianNum(currentReport.stressLevel)}٪</span>
                        <p className="text-[9px] font-black text-slate-400 mt-0.5">بار تنش غشای عصبی</p>
                      </div>
                    </div>

                    <div className="space-y-2 w-full text-right">
                      <div className={`p-3 rounded-2xl text-[11px] font-bold text-center ${
                        currentReport.stressLevel > 70 ? "bg-rose-50 text-rose-700" : currentReport.stressLevel > 45 ? "bg-orange-50 text-orange-700" : "bg-emerald-50 text-emerald-700"
                      }`}>
                        {currentReport.stressLevel > 70 ? "سطح استرس نهایی بحرانی ! احتمال بیش‌ریزی عصبی" : currentReport.stressLevel > 45 ? "استرس بهینه مربی‌گری (یوسترس محرک)" : "بهداشت عالی روان و آرامش پاراسمپاتیکی پایدار"}
                      </div>
                    </div>
                  </div>

                  {/* Multi-axial Radar Chart for Cognitive Competency Indicators */}
                  <div className="md:col-span-7 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <h3 className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                        <Award size={15} className="text-indigo-600" />
                        <span>ماتریس چندمحوری مهارت‌های مهار توجه دپارتمان روان‌سنجی</span>
                      </h3>
                      <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">{currentReport.date}</span>
                    </div>

                    <div className="h-56 mt-4 w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 9, fontWeight: 900 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                          <Radar 
                            name="سطح شناختی" 
                            dataKey="A" 
                            stroke="#4f46e5" 
                            fill="#6366f1" 
                            fillOpacity={0.15} 
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Diagnosis, Cognitive Traps, and AI Remedies Section */}
                  <div className="col-span-12 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <Sparkles size={16} className="text-indigo-600 animate-pulse" />
                      <h4 className="text-xs font-black text-slate-800">تشخیص شناختی بر اساس خطاهای آزمونی</h4>
                    </div>

                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2">
                      <span className="text-[9px] font-black text-indigo-600 tracking-wider">سنتز بالینی مشاور:</span>
                      <p className="text-xs font-semibold leading-relaxed text-slate-700">{currentReport.diagnosis}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Active Cognitive Trap Identifier */}
                      <div className="p-4 rounded-2xl border border-amber-100 bg-amber-50/30 space-y-1.5">
                        <span className="text-[9px] font-black text-amber-600 tracking-wider flex items-center gap-1">
                          <AlertCircle size={10} />
                          <span>تله حسی/شناختی فعال شما:</span>
                        </span>
                        <p className="text-xs font-black text-slate-800">{currentReport.cognitiveTrap}</p>
                      </div>

                      {/* Zen Breathing advice recommendation */}
                      <div className="p-4 rounded-2xl border border-teal-100 bg-teal-50/30 space-y-1.5">
                        <span className="text-[9px] font-black text-teal-600 tracking-wider flex items-center gap-1">
                          <Wind size={10} />
                          <span>پروتکل بیوفیدبک تنفس پیشنهادی:</span>
                        </span>
                        <p className="text-xs font-bold text-slate-700">{currentReport.meditationAdvice}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-slate-500 block">اقدامات درمانی مراحی‌گری کایزن ذهنی:</span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {currentReport.remedies.map((rem, idx) => (
                          <div key={idx} className="p-3 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl relative group transition-all flex gap-2">
                            <span className="font-serif text-xs font-black text-indigo-200">#۰{idx + 1}</span>
                            <p className="text-[10px] text-slate-600 font-bold leading-relaxed">{rem}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}

        {activeTab === "breathing" && (
          <motion.div
            key="breathing-tab"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Visual Centering Pulsing Circle Card */}
            <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between items-center relative overflow-hidden" id="breathing-chamber-widget">
              <div className="flex flex-col items-center text-center space-y-2 w-full border-b border-slate-100 pb-4">
                <span className="text-[9px] font-black text-indigo-600 tracking-widest uppercase">Biofeedback Resonance Chamber</span>
                <h2 className="text-base font-black text-indigo-950 flex items-center gap-1.5 justify-center relative">
                  <Wind size={18} className="text-indigo-500" />
                  <span>محفظه بیوفیدبک و مهار مکرر اضطراب کارنامه</span>
                  <div className="relative group cursor-help ml-1">
                    <HelpCircle size={14} className="text-slate-400 hover:text-indigo-600 transition-colors" />
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-56 p-3 bg-slate-900 text-white text-[10px] rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-xl pointer-events-none">
                      <div className="font-black border-b border-white/10 pb-1.5 mb-1.5 flex items-center gap-1">
                        <Wind size={10} className="text-emerald-400" />
                        تکنیک تنفس ۴-۴-۴-۴ (مربع)
                      </div>
                      <p className="font-bold leading-relaxed text-slate-300">
                        ۱. دم عمیق (۴ ثانیه) <br />
                        ۲. حبس نفس (۴ ثانیه) <br />
                        ۳. بازدم کامل (۴ ثانیه) <br />
                        ۴. مکث و توازن (۴ ثانیه) <br />
                        این ریتم سیستم پاراسمپاتیک را فعال کرده و بلافاصله تراز تمرکز شما را بازیابی می‌کند.
                      </p>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                    </div>
                  </div>
                </h2>
                <p className="text-[10px] text-slate-400 max-w-lg font-bold leading-relaxed">
                  بررسی خطاهای شما در درس {latestExam.lessons[0]?.lessonName} نشان‌دهنده نیاز به یک دوره‌ تنفس بیوفیدبک ۴ ثانیه‌ای بین دروس تخصصی است. لطفاً هدفون خود را متصل کرده و ریتم تنفسی خود را همگام‌ سازید.
                </p>
              </div>

              {/* Pulsing visual core */}
              <div className="my-12 h-64 flex flex-col items-center justify-center relative w-full">
                {/* Secondary outer ripple */}
                <AnimatePresence>
                  {isBreathingActive && (
                    <motion.div 
                      key={breathPhase}
                      initial={{ scale: 0.8, opacity: 0.15 }}
                      animate={{ 
                        scale: breathPhase === "inhale" ? 1.6 : breathPhase === "exhale" ? 0.9 : breathPhase === "hold" ? 1.4 : 0.8,
                        opacity: breathPhase === "hold" ? 0.25 : 0.08
                      }}
                      transition={{ duration: 4, ease: "easeInOut" }}
                      className="absolute w-44 h-44 rounded-full bg-indigo-400 blur-xl pointer-events-none"
                    />
                  )}
                </AnimatePresence>

                {/* Primary breathing orb */}
                <motion.div 
                  animate={{ 
                    scale: !isBreathingActive ? 1 :
                           breathPhase === "inhale" ? 1.45 :
                           breathPhase === "hold" ? 1.45 :
                           breathPhase === "exhale" ? 0.95 : 0.9
                  }}
                  transition={{ duration: 4, ease: "easeInOut" }}
                  className={`w-36 h-36 rounded-full flex flex-col items-center justify-center text-center shadow-2xl relative z-10 select-none transition-colors duration-500 ${
                    !isBreathingActive ? "bg-slate-100 text-slate-500 border border-slate-200" :
                    breathPhase === "inhale" ? "bg-indigo-600 text-white shadow-indigo-600/30" :
                    breathPhase === "hold" ? "bg-teal-600 text-white shadow-teal-500/30" :
                    breathPhase === "exhale" ? "bg-rose-500 text-white shadow-rose-500/30" : "bg-zinc-650 text-white shadow-zinc-500/30"
                  }`}
                >
                  <span className="text-[10px] font-black tracking-widest uppercase opacity-80 block mb-1">
                    {!isBreathingActive ? "آماده حرکت" :
                     breathPhase === "inhale" ? "دم عمیق" :
                     breathPhase === "hold" ? "حبس نفس" :
                     breathPhase === "exhale" ? "بازدم عمیق" : "مکث و توازن"}
                  </span>
                  
                  <span className="text-3xl font-black font-sans leading-none block tracking-tighter">
                    {breathTimer}
                  </span>
                  
                  <span className="text-[9px] font-bold block mt-1 opacity-70">ثانیه</span>
                </motion.div>
              </div>

              {/* Action State buttons */}
              <div className="flex gap-4 w-full justify-center">
                <button
                  onClick={() => setIsBreathingActive(!isBreathingActive)}
                  className={`px-8 py-3.5 rounded-full text-xs font-black transition-all cursor-pointer shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
                    isBreathingActive ? "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-650/20" : "bg-indigo-600 text-white hover:bg-indigo-400 shadow-indigo-600/20"
                  }`}
                >
                  {isBreathingActive ? (
                    <>
                      <span>توقف ریتم بیوفیدبک</span>
                    </>
                  ) : (
                    <>
                      <Play size={14} fill="currentColor" />
                      <span>شروع همگام‌ساز تنفس</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Instruction Manual on Biofeedback Breathing dynamics */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4 text-right justify-between flex flex-col">
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Info size={16} className="text-teal-600" />
                  <h3 className="text-xs font-black text-indigo-950">مکانیسم بیولوژیکی ریتد تنفس ۴تایی</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-indigo-50/50 rounded-2xl flex gap-3 items-center border border-indigo-100/30">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-serif flex items-center justify-center text-[10px] font-black">۱</span>
                    <div>
                      <span className="text-xs font-black text-slate-800 block">گام اول: دم (Inhale) - ۴ ثانیه</span>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">اکسیژن‌ رسانی ریوی و افزایش آرامش آلومین سلول‌های حامی غشا.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-teal-50/50 rounded-2xl flex gap-3 items-center border border-teal-100/30">
                    <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-serif flex items-center justify-center text-[10px] font-black">۲</span>
                    <div>
                      <span className="text-xs font-black text-slate-800 block">گام دوم: حبس نفس (Hold) - ۴ ثانیه</span>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5 font-sans">تعادل میزان دی‌اکسید کربن خون و کاهش ضربان عصب.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-rose-50/50 rounded-2xl flex gap-3 items-center border border-rose-100/30">
                    <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-serif flex items-center justify-center text-[10px] font-black">۳</span>
                    <div>
                      <span className="text-xs font-black text-slate-800 block">گام سوم: بازدم (Exhale) - ۴ ثانیه</span>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">خروج کامل گازهای حبس شده و آرامش ماهیچه‌های دور جمجمه.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-50/55 rounded-2xl flex gap-3 items-center border border-zinc-150">
                    <span className="w-6 h-6 rounded-full bg-zinc-650 text-white font-serif flex items-center justify-center text-[10px] font-black">۴</span>
                    <div>
                      <span className="text-xs font-black text-slate-800 block">گام چهارم: مکث و توازن (Rest) - ۴ ثانیه</span>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">ایجاد تنفس تعادلی هماهنگ پیش از ورود به چرخه دم جدید.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
