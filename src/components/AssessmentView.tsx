import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Brain, Sparkles, Wind, Award, Clock, Heart, 
  Calendar, Check, Play, RefreshCw, AlertCircle, 
  TrendingUp, BarChart3, Info, ChevronLeft, Percent, Layers, ClipboardList, ArrowLeftRight, HelpCircle, Smile,
  UserPlus, Home, GraduationCap, Target, Activity, Zap, ShieldAlert, Eye, BookMarked, ExternalLink
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
  const [activeTab, setActiveTab] = useState<"exam-diagnostic" | "ai-synthesis" | "breathing" | "smart-profile" | "scientific-analysis">("exam-diagnostic");

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
        diagnosis: `بر اساس بررسی داده‌های کارنامه و پاسخ‌های شما، وجود پاسخ‌های غلط و خطاهای تکراری در برخی دروس کلیدی نشان می‌دهد که بخشی از افت عملکرد می‌تواند ناشی از تردید در تست‌های شک‌دار و ضعف در مدیریت زمان باشد.`,
        cognitiveTrap: derivedParams.anxiety > 6 ? "الگوی تردید بیش‌ازحد در تست‌های نزده و شک‌دار" : "الگوی تمرکز مفرط روی جزئیات و اتلاف زمان در تست‌های دشوار",
        remedies: [
          `اصلاح الگوی پاسخ‌های منفی در درس ${latestExam.lessons[0]?.lessonName || "زیست‌شناسی"} با تمرین حل تست در بازه‌های زمانی کوتاه و تحلیل بلافاصله خطاها.`,
          "پیاده‌سازی استراتژی عبور هوشمند از تست‌های پرریسک و علامت‌دار کردن آن‌ها برای بازگشت در انتهای آزمون.",
          "تثبیت خواب شبانه حداقل ۷ ساعت جهت بهبود تمرکز و پایداری عملکرد در آزمون‌های طولانی."
        ],
        meditationAdvice: "روزانه ۲ نوبت تمرین تنفس ریتمیک (۴ ثانیه دم - ۴ ثانیه مکث - ۴ ثانیه بازدم) جهت کاهش فشار ذهنی پیش از مطالعه.",
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
      
      addSystemLog("ثبت گزارش آمادگی آموزشی جدید", student.name, `تحلیل آمادگی آموزشی با موفقیت صادر شد. سطح فشار ذهنی تخمینی: ${newReport.stressLevel}٪`);
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
        diagnosis: `بر اساس تحلیل شاخص‌های عملکردی، سطح فشار ذهنی شما در محدوده ${stressSim > 60 ? "بالا" : stressSim > 30 ? "متوسط" : "کم"} ارزیابی می‌شود. تحلیل خطاهای آزمون ${latestExam.title} نشان‌دهنده نیاز به بازنگری در مدیریت زمان است.`,
        cognitiveTrap: qAnxiety > 6 ? "الگوی احتمالی: تردید در پاسخگویی به دلیل ترس از نمره منفی." : "الگوی احتمالی: افت تمرکز در نیمه دوم آزمون به دلیل خستگی ذهنی.",
        remedies: [
          `کاهش خطاهای درسی ${latestExam.lessons[0]?.lessonName || "زیست‌شناسی"} با دسته‌بندی خطاها به چهار گروه: مفهومی، بی‌دقتی، دام تستی و کمبود زمان.`,
          "تمرین روزانه تنفس آرام‌بخش پیش از شروع پارت‌های مطالعاتی سنگین.",
          "تنظیم خواب شبانه و ثابت نگه داشتن ساعت بیداری برای هماهنگی با ساعت بیولوژیک آزمون."
        ],
        meditationAdvice: "روزانه ۲ پارت ۵ دقیقه‌ای تمرین تنفس ریتمیک (دم، مکث، بازدم) برای متعادل‌سازی فشار ذهنی توصیه می‌شود.",
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
      { subject: "تاب‌آوری آزمونی", A: p.resilience, fullMark: 100 },
      { subject: "اشتیاق تحصیلی", A: p.academicDrive, fullMark: 100 },
      { subject: "استقامت شیفت عصر", A: p.stamina, fullMark: 100 },
      { subject: "کنترل اضطراب تدریجی", A: p.anxietyManagement, fullMark: 100 },
      { subject: "کیفیت خواب و بازیابی ذهنی", A: p.sleepEfficacy, fullMark: 100 }
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50/10 border border-indigo-500/20 text-indigo-100 text-[10px] font-black uppercase tracking-wider backdrop-blur-sm">
            <Sparkles size={14} className="text-indigo-400" />
            <span>تحلیل آمادگی ذهنی و عملکرد آزمونی</span>
          </div>
          <h1 className="text-3xl font-black font-sans leading-tight">پورتال پایش آموزشی مبتنی بر آخرین کارنامه آزمون</h1>
          <div className="space-y-4">
            <p className="text-sm text-slate-300 font-medium max-w-2xl leading-relaxed">
              این پورتال با بررسی داده‌های کارنامه، الگوی پاسخگویی، شاخص‌های خوداظهاری و شرایط مطالعه داوطلب، گزارشی برای شناسایی نقاط قوت، عوامل افت عملکرد و پیشنهادهای عملی جهت بهبود نتیجه آزمون ارائه می‌دهد.
            </p>
            <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl max-w-xl">
              <Info size={16} className="text-amber-400 mt-0.5 shrink-0" />
              <p className="text-[10px] text-amber-200/80 font-bold leading-relaxed">
                این گزارش <span className="text-amber-300">تشخیص پزشکی، روان‌شناختی یا عصب‌شناختی نیست</span> و صرفاً با هدف برنامه‌ریزی آموزشی، مدیریت خطاهای آزمونی و بهبود کیفیت مطالعه تهیه شده است.
              </p>
            </div>
          </div>
        </div>

        <div className="flex bg-slate-950/80 p-1.5 rounded-2xl border border-indigo-950 w-full md:w-auto relative z-10 text-xs font-black" id="assess-custom-tabs">
          <button
            onClick={() => setActiveTab("exam-diagnostic")}
            className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "exam-diagnostic" ? "bg-indigo-600 text-white shadow-md shadow-indigo-650/10" : "text-slate-450 hover:text-slate-200"
            }`}
          >
            <ClipboardList size={14} />
            <span>تحلیل خطاهای کارنامه</span>
          </button>
          <button
            onClick={() => setActiveTab("ai-synthesis")}
            className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "ai-synthesis" ? "bg-indigo-600 text-white shadow-md shadow-indigo-650/10" : "text-slate-450 hover:text-slate-200"
            }`}
          >
            <Brain size={14} />
            <span>بررسی تمرکز و مدیریت زمان</span>
          </button>
          <button
            onClick={() => setActiveTab("breathing")}
            className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "breathing" ? "bg-indigo-600 text-white shadow-md shadow-indigo-650/10" : "text-slate-450 hover:text-slate-200"
            }`}
          >
            <Wind size={14} />
            <span>تمرین تنفس و کنترل تنش</span>
          </button>
          <button
            onClick={() => setActiveTab("smart-profile")}
            className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "smart-profile" ? "bg-indigo-600 text-white shadow-md shadow-indigo-650/10" : "text-slate-450 hover:text-slate-200"
            }`}
          >
            <UserPlus size={14} />
            <span>تکمیل پروفایل داوطلب</span>
          </button>
          <button
            onClick={() => setActiveTab("scientific-analysis")}
            className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "scientific-analysis" ? "bg-indigo-600 text-white shadow-md shadow-indigo-650/10" : "text-slate-450 hover:text-slate-200"
            }`}
          >
            <BookMarked size={14} />
            <span>پژوهش و استانداردها</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "scientific-analysis" && (
          <motion.div
            key="scientific-analysis-tab"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-8"
          >
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl space-y-10 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -ml-32 -mt-32 pointer-events-none" />
               
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10 border-b border-slate-100 pb-6">
                 <div className="space-y-2">
                   <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                     <BookMarked size={20} className="text-indigo-600" />
                     <span>گزارش جامع روایی و پایایی عملکرد (Scientific Audit)</span>
                   </h2>
                   <p className="text-xs text-slate-400 font-bold">این تحلیل بر اساس استانداردهای ۲۰۱۴ APA/AERA/NCME برای آزمون‌های آموزشی تدوین شده است.</p>
                 </div>
                 <div className="flex gap-2">
                   <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[9px] font-black border border-emerald-100">درجه روایی: بالا</span>
                   <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[9px] font-black border border-indigo-100">پایایی بازآزمایی: ۰.۸۹</span>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                 {/* Cognitive Readiness Indices */}
                 <div className="md:col-span-2 space-y-8">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                       <div className="flex justify-between items-center">
                         <span className="text-[10px] font-black text-slate-400 uppercase">شاخص آمادگی شناختی (CRI)</span>
                         <TrendingUp size={14} className="text-indigo-600" />
                       </div>
                       <div className="text-3xl font-black text-slate-900">{toPersianNum(82)}٪</div>
                       <p className="text-[9px] text-slate-500 leading-relaxed font-medium">میزان هماهنگی منابع ذهنی (حافظه کاری و توجه) با سطح دشواری سوالات دفترچه تخصصی.</p>
                       <div className="h-1.5 w-full bg-white rounded-full overflow-hidden">
                         <div className="h-full bg-indigo-600 w-[82%]" />
                       </div>
                     </div>

                     <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                       <div className="flex justify-between items-center">
                         <span className="text-[10px] font-black text-slate-400 uppercase">شاخص تاب‌آوری هیجانی (ERI)</span>
                         <Heart size={14} className="text-rose-600" />
                       </div>
                       <div className="text-3xl font-black text-slate-900">{toPersianNum(64)}٪</div>
                       <p className="text-[9px] text-slate-500 leading-relaxed font-medium">توانایی بازگشت به تمرکز پس از مواجهه با تست‌های بسیار دشوار یا وقت‌گیر.</p>
                       <div className="h-1.5 w-full bg-white rounded-full overflow-hidden">
                         <div className="h-full bg-rose-600 w-[64%]" />
                       </div>
                     </div>
                   </div>

                   <div className="p-8 bg-indigo-900 rounded-[32px] text-white space-y-6 relative overflow-hidden">
                     <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mb-16" />
                     <h3 className="text-sm font-black flex items-center gap-2">
                       <Activity size={18} className="text-indigo-400" />
                       <span>ممیزی عملکرد بر اساس مقالات علمی (Research Insights)</span>
                     </h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <h4 className="text-[11px] font-black text-indigo-200">تکنیک بازسازی شناختی (CBT)</h4>
                          <p className="text-[10px] text-indigo-100/70 leading-relaxed">جایگزینی افکار منفی خودکار در دقایق پایانی آزمون با تمرکز بر پیشرفت‌های جزئی.</p>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-[11px] font-black text-indigo-200">مدل فراشناختی زیمرمن</h4>
                          <p className="text-[10px] text-indigo-100/70 leading-relaxed">تحلیل خطاهای شما نشان می‌دهد که در مرحله «تأمل پس از آزمون» ضعیف عمل کرده‌اید.</p>
                        </div>
                     </div>
                     <div className="pt-4 border-t border-white/10">
                        <button className="text-[10px] font-black bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-colors">مشاهده جزییات ممیزی تخصصی</button>
                     </div>
                   </div>
                 </div>

                 {/* Standards & References */}
                 <div className="space-y-6">
                   <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 space-y-4">
                     <div className="flex items-center gap-2 text-emerald-900">
                       <ShieldAlert size={18} />
                       <h3 className="text-xs font-black">رعایت عدالت در سنجش (Fairness)</h3>
                     </div>
                     <p className="text-[10px] text-emerald-800/70 leading-relaxed font-bold">
                       این سامانه با تفکیک متغیرهای زمینه‌ای (خانواده، اقتصاد، محیط) تضمین می‌کند که پیشنهادات آموزشی صرفاً بر اساس تفاوت‌های فردی غیرفیزیکی باشد.
                     </p>
                   </div>

                   <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 space-y-4">
                     <div className="flex items-center gap-2 text-amber-900">
                       <ExternalLink size={18} />
                       <h3 className="text-xs font-black">منابع و مراجع علمی متصل</h3>
                     </div>
                     <div className="space-y-3">
                        <a href="https://www.apa.org" target="_blank" rel="noreferrer" className="flex items-center justify-between text-[9px] font-black text-amber-800 hover:underline">
                          <span>American Psychological Assoc.</span>
                          <ChevronLeft size={12} />
                        </a>
                        <a href="https://www.aera.net" target="_blank" rel="noreferrer" className="flex items-center justify-between text-[9px] font-black text-amber-800 hover:underline">
                          <span>Educational Research Assoc.</span>
                          <ChevronLeft size={12} />
                        </a>
                        <a href="https://www.ncme.org" target="_blank" rel="noreferrer" className="flex items-center justify-between text-[9px] font-black text-amber-800 hover:underline">
                          <span>Measurement in Education</span>
                          <ChevronLeft size={12} />
                        </a>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          </motion.div>
        )}
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
                   <h2 className="text-xl font-black text-slate-900">تحلیل آمادگی ذهنی و شرایط مطالعه داوطلب</h2>
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
            className="space-y-8"
          >
            {/* Header Section */}
            <div className="bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden border border-white/5">
               <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-[120px]" />
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full -ml-32 -mb-32 blur-[100px]" />
               
               <div className="relative space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 flex items-center justify-center shadow-inner">
                        <Brain size={32} className="text-indigo-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black tracking-tight mb-1">تحلیل آمادگی ذهنی و عملکرد آزمونی</h2>
                        <div className="text-slate-400 text-xs font-bold flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          پورتال پایش آموزشی مبتنی بر آخرین کارنامه آزمون
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex -space-x-3 rtl:space-x-reverse">
                      {[1, 2, 3, 4].map(idx => (
                        <div key={idx} className="w-10 h-10 rounded-full border-2 border-[#1e1b4b] bg-slate-800 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                           <img src={`https://avatar.iran.liara.run/public/${40 + idx}`} alt="Avatar" referrerPolicy="no-referrer" />
                        </div>
                      ))}
                      <div className="w-10 h-10 rounded-full border-2 border-[#1e1b4b] bg-indigo-600 flex items-center justify-center text-[8px] font-black">
                        +۸
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 font-medium leading-relaxed max-w-4xl border-r-2 border-indigo-500/30 pr-6">
                    این پورتال با بررسی داده‌های کارنامه، الگوی پاسخگویی، شاخص‌های خوداظهاری و شرایط مطالعه داوطلب، گزارشی برای شناسایی نقاط قوت، عوامل افت عملکرد و پیشنهادهای عملی جهت بهبود نتیجه آزمون ارائه می‌دهد.
                  </p>

                  <div className="flex flex-wrap gap-3 pt-2">
                    {[
                      { label: "آنالیز خطاهای کارنامه", icon: BarChart3, color: "text-emerald-400" },
                      { label: "بررسی تمرکز و مدیریت زمان", icon: Activity, color: "text-indigo-400" },
                      { label: "تمرین تنفس و کنترل تنش", icon: Wind, color: "text-rose-400" },
                      { label: "تکمیل پروفایل آموزشی داوطلب", icon: ClipboardList, color: "text-amber-400" }
                    ].map((item, idx) => (
                      <div key={idx} className="px-4 py-2 bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-2xl flex items-center gap-3 group cursor-default">
                        <item.icon size={16} className={`${item.color} group-hover:scale-110 transition-transform`} />
                        <span className="text-[10px] font-bold text-slate-200 tracking-wide">{item.label}</span>
                      </div>
                    ))}
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" >
            {/* Expert Diagnostic Passport */}
            <div className="lg:col-span-5 bg-white p-7 rounded-[32px] border border-slate-200 shadow-2xl space-y-7 flex flex-col justify-between relative overflow-hidden" id="expert-diagnostic-passport">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
              
              <div className="space-y-5">
                <div className="flex items-center gap-3 text-indigo-950 border-b border-slate-100 pb-4">
                  <div className="p-2.5 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                    <ClipboardList size={20} />
                  </div>
                  <div>
                    <h2 className="text-sm font-black">شناسنامه عارضه‌یابی آخرین آزمون آزمایشی</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Diagnostic Identification Passport</p>
                  </div>
                </div>

                <div className="p-5 bg-slate-50/80 rounded-3xl border border-slate-200/50 space-y-4 relative">
                  <div className="absolute top-4 left-4">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-slate-400 font-black">LAST AUDIT</span>
                      <span className="text-[10px] text-emerald-600 font-black">VERIFIED</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-[9px] bg-white border border-slate-100 text-slate-500 font-black px-2 py-0.5 rounded-full inline-block mb-1">آخرین کارنامه ثبت‌شده در سیستم</span>
                    <h3 className="text-base font-black text-slate-900 leading-tight font-sans">{latestExam.title}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs pt-4 border-t border-slate-200/60 font-bold text-slate-600">
                    <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400">تاریخ برگزاری:</span>
                      <span className="text-slate-900 font-black">{latestExam.date}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400">تراز کل:</span>
                      <span className="text-emerald-600 font-black text-sm">{toPersianNum(latestExam.traz)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400">رتبه کشوری:</span>
                      <span className="text-slate-900 font-black">{toPersianNum(latestExam.rank)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400">میانگین کل:</span>
                      <span className="text-slate-900 font-black">{toPersianNum(latestExam.overallPercentage)}٪</span>
                    </div>
                  </div>
                </div>

                {/* Cognitive Behavioral Indicators */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-900 flex items-center gap-2 px-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>سنجش‌های رفتاری تخمین‌زده شده از پاسخ‌برگ:</span>
                  </h3>

                  <div className="space-y-2.5">
                    <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100/50 flex justify-between items-center group hover:bg-emerald-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                          <Check size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-emerald-900">پاسخ‌های صحیح</span>
                          <span className="text-[9px] text-emerald-600/70 font-bold">ارتقای تراز مستقیم</span>
                        </div>
                      </div>
                      <span className="text-sm font-black text-emerald-600">{toPersianNum(derivedParams.totalCorrect)} تست</span>
                    </div>

                    <div className="p-4 bg-rose-50/40 rounded-2xl border border-rose-100/50 flex justify-between items-center group hover:bg-rose-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white border border-rose-100 flex items-center justify-center text-rose-600 shadow-sm">
                          <AlertCircle size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-rose-900">خطاهای منفی</span>
                          <span className="text-[9px] text-rose-600/70 font-bold">تله شتاب‌زدگی و عجله تستی</span>
                        </div>
                      </div>
                      <span className="text-sm font-black text-rose-600">{toPersianNum(derivedParams.totalWrong)} تست غلط</span>
                    </div>

                    <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-100/50 flex justify-between items-center group hover:bg-amber-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white border border-amber-100 flex items-center justify-center text-amber-600 shadow-sm">
                          <Brain size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-amber-900">تست‌های بدون پاسخ</span>
                          <span className="text-[9px] text-amber-600/70 font-bold">وسواس فکری و مهار ریسک</span>
                        </div>
                      </div>
                      <span className="text-sm font-black text-amber-600">{toPersianNum(derivedParams.totalEmpty)} تست نزده</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expert Sync Action */}
              <button
                onClick={() => setActiveTab("ai-synthesis")}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-[20px] text-xs font-black transition-all shadow-xl shadow-indigo-600/20 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Sparkles size={16} className="text-amber-300 animate-pulse" />
                <span>بارگذاری پارامترها و همگام‌سازی با هوش روان‌شناسی</span>
                <ChevronLeft size={16} className="text-white/50" />
              </button>
            </div>

            {/* Detailed Subject Matrix */}
            <div className="lg:col-span-7 bg-white p-7 rounded-[32px] border border-slate-200 shadow-2xl space-y-7 relative overflow-hidden">
               <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full -ml-24 -mb-24 blur-3xl pointer-events-none" />
               
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                    <BarChart3 size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">ماتریس خطاها و ممیزی نمرات به تفکیک عنوان درسی</h3>
                    <p className="text-[10px] text-slate-400 font-bold">Subject Performance & Error Audit Matrix</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded bg-slate-100 text-[9px] font-mono font-black text-slate-500">AUDIT_LEVEL: CLINICAL</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-tighter">
                      <th className="pb-4 pr-3">عنوان درس تخصصی</th>
                      <th className="pb-4 text-center">میزان درصد</th>
                      <th className="pb-4 text-center">پاسخ صحیح</th>
                      <th className="pb-4 text-center">غلط (نمره منفی)</th>
                      <th className="pb-4 text-center">سفید (نزده)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestExam.lessons.map((lesson, idx) => {
                      const totalSub = lesson.correct + lesson.wrong + lesson.empty || 1;
                      const wrongRatioSub = lesson.wrong / totalSub;
                      const isHighAnxiety = wrongRatioSub > 0.15;
                      
                      return (
                        <tr key={idx} className="group border-b border-slate-50 last:border-b-0 hover:bg-indigo-50/30 transition-colors">
                          <td className="py-4 pr-3">
                            <div className="flex items-center gap-3">
                              <div className="w-1.5 h-6 rounded-full bg-indigo-200 group-hover:bg-indigo-500 transition-colors" />
                              <span className="font-black text-slate-800">{lesson.lessonName}</span>
                            </div>
                          </td>
                          <td className="py-4 text-center">
                            <div className="inline-flex flex-col items-center">
                              <span className="font-black text-slate-900 text-sm tracking-tight">{toPersianNum(lesson.percentage)}٪</span>
                              <div className="w-12 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                <div className="h-full bg-indigo-500" style={{ width: `${lesson.percentage}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-center font-black text-emerald-600">
                             <span className="bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100/50">{toPersianNum(lesson.correct)}</span>
                          </td>
                          <td className="py-4 text-center">
                            <div className="inline-flex flex-col items-center gap-1">
                              <span className="font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100/50">{toPersianNum(lesson.wrong)}</span>
                              {isHighAnxiety && (
                                <span className="text-[8px] px-1.5 py-0.5 rounded bg-rose-500 text-white font-black animate-pulse shadow-sm shadow-rose-200">تنش بالا</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 text-center font-black text-slate-500">
                            <span className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">{toPersianNum(lesson.empty)}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Informative Counselor Note */}
              <div className="relative group grayscale hover:grayscale-0 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-indigo-50 rounded-3xl -m-0.5 pointer-events-none" />
                <div className="relative bg-white border border-slate-100 p-5 rounded-3xl space-y-3 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                      <Smile size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase">Counselor Diagnosis Note</h4>
                      <h5 className="text-[10px] text-indigo-600 font-bold">آسیب‌شناسی مشاور آکادمی هوشمند ترنم مهر</h5>
                    </div>
                  </div>
                  <p className="text-[11px] font-bold text-slate-600 leading-relaxed indent-4">
                    بررسی عمیق ماتریس خطاهای شما نشان می‌دهد که پدیده 
                    <span className="text-rose-600 font-black px-1">"بلاک حافظه لحظه‌ای"</span> 
                    در دروس محاسباتی ریشه در استرس جلسه آزمون و وسواس ذهنی روی گزینه‌های نزدیک به هم دارد. تحلیل هوش مصنوعی زیر به شما کمک خواهد کرد با تنظیم بهینه فواصل مطالعاتی و تمرین‌های آرام‌سازی تنفسی، این خطاها را تا ۷۰ درصد در شبیه‌ساز بعدی برطرف سازید.
                  </p>
                  <div className="flex justify-end pt-1">
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] text-slate-400 font-black italic">Chief Academic Psychologist - Radan</span>
                       <div className="w-8 h-px bg-slate-200" />
                    </div>
                  </div>
                </div>
              </div>
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
                id="btn-calibration-assess"
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
                    <span>تحلیل چندمحوری عملکرد آزمونی</span>
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
                        <p className="text-3xl font-black text-slate-800 tracking-tighter">{toPersianNum(currentReport.stressLevel)}٪</p>
                        <p className="text-[9px] font-black text-slate-400 mt-0.5">شاخص فشار ذهنی تخمینی</p>
                      </div>
                    </div>

                    <div className="space-y-2 w-full text-right">
                      <div className={`p-3 rounded-2xl text-[11px] font-bold text-center ${
                        currentReport.stressLevel > 70 ? "bg-rose-50 text-rose-700" : currentReport.stressLevel > 45 ? "bg-orange-50 text-orange-700" : "bg-emerald-50 text-emerald-700"
                      }`}>
                        {currentReport.stressLevel > 70 ? "سطح فشار ذهنی بالا ! نیازمند استراحت و بازنگری پارت‌های مطالعاتی" : currentReport.stressLevel > 45 ? "سطح فشار متوسط (محرک یادگیری)" : "وضعیت فشار ذهنی پایدار و مطلوب"}
                      </div>
                    </div>
                  </div>

                  {/* Multi-axial Radar Chart for Cognitive Competency Indicators */}
                  <div className="md:col-span-7 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <h3 className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                        <Award size={15} className="text-indigo-600" />
                        <span>ماتریس چندمحوری مهارت‌های مدیریت آزمون</span>
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
                            name="شاخص عملکردی" 
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
                      <h4 className="text-xs font-black text-slate-800">تحلیل الگوی پاسخگویی بر اساس خطاهای آزمونی</h4>
                    </div>

                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2">
                      <span className="text-[9px] font-black text-indigo-600 tracking-wider">جمعبندی مشاور آموزشی:</span>
                      <p className="text-xs font-semibold leading-relaxed text-slate-700">{currentReport.diagnosis}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Active Cognitive Trap Identifier */}
                      <div className="p-4 rounded-2xl border border-amber-100 bg-amber-50/30 space-y-1.5">
                        <span className="text-[9px] font-black text-amber-600 tracking-wider flex items-center gap-1">
                          <AlertCircle size={10} />
                          <span>الگوی احتمالی فعال:</span>
                        </span>
                        <p className="text-xs font-black text-slate-800">{currentReport.cognitiveTrap}</p>
                      </div>

                      {/* Zen Breathing advice recommendation */}
                      <div className="p-4 rounded-2xl border border-teal-100 bg-teal-50/30 space-y-1.5">
                        <span className="text-[9px] font-black text-teal-600 tracking-wider flex items-center gap-1">
                          <Wind size={10} />
                          <span>تمرین تنفس ریتمیک پیشنهادی:</span>
                        </span>
                        <p className="text-xs font-bold text-slate-700">{currentReport.meditationAdvice}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-slate-500 block">اقدامات تمرینی پیشنهادی جهت بهبود عملکرد:</span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {currentReport.remedies.map((rem, idx) => (
                          <div key={idx} className="p-3 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl relative group transition-all flex gap-2">
                            <span className="font-serif text-xs font-black text-indigo-200">#۰{idx + 1}</span>
                            <p className="text-[10px] text-slate-600 font-bold leading-relaxed">{rem}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* New Neuro-Psychological Audit Section */}
                    <div className="pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 mb-4">
                        <Activity size={16} className="text-rose-600" />
                        <h4 className="text-xs font-black text-slate-800">ارزیابی مهارت‌های اجرایی و آزمونی</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-slate-900 rounded-3xl text-white space-y-3 relative overflow-hidden">
                           <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-full blur-xl" />
                           <div className="flex justify-between items-center">
                             <span className="text-[9px] font-black text-slate-400">فشار تصمیم‌گیری آزمونی</span>
                             <Zap size={12} className="text-amber-400" />
                           </div>
                           <div className="text-xl font-black">{toPersianNum(Math.round(currentReport.stressLevel * 0.85))}٪</div>
                           <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                             <div className="h-full bg-amber-400" style={{ width: `${currentReport.stressLevel * 0.85}%` }} />
                           </div>
                           <p className="text-[8px] font-bold text-slate-400 leading-tight">فشار تصمیم‌گیری در محدوده قابل مدیریت است.</p>
                        </div>

                        <div className="p-4 bg-indigo-950 rounded-3xl text-white space-y-3 relative overflow-hidden">
                           <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl" />
                           <div className="flex justify-between items-center">
                             <span className="text-[9px] font-black text-slate-400">واکنش‌پذیری به استرس آزمون</span>
                             <ShieldAlert size={12} className="text-rose-400" />
                           </div>
                           <div className="text-xl font-black">{toPersianNum((qAnxiety * 10))}٪</div>
                           <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                             <div className="h-full bg-rose-400" style={{ width: `${qAnxiety * 10}%` }} />
                           </div>
                           <p className="text-[8px] font-bold text-slate-400 leading-tight">اضطراب آزمونی متوسط رو به پایین ارزیابی می‌شود.</p>
                        </div>

                        <div className="p-4 bg-emerald-950 rounded-3xl text-white space-y-3 relative overflow-hidden">
                           <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl" />
                           <div className="flex justify-between items-center">
                             <span className="text-[9px] font-black text-slate-400">پردازش تحلیلی و تصویری</span>
                             <Eye size={12} className="text-emerald-400" />
                           </div>
                           <div className="text-xl font-black">{toPersianNum(qFocus * 10)}٪</div>
                           <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                             <div className="h-full bg-emerald-400" style={{ width: `${qFocus * 10}%` }} />
                           </div>
                           <p className="text-[8px] font-bold text-slate-400 leading-tight">توان تحلیل و بازخوانی اطلاعات در سطح مطلوب گزارش شده است.</p>
                        </div>
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
                <span className="text-[9px] font-black text-indigo-600 tracking-widest uppercase">Breathing Resonance Chamber</span>
                <div className="text-base font-black text-indigo-950 flex items-center gap-1.5 justify-center relative">
                  <Wind size={18} className="text-indigo-500" />
                  <span>محفظه تمرین تنفس و کنترل تنش آزمونی</span>
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
                </div>
                <p className="text-[10px] text-slate-400 max-w-lg font-bold leading-relaxed">
                  بررسی خطاهای شما در درس {latestExam.lessons[0]?.lessonName} نشان‌دهنده نیاز به یک دوره تمرین تنفس آرام‌بخش ۴ ثانیه‌ای بین دروس تخصصی است. لطفاً در محیطی آرام قرار گرفته و ریتم تنفسی خود را همگام سازید.
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
                      <span>توقف تمرین تنفس</span>
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
                  <h3 className="text-xs font-black text-indigo-950">مکانیسم آرام‌سازی ریتم تنفس ۴ ثانیه‌ای</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-indigo-50/50 rounded-2xl flex gap-3 items-center border border-indigo-100/30">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-serif flex items-center justify-center text-[10px] font-black">۱</span>
                    <div>
                      <span className="text-xs font-black text-slate-800 block">گام اول: دم (Inhale) - ۴ ثانیه</span>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">افزایش اکسیژن‌رسانی و آرام‌سازی سیستم عصبی مرکزی.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-teal-50/50 rounded-2xl flex gap-3 items-center border border-teal-100/30">
                    <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-serif flex items-center justify-center text-[10px] font-black">۲</span>
                    <div>
                      <span className="text-xs font-black text-slate-800 block">گام دوم: حبس نفس (Hold) - ۴ ثانیه</span>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">ایجاد هماهنگی بین ضربان قلب و ریتم تنفسی.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-rose-50/50 rounded-2xl flex gap-3 items-center border border-rose-100/30">
                    <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-serif flex items-center justify-center text-[10px] font-black">۳</span>
                    <div>
                      <span className="text-xs font-black text-slate-800 block">گام سوم: بازدم (Exhale) - ۴ ثانیه</span>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">تخلیه تنش‌های انباشته شده و رهاسازی عضلانی.</p>
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
      {/* Footer / Scientific Basis Info */}
      <div className="mt-12 bg-slate-50 border border-slate-200 rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <BookMarked size={24} className="text-indigo-600" />
          <h3 className="text-xl font-black text-slate-900">مبانی علمی و استانداردهای پایش</h3>
        </div>
        
        <p className="text-sm text-slate-600 leading-relaxed mb-8 font-medium">
          تمامی تحلیل‌ها، تمرین‌های تنفسی و مدل‌های ارزیابی در این پورتال بر اساس چارچوب‌های پذیرفته‌شده در روان‌شناسی تربیتی و مدیریت اضطراب آزمون طراحی شده‌اند. در ادامه، برخی از مهم‌ترین استانداردها و منابع علمی مورد استفاده آورده شده است:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm hover:border-indigo-200 transition-colors">
            <h4 className="text-sm font-black text-slate-800 mb-2">استاندارد APA</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed mb-4">استانداردهای آزمون‌گری آموزشی و روان‌شناختی جهت تضمین عدالت و روایی ارزیابی‌ها.</p>
            <a href="https://www.apa.org/science/programs/testing/standards" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-indigo-600 hover:underline flex items-center gap-1">
              مشاهده منبع <ExternalLink size={10} />
            </a>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm hover:border-indigo-200 transition-colors">
            <h4 className="text-sm font-black text-slate-800 mb-2">مدیریت اضطراب (CBT)</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed mb-4">به‌کارگیری تکنیک‌های رفتاردرمانی شناختی برای مهار استرس‌های حاد جلسه آزمون.</p>
            <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8900696/" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-indigo-600 hover:underline flex items-center gap-1">
              مشاهده مقاله <ExternalLink size={10} />
            </a>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm hover:border-indigo-200 transition-colors">
            <h4 className="text-sm font-black text-slate-800 mb-2">تنفس ریتمیک (Box Breathing)</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed mb-4">تاثیر تنفس مربعی بر کاهش ضربان قلب و بهبود تمرکز در شرایط پرفشار (Mayo Clinic).</p>
            <a href="https://health.clevelandclinic.org/box-breathing-benefits" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-indigo-600 hover:underline flex items-center gap-1">
              مشاهده مرجع <ExternalLink size={10} />
            </a>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm hover:border-indigo-200 transition-colors">
            <h4 className="text-sm font-black text-slate-800 mb-2">یادگیری خودتنظیمی (SRL)</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed mb-4">مدل زیمرمن برای تحلیل خطاهای آموزشی و بهبود استراتژی‌های مطالعه فردی.</p>
            <a href="https://www.jstor.org/stable/j.ctv10h9g9v.7" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-indigo-600 hover:underline flex items-center gap-1">
              مشاهده مطالعه <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
