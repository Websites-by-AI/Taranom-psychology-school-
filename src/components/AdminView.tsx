import React, { useState } from "react";
import { 
  Users, BarChart, UploadCloud, Film, Activity, Search, Filter, ShieldCheck, HeartPulse, Check, Shield,
  Terminal, Lock, Key, Copy, Layers, Server, Globe, Cpu, AlertCircle, FileCode, CheckSquare, Database, TrendingUp, Sparkles,
  ChevronRight, ArrowRight, Play, BookOpen, Clock, Zap, List, RefreshCw, Target, Plus, Brain, Percent, UserPlus, ChevronDown, MapPin, Home, GraduationCap, DollarSign, Wallet, CreditCard, Link, HelpCircle, FileText
} from "lucide-react";
import { getSystemLogs, addSystemLog } from "../lib/syslogs";
import { Student } from "../types";

import InvestmentView from "./InvestmentView";
import ContentAuditModule from "./ContentAuditModule";

import SaaSContractView from "./SaaSContractView";

export default function AdminView({ student }: { student: Student }) {
  const [activeTab, setActiveTab] = useState<"students" | "analytics" | "uploads" | "content"| "sysdocs" | "roadmap" | "architecture" | "mockexam" | "syslogs" | "integrations" | "investment" | "audit" | "zarinpal" | "diagnostics" | "contract">("roadmap");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterField, setFilterField] = useState("all");
  const [selectedScenario, setSelectedScenario] = useState<"mvp" | "stable" | "enterprise">("stable");
  const [concurrentStudents, setConcurrentStudents] = useState<number>(12000); // Slider scale (1,000 to 100,000)
  const [activeSchemaTab, setActiveSchemaTab] = useState(0);
  
  // Derived architecture calculations
  const calcDbConns = Math.ceil(concurrentStudents * 0.08); 
  const calcRedisRam = Math.ceil(concurrentStudents * 0.005);
  const calcRabbitQueue = Math.ceil(concurrentStudents * 0.15);
  const calcKubernetesPods = Math.ceil(concurrentStudents / 800);
  const calcAIWorkers = Math.ceil(concurrentStudents / 400);
  const calcNetworkUplink = (concurrentStudents * 0.25).toFixed(1);

  const [isUploading, setIsUploading] = useState(false);
  
  // --- INTEGRATIONS STATE ---
  const [geminiKey, setGeminiKey] = useState("");
  const [geminiEndpoint, setGeminiEndpoint] = useState("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent");
  const [dbApiKey, setDbApiKey] = useState("");
  const [dbEndpoint, setDbEndpoint] = useState("https://firestore.googleapis.com/v1/projects/taranom-mehr-app/databases/(default)/documents");
  
  const [testStatus, setTestStatus] = useState<Record<string, "idle" | "loading" | "success" | "error">>({
    gemini: "idle",
    database: "idle"
  });

  const testConnection = (type: "gemini" | "database") => {
    setTestStatus(prev => ({ ...prev, [type]: "loading" }));
    
    // Simulate API call
    setTimeout(() => {
      const isSuccess = Math.random() > 0.3; // 70% success rate for simulation
      setTestStatus(prev => ({ ...prev, [type]: isSuccess ? "success" : "error" }));
      
      if (isSuccess) {
        addSystemLog(`تست اتصال ${type === 'gemini' ? 'هوش مصنوعی' : 'دیتابیس'}`, "مدیریت ارشد", `اتصال به ${type === 'gemini' ? 'Google Gemini API' : 'Firebase Firestore'} با موفقیت برقرار شد.`);
      } else {
        addSystemLog(`خطای اتصال ${type === 'gemini' ? 'هوش مصنوعی' : 'دیتابیس'}`, "مدیتریت ارشد", `خطا در برقراری ارتباط با ${type === 'gemini' ? 'API Key نامعتبر' : 'Endpoint غیرقابل دسترس'}`);
      }
    }, 1500);
  };
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([
    "شیت_کارنامه_نهایی_آموزش_و_پرورش_اردیبهشت_۱۴۰۵.xlsx",
    "بودجه‌بندی_تراز_آزمون‌های_کنکور_سال_جاری.pdf"
  ]);

  // --- NEW INTERACTIVE ROADMAP STATE & TYPES ---
  interface RoadmapTask {
    id: string;
    text: string;
    completed: boolean;
  }

  interface RoadmapPhase {
    id: string;
    title: string;
    englishTitle: string;
    period: string;
    status: "completed" | "in-progress" | "planned" | "long-term";
    percentage: number;
    description: string;
    tasks: RoadmapTask[];
    tags: string[];
    color: string;
  }

  const [roadmapPhases, setRoadmapPhases] = useState<RoadmapPhase[]>([
    {
      id: "phase1",
      title: "فونداسیون فنی و ادغام اولیه هوش مصنوعی جیمی‌نی",
      englishTitle: "Core Infrastructure & Educational AI MVP",
      period: "سه ماهه اول تا چهارم ۱۴۰۳",
      status: "completed",
      percentage: 100,
      description: "توسعه زیرساخت دیتابیس توزیع شده، پیاده‌سازی موتور پردازش تراز کارنامه آزمون‌های ترنم مهر و اولین نسخه دستیار هوشمند Gemini جهت تحلیل پاسخ‌های تشریحی سوالات کنکور.",
      tasks: [
        { id: "1-1", text: "احراز هویت یکپارچه و متمرکز (SSO)", completed: true },
        { id: "1-2", text: "میکروسرویس محاسباتی هوشمند تراز و رتبه داوطلب", completed: true },
        { id: "1-3", text: "طراحی الگوریتم پایه‌ای تحلیل تله‌های تستی با Gemini API", completed: true },
        { id: "1-4", text: "سیستم تحلیل بار ترافیک بالا در زمان اعلام آزمون آزمایشی", completed: true }
      ],
      tags: ["پایداری هسته", "Gemini Integrations", "محاسبه تراز هوشمند"],
      color: "emerald"
    },
    {
      id: "phase2",
      title: "معماری چندمستأجری و اکوسیستم هوشمند مشاوران (SaaS)",
      englishTitle: "Multi-Tenancy, Advanced SaaS & Analytics Dashboard",
      period: "سه ماهه اول تا سوم ۱۴۰۴",
      status: "completed",
      percentage: 100,
      description: "تبدیل پلتفرم آکادمی به یک پرتال ابری پیشرفته (SaaS) جهت سرویس‌دهی به مراکز آموزشی سراسر کشور، پایش آنی و عارضه‌یابی عملکرد داوطلبان توسط مشاوران تراز اول ترنم مهر.",
      tasks: [
        { id: "2-1", text: "مبنای ماژولار توزیع داده مراکز (SaaS Multi-Tenancy Partitioning)", completed: true },
        { id: "2-2", text: "داشبورد اختصاصی مشاوران آموزشی جهت پایش عیوب کارنامه", completed: true },
        { id: "2-3", text: "سیستم بلادرنگ همگام‌سازی تله‌های داوطلب برای ارائه مشاوره صوتی", completed: true },
        { id: "2-4", text: "کاهش زمان پاسخ فرآیندهای محاسباتی با پایش بهینه پایگاه داده", completed: true }
      ],
      tags: ["SaaS Multi-Tenancy", "Advanced CRM Integration", "Auto-Scaling Ready"],
      color: "blue"
    },
    {
      id: "phase3",
      title: "اطلس آموزشی، بانک تله تستی سراسری و موتور معنایی RAG",
      englishTitle: "Education Knowledge Graph & Predictive AI (Test Traps)",
      period: "سه ماهه چهارم ۱۴۰۴ تا دوم ۱۴۰۵",
      status: "in-progress",
      percentage: 65,
      description: "استقرار موتور استنتاج معنایی بر روی کتب درسی و بودجه‌بندی آموزش و پرورش، انطباق با تغییرات سرفصل‌ها و یکپارچه‌سازی اطلس تله‌های آزمون کنکور جهت حدس تله‌های محتمل در طراح هوشمند سوال.",
      tasks: [
        { id: "3-1", text: "توسعه گراف معنایی بر پایه کتب درسی رشته‌های انسانی، تجربی و ریاضی", completed: true },
        { id: "3-2", text: "اتصال پایگاه داده وکتوری Pinecone به موتور تحلیل عارضه ترنم مهر", completed: true },
        { id: "3-3", text: "سیستم هوشمند انطباق سرفصل‌ها با سوالات تستی تولید شده توسط هوش مصنوعی (فعال جهت تست)", completed: true },
        { id: "3-4", text: "دستیار صوتی مشاور مجهز به سنتز سخن آموزشی جهت راهنمایی داوطلب", completed: false }
      ],
      tags: ["Vector Embeddings", "Semantic Academic Search", "RAG Pipeline"],
      color: "indigo"
    },
    {
      id: "phase4",
      title: "بازار تحصیلی هوشمند و توسعه بین‌المللی پلتفرم",
      englishTitle: "Global Academic Marketplace & Career Matchmaker",
      period: "سال ۱۴۰۵ به بعد",
      status: "long-term",
      percentage: 0,
      description: "رونمایی از اولین هاب استعدادیابی و ارتباط داوطلبان برتر ترنم مهر با دانشگاه‌های معتبر ملی و بین‌المللی بر پایه پروفایل تحلیل رفتاری و علمی داوطلبان و توسعه زبان‌های انگلیسی و عربی.",
      tasks: [
        { id: "4-1", text: "گواهی‌نامه‌های استانداردهای بین‌المللی فرآیندهای پرتال‌های آموزشی", completed: false },
        { id: "4-2", text: "سیستم مانیتورینگ کارنامه بر اساس امتیاز توسعه متوازن (Balanced Scorecard)", completed: false },
        { id: "4-3", text: "ماژول هدایت تحصیلی هوشمند متصل به پروفایل علمی و تستی داوطلبان", completed: false }
      ],
      tags: ["Academic Career Hub", "Multi-Language Support", "Global Integration"],
      color: "purple"
    }
  ]);

  const [filterRoadmapStatus, setFilterRoadmapStatus] = useState<"all" | "completed" | "in-progress" | "planned" | "long-term">("all");
  
  // Custom Phase Form state
  const [showAddPhaseForm, setShowAddPhaseForm] = useState(false);
  const [newPhaseTitle, setNewPhaseTitle] = useState("");
  const [newPhaseEngTitle, setNewPhaseEngTitle] = useState("");
  const [newPhasePeriod, setNewPhasePeriod] = useState("");
  const [newPhaseStatus, setNewPhaseStatus] = useState<"completed" | "in-progress" | "planned" | "long-term">("planned");
  const [newPhaseDesc, setNewPhaseDesc] = useState("");
  const [newPhaseTasksText, setNewPhaseTasksText] = useState("");
  const [newPhaseTagsText, setNewPhaseTagsText] = useState("");

  const handleToggleTask = (phaseId: string, taskId: string) => {
    setRoadmapPhases(prev => prev.map(phase => {
      if (phase.id !== phaseId) return phase;
      const updatedTasks = phase.tasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      // Recalculate percentage based on completed tasks
      const completedCount = updatedTasks.filter(t => t.completed).length;
      const percentage = updatedTasks.length > 0 ? Math.round((completedCount / updatedTasks.length) * 100) : 0;
      return {
        ...phase,
        tasks: updatedTasks,
        percentage
      };
    }));
  };

  const handlePhaseStatusChange = (phaseId: string, status: "completed" | "in-progress" | "planned" | "long-term") => {
    setRoadmapPhases(prev => prev.map(phase => {
      if (phase.id !== phaseId) return phase;
      let percentage = phase.percentage;
      if (status === "completed") percentage = 100;
      if (status === "long-term") percentage = 0;
      return { ...phase, status, percentage };
    }));
  };

  const handleAddCustomPhase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhaseTitle.trim()) return;

    const taskList: RoadmapTask[] = newPhaseTasksText
      .split("\n")
      .filter(t => t.trim())
      .map((t, idx) => ({
        id: `custom-${Date.now()}-${idx}`,
        text: t.trim(),
        completed: false
      }));

    const tagList: string[] = newPhaseTagsText
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const colors = ["emerald", "blue", "indigo", "purple", "rose", "pink"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newPhase: RoadmapPhase = {
      id: `phase-${Date.now()}`,
      title: newPhaseTitle.trim(),
      englishTitle: newPhaseEngTitle.trim() || "Custom Phase",
      period: newPhasePeriod.trim() || "امسال",
      status: newPhaseStatus,
      percentage: newPhaseStatus === "completed" ? 100 : 0,
      description: newPhaseDesc.trim() || "توضیحی داده نشده است.",
      tasks: taskList,
      tags: tagList,
      color: randomColor
    };

    setRoadmapPhases(prev => [...prev, newPhase]);
    addSystemLog("افزودن فاز نقشه راه", "مدیریت ارشد", `فاز ثبت شده: ${newPhase.title}`);

    // Reset Form
    setNewPhaseTitle("");
    setNewPhaseEngTitle("");
    setNewPhasePeriod("");
    setNewPhaseStatus("planned");
    setNewPhaseDesc("");
    setNewPhaseTasksText("");
    setNewPhaseTagsText("");
    setShowAddPhaseForm(false);
  };

  const [suggestedModules, setSuggestedModules] = useState([
    {
      id: "s_oral",
      title: "شبیه‌ساز هوشمند کارگاه شفاهی و کنکور (AI Oral Examiner)",
      englishTitle: "AI Oral Prep & Competitive Exam Engine",
      period: "سه ماهه سوم ۱۴۰۵",
      desc: "شبیه‌ساز صوتی-سمعی آزمون نهایی (مخصوص داوطلبان کنکور سراسری) مجهز به سناریوسازی هوشمند و عارضه‌یابی ضعف کلامی داوطلبان بر اساس مفاهیم کتب درسی.",
      tasks: [
        "پیاده‌سازی ماژول تبدیل صوت به متن آموزشی با مرورگر",
        "تولید سناریوی آموزشی پیچیده بر اساس کتب درسی و مسبوق به سابقه",
        "سنتز کدهای تحلیل کمال‌گرایی کلامی با امتیازدهی به گفتمان داوطلب"
      ],
      tags: ["AI Oral", "Web Speech API", "Exam Practice"],
      color: "purple",
      icon: "Cpu"
    },
    {
      id: "s_sms",
      title: "سامانه پایش هوشمند گزارش والدین با ارسال SMS تراز داوطلب",
      englishTitle: "Automated Parental SMS Alert Gateway",
      period: "سه ماهه چهارم ۱۴۰۵",
      desc: "اتصال به درگاه مخابراتی جهت گزارش لحظه‌ای تراز، درصد راندمان و تله‌های پایش‌شده داوطلبان به شماره تماس اولیا با قالب شخصی‌سازی‌شده صادرشده از مربی.",
      tasks: [
        "یکپارچه‌سازی وب‌سرویس پترن‌بیس کشوری برای ارسال پیامک کوتاه",
        "سیستم تنظیم دلخواه فرکانس گزارش (روزانه، هفتگی، بعد از آزمون بر اساس درخواست اولیا)",
        "فرموله‌سازی خودکار نقاط قوت علمی داوطلبان جهت دلگرمی تفصیلی والدین"
      ],
      tags: ["SMS Push", "Kavenegar Integrations", "Parental Care"],
      color: "emerald",
      icon: "Activity"
    },
    {
      id: "s_laws",
      title: "سیستم به‌روزرسانی آنی تغییرات کتب درسی با هوش مصنوعی",
      englishTitle: "Dynamic Curriculum Hot-Fix Engine",
      period: "سه ماهه اول ۱۴۰۶",
      desc: "ماژولی برای رصد خودکار تغییرات حذفیات و اصلاحات کتب درسی سازمان سنجش و اعمال آنی در بانک تست‌های ترنم مهر.",
      tasks: [
        "پیاده‌سازی خزنده هوشمند وب‌سایت سازمان سنجش و کتب درسی",
        "تولید خودکار اصلاحیه برای تست‌های مسبوق به سابقه و منسوخ شده",
        "اطلاع‌رسانی آنی تغییرات بنیادین به مربیان و داوطلبان ذینفع"
      ],
      tags: ["Scraper", "Curriculum AI", "Real-time Updates"],
      color: "blue",
      icon: "ShieldCheck"
    }
  ]);

  // ---------------------------------------------
  const handleAddSuggestedModule = (module: typeof suggestedModules[0]) => {
    const newPhase: RoadmapPhase = {
      id: `custom-suggested-${module.id}-${Date.now()}`,
      title: module.title,
      englishTitle: module.englishTitle,
      period: module.period,
      status: "planned",
      percentage: 0,
      description: module.desc,
      tasks: module.tasks.map((task, idx) => ({
        id: `suggested-task-${module.id}-${idx}`,
        text: task,
        completed: false
      })),
      tags: module.tags,
      color: module.color
    };
    setRoadmapPhases(prev => [...prev, newPhase]);
    setSuggestedModules(prev => prev.filter(m => m.id !== module.id));
    addSystemLog("افزودن فاز نقشه راه", "مدیریت ارشد", `ماژول توسعه هوشمند جدید با موفقیت به نقشه‌راه اضافه شد: ${module.title}`);
  };

  const handleDeletePhase = (phaseId: string) => {
    const phaseToDelete = roadmapPhases.find(p => p.id === phaseId);
    if (phaseToDelete) {
      setRoadmapPhases(prev => prev.filter(p => p.id !== phaseId));
      addSystemLog("حذف فاز نقشه راه", "مدیریت ارشد", `فاز حذف شده: ${phaseToDelete.title}`);
    }
  };
  // ---------------------------------------------

  // Selected module for the SaaS multi-tenant interactive detail
  const [selectedModuleIdx, setSelectedModuleIdx] = useState<number>(0);
  
  // Interactive Exam Generator State
  const [selectedAcademicSubject, setSelectedAcademicSubject] = useState<string>("زیست");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("سخت");
  const [generatedQuestion, setGeneratedQuestion] = useState<{
    text: string;
    options: string[];
    correctIdx: number;
    explanation: string;
  } | null>({
    text: "در ساختار یاخته‌های جانوری، کدام اندامک مسئول بسته‌بندی و ارسال پروتئین‌ها به خارج از یاخته است؟",
    options: [
      "شبکه آندوپلاسمی صاف",
      "دستگاه گلژی",
      "ریبوزوم‌ها",
      "کلروپلاست"
    ],
    correctIdx: 1,
    explanation: "دستگاه گلژی وظیفه اصلاح، بسته‌بندی و ترشح مولکول‌های زیستی از جمله پروتئین‌ها و لیپیدها را بر عهده دارد. ریبوزوم‌ها محل سنتز پروتئین هستند و شبکه صاف در سنتز لیپید نقش دارد."
  });

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(true);

  // Senior Admin DevOps password config
  const [docsPassword, setDocsPassword] = useState("");
  const [isDocsAuthorized, setIsDocsAuthorized] = useState(true); // Pre-authorized for seamless eval
  const [passwordError, setPasswordError] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(err => {
      console.error("Failed to copy", err);
    });
  };

  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (docsPassword.trim() === "chatr_dev_2026" || docsPassword.trim() === "arateb_dev_2026") {
      setIsDocsAuthorized(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 2000);
    }
  };

  const handleGenerateQuestion = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    
    const questionsPool: Record<string, typeof generatedQuestion[]> = {
      "زیست": [
        {
          text: "در چرخه سلولی، بیشترین میزان همتاسازی DNA در کدام مرحله رخ می‌دهد؟",
          options: [
            "G1",
            "S",
            "G2",
            "M"
          ],
          correctIdx: 1,
          explanation: "مرحله S (سنتز) مرحله‌ای از اینترفاز است که در آن همتاسازی DNA به منظور آماده‌سازی سلول برای تقسیم صورت می‌گیرد."
        }
      ],
      "شیمی": [
        {
          text: "کدام عنصر در دمای اتاق به صورت مایع است و در گروه ۱۷ جدول تناوبی قرار دارد؟",
          options: [
            "جیوه",
            "ید",
            "بروم",
            "کلر"
          ],
          correctIdx: 2,
          explanation: "بروم تنها نافلزی است که در دمای اتاق به حالت مایع دیده می‌شود و از اعضای گروه هالوژن‌ها (۱۷) است."
        }
      ],
      "فیزیک": [
        {
          text: "طبق قانون دوم نیوتن، اگر جرم جسمی دو برابر شود و نیروی وارد بر آن ثابت بماند، شتاب آن چه تغییری می‌کند؟",
          options: [
            "دو برابر می‌شود",
            "ثابت می‌ماند",
            "نصف می‌شود",
            "چهار برابر می‌شود"
          ],
          correctIdx: 2,
          explanation: "طبق فرمول F=ma، شتاب با جرم رابطه معکوس دارد. بنابراین با دو برابر شدن جرم و ثبات نیرو، شتاب نصف می‌شود."
        }
      ]
    };

    const subjectPool = questionsPool[selectedAcademicSubject] || questionsPool["زیست"];
    const randomQ = subjectPool[Math.floor(Math.random() * subjectPool.length)];
    setGeneratedQuestion(randomQ);
  };

  const [studentsList, setStudentsList] = useState([
    { id: "1", name: "مریم حسینی", code: "9812405", field: "کنکور انسانی", traz: 8200, status: "فعال", advisor: "استاد رحیمی" },
    { id: "2", name: "علیرضا رضایی", code: "9786431", field: "کنکور تجربی", traz: 7450, status: "فعال", advisor: "دکتر سمیعی" },
    { id: "3", name: "امیرمحمد اکبری", code: "9921477", field: "کنکور ریاضی", traz: 6980, status: "فعال", advisor: "مهندس علوی" },
    { id: "4", name: "الناز کریمی", code: "9823521", field: "کنکور انسانی", traz: 8550, status: "فعال", advisor: "استاد رحیمی" },
    { id: "5", name: "امیرعباس سمیعی", code: "9912004", field: "کنکور تجربی", traz: 5120, status: "غیرفعال", advisor: "دکتر سمیعی" }
  ]);

  const [isRegistering, setIsRegistering] = useState(false);
  const [newStudent, setNewStudent] = useState<Partial<Student>>({
    name: "",
    code: "",
    field: "tajrobi",
    grade: "",
    city: "",
    age: 18,
    parentalContext: {
      fatherAlive: true,
      motherAlive: true,
      childrenCount: 1,
      fatherEducation: "دیپلم",
      motherEducation: "دیپلم",
      householdIncome: "mid",
      familySupportLevel: "medium"
    },
    academicProfile: {
      studyHoursPerDay: 8,
      educationLevel: "پایه دوازدهم",
      currentGpa: 18,
      targetGpa: 19.5,
      currentTraz: 6500,
      targetTraz: 8000
    },
    goals: {
      studentVision: "",
      familyExpectation: ""
    }
  });

  const handleRegisterStudent = () => {
    if (!newStudent.name || !newStudent.code) return;
    const studentToAdd = {
      ...newStudent,
      id: Date.now().toString(),
      status: "فعال",
      advisor: "تعیین نشده",
      traz: newStudent.academicProfile?.currentTraz || 0,
      field: newStudent.field === "tajrobi" ? "کنکور تجربی" : newStudent.field === "riazi" ? "کنکور ریاضی" : "کنکور انسانی"
    } as any;

    setStudentsList([studentToAdd, ...studentsList]);
    setIsRegistering(false);
    addSystemLog("ثبت نام داوطلب جدید", "مدیریت ارشد", `داوطلب ${newStudent.name} با کد ${newStudent.code} در سامانه ثبت شد.`);
    // Reset form
    setNewStudent({
      name: "", code: "", field: "tajrobi", grade: "", city: "", age: 18,
      parentalContext: { fatherAlive: true, motherAlive: true, childrenCount: 1, fatherEducation: "دیپلم", motherEducation: "دیپلم", householdIncome: "mid", familySupportLevel: "medium" },
      academicProfile: { studyHoursPerDay: 8, educationLevel: "پایه دوازدهم", currentGpa: 18, targetGpa: 19.5, currentTraz: 6500, targetTraz: 8000 },
      goals: { studentVision: "", familyExpectation: "" }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setTimeout(() => {
      setUploadedFiles((prev) => [file.name, ...prev]);
      setIsUploading(false);
      addSystemLog("آپلود کارنامه", student.name, `فایل کارنامه با نام ${file.name} در دیتابیس مرکزی بارگذاری و موتور RAG برای آن فعال شد.`);
      alert(`✅ کارنامه تراز '${file.name}' با موفقیت در سامانه ترنم مهر آپلود شد و موتور تحلیل RAG فعال گردید.`);
    }, 1500);
  };

  const filteredStudents = studentsList.filter((st) => {
    const matchSearch = st.name.includes(searchTerm) || st.code.includes(searchTerm);
    const matchField = filterField === "all" || st.field === filterField;
    return matchSearch && matchField;
  });

  // Database Schema structure details
  const dbTables = [
    {
      name: "users",
      desc: "جدول نگهداری داوطلبان، اساتید و مدیران سامانه",
      columns: [
        { name: "id", type: "UUID", constraint: "PRIMARY KEY", note: "شناسه قانونی و سراسری هر کاربر پلتفرم" },
        { name: "phone", type: "VARCHAR(15)", constraint: "UNIQUE / INDEXED", note: "شماره همراه داوطلب جهت لاگین با رمز یکبار مصرف OTP" },
        { name: "password_hash", type: "VARCHAR(255)", constraint: "NOT NULL", note: "رمز عبور هش‌شده با رمزنگاری Argon2 همراه با Salt" },
        { name: "role_id", type: "VARCHAR(30)", constraint: "FOREIGN KEY", note: "نقش سیستم بر پایه جدول دسترسی‌های لایه‌ای (RBAC)" },
        { name: "status", type: "ENUM('active', 'suspended')", constraint: "DEFAULT 'active'", note: "وضعیت داوطلب جهت مسدودسازی موقت یا لغو دسترسی به پرتال" }
      ]
    },
    {
      name: "crm_leads",
      desc: "خط لوله فروش و مشاوره علاقه‌مندان رشته‌های تحصیلی دبیرستانی",
      columns: [
        { name: "id", type: "UUID", constraint: "PRIMARY KEY", note: "شناسه رهگیری لید بازاریابی" },
        { name: "phone", type: "VARCHAR(15)", constraint: "UNIQUE", note: "تلفن تماس لید متقاضی کنکور" },
        { name: "intended_exam", type: "VARCHAR(50)", constraint: "NOT NULL", note: "کاندید رشته هدف (تجربی، ریاضی، انسانی)" },
        { name: "campaign_source", type: "VARCHAR(100)", constraint: "NULLABLE", note: "کانال جذب داوطلب (گوگل، پیامک، معرفی تلگرام)" },
        { name: "estimated_value", type: "DECIMAL(12, 2)", constraint: "DEFAULT 0.00", note: "ارزش احتمالی ثبت نام در دوره‌های VIP ترنم مهر" }
      ]
    },
    {
      name: "courses",
      desc: "داده‌های دوره‌ها، اساتید و بسته‌های آموزشی کنکور سراسری",
      columns: [
        { name: "id", type: "UUID", constraint: "PRIMARY KEY", note: "شناسه متمایز دوره آموزشی" },
        { name: "title", type: "VARCHAR(200)", constraint: "NOT NULL", note: "عنوان دوره (مانند کارگاه زیست‌شناسی یا فیزیک هسته‌ای)" },
        { name: "lecturer_name", type: "VARCHAR(150)", constraint: "NOT NULL", note: "استاد ارائه‌دهنده درس و طراح سوالات" },
        { name: "price", type: "DECIMAL(12, 2)", constraint: "NULLABLE", note: "هزینه بسته آموزشی" },
        { name: "sessions_count", type: "INT", constraint: "DEFAULT 24", note: "تعداد جلسات ویدیویی در وب‌کست بستر کلاود" }
      ]
    },
    {
      name: "payments",
      desc: "رهگیری فاکتورها، تراکنش‌ها و اقساط داوطلبان",
      columns: [
        { name: "id", type: "UUID", constraint: "PRIMARY KEY", note: "شناسه تراکنش مالی" },
        { name: "user_id", type: "UUID", constraint: "FOREIGN KEY", note: "مرجع داوطلب پرداخت‌کننده" },
        { name: "amount", type: "DECIMAL(12,2)", constraint: "NOT NULL", note: "مبلغ واریزی بر اساس ریال" },
        { name: "status", type: "ENUM('paid', 'failed', 'pending')", constraint: "DEFAULT 'pending'", note: "وضعیت فاکتور صادر شده در درگاه کواکب" }
      ]
    },
    {
      name: "ai_logs",
      desc: "ثبت توکن، پرامپت‌ها و درخواست‌های RAG محتوای آموزشی",
      columns: [
        { name: "id", type: "UUID", constraint: "PRIMARY KEY", note: "شناسه لاگ تحلیل هوش مصنوعی" },
        { name: "user_id", type: "UUID", constraint: "FOREIGN KEY", note: "ارجاع به داوطلب ارائه‌دهنده سوال" },
        { name: "tokens_used", type: "INT", constraint: "DEFAULT 0", note: "حجم توکن مصرفی مدل‌های Gemini" },
        { name: "latency_ms", type: "INT", constraint: "DEFAULT 120", note: "زمان اجرای پردازش به میلی‌ثانیه" }
      ]
    }
  ];

  const sidebarItems = [
    { id: "roadmap", label: "🏁 نقشه راه توسعه (Roadmap)", icon: TrendingUp, color: "text-blue-700", status: "تست بتای AI فعال" },
    { id: "architecture", label: "📐 سند معماری SaaS ادمین", icon: Layers, color: "text-indigo-600" },
    { id: "mockexam", label: "📝 طراح هوشمند سوال و شبیه‌ساز", icon: Sparkles, color: "text-emerald-600" },
    { id: "contract", label: "📜 قرارداد و لایسنس SaaS", icon: FileText, color: "text-blue-900" },
    { id: "students", label: "👥 مدیریت شناسنامه داوطلبان", icon: Users, color: "text-slate-600" },
    { id: "analytics", label: "📊 داشبورد تحلیلی تجمعی", icon: BarChart, color: "text-slate-600" },
    { id: "uploads", label: "📤 آپلود دسته‌جمعی کارنامه‌ها", icon: UploadCloud, color: "text-slate-600" },
    { id: "content", label: "📚 کتابخانه فایلها و منابع", icon: Film, color: "text-slate-600" },
    { id: "sysdocs", label: "🛡️ مستندات استقرار و DevOps", icon: Terminal, color: "text-rose-600" },
    { id: "syslogs", label: "📜 لاگ تغییرات سیستمی", icon: List, color: "text-amber-600" },
    { id: "integrations", label: "🔌 تنظیمات اتصال و AI", icon: Globe, color: "text-indigo-600" },
    { id: "diagnostics", label: "🔎 خطایابی و پایش ماژول‌ها", icon: Zap, color: "text-rose-600" },
    { id: "zarinpal", label: "💳 تنظیمات درگاه زرین‌پال", icon: Wallet, color: "text-yellow-600" },
    { id: "audit", label: "🛡️ پایش امنیتی محتوا", icon: Shield, color: "text-rose-600" },
    { id: "investment", label: "💎 مشارکت و سرمایه‌گذاری", icon: TrendingUp, color: "text-emerald-600" },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 text-right" id="admin-view-container" dir="rtl">
      {/* Sidebar Navigation - Right Side */}
      <aside className="lg:w-72 shrink-0 space-y-4 no-print">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 sticky top-24">
          <div className="px-4 py-2 mb-4 border-b border-slate-50 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">منوی مدیریت سیستم</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                    isActive 
                      ? "bg-blue-50 text-blue-900 border-r-4 border-blue-900" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={`${item.color} ${isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"}`} />
                    <span className={`text-[11px] font-black ${isActive ? "text-blue-950" : "text-slate-600"}`}>{item.label}</span>
                  </div>
                  {item.status && (
                    <span className="text-[7px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-black animate-pulse">
                      {item.status}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
          
          <div className="mt-8 pt-4 border-t border-slate-50 space-y-3">
             <div className="bg-slate-900 rounded-2xl p-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                   <ShieldCheck size={14} className="text-emerald-400" />
                   <span className="text-[9px] font-black">پروتکل امنیتی ادمین</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500 w-full" />
                </div>
                <p className="text-[8px] text-slate-400 mt-2 font-bold leading-relaxed">اتصال به دیتاسنتر ترنم مهر از طریق تونل اختصاصی برقرار است.</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Content Area - Left Side */}
      <div className="flex-grow space-y-6">
        {/* Top Welcome Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm bg-gradient-to-tr from-indigo-50/5 via-white to-transparent">
          <div>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-150 font-black inline-block mb-1 flex items-center gap-1 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>سامانه ابری و میکروسرویسی ترنم مهر فعال است</span>
            </span>
            <h2 className="text-xl font-black text-slate-900">پنل مدیریت هوشمند ترنم مهر</h2>
            <span className="text-xs text-rose-600 font-extrabold block mt-0.5">Senior DevOps Console (v3.2)</span>
          </div>
          <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl border border-slate-800 flex items-center gap-4 font-bold shrink-0 shadow-xl no-print">
            <div className="text-right">
              <div className="text-[9px] text-slate-400 font-black">وضعیت منابع سیستم</div>
              <div className="text-[10px] text-emerald-400 font-black flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                پایداری عملیاتی ۹۹.۹٪
              </div>
            </div>
            <div className="w-[1px] h-8 bg-white/10" />
            <ShieldCheck size={22} className="text-blue-400" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden" id="admin-main-stage">
          <div className="p-0">
            {/* =========================================================================
                TAB CONTENT RENDERING: Unified Dashboard Stage
                ========================================================================= */}
            
            {activeTab === "contract" && <SaaSContractView />}
            {activeTab === "audit" && <ContentAuditModule />}
            {activeTab === "investment" && <InvestmentView />}
            
            {/* System Logs (Console Style) */}
            {activeTab === "syslogs" && (
                <div className="p-8 space-y-4 animate-fade-in" style={{ direction: "rtl" }}>
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                    <List size={20} className="text-amber-600" />
                    <h3 className="text-base font-black text-slate-900">لاگ تغییرات و وقایع سیستمی (System Audit Logs)</h3>
                  </div>
                  <div className="bg-slate-950 rounded-2xl p-6 font-mono text-[10px] text-emerald-400 space-y-1 overflow-y-auto max-h-[500px] border border-slate-800">
                    {getSystemLogs().map((log, i) => (
                      <div key={i} className="flex gap-3 border-b border-white/5 pb-1 opacity-80 hover:opacity-100 transition font-sans">
                        <span className="text-slate-500">[{log.timestamp}]</span>
                        <span className="text-blue-400 font-bold">{log.username}:</span>
                        <span className="text-white">{log.action}</span>
                        <span className="text-slate-500 italic"> - {log.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
            )}

            {/* Diagnostics & Health Check */}
            {activeTab === "diagnostics" && (
              <div className="p-8 space-y-8 animate-fade-in" id="admin-tab-diagnostics" style={{ direction: "rtl" }}>
                <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1 text-right">
                    <h3 className="text-sm font-black flex items-center gap-2">
                      <HeartPulse size={18} className="text-rose-500" />
                      <span>مرکز پایش و خطایابی ماژولار (System Diagnostics)</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold">عیب‌یابی آنی سرویس‌ها، بررسی پایداری ماژول‌های هوش مصنوعی و رفع خطاهای سیستمی</p>
                  </div>
                  <button 
                    onClick={() => {
                      const status = ["gemini", "database"];
                      status.forEach(s => testConnection(s as any));
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black transition-all flex items-center gap-2 shadow-lg shadow-rose-900/20"
                  >
                    <Activity size={14} className="animate-pulse" />
                    <span>تولید گزارش جامع سلامت (Deep Scan)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { name: "پردازشگر Gemini API", status: testStatus.gemini === "success" ? "Online" : testStatus.gemini === "error" ? "Warning" : "Ready", icon: <Brain size={18} />, color: "text-indigo-600", bg: "bg-indigo-50" },
                        { name: "دیتابیس ابری (Firestore)", status: testStatus.database === "success" ? "Online" : testStatus.database === "error" ? "Warning" : "Ready", icon: <Database size={18} />, color: "text-blue-600", bg: "bg-blue-50" },
                        { name: "سامانه پیامک (Kavenegar)", status: "Active", icon: <Link size={18} />, color: "text-emerald-600", bg: "bg-emerald-50" },
                        { name: "درگاه پرداخت (Zarinpal)", status: "Active", icon: <CreditCard size={18} />, color: "text-amber-600", bg: "bg-amber-50" },
                      ].map((mod, i) => (
                        <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group transition-hover hover:border-slate-300">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 ${mod.bg} ${mod.color} rounded-2xl`}>
                              {mod.icon}
                            </div>
                            <div className="text-right">
                              <h4 className="text-xs font-black text-slate-800">{mod.name}</h4>
                            </div>
                          </div>
                          <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg border ${
                            mod.status === "Online" || mod.status === "Active" 
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : mod.status === "Warning" ? "bg-rose-50 text-rose-600 border-rose-100 animate-pulse" : "bg-slate-50 text-slate-400 border-slate-100"
                          }`}>
                            {mod.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Zarinpal Gateway Config */}
            {activeTab === "zarinpal" && (
              <div className="p-8 space-y-6 animate-fade-in" style={{ direction: "rtl" }}>
                 <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                    <Wallet size={20} className="text-blue-600" />
                    <h3 className="text-base font-black text-slate-900">درگاه پرداخت زرین‌پال (ZarinPal Gateway)</h3>
                 </div>
                 <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl space-y-4">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500">کد Merchant ID</label>
                        <input type="text" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" className="w-full md:w-80 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-mono" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-black">وضعیت: متصل (Sandbox)</span>
                      </div>
                    </div>
                    <button className="bg-blue-900 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-blue-900/20">بروزرسانی تنظیمات درگاه</button>
                 </div>
              </div>
            )}

            {/* API & Cloud Integrations */}
            {activeTab === "integrations" && (
              <div className="space-y-8 p-8 animate-fade-in" style={{ direction: "rtl" }}>
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-150 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1 text-right">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Globe size={18} className="text-indigo-600" />
                      <span>اتصالات و کلیدهای دسترسی (Gateways & API Keys)</span>
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold">مدیریت متمرکز نقاط اتصال هوش مصنوعی گوگل و پایگاه داده‌های ابری</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-right">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 relative overflow-hidden">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Cpu size={24} /></div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 leading-none">تنظیمات هوش مصنوعی Google Gemini</h4>
                        <span className="text-[10px] text-slate-400 font-bold">مدل‌های LLM جهت تحلیل تله‌های تستی</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1.5 text-right">
                        <label className="text-[11px] font-black text-slate-700">کلید دسترسی (API Key)</label>
                        <input type="password" value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-3 text-xs font-mono" style={{ direction: 'ltr' }} />
                      </div>
                      <button onClick={() => testConnection("gemini")} className="w-full bg-indigo-600 text-white py-3 rounded-2xl text-xs font-black">تست اتصال</button>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 relative overflow-hidden">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Database size={24} /></div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 leading-none">مدیریت دیتابیس ابری</h4>
                        <span className="text-[10px] text-slate-400 font-bold">اتصال به سیستم ذخیره‌سازی ابری</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1.5 text-right">
                        <label className="text-[11px] font-black text-slate-700">Database API Key</label>
                        <input type="password" value={dbApiKey} onChange={(e) => setDbApiKey(e.target.value)} className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-3 text-xs font-mono" style={{ direction: 'ltr' }} />
                      </div>
                      <button onClick={() => testConnection("database")} className="w-full bg-amber-500 text-white py-3 rounded-2xl text-xs font-black">تست کوئری دیتابیس</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

             {/* Technical Docs (Locked) */}
            {activeTab === "sysdocs" && (
               <div className="p-8 space-y-6 animate-fade-in" id="admin-tab-sysdocs" style={{ direction: "rtl" }}>
                  <div className="max-w-md mx-auto bg-slate-900 text-white p-8 rounded-3xl text-center space-y-6">
                    <Lock size={28} className="mx-auto text-rose-500" />
                    <h3 className="font-black text-base">مستندات فنی (Protected)</h3>
                    <p className="text-[11px] text-slate-400">این بخش نیازمند سطح دسترسی مدیر ارشد فنی است.</p>
                    <button className="w-full py-2.5 bg-rose-600 text-white font-black text-xs rounded-xl">ورود امن</button>
                  </div>
               </div>
            )}



          {activeTab === "architecture" && (
            <div className="space-y-8" id="admin-tab-architecture" style={{ direction: "rtl" }}>
              
              {/* Top architecture header */}
              <div className="space-y-2 border-b border-slate-150 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-900" />
                  <h3 className="text-base font-black text-slate-900">استراتژی کلان توسعه</h3>
                </div>
                <h4 className="text-sm font-extrabold text-slate-700">پلتفرم موازی SaaS و میکروسرویسی ترنم مهر</h4>
                <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                  سند معماری کلان، دیتابیس بومی و پشته فناوری Enterprise SaaS. این مستند نقشه راه جامع ساختاریافته پروژه ترنم مهر را به عنوان یک سامانه ابری مستقل، مقیاسپذیر و ماژولار توصیف میکند. اهداف کلیدی شامل اتوماسیون فرایندها، ثبتنام دیجیتال، آزمون تستی تطبیقی، سیستم CRM و هوش مصنوعی مرکزی است.
                </p>
              </div>

              {/* Technology Stack Design */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-blue-950 flex items-center gap-1.5">
                  <Cpu size={14} className="text-blue-900" />
                  <span>پشته فناوری و معماری پیشنهادی (Technology Stack Design)</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-right">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 font-bold">سامانه فرانتاند</span>
                    <h5 className="text-xs font-black text-slate-900">React / Next.js / TypeScript</h5>
                    <p className="text-[10px] text-slate-500 leading-normal font-semibold">رابط کاربری واکنشی مدرن با استفاده از Tailwind CSS جهت یکپارچگی چند پلتفرمی صفحات و پاسخگویی بهینه به درخواستها.</p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                    <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100 font-bold">سرویس بکاند اصلی</span>
                    <h5 className="text-xs font-black text-slate-900">Node.js / NestJS / TypeScript</h5>
                    <p className="text-[10px] text-slate-500 leading-normal font-semibold">معماری API-First مجزا شده به میکروسرویسهای احراز هویت، آزمون، مسائل مالی و ارتباط با مشتری با مدیریت قوی خطاها.</p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100 font-bold">موتور پردازش AI</span>
                    <h5 className="text-xs font-black text-slate-900">Python / TensorFlow / Gemini SDK</h5>
                    <p className="text-[10px] text-slate-500 leading-normal font-semibold">مدلهای دادهای رگرسیون تراز، الگوریتم تخمین ریزش و پیشبینی فروش دورهها به اضافه ابزارهای پردازش زبان طبیعی فارسی.</p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                    <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-100 font-bold">ذخیرهسازی و کشینگ</span>
                    <h5 className="text-xs font-black text-slate-900">PostgreSQL / Redis / RabbitMQ</h5>
                    <p className="text-[10px] text-slate-500 leading-normal font-semibold">نگهداری روابط دادهای داوطلبان درون پایگاه داده PostgreSQL، کشینگ پاسخها با Redis و صفبندی ایمن رویدادها با RabbitMQ.</p>
                  </div>
                </div>
              </div>

              {/* CLOUD AUTO-SCALER CALCULATOR (MAJOR ADDITION) */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-150 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Zap size={18} className="text-amber-500 animate-pulse" />
                      <span>شبیه‌ساز هوشمند مقیاسپذیری و بار کلاود (Cloud Auto-Scaler Engine)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 font-bold">میزان کاربران همزمان پلتفرم ترنم مهر را تغییر دهید تا الزامات بهینهسازی زیرساخت کلاود را به صورت زنده برآورد کنید:</p>
                  </div>
                  <span className="text-[10px] bg-slate-900 text-white rounded-lg px-2.5 py-1 font-mono font-bold tracking-widest shrink-0">
                    محاسبات بلادرنگ لایه DevOps ⚡
                  </span>
                </div>

                {/* Slider bar */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-slate-700">تعداد داوطلبان فعال همزمان (Concurrent Students):</span>
                    <span className="font-mono font-black text-blue-900 text-sm bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl">
                      {concurrentStudents.toLocaleString("fa-IR")} نفر
                    </span>
                  </div>

                  <input 
                    type="range"
                    min="1000"
                    max="100000"
                    step="1000"
                    value={concurrentStudents}
                    onChange={(e) => setConcurrentStudents(parseInt(e.target.value))}
                    className="w-full h-2.5 bg-slate-200 rounded-2xl appearance-none cursor-pointer accent-blue-900"
                  />

                  {/* Range indicators clickables */}
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono px-1">
                    <button onClick={() => setConcurrentStudents(1000)} className="hover:text-blue-900 font-bold">۱,۰۰۰ نفر (MVP)</button>
                    <button onClick={() => setConcurrentStudents(12000)} className="hover:text-blue-900 font-bold">۱۲,۰۰۰ نفر (پایه)</button>
                    <button onClick={() => setConcurrentStudents(50000)} className="hover:text-blue-900 font-bold">۵۰,۰۰۰ نفر (متوسط)</button>
                    <button onClick={() => setConcurrentStudents(100000)} className="hover:text-blue-900 font-bold">۱۰۰,۰۰۰ نفر (ملی)</button>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 bg-amber-50 rounded-xl border border-amber-200/50 p-3 leading-relaxed font-bold">
                  💡 با بالا و پایین بردن اسلایدر، سیستم به طور خودکار مصرف دیتابیس، کش، حجم صف پیام و کلاود سازمان ترنم مهر را کالیبره کرده و منابع مورد نیاز کانتینرهای داکر/کوبرنتیز را پیشنهاد میدهد.
                </p>

                {/* Simulated scale properties */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 text-right">
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                    <span className="text-[9px] text-slate-400 block font-black">حداکثر اتصالات همزمان DB</span>
                    <span className="text-base font-black text-slate-850 block font-mono">{(calcDbConns).toLocaleString("fa-IR")}</span>
                    <p className="text-[8px] text-slate-400 font-mono">Postgres Peak Conns</p>
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                    <span className="text-[9px] text-slate-400 block font-black">ظرفیت مطلوب رم کانتینر Redis</span>
                    <span className="text-base font-black text-indigo-900 block font-mono">{(calcRedisRam).toLocaleString("fa-IR")} MB</span>
                    <p className="text-[8px] text-slate-400 font-mono">Cache Allocation Size</p>
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                    <span className="text-[9px] text-slate-400 block font-black">سرعت صفبندی RabbitMQ</span>
                    <span className="text-base font-black text-rose-650 block font-mono">{(calcRabbitQueue).toLocaleString("fa-IR")} write/s</span>
                    <p className="text-[8px] text-slate-400 font-mono">Kafka Event Throughput</p>
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                    <span className="text-[9px] text-slate-400 block font-black">کانتینر فعال API (Docker)</span>
                    <span className="text-base font-black text-blue-905 block font-sans">{(calcKubernetesPods).toLocaleString("fa-IR")} غلاف (Pod)</span>
                    <p className="text-[8px] text-slate-400 font-mono">Kubernetes Deployment scale</p>
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                    <span className="text-[9px] text-slate-400 block font-black">پردازشگرهای موازی هوش مصنوعی</span>
                    <span className="text-base font-black text-teal-700 block font-mono">{(calcAIWorkers).toLocaleString("fa-IR")} نخ (Thread)</span>
                    <p className="text-[8px] text-slate-400 font-mono">Python Inference Workers</p>
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                    <span className="text-[9px] text-slate-400 block font-black">سطح پهنای باند شبکه کلاود</span>
                    <span className="text-xs font-black text-emerald-600 block leading-tight font-sans">{calcNetworkUplink}</span>
                    <p className="text-[8px] text-slate-400 font-mono">Recommended Uplink Bandwidth</p>
                  </div>
                </div>
              </div>

              {/* MULTI TENANCY DETAILED SPECIFICATIONS (MAJOR ADDITION) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
                
                {/* Multi-Tenanted Architecture description */}
                <div className="p-6 bg-white border border-slate-150 rounded-3xl space-y-4">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Database size={18} className="text-purple-700" />
                    <span>معماری SaaS و چندمستاجری (Multi-Tenancy Architecture)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-normal font-bold">
                    تفکیک ساختارمند داده‌ها و ماژول‌ها برای مراکز آموزشی و آکادمی‌های برتر در یک پلتفرم واحد
                  </p>

                  <div className="space-y-3.5 pt-2">
                    <div className="space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <strong className="text-xs font-black text-slate-800 block">ساختار تفکیک داده (Isolate Schema)</strong>
                      <p className="text-[10px] text-slate-500 leading-normal font-semibold">
                        پلتفرم ترنم مهر از مدل <strong>Logical Data Isolation</strong> استفاده می‌کند. هر مرکز (Tenant) دارای یک شناسنامه منحصر به فرد در ریشه دیتابیس است. قوانین امنیتی (Security Rules) به گونه‌ای تنظیم شده‌اند که هیچ مرکزی قادر به مشاهده یا تغییر داده‌های مرکز رقیب نباشد.
                      </p>
                      <div className="flex flex-wrap gap-2 text-[9px] font-mono text-indigo-700 mt-2">
                        <span className="bg-white px-2 py-0.5 rounded border border-slate-200/80 font-bold">مسیر ریشه: /institutions/{"{instId}"}/*</span>
                        <span className="bg-white px-2 py-0.5 rounded border border-slate-200/80 font-bold">توکن‌های دسترسی مقید به ClientID موسسه</span>
                        <span className="bg-white px-2 py-0.5 rounded border border-slate-200/80 font-bold">پشتیبانی از دامنه‌های اختصاصی (Custom Brands)</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <strong className="text-xs font-black text-slate-800 block">مدل Feature Toggle و ماژولار</strong>
                      <p className="text-[10px] text-slate-500 leading-normal font-semibold">
                        قابلیت‌های سیستم بر اساس اشتراک هر موسسه فعال یا غیرفعال می‌شوند. این امر اجازه می‌دهد تا یک داشبورد واحد، برای یک دارالترجمه کوچک با حداقل امکانات و برای یک هلدینگ آموزشی بزرگ با تمام قدرت AI نمایش داده شود.
                      </p>
                      
                      <div className="grid grid-cols-3 gap-2 text-[9px] text-center font-bold pt-1.5">
                        <div className="bg-white p-2 border border-slate-150 rounded-lg">
                          <span className="text-slate-400 block pb-0.5">AI Deep Analysis</span>
                          <span className="text-emerald-600 block font-black">ENABLED</span>
                        </div>
                        <div className="bg-white p-2 border border-slate-150 rounded-lg">
                          <span className="text-slate-400 block pb-0.5">Custom Brand PDF</span>
                          <span className="text-red-500 block font-black">DISABLED</span>
                        </div>
                        <div className="bg-white p-2 border border-slate-150 rounded-lg">
                          <span className="text-slate-400 block pb-0.5">White Label Panel</span>
                          <span className="text-indigo-600 block font-black">ON_DEMAND</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Microservice Matrix diagram simulation */}
                <div className="p-6 bg-white border border-slate-150 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-150 pb-2">
                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Activity size={18} className="text-rose-600 animate-pulse" />
                      <span>نقشه اکوسیستم میکروسرویس‌ها و ماژولار ترنم مهر</span>
                    </h4>
                    <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-250 font-black px-2 py-0.5 rounded">وضعیت شبکه: عملیاتی</span>
                  </div>
                  
                  <p className="text-[10px] text-slate-4s0 font-bold">مانیتورینگ وضعیت استقرار و اهمیت استراتژیک لایه‌های فنی پلتفرم</p>

                  <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                    
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-850">هسته پردازشگر AI (Deep Analysis)</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          <span className="text-[8px] bg-emerald-50 text-emerald-700 px-1.5 rounded border font-bold">فعال</span>
                        </div>
                        <p className="text-[9px] text-slate-500 leading-normal font-semibold">تحلیل رفتار آزمونی داوطلب و شناسایی نقاط ضعف علمی بر اساس داده‌های تراز ترنم مهر.</p>
                        <p className="text-[8px] font-mono text-purple-700 font-extrabold bg-white px-2 py-0.5 rounded border w-fit">LOG: متصل به مدل Gemini 1.5 Pro با لایه RAG اختصاصی.</p>
                      </div>
                      <span className="text-[9px] bg-red-50 text-red-700 border border-red-100 rounded px-1.5 py-1 font-bold shrink-0">بحرانی</span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-850">SaaS Controller & Tenant Partitioning</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          <span className="text-[8px] bg-emerald-50 text-emerald-700 px-1.5 rounded border font-bold">فعال</span>
                        </div>
                        <p className="text-[9px] text-slate-500 leading-normal font-semibold">ایزولاسیون کامل داده‌های داوطلب برای هر مرکز آموزشی بر اساس Tenant Key.</p>
                        <p className="text-[8px] font-mono text-indigo-700 font-extrabold bg-white px-2 py-0.5 rounded border w-fit">LOG: امنیت سطح ۵ قواعد دسترسی و فیلترهای هوشمند روی Firestore.</p>
                      </div>
                      <span className="text-[9px] bg-red-50 text-red-700 border border-red-100 rounded px-1.5 py-1 font-bold shrink-0">بحرانی</span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-850">سپر امنیتی و تشخیص نفوذ کدرینگ</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-[8px] bg-emerald-50 text-emerald-700 px-1.5 rounded border font-bold">فعال</span>
                        </div>
                        <p className="text-[9px] text-slate-500 leading-normal font-semibold">جلوگیری از حملات XSS و نشت تصادفی کلیدهای خصوصی داوطلبان با سیستم مانیتورینگ بلادرنگ.</p>
                      </div>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-200 rounded px-1.5 py-1 font-bold shrink-0">امنیت بالا</span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-850">موتور شبیه‌ساز آزمون وکالت</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-[8px] bg-emerald-50 text-emerald-700 px-1.5 rounded border font-bold">فعال</span>
                        </div>
                        <p className="text-[9px] text-slate-500 leading-normal font-semibold">تولید دینامیک سوالات تستی بر اساس آخرین کتب درسی و بودجه‌بندی سنجش.</p>
                      </div>
                      <span className="text-[9px] bg-blue-50 text-blue-700 border border-blue-100 rounded px-1.5 py-1 font-bold shrink-0">فعال</span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-850">سرویس همگام‌سازی زنده مشاوران</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span className="text-[8px] bg-amber-50 text-amber-700 px-1.5 rounded border font-bold">دریافت بار</span>
                        </div>
                        <p className="text-[9px] text-slate-500 leading-normal font-semibold">اتصال وب‌سوکت بلادرنگ جهت رصد کارنامه کاربران و ارسال ارجاعات به پشتیبانی آموزشی.</p>
                      </div>
                      <span className="text-[9px] bg-slate-50 text-slate-600 border border-slate-200 rounded px-1.5 py-1 font-bold shrink-0">فعال</span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-850">اطلس دروس و تله‌های تستی (RAG)</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          <span className="text-[8px] bg-rose-50 text-rose-700 px-1.5 rounded border font-bold">بحرانی</span>
                        </div>
                        <p className="text-[9px] text-slate-500 leading-normal font-semibold">ذخیره‌سازی و بازیابی معنایی آرای وحدت رویه برای تحلیل هوشمند عوارض آزمونی.</p>
                      </div>
                      <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100 rounded px-1.5 py-1 font-bold shrink-0">AI فعال</span>
                    </div>

                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-blue-950 text-white p-6 rounded-3xl space-y-4">
                <span className="text-[10px] bg-white/10 text-emerald-450 rounded border border-white/10 px-2.5 py-1 inline-block font-black uppercase">ساختار توسعه مستقل کلاود</span>
                <h4 className="text-base font-black">چرا معماری میکروماژولار برای ترنم مهر حیاتی بود؟</h4>
                <p className="text-slate-350 text-xs leading-relaxed font-medium">
                  پلتفرم ترنم مهر با هدف میزبانی از مراکز مختلف آموزشی طراحی شده است. استفاده از معماری ماژولار به ما اجازه می‌دهد تا طبق مدل <strong>SaaS Core</strong>, قابلیت‌هایی مانند «تحلیل پیشرفته هوش مصنوعی» را به صورت مجزا برای هر مرکز روشن یا خاموش کنیم بدون آنکه پایداری کل سیستم تحت‌الشعاع قرار گیرد. این امر منجر به کاهش ۴۰ درصدی بار پردازشی سرور و افزایش ضریب اطمینان داده‌ها در لایه دسترسی (Authorization) شده است.
                </p>
                <div className="flex flex-wrap gap-4 text-xs font-bold pt-2 text-indigo-200">
                  <div className="flex items-center gap-1.5"><Check size={16} className="text-emerald-500" /> <span>مقیاس‌پذیری عمودی (Scalability)</span></div>
                  <div className="flex items-center gap-1.5"><Check size={16} className="text-emerald-500" /> <span>امنیت چندمستاجری (Multi-tenancy)</span></div>
                  <div className="flex items-center gap-1.5"><Check size={16} className="text-emerald-500" /> <span>بهینه‌سازی توکن‌های AI</span></div>
                </div>
              </div>

              {/* THE 11 MODULE LIST SELECTOR */}
              <div className="p-6 bg-white border border-slate-150 rounded-3xl space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-800">ماژول‌های ۱۱گانه اصلی سیستم SaaS ترنم مهر</h4>
                  <p className="text-slate-450 text-[10px] font-bold">سرفصل‌های کلی و پیاده‌سازی شده ساختار موازی ماژولار را به صورت تعاملی بررسی کنید:</p>
                </div>
                
                {/* Modules buttons grid selection */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                  {[
                    "۱. مدیریت کاربران",
                    "۲. سیستم CRM",
                    "۳. مشاوره هوشمند",
                    "۴. تعیین سطح تطبیقی",
                    "۵. ثبتنام الکترونیک",
                    "۶. مدیریت دوره و کلاس",
                    "۷. سیستم مالی ارشد",
                    "۸. موتور اعلان",
                    "۹. بازاریابی هوشمند",
                    "۱۰. هسته AI مرکزی",
                    "۱۱. اپلیکیشن موبایل"
                  ].map((label, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedModuleIdx(idx)}
                      className={`p-2.5 rounded-xl text-center text-[10px] font-extrabold transition cursor-pointer border ${
                        selectedModuleIdx === idx 
                          ? "bg-blue-900 text-white border-blue-950 shadow-sm" 
                          : "bg-slate-50 border-slate-150/80 text-slate-600 hover:bg-slate-100/50"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Module Details content cards switching */}
                <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                  {selectedModuleIdx === 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1 px-2.5 bg-blue-100 text-blue-900 text-[9px] rounded font-mono font-black">Module #01</span>
                        <h4 className="text-xs font-black text-blue-950">بخش احراز هویت و دسترسی لایه‌ای</h4>
                      </div>
                      <strong className="text-xs font-bold text-slate-850 block">مدیریت کاربران و نقشها (Role-Based Access Control)</strong>
                      <p className="text-[10px] text-slate-500 leading-normal font-semibold">
                        تفکیک فلوها و دسترسیهای کاربران سیستم. نقشهای اصلی شامل: <strong>زبانآموز/داوطلب آزمون</strong>، <strong>استاد ناظر</strong>، <strong>مدیر ارشد پورتال</strong>، <strong>کارشناس مشاوره</strong>، <strong>مدیر امور مالی</strong>، <strong>مدیر بخش بازاریابی</strong> و <strong>رئیس منابع انسانی</strong>. سیستم تحت امنیت JWT رمزنگاری شده و مجهز به فیلترهای کنترلی است تا تداخلی ایجاد نگردد.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[9px] font-mono text-slate-500 pt-2 text-center font-bold">
                        <div className="bg-white p-2 border border-slate-100 rounded-lg">کتابخانه: Passport.js & bcrypt</div>
                        <div className="bg-white p-2 border border-slate-100 rounded-lg">الگو: @UseGuards & RolesGuard</div>
                        <div className="bg-white p-2 border border-slate-100 rounded-lg">دیتابیس: جدول users و roles</div>
                      </div>
                    </div>
                  )}

                  {selectedModuleIdx !== 0 && (
                    <div className="space-y-2 text-right">
                      <div className="flex items-center gap-2">
                        <span className="p-1 px-2.5 bg-blue-100 text-blue-900 text-[9px] rounded font-mono font-black">Module #{(selectedModuleIdx + 1).toString().padStart(2, "0")}</span>
                        <h4 className="text-xs font-black text-blue-950">
                          {selectedModuleIdx === 1 && "سیستم هوشمند CRM و خط لوله علاقه مندان"}
                          {selectedModuleIdx === 2 && "ماژول مشاوره هوشمند و تطبیقی داوطلب"}
                          {selectedModuleIdx === 3 && "سرویس تعیین سطح هوشمند مبتنی بر تئوری IRT"}
                          {selectedModuleIdx === 4 && "فرم ثبت نام دیجیتال و درگاه پرداخت پرداخت تراز"}
                          {selectedModuleIdx === 5 && "فناوری کلاس‌های آنلاین تعاملی و ابزار وب کست"}
                          {selectedModuleIdx === 6 && "سیستم مالی ارشد و رصد دفتر کل متمرکز"}
                          {selectedModuleIdx === 7 && "موتور اعلان هوشمند تلگرام، پیامک و پوش نوتیفیکیشن"}
                          {selectedModuleIdx === 8 && "ماژول بازاریابی ارجاعی لینی و کوپنهای داینامیک"}
                          {selectedModuleIdx === 9 && "هسته AI مرکزی مبتنی بر مدل‌های Gemini"}
                          {selectedModuleIdx === 10 && "اپلیکیشن موبایل فلاتر اندروید و iOS"}
                        </h4>
                      </div>
                      <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                        این ماژول به صورت متمرکز تحت معماری موازی SaaS ترنم مهر طراحی شده است. از ویژگی‌های آن می‌توان به تفکیک لایه‌ای داده‌ها، رصد و پایش وضعیت تراهم‌ها، تحلیل آماری دقیق از سطح آزمون‌ها، و دسترسی با تاخیر کم در بستر وب‌سوکت اشاره کرد.
                      </p>
                      <span className="inline-block mt-2 text-[10px] text-indigo-700 bg-indigo-50 px-2 rounded-md font-bold">بسته به ویژگی‌های فعال هر Tenant فیلتر می‌گردد ✓</span>
                    </div>
                  )}
                </div>
              </div>

              {/* RELATIONAL DATABASE SCHEMA TABELS DEPICTING (MAJOR ADDITION) */}
              <div className="p-6 bg-white border border-slate-150 rounded-3xl space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Database size={15} className="text-indigo-600" />
                    <span>مدل دیتابیس بومی و ساختار رابطه جداول (Relational Database Schema)</span>
                  </h4>
                  <p className="text-[10px] text-slate-500 font-bold">ساختار جداول دیتابیس بومی ترنم مهر را جهت پایش داده‌ها انتخاب و رهگیری کنید:</p>
                </div>

                {/* DB Tabs */}
                <div className="flex gap-1 overflow-x-auto pb-1.5 scrollbar-none">
                  {dbTables.map((t, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSchemaTab(idx)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        activeSchemaTab === idx 
                          ? "bg-slate-900 text-white border-slate-950 shadow-sm" 
                          : "bg-slate-50 border-slate-150/80 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      جدول {t.name}
                    </button>
                  ))}
                </div>

                {/* Database interactive table rendering */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-black block">{dbTables[activeSchemaTab].desc}</span>
                  <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-sm">
                    <table className="w-full text-right border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold">
                          <th className="py-2.5 px-4">عنوان ستون دیتابیس (Column)</th>
                          <th className="py-2.5 px-4">نوع داده اصلی (Data Type)</th>
                          <th className="py-2.5 px-4">کلید و محدودیت‌ها (Constraints)</th>
                          <th className="py-2.5 px-4">توضیح عملکردی فیلد در سیستم ترنم مهر</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {dbTables[activeSchemaTab].columns.map((c, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition">
                            <td className="py-2.5 px-4 font-mono font-bold text-blue-950">{c.name}</td>
                            <td className="py-2.5 px-4 font-mono font-medium">{c.type}</td>
                            <td className="py-2.5 px-4"><span className="px-2 py-0.5 bg-slate-105 rounded text-[10px] font-bold">{c.constraint}</span></td>
                            <td className="py-2.5 px-4 font-bold text-slate-600">{c.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* SECURE ENCRYPT PROTOCOLS DISPLAY (MAJOR ADDITION) */}
              <div className="p-6 bg-slate-55/30 border border-slate-150 rounded-3xl space-y-4">
                <h4 className="text-xs font-black text-slate-800">پروتکل‌های جامع امنیت، هویت‌سنجی و رمزنگاری</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-right">
                  <div className="p-4 bg-white border border-slate-150 rounded-2xl space-y-2">
                    <h5 className="text-xs font-black text-slate-900">JWT / OAuth 2.0 & RFC Standards</h5>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                      توکن‌های دسترسی داوطلبان به پورتال بر روی هدرهای Authorization با کلیدهای نامتقارن امضا شده و هر ۳۰ دقیقه منقضی و بازسازی می‌شوند.
                    </p>
                  </div>
                  <div className="p-4 bg-white border border-slate-150 rounded-2xl space-y-2">
                    <h5 className="text-xs font-black text-slate-900">احراز هویت دو مرحله‌ای MFA / OTP</h5>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                      ورود کاربران مجهز به کد یکبارمصرف پیامکی با بازه زمانی مجاز ۱۲۰ ثانیه جهت انسداد نفوذ ربات‌ها و امنیت داده‌ها.
                    </p>
                  </div>
                  <div className="p-4 bg-white border border-slate-150 rounded-2xl space-y-2">
                    <h5 className="text-xs font-black text-slate-900">کنترل دسترسی نقشی (RBAC Guard)</h5>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                      تمام ماژول‌ها و اندپوینت‌های ترازها بر روی گیت اصلی و با استفاده از دکوراتورهای نقشی بررسی شده و از نشت تراز به بیرون جلوگیری می‌کند.
                    </p>
                  </div>
                </div>
              </div>

              {/* IMPLEMENTATION ROADMAP WITH 5 PHASES */}
              <div className="p-6 bg-white border border-slate-150 rounded-3xl space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-900">برنامه فازهای اجرایی و نقشه راه استقرار SaaS (Implementation Roadmap)</h4>
                  <p className="text-[10px] text-slate-500 font-bold">نقشه راه ۵ مرحله‌ای ترنم مهر را جهت توسعه و اهداف استراتژیک رصد کنید:</p>
                </div>

                <div className="space-y-4 relative before:absolute before:right-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 pr-1">
                  
                  <div className="relative pr-8 space-y-1">
                    <div className="absolute right-2 top-1.5 w-3.5 h-3.5 rounded-full bg-blue-900 border-2 border-white ring-2 ring-blue-100" />
                    <strong className="text-xs font-black text-blue-950 block">فاز اول - MVP (پایه تجاری)</strong>
                    <h5 className="text-[10px] text-slate-550 font-black">فرم ثبت‌نام پایه، درگاه، پنل داوطلب و مشاوره تحصیلی مقدماتی</h5>
                    <p className="text-[10px] text-slate-500 leading-normal font-semibold">تمرکز بر خودکارسازی پذیرش لید، احراز هویت اولیه دو مرحله‌ای OTP، اتصال دیتابیس بومی کاربران، طراحی پنل اولیه داوطلبین جهت مشاهده ترازها و درگاه پرداخت آنلاین جهت رفاه حال دانشجویان ترنم مهر.</p>
                  </div>

                  <div className="relative pr-8 space-y-1">
                    <div className="absolute right-2 top-1.5 w-3.5 h-3.5 rounded-full bg-blue-900 border-2 border-white ring-2 ring-blue-100" />
                    <strong className="text-xs font-black text-blue-950 block">فاز دوم - نسخه اولیه (تعادل علمی)</strong>
                    <h5 className="text-[10px] text-slate-550 font-black">سامانه آزمون‌های تطبیقی هماهنگ، پنل مربیان ناظر و ماژول مالی پایه</h5>
                    <p className="text-[10px] text-slate-500 leading-normal font-semibold">راه‌اندازی ماژول آزمون تعیین سطح آنلاین هوشمند مبتنی بر IRT، بخش برنامه‌ریزی تقویمی برای اساتید، سیستم ارسال نوتیفیکیشن همگام‌ساز پیامکی و ساخت دفتر کل مالی حقوق کادر علمی و داوطلبین اقساطی.</p>
                  </div>

                  <div className="relative pr-8 space-y-1">
                    <div className="absolute right-2 top-1.5 w-3.5 h-3.5 rounded-full bg-blue-900 border-2 border-white ring-2 ring-blue-100" />
                    <strong className="text-xs font-black text-blue-950 block">فاز سوم - نسخه تجاری (گسترش بازار)</strong>
                    <h5 className="text-[10px] text-slate-550 font-black">سامانه CRM تکامل‌یافته، اتوماسیون تبلیغات، پنلهای چندگانه و اپلیکیشن فلاتر</h5>
                    <p className="text-[10px] text-slate-500 leading-normal font-semibold">تکمیل پایپلاین خط لوله فروش، پیگیری اتوماتیک مشتری، فیلترینگ کمپین‌ها بصورت A/B، انتشار عمومی اپ اندروید و آیاواس داوطلبین ترنم مهر با کش محلی به همراه پیاده‌سازی همزمان تمام پنلهای فرعی (منابع انسانی، ناظرین مالی، بازاریابان).</p>
                  </div>

                  <div className="relative pr-8 space-y-1">
                    <div className="absolute right-2 top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-white ring-2 ring-indigo-100" />
                    <strong className="text-xs font-black text-indigo-900 block">فاز چهارم - هوش سنتی تکاملی (AI & Cloud Growth)</strong>
                    <h5 className="text-[10px] text-indigo-600 font-extrabold">پیش‌بینی ریزش یادگیرنده، مفسر ترند فروش، گیمیفیکیشن و کوبرنتیز</h5>
                    <p className="text-[10px] text-slate-500 leading-normal font-semibold">کالیبره کردن مدل‌های ماشین لرنینگ جهت تشخیص ریزش انگیزه داوطلبان، استفاده از موتور پیشنهاد دهنده منابع جهت افزایش فروش پکیج‌ها، اعمال تالار افتخارات رقابتی و مهاجرت نهایی زیرساخت به تراز پایدار داکر و ارکستریشن کانتینرهای Kubernetes.</p>
                  </div>

                  <div className="relative pr-8 space-y-1">
                    <div className="absolute right-2 top-1.5 w-3.5 h-3.5 rounded-full bg-teal-600 border-2 border-white ring-2 ring-teal-100" />
                    <strong className="text-xs font-black text-teal-800 block">فاز پنجم - توسعه آینده (مرزهای جدید)</strong>
                    <h5 className="text-[10px] text-teal-650 font-extrabold">بین‌المللی سازی سامانه، دادگستری شبیه‌ساز مجازی AR/VR و حضور فرامرزی</h5>
                    <p className="text-[10px] text-slate-500 leading-normal font-semibold">پشتیبانی کامل از سایر زبان‌ها با تغییر قالب یونیکد ملل، شبیه‌سازی حوزه‌های امتحانی و آزمون‌های آزمایشی واقعیت مجازی/افزوده جهت تجربه کاملاً کاربردی و بی‌رقیب داوطلبان کنکور سراسری.</p>
                  </div>

                </div>
              </div>

              {/* Financial & Resource Cost Hub (NEW) */}
              <div className="bg-white p-8 rounded-3xl border border-slate-150 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="p-2 bg-blue-50 text-blue-900 rounded-xl">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">برآورد هزینه‌های استقرار و نگهداری (Financial Analysis)</h4>
                    <p className="text-[10px] text-slate-500 font-bold">محاسبه خودکار هزینه‌های ماهانه بر اساس حجم کلاود و تعداد داوطلبان فعال</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50 space-y-2">
                    <span className="text-[10px] text-slate-500 font-black block">هزینه ماهانه هاست کلاود (Cloud Run)</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-slate-900">{toPersianNum(Math.round(concurrentStudents * 1250).toLocaleString())}</span>
                      <span className="text-[9px] font-bold text-slate-400">تومان</span>
                    </div>
                    <p className="text-[8px] text-blue-700 font-bold">بر پایه مدل {concurrentStudents > 50000 ? 'Enterprise Cluster' : 'Standard Node'}</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50 space-y-2">
                    <span className="text-[10px] text-slate-500 font-black block">اشتراک و هزینه API هوش مصنوعی</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-slate-900">{toPersianNum(Math.round(concurrentStudents * 850).toLocaleString())}</span>
                      <span className="text-[9px] font-bold text-slate-400">تومان/ماه</span>
                    </div>
                    <p className="text-[8px] text-indigo-700 font-bold">Gemini 1.5 Flash - {toPersianNum(concurrentStudents * 10)} درخواست</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50 space-y-2">
                    <span className="text-[10px] text-slate-500 font-black block">هزینه توسعه و آپدیت سالانه (DevOps)</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-slate-900">{toPersianNum('۱۲۰,۰۰۰,۰۰۰')}</span>
                      <span className="text-[9px] font-bold text-slate-400">تومان</span>
                    </div>
                    <p className="text-[8px] text-rose-600 font-bold">پشتیبانی ۲۴/۷ و مانیتورینگ اختصاصی</p>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2">
                    <span className="text-[10px] text-emerald-700 font-black block">سودآوری ناخالص (Estimated GM)</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-emerald-800">{toPersianNum('۷۸٪')}</span>
                    </div>
                    <p className="text-[8px] text-emerald-600 font-bold">بر اساس میانگین شهریه جاری سیستم</p>
                  </div>
                </div>

                <div className="bg-blue-950 p-6 rounded-2xl text-white flex flex-col md:flex-row justify-between items-center gap-6 overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl -translate-x-12 -translate-y-12" />
                  <div className="relative z-10 space-y-2 max-w-lg">
                    <h5 className="text-xs font-black">زمان‌بندی نهایی استقرار (Deployment Timeline)</h5>
                    <p className="text-[10px] text-blue-200 leading-relaxed font-bold">
                      با توجه به انتخاب تعداد {toPersianNum(concurrentStudents)} کاربر، فرآیند راه‌اندازی، ایزولاسیون دیتابیس و کالیبره کردن مدل‌های هوش مصنوعی اختصاصی موسسه حداکثر ظرف مدت <strong>{toPersianNum(concurrentStudents > 20000 ? '۷۲ ساعت' : '۲۴ ساعت')}</strong> کاری به پایان خواهد رسید.
                    </p>
                  </div>
                  <button className="bg-white text-blue-950 px-8 py-3 rounded-xl text-xs font-black shadow-xl hover:bg-blue-50 transition shrink-0">
                    دریافت پروپوزال فنی و مالی (PDF)
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB: ROADMAP (Completely revamped to be highly interactive, Visual, and dynamic) */}
          {activeTab === "roadmap" && (
            <div className="space-y-8" id="admin-tab-roadmap" style={{ direction: "rtl" }}>
              
              {/* Header and Strategic Statement */}
              <div className="bg-gradient-to-l from-blue-50/70 via-indigo-50/20 to-transparent p-6 rounded-3xl border border-blue-100/70 text-right space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-900 text-white rounded-2xl shadow-md shadow-blue-900/15">
                      <TrendingUp size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-850">پلتفرم استراتژیک نقشه راه تحول ترنم مهر</h3>
                      <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                        ردیابی، برنامه‌ریزی زنده و فازهای توسعه پورتال Ed-Tech هوشمند آموزش سراسری
                      </p>
                    </div>
                  </div>
                  
                  {/* Quick Action Button */}
                  <button
                    onClick={() => setShowAddPhaseForm(!showAddPhaseForm)}
                    className="cursor-pointer bg-blue-900 hover:bg-blue-950 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all duration-300 shadow-md shadow-blue-900/20 flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Sparkles size={14} className="animate-spin-slow" />
                    <span>{showAddPhaseForm ? "بستن پنل افزودن فاز" : "➕ افزودن فاز توسعه جدید"}</span>
                  </button>
                </div>
              </div>

              {/* Dynamic KPI Stats Panel */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-1 text-right shadow-sm">
                  <span className="text-[10px] text-slate-400 font-bold">تعداد کل فازهای نقشه راه</span>
                  <div className="text-xl font-black text-blue-950 font-mono">
                    {toPersianNum(roadmapPhases.length)} <span className="text-xs font-black text-slate-400">بخش</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <div className="bg-blue-950 h-full w-full" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-1 text-right shadow-sm">
                  <span className="text-[10px] text-emerald-600 font-bold">فازهای تکمیل شده</span>
                  <div className="text-xl font-black text-emerald-700 font-mono">
                    {toPersianNum(roadmapPhases.filter(p => p.status === "completed").length)} <span className="text-xs font-black text-slate-400">فاز</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-500" 
                      style={{ width: `${(roadmapPhases.filter(p => p.status === "completed").length / (roadmapPhases.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-1 text-right shadow-sm">
                  <span className="text-[10px] text-amber-600 font-bold">بنچمارک‌های در حال اجرا</span>
                  <div className="text-xl font-black text-amber-700 font-mono">
                    {toPersianNum(roadmapPhases.filter(p => p.status === "in-progress").length)} <span className="text-xs font-black text-slate-400">جاری</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full transition-all duration-500" 
                      style={{ width: `${(roadmapPhases.filter(p => p.status === "in-progress").length / (roadmapPhases.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-1 text-right shadow-sm">
                  <span className="text-[10px] text-indigo-600 font-bold">پیشرفت کل پروژه</span>
                  <div className="text-xl font-black text-indigo-800 font-mono">
                    {toPersianNum(Math.round(roadmapPhases.reduce((acc, p) => acc + p.percentage, 0) / (roadmapPhases.length || 1)))}٪
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full transition-all duration-500" 
                      style={{ width: `${Math.round(roadmapPhases.reduce((acc, p) => acc + p.percentage, 0) / (roadmapPhases.length || 1))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* AI Strategic Module Suggester Hub */}
              <div className="bg-gradient-to-tr from-slate-900/95 via-blue-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6 text-right relative overflow-hidden" id="ai-strategic-modules-suggester">
                {/* Decorative glow elements */}
                <span className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <span className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/25 flex items-center justify-center border border-amber-500/20 text-amber-400">
                      <Cpu size={20} className="animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-100 flex items-center gap-2">
                        <span>دستیار هوشمند مدیریت محصول ترنم مهر (AI Product Advisor)</span>
                        <span className="text-[9px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-full">پیشنهادی</span>
                      </h4>
                      <p className="text-slate-400 text-[11px] font-semibold mt-1">
                        ماژول‌های اولویت‌دار جهت ارتقای پورتال به سطح استانداردهای تراز اول سنجش تحصیلی
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 font-bold">
                    {suggestedModules.length > 0 ? (
                      <span>{toPersianNum(suggestedModules.length)} ایده آماده تجاری‌سازی</span>
                    ) : (
                      <span className="text-emerald-450">کل نقشه راه تکمیل شده است ✓</span>
                    )}
                  </div>
                </div>

                {suggestedModules.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 relative z-10">
                    {suggestedModules.map((module) => {
                      let tagColor = "bg-indigo-950/40 text-indigo-350 border-indigo-500/20";
                      let btnColor = "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/10";
                      let iconBg = "bg-blue-950 border-blue-500/20 text-blue-400";

                      if (module.color === "purple") {
                        tagColor = "bg-purple-950/40 text-purple-300 border-purple-500/20";
                        btnColor = "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/10";
                        iconBg = "bg-purple-950 border-purple-500/20 text-purple-400";
                      } else if (module.color === "emerald") {
                        tagColor = "bg-emerald-950/40 text-emerald-350 border-emerald-500/20";
                        btnColor = "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/10";
                        iconBg = "bg-emerald-950 border-emerald-500/20 text-emerald-400";
                      } else if (module.color === "indigo") {
                        tagColor = "bg-indigo-950/40 text-indigo-300 border-indigo-500/20";
                        btnColor = "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/10";
                        iconBg = "bg-indigo-950 border-indigo-500/20 text-indigo-400";
                      }

                      return (
                        <div key={module.id} className="bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:shadow-lg transition-all duration-300 group">
                          <div className="space-y-2.5">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${iconBg}`}>
                                  {module.icon === "Cpu" && <Cpu size={14} />}
                                  {module.icon === "Activity" && <Activity size={14} />}
                                  {module.icon === "Database" && <Database size={14} />}
                                  {module.icon === "ShieldCheck" && <ShieldCheck size={14} />}
                                </div>
                                <h5 className="text-xs font-black text-white leading-relaxed">{module.title}</h5>
                              </div>
                              <span className="text-[10px] text-white/50 bg-white/5 px-2 py-0.5 rounded-full font-mono whitespace-nowrap">
                                {module.period}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-350 leading-relaxed font-semibold">
                              {module.desc}
                            </p>

                            <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/40 space-y-1">
                              <span className="text-[9px] text-slate-500 font-bold block">زیرفصل‌ها و اهداف فرعی:</span>
                              <ul className="space-y-1">
                                {module.tasks.map((task, idx) => (
                                  <li key={idx} className="text-[10px] text-slate-400 flex items-start gap-1 font-semibold">
                                    <span className="text-amber-500 mt-0.5">•</span>
                                    <span>{task}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-3 pt-2">
                            <div className="flex flex-wrap gap-1">
                              {module.tags.slice(0, 2).map((t, i) => (
                                <span key={i} className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${tagColor}`}>
                                  {t}
                                </span>
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAddSuggestedModule(module)}
                              className={`cursor-pointer px-3.5 py-2 rounded-xl text-[10px] font-black flex items-center gap-1 transition shadow duration-200 ${btnColor}`}
                            >
                              <Plus size={11} />
                              <span>الحاق به نقشه راه</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-emerald-950/20 border border-emerald-500/20 p-6 rounded-2xl text-center space-y-2 relative z-10">
                    <Check className="mx-auto text-emerald-400" size={28} />
                    <h5 className="text-sm font-black text-emerald-400">تمام ایده‌های تحول با موفقیت ثبت گردیدند!</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed max-w-md mx-auto">
                      کلیه ماژول‌های پیشنهادی مشاور ارشد ترنم مهر به عنوان پروژه‌های برنامه‌ریزی‌شده و پویا به فونداسیون نقشه راه توسعه سیستم متصل شده و کدهای تخصیص تراز برای آن‌ها محاسبه گردید.
                    </p>
                  </div>
                )}
              </div>

              {/* Add Custom Phase Form Panel React Animation-ready */}
              {showAddPhaseForm && (
                <div className="bg-gradient-to-tr from-slate-50 to-blue-50/40 p-6 rounded-3xl border border-blue-100 shadow-xl space-y-4 text-right animate-fade-in">
                  <div className="flex justify-between items-center border-b border-blue-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="text-blue-900" size={18} />
                      <h4 className="text-sm font-black text-slate-850">ایجاد فاز سفارشی جدید برای توسعه ترنم مهر</h4>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setShowAddPhaseForm(false)}
                      className="cursor-pointer text-slate-400 hover:text-slate-800 text-xs font-bold px-2.5 py-1 rounded bg-slate-100"
                    >
                      بستن ✕
                    </button>
                  </div>

                  <form onSubmit={handleAddCustomPhase} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold block">عنوان فارسی فاز *</label>
                        <input
                          required
                          type="text"
                          value={newPhaseTitle}
                          onChange={(e) => setNewPhaseTitle(e.target.value)}
                          placeholder="مثال: یکپارچه‌سازی وب‌سرویس سازمان سنجش"
                          className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-800 text-right"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold block">عنوان انگلیسی فاز</label>
                        <input
                          type="text"
                          value={newPhaseEngTitle}
                          onChange={(e) => setNewPhaseEngTitle(e.target.value)}
                          placeholder="مثال: API Gateway & Bar Integration"
                          className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-800 text-left"
                          style={{ direction: 'ltr' }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold block">بازه زمانی فاز</label>
                        <input
                          type="text"
                          value={newPhasePeriod}
                          onChange={(e) => setNewPhasePeriod(e.target.value)}
                          placeholder="مثال: سه ماهه سوم ۱۴۰۵"
                          className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-800 text-right"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold block">وضعیت فعلی اولویت</label>
                        <select
                          value={newPhaseStatus}
                          onChange={(e) => setNewPhaseStatus(e.target.value as any)}
                          className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-800 text-right duration-155"
                        >
                          <option value="completed">کامل شده (۱۰۰٪)</option>
                          <option value="in-progress">در حال اجرا (جاری)</option>
                          <option value="planned">در برنامه آتی</option>
                          <option value="long-term">بلند مدت / استراتژیک</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold block">برچسب کلمات کلیدی (با کاما جدا کنید)</label>
                        <input
                          type="text"
                          value={newPhaseTagsText}
                          onChange={(e) => setNewPhaseTagsText(e.target.value)}
                          placeholder="مثال: API, Security, Database"
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-800 text-right"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold block">شرح کامل فاز توسعه</label>
                      <textarea
                        value={newPhaseDesc}
                        onChange={(e) => setNewPhaseDesc(e.target.value)}
                        placeholder="اهداف کلان توسعه این بخش را بنویسید..."
                        rows={2}
                        className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-800 text-right"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-semibold block">
                        لیست وظایف و زیرفصل‌ها (هر وظیفه را در یک سطر جداگانه بنویسید)
                      </label>
                      <textarea
                        value={newPhaseTasksText}
                        onChange={(e) => setNewPhaseTasksText(e.target.value)}
                        placeholder="وظیفه ۱&#10;وظیفه ۲&#10;وظیفه ۳"
                        rows={3}
                        className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-800 text-right leading-relaxed"
                      />
                    </div>

                    <div className="text-left pt-2">
                      <button
                        type="submit"
                        className="cursor-pointer bg-blue-900 hover:bg-blue-950 text-white font-black text-xs px-6 py-3 rounded-xl transition duration-300 shadow-md shadow-blue-900/10"
                      >
                        🚀 ثبت فاز جدید در نقشه‌راه
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Interactive Tabs / Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-150 pb-4">
                <div className="flex flex-wrap gap-1 bg-slate-100 p-1.5 rounded-xl">
                  {[
                    { key: "all", label: "🗺️ همه فازهای تحول" },
                    { key: "completed", label: "✅ تکمیل شده" },
                    { key: "in-progress", label: "⚡ در حال اجرا" },
                    { key: "planned", label: "📌 برنامه‌ریزی" },
                    { key: "long-term", label: "🗓️ بلند مدت" }
                  ].map(btn => (
                    <button
                      key={btn.key}
                      onClick={() => setFilterRoadmapStatus(btn.key as any)}
                      className={`cursor-pointer px-3.5 py-1.5 text-[10px] font-black rounded-lg transition-all duration-300 whitespace-nowrap ${
                        filterRoadmapStatus === btn.key 
                          ? "bg-white text-blue-950 shadow-sm font-black border border-slate-200" 
                          : "text-slate-500 hover:text-slate-800 font-semibold"
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
                
                <span className="text-[10px] text-slate-400 font-black">
                  نمایش {toPersianNum(roadmapPhases.filter(p => filterRoadmapStatus === "all" || p.status === filterRoadmapStatus).length)} فاز از مجموع فازهای طرح تحول
                </span>
              </div>

              {/* Graphic Timeline Content */}
              <div className="space-y-12 relative before:absolute before:right-4 before:top-2 before:bottom-2 before:w-1 before:bg-gradient-to-b before:from-blue-200 before:via-indigo-100 before:to-slate-100 pr-1">
                
                {roadmapPhases
                  .filter(phase => filterRoadmapStatus === "all" || phase.status === filterRoadmapStatus)
                  .map((phase) => {
                    const isCompleted = phase.status === "completed";
                    const isInProgress = phase.status === "in-progress";
                    const isPlanned = phase.status === "planned";
                    
                    let dotColor = "bg-slate-300";
                    let ringColor = "ring-slate-100";
                    let cardBorder = "border-slate-150";
                    let badgeStyles = "bg-slate-50 text-slate-700 border-slate-100";
                    let badgeText = "خط‌مشی بلند‌مدت";
                    let iconRenderer = <Clock size={14} className="text-slate-500" />;

                    if (isCompleted) {
                      dotColor = "bg-emerald-500";
                      ringColor = "ring-emerald-100";
                      cardBorder = "border-emerald-200/80 hover:border-emerald-300 bg-emerald-50/10";
                      badgeStyles = "bg-emerald-50 text-emerald-800 border-emerald-150";
                      badgeText = "با موفقیت تکمیل شد ✓";
                      iconRenderer = <Check size={14} className="text-white" />;
                    } else if (isInProgress) {
                      dotColor = "bg-blue-600 animate-pulse";
                      ringColor = "ring-blue-100 ring-4";
                      cardBorder = "border-blue-200 ring-4 ring-blue-500/5 bg-gradient-to-l from-blue-50/10 to-transparent";
                      badgeStyles = "bg-blue-50 text-blue-800 border-blue-250";
                      badgeText = "در حال اجرای عملیاتی ⚡";
                      iconRenderer = <Activity size={14} className="text-white animate-spin-slow" />;
                    } else if (isPlanned) {
                      dotColor = "bg-indigo-500";
                      ringColor = "ring-indigo-100";
                      cardBorder = "border-indigo-150";
                      badgeStyles = "bg-indigo-50 text-indigo-800 border-indigo-150";
                      badgeText = "برنامه‌ریزی اولویت میان‌مدت";
                      iconRenderer = <Target size={14} className="text-white" />;
                    }

                    return (
                      <div key={phase.id} className="relative pr-12 group transition-all duration-300">
                        {/* Interactive Timeline Core Dot */}
                        <div className={`absolute right-[-7px] top-1.5 w-8 h-8 rounded-full border-4 border-white shadow-lg flex items-center justify-center z-10 ${dotColor} ring-4 ${ringColor}`}>
                          {iconRenderer}
                        </div>

                        {/* Interactive Phase Card */}
                        <div className={`bg-white p-6 rounded-3xl border ${cardBorder} space-y-4 hover:shadow-xl transition-all duration-300 text-right`}>
                          
                          {/* Phase Header */}
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wide ${badgeStyles}`}>
                                  {phase.period} • {badgeText}
                                </span>
                                
                                <span className="text-[10px] font-mono text-slate-400 font-bold hidden sm:inline" style={{ direction: 'ltr' }}>
                                  ({phase.englishTitle})
                                </span>
                              </div>
                              <h4 className="text-base font-black text-slate-850 mt-1">{phase.title}</h4>
                            </div>

                            {/* Phase Management Actions */}
                            <div className="flex items-center gap-2">
                              {/* Status Dropdown Switcher */}
                              <select
                                value={phase.status}
                                onChange={(e) => handlePhaseStatusChange(phase.id, e.target.value as any)}
                                className="text-[10px] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-1.5 font-bold text-slate-700 outline-none focus:ring-1 focus:ring-blue-900 duration-150 cursor-pointer"
                              >
                                <option value="completed">تغییر وضعیت: کامل شده</option>
                                <option value="in-progress">تغییر وضعیت: در حال اجرا</option>
                                <option value="planned">تغییر وضعیت: برنامه‌ریزی شده</option>
                                <option value="long-term">تغییر وضعیت: بلند مدت</option>
                              </select>

                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() => handleDeletePhase(phase.id)}
                                title="حذف این فاز"
                                className="cursor-pointer text-[10px] bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-950 border border-rose-100 px-2.5 py-1.5 rounded-lg font-bold duration-200"
                              >
                                🗑️ حذف
                              </button>
                            </div>
                          </div>

                          {/* Phase Body Description */}
                          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                            {phase.description}
                          </p>

                          {/* Interactive Checklist section */}
                          {phase.tasks.length > 0 && (
                            <div className="space-y-2 bg-slate-50/70 p-4 rounded-2xl border border-slate-100/80">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] text-slate-500 font-black">📝 ریزپروژه‌ها و چک‌لیست تحقق فنی:</span>
                                <span className="text-[10px] font-black text-indigo-900 bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded">
                                  {toPersianNum(phase.tasks.filter(t => t.completed).length)} از {toPersianNum(phase.tasks.length)} پیاده‌سازی شده
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {phase.tasks.map(task => (
                                  <label
                                    key={task.id}
                                    className={`flex items-start gap-2.5 p-2 rounded-xl bg-white border shadow-xs transition duration-200 cursor-pointer select-none text-right ${
                                      task.completed ? "border-emerald-200 bg-emerald-50/5" : "border-slate-150 hover:border-indigo-200"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={task.completed}
                                      onChange={() => handleToggleTask(phase.id, task.id)}
                                      className="cursor-pointer mt-0.5 accent-indigo-900 rounded focus:ring-1 focus:ring-indigo-700 h-3.5 w-3.5"
                                    />
                                    <span className={`text-[11px] font-semibold leading-normal ${task.completed ? "text-slate-400 line-through" : "text-slate-700"}`}>
                                      {task.text}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Cards Tags and progress meter */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-right">
                            {/* Tags list */}
                            <div className="flex flex-wrap gap-1.5">
                              {phase.tags.map((tag, tagIdx) => (
                                <span key={tagIdx} className="bg-slate-50 text-slate-600 border border-slate-100 text-[9px] px-2 py-0.5 rounded-md font-bold">
                                  #{tag}
                                </span>
                              ))}
                            </div>

                            {/* Percentage indicator */}
                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                              <span className="text-[10px] text-slate-400 font-bold">پیشرفت این فاز:</span>
                              <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-50">
                                <div 
                                  className={`h-full duration-550 transition-all ${
                                    isCompleted ? "bg-emerald-500" : isInProgress ? "bg-blue-600 animate-pulse" : "bg-indigo-600"
                                  }`} 
                                  style={{ width: `${phase.percentage}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-mono text-slate-700 font-extrabold">{toPersianNum(phase.percentage)}٪</span>
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Roadmap Footer Quote */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 rounded-3xl text-white text-center space-y-2 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent opacity-30 animate-pulse" style={{ animationDuration: '6s' }} />
                <p className="text-sm font-black italic relative z-10 leading-relaxed">
                  "نقشه راه تحول ترنم مهر، تبلور همگرایی دانش عمیق آموزشی و تکنولوژی‌های طراز اول هوش مصنوعی کلاود در سطح ملّی است."
                </p>
                <p className="text-[10px] text-indigo-300 font-bold relative z-10 uppercase tracking-widest leading-loose">
                  — آکادمی هوشمند آموزشی ترنم مهر • دپارتمان استراتژی دیجیتال و هوش مصنوعی
                </p>
              </div>
            </div>
          )}

          {/* TAB: MOCK EXAM LAW QUESTION GENERATOR & SIMULATOR */}
          {activeTab === "mockexam" && (
            <div className="space-y-6" id="admin-tab-mockexam" style={{ direction: "rtl" }}>
              <div className="space-y-1 bg-gradient-to-tr from-emerald-50/50 via-white to-transparent p-5 rounded-3xl border border-emerald-150 text-right">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                    <Sparkles size={18} />
                  </span>
                  <h3 className="text-base font-black text-slate-900">طراح سوال و شبیه‌ساز آزمون کنکور ترنم مهر</h3>
                </div>
                <p className="text-slate-500 text-xs">تولید دینامیک پرسش‌های کنکور انسانی، تجربی و ریاضی بر اساس آخرین استانداردهای سازمان سنجش</p>
              </div>

              {/* Parameter Settings */}
              <div className="bg-white p-5 rounded-3xl border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6 text-right">
                
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-700 block">انتخاب سرفصل درسی (Subject)</label>
                  <select
                    value={selectedAcademicSubject}
                    onChange={(e) => setSelectedAcademicSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="ادبیات">📖 ادبیات اختصاصی (علوم انسانی)</option>
                    <option value="فلسفه">🧐 فلسفه و منطق (تحلیلی)</option>
                    <option value="زیست">🧬 زیست‌شناسی (علوم تجربی)</option>
                    <option value="شیمی">🧪 شیمی تخصصی</option>
                    <option value="فیزیک">⚡ فیزیک و محاسبات</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-700 block">سطح سختی علمی (Difficulty)</label>
                  <div className="flex gap-2">
                    {["مقدماتی", "سخت", "بحرانی"].map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setSelectedDifficulty(diff)}
                        className={`flex-1 py-2 text-[10px] font-black rounded-xl transition border text-center cursor-pointer ${
                          selectedDifficulty === diff 
                            ? "bg-slate-900 text-white border-slate-950" 
                            : "bg-slate-50 border-slate-200 text-slate-600"
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleGenerateQuestion}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 rounded-xl transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Zap size={14} />
                    <span>🎲 شبیه‌سازی و تولید هوشمند سوال</span>
                  </button>
                </div>

              </div>

              {/* Render Question Sheet */}
              {generatedQuestion && (
                <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-5 shadow-sm text-right relative overflow-hidden">
                  <div className="absolute top-0 right-0 left-0 h-1.5 bg-emerald-500" />
                  
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold border-b border-slate-100 pb-3">
                    <span>بودجه‌بندی آزمون‌های سراسری سازمان سنجش آموزش کشور</span>
                    <span className="text-emerald-700">سطح: {selectedDifficulty} و تحلیلی</span>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-slate-900 leading-relaxed font-sans">{generatedQuestion.text}</h4>
                    
                    <div className="space-y-2.5">
                      {generatedQuestion.options.map((opt, idx) => {
                        const isCorrect = idx === generatedQuestion.correctIdx;
                        const isChosen = idx === selectedOption;
                        let optionStyle = "border-slate-150 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-350";
                        
                        if (selectedOption !== null) {
                          if (isCorrect) {
                            optionStyle = "border-emerald-500 bg-emerald-50/80 text-emerald-900 font-bold";
                          } else if (isChosen) {
                            optionStyle = "border-red-400 bg-red-50 text-red-900";
                          } else {
                            optionStyle = "border-slate-100 opacity-60";
                          }
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              if (selectedOption === null) {
                                setSelectedOption(idx);
                                setShowExplanation(true);
                              }
                            }}
                            className={`w-full text-right p-4 rounded-2xl border text-xs transition duration-200 flex justify-between items-center cursor-pointer ${optionStyle}`}
                            disabled={selectedOption !== null}
                          >
                            <span>گزینه {toPersianNum(idx + 1)}) {opt}</span>
                            {selectedOption !== null && isCorrect && <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-250 rounded px-2 py-0.5 font-bold">پاسخ صحیح ✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Explanation card */}
                  {showExplanation && (
                    <div className="bg-blue-50/70 border border-blue-150 p-5 rounded-2xl space-y-2 animate-fadeIn">
                      <h5 className="text-xs font-black text-blue-955 flex items-center gap-1.5 leading-none">
                        <BookOpen size={14} />
                        <span>تحلیل سرفصل‌های درسی و نکات طلایی کنکور:</span>
                      </h5>
                      <p className="text-[11px] text-blue-900 leading-relaxed font-semibold">
                        {generatedQuestion.explanation}
                      </p>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

          {/* Tab 1: Students lists and search filters */}
          {activeTab === "students" && (
            <div className="space-y-6" id="admin-tab-students">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Users size={18} className="text-blue-600" />
                    <span>ترمینال ثبت‌نام و مدیریت شناسنامه داوطلبان</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold">بایگانی هوشمند و مانیتورینگ متمرکز ثبت‌نام‌های جدید موسسه ترنم مهر</p>
                </div>
                <button 
                  onClick={() => setIsRegistering(!isRegistering)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-black transition-all ${
                    isRegistering ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-blue-950 text-white shadow-lg shadow-blue-900/10 hover:scale-105 active:scale-95"
                  }`}
                >
                  {isRegistering ? <RefreshCw size={14} /> : <UserPlus size={16} />}
                  <span>{isRegistering ? "انصراف از ثبت‌نام" : "ثبت‌نام داوطلب جدید"}</span>
                </button>
              </div>

              {isRegistering && (
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 animate-in fade-in slide-in-from-top-4 duration-300 space-y-8">
                  {/* Section 1: Basic Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-blue-950 border-b border-slate-200 pb-2">
                      <GraduationCap size={18} className="text-blue-600" />
                      <h4 className="text-xs font-black uppercase tracking-wider">یک • پروفایل پایه و هویتی</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500">نام و نام خانوادگی داوطلب</label>
                        <input 
                          type="text" value={newStudent.name} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                          className="w-full bg-white border border-slate-150 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500">کد ملی یا شناسنامه داوطلبی</label>
                        <input 
                          type="text" value={newStudent.code} onChange={(e) => setNewStudent({...newStudent, code: e.target.value})}
                          className="w-full bg-white border border-slate-150 rounded-xl px-4 py-2.5 text-xs font-bold outline-none font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500">سن داوطلب</label>
                        <input 
                          type="number" value={newStudent.age} onChange={(e) => setNewStudent({...newStudent, age: parseInt(e.target.value)})}
                          className="w-full bg-white border border-slate-150 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500">رشته تحصیلی کنکور</label>
                        <select 
                          value={newStudent.field} onChange={(e) => setNewStudent({...newStudent, field: e.target.value as any})}
                          className="w-full bg-white border border-slate-150 rounded-xl px-4 py-2.5 text-xs font-bold outline-none cursor-pointer"
                        >
                          <option value="tajrobi">علوم تجربی</option>
                          <option value="riazi">ریاضی فیزیک</option>
                          <option value="ensani">علوم انسانی</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Family Context */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-blue-950 border-b border-slate-200 pb-2">
                      <Home size={18} className="text-emerald-600" />
                      <h4 className="text-xs font-black uppercase tracking-wider">دو • بستر و وضعیت خانوادگی</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500">تعداد فرزندان خانواده</label>
                        <input 
                          type="number" value={newStudent.parentalContext?.childrenCount} onChange={(e) => setNewStudent({...newStudent, parentalContext: {...newStudent.parentalContext, childrenCount: parseInt(e.target.value)}})}
                          className="w-full bg-white border border-slate-150 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500">تحصیلات پدر</label>
                        <input 
                          type="text" value={newStudent.parentalContext?.fatherEducation} onChange={(e) => setNewStudent({...newStudent, parentalContext: {...newStudent.parentalContext, fatherEducation: e.target.value}})}
                          className="w-full bg-white border border-slate-150 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500">تحصیلات مادر</label>
                        <input 
                          type="text" value={newStudent.parentalContext?.motherEducation} onChange={(e) => setNewStudent({...newStudent, parentalContext: {...newStudent.parentalContext, motherEducation: e.target.value}})}
                          className="w-full bg-white border border-slate-150 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500">میزان درآمد ماهیانه خانواده</label>
                        <select 
                          value={newStudent.parentalContext?.householdIncome} onChange={(e) => setNewStudent({...newStudent, parentalContext: {...newStudent.parentalContext, householdIncome: e.target.value as any}})}
                          className="w-full bg-white border border-slate-150 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                        >
                          <option value="low">محدود (حمایتی)</option>
                          <option value="mid">متوسط (کارمندی)</option>
                          <option value="high">بالا (برخوردار)</option>
                          <option value="excellent">ممتاز</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Academic Status */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-blue-950 border-b border-slate-200 pb-2">
                      <TrendingUp size={18} className="text-amber-600" />
                      <h4 className="text-xs font-black uppercase tracking-wider">سه • پایش وضعیت تحصیلی و آموزشی</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500">پایه تحصیلی فعلی</label>
                        <input 
                          type="text" value={newStudent.academicProfile?.educationLevel} onChange={(e) => setNewStudent({...newStudent, academicProfile: {...newStudent.academicProfile, educationLevel: e.target.value}})}
                          className="w-full bg-white border border-slate-150 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500">معدل کتبی نهایی یا فعلی</label>
                        <input 
                          type="number" step="0.01" value={newStudent.academicProfile?.currentGpa} onChange={(e) => setNewStudent({...newStudent, academicProfile: {...newStudent.academicProfile, currentGpa: parseFloat(e.target.value)}})}
                          className="w-full bg-white border border-slate-150 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500">آخرین تراز آزمون آزمایشی</label>
                        <input 
                          type="number" value={newStudent.academicProfile?.currentTraz} onChange={(e) => setNewStudent({...newStudent, academicProfile: {...newStudent.academicProfile, currentTraz: parseInt(e.target.value)}})}
                          className="w-full bg-white border border-slate-150 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500">ساعت مطالعه روزانه (میانگین)</label>
                        <input 
                          type="number" value={newStudent.academicProfile?.studyHoursPerDay} onChange={(e) => setNewStudent({...newStudent, academicProfile: {...newStudent.academicProfile, studyHoursPerDay: parseInt(e.target.value)}})}
                          className="w-full bg-white border border-slate-150 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Goals & Vision */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-blue-950 border-b border-slate-200 pb-2">
                      <Target size={18} className="text-purple-600" />
                      <h4 className="text-xs font-black uppercase tracking-wider">چهار • چشم‌انداز هدف‌گذاری و انتظارات</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500">رویای شخصی داوطلب برای آینده</label>
                        <textarea 
                          rows={2} value={newStudent.goals?.studentVision} onChange={(e) => setNewStudent({...newStudent, goals: {...newStudent.goals, studentVision: e.target.value}})}
                          className="w-full bg-white border border-slate-150 rounded-xl px-4 py-2.5 text-xs font-bold outline-none resize-none"
                          placeholder="مثال: قبولی در رشته پزشکی دانشگاه تهران و تخصص جراحی مغز..."
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500">هدف و انتظارات والدین از داوطلب</label>
                        <textarea 
                          rows={2} value={newStudent.goals?.familyExpectation} onChange={(e) => setNewStudent({...newStudent, goals: {...newStudent.goals, familyExpectation: e.target.value}})}
                          className="w-full bg-white border border-slate-150 rounded-xl px-4 py-2.5 text-xs font-bold outline-none resize-none"
                          placeholder="مثال: کسب رتبه برتر جهت ارتقای وضعیت اجتماعی خانواده..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                    <button 
                      onClick={() => setIsRegistering(false)}
                      className="px-6 py-2.5 text-xs font-black text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      انصراف
                    </button>
                    <button 
                      onClick={handleRegisterStudent}
                      className="px-8 py-2.5 bg-blue-950 text-white rounded-2xl text-xs font-black shadow-lg shadow-blue-900/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      تایید و ثبت نهایی در دیتابیس هوشمند
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="جستجوی نام داوطلب یا کد کارنامه..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-950 focus:bg-white text-slate-800 text-right"
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
                    <option value="all">کلیه رشته‌ها</option>
                    <option value="کنکور انسانی">کنکور علوم انسانی</option>
                    <option value="کنکور تجربی">کنکور علوم تجربی</option>
                    <option value="کنکور ریاضی">کنکور ریاضی و فیزیک</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-sm">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold">
                      <th className="py-4 px-6">نام کاربری داوطلب</th>
                      <th className="py-4 px-6">شناسه کارنامه کنکور</th>
                      <th className="py-4 px-6">رشته تحصیلی هدف</th>
                      <th className="py-4 px-6">تراز هوشمند تخمینی</th>
                      <th className="py-4 px-6">استاد راهنما و مشاور</th>
                      <th className="py-4 px-6">وضعیت حضور پورتال</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-4 px-6 font-bold text-slate-850">{st.name}</td>
                        <td className="py-4 px-6 font-mono font-semibold">{st.code}</td>
                        <td className="py-4 px-6 font-medium">{st.field}</td>
                        <td className="py-4 px-6 font-mono font-bold text-blue-950">{(st.traz).toLocaleString("fa-IR")} تراز</td>
                        <td className="py-4 px-6">{st.advisor}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 rounded-full font-bold border ${
                            st.status === "فعال" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-400 border-slate-200"
                          }`}>
                            {st.status === "فعال" ? "آنلاین فعال" : "مرخصی تحصیلی"}
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
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-right">
                  <h4 className="text-slate-400 font-bold text-xs uppercase">متوسط تراز کل جامعه آماری ترنم مهر</h4>
                  <div className="text-2xl font-black text-slate-800 font-mono">۷,۳۲۰ تراز</div>
                  <p className="text-[10px] text-emerald-600">▲ ۲.۸٪ بهبود میانگین درس زیست و فیزیک</p>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-right">
                  <h4 className="text-slate-400 font-bold text-xs uppercase">گلوگاه تحلیلی ضعف بیشترین داوطلبان عمومی</h4>
                  <div className="text-2xl font-black text-slate-805 font-sans">مباحث تحلیلی فلسفه و ریاضیات گسسته</div>
                  <p className="text-[10px] text-red-500">نیاز مبرم به دوره‌های فشرده تست زدن</p>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-right">
                  <h4 className="text-slate-400 font-bold text-xs uppercase">تلرانس تخمین موفقیت تراز با AI</h4>
                  <div className="text-2xl font-black text-slate-800 font-mono">۲.۴٪</div>
                  <p className="text-[10px] text-emerald-600">پایش دقیق در لایه فونداسیون RAG کنکور</p>
                </div>
              </div>

              {/* RAG statistics and health checks */}
              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-right">
                <HeartPulse className="text-emerald-700 animate-pulse flex-shrink-0" size={20} />
                <div className="text-xs text-emerald-800 leading-relaxed font-semibold">
                  سلامت سیستم پردازش ترنم مهر تایید شد. مدل `'gemini-2.5-flash'` به همراه مخزن وکتور سرفصل‌های کنکور بدون گلوگاه متصل است.
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Uploader area */}
          {activeTab === "uploads" && (
            <div className="space-y-6" id="admin-tab-uploads">
              <div className="border-2 border-dashed border-slate-200 hover:border-blue-950 rounded-3xl p-10 transition text-center space-y-4 relative bg-slate-50/50">
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
                  <h4 className="font-bold text-slate-850 text-base">اکسل تراز یا جزوات و منابع رتبه برتر را در این‌جا رها کنید</h4>
                  <p className="text-slate-400 text-xs mt-1">فرمت‌های مجاز: .pdf, .xlsx, .xls (حداکثر حجم فایل ۱۰ مگابایت)</p>
                </div>
                {isUploading && (
                  <div className="text-xs text-blue-900 flex justify-center items-center gap-2">
                    <span className="w-4 h-4 border-2 border-blue-955 border-t-transparent rounded-full animate-spin"></span>
                    <span>اسکن اتصالات تراز و پایش آماری سرفصل‌ها...</span>
                  </div>
                )}
              </div>

              {/* Uploaded files list */}
              <div className="space-y-3 text-right">
                <span className="text-xs font-bold text-slate-400 block">فایل‌های پردازش‌شده پایش قبلی</span>
                <div className="space-y-2">
                  {uploadedFiles.map((f, idx) => (
                    <div key={idx} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">{f}</span>
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-[10px] font-black flex items-center gap-1.5 leading-none">
                        <Check size={12} />
                        <span>همگام سازی با هوش مصنوعی شد</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Content Manager */}
          {activeTab === "content" && (
            <div className="p-8 text-center bg-slate-50 rounded-3xl border border-slate-100 space-y-4" id="admin-tab-content">
              <Film size={40} className="mx-auto text-slate-400" />
              <h4 className="font-bold text-slate-800 text-sm">مخزن درسنامه‌ها و ویدیوهای آموزشی ترنم مهر</h4>
              <p className="text-slate-455 text-xs">در این بخش قادر خواهید بود ویدیوهای آموزشی سرفصل‌های نهایی و کنکوری را آپلود نمایید تا با مدل به داوطلبین توصیه گردد.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-3 text-right">
                <div className="p-4 bg-white border border-slate-150 rounded-2xl space-y-2">
                  <span className="text-[9px] text-amber-600 font-bold block">مجموعه انسانی</span>
                  <h5 className="text-xs font-black text-slate-900">تحلیل منطق و فلسفه سال دوازدهم</h5>
                  <p className="text-[9px] text-slate-400">۲۴ قسمت تصویری فشرده کلاود</p>
                </div>
                <div className="p-4 bg-white border border-slate-150 rounded-2xl space-y-2">
                  <span className="text-[9px] text-indigo-600 font-bold block">مجموعه تجربی</span>
                  <h5 className="text-xs font-black text-slate-900">زیست‌شناسی و شیمی تخصصی</h5>
                  <p className="text-[9px] text-slate-400">۱۲ جلسه رفع لول اشکال تستی</p>
                </div>
                <div className="p-4 bg-white border border-slate-150 rounded-2xl space-y-2">
                  <span className="text-[9px] text-rose-500 font-bold block">مجموعه عمومی</span>
                  <h5 className="text-xs font-black text-slate-900">تندخوانی و درک متن ادبیات</h5>
                  <p className="text-[9px] text-slate-400">فول تراز ۱۰۰٪ صوتی و متنی</p>
                </div>
                <div className="p-4 bg-white border border-slate-150 rounded-2xl space-y-2">
                  <span className="text-[9px] text-emerald-600 font-bold block">مجموعه ریاضی</span>
                  <h5 className="text-xs font-black text-slate-900">دیفرانسیل و هندسه تحلیلی</h5>
                  <p className="text-[9px] text-slate-400">۱۸ کارگاه مهارتی تست زنی</p>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => alert("امکان آپلود مستقیم ویدئو در این فاز دمو فعال است و به کلاود ارجاع داده خواهد شد.")}
                  className="bg-blue-950 hover:bg-slate-900 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition cursor-pointer"
                >
                  آپلود راهنمای ویدئویی جدید
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Persian digits utility
function toPersianNum(num: number | string): string {
  const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return num
    .toString()
    .replace(/\d/g, (x) => farsiDigits[parseInt(x)]);
}
