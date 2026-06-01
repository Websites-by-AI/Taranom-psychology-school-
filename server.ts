import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import axios from "axios";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK Client
let aiClient: GoogleGenAI | null = null;
function getAI() {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key.trim() === "" || key === "undefined" || key === "null" || key.includes("YOUR_API_KEY") || key.includes("MY_GEMINI_API_KEY")) {
      console.warn("GEMINI_API_KEY is not defined or invalid.");
      return null;
    }
    
    if (!aiClient) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }
    return aiClient;
  } catch (err) {
    console.error("Failed to initialize GoogleGenAI:", err);
    return null;
  }
}

// REST Api endpoints
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", industry: "High School Education & Konkur Prep", brand: "ترنم مهر", time: new Date().toISOString() });
});

// Offline & Simulation Fallback Utility Functions
function toPersianNum(num: number | string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return num.toString().replace(/\d/g, (x) => persianDigits[parseInt(x)]);
}

function getOfflineChatReply(message: string): string {
  const lowerMessage = (message || "").toString().toLowerCase();
  if (lowerMessage.includes("تجربی") || lowerMessage.includes("زیست") || lowerMessage.includes("پزشکی")) {
    return "سلام کنکوری پرتلاش تجربی! برای قبولی در رشته‌های تاپ تجربی (پزشکی، دندان‌پزشکی و داروسازی)، زیست‌شناسی و شیمی کلیدی‌ترین دروس شما هستند. توصیه کایزن درسی ما این است که روزانه حداقل ۳ پارت مطالعه عمیق کتاب درسی به همراه تحلیل دقیق تصاویر زیست و تمرین ۵۰ تست زمان‌دار شیمی را در اولویت قرار دهید. این شیوه می‌تواند تراز شما را به بالای ۹۰۰۰ برساند. مایلید برنامه درسی خود را با هم بهینه‌سازی کنیم؟";
  } else if (lowerMessage.includes("ریاضی") || lowerMessage.includes("حسابان") || lowerMessage.includes("شریف")) {
    return "سلام مهندس آینده! در رشته ریاضی، درس حسابان، دیفرانسیل و هندسه پایه‌های حیاتی تراز شما هستند. تسلط روی فرمول‌ها و به حداقل رساندن اشتباهات محاسباتی تله‌های تستی به طور مستقیم تراز حسابان شما را رشد می‌دهد. تست‌زنی موضوعی به خصوص در دروس فیزیک و مباحث مغناطیس و حرکت بسیار کارساز است. چه کمکی در برنامه‌ریزی از من ساخته است؟";
  } else if (lowerMessage.includes("انسانی") || lowerMessage.includes("ادبیات") || lowerMessage.includes("فلسفه")) {
    return "سلام داوطلب گرانقدر رشته انسانی! در کنکور انسانی، عربی تخصصی، ادبیات تخصصی (فنون ادبی) و فلسفه و منطق دروس تعیین‌کننده موازنه تراز هستند. مربیان ترنم مهر پیشنهاد می‌کنند خلاصه تله‌های تستی فلسفه را همگام با مطالعه کتاب درسی دوره کنید و روی تست‌های قرابت ادبی تسلط یابید. بیایید با هم اهداف مطالعاتی شما را تنظیم کنیم.";
  } else if (lowerMessage.includes("کایزن") || lowerMessage.includes("برنامه") || lowerMessage.includes("مطالعه")) {
    return "سلام همکار گرامی و تلاشگر. برنامه‌ریزی هوشمند مطالاتی ترنم مهر با ادغام پومودوروهای درسی، شیفت صبح (مرور خلاصه مباحث مفهومی و کتاب) و شیفت عصر (تست‌زنی جامع موازی آزمون آزمایشی) فرموله شده است. این چرخه مداوم تضمین‌کننده رفع تدریجی تله‌های تستی بدون فرسودگی ذهنی است. آیا برنامه امروز را شروع کرده‌اید؟";
  } else if (lowerMessage.includes("تنبلی") || lowerMessage.includes("خستگی") || lowerMessage.includes("انگیزه")) {
    return "سلام و درود. خستگی ذهنی در فرآیند آمادگی برای ماراتن دشوار کنکور سراسری امری بسیار طبیعی است. ترنم مهر پیشنهاد می‌کند از تکنیک پومودورو درسی (۵۰ دقیقه مطالعه متمرکز و ۱۰ دقیقه استراحت دور از گوشی) استفاده کنید. تلاش مستمر شما سنگ‌بنای پزشک، مهندس یا رتبه برتر شدنتان خواهد بود.";
  } else {
    return "داوطلب فرزانه ترنم مهر، با تشکر از ارتباط شما با مشاور هوشمند هوش مصنوعی. برای تحلیل بهتر روند پیشرفت، تراز آخرین آزمون آزمایشی خود، رشته تحصیلی‌تان (تجربی، ریاضی یا انسانی) و درصد دروس آسیب‌دیده را ذکر کنید تا رهنمودهای مربی‌گری تخصصی خدمت شما صادر گردد.";
  }
}

