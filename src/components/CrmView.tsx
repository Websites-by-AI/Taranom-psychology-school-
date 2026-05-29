import React, { useState } from "react";
import {
  Users, UserCheck, Flame, ShieldAlert, Phone, RefreshCw, Layers,
  CheckCircle2, Clock, Plus, Search, FileText, Send, Sparkles, Filter,
  ArrowRight, ArrowLeft, Trash2, Calendar, User, MessageSquare, AlertCircle,
  Mail, FileDown, Copy, Check, Share2
} from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface Lead {
  id: string;
  name: string;
  phone: string;
  field: string;
  trazEstimate?: number;
  temp: "hot" | "warm" | "cold";
  status: "new" | "contact" | "evaluating" | "won";
  assignedCounselor: string;
  createdDate: string;
  notes: string;
  logs: { date: string; author: string; text: string }[];
}

export default function CrmView() {
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: "crm-1",
      name: "فاطمه کاظمی پور",
      phone: "09123456789",
      field: "وکالت کانون کلا (اسکودا)",
      trazEstimate: 5400,
      temp: "hot",
      status: "contact",
      assignedCounselor: "کریمی",
      createdDate: "۱۴۰۶/۰۲/۱۵",
      notes: "داوطلب با انگیزه بالا، به دنبال قبولی حقوق خصوصی تهرانه. زمان آزاد مطالعه‌ش روزی ۵ ساعته.",
      logs: [
        { date: "۱۴۰۶/۰۲/۱۶", author: "کریمی", text: "اولین تماس برقرار شد. برای شرکت در کارگاه طلایی مدنی چتر نجات مشتاق است." },
        { date: "۱۴۰۶/۰۲/۱۸", author: "سیستم", text: "پیامک معرفی پکیج چتر دانش با موفقیت ارسال شد." }
      ]
    },
    {
      id: "crm-2",
      name: "امیررضا صادقی",
      phone: "09187654321",
      field: "آزمون تصدی منصب قضا (قضاوت)",
      trazEstimate: 6100,
      temp: "warm",
      status: "evaluating",
      assignedCounselor: "یوسفی",
      createdDate: "۱۴۰۶/۰۲/۱۰",
      notes: "شاغل در مجتمع قضایی به صورت دفتری. سطح معلومات خوب ولی مشکل تمرکز در متون فقه دارد.",
      logs: [
        { date: "۱۴۰۶/۰۲/۱۱", author: "یوسفی", text: "تماس حاصل شد؛ درخواست فرم شبیه‌ساز تعیین سطح آنلاین را داشتند." }
      ]
    },
    {
      id: "crm-3",
      name: "حمید ذوالفقاری",
      phone: "09351112233",
      field: "سردفتری اسناد رسمی",
      trazEstimate: 4900,
      temp: "cold",
      status: "new",
      assignedCounselor: "مهدوی",
      createdDate: "۱۴۰۶/۰۲/۲۰",
      notes: "از طریق لندینگ تبلیغاتی چتر دانش ثبت نام اولیه کرده. هنوز با ایشان صحبت دوطرفه انجام نشده.",
      logs: []
    },
    {
      id: "crm-4",
      name: "زهرا مهدوی نیا",
      phone: "09904445566",
      field: "وکالت کانون کلا (اسکودا)",
      trazEstimate: 5800,
      temp: "hot",
      status: "won",
      assignedCounselor: "کریمی",
      createdDate: "۱۴۰۶/۰۲/۰۱",
      notes: "ثبت‌نام خود را با تخفیف بهار کانون قطعی کرد. به کلاس‌های رفع اشکال استاد رادان متصل شد.",
      logs: [
        { date: "۱۴۰۶/۰۲/۰۲", author: "کریمی", text: "پیش‌پرداخت دریافت شد و فایل کارنامه تراز اولیه در سرور آپلود گشت." }
      ]
    },
    {
      id: "crm-5",
      name: "علیرضا بخشنده",
      phone: "09159998877",
      field: "ارشد حقوق خصوصی",
      trazEstimate: 5200,
      temp: "warm",
      status: "new",
      assignedCounselor: "یوسفی",
      createdDate: "۱۴۰۶/۰۲/۲۲",
      notes: "تازه فارغ‌التحصیل شده و نیاز مبرم به مشاوره برنامه‌ریزی دکتری و ارشد دارد.",
      logs: []
    }
  ]);

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>("crm-1");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTemp, setFilterTemp] = useState<string>("all");
  const [newLogText, setNewLogText] = useState("");
  
  // New lead form states
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formField, setFormField] = useState("وکالت کانون کلا (اسکودا)");
  const [formTemp, setFormTemp] = useState<"hot" | "warm" | "cold">("warm");
  const [formNotes, setFormNotes] = useState("");

  // AI Generator states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ sms: string; callScript: string; followUpTip: string } | null>(null);

  const selectedLead = leads.find(l => l.id === selectedLeadId) || null;

  // Export and dispatch simulation states
  const [emailRecipient, setEmailRecipient] = useState("");
  const [emailSubject, setEmailSubject] = useState("طرح راهنمایی و مشاوره اختصاصی قبولی آزمون چتر دانش");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [isSendingTelegram, setIsSendingTelegram] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [activeExportTab, setActiveExportTab] = useState<"sms" | "email" | "telegram" | "pdf">("sms");
  const [telegramUsername, setTelegramUsername] = useState("");

  // Automatically pre-populate customized details based on selectedLead
  React.useEffect(() => {
    if (selectedLead) {
      const transliterated = selectedLead.name.replace(/\s+/g, "_");
      setEmailRecipient(`${transliterated}@gmail.com`);
      setTelegramUsername(`@tg_${transliterated}`);
      setEmailSubject(`طرح راهنمایی و مشاوره اختصاصی قبولی آزمون ${selectedLead.field} - چتر دانش`);
    }
  }, [selectedLeadId]);

  // Simulated Email Dispatch
  const handleSimulateSendEmail = async () => {
    if (!selectedLead || !aiResult) return;
    setIsSendingEmail(true);
    // Mimic API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Add note to log timeline
    const logDateText = new Date().toLocaleDateString("fa-IR") + " " + new Date().toLocaleTimeString("fa-IR", {hour: '2-digit', minute: '2-digit'});
    setLeads(prevLeads => prevLeads.map(lead => {
      if (lead.id !== selectedLead.id) return lead;
      return {
        ...lead,
        logs: [
          {
            date: logDateText,
            author: "دستیار صوتی و مکاتبه‌ای",
            text: `📧 ایمیل پیگیری شخصی‌سازی شده با موضوع "${emailSubject}" به پیوست سناریوی موفقیت و پیامک طلایی به آدرس ${emailRecipient} با موفقیت ارسال شد.`
          },
          ...lead.logs
        ]
      };
    }));
    
    setIsSendingEmail(false);
    alert(`✅ ایمیل مشاور عالی با موفقیت به ${emailRecipient} مخابره شد و در تاریخچه پرونده داوطلب به ثبت رسید.`);
  };

  // Simulated SMS Dispatch via live gateway
  const handleSimulateSendSms = async () => {
    if (!selectedLead || !aiResult) return;
    setIsSendingSms(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const logDateText = new Date().toLocaleDateString("fa-IR") + " " + new Date().toLocaleTimeString("fa-IR", {hour: '2-digit', minute: '2-digit'});
    setLeads(prevLeads => prevLeads.map(lead => {
      if (lead.id !== selectedLead.id) return lead;
      return {
        ...lead,
        logs: [
          {
            date: logDateText,
            author: "درگاه پیامکی بومی",
            text: `💬 پیامک دعوت و متقاعدسازی با متن پیش‌نویس استخراجی به شماره همراه داوطلب (${selectedLead.phone}) با موفقیت ارسال شد.`
          },
          ...lead.logs
        ]
      };
    }));
    
    setIsSendingSms(false);
    alert(`💬 پیامک پیگیری هوشمند با موفقیت به شماره موبایل داوطلب مخابره گشت.`);
  };

  // Simulated Telegram Bot Dispatch
  const handleSimulateSendTelegram = async () => {
    if (!selectedLead || !aiResult) return;
    setIsSendingTelegram(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    
    const logDateText = new Date().toLocaleDateString("fa-IR") + " " + new Date().toLocaleTimeString("fa-IR", {hour: '2-digit', minute: '2-digit'});
    setLeads(prevLeads => prevLeads.map(lead => {
      if (lead.id !== selectedLead.id) return lead;
      return {
        ...lead,
        logs: [
          {
            date: logDateText,
            author: "ربات اطلاع‌رسانی تلگرام",
            text: `✈ طرح پیگیری و مشاوره‌ای متناسب با آزمون هدف به آیدی تلگرام (${telegramUsername || '@chatredanesh_bot'}) مخابره گردید.`
          },
          ...lead.logs
        ]
      };
    }));
    
    setIsSendingTelegram(false);
    alert(`✈ پکیج هوشمند مشاوره‌ای با موفقیت از طریق کلاود ربات تلگرام به آیدی ${telegramUsername} گسیل داده شد.`);
  };

  // Bulletproof PDF Generator (utilizing oklab/oklch style scrubber to prevent crashes!)
  const handleDownloadDossierPdf = async () => {
    if (!selectedLead || !aiResult) return;
    setIsGeneratingPdf(true);
    
    try {
      const template = document.getElementById("crm-pdf-dossier");
      if (!template) {
        throw new Error("Template container crm-pdf-dossier not found!");
      }
      
      // Temporary display show to measure accurately
      template.style.left = "10px";
      template.style.top = "10px";

      // 1. Gather rules from document.styleSheets
      const stylesText: string[] = [];
      for (let i = 0; i < document.styleSheets.length; i++) {
        const sheet = document.styleSheets[i];
        try {
          if (sheet.cssRules) {
            const rules = Array.from(sheet.cssRules);
            const cssText = rules.map(rule => rule.cssText).join("\n");
            stylesText.push(cssText);
          }
        } catch (e) {
          const owner = sheet.ownerNode;
          if (owner && owner instanceof HTMLLinkElement && owner.href) {
            try {
              const res = await fetch(owner.href);
              if (res.ok) {
                const text = await res.text();
                stylesText.push(text);
              }
            } catch (fetchErr) {
              console.warn("Could not fetch CSS", fetchErr);
            }
          }
        }
      }

      // 2. Extract inline style tags
      document.querySelectorAll("style").forEach(style => {
        if (style.textContent) {
          stylesText.push(style.textContent);
        }
      });

      // 3. Clean up any trace of oklch or oklab
      const rawCSS = stylesText.join("\n");
      const sanitizedCSS = rawCSS
        .replace(/oklch\([^)]*?\/\s*0(?:\.[0-9]+)?\s*\)/gi, "transparent")
        .replace(/oklab\([^)]*?\/\s*0(?:\.[0-9]+)?\s*\)/gi, "transparent")
        .replace(/oklch\(\s*1(?:\s+0(?:\s+0)?)?\s*\)/gi, "#ffffff")
        .replace(/oklab\(\s*1(?:\s+0(?:\s+0)?)?\s*\)/gi, "#ffffff")
        .replace(/oklch\(\s*0(?:\s+0(?:\s+0)?)?\s*\)/gi, "#000000")
        .replace(/oklab\(\s*0(?:\s+0(?:\s+0)?)?\s*\)/gi, "#000000")
        .replace(/oklch\([^\)]*\)/gi, "#312e81")
        .replace(/oklab\([^\)]*\)/gi, "#1e293b");

      const onCloneHandler = (clonedDoc: Document) => {
        const badStyles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
        badStyles.forEach(el => el.parentNode?.removeChild(el));

        const cleanStyle = clonedDoc.createElement("style");
        cleanStyle.textContent = sanitizedCSS;
        clonedDoc.head.appendChild(cleanStyle);

        const extraStyle = clonedDoc.createElement("style");
        extraStyle.innerHTML = `
          :root {
            --color-slate-50: #f8fafc !important; --color-slate-100: #f1f5f9 !important;
            --color-slate-200: #e2e8f0 !important; --color-slate-300: #cbd5e1 !important;
            --color-slate-400: #94a3b8 !important; --color-slate-500: #64748b !important;
            --color-slate-600: #475569 !important; --color-slate-700: #334155 !important;
            --color-slate-800: #1e293b !important; --color-slate-900: #0f172a !important;
            --color-indigo-50: #eef2ff !important; --color-indigo-600: #4f46e5 !important;
            --color-indigo-900: #312e81 !important; --color-emerald-600: #059669 !important;
          }
          * { outline-color: #cbd5e1 !important; caret-color: #4f46e5 !important; }
        `;
        clonedDoc.head.appendChild(extraStyle);
        
        // Scrub oklab/oklch inline values of child elements
        const allElements = clonedDoc.getElementsByTagName('*');
        for (let i = 0; i < allElements.length; i++) {
          const el = allElements[i] as HTMLElement;
          if (el.style) {
            const comp = window.getComputedStyle(el);
            const props = ['color', 'backgroundColor', 'borderColor', 'fill', 'stroke'];
            props.forEach(p => {
              const val = (comp as any)[p];
              if (val && (val.includes('oklch') || val.includes('oklab'))) {
                if (p === 'backgroundColor') el.style.backgroundColor = 'transparent';
                else if (p === 'borderColor') el.style.borderColor = '#1e293b';
                else el.style.color = '#0f172a';
              }
            });
          }
        }
      };

      await new Promise((resolve) => setTimeout(resolve, 300));

      const canvas = await html2canvas(template, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        onclone: onCloneHandler
      });

      // Move template back to hidden coordinates
      template.style.left = "-9999px";
      template.style.top = "-9999px";

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
      pdf.save(`Dossier_CRM_${selectedLead.name.replace(/\s+/g, "_")}.pdf`);

      const logDateText = new Date().toLocaleDateString("fa-IR") + " " + new Date().toLocaleTimeString("fa-IR", {hour: '2-digit', minute: '2-digit'});
      setLeads(prevLeads => prevLeads.map(lead => {
        if (lead.id !== selectedLead.id) return lead;
        return {
          ...lead,
          logs: [
            {
              date: logDateText,
              author: "سیستم صادرات پرونده",
              text: "📥 نسخه چاپی PDF کامل پرونده تحلیل هوشمند با موفقیت تولید و دانلود گردید."
            },
            ...lead.logs
          ]
        };
      }));

    } catch (error) {
      console.error("PDF generation crash:", error);
      alert("❌ خطایی در جریان تولید PDF پیش آمد.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Handle lead creation
  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      alert("لطفاً نام و تلفن تماس داوطلب را وارد کنید.");
      return;
    }
    const newLead: Lead = {
      id: `crm-${Date.now()}`,
      name: formName,
      phone: formPhone,
      field: formField,
      trazEstimate: 5000,
      temp: formTemp,
      status: "new",
      assignedCounselor: "کریمی",
      createdDate: new Date().toLocaleDateString("fa-IR"),
      notes: formNotes,
      logs: []
    };
    setLeads([newLead, ...leads]);
    setSelectedLeadId(newLead.id);
    setIsAddingLead(false);
    // Reset form
    setFormName("");
    setFormPhone("");
    setFormNotes("");
    setFormField("وکالت کانون کلا (اسکودا)");
    setFormTemp("warm");
    setAiResult(null);
  };

  // Move status
  const moveLeadStatus = (id: string, dir: "next" | "prev") => {
    const statusOrder: ("new" | "contact" | "evaluating" | "won")[] = ["new", "contact", "evaluating", "won"];
    setLeads(prevLeads => prevLeads.map(lead => {
      if (lead.id !== id) return lead;
      const curIndex = statusOrder.indexOf(lead.status);
      let nextIndex = curIndex;
      if (dir === "next" && curIndex < statusOrder.length - 1) {
        nextIndex = curIndex + 1;
      } else if (dir === "prev" && curIndex > 0) {
        nextIndex = curIndex - 1;
      }
      return {
        ...lead,
        status: statusOrder[nextIndex]
      };
    }));
  };

  // Add Log Note
  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogText.trim() || !selectedLeadId) return;
    
    setLeads(prevLeads => prevLeads.map(lead => {
      if (lead.id !== selectedLeadId) return lead;
      return {
        ...lead,
        logs: [
          {
            date: new Date().toLocaleDateString("fa-IR") + " " + new Date().toLocaleTimeString("fa-IR", {hour: '2-digit', minute: '2-digit'}),
            author: "مدیر ارشد",
            text: newLogText
          },
          ...lead.logs
        ]
      };
    }));
    setNewLogText("");
  };

  // Generate AI Counseling material
  const handleGenerateAiMaterial = async () => {
    if (!selectedLead) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const response = await fetch("/api/crm/ai-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedLead.name,
          phone: selectedLead.phone,
          field: selectedLead.field,
          temp: selectedLead.temp === "hot" ? "داغ (بسیار علاقمند)" : selectedLead.temp === "warm" ? "ولرم (علاقه متوسط)" : "سرد (نیاز به ترغیب)",
          notes: selectedLead.notes
        })
      });
      const data = await response.json();
      setAiResult(data);
    } catch (err) {
      console.error("AI Generation failed:", err);
      // Fallback
      setAiResult({
        sms: `داوطلب محترم ${selectedLead.name}، همکار آینده ما! 🌸\nمشاورین ارشد چتر دانش منتظر شما هستند تا نقشه راه ترازسازی قبولی در آزمون ${selectedLead.field} را تقدیمتان کنند. برای یک گام محکم آماده‌اید؟ تلفنتان را پاسخگو باشید.\nتلفن دفتر چتر دانش: ۰۲۱-۶۶۱۲۳۴۵۶`,
        callScript: `دیالوگ پیشنهادی تماس تلفنی با ${selectedLead.name}:\nمشاور: سلام روز عالی شما بخیر باشد ${selectedLead.name} گرامی، رتبه برترهای کانون از چتر دانش مزاحمتان می‌شوم.\nمتقاضی: سلام وقت شما هم بخیر.\nمشاور: تبریک می‌گویم همکار آینده، پرونده شما برای ارزیابی طلایی به بخشِ من ارجاع داده شده. بفرمایید در دروس پایه مانند حقوق مدنی و آیین دادرسی مدنی وضعیت ترازتان چطور است؟ آیا کتابهای نموداری چتر دانش را مطالعه کرده‌اید؟`,
        followUpTip: `پیشنهاد مشورتی پیگیری چتر دانش:\nسطح اشتیاق داوطلب [${selectedLead.temp}] ارزیابی شده است. توصیه می‌شود ابتدا کارگاه تستی رایگان کانون را برای بالا بردن اعتماد علمی کاندیدا اهدا نمایید.`
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Filter and search logic
  const filteredLeads = leads.filter(l => {
    const matchSearch = l.name.includes(searchTerm) || l.phone.includes(searchTerm) || l.field.includes(searchTerm);
    const matchTemp = filterTemp === "all" || l.temp === filterTemp;
    return matchSearch && matchTemp;
  });

  // Count highlights
  const totalCount = leads.length;
  const hotCount = leads.filter(l => l.temp === "hot").length;
  const warmCount = leads.filter(l => l.temp === "warm").length;
  const coldCount = leads.filter(l => l.temp === "cold").length;
  const wonCount = leads.filter(l => l.status === "won").length;
  const conversionRate = totalCount ? Math.round((wonCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 font-sans text-right" id="crm-workspace" style={{ direction: "rtl" }}>
      {/* Top Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm bg-gradient-to-tr from-emerald-50/5 via-white to-transparent">
        <div>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100 font-bold inline-block mb-1">پنل CRM و لید جذب</span>
          <h2 className="text-xl font-black text-slate-900">سامانه هوشمند ثبت لید و مدیریت ارتباط با مشتریان (چتر دانش)</h2>
          <p className="text-slate-500 text-xs mt-1">مدیریت کانال فروش، ثبت مشخصات متقاضیان دوره‌های آمادگی آزمون وکالت، قضاوت، سردفتری و ارشد حقوق</p>
        </div>
        <button
          onClick={() => setIsAddingLead(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-5 rounded-2xl shadow-md cursor-pointer flex items-center gap-2 transition duration-200"
        >
          <Plus size={16} />
          <span>ثبت پرونده و لید جدید داوطلب</span>
        </button>
      </div>

      {/* CRM Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <Users size={18} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">مجموع لیدها</span>
            <span className="text-lg font-black text-slate-800 font-mono">{totalCount} نفر</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <Flame size={18} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">پرونده داغ 🔥</span>
            <span className="text-lg font-black text-slate-800 font-mono">{hotCount} لید</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={18} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">ولرم (پیگیری ملایم)</span>
            <span className="text-lg font-black text-slate-800 font-mono">{warmCount} لید</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-slate-50 text-slate-500 rounded-xl">
            <UserCheck size={18} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">ثبت‌نام شده نهایی ✔</span>
            <span className="text-lg font-black text-emerald-700 font-mono">{wonCount} داوطلب</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 col-span-2 md:col-span-1">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">نرخ تبدیل نهایی</span>
            <span className="text-lg font-black text-slate-800 font-mono">{conversionRate}٪</span>
          </div>
        </div>
      </div>

      {/* Main CRM Core Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kanban Board Column (Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Filters/Search Row */}
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="جستجوی نام داوطلب، گرایش حقوقی یا موبایل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800"
              />
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <select
                value={filterTemp}
                onChange={(e) => setFilterTemp(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 focus:outline-none w-full sm:w-auto"
              >
                <option value="all">همه درجات اشتیاق</option>
                <option value="hot">داغ (متقاعد نزدیک)</option>
                <option value="warm">ولرم (علاقمند)</option>
                <option value="cold">سرد (ثبت اولیه کلاود)</option>
              </select>
            </div>
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            
            {/* COLUMN 1: NEW LEADS */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col min-h-[480px]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[11px] font-black text-rose-900 bg-rose-50 px-2 py-0.5 rounded-md">۱. ثبت اولیه</span>
                <span className="text-[10px] text-slate-400 font-bold font-mono">
                  {filteredLeads.filter(l => l.status === "new").length} لید
                </span>
              </div>
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[450px] pr-1">
                {filteredLeads.filter(l => l.status === "new").map(l => (
                  <LeadKanbanCard
                    key={l.id}
                    lead={l}
                    isSelected={selectedLeadId === l.id}
                    onSelect={() => setSelectedLeadId(l.id)}
                    onMove={(dir) => moveLeadStatus(l.id, dir)}
                  />
                ))}
                {filteredLeads.filter(l => l.status === "new").length === 0 && (
                  <div className="text-center py-8 text-[10px] text-slate-400 font-semibold">خالی</div>
                )}
              </div>
            </div>

            {/* COLUMN 2: CONTACTED / FOLLOW UP */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col min-h-[480px]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[11px] font-black text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md">۲. پیگیری و مذاکره</span>
                <span className="text-[10px] text-slate-400 font-bold font-mono">
                  {filteredLeads.filter(l => l.status === "contact").length} لید
                </span>
              </div>
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[450px] pr-1">
                {filteredLeads.filter(l => l.status === "contact").map(l => (
                  <LeadKanbanCard
                    key={l.id}
                    lead={l}
                    isSelected={selectedLeadId === l.id}
                    onSelect={() => setSelectedLeadId(l.id)}
                    onMove={(dir) => moveLeadStatus(l.id, dir)}
                  />
                ))}
                {filteredLeads.filter(l => l.status === "contact").length === 0 && (
                  <div className="text-center py-8 text-[10px] text-slate-400 font-semibold">خالی</div>
                )}
              </div>
            </div>

            {/* COLUMN 3: EVALUATING / TESTING */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col min-h-[480px]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[11px] font-black text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md">۳. تعیین سطح تحصیلی</span>
                <span className="text-[10px] text-slate-400 font-bold font-mono">
                  {filteredLeads.filter(l => l.status === "evaluating").length} لید
                </span>
              </div>
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[450px] pr-1">
                {filteredLeads.filter(l => l.status === "evaluating").map(l => (
                  <LeadKanbanCard
                    key={l.id}
                    lead={l}
                    isSelected={selectedLeadId === l.id}
                    onSelect={() => setSelectedLeadId(l.id)}
                    onMove={(dir) => moveLeadStatus(l.id, dir)}
                  />
                ))}
                {filteredLeads.filter(l => l.status === "evaluating").length === 0 && (
                  <div className="text-center py-8 text-[10px] text-slate-400 font-semibold">خالی</div>
                )}
              </div>
            </div>

            {/* COLUMN 4: REGISTERED / WON */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col min-h-[480px]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[11px] font-black text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md">۴. ثبت‌نام رول شده نهایی</span>
                <span className="text-[10px] text-slate-400 font-bold font-mono">
                  {filteredLeads.filter(l => l.status === "won").length} لید
                </span>
              </div>
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[450px] pr-1">
                {filteredLeads.filter(l => l.status === "won").map(l => (
                  <LeadKanbanCard
                    key={l.id}
                    lead={l}
                    isSelected={selectedLeadId === l.id}
                    onSelect={() => setSelectedLeadId(l.id)}
                    onMove={(dir) => moveLeadStatus(l.id, dir)}
                  />
                ))}
                {filteredLeads.filter(l => l.status === "won").length === 0 && (
                  <div className="text-center py-8 text-[10px] text-slate-400 font-semibold">خالی</div>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Lead Details Drawer & AI Assistant Panel (Span 1) */}
        <div>
          {selectedLead ? (
            <div className="space-y-4">
              
              {/* Detailed Card */}
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-slate-900 text-sm leading-tight">{selectedLead.name}</h3>
                    <p className="font-mono text-[10px] text-slate-400 mt-1">{selectedLead.phone}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase ${
                    selectedLead.temp === "hot" ? "bg-red-50 text-red-650 border-red-100" :
                    selectedLead.temp === "warm" ? "bg-amber-50 text-amber-700 border-amber-100" :
                    "bg-slate-100 text-slate-400 border-slate-200"
                  }`}>
                    {selectedLead.temp === "hot" ? "🔥 داغ" : selectedLead.temp === "warm" ? "⚡ ولرم" : "❄ سرد"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs border-y border-slate-100 py-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">دوره هدف</span>
                    <span className="font-semibold text-slate-700">{selectedLead.field}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">مشاور همکار</span>
                    <span className="font-semibold text-slate-700">دکتر {selectedLead.assignedCounselor}</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-[10px] text-slate-400 font-bold block">ورود به سیستم</span>
                    <span className="font-mono font-medium text-slate-500">{selectedLead.createdDate}</span>
                  </div>
                </div>

                {/* Notes Block */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block">خلاصه دغدغه‌ها و توضیحات پرونده</span>
                  <p className="text-slate-600 text-xs leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {selectedLead.notes || "بدون مشخصه متنی خاص"}
                  </p>
                </div>

                {/* AI integration action trigger */}
                <div className="pt-2">
                  <button
                    onClick={handleGenerateAiMaterial}
                    disabled={aiLoading}
                    className="w-full bg-indigo-900 hover:bg-slate-950 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow transition-all cursor-pointer disabled:opacity-50"
                  >
                    {aiLoading ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>در حال استعلام از مغز جمی‌نی دپارتمان...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} className="text-amber-300 animate-pulse" />
                        <span>دستیار هوش مصنوعی: تدوین متن پیگیری</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Gemini AI Script Result Area & Multi-Export Suite */}
              {aiResult && (
                <div className="bg-gradient-to-tr from-indigo-950 to-slate-900 text-white rounded-3xl border border-indigo-500/30 shadow-xl overflow-hidden animate-fadeIn">
                  
                  {/* Header containing Sparkles */}
                  <div className="p-4 bg-indigo-900/40 border-b border-indigo-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-amber-400" />
                      <span className="text-xs font-black text-slate-100 font-sans">مخابره و صادرات چندگانه دستیار (Gemini CRM)</span>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-bold font-mono">AI Active</span>
                  </div>

                  {/* Active Toggle Navigation Tabs */}
                  <div className="flex border-b border-indigo-500/10 text-[10px] font-bold bg-slate-950/20">
                    <button
                      type="button"
                      onClick={() => setActiveExportTab("sms")}
                      className={`flex-1 py-2.5 text-center transition cursor-pointer border-b-2 ${
                        activeExportTab === "sms" ? "border-indigo-400 text-indigo-300 bg-indigo-900/10" : "border-transparent text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      ✉ پیامک و تلگرام
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveExportTab("email")}
                      className={`flex-1 py-2.5 text-center transition cursor-pointer border-b-2 ${
                        activeExportTab === "email" ? "border-indigo-400 text-indigo-300 bg-indigo-900/10" : "border-transparent text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      📧 ارسال ایمیل
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveExportTab("pdf")}
                      className={`flex-1 py-2.5 text-center transition cursor-pointer border-b-2 ${
                        activeExportTab === "pdf" ? "border-indigo-400 text-indigo-300 bg-indigo-900/10" : "border-transparent text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      📥 دریافت PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveExportTab("telegram")}
                      className={`flex-1 py-2.5 text-center transition cursor-pointer border-b-2 ${
                        activeExportTab === "telegram" ? "border-indigo-400 text-white bg-indigo-900/10" : "border-transparent text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      📞 سناریوی زنگ
                    </button>
                  </div>

                  {/* Tab Body Contents */}
                  <div className="p-4 space-y-4">
                    
                    {/* TAB 1: SMS & TELEGRAM */}
                    {activeExportTab === "sms" && (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <span className="text-[10px] text-indigo-300 font-bold block">پیش‌نویس پیامک ارسالی:</span>
                          <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 text-[11px] leading-relaxed relative">
                            <p className="font-sans text-right select-all whitespace-pre-wrap text-slate-250">{aiResult.sms}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(aiResult.sms);
                              alert("📋 پیش‌نویس پیامک کپی شد.");
                            }}
                            className="flex-1 py-2 bg-indigo-900 hover:bg-slate-950 text-indigo-200 text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition"
                          >
                            <Copy size={11} />
                            <span>کپی پیامک</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleSimulateSendSms}
                            disabled={isSendingSms}
                            className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-black rounded-lg flex items-center justify-center gap-1 cursor-pointer transition disabled:opacity-50"
                          >
                            {isSendingSms ? (
                              <RefreshCw size={11} className="animate-spin" />
                            ) : (
                              <Send size={11} />
                            )}
                            <span>مخابره زنده پیامک</span>
                          </button>
                        </div>

                        <hr className="border-indigo-500/10" />

                        {/* Telegram Panel inside SMS tab */}
                        <div className="space-y-2">
                          <span className="text-[10px] text-indigo-300 font-bold block">مخابره هوشمند کلاود تلگرام:</span>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={telegramUsername}
                              onChange={(e) => setTelegramUsername(e.target.value)}
                              placeholder="آیدی تلگرام داوطلب (مثال: @user)"
                              className="bg-slate-950/70 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-indigo-100 flex-1 focus:outline-none focus:border-indigo-400"
                            />
                            <button
                              type="button"
                              onClick={handleSimulateSendTelegram}
                              disabled={isSendingTelegram}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black rounded-lg flex items-center gap-1 cursor-pointer transition disabled:opacity-50"
                            >
                              {isSendingTelegram ? (
                                <RefreshCw size={11} className="animate-spin" />
                              ) : (
                                <Share2 size={11} />
                              )}
                              <span>ارسال به تلگرام</span>
                            </button>
                          </div>
                          <span className="text-[9px] text-slate-400 block font-sans">ربات تلگرام چتر دانش پکیج را به تلگرام کاندیدا متصل می‌سازد.</span>
                        </div>
                      </div>
                    )}

                    {/* TAB 2: EMAIL DISPATCH */}
                    {activeExportTab === "email" && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] text-indigo-300 font-bold block">ایمیل گیرنده:</label>
                            <input
                              type="email"
                              value={emailRecipient}
                              onChange={(e) => setEmailRecipient(e.target.value)}
                              className="w-full bg-slate-950/70 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-indigo-100 tracking-wide focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-indigo-300 font-bold block">موضوع ایمیل:</label>
                            <input
                              type="text"
                              value={emailSubject}
                              onChange={(e) => setEmailSubject(e.target.value)}
                              className="w-full bg-slate-950/70 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-indigo-100 focus:outline-none animate-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-indigo-300 font-bold block">پیش‌نمایش بدنه ایمیل تخصصی:</span>
                          <div className="bg-slate-950/65 p-3 rounded-xl border border-white/5 text-[11px] leading-relaxed font-sans max-h-[140px] overflow-y-auto">
                            <p className="text-slate-350 font-sans text-right">به نام خدا</p>
                            <p className="text-slate-400 font-sans text-right mt-1">سلام جناب/سرکار خانم {selectedLead.name}،</p>
                            <p className="text-slate-300 font-sans text-right mt-1 leading-normal text-[10px]">
                              با گرم‌ترین درودها، پیرو تقاضای شما درباره ترازهای برنامه طلایی <strong>{selectedLead.field}</strong>، دپارتمان تخصصی چتر دانش طرح مشاوره‌ای زیر را تقدیم شما می‌کند:
                            </p>
                            <p className="text-amber-300 font-sans text-right mt-2 bg-indigo-950/80 p-2 rounded border border-indigo-500/15 text-[10px]">
                              {aiResult.followUpTip}
                            </p>
                            <p className="text-slate-400 font-sans text-right mt-3 text-[10px]">
                              طرح تزار قبولی کانون ویژه بر اساس آخرین معیارهای سنجش با تائید دکتر {selectedLead.assignedCounselor} نهایی گردید.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const draft = `به نام خدا\nسلام جناب/سرکار خانم ${selectedLead.name}،\nبا احترام، پیرو بررسی دپارتمان سنجش چتر دانش برای آزمون ${selectedLead.field}:\n\n${aiResult.followUpTip}\n\nجهت اطلاعات بیشتر با دفتر ما تماس حاصل نمایید.`;
                              navigator.clipboard.writeText(draft);
                              alert("📋 متن پیام ایمیل کپی شد.");
                            }}
                            className="flex-1 py-2 bg-indigo-900 hover:bg-slate-950 text-indigo-200 text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition"
                          >
                            <Copy size={11} />
                            <span>کپی متن ایمیل</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleSimulateSendEmail}
                            disabled={isSendingEmail}
                            className="flex-1 py-2 bg-blue-750 hover:bg-indigo-900 text-white text-[10px] font-black rounded-lg flex items-center justify-center gap-1 cursor-pointer transition disabled:opacity-50"
                          >
                            {isSendingEmail ? (
                              <RefreshCw size={11} className="animate-spin" />
                            ) : (
                              <Mail size={11} />
                            )}
                            <span>ارسال رسمی ایمیل</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* TAB 3: DOWNLOAD PDF DOSSIER */}
                    {activeExportTab === "pdf" && (
                      <div className="space-y-3">
                        <div className="bg-slate-950/45 p-3 rounded-xl border border-indigo-500/10 space-y-2 text-right">
                          <span className="text-[10px] text-indigo-300 font-bold block font-mono">Filename: Dossier_CRM_{selectedLead.name.replace(/\s+/g, "_")}.pdf</span>
                          <p className="text-[10px] text-slate-350 leading-normal font-sans">
                            این گزارش مستند چاپی شامل مشخصات عمومی لید، آزمون هدف، متن پیگیری دستیار هوشمند و رهنمود تراز روانشناختی مشاور است.
                          </p>
                          <div className="p-2 bg-indigo-900/30 border border-emerald-500/20 text-[9px] text-emerald-300 rounded leading-relaxed font-sans">
                            🛡 فناوری ایمن‌سازی خودکار رنگ فعال است: کدهای رنگی oklch و oklab به کدهای رنگی استاندارد هگز تبدیل گشتند تا از بروز هرگونه خطا و افت کیفیت در پروسه تولید فایل ممانعت بعمل آید.
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleDownloadDossierPdf}
                          disabled={isGeneratingPdf}
                          className="w-full py-2.5 bg-gradient-to-l from-emerald-600 to-indigo-700 hover:from-emerald-700 hover:to-indigo-800 text-white text-[11px] font-black rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow transition disabled:opacity-50"
                        >
                          {isGeneratingPdf ? (
                            <>
                              <RefreshCw size={13} className="animate-spin" />
                              <span>در حال تنظیم تراز کدهای رنگی و تولید سند...</span>
                            </>
                          ) : (
                            <>
                              <FileDown size={13} />
                              <span>دانلود قطعی پرونده مشاوره‌ای داوطلب (PDF)</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* TAB 4: CALL SCRIPT */}
                    {activeExportTab === "telegram" && (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <span className="text-[10px] text-indigo-300 font-bold block">دیالوگ متقاعدسازی پیشنهادی (CRM Script):</span>
                          <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 text-[11px] leading-relaxed">
                            <p className="font-sans text-right whitespace-pre-wrap text-slate-200">{aiResult.callScript}</p>
                          </div>
                        </div>

                        {/* Tip */}
                        <div className="bg-indigo-900/30 p-3 rounded-xl border border-indigo-500/10 flex gap-2">
                          <AlertCircle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                          <p className="text-[10px] text-amber-200 leading-normal font-sans">
                            <strong>رهنمون روانشناختی: </strong> {aiResult.followUpTip}
                          </p>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}

              {/* Interaction Logs Timeline */}
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <span className="text-xs font-black text-slate-800 block">دفتر خاطرات و لاگ پیگیری‌های اپراتور</span>
                
                {/* Form logs */}
                <form onSubmit={handleAddLog} className="flex gap-2">
                  <input
                    type="text"
                    value={newLogText}
                    onChange={(e) => setNewLogText(e.target.value)}
                    placeholder="ثبت یادداشت جدید در پرونده..."
                    className="flex-1 bg-slate-50 border border-slate-205 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer"
                  >
                    <Send size={15} />
                  </button>
                </form>

                {/* List logs */}
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {selectedLead.logs.map((log, index) => (
                    <div key={index} className="text-xs space-y-1 border-r-2 border-emerald-500 pr-3 pb-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span className="font-semibold text-slate-650">توسط {log.author}</span>
                        <span className="font-mono">{log.date}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed font-sans">{log.text}</p>
                    </div>
                  ))}
                  {selectedLead.logs.length === 0 && (
                    <div className="text-center py-6 text-[10px] text-slate-400">تاریخچه‌ای ثبت نشده است. اولین تماس را یادداشت کنید.</div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-50 p-10 text-center rounded-3xl border border-slate-200 text-slate-400 space-y-2">
              <Users size={32} className="mx-auto text-slate-300" />
              <h4 className="font-bold text-xs">داوطلبی انتخاب نشده است</h4>
              <p className="text-[10px]">جهت بررسی جزئیات و استفاده از دستیار هوشمند جمی‌نی، روی کارت یک داوطلب در جدول یا کانبان کلیک کنید.</p>
            </div>
          )}
        </div>

      </div>

      {/* Add New Lead Modal Overlay */}
      {isAddingLead && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-sm">ثبت پرونده متقاضی جدید (لید حقوقی)</h3>
              <button
                onClick={() => setIsAddingLead(false)}
                className="text-slate-400 hover:text-slate-600 text-xs w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-500 block">نام و نام خانوادگی داوطلب:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: فاطمه رضایی کمال"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500 block">شماره تلفن همراه (جهت پیگیری و پیامک):</label>
                <input
                  type="tel"
                  required
                  placeholder="مثال: 09121234567"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-left font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 block">آزمون هدف داوطلب:</label>
                  <select
                    value={formField}
                    onChange={(e) => setFormField(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-slate-700 focus:outline-none"
                  >
                    <option value="وکالت کانون کلا (اسکودا)">وکالت اسکودا</option>
                    <option value="آزمون تصدی منصب قضا (قضاوت)">تصدی قضاوت</option>
                    <option value="سردفتری اسناد رسمی">سردفتری اسناد</option>
                    <option value="حقوق ارشد عمومی/خصوصی">کارشناسی ارشد حقوق</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400 block">سطح اشتیاق داوطلب:</label>
                  <select
                    value={formTemp}
                    onChange={(e) => setFormTemp(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-slate-700 focus:outline-none"
                  >
                    <option value="hot">داغ 🔥 (بسیار پیگیر)</option>
                    <option value="warm">ولرم ⚡ (علاقه‌مند)</option>
                    <option value="cold">سرد ❄ (نیاز به زنگ مجدد)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-440 block">یادداشت‌های مقدماتی داوطلب:</label>
                <textarea
                  placeholder="دغدغه‌ها مانند کمبود وقت، مشکلات حقوق تجارت یا کتاب خاص..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition cursor-pointer"
                >
                  ثبت قطعی و انتقال به کانبان
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingLead(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden high-fidelity layout for html2canvas CRM dossier export */}
      {selectedLead && (
        <div
          id="crm-pdf-dossier"
          className="bg-white p-10 border border-slate-350 absolute text-right text-slate-800"
          style={{
            left: "-9999px",
            top: "-9999px",
            width: "800px",
            minHeight: "1120px",
            direction: "rtl",
            boxSizing: "border-box",
            backgroundColor: "#ffffff",
            color: "#1e293b"
          }}
          dir="rtl"
        >
          {/* Header */}
          <div className="border-b-4 border-indigo-950 pb-4 mb-6 flex justify-between items-center" style={{ borderColor: "#1e1b4b" }}>
            <div>
              <h1 className="text-xl font-extrabold text-indigo-950" style={{ color: "#1e1b4b" }}>پرونده تحلیل مشاوره‌ای و متقاعدسازی متقاضی</h1>
              <span className="text-[10px] text-slate-500 font-bold block mt-1">سامانه مشاور عالی دپارتمان هوش مصنوعی موسسه چتر دانش</span>
            </div>
            <div className="text-left font-sans">
              <span className="text-xs bg-indigo-50 text-indigo-950 font-extrabold px-3 py-1.5 rounded-lg border border-indigo-100 uppercase tracking-wider block" style={{ color: "#1e1b4b", backgroundColor: "#e0e7ff", borderColor: "#c7d2fe" }}>
                CRM DOSSIER
              </span>
            </div>
          </div>

          {/* Candidate Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-5 grid grid-cols-2 gap-4 text-xs" style={{ backgroundColor: "#f8fafc", borderColor: "#cbd5e1" }}>
            <div className="space-y-1">
              <span className="text-slate-400 font-bold block mb-1">نام متقاضی:</span>
              <strong className="text-slate-800 text-sm">{selectedLead.name}</strong>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-bold block mb-1">شماره تماس پرونده:</span>
              <strong className="text-slate-800 font-sans text-sm">{selectedLead.phone}</strong>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-bold block mb-1">آزمون و دوره هدف داوطلب:</span>
              <strong className="text-indigo-950" style={{ color: "#312e81" }}>{selectedLead.field}</strong>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-bold block mb-1">مشاور مسئول تخصیص داده شده:</span>
              <strong className="text-slate-800">جناب دکتر {selectedLead.assignedCounselor}</strong>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-bold block mb-1">شدت تمایل/اشتیاق ثبت نام:</span>
              <strong className={`px-2 py-0.5 rounded font-black text-[9px] uppercase border ${
                selectedLead.temp === "hot" ? "bg-red-50 text-red-750 border-red-200" :
                selectedLead.temp === "warm" ? "bg-amber-50 text-amber-800 border-amber-200" :
                "bg-slate-100 text-slate-500 border-slate-200"
              }`} style={{
                backgroundColor: selectedLead.temp === "hot" ? "#fef2f2" : selectedLead.temp === "warm" ? "#fef3c7" : "#f1f5f9",
                color: selectedLead.temp === "hot" ? "#b91c1c" : selectedLead.temp === "warm" ? "#b45309" : "#64748b",
                borderColor: selectedLead.temp === "hot" ? "#fca5a5" : selectedLead.temp === "warm" ? "#fcd34d" : "#e2e8f0"
              }}>
                {selectedLead.temp === "hot" ? "بسیار بالا 🔥" : selectedLead.temp === "warm" ? "متوسط ⚡" : "نیاز به پیگیری ❄"}
              </strong>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-bold block mb-1">تاریخ افتتاح پرونده:</span>
              <strong className="text-slate-800 font-sans">{selectedLead.createdDate}</strong>
            </div>
          </div>

          {/* Concerns section */}
          <div className="border border-slate-150 rounded-2xl p-4 mb-5 space-y-2" style={{ borderColor: "#cbd5e1" }}>
            <h3 className="text-xs font-black text-indigo-950 border-r-2 pr-2" style={{ color: "#1e1b4b", borderColor: "#1e1b4b" }}>خلاصه دغدغه‌ها و توضیحات مقدماتی پرونده:</h3>
            <p className="text-slate-700 text-xs leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100" style={{ backgroundColor: "#f8fafc", borderColor: "#f1f5f9" }}>
              {selectedLead.notes || "توضیحاتی در این مورد ثبت نشده است."}
            </p>
          </div>

          {/* AI generated materials */}
          {aiResult && (
            <div className="space-y-5">
              {/* SMS section */}
              <div className="border border-indigo-200 rounded-2xl p-4 space-y-2" style={{ borderColor: "#c7d2fe" }}>
                <h3 className="text-xs font-black text-indigo-950 border-r-2 pr-2" style={{ color: "#1e1b4b", borderColor: "#4f46e5" }}>۱. پیش‌نویس پیامک ارتباط پیونددهنده:</h3>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-slate-705 text-xs leading-relaxed whitespace-pre-wrap" style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }}>
                  {aiResult.sms}
                </div>
              </div>

              {/* Call Script */}
              <div className="border border-indigo-200 rounded-2xl p-4 space-y-2" style={{ borderColor: "#c7d2fe" }}>
                <h3 className="text-xs font-black text-indigo-950 border-r-2 pr-2" style={{ color: "#1e1b4b", borderColor: "#4f46e5" }}>۲. سناریوی مکالمه تلفنی ویژه مشاور عالی:</h3>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-105 text-slate-705 text-xs leading-relaxed whitespace-pre-wrap" style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }}>
                  {aiResult.callScript}
                </div>
              </div>

              {/* Tips */}
              <div className="bg-indigo-50 border border-indigo-150 rounded-2xl p-4 space-y-2" style={{ backgroundColor: "#eef2ff", borderColor: "#c7d2fe" }}>
                <h3 className="text-xs font-black text-indigo-950 border-r-2 pr-2" style={{ color: "#1e1b4b", borderColor: "#312e81" }}>۳. ارزیابی روانشناختی و استراتژی متقاعدسازی چتر دانش:</h3>
                <p className="text-indigo-900 text-xs leading-relaxed" style={{ color: "#312e81" }}>
                  {aiResult.followUpTip}
                </p>
              </div>
            </div>
          )}

          {/* Stamp/Footer area */}
          <div className="mt-8 pt-6 border-t border-slate-205 flex justify-between items-center text-xs" style={{ borderColor: "#cbd5e1" }}>
            <div className="text-slate-400 font-bold text-[10px]">
              * این سند با تایید مدیریت کل دپارتمان موسسه فرهیختگان چتر دانش صادر گردیده است.
            </div>
            <div className="text-center space-y-2 pl-6">
              <span className="text-slate-500 font-bold block">مهر و امضای مشاور مسئول:</span>
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-2 border-dashed border-indigo-900 rounded-full flex items-center justify-center text-[8px] font-black text-indigo-900 uppercase tracking-widest opacity-80" style={{ transform: "rotate(-12deg)", borderColor: "#1e1b4b", color: "#1e1b4b" }}>
                  CHATR DANESH
                </div>
                <span className="text-[10px] text-indigo-900 font-bold mt-1" style={{ color: "#1e1b4b" }}>دکتر {selectedLead.assignedCounselor}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Subcomponent: Kanban Card to avoid massive single files
interface KanbanCardProps {
  key?: string;
  lead: Lead;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (dir: "next" | "prev") => void;
}

function LeadKanbanCard({ lead, isSelected, onSelect, onMove }: KanbanCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-xl border relative transition-all duration-200 text-right cursor-pointer group bg-white shadow-sm hover:shadow-md ${
        isSelected ? "ring-2 ring-emerald-500/80 border-transparent bg-emerald-50/10" : "border-slate-150 hover:border-slate-300"
      }`}
    >
      {/* Target Field Tag */}
      <span className="text-[8px] bg-slate-100 text-slate-550 border border-slate-200 px-1.5 py-0.5 rounded-md font-bold block w-fit mb-1 max-w-[130px] truncate">
        {lead.field}
      </span>

      <h5 className="font-extrabold text-slate-850 text-xs truncate leading-relaxed">{lead.name}</h5>
      <p className="font-mono text-[9px] text-slate-400 mt-0.5">{lead.phone}</p>

      {/* Footer controls */}
      <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-105">
        <span className={`text-[8px] px-1.5 py-0.5 rounded font-black ${
          lead.temp === "hot" ? "bg-red-50 text-red-650" :
          lead.temp === "warm" ? "bg-amber-55 text-amber-800" :
          "bg-slate-100 text-slate-500"
        }`}>
          {lead.temp === "hot" ? "HOT 🔥" : lead.temp === "warm" ? "WARM ⚡" : "COLD ❄"}
        </span>

        {/* Small Navigation Arrows inside iframe preview for high reliability */}
        <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition duration-150">
          <button
            title="انتقال به مرحله قبل"
            onClick={(e) => {
              e.stopPropagation();
              onMove("prev");
            }}
            disabled={lead.status === "new"}
            className="p-0.5 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded border border-slate-205 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowRight size={10} />
          </button>
          <button
            title="انتقال به مرحله بعد"
            onClick={(e) => {
              e.stopPropagation();
              onMove("next");
            }}
            disabled={lead.status === "won"}
            className="p-0.5 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded border border-slate-205 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}
