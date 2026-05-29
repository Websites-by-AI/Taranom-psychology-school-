import React, { useState, useRef, useEffect } from "react";
import { 
  Send, User, Sparkles, AlertCircle, HelpCircle, CheckSquare, 
  BookOpen, HeartPulse, Brain, Plus, Trash2, Calendar, 
  Clock, Check, Smile, ClipboardList, PlusCircle, Sparkle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ChatMessage, Student } from "../types";

interface CounselingSession {
  id: string;
  type: "educational" | "psychological";
  title: string;
  date: string;
  counselorName: string;
  notes: string;
  actionSteps: { text: string; completed: boolean }[];
  recommendedStudyHours: number;
}

interface CounselorViewProps {
  student: Student;
}

export default function CounselorView({ student }: CounselorViewProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "sessions">("chat");

  // --- LIVE CHAT STATE ---
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "model",
      content: `سلام ${student.name} عزیز! من دکتر کریمی، مشاور هوشمند و رتبه برتر حقوقی کانون وکلا در مجموعه چتر دانش هستم. کل سوابق، ترازهای آزمون آزمایشی سردفتری/وکالت و نمرات درس‌های حقوق مدنی و تجارتت رو کامل مطالعه کردم. امروز چطور می‌تونم به تصاحب پروانه وکالتت کمک کنم؟ هر چالشی درباره عقود معین، مهار اضطراب مواعد یا روش برنامه‌ریزی داری بپرس.`,
      timestamp: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    "تست‌های ضمان قهری و عقود معین حقوق مدنی رو چطور بهبود بدم؟",
    "درس زیاد می‌خونم اما تراز آزمون چتر دانش من بالا نمیره.",
    "در نیم‌ساعت آخر آزمون تمرکزم روی گزینه‌های انحرافی فقه به تست غلط تبدیل میشه؛ چکار کنم؟",
    "تکنیک کنترل استرس آزمون وکالت برای مبحث صلاحیت مراجع قضایی چیه؟"
  ];

  // --- SESSIONS LOG STATE ---
  const [sessions, setSessions] = useState<CounselingSession[]>(() => {
    const stored = localStorage.getItem(`chatredanesh_sessions_${student.id}`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Could not parse counseling sessions from localStorage", e);
      }
    }
    // Pre-populated default mockup data logic
    return [
      {
        id: "session-1",
        type: "educational",
        title: "تحلیل موشکافانه افت تراز مبحث عقود معین و مسئولیت مدنی چتر دانش",
        date: "۱۴۰۵/۰۲/۱۵",
        counselorName: "دکتر کریمی",
        notes: "بررسی فرکانس عملکرد آزمون نشان می‌دهد در مبحث ضمان قهری یا حقوق تجارت تخصصی نیاز به بازسازی مفهومی زیربنایی داریم. مقرر شد داوطلب ابتدا کتاب قوانین نموداری چتر دانش را تکرار کرده و سپس ۲۵ تست مهارتی بدون محدودیت زمان بزند تا بر تله‌ها چیره شود.",
        actionSteps: [
          { text: "رفع اشکال عقد بیع و تعهدات ثالث با کتب نمودار عالی چتر دانش", completed: true },
          { text: "حل ۴۰ تست مهارتی و تحلیل کارگاهی آرا وحدت رویه", completed: false }
        ],
        recommendedStudyHours: 48
      },
      {
        id: "session-2",
        type: "psychological",
        title: "مهار اضطراب زمان پله آخر آزمون وکالت اسکودا",
        date: "۱۴۰۵/۰۲/۱۸",
        counselorName: "دکتر مهدوی",
        notes: "ریشه اشتباهات و تله‌های رگباری دقایق آخر دفترچه دوم، ناشی از ترس از نرسیدن به حد نصاب قبولی تبیین شد. توصیه‌نامه کنترل ذهن فعال گردید. اجرای مینی‌آزمون زمان‌دار در منزل هفته‌ای دو مرتبه به شدت توصیه می‌شود.",
        actionSteps: [
          { text: "تنفس عمیق ۳ دقیقه‌ای شکمی بر اساس شیوه ۵-۵-۵ قبل از نشستن سر دفترچه آزمون چتر دانش", completed: false },
          { text: "تنظیم خواب شب مانیتور شده روی حداقل ۷.۵ ساعت", completed: true }
        ],
        recommendedStudyHours: 42
      }
    ];
  });

  // --- NEW SESSION FORM STATE ---
  const [newType, setNewType] = useState<"educational" | "psychological">("educational");
  const [newTitle, setNewTitle] = useState("");
  const [newCName, setNewCName] = useState("آقای رادان");
  const [newDate, setNewDate] = useState("۱۴۰۵/۰۳/۰۱");
  const [newNotes, setNewNotes] = useState("");
  const [newHours, setNewHours] = useState(44);
  const [newActionInput, setNewActionInput] = useState("");
  const [newActionStepsList, setNewActionStepsList] = useState<string[]>([]);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Auto scroll down in chat
  useEffect(() => {
    if (activeTab === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, sending, activeTab]);

  // Persist sessions
  const saveSessionsToLocal = (updated: CounselingSession[]) => {
    setSessions(updated);
    localStorage.setItem(`taranom_mehr_sessions_${student.id}`, JSON.stringify(updated));
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || sending) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setSending(true);

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
      const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await fetchWithRetry("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend, history: chatHistory })
      });

      if (res.ok) {
        const data = await res.json();
        const modelMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "model",
          content: data.reply || "پاسخ خالی است.",
          timestamp: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })
        };
        setMessages((prev) => [...prev, modelMsg]);
      } else {
        throw new Error("API non-200 response");
      }
    } catch (err) {
      console.error("Failed to connect to AI Counselor endpoint", err);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: `همکار گرامی کانون، در حال حاضر ارتباط شبکه کمی کند است. درباره ${textToSend} نگران نباش؛ برنامه‌ریزی دفتری چتر دانش بر این بنا شده که پس از تثبیت مفاهیم حقوق مدنی، تست‌های بدون زمان حل شود. روی قله تعهد خودت بمان.`,
        timestamp: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })
      }]);
    } finally {
      setSending(false);
    }
  };

  const handleQuickQuestionClick = (q: string) => {
    handleSendMessage(q);
  };

  // --- ACTIONS FOR SESSIONS ---
  const handleAddActionStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionInput.trim()) return;
    setNewActionStepsList((prev) => [...prev, newActionInput.trim()]);
    setNewActionInput("");
  };

  const handleRemoveActionStepFromForm = (idx: number) => {
    setNewActionStepsList((prev) => prev.filter((_, i) => i !== idx));
  };

  // AI-Assisted Smart Draft Recommendation Script logic
  const handleTriggerAiDraftGenerator = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      if (newType === "educational") {
        setNewTitle("برنامه بهسازی عمیق تراز درس حقوق مدنی و آیین دادرسی مدنی");
        setNewNotes("توصیه مشورتی تحصیلی: مقرر شد داوطلب عزیز بر تحلیل تست‌های کارگاهی نزده یا نادرست متمرکز شده و با هدف‌گذاری پله‌ای تراز سراسری، ساعت مطالعه هفتگی خود را حداقل تا ۵ ساعت در باکس اختصاصی حقوق مدنی ارتقا دهد. یادگیری عقود معین و تمرین صلاحیت مراجع قضایی ضروری است.");
        setNewActionStepsList([
          "مرور جامع مبحث عقود بیع و ضمان معین با نمودارهای چتر دانش (صفحه ۴۵)",
          "حل روزانه ۱۵ تست تالیفی آیین دادرسی برای مهار مواعد شکایت از آرا",
          "ایجاد خلاصه نمودارهای تعهدات و مسئولیت مدنی بر روی دیوار مطالعه"
        ]);
        setNewHours(48);
      } else {
        setNewTitle("کاهش اضطراب ثانیه‌های پایانی آزمون وکالت و فرسودگی ذهنی");
        setNewNotes("توصیه مشورتی روانشناختی: بر اساس واکاوی اتمسفر خلقی داوطلب، مشخص شد تله‌های تراز کانون منجر به استرس شدید در پایان دفترچه آزمون می‌گردد. تجویز ۳ نوبت تنفس متمرکز شکمی قبل از نشستن سر جلسه و انجام پومودوروهای غلاف شده تراز شده در تمرینات خانه الزامی است.");
        setNewActionStepsList([
          "اجرای تکنیک تنفس آگاهانه کادری (تمرین ۴ ثانیه‌ای) ۳ بار در روز سر جلسه آزمون آزمایشی",
          "نوشتن جملات مثبت خودگویی و ایستایی روانی بر روی دفترچه خودکار چتر دانش",
          "تنظیم دقیق برنامه مانیتور خواب جهت تثبیت خواب عمیق شب آزمون"
        ]);
        setNewHours(42);
      }
      setIsAiGenerating(false);
    }, 850);
  };

  const handleCreateSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newNotes.trim()) return;

    const created: CounselingSession = {
      id: Date.now().toString(),
      type: newType,
      title: newTitle.trim(),
      date: newDate.trim() || "۱۴۰۵/۰۳/۰۱",
      counselorName: newCName.trim() || "دکتر کریمی",
      notes: newNotes.trim(),
      actionSteps: newActionStepsList.map(text => ({ text, completed: false })),
      recommendedStudyHours: newHours
    };

    const updated = [created, ...sessions];
    saveSessionsToLocal(updated);

    // Reset Form
    setNewTitle("");
    setNewNotes("");
    setNewActionStepsList([]);
    setNewHours(44);
  };

  const handleDeleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    saveSessionsToLocal(updated);
  };

  const handleToggleStepCompletion = (sessionId: string, stepIndex: number) => {
    const updated = sessions.map(s => {
      if (s.id === sessionId) {
        const steps = [...s.actionSteps];
        steps[stepIndex] = { ...steps[stepIndex], completed: !steps[stepIndex].completed };
        return { ...s, actionSteps: steps };
      }
      return s;
    });
    saveSessionsToLocal(updated);
  };

  return (
    <div className="space-y-6" id="counselor-parent-container">
      
      {/* Prime Header Block */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-blue-50 text-blue-800 text-[10px] font-black rounded-lg border border-blue-105">
              چتر دانش • اتاق دیجیتال مشاور ارشد حقوقی
            </span>
            <span className="text-slate-350 text-xs">•</span>
            <span className="text-[10px] text-slate-500 font-bold">پرونده فعال داوطلب: {student.name}</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">پنل مشاوره تحصیلی و سلامت روان</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            در این بخش می‌توانید به صورت هوشمند با مشاور گفتگو کرده یا پرونده جلسات مشاوره تحصیلی و روانشناسی خود را ثبت و پایش کنید.
          </p>
        </div>

        {/* Dynamic Dual Tab Selector */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 w-full md:w-auto self-stretch md:self-auto">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === "chat" 
                ? "bg-white text-blue-900 shadow-sm" 
                : "text-slate-650 hover:text-slate-900"
            }`}
          >
            <Sparkles size={14} className={activeTab === "chat" ? "text-indigo-600" : "text-slate-400"} />
            <span>اتاق گفتگوی زنده هوشمند</span>
          </button>
          
          <button
            onClick={() => setActiveTab("sessions")}
            className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === "sessions" 
                ? "bg-white text-indigo-950 shadow-sm font-black" 
                : "text-slate-650 hover:text-slate-900"
            }`}
          >
            <ClipboardList size={14} className={activeTab === "sessions" ? "text-emerald-600" : "text-slate-400"} />
            <span>ثبت و پیشینه جلسات مشاوره</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "chat" ? (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[72vh]"
            id="counselor-view-container"
          >
            {/* Helper Tips Sidebar (1 column) */}
            <div className="lg:col-span-1 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4" id="counselor-quick-tips">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span className="p-1 px-1.5 bg-amber-50 text-amber-600 rounded-lg"><HelpCircle size={15} /></span>
                  <h3 className="font-bold text-slate-800 text-sm">موضوعات داغ مشاوره</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  از سوالات پیشنهادی زیر برای شروع مشاوره هوشمند درسی بر اساس پرونده تراز خود استفاده کنید:
                </p>
                <div className="space-y-2 flex flex-col">
                  {quickQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickQuestionClick(q)}
                      className="w-full text-right p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-xs font-semibold leading-relaxed text-slate-700 transition cursor-pointer hover:border-slate-200"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-2.5">
                <AlertCircle size={15} className="text-blue-700 flex-shrink-0 mt-0.5" />
                <div className="text-[10px] text-blue-900 leading-relaxed font-semibold">
                  مشاور هوشمند چتر دانش به پرونده درسی، درصدهای شبیه‌سازها و اهداف تراز شما دسترسی داشته و پاسخ‌هایی اختصاصی صادر می‌کند.
                </div>
              </div>
            </div>

            {/* Live Chat Box (3 columns) */}
            <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden" id="counselor-live-chat-box">
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center text-xs font-bold font-sans">
                      مشاور
                    </div>
                    <span className="absolute -bottom-0.5 -left-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 text-sm block">آقای رادان (مشاور تحصیلی هوشمند)</span>
                    <span className="text-[10px] text-emerald-600 font-bold block">آماده به پاسخگویی • آنلاین</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-blue-900 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">پرونده: {student.name}</span>
              </div>

              {/* Chat conversations */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/25 scroll-smooth" id="chat-messages-scroller">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold flex-shrink-0 text-xs ${
                      msg.role === "user" ? "bg-amber-500 text-white" : "bg-blue-900 text-white"
                    }`}>
                      {msg.role === "user" ? <User size={13} /> : <Sparkles size={13} className="text-amber-305" />}
                    </div>
                    <div className="max-w-[75%] space-y-1">
                      <div className={`p-3.5 rounded-2xl shadow-sm text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "bg-amber-500 text-white rounded-tr-none"
                          : "bg-white text-slate-800 border border-slate-100 rounded-tl-none font-sans"
                      }`}>
                        {msg.content}
                      </div>
                      <span className={`block text-[9.5px] text-slate-400 font-mono ${msg.role === "user" ? "text-left" : "text-right"}`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}

                {sending && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center">
                      <Sparkles size={13} className="text-amber-300 animate-spin" />
                    </div>
                    <div className="bg-white p-3 py-2.5 rounded-2xl border border-slate-100 rounded-tl-none shadow-sm flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input wrapper */}
              <div className="p-4 bg-white border-t border-slate-100">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(inputMessage);
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="دیدگاه، پرسش درسی یا موضوع آزمونی خود را تایپ نمایید..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-slate-800"
                  />
                  <button
                    type="submit"
                    disabled={sending || !inputMessage.trim()}
                    className="bg-blue-900 hover:bg-blue-950 text-white p-3 rounded-xl transition disabled:opacity-50 cursor-pointer shadow-sm flex-shrink-0"
                  >
                    <Send size={15} className="rotate-180" />
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="sessions"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            id="counseling-sessions-workspace"
          >
            {/* Input & Create Form Panel (1 Column) */}
            <div className="lg:col-span-1 space-y-5 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm self-start">
              
              <div className="flex items-center gap-2 border-b border-slate-50 pb-3 justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 text-blue-900 rounded-lg">
                    <ClipboardList size={16} />
                  </div>
                  <h3 className="font-black text-slate-800 text-sm">ثبت جلسه جدید مشاوره</h3>
                </div>
                {/* AI helper draft generator trigger */}
                <button
                  type="button"
                  onClick={handleTriggerAiDraftGenerator}
                  disabled={isAiGenerating}
                  className="px-2.5 py-1 bg-amber-550 hover:bg-amber-500 text-slate-950 font-black text-[9px] rounded-lg border border-amber-300 transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95 disabled:opacity-50"
                  title="پیش‌نویس خودکار اهداف درسی و روانی کتبی برای مشاور"
                >
                  <Sparkles size={11} className={isAiGenerating ? "animate-spin" : ""} />
                  <span>{isAiGenerating ? "در حال تولید..." : "ایده‌دهی هوش سنج"}</span>
                </button>
              </div>

              <form onSubmit={handleCreateSessionSubmit} className="space-y-4 text-right">
                
                {/* Type Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 block">دسته‌بندی و نوع مشاوره برگزار شده:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewType("educational")}
                      className={`py-2 px-3 rounded-xl border text-center transition cursor-pointer text-xs font-bold flex items-center justify-center gap-1.5 ${
                        newType === "educational" 
                          ? "bg-indigo-50 border-indigo-200 text-indigo-900" 
                          : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      <BookOpen size={13} />
                      <span>۱. مشاوره تحصیلی و درسی</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewType("psychological")}
                      className={`py-2 px-3 rounded-xl border text-center transition cursor-pointer text-xs font-bold flex items-center justify-center gap-1.5 ${
                        newType === "psychological" 
                          ? "bg-rose-50 border-rose-200 text-rose-900" 
                          : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      <Brain size={13} />
                      <span>۲. مشاوره روانشناسی و خلاقیت</span>
                    </button>
                  </div>
                </div>

                {/* Session Title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block">موضوع و عنوان جلسه:</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="مثال: رفع ضعف تسلط بر قوانین خاص وکالت"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-900 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-800"
                  />
                </div>

                {/* Counselor & Date */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 block">نام مشاور ثبت‌کننده:</label>
                    <input
                      type="text"
                      value={newCName}
                      onChange={(e) => setNewCName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 block">تاریخ برگزاری جلسه:</label>
                    <input
                      type="text"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[10.5px] font-bold text-slate-800 font-mono text-center"
                    />
                  </div>
                </div>

                {/* Session Notes */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400">کلیت خلاصه صورتجلسه و رهنمودهای مشاور:</label>
                    <span className="text-[8.5px] text-slate-400">حداقل ۵ کلمه</span>
                  </div>
                  <textarea
                    required
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    rows={4}
                    placeholder="نکات کلیدی صحبت‌ها، تکنیک‌های مهارتی، ترازهایی که باید مرمت شوند را پر کنید..."
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-900 rounded-xl px-3 py-2.5 text-xs font-semibold leading-relaxed text-slate-700"
                  />
                </div>

                {/* Recommended weekly hours study slider */}
                <div className="space-y-1 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-extrabold text-slate-500">ساعت مطالعه هفتگی جدید پیشنهادی:</label>
                    <span className="text-xs font-black text-indigo-950 font-mono bg-white border px-2 py-0.5 rounded-lg">
                      {newHours} ساعت
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="80"
                    step="1"
                    value={newHours}
                    onChange={(e) => setNewHours(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-650 mt-1"
                  />
                </div>

                {/* Checklist Action Items Creator */}
                <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <label className="text-[10px] font-extrabold text-slate-500 block">اقدامات عملی متعهد شده برای داوطلب:</label>
                  
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={newActionInput}
                      onChange={(e) => setNewActionInput(e.target.value)}
                      placeholder="مثال: حل ۴۰ تست حقوق مدنی..."
                      className="flex-1 bg-white border border-slate-250 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); handleAddActionStep(e); }}
                      className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition cursor-pointer flex items-center justify-center flex-shrink-0"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Form Action steps display badge lists */}
                  {newActionStepsList.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-200/50">
                      {newActionStepsList.map((step, sIdx) => (
                        <div key={sIdx} className="flex justify-between items-center text-[10px] bg-white border border-slate-100 p-1.5 rounded-lg">
                          <span className="text-slate-600 font-bold max-w-[80%] break-all text-right pr-1">• {step}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveActionStepFromForm(sIdx)}
                            className="text-red-500 hover:text-red-700 text-[10px] font-bold px-1"
                          >
                            حذف
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-black text-white py-3 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <PlusCircle size={14} />
                  <span>ثبت و ذخیره در پرونده چتر دانش</span>
                </button>
              </form>
            </div>

            {/* Archive List & Visual Statistics Cards (2 Columns) */}
            <div className="lg:col-span-2 space-y-5">
              
              {/* Core analytics for sessions highlights */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4.5 rounded-2xl border border-indigo-100 shadow-sm flex items-center justify-between">
                  <div className="space-y-1 text-right">
                    <span className="text-[10px] font-bold text-slate-400 block">جلسات ثبت‌شده آموزشی</span>
                    <strong className="text-xl font-black text-indigo-900 font-mono">
                      {sessions.filter(s => s.type === "educational").length} جلسه
                    </strong>
                    <p className="text-[9px] text-slate-400">جهت ارتقای تراز و برنامه چتر دانش</p>
                  </div>
                  <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
                    <BookOpen size={20} />
                  </div>
                </div>

                <div className="bg-white p-4.5 rounded-2xl border border-rose-100 shadow-sm flex items-center justify-between">
                  <div className="space-y-1 text-right">
                    <span className="text-[10px] font-bold text-slate-400 block">جلسات درمانی و روانشناختی</span>
                    <strong className="text-xl font-black text-rose-700 font-mono">
                      {sessions.filter(s => s.type === "psychological").length} جلسه
                    </strong>
                    <p className="text-[9px] text-slate-400">جهت مهار اضطراب وکالت و تمرکز قضایی</p>
                  </div>
                  <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">
                    <Brain size={20} />
                  </div>
                </div>
              </div>

              {/* Saved Sessions Feed */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-700">تاریخچه کامل جلسات و مصوبات چتر دانش ({sessions.length} مورد)</span>
                  <span className="text-[9px] text-slate-400">بروزرسانی زنده بر مبنای اقدامات</span>
                </div>

                {sessions.length === 0 ? (
                  <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 shadow-sm space-y-2">
                    <p className="text-xs font-bold text-slate-500">هیچ پرونده مشاوره‌ای ثبت نگردیده است.</p>
                    <p className="text-[10px] text-slate-400">شما می‌توانید با کمک فرم ادمین سمت راست، اولین جلسه مشاوره را اضافه کنید.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <div 
                        key={session.id} 
                        className={`p-5 rounded-3xl bg-white border shadow-sm space-y-4 transition hover:shadow-md relative overflow-hidden ${
                          session.type === "educational" 
                            ? "border-l-4 border-l-indigo-600 border-slate-100" 
                            : "border-l-4 border-l-rose-500 border-slate-100"
                        }`}
                      >
                        {/* Background subtle graphics */}
                        <div className="absolute top-0 left-0 w-24 h-24 pointer-events-none opacity-[0.02] transform -translate-x-4 -translate-y-4">
                          {session.type === "educational" ? <BookOpen size={96} /> : <Brain size={96} />}
                        </div>

                        {/* Session Top Badges */}
                        <div className="flex flex-wrap items-center justify-between gap-2.5 relative z-10">
                          <div className="flex items-center gap-2">
                            {session.type === "educational" ? (
                              <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl text-[9.5px] font-black flex items-center gap-1">
                                <BookOpen size={11} className="text-indigo-600" />
                                <span>صنف: مشاوره تحصیلی</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-[9.5px] font-black flex items-center gap-1 animate-pulse">
                                <Brain size={11} className="text-rose-600" />
                                <span>صنف: مشاوره روانشناسی خلقی</span>
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-mono">{session.date}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-slate-100 border text-slate-650 px-2 py-0.5 rounded-lg font-bold">
                              برگزارکننده: {session.counselorName}
                            </span>
                            
                            {/* Trash Action */}
                            <button
                              onClick={() => handleDeleteSession(session.id)}
                              className="text-slate-400 hover:text-red-600 hover:bg-slate-50 p-1.5 rounded-lg transition"
                              title="حذف جلسه از آرشیو محلی"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Notes & Title */}
                        <div className="space-y-1.5 text-right relative z-10">
                          <h4 className="text-xs font-black text-slate-800 leading-normal">{session.title}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed font-semibold bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">
                            {session.notes}
                          </p>
                        </div>

                        {/* Visual study guide */}
                        <div className="flex items-center justify-between text-[10px] border-t border-slate-100 pt-3 flex-wrap gap-2 text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} className="text-indigo-500" />
                            <span className="font-bold text-slate-500">پیشنهاد ساعت مطالعه در برنامه درسی:</span>
                            <span className="text-indigo-950 font-black font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{session.recommendedStudyHours} ساعت در هفته</span>
                          </div>
                          <span className="text-[9px] text-slate-350">ثبت پرونده در بستر رمز شده چتر دانش</span>
                        </div>

                        {/* Mini Checklist of action items */}
                        {session.actionSteps.length > 0 && (
                          <div className="bg-slate-50/30 p-3.5 rounded-2xl border border-slate-100 text-right space-y-2">
                            <span className="text-[9px] font-black text-slate-550 block flex items-center gap-1 justify-start">
                              <CheckSquare size={11} className="text-emerald-600" />
                              <span>لیست اقدامات مورد تعهد داوطلب چتر دانش (برای بررسی و تیک زدن):</span>
                            </span>

                            <div className="space-y-1.5">
                              {session.actionSteps.map((step, idx) => (
                                <div 
                                  key={idx}
                                  onClick={() => handleToggleStepCompletion(session.id, idx)}
                                  className={`flex items-start gap-2.5 p-2 rounded-xl border transition-all cursor-pointer select-none ${
                                    step.completed 
                                      ? "bg-emerald-50/30 border-emerald-150" 
                                      : "bg-white border-slate-100 hover:border-slate-200"
                                  }`}
                                >
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                                    step.completed 
                                      ? "bg-emerald-600 border-emerald-600 text-white" 
                                      : "border-slate-300 bg-white"
                                  }`}>
                                    {step.completed && <Check size={10} strokeWidth={4} />}
                                  </div>
                                  <span className={`text-xs font-bold leading-normal ${
                                    step.completed ? "text-slate-400 line-through" : "text-slate-700"
                                  }`}>
                                    {step.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