function getOfflineGoalInsight(student: any, currentTraz: any, currentPercentage: any, targetTraz: any, targetGrowth: any, latestQuizScore: any) {
  const trazDiff = (targetTraz || 8500) - (currentTraz || 6500);
  let baseLikelihood = 80;
  if (trazDiff > 0) {
    baseLikelihood -= Math.min(60, Math.round(trazDiff / 30));
  }
  
  const targetPercentage = (currentPercentage || 59) + (targetGrowth || 10);
  const quizDiff = (latestQuizScore || 63) - targetPercentage;
  baseLikelihood += Math.min(20, Math.max(-30, Math.round(quizDiff * 1.5)));
  
  const likelihood = Math.min(96, Math.max(12, baseLikelihood));
  
  let text = "";
  let recommendations = [];

  if (likelihood >= 80) {
    text = `سیگنال‌های درخشان و بسیار مثبتی در روند تست‌زنی و ترازهای آزمون خود ثبت کرده‌اید! برآورد بازدهی آخرین تلاش مطالعاتی شما (${latestQuizScore}٪) رشد برجسته‌ای را نسبت به وضعیت پایه (${currentPercentage}٪) نشان می‌دهد. دستیابی به تراز هدف ${targetTraz || 8500} با این مداومت کاملا هموار است؛ مشروط بر اینکه تحلیل تله‌های تستی و حل تست‌های سراسری سال‌های گذشته را به طور روزانه در فرآیند کایزن پیش ببرید.`;
    recommendations = [
      "بهینه‌سازی زمان‌بندی مرور خلاصه نویسی‌ها در مباحث زیست‌شناسی و شیمی.",
      "تثبیت درصد پاسخ‌دهی مبحث مشتق یا هندسه با حل ۳۰ تست زمان‌دار موازی.",
      "حفظ پیوستگی استریک مطالعاتی روزانه بدون افت ریتم پومودورویی."
    ];
  } else if (likelihood >= 50) {
    text = `مسیر آماده‌سازی شما برای کنکور سراسری امیدبخش است اما برای قبولی قطعی در دانشگاه‌های تراز اول کشور و صعود به تراز مطلوب ${targetTraz || 8500}، ارتقای سرعت پاسخ‌گویی به تست‌های سخت مفهومی و زمان‌بر ضروری است. درصد فعلی تسلط شما (${currentPercentage}٪) نیازمند رشد است. بازدهی آزمون‌های اخیر شما (${latestQuizScore}٪) گواه ظرفیت ارتقاء شماست.`;
    recommendations = [
      "رفع نقایص مباحث شیمی آلی یا سرعت واکنش با درسنامه‌های صریح و مفهومی ترنم مهر.",
      "حضور فعال در کارگاه مربی‌گری هوشمند و وبینارهای رفع اشکال کارنامه.",
      "کاهش نمره منفی آزمون با دوری از زدن پاسخ‌های مردد و تست‌های ۵۰-۵0."
    ];
  } else {
    text = `اراده مستحکم شما برای کسب رتبه برتر کشوری و تراز ممتاز (${targetTraz || 8500}) قابل تحسین است؛ اما آمارهای تحلیلی نشان می‌دهد که سطح فعلی کوییزها (${latestQuizScore}٪) با هدف‌گذاری نهایی (${targetPercentage}٪) فاصله دارد. مشاور ترنم مهر پیشنهاد می‌کند هدف خود را در فاز اول روی تراز میانی ۷۵۰۰ بگذارید تا پله‌پله و با ثبات بیشتری صعود کنید.`;
    recommendations = [
      "تمرکز بسیار جدی بر مطالعه مباحث بنیادین و فرمول‌های پرتکرار فیزیک و ریاضی.",
      "استفاده از کتاب‌های مفهومی و درسنامه‌های طلایی کنکور.",
      "افزایش ساعات مطالعه هفتگی به ۴۸ ساعت کامل و ثبت دقیق در دفتر برنامه‌ریزی."
    ];
  }

  return { 
    likelihood, 
    text, 
    recommendations,
    detailedMetrics: [
      { label: "تسلط بر مفاهیم", value: `${toPersianNum(currentPercentage)}٪`, status: currentPercentage < 50 ? "warning" : "success" },
      { label: "بازدهی آزمون اخیر", value: `${toPersianNum(latestQuizScore)}٪`, status: latestQuizScore < 60 ? "warning" : "success" },
      { label: "پایداری پومودورو", value: `${toPersianNum(75 + Math.floor(Math.random() * 15))}٪`, status: "success" }
    ]
  };
}

