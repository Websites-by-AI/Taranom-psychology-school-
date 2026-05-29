import React, { useState, useEffect, FormEvent } from "react";
import { 
  Target, TrendingUp, Sparkles, Edit2, Check, Award, 
  ChevronLeft, LayoutList, CheckCircle, Brain, RefreshCw, AlertCircle, HelpCircle, Flame, PlusCircle, RotateCcw,
  Clock, Calendar, Hourglass
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { Student } from "../types";

export interface AIInsight {
  likelihood: number;
  text: string;
  recommendations: string[];
}

interface GoalTrackerProps {
  student: Student;
  currentTraz?: number;
  currentPercentage?: number;
}

export default function GoalTracker({ student, currentTraz = 5575, currentPercentage = 59 }: GoalTrackerProps) {
  // Goals State
  const [targetTraz, setTargetTraz] = useState<number>(6200);
  const [targetGrowth, setTargetGrowth] = useState<number>(10); // +10%
  const [latestQuizScore, setLatestQuizScore] = useState<number>(63); // recent practice quiz score, default is 63% (which is +4% above current 59%)
  
  // Traz Trend History State (last 5 updates)
  const [trazHistory, setTrazHistory] = useState<any[]>([]);
  const [showAddTrazForm, setShowAddTrazForm] = useState<boolean>(false);
  const [newExamLabel, setNewExamLabel] = useState<string>("");
  const [newExamActual, setNewExamActual] = useState<string>("");

  // AI Insights State
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [loadingInsight, setLoadingInsight] = useState<boolean>(false);
  const [insightError, setInsightError] = useState<string | null>(null);

  // UI State
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [tempTraz, setTempTraz] = useState<number>(6200);
  const [tempGrowth, setTempGrowth] = useState<number>(10);
  const [quizInput, setQuizInput] = useState<string>("63");
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [quizSuccess, setQuizSuccess] = useState<boolean>(false);
  const [velocityPreset, setVelocityPreset] = useState<"slow" | "normal" | "intensive">("normal");
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [targetEstDate, setTargetEstDate] = useState<Date | null>(null);
  const [actualWeeklyHours, setActualWeeklyHours] = useState<number>(42);

  // Load saved goals on mount or student change
  useEffect(() => {
    let loadedTarget = 6200;
    const saved = localStorage.getItem(`chatredanesh_goal_goals_${student.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.targetTraz) {
          setTargetTraz(parsed.targetTraz);
          setTempTraz(parsed.targetTraz);
          loadedTarget = parsed.targetTraz;
        }
        if (parsed.targetGrowth) {
          setTargetGrowth(parsed.targetGrowth);
          setTempGrowth(parsed.targetGrowth);
        }
        if (parsed.latestQuizScore !== undefined) {
          setLatestQuizScore(parsed.latestQuizScore);
          setQuizInput(parsed.latestQuizScore.toString());
        }
        if (parsed.lastInsight) {
          setAiInsight(parsed.lastInsight);
        } else {
          setAiInsight(null);
        }
      } catch (e) {
        console.error("Failed to parse saved goals", e);
      }
    } else {
      // Default initial states if no saved storage
      setTargetTraz(6200);
      setTempTraz(6200);
      setTargetGrowth(10);
      setTempGrowth(10);
      setLatestQuizScore(63);
      setQuizInput("63");
      setAiInsight(null);
    }

    // Load or generate History
    const savedTrend = localStorage.getItem(`chatredanesh_goal_traz_history_${student.id}`);
    let loadedHistory = null;
    if (savedTrend) {
      try {
        loadedHistory = JSON.parse(savedTrend);
      } catch (e) {
        console.error(e);
      }
    }

    if (!loadedHistory || loadedHistory.length === 0) {
      loadedHistory = [
        { examName: "شبیه‌ساز ۱ چتر دانش", actualTraz: 5120, targetTraz: Math.max(5000, loadedTarget - 400) },
        { examName: "شبیه‌ساز ۲ چتر دانش", actualTraz: 5280, targetTraz: Math.max(5100, loadedTarget - 300) },
        { examName: "شبیه‌ساز ۳ چتر دانش", actualTraz: 5350, targetTraz: Math.max(5200, loadedTarget - 200) },
        { examName: "شبیه‌ساز ۴ چتر دانش", actualTraz: 5500, targetTraz: Math.max(5300, loadedTarget - 100) },
        { examName: "شبیه‌ساز ۵ چتر دانش", actualTraz: currentTraz, targetTraz: loadedTarget }
      ];
      localStorage.setItem(`chatredanesh_goal_traz_history_${student.id}`, JSON.stringify(loadedHistory));
    }
    setTrazHistory(loadedHistory);
    setNewExamLabel(`شبیه‌ساز ${toPersianNum(loadedHistory.length + 1)} چتر دانش`);

    // Load actual study hours
    const storedHours = localStorage.getItem(`chatredanesh_goal_actual_hours_${student.id}`);
    if (storedHours) {
      setActualWeeklyHours(parseInt(storedHours));
    } else {
      setActualWeeklyHours(42);
    }
  }, [student.id]);

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    setTargetTraz(tempTraz);
    setTargetGrowth(tempGrowth);
    setIsEditing(false);

    // Update trend history targets proportionally based on new target selection
    const scaledHistory = trazHistory.map((item, idx) => {
      const distance = (trazHistory.length - 1 - idx) * 100;
      return {
        ...item,
        targetTraz: Math.max(5000, tempTraz - distance)
      };
    });
    setTrazHistory(scaledHistory);
    localStorage.setItem(`chatredanesh_goal_traz_history_${student.id}`, JSON.stringify(scaledHistory));

    // Save to localStorage
    const dataToSave = {
      targetTraz: tempTraz,
      targetGrowth: tempGrowth,
      latestQuizScore,
      lastInsight: aiInsight
    };
    localStorage.setItem(`chatredanesh_goal_goals_${student.id}`, JSON.stringify(dataToSave));
    
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleLogQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    const scoreVal = parseFloat(quizInput);
    if (!isNaN(scoreVal) && scoreVal >= 0 && scoreVal <= 100) {
      setLatestQuizScore(scoreVal);
      
      const dataToSave = {
        targetTraz,
        targetGrowth,
        latestQuizScore: scoreVal,
        lastInsight: aiInsight
      };
      localStorage.setItem(`chatredanesh_goal_goals_${student.id}`, JSON.stringify(dataToSave));
      
      setQuizSuccess(true);
      setTimeout(() => setQuizSuccess(false), 3000);
    }
  };

  const handleAddNewTrazUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const actualVal = parseInt(newExamActual);
    if (!isNaN(actualVal) && actualVal >= 3000 && actualVal <= 9500) {
      const newItem = {
        examName: newExamLabel,
        actualTraz: actualVal,
        targetTraz: targetTraz
      };

      let updated = [...trazHistory, newItem];
      if (updated.length > 5) {
        updated = updated.slice(updated.length - 5);
      }

      setTrazHistory(updated);
      localStorage.setItem(`chatredanesh_goal_traz_history_${student.id}`, JSON.stringify(updated));

      setNewExamLabel(`شبیه‌ساز ${toPersianNum(updated.length + 1)} چتر دانش`);
      setNewExamActual("");
      setShowAddTrazForm(false);
    }
  };

  const handleResetHistory = () => {
    if (confirm("آیا مایلید روند ثبت ترازهای آزمون چتر دانش را به نمونه اولیه بازنشانی کنید؟")) {
      const defaultHistory = [
        { examName: "شبیه‌ساز ۱ چتر دانش", actualTraz: 5120, targetTraz: Math.max(5000, targetTraz - 400) },
        { examName: "شبیه‌ساز ۲ چتر دانش", actualTraz: 5280, targetTraz: Math.max(5100, targetTraz - 300) },
        { examName: "شبیه‌ساز ۳ چتر دانش", actualTraz: 5350, targetTraz: Math.max(5200, targetTraz - 200) },
        { examName: "شبیه‌ساز ۴ چتر دانش", actualTraz: 5500, targetTraz: Math.max(5300, targetTraz - 100) },
        { examName: "شبیه‌ساز ۵ چتر دانش", actualTraz: currentTraz, targetTraz: targetTraz }
      ];
      setTrazHistory(defaultHistory);
      localStorage.setItem(`chatredanesh_goal_traz_history_${student.id}`, JSON.stringify(defaultHistory));
      setNewExamLabel(`شبیه‌ساز ${toPersianNum(defaultHistory.length + 1)} چتر دانش`);
      setShowAddTrazForm(false);
    }
  };

  // Fetch AI Insights callback
  const fetchGoalInsight = async () => {
    setLoadingInsight(true);
    setInsightError(null);

    // Dynamic fetch configuration with exponent-backoff
    const fetchWithRetry = async (url: string, options?: RequestInit, retries = 3, delay = 600): Promise<Response> => {
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

    try {
      const res = await fetchWithRetry("/api/goal-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student,
          currentTraz,
          currentPercentage,
          targetTraz,
          targetGrowth,
          latestQuizScore
        })
      });

      if (!res.ok) {
        throw new Error("خطا در پاسخ‌دهی سرور مشاوره");
      }

      const data = await res.json();
      if (data && typeof data.likelihood === "number") {
        setAiInsight(data);
        
        // Save to localStorage
        const dataToSave = {
          targetTraz,
          targetGrowth,
          latestQuizScore,
          lastInsight: data
        };
        localStorage.setItem(`chatredanesh_goal_goals_${student.id}`, JSON.stringify(dataToSave));
      } else {
        throw new Error("داده‌های نامعتبر از هوش مصنوعی دریافت شد.");
      }
    } catch (err: any) {
      console.error("AI Insight retrieval failed:", err);
      setInsightError("ارتباط با تخمین‌گر هوش مصنوعی برقرار نشد؛ لطفاً چند لحظه بعد تلاش کنید.");
    } finally {
      setLoadingInsight(false);
    }
  };

  // Convert Gregorian Date to Solar Hijri (Persian) format
  const toPersianDateString = (date: Date) => {
    let g_y = date.getFullYear();
    const refGregorian = new Date("2026-03-21T00:00:00");
    const diffTime = date.getTime() - refGregorian.getTime();
    const diffDays = Math.floor(diffTime / (24 * 60 * 60 * 1000));
    
    let jy, jm, jd;
    if (diffDays >= 0) {
      jy = 1405;
      let days = diffDays;
      if (days < 31 * 6) {
        jm = Math.floor(days / 31) + 1;
        jd = (days % 31) + 1;
      } else {
        days -= 31 * 6;
        if (days < 30 * 5) {
          jm = Math.floor(days / 30) + 7;
          jd = (days % 30) + 1;
        } else {
          days -= 30 * 5;
          jm = 12;
          jd = days + 1;
        }
      }
    } else {
      jy = 1404;
      let days = -diffDays;
      jy = 1405;
      jm = 1;
      jd = 1;
    }
    
    return `${jy}/${jm.toString().padStart(2, '0')}/${jd.toString().padStart(2, '0')}`;
  };

  // Live ticking countdown to targeted Traz goal
  useEffect(() => {
    const firstTraz = trazHistory[0]?.actualTraz || 5120;
    const lastTraz = trazHistory[trazHistory.length - 1]?.actualTraz || currentTraz;
    const historySteps = Math.max(1, trazHistory.length - 1);
    const calculatedVelocity = Math.round((lastTraz - firstTraz) / historySteps);
    const baseVelocity = calculatedVelocity > 0 ? calculatedVelocity : 70;
    
    const getMultiplier = () => {
      switch (velocityPreset) {
        case "slow": return 0.6;
        case "intensive": return 1.5;
        case "normal":
        default: return 1.0;
      }
    };
    
    const activeVelocity = Math.round(baseVelocity * getMultiplier());
    const trazDiff = targetTraz - lastTraz;
    
    if (trazDiff <= 0) {
      setTimeLeft(null);
      setTargetEstDate(null);
      return;
    }
    
    const daysNeeded = Math.ceil(trazDiff / activeVelocity) * 14;
    
    // Anchor target date based on May 21, 2026 local time
    const baseTime = new Date("2026-05-21T16:15:16Z").getTime();
    const targetTime = baseTime + (daysNeeded * 24 * 60 * 60 * 1000);
    setTargetEstDate(new Date(targetTime));
    
    const updateCountdown = () => {
      const now = Date.now();
      const difference = targetTime - now;
      
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      const seconds = Math.floor((difference / 1000) % 60);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      
      setTimeLeft({ days, hours, minutes, seconds });
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetTraz, trazHistory, velocityPreset, currentTraz]);

  // Calculations
  const trazProgressPercent = Math.min(100, Math.max(0, Math.round((currentTraz / targetTraz) * 100)));
  const targetPercentage = currentPercentage + targetGrowth;
  const actualGrowth = Math.max(0, latestQuizScore - currentPercentage);
  const growthProgressPercent = targetGrowth > 0 
    ? Math.min(100, Math.round((actualGrowth / targetGrowth) * 100)) 
    : 100;

  // Formatted Persian numbers helper
  const toPersianNum = (num: number | string) => {
    const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return num.toString().replace(/\d/g, (x) => persianDigits[parseInt(x)]);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6" id="goal-tracker-container">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-50">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
            <Target size={18} />
          </span>
          <h2 className="text-lg font-bold text-slate-900">سامانه هدف‌گذاری و رصد رشد علمی</h2>
        </div>
        <button
          onClick={() => {
            setTempTraz(targetTraz);
            setTempGrowth(targetGrowth);
            setIsEditing(!isEditing);
          }}
          className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 text-slate-600 font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
          id="btn-edit-goals"
        >
          {isEditing ? "انصراف" : "ویرایش اهداف"}
          {!isEditing && <Edit2 size={12} className="mr-0.5" />}
        </button>
      </div>

      {/* Edit Form */}
      {isEditing ? (
        <motion.form 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          onSubmit={handleSaveGoals}
          className="bg-slate-50 p-4 rounded-2xl border border-slate-200/65 space-y-4"
          id="goals-edit-form"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Traz Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">تراز هدف آزمون بعدی</label>
              <div className="flex gap-2 items-center">
                <input
                  type="range"
                  min="5000"
                  max="8000"
                  step="50"
                  value={tempTraz}
                  onChange={(e) => setTempTraz(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-900"
                />
                <span className="text-xs font-black text-blue-950 font-mono bg-white border border-slate-200 px-2.5 py-1 rounded-lg w-16 text-center">
                  {toPersianNum(tempTraz)}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">تراز فعلی شما: {toPersianNum(currentTraz)}</p>
            </div>

            {/* Growth Percentage Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">درصد رشد هدف (رشد میانگین)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="range"
                  min="2"
                  max="30"
                  step="1"
                  value={tempGrowth}
                  onChange={(e) => setTempGrowth(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <span className="text-xs font-black text-amber-700 font-mono bg-white border border-slate-200 px-2.5 py-1 rounded-lg w-14 text-center">
                  {toPersianNum(tempGrowth)}٪+
                </span>
              </div>
              <p className="text-[10px] text-slate-400">میانگین فعلی شما: {toPersianNum(currentPercentage)}٪ (هدف نهایی: {toPersianNum(currentPercentage + tempGrowth)}٪)</p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold py-2 px-4 rounded-xl shadow transition duration-150 flex items-center gap-1.5 cursor-pointer"
            >
              <Check size={14} />
              <span>ذخیره اهداف جدید</span>
            </button>
          </div>
        </motion.form>
      ) : null}

      {/* Success Notification */}
      {saveSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 text-emerald-700 p-3 rounded-xl border border-emerald-100 text-xs font-bold flex items-center gap-1.5"
        >
          <CheckCircle size={14} />
          <span>اهداف تحصیلی شما با موفقیت به‌روزرسانی شد. مشاور بر اساس این اهداف برنامه‌ریزی می‌کند.</span>
        </motion.div>
      )}

      {/* Tracking Visualization Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="goals-tracking-cards">
        {/* Traz Goal Progress */}
        <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100 space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Award size={14} className="text-blue-600" />
                <span>مسیر رسیدن به تراز هدف</span>
              </span>
              <span className="text-xs font-black text-blue-900 font-mono bg-blue-50 px-2 py-0.5 rounded-full">
                {toPersianNum(trazProgressPercent)}٪
              </span>
            </div>
            
            <div className="flex justify-between items-end pt-1">
              <div>
                <span className="text-[10px] text-slate-400 block">آخرین تراز ثبت‌شده</span>
                <span className="text-lg font-black text-slate-500 font-mono">{toPersianNum(currentTraz)}</span>
              </div>
              <div className="text-left">
                <span className="text-[10px] text-blue-900 font-black block">تراز هدف‌گذاری شده</span>
                <span className="text-2xl font-black text-blue-950 font-mono">{toPersianNum(targetTraz)}</span>
              </div>
            </div>
          </div>

          {/* Progress bar container */}
          <div className="space-y-1">
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${trazProgressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-gradient-to-r from-blue-500 to-blue-900 h-2.5 rounded-full"
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{toPersianNum(5000)}</span>
              <span>فاصله تا قله: {toPersianNum(Math.max(0, targetTraz - currentTraz))} واحد</span>
              <span>{toPersianNum(targetTraz)}</span>
            </div>
          </div>
        </div>

        {/* Growth Percentage Progress */}
        <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100 space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <TrendingUp size={14} className="text-amber-600" />
                <span>رشد هدف نسبت به پایه اولیه ({toPersianNum(currentPercentage)}٪)</span>
              </span>
              <span className="text-xs font-black text-amber-700 font-mono bg-amber-50 px-2 py-0.5 rounded-full">
                {toPersianNum(growthProgressPercent)}٪
              </span>
            </div>
            
            <div className="flex justify-between items-end pt-1">
              <div>
                <span className="text-[10px] text-slate-400 block">میانگین تصحیح فعلی</span>
                <span className="text-lg font-black text-slate-500 font-mono">{toPersianNum(currentPercentage)}٪</span>
              </div>
              <div className="text-left">
                <span className="text-[10px] text-amber-700 font-black block">درصد رشد و هدف نهایی</span>
                <span className="text-2xl font-black text-amber-900 font-mono">{toPersianNum(targetPercentage)}٪ <span className="text-xs text-amber-500">({toPersianNum(targetGrowth)}٪+)</span></span>
              </div>
            </div>
          </div>

          {/* Progress bar container */}
          <div className="space-y-1">
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${growthProgressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-gradient-to-r from-amber-400 to-amber-600 h-2.5 rounded-full"
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{toPersianNum(currentPercentage)}٪</span>
              <span>درصد آزمون اخیر: {toPersianNum(latestQuizScore)}٪</span>
              <span>{toPersianNum(targetPercentage)}٪</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic RECHARTS Trend Chart Tracking Traz Journey against projection */}
      <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 flex flex-col space-y-4" id="traz-trend-chart-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <TrendingUp size={14} className="text-blue-600" />
              <span>روند تغییرات تراز در ۵ آزمون اخیر شبیه‌ساز چتر دانش</span>
            </h3>
            <p className="text-[10px] text-slate-500">رصد منحنی رشد تراز واقعی در مقابل افق هدف‌گذاری شده و آرمانی چتر دانش</p>
          </div>
          
          <div className="flex items-center gap-1.5 self-start">
            <button 
              onClick={() => setShowAddTrazForm(!showAddTrazForm)}
              className="text-[10px] font-extrabold bg-blue-50 text-blue-900 border border-blue-100 px-2.5 py-1.5 rounded-xl hover:bg-blue-100 transition cursor-pointer flex items-center gap-1"
            >
              <PlusCircle size={11} />
              <span>{showAddTrazForm ? "بستن پنل" : "ثبت کارنامه واقعی جدید"}</span>
            </button>
            <button
              onClick={handleResetHistory}
              className="text-[10px] p-1.5 bg-neutral-100 text-slate-600 border border-slate-200 hover:bg-neutral-200 rounded-xl transition cursor-pointer"
              title="بارگذاری مجدد نمونه پیش فرض"
            >
              <RotateCcw size={11} />
            </button>
          </div>
        </div>

        {/* Form to submit custom traz result update */}
        <AnimatePresence>
          {showAddTrazForm && (
            <motion.form 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddNewTrazUpdate}
              className="bg-white p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end shadow-sm"
              id="logger-history-form"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 block">نام آزمون / مرحله</label>
                <input 
                  type="text" 
                  value={newExamLabel}
                  onChange={(e) => setNewExamLabel(e.target.value)}
                  placeholder="شبیه‌ساز ۶ چتر دانش"
                  className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-blue-900"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 block">تراز واقعی کسب‌شده</label>
                <input 
                  type="number" 
                  min="3000" 
                  max="9500"
                  value={newExamActual}
                  onChange={(e) => setNewExamActual(e.target.value)}
                  placeholder="مثال: ۵۷۰۰"
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-left px-3 py-2 rounded-xl font-mono focus:outline-none focus:border-blue-900"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-blue-900 hover:bg-blue-950 text-white text-[11px] font-bold py-2 rounded-xl shadow cursor-pointer text-center"
              >
                ثبت کارنامه در نمودار دایمی
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Responsive Recharts Container */}
        <div className="h-60 w-full" style={{ direction: "ltr" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trazHistory} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="examName" 
                tick={{ fill: '#475569', fontSize: 10, fontWeight: 'medium' }} 
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis 
                domain={['dataMin - 200', 'dataMax + 200']}
                tick={{ fill: '#475569', fontSize: 10, fontWeight: 'medium', fontFamily: 'monospace' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                content={({ active, payload, label }: any) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-700/50 shadow-xl space-y-1.5 text-xs text-right">
                        <p className="font-bold text-slate-300 border-b border-white/10 pb-1">{label}</p>
                        {payload.map((entry: any, index: number) => (
                          <div key={index} style={{ color: entry.color }} className="font-semibold flex items-center justify-between gap-4 font-mono">
                            <span className="text-[11px]">{entry.name === "actualTraz" ? "تراز واقعی دانش‌آموز:" : "حد آرمانی هدف‌گذاری:"}</span>
                            <span className="font-black text-xs">{toPersianNum(entry.value)}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }} 
              />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 10, fontWeight: 'bold', paddingTop: 0 }}
                formatter={(value) => value === "actualTraz" ? "نمودار تراز واقعی" : "تراز هدف شبیه‌ساز چتر دانش"}
              />
              {/* Actual Line */}
              <Line 
                type="monotone" 
                dataKey="actualTraz" 
                name="actualTraz"
                stroke="#1e3a8a" 
                strokeWidth={3}
                activeDot={{ r: 6 }} 
                dot={{ r: 4, stroke: '#1e3a8a', strokeWidth: 2, fill: '#fff' }}
              />
              {/* Target Projection Line */}
              <Line 
                type="monotone" 
                dataKey="targetTraz" 
                name="targetTraz"
                stroke="#f59e0b" 
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={{ r: 3, stroke: '#f59e0b', strokeWidth: 1.5, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Projection tabular view of next 3 exam milestone projections */}
      {(() => {
        // Calculate historical learning velocity
        const firstTraz = trazHistory[0]?.actualTraz || 5120;
        const lastTraz = trazHistory[trazHistory.length - 1]?.actualTraz || currentTraz;
        const historySteps = Math.max(1, trazHistory.length - 1);
        const calculatedVelocity = Math.round((lastTraz - firstTraz) / historySteps);
        
        // Define fallback velocity if historical is flat/negative
        const baseVelocity = calculatedVelocity > 0 ? calculatedVelocity : 70;

        // Use custom velocity modifiers based on user interaction (slow, normal, intensive)
        const getVelocityMultiplier = () => {
          switch (velocityPreset) {
            case "slow": return 0.6;
            case "intensive": return 1.5;
            case "normal":
            default: return 1.0;
          }
        };

        const activeVelocity = Math.round(baseVelocity * getVelocityMultiplier());
        
        // Compute projected Traz for next 3 milestones
        const milestonesData = [
          {
            step: "گام اول (۲ هفته بعد)",
            name: "آزمون شبیه‌ساز مبحثی چتر دانش",
            projectedTraz: lastTraz + activeVelocity,
            date: "۱۴۰۵/۰۳/۱۶",
            weeklyHours: velocityPreset === "slow" ? 36 : velocityPreset === "intensive" ? 54 : 45,
            focus: "تثبیت عقود معین مدنی و صلاحیت شوراهای حل اختلاف",
            badgeColor: "bg-teal-50 text-teal-700 border-teal-100"
          },
          {
            step: "گام دوم (۴ هفته بعد)",
            name: "آزمون شبیه‌ساز جامع مهارتی وکالت",
            projectedTraz: lastTraz + (activeVelocity * 2),
            date: "۱۴۰۵/۰۳/۳۰",
            weeklyHours: velocityPreset === "slow" ? 40 : velocityPreset === "intensive" ? 58 : 48,
            focus: "رفع نقص مقررات حاکم بر ورشکستگی در تجارت و شهادت در متون فقه",
            badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-100"
          },
          {
            step: "گام سوم (۶ هفته بعد)",
            name: "آزمون شبیه‌ساز نهایی و جامع وکالت",
            projectedTraz: lastTraz + (activeVelocity * 3),
            date: "۱۴۰۵/۰۴/۱۳",
            weeklyHours: velocityPreset === "slow" ? 42 : velocityPreset === "intensive" ? 64 : 52,
            focus: "شبیه‌سازی کامل دفترچه سوالات کانون وکلا سال‌های اخیر",
            badgeColor: "bg-amber-50 text-amber-700 border-amber-100"
          }
        ];

        return (
          <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4" id="traz-projection-projection-milestones">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <LayoutList size={14} className="text-indigo-600" />
                  <span>پیش‌بینی سه‌مرحله‌ای تراز بر اساس شتاب مطالعه جاری</span>
                </h3>
                <p className="text-[10px] text-slate-500">مشاهده فرضیه صعود علمی دانش‌آموز بر اساس سه سطح تلاش هفتگی</p>
              </div>

              {/* Study Pace Interactive Switch */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm text-[10px] font-bold self-start sm:self-center">
                <span className="text-[9px] text-slate-400 px-1.5">شدت مطالعه:</span>
                <button
                  type="button"
                  onClick={() => setVelocityPreset("slow")}
                  className={`px-2 py-1 rounded-lg transition cursor-pointer ${velocityPreset === "slow" ? "bg-amber-100 text-amber-800" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  کنترل شده (-۴۰٪)
                </button>
                <button
                  type="button"
                  onClick={() => setVelocityPreset("normal")}
                  className={`px-2 py-1 rounded-lg transition cursor-pointer ${velocityPreset === "normal" ? "bg-blue-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  نرمال (موجود)
                </button>
                <button
                  type="button"
                  onClick={() => setVelocityPreset("intensive")}
                  className={`px-2 py-1 rounded-lg transition cursor-pointer ${velocityPreset === "intensive" ? "bg-emerald-100 text-emerald-800" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  موشکی (+۵۰٪)
                </button>
              </div>
            </div>

            {/* Interactive User Study Hours input Panel */}
            <div className="bg-white p-4.5 rounded-xl border border-slate-200/70 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-tr from-indigo-500 to-blue-600 text-white rounded-xl shadow-md">
                  <Clock size={16} />
                </div>
                <div className="space-y-0.5 text-right">
                  <h4 className="text-xs font-extrabold text-slate-800">ساعت مطالعه واقعی هفتگی شما:</h4>
                  <p className="text-[10px] text-slate-500">میزان متعهد شده را تنظیم کنید تا ریسک عدم دستیابی به ترازهای فرضیه بالا بررسی شود</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto flex-1 max-w-md justify-end">
                <input 
                  type="range"
                  min="10"
                  max="80"
                  step="1"
                  value={actualWeeklyHours}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setActualWeeklyHours(val);
                    localStorage.setItem(`chatredanesh_goal_actual_hours_${student.id}`, val.toString());
                  }}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <span className="text-xs font-black text-indigo-950 font-mono bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl w-20 text-center flex items-center justify-center gap-1 flex-shrink-0">
                  <span className="font-bold text-indigo-950">{toPersianNum(actualWeeklyHours)}</span>
                  <span className="text-[10px] text-indigo-600">ساعت</span>
                </span>
              </div>
            </div>

            {/* Projection Summary Metric Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-400 block pb-0.5">شتاب علمی خام (تاریخچه)</span>
                  <span className="text-xs font-extrabold text-slate-800 font-mono">+{toPersianNum(baseVelocity)} واحد تراز</span>
                </div>
                <div className="text-[9px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">در هر آزمون شبیه‌ساز</div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-400 block pb-0.5">قدرت شتاب تنظیم‌شده</span>
                  <span className="text-xs font-extrabold text-indigo-900 font-mono">+{toPersianNum(activeVelocity)} واحد تراز</span>
                </div>
                <div className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">ضریب {toPersianNum(getVelocityMultiplier())}x</div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between sm:col-span-2 md:col-span-1">
                <div>
                  <span className="text-[9px] text-slate-400 block pb-0.5">فاصله تا قله هدف چتر دانش ({toPersianNum(targetTraz)})</span>
                  <span className="text-xs font-extrabold text-amber-700 font-mono">{toPersianNum(Math.max(0, targetTraz - lastTraz))} واحد</span>
                </div>
                {lastTraz + (activeVelocity * 3) >= targetTraz ? (
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg">موفقیت قطعی در ۳ گام</span>
                ) : (
                  <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-1 rounded-lg">نیاز به افزایش شتاب</span>
                )}
              </div>
            </div>

            {/* Responsive Table Layout */}
            <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white">
              <table className="w-full text-right border-collapse table-auto">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500">نام مرحله علمی</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 text-center">تاریخ تقریبی آزمون</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 text-center">تراز تخمینی</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 text-center">رشد خالص</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 text-center">ساعت پیشنهادی</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 text-center">نشانگر وضعیت</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500">محور پیشنهاد مشاور ویژه</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {milestonesData.map((milestone, idx) => {
                    const trazDiff = milestone.projectedTraz - lastTraz;
                    const isSuccess = milestone.projectedTraz >= targetTraz;
                    const isStudySufficient = actualWeeklyHours >= milestone.weeklyHours;

                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 transition bg-white">
                        <td className="px-4 py-3 text-xs">
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded-lg border ${milestone.badgeColor}`}>
                              {milestone.step}
                            </span>
                            <span className="text-slate-800">{milestone.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 text-center font-mono">{toPersianNum(milestone.date)}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="text-xs font-black text-slate-800 font-mono">{toPersianNum(milestone.projectedTraz)}</span>
                            {isSuccess ? (
                              <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold px-1.5 py-0.5 rounded-md">پوشش هدف</span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-xs font-bold text-emerald-600 font-mono">+{toPersianNum(trazDiff)}</td>
                        <td className="px-4 py-3 text-center text-xs font-semibold text-slate-600 font-mono">{toPersianNum(milestone.weeklyHours)} ساعت</td>
                        <td className="px-4 py-3 text-center text-xs">
                          {isStudySufficient ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-550 animate-pulse"></span>
                              <span>کافی و ایمن ✓</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-[9px] font-black bg-rose-50 text-rose-600 border border-rose-200/60 rounded-full animate-bounce">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-650"></span>
                              <span>ریسک افت تراز ({toPersianNum(milestone.weeklyHours - actualWeeklyHours)}س کمبود)</span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600 leading-normal max-w-xs truncate" title={milestone.focus}>
                          {milestone.focus}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Live Ticking Countdown to reaching target */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-900/40 text-white p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden" id="countdown-to-traz-target">
              {/* Background gradient radial glow */}
              <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
              <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

              <div className="space-y-2 relative z-10 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="p-1 px-2 bg-indigo-500/20 text-indigo-350 border border-indigo-500/30 rounded-lg text-[9px] font-black tracking-wider flex items-center gap-1">
                    <Clock size={11} className="text-indigo-400" />
                    <span>تخمین هوشمند زمان باقی‌مانده الی هدف چتر دانش</span>
                  </span>
                </div>
                
                <h4 className="text-sm font-black text-slate-100 flex items-center gap-2">
                  <Hourglass size={15} className="text-amber-400 animate-pulse" />
                  <span>زمان تقریبی رسیدن به تراز هدف {toPersianNum(targetTraz)}</span>
                </h4>
                
                <p className="text-xs text-slate-350 leading-relaxed max-w-xl">
                  {timeLeft ? (
                    <>
                      با نرخ رشد فعلی علمی شما (<span className="text-indigo-300 font-extrabold font-mono">+{toPersianNum(activeVelocity)}</span> واحد تراز در هر شبیه‌ساز)، پیش‌بینی می‌شود در تاریخ <span className="text-emerald-400 font-extrabold font-mono">{targetEstDate ? toPersianDateString(targetEstDate) : "---"}</span> به تراز هدف خود برسید.
                    </>
                  ) : (
                    <span className="text-emerald-450 font-bold">
                      شما همین حالا تراز هدف {toPersianNum(targetTraz)} خود را فتح کرده‌اید یا جلوتر هستید! تلاش شما به نتیجه رسیده است.
                    </span>
                  )}
                </p>
                
                {timeLeft && (
                  <div className="flex flex-wrap gap-2 text-[10px]">
                    <div className="bg-white/5 border border-white/10 px-2 py-1 rounded-lg text-slate-300">
                      فاصله تراز باقی‌مانده: <span className="font-extrabold text-indigo-300 font-mono">{toPersianNum(targetTraz - lastTraz)} واحد</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 px-2 py-1 rounded-lg text-slate-300">
                      تعداد آزمون شبیه‌ساز چتر دانش مورد نیاز: <span className="font-extrabold text-indigo-300 font-mono">{toPersianNum(Math.ceil((targetTraz - lastTraz) / activeVelocity))} مرحله</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Countdown Ticker Box */}
              {timeLeft ? (
                <div className="flex items-center gap-2 self-center relative z-10 select-none">
                  {[
                    { label: "روز", value: timeLeft.days, unitLabel: "day" },
                    { label: "ساعت", value: timeLeft.hours, unitLabel: "hour" },
                    { label: "دقیقه", value: timeLeft.minutes, unitLabel: "minute" },
                    { label: "ثانیه", value: timeLeft.seconds, unitLabel: "second" }
                  ].map((unit, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-white/5 border border-white/10 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
                        <div className="absolute inset-x-0 bottom-0 top-1/2 bg-white/[0.02] border-t border-white/5" />
                        <span className="text-base font-black text-indigo-200 font-mono text-center tracking-tight">
                          {toPersianNum(unit.value.toString().padStart(2, "0"))}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-black mt-1">{unit.label}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center bg-emerald-500/10 border border-emerald-500/20 px-5 py-3 rounded-xl relative z-10 self-center">
                  <Award size={28} className="text-emerald-400 mb-1" />
                  <span className="text-[10px] font-black text-emerald-400">هدف فتح‌شده</span>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Interactive Activity: Quiz Assessment Logger to update progress! */}
      <div className="bg-gradient-to-l from-slate-50 to-blue-50/40 p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4" id="quiz-refiner-panel">
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
            <Sparkles size={12} className="text-amber-500" />
            <span>کوییز فرعی دادید؟ ثبت درصد برای رصد واقعی پیشرفت</span>
          </h4>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            با وارد کردن درصد آزمون یا تمرین آخر خود، میزان پیشرفت واقعی به سمت هدف رشد ({toPersianNum(targetGrowth)}٪+) را در لحظه مشاهده کنید.
          </p>
        </div>

        <form onSubmit={handleLogQuiz} className="flex gap-2 w-full md:w-auto items-center">
          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              value={quizInput}
              onChange={(e) => setQuizInput(e.target.value)}
              className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold font-mono w-24 text-left focus:outline-none focus:border-blue-900"
              placeholder="مثلا ۶۵"
              required
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">٪</span>
          </div>
          <button
            type="submit"
            className="bg-slate-950 hover:bg-slate-850 text-white text-xs font-semibold py-2 px-3 rounded-xl transition cursor-pointer shrink-0"
          >
            ثبت کوییز
          </button>
        </form>
      </div>

      {quizSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] text-emerald-700 bg-emerald-50/70 border border-emerald-100 p-2.5 rounded-xl block font-medium"
        >
          ✓ عالی است! درصد فرعی جدید ({toPersianNum(latestQuizScore)}٪) با موفقیت ثبت شد و نمودار رشد مجدداً کالیبره شد.
        </motion.div>
      )}

      {/* AI-Powered Goal Hit Likelihood Estimator Section */}
      <div className="border border-indigo-100 bg-indigo-50/20 rounded-2xl p-5 space-y-4" id="ai-insight-panel">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg animate-pulse">
              <Brain size={18} />
            </span>
            <div>
              <h3 className="text-xs font-extrabold text-indigo-950">تخمین احتمال رسیدن به اهداف با هوش مصنوعی (Gemini)</h3>
              <p className="text-[10px] text-indigo-600/80">ارزیابی کلاستر استرس، تراز هدف و سوابق استمرار روزانه کلاس‌ها و آزمون‌ها</p>
            </div>
          </div>

          {aiInsight && !loadingInsight && (
            <button 
              onClick={fetchGoalInsight}
              className="p-1.5 hover:bg-indigo-100/60 rounded-lg text-indigo-600 transition flex items-center gap-1 text-[10px] font-bold cursor-pointer"
              title="بروزرسانی تحلیل"
            >
              <RefreshCw size={12} />
              <span>تحلیل مجدد</span>
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {loadingInsight ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 bg-white/70 rounded-xl space-y-3 border border-indigo-50"
            >
              <div className="flex items-center gap-3">
                <RefreshCw className="animate-spin text-indigo-500" size={16} />
                <span className="text-xs font-black text-indigo-950 animate-pulse">مشاور هوش مصنوعی در حال ارزیابی متدهای مطالعه شماست...</span>
              </div>
              <div className="space-y-1.5 pt-1">
                <div className="h-2 bg-indigo-100 rounded-full w-full animate-pulse" />
                <div className="h-2 bg-indigo-50 rounded-full w-5/6 animate-pulse" />
              </div>
            </motion.div>
          ) : insightError ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 text-[11px] font-bold flex items-center gap-2"
            >
              <AlertCircle size={14} />
              <span>{insightError}</span>
              <button 
                onClick={fetchGoalInsight}
                className="bg-white border border-red-200 px-3 py-1 rounded-lg text-red-600 hover:bg-neutral-50 transition mr-auto text-[10px]"
              >
                تلاش مجدد
              </button>
            </motion.div>
          ) : aiInsight ? (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Likelihood Meter & Analysis Text */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                
                {/* Visual Dial Column */}
                <div className="flex flex-col items-center justify-center bg-white p-3.5 rounded-xl border border-indigo-100/60 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-1 text-slate-100/60 pointer-events-none">
                    <Flame size={44} />
                  </div>
                  
                  {/* Gauge indicator */}
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    {/* SVG Progress Circle */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        className="stroke-slate-100"
                        strokeWidth="5"
                        fill="transparent"
                      />
                      <motion.circle
                        cx="40"
                        cy="40"
                        r="32"
                        className={
                          aiInsight.likelihood >= 80 
                            ? "stroke-emerald-500" 
                            : aiInsight.likelihood >= 50 
                              ? "stroke-amber-500" 
                              : "stroke-red-500"
                        }
                        strokeWidth="5"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 32}
                        initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - aiInsight.likelihood / 100) }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      />
                    </svg>
                    <span className="absolute text-sm font-extrabold text-slate-900 font-mono">
                      {toPersianNum(aiInsight.likelihood)}٪
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-indigo-900 mt-2 block text-center">شانس تخمینی معقول</span>
                </div>

                {/* Analysis Description text */}
                <div className="md:col-span-3 space-y-1">
                  <div className="text-[11px] font-semibold text-slate-700 leading-relaxed text-justify">
                    {aiInsight.text}
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[10px] text-indigo-600 font-medium">مشاوره تراز شده بر مبنای آخرین نمره کوییز ({toPersianNum(latestQuizScore)}٪)</span>
                  </div>
                </div>

              </div>

              {/* Action Plan Suggestions */}
              <div className="bg-white/60 p-3.5 rounded-xl border border-indigo-100/40 space-y-2">
                <span className="text-[11px] font-bold text-indigo-950 block">پیشنهادات فنی مربی هوش مصنوعی برای دستیابی قطعی به تراز هدف:</span>
                <ul className="space-y-1.5">
                  {aiInsight.recommendations.map((rec, i) => (
                    <motion.li 
                      key={i}
                      initial={{ opacity: 0, x: 5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15 }}
                      className="text-[11px] text-slate-600 flex items-start gap-1.5 leading-normal"
                    >
                      <span className="p-0.5 bg-indigo-50 text-indigo-500 rounded-md shrink-0 block mt-0.5">
                        <CheckCircle size={10} />
                      </span>
                      <span>{rec}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50 p-4 rounded-xl border border-indigo-50"
            >
              <div className="space-y-1 max-w-lg">
                <span className="text-xs font-bold text-indigo-950 block">آیا دوست دارید شانس صعود خود را بدانید؟</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  هوش مصنوعی به کمک مدل قدرتمند <span className="font-mono text-indigo-700 font-bold">gemini-3.5-flash</span> ترازهای جاری مهد، فاصله تراز هدف ({toPersianNum(targetTraz)}) و درصد آزمون اخیر ({toPersianNum(latestQuizScore)}٪) شما را آنالیز کرده و احتمال تقریبی به همرا برآورد استراتژیک ارائه می‌دهد.
                </p>
              </div>
              <button
                onClick={fetchGoalInsight}
                className="bg-gradient-to-tr from-indigo-900 to-blue-950 hover:from-indigo-950 hover:to-black text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow transition duration-150 flex items-center gap-1.5 shrink-0 self-end md:self-center cursor-pointer"
              >
                <Sparkles size={14} />
                <span>تخمین هوشمند فرآیند رشد</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