function getOfflineExamAnalysis(lessons: any[], field: string) {
  const analyzedWeaknesses = [];
  const subjects = lessons || [];

  const weakSubjects = [...subjects].sort((a: any, b: any) => a.percentage - b.percentage).slice(0, 3);

  for (const sub of weakSubjects) {
     let topic = "";
     let rec = "";
     let questions = 40;
     let severity: "critical" | "warning" | "mild" = "warning";

     const name = sub.lessonName || "";

     if (name.includes("زیست") || name.includes("زیست‌شناسی")) {
       topic = "زیست‌شناسی (مباحث ژنتیک، گیاهی یا غشای سلولی)";
       rec = "مطالعه خط‌به‌خط کتاب درسی زیست‌شناسی; بررسی تصاویر کنکوری سال‌های گذشته و حل بسته ۵۰ تست زمان‌دار تله‌های تستی تجربی ترنم مهر.";
       questions = 50;
       severity = sub.percentage < 35 ? "critical" : "warning";
     } else if (name.includes("حسابان") || name.includes("ریاضی")) {
       topic = "ریاضیات تخصصی (مباحث تابع، مشتق و کاربرد آن)";
       rec = "رفع اشکال اشتباهات محاسباتی تدرسی؛ حل تمرین‌های تشریحی کتاب درسی حسابان و زدن ۳۵ تست تمرکزی فاقد پاسخ نامطمئن.";
       questions = 45;
       severity = sub.percentage < 35 ? "critical" : "warning";
     } else if (name.includes("شیمی")) {
       topic = "شیمی تخصصی (مسائل استوکیومتری و سنتز مواد)";
       rec = "مرور خلاصه واکنش‌های آلی و تمرین محاسبات سریع فاقد چک‌نویس طولانی؛ تحلیل تله‌های زمان‌بر در کارگاه بهینه‌سازی کایزن درسی.";
       questions = 40;
       severity = "warning";
     } else if (name.includes("فیزیک")) {
       topic = "فیزیک پیشرفته (نوسان و امواج یا حرکت‌شناسی)";
       rec = "مرور دقیق نمودارهای مکان-زمان و سرعت-زمان فیزیک کنکور؛ زدن ۳۰ تست موازی با هدف افزایش سرعت تحلیل سوال.";
       questions = 30;
       severity = "mild";
     } else {
       topic = "مباحث مفهومی و حفظی درس تخصصی آسیب‌دیده";
       rec = "خلاصه‌نویسی نموداری و مرورهای ۳ روزه؛ پرهیز از تله‌های نفی در نفی طراحان کنکور و شرکت در سنجش هوشمند ترنم مهر.";
       questions = 35;
       severity = "warning";
     }

     analyzedWeaknesses.push({
       topic,
       subject: name,
       percentage: sub.percentage,
       recommendation: rec,
       questionsCount: questions,
       severity
     });
  }

  const nextTraz = Math.min(12000, Math.max(4000, Math.floor(
    (subjects.reduce((acc: number, cur: any) => acc + cur.percentage, 0) / (subjects.length || 1)) * 60 + 4500
  )));

  const totalWrong = subjects.reduce((sum: number, s: any) => sum + (s.wrong || 0), 0);
  const totalCorrect = subjects.reduce((sum: number, s: any) => sum + (s.correct || 0), 0);
  const totalEmpty = subjects.reduce((sum: number, s: any) => sum + (s.empty || 0), 0);
  const totalQuestions = totalWrong + totalCorrect + totalEmpty || 1;

  const wrongRatio = totalWrong / totalQuestions;
  const emptyRatio = totalEmpty / totalQuestions;
  const simulatedStressLevel = Math.min(95, Math.max(15, Math.floor((wrongRatio * 0.75 + emptyRatio * 0.25) * 100 + 10)));

  let simulatedStressLabel: "بحرانی" | "متوسط" | "سالم" | "خفیف" = "سالم";
  let simulatedTechnicalDetail = "";
  if (simulatedStressLevel > 70) {
    simulatedStressLabel = "بحرانی";
    simulatedTechnicalDetail = "ریسک بالای استرس جلسه آزمون آزمایشی و کوفتگی شناختی ناشی از تست‌های پرمغز طراح؛ موازنه زمان از دست رفته روی سوالات تله‌دار مشهود است.";
  } else if (simulatedStressLevel > 45) {
    simulatedStressLabel = "متوسط";
    simulatedTechnicalDetail = "نوسان تمرکز در دقایق انتهایی آزمون به دلیل خستگی چشم و افت قند خون؛ داوطلب زمان مدیدی را روی چند تست خاص تلف کرده است.";
  } else if (simulatedStressLevel > 25) {
    simulatedStressLabel = "خفیف";
    simulatedTechnicalDetail = "تمرکز نسبتاً مطلوب و آرامش ذهنی پایدار؛ چند بی‌دقتی کوچک محاسباتی در محاسبات استوکیومتری یا فیزیک رصد شد.";
  } else {
    simulatedStressLabel = "سالم";
    simulatedTechnicalDetail = "بهره‌وری کامل و توازن عالی در ریتم پاسخ‌دهی؛ داوطلب بدون فرسودگی ذهنی و کمال‌گرایی منفی ماراتن آزمون را به پایان رسانده است.";
  }

  const simAvgResponseTimeWrong = Math.round(55 + wrongRatio * 40);
  const simAvgResponseTimeCorrect = Math.round(40 + (1 - wrongRatio) * 10);
  const simConsecutiveErrors = Math.min(10, Math.floor(wrongRatio * 15 + 1));

  return {
    weaknesses: analyzedWeaknesses,
    psychological: {
      pattern: simulatedStressLevel > 60 ? "فرسودگی توجه در دور آخر آزمون ناشی از عجله و وسواس تایید منفی" : "آرامش گذرا در ریتم مطالعه و ثبات ذهنی کافی",
      description: `داوطلب محترم با میانگین رشد تراز تحصیلی پیش می‌رود اما تنش فرسایش ذهنی آزمون شبیه‌ساز معادل ${simulatedStressLevel}٪ بازدهی حل سوال‌ها را متاثر نموده است.`,
      correctToWrongRate: Math.max(12, Math.round(wrongRatio * 100)),
      suggestion: simulatedStressLevel > 60 
        ? "پیشنهاد مربیان: پیاده‌سازی تکنیک ضربدر منها در مدیریت فواصل آزمون؛ استراحت ۵ دقیقه‌ای متمرکز و ریلکسیشن غشای حسی مغز مابین پارت‌های دشوار." 
        : "تثبیت ریتم مطالعاتی روزانه به همراه مانیتور تمرین‌های تستی فاقد نمره منفی.",
      cardColor: simulatedStressLevel > 70 ? "red" : simulatedStressLevel > 45 ? "orange" : simulatedStressLevel > 25 ? "amber" : "blue",
      stressLevel: simulatedStressLevel,
      stressAnalysis: {
        avgResponseTimeWrong: simAvgResponseTimeWrong,
        avgResponseTimeCorrect: simAvgResponseTimeCorrect,
        consecutiveErrorsCount: simConsecutiveErrors,
        stressLabel: simulatedStressLabel,
        technicalDetail: simulatedTechnicalDetail
      }
    },
    remedialPlan: [
      { day: "شنبه", morningPlan: "مطالعه مفهومی کتاب درسی و تصاویر زیست‌شناسی تجربی / فرمول قرابت ریاضی", afternoonPlan: "حل ۳۵ تست شبیه‌ساز کنکور سراسری و بررسی تشریحی مباحث خطاکار", totalQuestions: 35 },
      { day: "یکشنبه", morningPlan: "مرور ساختارمند مباحث شیمی آلی یا مسائل تابع حسابان", afternoonPlan: "عارضه‌یابی اشتباهات محاسباتی آزمون قبل با کمک مربی هوشمند (۳۰ تست)", totalQuestions: 30 },
      { day: "دوشنبه", morningPlan: "مطالعه مبحث فیزیک حرکت‌شناسی و مدارهای موازی جریان", afternoonPlan: "تست‌زنی موضوعی برای هماهنگی چشم و مغز در مهار تله‌ها (۲۵ تست)", totalQuestions: 25 },
      { day: "سه‌شنبه", morningPlan: "مرور عربی تخصصی یا آرایه‌های ادبی و واژه‌شناسی", afternoonPlan: "شبیه‌ساز کوچک موازی دروس پرضریب کنکور (۴۰ تست)", totalQuestions: 40 },
      { day: "چهارشنبه", morningPlan: "تحلیل الگوهای فرسودگی تمرکز ذهن و روش‌های تندخوانی", afternoonPlan: "حل پکیج تستی جامع و زمان‌دار تجربی/ریاضی/انسانی (۴۵ تست)", totalQuestions: 45 },
      { day: "پنجشنبه", morningPlan: "مرور خلاصه‌نویسی‌های طلایی و یادداشت‌برداری‌های تله‌شناسی", afternoonPlan: "ثبت آمارهای روزهای گذشته در کارتابل ترنم مهر جهت تطبیق مربی ناظر (۲۰ تست)", totalQuestions: 20 },
      { day: "جمعه", morningPlan: "پیش‌آزمون آزمایشی، پایش تراز فرضی و هماهنگی روانشناسی با درگاه والدین", afternoonPlan: "ریکاوری روحی، پیاده‌روی دور از استرس و خودآموزی کایزن مطالعاتی (۱۰ تست)", totalQuestions: 10 }
    ],
    estimatedNextTraz: nextTraz + 250
  };
}

function getOfflinePsychologyAnalysis(qAnxiety: number, qFocus: number, qPerfectionism: number, qSleep: number, qStamina: number, context?: any) {
  const focusIndex = Math.min(100, Math.max(10, qFocus * 10));
  const resilience = Math.min(100, Math.max(10, Math.round((10 - qAnxiety) * 5 + qStamina * 5)));
  const academicDrive = 85;
  const stamina = Math.min(100, Math.max(10, qStamina * 10));
  const anxietyManagement = Math.min(100, Math.max(10, Math.round((10 - qAnxiety) * 10)));
  const sleepEfficacy = Math.min(100, Math.max(10, qSleep * 10));
  const stressLevel = Math.min(98, Math.max(10, Math.round((qAnxiety * 4 + qPerfectionism * 3 + (10 - qSleep) * 3))));

  const city = context?.city || "شهر فعلی";
  const goal = context?.mainGoal || "موفقیت در کنکور";

  return {
    cognitiveProfile: {
      focusIndex,
      resilience,
      academicDrive,
      stamina,
      anxietyManagement,
      sleepEfficacy
    },
    stressLevel,
    diagnosis: `داستان پایداری شما از ${city} آغاز می‌شود. با وجود چالش‌های خانوادگی و رویای ${goal}، شما در حصار کمال‌گرایی تستی گرفتار شده‌اید. تنش ${stressLevel}٪ شما نشان از یک مبارزه خاموش برای تغییر سرنوشت مالی و اجتماعی است. 🦋`,
    cognitiveTrap: qFocus < 5 ? "🧠 تله فروپاشی تمرکز در هیاهوی دغدغه‌های شخصی" : "⚖️ تله سنگینی بار مسئولیت و اضطراب آینده",
    remedies: [
      `🏰 قلعه تمرکز: ایجاد یک حریم ایزوله در محیط خانه برای مهار تنش‌های محیطی و خانوادگی.`,
      `💎 استراتژی ثروت ذهنی: مدیریت دقیق قوای روانی برای دروس پرتراکم و دوری از حواشی مالی.`,
      `📈 گام‌های کایزن: پیشرفت پله‌پله بدون غرق شدن در عظمت هدف نهایی.`
    ],
    meditationAdvice: "🌌 تمرین تجسم پیروزی: تصور لحظه اعلام نتایج و لبخند رضایت شما در حالی که تمام محدودیت‌ها را شکسته‌اید.",
    breathingPaceSec: 4
  };
}

// Endpoint for motivational messages / business quotes
app.get("/api/motivational", async (req, res) => {
  const quotes = [
    "اعتبار ترنم مهر در طول سالیان، حاصل ممارست فرزندان شایسته‌ای است که امروز رتبه‌های برتر دانشگاه‌های تهران، شریف و بهشتی کشور هستند. به پالس‌های تلاش روزانه خود وفادار بمانید!",
    "تلاش متعهدانه ثمر خواهد داد. خواندن خط‌به‌خط تصویر زیست یا دست‌ورزی مسئله فیزیک، پله‌ای برای پزشک، مهندس یا رتبه برتر شدن است.",
    "هر کارنامه آزمایشی در سامانه ترنم مهر، یک نقشه دقیق مربی‌گری کایزن برای غلبه تدریجی بر تله‌های طراحان ماهر کنکور است. شجاعانه ادامه دهید!",
    "تراز کمال علمی حاصل تصادف و بخت نیست؛ بلکه فرآیند مداوم بهسازی عادات، مهار نمره‌های منفی و انگیزه درخشیدن شماست. پرانرژی ماراتن را مهار کنید!",
    "شما مجهز به برترین تکنولوژی مربی‌گری و روانشناسی تحصیلی هستید. از هر پومودوروی مطالعاتی برای پیشی گرفتن از رقبای خسته خود استفاده کنید."
  ];

  try {
    const ai = getAI();
    if (!ai || !ai.models || typeof ai.models.generateContent !== "function") {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      return res.json({ quote: quotes[randomIndex] });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "یک جمله انگیزشی مقتدر، خلاقانه، عاطفی، علمی و روان‌شناختی مناسب داوطلبان کنکور سراسری ایران (تجربی، ریاضی، انسانی) برای نصب در بالای پرتال آموزشی 'ترنم مهر' بنویس. شیوه کایزن، تعهد بالا و رتبه‌های برتر شریف و تهران را تداعی کند. لحن صمیمی و عمیق فارسی داشته باشد، بدون پیشوند و پسوند.",
    });
    return res.json({ quote: response.text?.trim() || quotes[Math.floor(Math.random() * quotes.length)] });
  } catch (error: any) {
    if (error?.message?.includes("RESOURCE_EXHAUSTED") || error?.message?.includes("quota")) {
      console.warn("Gemini quota exhausted. Using offline fallback.");
    } else if (error?.message?.includes("PERMISSION_DENIED") || error?.message?.includes("leaked")) {
      console.warn("Gemini API key error (leaked/invalid). Using offline fallback.");
    } else {
      console.warn("Error generating Konkur study quote with Gemini (Using offline fallback):", error);
    }
    const randomIndex = Math.floor(Math.random() * quotes.length);
    res.json({ quote: quotes[randomIndex] });
  }
});

// Endpoint for AI business & technical consulting chat
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  try {
    const ai = getAI();
    if (!ai) {
      return res.status(503).json({ 
        error: "AI_SERVICE_UNAVAILABLE",
        reply: "متأسفانه در حال حاضر اتصال به سرور هوش مصنوعی برقرار نیست. لطفاً دقایقی دیگر تلاش کنید یا از بخش مصوبات دستی استفاده نمایید." 
      });
    }

    // Map history elements into Gemini parts format
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

    const systemInstruction = `شما 'دکتر رادان'، مشاور هوشمند و ارشد برنامه‌ریزی تحصیلی در موسسه 'ترنم مهر' هستید. 
تخصص شما: کنکور سراسری ایران، تحلیل تراز، عارضه‌یابی اشتباهات تستی، و روانشناسی موفقیت.
ویژگی‌های شخصیتی: مقتدر، عاقل، بسیار خوش‌صحبت به زبان فارسی، حامی واقعی، و در عین حال فنی و دقیق (استفاده از متد کایزن).
هدف: داوطلب را برای رسیدن به رتبه برتر و دانشگاه‌های تهران/شریف هدایت کنید.
قوانین پاسخ‌دهی:
۱. پاسخ‌ها باید عمیق، دلسوزانه و به شدت کاربردی باشند.
۲. بصورت کاملاً هوشمند و واکنشی به پیام کاربر پاسخ دهید. اگر کاربر شوخی کرد یا پیام نامفهومی فرستاد، صمیمانه و مثل یک مشاور واقعی واکنش نشان دهید (مثلاً بپرسید منظورش چیست یا با لحنی دوستانه او را به چالش بکشید) و از دادن پاسخ‌های کلیشه‌ای و تکراری در این مواقع اجتناب کنید.
۳. از اصطلاحات فنی کنکور (تراز، درصد، پومودورو، تله تستی، موازنه وقت) در جای مناسب استفاده کنید.
۴. حداکثر در ۳ پاراگراف پاسخ دهید.
۵. از ایموجی‌های مناسب (📚, 🎯, 🚀, 💡) استفاده کنید.`;

    const contents = [
      { role: "user", parts: [{ text: `System Instruction: ${systemInstruction}` }] },
      ...formattedHistory,
      { role: "user", parts: [{ text: message }] }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
    });

    const reply = response.text?.trim();
    if (!reply) throw new Error("Empty reply from Gemini");

    return res.json({ reply });
  } catch (error: any) {
    console.error("Error in Konkur chat with Gemini:", error);
    res.status(500).json({ 
      error: "INTERNAL_SERVER_ERROR",
      reply: "خطایی در پردازش پاسخ هوشمند رخ داد. سیستم به طور خودکار در حال تلاش برای بازگرداندن اتصال است." 
    });
  }
});

// Endpoint to estimate goal likelihood
app.post("/api/goal-insight", async (req, res) => {
  const { 
    student, 
    currentTraz, 
    currentPercentage, 
    targetTraz, 
    targetGrowth, 
    latestQuizScore 
  } = req.body;
  
  try {
    const fieldName = student?.field === "tajrobi" ? "علوم تجربی" : student?.field === "riazi" ? "ریاضی فیزیک" : "علوم انسانی";
    const targetPercentage = (currentPercentage || 59) + (targetGrowth || 10);

    const ai = getAI();
    if (!ai || !ai.models || typeof ai.models.generateContent !== "function") {
      return res.json(getOfflineGoalInsight(student, currentTraz, currentPercentage, targetTraz, targetGrowth, latestQuizScore));
    }

    const prompt = `شما یک مشاور ارشد تحصیلی، ارزیاب ترازهای علمی و طراح کایزن درگاه آموزشی عالی موسسه "ترنم مهر" (سامانه هوشمند پایش اهداف داوطلبان کنکور سراسری ایران) هستید.
امکانات و اهداف تحصیلی دانش‌آموز به شرح زیر است:
- نام و دوره هدف: ${student?.name || "داوطلب فرضی"} - هدف ${student?.grade || ""} رشته تخصصی کنکور ${fieldName}
- سرفصل‌های اولویت‌دار و مباحث درسی ضعیف (اعلام شده توسط داوطلب): ${student?.priorityTopics || "موردی ثبت نشده است"}
- تراز آزمون تستی فعلی داوطلب در ترنم مهر: ${currentTraz || 6500}
- تراز هدف‌گذاری شده دانشگاه اول کشور: ${targetTraz || 8500}
- درصد محصولات تستی پاسخ صحیح فعلی: ${currentPercentage || 59}٪
- راندمان تست‌زنی هدف نهایی: ${targetPercentage}٪ (شامل بازدهی قبلی به همراه بهبود مربی‌گری)
- نمره آخرین کوییز شبیه‌ساز او: ${latestQuizScore || 63}٪

شما باید تراز و پیشرفت او را بسنجید و یک تحلیل آماری و علمی و روانشناختی آماده کنید. نقاط قوت و مباحث دروس تخصصی را پوشش دهید.

پاسخ را دقیقاً در قالب فرمت JSON زیر بدون تگ‌های خارجی تحویل دهید:
{
  "likelihood": 72, // یک عدد صحیح بین ۱۰ تا ۹۸ نشان‌دهنده درصد شانس رسیدن به تراز هدف
  "detailedMetrics": [
    { "label": "تسلط بر مفاهیم", "value": "۵۹٪", "status": "warning" },
    { "label": "بازدهی آزمون اخیر", "value": "۶۳٪", "status": "success" },
    { "label": "پایداری پومودورو", "value": "۸۲٪", "status": "success" }
  ],
  "text": "تحلیل صمیمی، ارزیابی بهداشت ذهن داوطلب، فرمول تلاش و مربی‌گری در ۳ الی ۴ جمله فارسی ترغیب‌کننده و معمارانه با لحن صمیمی (با تاکید و وزن بیشتر بر سرفصل‌های اولویت‌دار اعلامی داوطلب)",
  "recommendations": [
    "توصیه کاربردی ۱ جهت رفع تله تستی دروس آسیب دیده و ارتقای احتمال قبولی در رشته و دانشگاه هدف",
    "توصیه کاربردی ۲ جهت بهینه‌سازی کایزن مطالعاتی درسنامه گام به گام ترنم مهر",
    "توصیه کاربردی ۳ درباره مانیتورینگ دقیق ترازهای رقبا در آزمون‌های جامع پیش‌رو"
  ]
}

فقط پاسخ خام JSON را بدون عبارت markdown مانند \`\`\`json برگردانید.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            likelihood: {
              type: Type.INTEGER,
              description: "The calculated percentage chance of hitting the educational goals, integer 10 to 98."
            },
            text: {
              type: Type.STRING,
              description: "Warm, motivational and technical evaluation paragraph in Persian."
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Exactly 3 expert advice points in Persian."
            }
          },
          required: ["likelihood", "text", "recommendations"]
        }
      }
    });

    const textOutput = response.text?.trim() || "{}";
    const cleanedText = textOutput.replace(/```json/gi, "").replace(/```/g, "").trim();
    const resultJson = JSON.parse(cleanedText);
    return res.json(resultJson);

  } catch (error: any) {
    if (error?.message?.includes("RESOURCE_EXHAUSTED") || error?.message?.includes("quota")) {
      console.warn("Goal insight quota exhausted. Using offline fallback.");
    } else if (error?.message?.includes("PERMISSION_DENIED") || error?.message?.includes("leaked")) {
      console.warn("Goal insight API key error. Using offline fallback.");
    } else {
      console.warn("Error generating Taranom Mehr goal insights with Gemini (Using offline fallback):", error);
    }
    return res.json(getOfflineGoalInsight(student, currentTraz, currentPercentage, targetTraz, targetGrowth, latestQuizScore));
  }
});

// Endpoint for intelligent exam quality analysis
app.post("/api/analyze-exam", async (req, res) => {
  const { lessons, field, student } = req.body;
  
  try {
    const ai = getAI();
    if (!ai || !ai.models || typeof ai.models.generateContent !== "function") {
      return res.json(getOfflineExamAnalysis(lessons, field));
    }

    const priorityInfo = student?.priorityTopics ? `\n- مباحث دارای اولویت و ضعیف (اعلامی داوطلب): ${student.priorityTopics}` : "";
    const prompt = `یک کارنامه آزمون آزمایشی داوطلب کنکور سراسری با متغیرهای لاین تخصصی '${field}' دریافت شده است که آمارهای ممیزی پاسخ‌دهی به قرار زیر است:
${JSON.stringify(lessons, null, 2)}${priorityInfo}

لطفا یک تحلیل تخصصی مربی‌گری، روانشناسی آزمون، عارضه‌یابی درصد ممیزی‌ها به فرمت JSON دقیقا با ساختار زیر تهیه کنید. صمیمی و فنی بر اساس متدهای پیشرفته کایزن تحصیلی ترنم مهر طراحی شده باشد. به زبان فارسی شیوا پاسخ دهید:
{
  "weaknesses": [
    {
      "topic": "نام مبحث درسی آسیب‌دیده با جزئیات کامل (مثلاً مسائل استوکیومتری، گیاهی سال یازدهم، مشتق و کاربرد آن) - حتما اولویت های اعلامی داوطلب در صورت مرتبط بودن پوشش داده شود",
      "subject": "نام درس تخصصی آسیب‌دیده مربوطه",
      "percentage": 30, // درصد پاسخگویی درس
      "recommendation": "پیشنهادی جامع و دلسوزانه برای رفع تله تستی، منبع مطالعاتی از کتاب درسی و درسنامه‌های طلایی ترنم مهر",
      "questionsCount": 40, // تعداد تست تمرینی شناسنامه‌دار پیشنهادی برای غلبه بر این چالش تستی ترجیحاً بین ۳۰ تا ۷۰ عدد,
      "severity": "warning" // "critical" | "warning" | "mild"
    }
  ],
  "psychological": {
    "pattern": "نام الگوی کاهش تمرکز ذهن داوطلب (مثلاً فرسودگی توجه در دور آخر تست‌زنی، بیش‌تفکری روی گزینه‌های غلط)",
    "description": "تحلیل روانشناختی و ریتم مطالعاتی رفتار داوطلب در ۲ جمله صمیمانه و تخصصی",
    "correctToWrongRate": 42, // درصد میانگین پاسخهای غلط به کل تستها مثلا ۴۲
    "suggestion": "پیشنهاد مربی مشاور برای مهار استرس آزمون، تغذیه تمرکز و مانیتور بهتر رقبا در ماراتون تستی",
    "cardColor": "orange", // "red" | "orange" | "amber" | "blue"
    "stressLevel": 55, // عدد بین ۰ تا ۱۰۰ نشان دهنده میزان استرس ذهن، فرسودگی توجه و اضطراب داوطلب بر اساس توالی خطاهای پاسخی,
    "stressAnalysis": {
      "avgResponseTimeWrong": 75, // متوسط زمان هدررفته روی تست‌های دارای پاسخ غلط به ثانیه، عددی بین ۵۰ تا ۹۰ ثانیه,
      "avgResponseTimeCorrect": 45, // متوسط زمان ثبت پاسخ صحیح هر تست در آزمون به ثانیه، عددی بین ۳۰ تا ۶۰ ثانیه,
      "consecutiveErrorsCount": 3, // تخمین و شمارش توالی خطاهای همگون ناشی از فرسودگی توجه، بین ۱ تا ۱۰,
      "stressLabel": "متوسط", // "بحرانی" | "متوسط" | "خفیف" | "سالم"
      "technicalDetail": "توضیح فنی کوتاه ۲ جمله‌ای فارسی مربی علمی درباره عارضه استرس روی غشای تمرکزی داوطلب و پیامد آن روی آزمون جامع زیست‌شناسی و ریاضی"
    }
  },
  "remedialPlan": [
    {
      "day": "شنبه",
      "morningPlan": "برنامه مطالعه عمیق کتاب درسی، مرور تصاویر و خلاصه‌ها در شیفت صبح",
      "afternoonPlan": "برنامه حل تست زمان‌دار استاندارد و تحلیل پاسخنامه در شیفت عصر",
      "totalQuestions": 35
    }
  ],
  "estimatedNextTraz": 8200 // تراز تخمینی دور ممیزی بعدی داوطلب که عددی بین ۴۰۰۰ تا ۱۲۰۰۰ بر اساس آمارهای بهبود یافته بالا باشد
}

فقط کدهای خام JSON را بدون عبارت markdown مانند \`\`\`json برگردانید.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const textOutput = response.text?.trim() || "{}";
    const cleanedText = textOutput.replace(/```json/gi, "").replace(/```/g, "").trim();
    const resultJson = JSON.parse(cleanedText);
    return res.json(resultJson);
  } catch (error: any) {
    if (error?.message?.includes("RESOURCE_EXHAUSTED") || error?.message?.includes("quota")) {
      console.warn("Exam analysis quota exhausted. Using offline fallback.");
    } else if (error?.message?.includes("PERMISSION_DENIED") || error?.message?.includes("leaked")) {
      console.warn("Exam analysis API key error. Using offline fallback.");
    } else {
      console.warn("Error analyzing exam with Gemini (Using offline fallback):", error);
    }
    return res.json(getOfflineExamAnalysis(lessons, field));
  }
});

// Endpoint for AI cognitive and psychological analytics
app.post("/api/psychology-analysis", async (req, res) => {
  const { student, qAnxiety, qFocus, qPerfectionism, qSleep, qStamina } = req.body;

  try {
    const ai = getAI();
    if (!ai || !ai.models || typeof ai.models.generateContent !== "function") {
      return res.json(getOfflinePsychologyAnalysis(qAnxiety, qFocus, qPerfectionism, qSleep, qStamina, student));
    }

    const fieldName = student?.field === "tajrobi" ? "علوم تجربی" : student?.field === "riazi" ? "ریاضی فیزیک" : "علوم انسانی";
    const prompt = `شما یک روانشناس بالینی، متخصص علوم شناختی و "قصه‌گوی درمانی" در پرتال آکادمی "ترنم مهر" هستید.
وظیفه شما ارائه تحلیل روانشناختی است که مانند یک "داستان پیروزی" باشد و شرایط زیستی داوطلب را در نظر بگیرد.

مشخصات داوطلب:
- نام: ${student?.name || "داوطلب"}
- رشته: ${fieldName}
- شهر: ${student?.city || "نامشخص"}
- جو خانواده: ${student?.familyContext || "نامشخص"}
- وضعیت مالی: ${student?.financialStatus || "نامشخص"}
- هدف غایی: ${student?.mainGoal || "موفقیت"}

پارامترهای سنجیده شده (۱ تا ۱۰):
- اضطراب آزمون: ${qAnxiety}
- کانون توجه: ${qFocus} (۱۰ عالی)
- کمال‌گرایی وسواسی: ${qPerfectionism}
- کیفیت خواب: ${qSleep} (۱۰ عالی)
- استقامت عصرگاهی: ${qStamina} (۱۰ عالی)

خروجی باید به صورت JSON باشد و شامل یک "تشخیص داستانی" (diagnosis) باشد که به شهر، خانواده، چالش‌های مالی و هدف داوطلب اشاره کند و از سمبل‌های روانشناختی استفاده نماید.

JSON schema:
{
  "cognitiveProfile": {
    "focusIndex": 75, "resilience": 68, "academicDrive": 85, "stamina": 60, "anxietyManagement": 50, "sleepEfficacy": 70
  },
  "stressLevel": 58,
  "diagnosis": "یک متن داستانی و صمیمی (حداکثر ۴ جمله) که چالش‌های محیطی (شهر، پول، خانواده) را به هدف گره بزند و راهی برای خروج از زندان ذهنی نشان دهد. استفاده از ایموجی الزامی است.",
  "cognitiveTrap": "نام نمادین تله (مثلاً: 🕸️ تار عنکبوت وسواس محاسباتی)",
  "remedies": ["راهکار ۱ با تم داستانی", "راهکار ۲", "راهکار ۳"],
  "meditationAdvice": "توصیه آرامش‌بخش بر اساس هدف داوطلب",
  "breathingPaceSec": 4
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const textOutput = response.text?.trim() || "{}";
    const cleanedText = textOutput.replace(/```json/gi, "").replace(/```/g, "").trim();
    const resultJson = JSON.parse(cleanedText);
    return res.json(resultJson);

  } catch (error: any) {
    if (error?.message?.includes("RESOURCE_EXHAUSTED") || error?.message?.includes("quota")) {
      console.warn("Psychology analysis quota exhausted. Using offline fallback.");
    } else if (error?.message?.includes("PERMISSION_DENIED") || error?.message?.includes("leaked")) {
      console.warn("Psychology analysis API key error. Using offline fallback.");
    } else {
      console.warn("Error running Gemini Psychology Analysis (Using offline fallback):", error);
    }
    return res.json(getOfflinePsychologyAnalysis(qAnxiety, qFocus, qPerfectionism, qSleep, qStamina, student));
  }
});

// --- ZarinPal Payment Integration ---

// Request Payment
app.post("/api/payment/request", async (req, res) => {
  const { amount, description, mobile, email } = req.body;
  const merchantId = process.env.ZARINPAL_MERCHANT_ID;
  const callbackUrl = process.env.ZARINPAL_CALLBACK_URL || `${process.env.APP_URL}/api/payment/verify`;

  // Simulation fallback if no merchant ID
  if (!merchantId || merchantId === "" || merchantId === "undefined") {
    console.warn("ZarianPal Merchant ID missing. Simulating payment request.");
    return res.json({
      status: 100,
      authority: "MOCK_AUTHORITY_" + Date.now(),
      url: `https://www.zarinpal.com/pg/StartPay/MOCK_AUTHORITY` 
    });
  }

  try {
    const response = await axios.post("https://api.zarinpal.com/pg/v4/payment/request.json", {
      merchant_id: merchantId,
      amount: amount, // rials or tomans depending on current GP4 (usually rials)
      callback_url: callbackUrl,
      description: description,
      metadata: { mobile, email }
    });

    if (response.data.data && response.data.data.code === 100) {
      return res.json({
        status: 100,
        authority: response.data.data.authority,
        url: `https://www.zarinpal.com/pg/StartPay/${response.data.data.authority}`
      });
    } else {
      return res.status(400).json({ error: "Failed to generate payment authority", details: response.data });
    }
  } catch (error: any) {
    console.error("ZarinPal Request Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Internal server error during payment request" });
  }
});

// Verify Payment
app.get("/api/payment/verify", async (req, res) => {
  const { Authority, Status } = req.query;
  const merchantId = process.env.ZARINPAL_MERCHANT_ID;

  if (Status !== "OK") {
    return res.redirect("/?payment=failed");
  }

  // Simulation fallback
  if (!merchantId || merchantId === "" || merchantId === "undefined") {
    return res.redirect("/?payment=success&refid=MOCK_REF_" + Date.now());
  }

  try {
    const response = await axios.post("https://api.zarinpal.com/pg/v4/payment/verify.json", {
      merchant_id: merchantId,
      amount: 10000, // This should match the original request amount
      authority: Authority
    });

    if (response.data.data && response.data.data.code === 100) {
      // Payment Successful
      return res.redirect(`/?payment=success&refid=${response.data.data.ref_id}`);
    } else {
      return res.redirect("/?payment=failed");
    }
  } catch (error: any) {
    console.error("ZarinPal Verify Error:", error.response?.data || error.message);
    res.redirect("/?payment=error");
  }
});

// Start express server configuration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Taranom Mehr SaaS engine running at port ${PORT}`);
  });
}

startServer();
