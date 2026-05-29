import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK Client
let aiClient: GoogleGenAI | null = null;
function getAI() {
  try {
    if (!aiClient) {
      const key = process.env.GEMINI_API_KEY;
      if (!key || key.trim() === "" || key === "undefined" || key === "null") {
        console.warn("GEMINI_API_KEY is not defined or invalid. Using local simulation engine for AI responses.");
        return null;
      }
      aiClient = new GoogleGenAI({
        apiKey: key
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
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Offline & Simulation Fallback Utility Functions for Chatr-e-Danesh Legal Exams
function getOfflineChatReply(message: string): string {
  const lowerMessage = (message || "").toString().toLowerCase();
  if (lowerMessage.includes("مدنی") || lowerMessage.includes("حقوق مدنی")) {
    return "سلام داوطلب عزیز وکیل آینده! حقوق مدنی با ضریب ۳ مهم‌ترین و ترازساز‌ترین درس در آزمون وکالت است. به خصوص مباحث عقود معین (مانند بیع، اجاره، رهن) و مدنی ۳ (قواعد عمومی قراردادها). پیشنهاد می‌کنم به جای حفظ صِرف مواد قانون، سناریوهای کارگاهی آزمون‌های سال گذشته چتر دانش را تحلیل کنی و برای هر ماده یک مثال فرضی بنویسی. چطور پیش میره این روش برات؟";
  } else if (lowerMessage.includes("آیین دادرسی") || lowerMessage.includes("دادرسی مدنی") || lowerMessage.includes("آدم")) {
    return "سلام خسته نباشید همکار آینده! آیین دادرسی مدنی درسی تماماً فرآیندی و فرموله شده است. صلاحیت‌های ذاتی و محلی مراجع، مواعد قانونی، و طرق فوق‌العاده شکایت از آرا (واخواهی، تجدیدنظر، فرجام‌خواهی) اهمیت بسیار بالایی دارند. از درسنامه‌های طلایی چتر دانش، نمودار درختی فرایند واخواهی تا فرجام رو رسم کن و روی میز مطالعه‌ت قرار بده تا ملکه ذهنت بشه.";
  } else if (lowerMessage.includes("تجارت") || lowerMessage.includes("حقوق تجارت")) {
    return "سلام دوست من! حقوق تجارت درس نسبتاً گسترده‌ای هست که مباحث اسناد تجاری (برات، سفته، چک) و ورشکستگی پرچالش‌ترین بخش‌های اون رو تشکیل میدن. پیشنهاد مشورتی من اینه که هر شب به مدت ۲۰ دقیقه فقط تست‌های سال‌های قبل بخش اسناد تجاری را از کتاب کار ساده‌ساز چتر دانش تحلیل کنی و نکاتش رو حاشیه‌نویسی کنی.";
  } else if (lowerMessage.includes("جزا") || lowerMessage.includes("کیفری") || lowerMessage.includes("فقه")) {
    return "سلام حقوق‌دان پرانرژی! دروسی مانند حقوق جزا و آیین دادرسی کیفری درصد به درصد ترازساز هستند. در اصول فقه و متون فقه نیز درک اصول لفظیه و تعارض ادله کلید اصلی است. از کتاب فقه نموداری چتر دانش استفاده کن تا الگوهای سخت عربی ساده‌تر تفهیم بشن.";
  } else if (lowerMessage.includes("سنگین") || lowerMessage.includes("خسته") || lowerMessage.includes("انگیزه")) {
    return "کاملاً حِسِت رو درک می‌کنم جانم. سال آزمون وکالت با این حجم سنگین قوانین و آراء وحدت رویه فراز و نشیب زیادی داره. این روزها دقیقاً همون جاهایی هستش که تفاوت رتبه‌های برتر وکالت کانون مشخص میشه. تکنیک پومودورو رو پیاده کن (۲۵ دقیقه مطالعه قوانین خاص، ۵ دقیقه استراحت).";
  } else {
    return "چه سوال خوبی مطرح کردی! برای اینکه دقیق بتونم راهنمایی‌ت کنم، برام بنویس روزی چند ساعت مطالعه داری و درصد حدودی‌ت در آزمون‌های آزمایشی چتر دانش چند بوده؟ به عنوان مشاور اختصاصی‌ت توی سامانه هوشمند چتر دانش، در کنارت هستم تا قدم‌به‌قدم برطرفش کنیم.";
  }
}

function getOfflineGoalInsight(student: any, currentTraz: any, currentPercentage: any, targetTraz: any, targetGrowth: any, latestQuizScore: any) {
  const trazDiff = (targetTraz || 6200) - (currentTraz || 5575);
  let baseLikelihood = 80;
  if (trazDiff > 0) {
    baseLikelihood -= Math.min(60, Math.round(trazDiff / 10));
  }
  
  const targetPercentage = (currentPercentage || 59) + (targetGrowth || 10);
  const quizDiff = (latestQuizScore || 63) - targetPercentage;
  baseLikelihood += Math.min(20, Math.max(-30, Math.round(quizDiff * 1.5)));
  
  const likelihood = Math.min(95, Math.max(10, baseLikelihood));
  
  let text = "";
  let recommendations = [];

  if (likelihood >= 80) {
    text = `سیگنال‌های مثبت و بسیار درخشانی در روند فرآیند درسی شما دیده می‌شود! برآورد درصد آزمون تستی اخیر شما (${latestQuizScore}٪) رشد عالی به نسبت کارنامه پایه (${currentPercentage}٪) در آزمون وکالت چتر دانش را حکایت می‌کند. دستیابی به تراز هدف ${targetTraz || 6200} بسیار در دسترس است، به شرط آنکه استمرار و خونسردی مطالعاتی و تسلط بر نص قوانین را که اکنون بر قله ۱۴ روز متوالی ایستاده حفظ کنید.`;
    recommendations = [
      "تمرکز بر ارتقای سرعت پاسخ‌دهی در آیین دادرسی مدنی و کیفری با تست‌های زمان‌دار ۱۵ تایی.",
      "تثبیت مبحث عقود معین در حقوق مدنی با تمرکز بر تعهدات و تضامنات بر اساس درسنامه چتر دانش.",
      "مرور منظم آرای وحدت رویه جدید در کنار تطبیق مواد مبهم قانون مجازات اسلامی."
    ];
  } else if (likelihood >= 50) {
    text = `مسیر مهارتی شما هموار است اما برای قبولی قطعی در کانون وکلا و تصاحب تراز ${targetTraz || 6200} نیاز به یک گام افزایش شدت تست تحلیلی و ثبت اشتباهات کارنامه حس می‌شود. تراز هدف شما تفاوت محسوسی با تراز فعلی (${currentTraz || 5575}) دارد. رشد مطلوب نمره کوییز نهایی شما (${latestQuizScore}٪) گواه پیشرفت است، هرچند برای تثبیت ترازهای بالا نیازمند بهبود دقت پاسخ‌دهی در دروس حقوق ثبت و حقوق تجارت هستید.`;
    recommendations = [
      "رفع نقص‌های موضوعی در مبحث ورشکستگی و اسناد تجاری با کمک کارگاه تستی چتر دانش.",
      "ایجاد شبیه‌سازی مینی‌آزمون‌های زمان‌دار در منزل هفته‌ای دو مرتبه.",
      "کاهش پاسخ‌های نسنجیده و استفاده از اصول حذف گزینه‌های انحرافی حقوقی."
    ];
  } else {
    text = `شوق و اراده شما برای ارتقا به تراز ${targetTraz || 6200} فوق‌العاده ارزشمند است، اما بیایید واقع‌بین باشیم؛ عبور از مرز تراز هدف فعلی نیازمند تغییر جدی در شیوه یادگیری قوانین و فرآیندهاست. درصد آخرین آزمون ثبت شده شما (${latestQuizScore}٪) با درصد آرمانی شما (${targetPercentage}٪) فاصله دارد. مشاور شما پیشنهاد می‌کند ابتدا یک ایستگاه میانی روی تراز ۵۹۰۰ بسازیم تا با قبولی در آزمون‌های تستی گام دوم را محکم‌تر بردارید.`;
    recommendations = [
      "کاهش حجم مباحث متفرقه و تمرکز بر نص قوانین خاص پرسوال ترازساز آزمون وکالت.",
      "بازخوانی جدی مواد قانون مدنی و رسم نمودار درختی روابط اشخاص و اموال.",
      "افزایش جلسات صحبت دوطرفه حضوری یا آنلاین با مشاور ارشد چتر دانش (آقای رادان)."
    ];
  }

  return { likelihood, text, recommendations };
}

function getOfflineExamAnalysis(lessons: any[], field: string) {
  const analyzedWeaknesses = [];
  const subjects = lessons || [];

  // Subjects sorted ascending by percentage to isolate weaknesses
  const weakSubjects = [...subjects].sort((a: any, b: any) => a.percentage - b.percentage).slice(0, 3);

  for (const sub of weakSubjects) {
    let topic = "";
    let rec = "";
    let questions = 40;
    let severity: "critical" | "warning" | "mild" = "warning";

    if (sub.lessonName.includes("مدنی")) {
      topic = "عقود معین و قواعد عمومی تعهدات";
      rec = "جزوه حقوق مدنی چتر دانش فصل مربوط به ایقاعات و عقود؛ حل ۵۰ تست کارگاه تستی.";
      questions = 50;
      severity = sub.percentage < 35 ? "critical" : "warning";
    } else if (sub.lessonName.includes("دادرسی")) {
      topic = "صلاحیت مراجع قضایی و مواعد قانونی";
      rec = "بررسی نمودارهای مواعد آیین دادرسی مدنی و کیفری چتر دانش؛ حل و تحلیل ۲۰ تست موضوعی آزمون‌های سنوات قبل.";
      questions = 65;
      severity = sub.percentage < 35 ? "critical" : "warning";
    } else if (sub.lessonName.includes("تجارت")) {
      topic = "اسناد تجاری و ورشکستگی";
      rec = "تطبیق مواد قانون تجارت مرتبط با چک نوظهور و قواعد عام مسئولیت تضامنی ظهرنویسان.";
      questions = 45;
      severity = "warning";
    } else if (sub.lessonName.includes("جزا") || sub.lessonName.includes("کیفری")) {
      topic = "جرایم علیه اموال و مجازات‌ها";
      rec = "تحلیل تفاوت‌های کلاهبرداری، سرقت و خیانت در امانت همراه با حدود و تعزیرات اسلامی قانون مجازات.";
      questions = 55;
      severity = sub.percentage < 45 ? "critical" : "warning";
    } else {
      topic = "قوانین خاص و آرای وحدت رویه";
      rec = "حل ۲۵ تست تالیفی چتر دانش و تحلیل اشتباهات آزمون قبلی.";
      questions = 30;
      severity = "mild";
    }

    analyzedWeaknesses.push({
      topic,
      subject: sub.lessonName,
      percentage: sub.percentage,
      recommendation: rec,
      questionsCount: questions,
      severity
    });
  }

  const nextTraz = Math.min(8000, Math.max(4000, Math.floor(
    (subjects.reduce((acc: number, cur: any) => acc + cur.percentage, 0) / (subjects.length || 1)) * 50 + 3200
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
    simulatedTechnicalDetail = "به دلیل ثبت کلاسترهای پی‌درپی اشتباه تحت فشار زمان ثانیه‌شمار و افزایش میانگین زمان معطلی روی گزینه‌های غلط، میزان استرس آزمونی سطح بالایی است.";
  } else if (simulatedStressLevel > 45) {
    simulatedStressLabel = "متوسط";
    simulatedTechnicalDetail = "نوسان زمانی مشهود بین دروس اختصاصی و معطلی طولانی روی سوالاتِ دارای شک زیاد حقوقی که منجر به ثبت نرخ توقف بالایی در سوالات غلط شده است.";
  } else {
    simulatedStressLabel = "سالم";
    simulatedTechnicalDetail = "مدیریت بهینه زمان با اختلاف متعادل و منطقی زمان پاسخ‌دهی تست‌های درست و نادرست؛ بدون استرس کاذب یا پاسخ‌های بی‌هدف حقوقی.";
  }

  return {
    weaknesses: analyzedWeaknesses,
    psychological: {
      pattern: simulatedStressLevel > 60 ? "تردید قضایی بین دو گزینه همراه با خستگی زمانی منتهی به خطا" : "تمرکز نوسانی در تست‌های سنگین حقوقی",
      description: `داوطلب با توان علمی عالی اما تحت فشار زمان به دام تله‌های گزینه‌ای حقوقی آزمون وکالت افتاده که استرس معادل ${simulatedStressLevel}٪ بر سرعت تحلیل قضایی او تاثیر منفی مستقیم دارد.`,
      correctToWrongRate: Math.max(12, Math.round(wrongRatio * 100)),
      suggestion: simulatedStressLevel > 60 
        ? "تکنیک مهار زمان چتر دانش (حل تست‌های ساده هر مبحث ابتدا) را به کار بگیرید تا استرس مواجهه با سوالات طویل برطرف شود." 
        : "استمرار پومودورو همراه با شبیه‌سازی دفترچه‌های زمان‌دار چتر دانش در منزل به صورت متوالی جهت مهار استرس زمان.",
      cardColor: simulatedStressLevel > 70 ? "red" : simulatedStressLevel > 45 ? "orange" : "blue",
      stressLevel: simulatedStressLevel,
      stressAnalysis: {
        avgResponseTimeWrong: Math.round(55 + wrongRatio * 40),
        avgResponseTimeCorrect: Math.round(40 + (1 - wrongRatio) * 10),
        consecutiveErrorsCount: Math.min(10, Math.floor(wrongRatio * 15 + 1)),
        stressLabel: simulatedStressLabel,
        technicalDetail: simulatedTechnicalDetail
      }
    },
    remedialPlan: [
      { day: "شنبه", morningPlan: `${weakSubjects[0]?.lessonName || "حقوق مدنی"} - مطالعه مفهومی مواد قانونی و نظریات مشورتی`, afternoonPlan: "حل ۱۵ تست آموزشی بدون زمان", totalQuestions: 15 },
      { day: "یکشنبه", morningPlan: `${weakSubjects[1]?.lessonName || "قوانین دادرسی"} - رفع اشکال از درسنامه چتر دانش`, afternoonPlan: "حل ۲۰ تست زمان‌دار کیفری/مدنی", totalQuestions: 20 },
      { day: "دوشنبه", morningPlan: "مرور آرا وحدت رویه جدید و حقوق تجارت", afternoonPlan: "آزمون مبحثی جامع از نقاط ضعف", totalQuestions: 30 },
      { day: "سه‌شنبه", morningPlan: `${weakSubjects[0]?.lessonName || "حقوق مدنی"} - تحلیل تست‌های کارگاهی گذشته`, afternoonPlan: "خلاصه‌نویسی موضوعی مواعد", totalQuestions: 25 },
      { day: "چهارشنبه", morningPlan: `${weakSubjects[1]?.lessonName || "قوانین دادرسی"} - تست‌های تالیفی جدید چتر دانش`, afternoonPlan: "آزمون شبیه‌ساز زمان‌دار کلاودی", totalQuestions: 35 },
      { day: "پنجشنبه", morningPlan: "مرور کلی خلاصه‌نویسی‌ها و تحلیل مجدد تست‌های نادرست قدیمی", afternoonPlan: "استراحت فکری و خودگویی مثبت روانشناسی", totalQuestions: 10 },
      { day: "جمعه", morningPlan: "حضور در آزمون مرحله‌ای چتر دانش", afternoonPlan: "تحلیل موشکافانه کارنامه با مشاور تحصیلی", totalQuestions: 40 }
    ],
    estimatedNextTraz: nextTraz + 150
  };
}

// Endpoint for motivational messages
app.get("/api/motivational", async (req, res) => {
  const quotes = [
    "سودای بزرگی در سر داری و مسیر وکالت پر از فراز و نشیب است. امروز با هر قدم کوچکت به ردای مقدس وکالت نزدیک‌تر می‌شوی. محکم ادامه بده!",
    "موفقیت به معنای حفظ بی‌نقص کل قوانین نیست؛ بلکه استمرار در فهم حقوقی است. امروز بهترین نسخه تلاش خود را به نمایش بگذار همکار آینده!",
    "هر تست و تحلیل کارنامه آزمون آزمایشی چتر دانش، چراغی روبه‌جلوست. تلاش امروز تو، ترازِ درخشان فرداست. پر انرژی و پرتوان باش!",
    "یادت نره سختی‌های حقوق مدنی و آیین دادرسی، تورو وکیل قوی‌تری میکنه. تو توانایی قبولی در این آزمون سخت کانون را داری. شروع کن!",
    "آرام آرام، اما با استواری حقوقی پیش برو. عدالت حاصل ایستادگی مجدانه شماست. همین امروز یک آجر دیگه روی کاخ علمی اهدافت بذار."
  ];

  try {
    const ai = getAI();
    if (!ai || !ai.models || typeof ai.models.generateContent !== "function") {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      return res.json({ quote: quotes[randomIndex] });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "یک پیام انگیزشی صمیمی، دلسوزانه و الهام‌بخش کوتاه (حداکثر دو جمله کوتاه) به زبان فارسی برای داوطلب سخت‌کوشی که برای آزمون وکالت کانون وکلای دادگستری یا مرکز وکلا درس می‌خواند بدون هیچ نماد اضافه یا توضیح دیگر بنویس.",
    });
    return res.json({ quote: response.text?.trim() || quotes[Math.floor(Math.random() * quotes.length)] });
  } catch (error: any) {
    console.warn("Error generating motivational quote with Gemini:", error);
    const randomIndex = Math.floor(Math.random() * quotes.length);
    res.json({ quote: quotes[randomIndex] });
  }
});

// Endpoint for academic coaching messages
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  try {
    const ai = getAI();
    if (!ai || !ai.models || typeof ai.models.generateContent !== "function") {
      return res.json({ reply: getOfflineChatReply(message) });
    }

    // Map history elements into Gemini parts format
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

    formattedHistory.unshift({
      role: "user",
      parts: [{ text: "سیستم مشخصات: شما رتبه برتر و مشاور ارشد تحصیلی و تحلیل‌گر آزمون‌های تخصصی موسسه آموزش عالی حقوقی 'چتر دانش' هستید. نام شما 'دکتر کریمی' است. به زبان فارسی شیوا، صمیمی، دلسوزانه و فوق‌العاده کاربردی پاسخ دهید. داوطلبان به شما اعتماد بالایی دارند؛ بنابراین راهکارهای تکنیکی، تطبیق مواد قانونی، تحلیل آرای وحدت رویه، معرفی کتاب‌های قوانین نموداری چتر دانش و انگیزه دادن جزو وظایف شماست. پاسخ‌ها خلاصه (زیر ۳ پاراگراف) باشند." }]
    });

    formattedHistory.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedHistory,
    });

    return res.json({ reply: response.text?.trim() || getOfflineChatReply(message) });
  } catch (error: any) {
    console.warn("Error in AI counselor chat with Gemini:", error);
    res.json({ reply: getOfflineChatReply(message) });
  }
});

// Endpoint to estimate goal likelihood and provide AI suggestions
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
    const fieldMap: Record<string, string> = {
      bar_exam: "آزمون وکالت کانون وکلای دادگستری (اسکودا)",
      judiciary: "آزمون تصدی منصب قضا (قضاوت)",
      notary: "آزمون سردفتری اسناد رسمی",
      master_of_laws: "کنکور کارشناسی ارشد حقوق",
      math: "رشته ریاضی",
      experimental: "رشته تجربی",
      humanities: "رشته علوم انسانی"
    };
    const fieldName = fieldMap[student?.field] || "آزمون وکالت";
    const targetPercentage = (currentPercentage || 59) + (targetGrowth || 10);

    const ai = getAI();
    if (!ai || !ai.models || typeof ai.models.generateContent !== "function") {
      return res.json(getOfflineGoalInsight(student, currentTraz, currentPercentage, targetTraz, targetGrowth, latestQuizScore));
    }

    const prompt = `شما یک هوش مصنوعی تحلیل‌گر و مشاور هوشمند آزمون‌های وکالت و حقوقی در موسسه آموزش عالی حقوقی "چتر دانش" هستید.
اطلاعات هدف‌گذاری و روند تحصیلی داوطلب به شرح زیر است:
- نام و هدف داوطلب: ${student?.name || "داوطلب"} - آماده‌سازی برای ${fieldName}
- تراز آزمون قبلی چتر دانش: ${currentTraz || 5575}
- تراز هدف آزمون پیش‌رو چتر دانش: ${targetTraz || 6200}
- میانگین درصد در کارنامه اصلی: ${currentPercentage || 59}٪
- درصد هدف نهایی تعیین شده: ${targetPercentage}٪ (شامل درصد فعلی به علاوه رشد هدف ${targetGrowth || 10}٪)
- آخرین نمره کوییز فرعی تستی داوطلب: ${latestQuizScore || 63}٪
- میزان پیوستگی و استمرار فعلی: ۱۴ روز متوالی مطالعه قانون

یک پیش‌بینی و برآورد هوشمندانه، صمیمی، دلسوزانه و به شدت تکنیکی به زبان فارسی روان درباره "احتمال و شانس واقعی رسیدن به تراز هدف آزمون وکالت چتر دانش" بنویسید. تحلیل باید بر اساس تفاوت تراز جاری و هدف، و همچنین کیفیت درصد کوییز اخیر باشد.

پاسخ را دقیقاً در قالب فرمت JSON زیر بدون تگ‌های خارجی تحویل دهید:
{
  "likelihood": 72, // یک عدد صحیح بین ۱۰ تا ۹۸ نشان‌دهنده درصد شانس رسیدن به هدف
  "text": "تحلیل صمیمی و روانشناسی و فنی مشاور شامل نقاط قوت و راهنما در ۳ الی ۴ جمله فارسی ترغیب‌کننده و واقع‌بینانه",
  "recommendations": [
    "توصیه عملیاتی ۱ به فارسی روان درباره چگونگی ارتقای شانس موفقیت حقوقی",
    "توصیه عملیاتی ۲ به فارسی روان برای رفع اشکال آزمون‌های آزمایشی چتر دانش",
    "توصیه عملیاتی ۳ به فارسی روان درباره انگیزه و روانشناسی غلبه بر ترس قوانین"
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
              description: "The calculated percentage chance of hitting the student's exam goals, integer 10 to 98."
            },
            text: {
              type: Type.STRING,
              description: "Warm, motivational and technical advisor evaluation paragraph in Persian."
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
    console.warn("Error generating goal insights with Gemini (Using offline fallback due to rate-limiting/429):", error);
    return res.json(getOfflineGoalInsight(student, currentTraz, currentPercentage, targetTraz, targetGrowth, latestQuizScore));
  }
});

// Endpoint for intelligent report card analysis
app.post("/api/analyze-exam", async (req, res) => {
  const { lessons, field } = req.body;
  
  try {
    const ai = getAI();
    if (!ai || !ai.models || typeof ai.models.generateContent !== "function") {
      return res.json(getOfflineExamAnalysis(lessons, field));
    }

    const prompt = `یک کارنامه تحصیلی داوطلب آزمون‌های حقوقی چتر دانش با کد رهگیری دریافت شده است که درصدهای او در دروس حقوقی به شرح زیر است:
${JSON.stringify(lessons, null, 2)}

لطفا یک تحلیل هوشمند، تخصصی و واقع‌بینانه حقوقی به فرمت JSON دقیقا با ساختار زیر تهیه کنید. صمیمی و بر مبنای حاکمیت تله‌های حقوقی آزمون وکالت بنویسید و بخش‌ها کاملا فارسی عمیق باشند:
{
  "weaknesses": [
    {
      "topic": "نام زیر مبحث بحرانی حقوقی خاص (مثلاً عقود غیرمعوض یا طرق فوق العاده اعتراض به آرا یا ورشکستگی به تقلب)",
      "subject": "نام درس اصلی مربوطه مثلا حقوق مدنی یا آیین دادرسی مدنی",
      "percentage": 30, // درصد داوطلب
      "recommendation": "پیشنهاد رفع اشکال تستی با ارجاع به کتب قوانین نموداری و تست چتر دانش",
      "questionsCount": تعداد تست پیشنهادی برای هفته جاری، عدد بین ۳۰ تا ۷۰,
      "severity": "critical" یا "warning" یا "mild"
    }
  ],
  "psychological": {
    "pattern": "نام الگوی روانی مثلا تردید قضایی بین دو گزینه یا توقف سنگین در تست‌های طولانی مدنی یا تغییر پاسخ درست حقوقی به غلط",
    "description": "تحلیل روانشناسی رفتار آزمون دادن او در ۲ جمله صمیمانه و حقوقی",
    "correctToWrongRate": درصد میانگین خطای تصادفی وی مثلا ۴۲,
    "suggestion": "پیشنهاد عملیاتی روانشناختی برای غلبه بر تله‌های آزمون وکالت کانون",
    "cardColor": "red" یا "orange" || "amber" یا "blue",
    "stressLevel": عدد بین ۰ تا ۱۰۰ نشان دهنده میزان استرس روانی داوطلب بر اساس درصدهای بالا و الگوهای خطا و زمان توقف فرضی در تست‌ها,
    "stressAnalysis": {
      "avgResponseTimeWrong": متوسط زمان سپری شده برای تست‌های حقوقی غلط به ثانیه، عددی بین ۵۰ تا ۹۰ ثانیه بر اساس سطح تردید در قوانین,
      "avgResponseTimeCorrect": متوسط زمان سپری شده برای تست‌های درست به ثانیه، عددی بین ۳۰ تا ۶۰ ثانیه,
      "consecutiveErrorsCount": تخمین تعداد غلط‌های متوالی ناشی از به تله افتادن، عددی بین ۱ تا ۱۰,
      "stressLabel": "بحرانی" یا "متوسط" یا "خفیف" یا "سالم",
      "technicalDetail": "توضیح کوتاه فنی ۲ جمله‌ای به زبان فارسی درباره چگونگی تاثیر فشارهای زمانی و گمراه‌کننده‌های مسئله حقوقی بر میزان استرس و تردید"
    }
  },
  "remedialPlan": [
    {
      "day": "نام روز مثلا شنبه تا جمعه",
      "morningPlan": "برنامه مطالعه و رفع اشکال تستی صبح - مرور مواد قانون خاص",
      "afternoonPlan": "برنامه تست و تمرین عصر - حل تست‌های کارگاهی چتر دانش",
      "totalQuestions": تعداد کل تست پیشنهادی آن روز، مثلا ۳۵
    }
  ],
  "estimatedNextTraz": تراز تخمینی بعدی که عددی بین ۴۰۰۰ تا ۸۵۰۰ باشد بر اساس نمرات فعلی که اگر درصدها بهبود یابد رشد کند
}

فقط کدهای خام JSON را بدون عبارت markdown مانند \`\`\`json برگردان.`;

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
    console.warn("Error analyzing exam with Gemini (Using offline fallback due to rate-limiting/429):", error);
    return res.json(getOfflineExamAnalysis(lessons, field));
  }
});

// Offline Custom Exam Generator Fallback
function getOfflineCustomExam(subjectName: string, percentage: number) {
  let topic = "حقوق مدنی";
  let justification = "";
  let psychologicalAnalysis = "";
  let questions: any[] = [];

  const subj = (subjectName || "حقوق مدنی").toString();

  if (subj.includes("دادرسی")) {
    topic = "آیین دادرسی مدنی";
    justification = `با توجه به نمره قبلی شما (${percentage}٪) در درس آیین دادرسی مدنی، اولویت شما باید بر روی مباحث فنی و شکلی قانون به خصوص «صلاحیت مراجع» و «راهکارهای اعتراض به آرا» باشد. این مباحث پایه ساختار آزمون وکالت را تشکیل داده و بیشترین تله‌های شکلی کانون وکلا در این بخش قرار دارند.`;
    psychologicalAnalysis = "تحلیل روان‌شناختی شما نشان می‌دهد که از تعجیل شکلی رنج می‌برید؛ یعنی در مواجهه با زمان، فرآیندهای دادرسی را با فرآیندهای کیفری ادغام می‌کنید. پیشنهاد می‌شود ابتدا آرامش خود را حفظ کرده و سپس مواعد را طبق نمودار چتر دانش بررسی کنید تا در گزینه‌ها غافلگیر نشوید.";
    questions = [
      {
        id: "ai_d_1",
        topic: "آیین دادرسی مدنی (صلاحیت مراجع)",
        questionText: "شورای حل اختلاف در کدام یک از دعاوی زیر صلاحیت ذاتی برای رسیدگی و صدور رای ماهوی دارد؟",
        options: [
          "دعوای تخلیه عین مستاجره به خواسته مطالبه حق سرقفلی",
          "دعوای تخلیه اماکن مسکونی بدون ادعای حق کسب و پیشه یا سرقفلی",
          "دعوای مفروز کردن ملک مشاعی که جریان ثبتی آن خاتمه یافته باشد",
          "دعوای اثبات زوجیت و رجوع از هبه خانوادگی"
        ],
        correctOptionIndex: 1,
        explanation: "مستند به ماده ۹ قانون شوراهای حل اختلاف، رسیدگی به تمامی دعاوی تخلیه اماکن مسکونی (به استثنای اماکن تجاری که مدعی سرقفلی یا حق کسب و پیشه باشند) در صلاحیت ذاتی شورای حل اختلاف است. گزینه یک به دلیل وجود ادعای سرقفلی خارج از صلاحیت شورا می‌باشد."
      },
      {
        id: "ai_d_2",
        topic: "آیین دادرسی مدنی (مهلت تجدیدنظرخواهی)",
        questionText: "هرگاه دادخواست اعتراض تجدیدنظر خارج از فرجه قانونی تقدیم شود، کدام تصمیم قانونی صادر خواهد شد؟",
        options: [
          "قرار ابطال دادخواست از سوی دادگاه تجدیدنظر استان",
          "قرار رد دادخواست از سوی دادگاه صادرکننده رای نخستین",
          "قرار سقوط دعوا به علت اعتبار امر مختومه توسط دادرس بدوی",
          "حکم بطلان دعوای بدوی توسط قاضی تجدیدنظر"
        ],
        correctOptionIndex: 1,
        explanation: "طبق ماده ۳۸۳ قانون آیین دادرسی مدنی، دادخواست تجدیدنظر باید در مهلت مقرر قانونی تقدیم شود؛ در غیر این صورت، قرار رد دادخواست از سوی دادگاه صادرکننده رای نخستین صادر می‌شود که این قرار نیز قابل اعتراض در مرجع تجدیدنظر استان است."
      }
    ];
  } else if (subj.includes("تجارت")) {
    topic = "حقوق تجارت";
    justification = `با پیش‌زمینه تراز قبلی (${percentage}٪) در حقوق تجارت، تمرکز در این آزمون بر مبحث پیچیده «اسناد تجاری و مسئولیت ظهرنویسان» و «ورشکستگی تاجر» قرار داده شد زیرا این مباحث به دلیل داشتن قوانین خاص و آراء وحدت رویه فراوان، ترازسازترین مباحث آزمون هستند.`;
    psychologicalAnalysis = "بررسی‌ها گویای این است که در مواجهه با قوانین تجاری دچار اضطراب مفرط ناشی از تضامن هستید. تفکیک ظهرنویس از ضامن با فرمول‌های نموداری چتر دانش می‌تواند این اضطراب تحلیلی را فرو بنشاند و از تغییر مشکوک تصمیم ممانعت نماید.";
    questions = [
      {
        id: "ai_t_1",
        topic: "حقوق تجارت (مسئولیت ظهرنویسان)",
        questionText: "اگر ظهرنویس سفته با درج قید شرط عدم مسئولیت تضامنی اقدام به انتقال سند کند، وضعیت دارنده چگونه خواهد بود؟",
        options: [
          "این شرط باطل و مبطل سفته است و دارنده حق پیگیری ندارد.",
          "شرط باطل است ولی سفته صحیح است و ظهرنویس تضامناً مسئول است.",
          "شرط صحیح است و ظهرنویس مزبور از مسئولیت پرداخت در پرداخت اصلی و تضامنی مبرا می‌شود.",
          "ظهرنویس صرفاً در قبال صادرکننده اول مسئولیت عهده‌دار است."
        ],
        correctOptionIndex: 2,
        explanation: "در حقوق تجارت ایران، ظهرنویس می‌تواند مسئولیت تضامنی خود را با شرط صریح ساقط کند. این آزادی اراده در ظهرنویسی معتبر است و شرط نافذ خواهد بود، هرچند صادرکننده اصلی هرگز نمی‌تواند خود را از مسئولیت تضامنی و انفرادی مبرا سازد."
      },
      {
        id: "ai_t_2",
        topic: "حقوق تجارت (ورشکستگی تاجر)",
        questionText: "معاملات تاجر ورشکسته پس از تاریخ توقف و قبل از صدور حکم ورشکستگی (دوره مشکوک) چه وضعیتی دارد؟",
        options: [
          "کلیه معاملات تاجر در این دوره مطلقاً باطل و بلااثر است.",
          "تنها معاملات بدون عوض و صلح محاباتی در این دوره قابل فسخ یا باطل است.",
          "معاملات مزبور کاملا صحیح است و تا زمان صدور حکم ورشکستگی نافذ می‌باشد.",
          "معاملات تاجر به صورت غیرنافذ بوده و ورثه حق ابطال آن را خواهند داشت."
        ],
        correctOptionIndex: 1,
        explanation: "مستند به ماده ۴۲۳ قانون تجارت، برخی معاملات تاجر که بعد از توقف صورت گرفته باشد (نظیر صلح محاباتی، هبه، رهن مال برای بدهی) باطل است، اما سایر معاملات معوض وی نافذ خواهد بود مگر اینکه اثبات شود به قصد اضرار به دیان بوده است."
      }
    ];
  } else if (subj.includes("اصول") || subj.includes("فقه")) {
    topic = "اصول فقه";
    justification = `بررسی تراز شما (${percentage}٪) در اصول فقه نشان می‌دهد که شما در بخش قواعد لفظ و تعارض ادله نیاز به تمرین بیشتر دارید. این آزمون با سوالاتی فنی از دلالت‌ها طراحی گردید تا چالش‌های شما را در تفکیک مفهوم از منطوق آشکار کند.`;
    psychologicalAnalysis = "ذهن شما بسیار فرمول‌محور است اما در فقه دلالت‌ها، به دام پیچیدگی موازین لفظی عربی می‌افتید. روانشناسان ما توصیه می‌کنند اصول را به چشم علم منطق تماشا کنید تا ترس دلالتی شما محو شده و تسلط قضایی بهتری یابید.";
    questions = [
      {
        id: "ai_o_1",
        topic: "اصول فقه (مفهوم مخالف)",
        questionText: "کدام یک از شرایط زیر برای ایجاد و حجیت 'مفهوم مخالف' در قضیه شرطیه ضروری و واجب است؟",
        options: [
          "وجود انحصار علیت در شرط به گونه‌ای که شرط، علت منحصره جزای مذکور باشد.",
          "حضور عموم لفظی در تمام موضوعات فرعی جمله بدوی.",
          "عدم مخالفت حکم با نص صریح کتاب و سنت نبوی.",
          "تصریح متکلم به لزوم ابطال جزا در فرض نبودن قید اصلی."
        ],
        correctOptionIndex: 0,
        explanation: "مفهوم شرط زمانی معتبر و حجت است که احراز شود شرط مذکور، علت منحصره برای تحقق جزا است. در غیر این صورت، با انتفای آن شرط، جزا منتفی نشده بلکه با علل دیگر نیز قابل تحقق خواهد بود."
      },
      {
        id: "ai_o_2",
        topic: "اصول فقه (منطوق و مفهوم)",
        questionText: "اگر قانون‌گذار در قانونی ذکر کند که «مالکیت آپارتمان‌ها منوط به ثبت رسمی است»، این دلالت را چه می‌نامند؟",
        options: [
          "منطوق صریح عبارتی",
          "مفهوم موافق اولویت",
          "منطوق غیرصریح دلالت اقتضا",
          "مفهوم مخالف حصر و شرط"
        ],
        correctOptionIndex: 0,
        explanation: "منطوق صریح دلالتی است که حکم ذکر شده مستقیماً از لفظ شنیده می‌شود و نیازي به استدلال ثانویه یا تقدیر کلام ندارد. در اینجا مالکیت در لفظ مستقیماً منوط شده است."
      }
    ];
  } else {
    // default/حقوق مدنی
    topic = "حقوق مدنی";
    justification = `با تراز (${percentage}٪) در حقوق مدنی، این آزمون متمرکز بر مباحث سنگین وکالتی مانند «حق شفعه»، «خیارات عقد بیع» و «عقود جایز و اذنی» طراحی شد تا نقاط ضعف شما در کلاسترهای مفهومی قانون مدنی را به طور کامل پوشش دهد.`;
    psychologicalAnalysis = "تحلیل روانشناختی نشان می‌دهد شما از الگوی «تردید دیرهنگام» رنج می‌برید؛ یعنی در آخرین لحظات گزینه درست را به غلط تغییر می‌دهید. تمرین بر روی این آزمون و تکیه بر تصمیمات حقوقی اولیه، این مشکل روانی را برطرف می‌کند تا با خونسردی تست بزنید.";
    questions = [
      {
        id: "ai_m_1",
        topic: "حقوق مدنی (وکالت بلاعزل)",
        questionText: "هرگاه در ضمن یک عقد بیع لازم، خریدار به فروشنده شرط وکالت بلاعزل برای انتقال سهم مشاع بدهد، فوت خریدار چه اثری دارد؟",
        options: [
          "وکالت همچنان پابرجا و نافذ است زیرا به صورت شرط ضمن عقد لازم است.",
          "وکالت منفسخ می‌شود زیرا ماهیت عقد جایز وکالت با شرط ضمن عقد دگرگون نمی‌شود.",
          "فقط ورثه حق عزل وکیل را خواهند داشت و وکیل حق دخل و تصرف انفرادی ندارد.",
          "عقد بیع کلاً منفسخ و ارزش ثمن به تراضی جدید محول می‌گردد."
        ],
        correctOptionIndex: 1,
        explanation: "طبق ماده ۶۷۸ قانون مدنی، وکالت به هر صورتی که منعقد شده باشد (ولو بلاعزل ضمن عقد لازم) با فوت یا جنون هر یک از طرفین منفسخ می‌گردد. شرط بلاعزل صرفاً مانع اعمال فسخ ارادی در زمان حیات موکل است، نه سدی در برابر انقضای قهری عقد بیع."
      },
      {
        id: "ai_m_2",
        topic: "حقوق مدنی (بیع شرط)",
        questionText: "در عقد بیع شرط، مالکیت خریدار نسبت به مبیع از چه زمانی مستقر و برقرار می‌گردد؟",
        options: [
          "از زمان انقضای مدت خیار و عدم رد ثمن از سوی فروشنده اصلی",
          "از زمان انعقاد عقد به صورت مطلق و بدون هرگونه شرط معلق",
          "منوط به تصفیه کامل دیون خریدار در اداره تسویه و ورشکستگی",
          "از زمان قبض مبیع توسط شخص ثالث مامور ثبتی"
        ],
        correctOptionIndex: 1,
        explanation: "در بیع شرط مالکیت از حین عقد حاصل می‌شود، منتها این مالکیت متزلزل بوده و با رد ثمن توسط فروشنده در مهلت مقرر، منفسخ می‌گردد. بنابراین مالکیت از ابتدا حاصل می‌شود نه از زمان انقضای خیار."
      }
    ];
  }

  return {
    subjectName: topic,
    justification,
    psychologicalAnalysis,
    questions
  };
}

// REST endpoint for AI customized exam generation based on previous results
app.post("/api/generate-ai-exam", async (req, res) => {
  const { subjectName, percentage } = req.body;
  const currentPercentage = percentage !== undefined ? Number(percentage) : 55;

  try {
    const ai = getAI();
    if (!ai || !ai.models || typeof ai.models.generateContent !== "function") {
      return res.json(getOfflineCustomExam(subjectName, currentPercentage));
    }

    const prompt = `شما یک دستیار هوش مصنوعی طراح آزمون‌های برتر بر اساس تکنیک رقابتی و آموزشی موسسه آموزش عالی حقوقی "چتر دانش" هستید.
متقاضی محترم آزمون وکالت در درس «${subjectName}» دارای درصد پیشین ${currentPercentage}٪ بوده است.

یک آزمون سفارشی جدید شخصی‌سازی شده در قالب فرمت JSON طراحی کنید که شامل بخش‌های زیر باشد:
۱. justification: چرایی فنی و آموزشی طراحی این سری از سوالات به فارسی روان، با ارجاع به کارنامه قبلی و بیان ارتباط آن با تله‌های حقوقی کانون وکلا.
۲. psychologicalAnalysis: یک تحلیل روانشناختی، عمیق و انگیزه بخش به زبان فارسی از روحیه و تمرکز داوطلب بر اساس درصد وی در آزمون قبلی با دادن راهکارهای ذهنی غلبه بر ترس زمان.
۳. questions: دقیقاً ۳ عدد تست تالیفی بسیار قوی، واقع‌گرایانه و منطبق بر آراء وحدت رویه و متون قوانین خاص تزارساز، هر سوال دارای ۴ گزینه، مشخص کردن اندیس گزینه درست (0 الی 3) و تشریح مستدلِ کامل تفصیلی (explanation) با اشاره به مواد قانونی ایران.

پاسخ را دقیقاً در قالب فرمت JSON زیر بدون تگ‌های خارجی تحویل دهید:
{
  "subjectName": "${subjectName}",
  "justification": "چرایی آموزشی فنی...",
  "psychologicalAnalysis": "تحلیل روان‌شناختی وضعیت متقاضی...",
  "questions": [
    {
      "id": "ai_gen_q_1",
      "topic": "عنوان مبحث فنی مثل آیین دادرسی مدنی (صلاحیت ذاتی)",
      "questionText": "متن کامل سوال حقوقی تستی...",
      "options": ["گزینه اول", "گزینه دوم", "گزینه سوم", "گزینه چهارم"],
      "correctOptionIndex": 1, 
      "explanation": "تشریح مسبوط، مستند به ماده قانونی..."
    }
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
            subjectName: { type: Type.STRING },
            justification: { type: Type.STRING },
            psychologicalAnalysis: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  questionText: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctOptionIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ["id", "topic", "questionText", "options", "correctOptionIndex", "explanation"]
              }
            }
          },
          required: ["subjectName", "justification", "psychologicalAnalysis", "questions"]
        }
      }
    });

    const textOutput = response.text?.trim() || "{}";
    const cleanedText = textOutput.replace(/```json/gi, "").replace(/```/g, "").trim();
    const resultJson = JSON.parse(cleanedText);
    return res.json(resultJson);

  } catch (error: any) {
    console.warn("Error generating custom exam with Gemini:", error);
    return res.json(getOfflineCustomExam(subjectName, currentPercentage));
  }
});

// Endpoint to generate smart sales scripts and follow-up plans using Gemini
app.post("/api/crm/ai-script", async (req, res) => {
  const { name, phone, field, temp, notes } = req.body;
  try {
    const ai = getAI();
    if (!ai || !ai.models || typeof ai.models.generateContent !== "function") {
      return res.json({
        sms: `سلام ${name} عزیز، همکار آینده حقوقی ما! 🌸\nمشاورین ارشد چتر دانش منتظر شما هستند تا نقشه راه اختصاصی قبولی در آزمون ${field} را تقدیمتان کنند. برای یک گام محکم در راه وکالت آماده‌اید؟ تلفنتان را پاسخگو باشید.\nتلفن دفتر: ۰۲۱-۶۶۱۲۳۴۵۶`,
        callScript: `دیالوگ پیشنهادی تماس تلفنی با ${name}:\nمشاور: سلام وقت بخیر ${name} عزیز، از موسسه چتر دانش همکارتان تماس می‌گیرم.\nمتقاضی: سلام وقت شما هم بخیر.\nمشاور: تبریک می‌گویم پرونده شما به بخش مشاوره ارشد رسیده. بفرمایید برای قبولی در ${field} رنکینگ شما در دروس پایه چطور است؟ آیا در حوزه حقوق تجارت یا متون فقه ابهامی دارید تا با کتاب‌های ساده‌ساز چتر دانش شروع کنیم؟`,
        followUpTip: `پیشنهاد مشاوره پیگیری:\nسطح اشتیاق داوطلب [${temp}] ارزیابی شده است. برای تسهیل ورود فرد جدید، هدیه‌ای از ویدیوهای وبینار جمع‌بندی چتر نجات برایشان پیامک کنید.`
      });
    }

    const prompt = `شما مشاور ارشد فروش تحصیلی و راهنمای ثبت‌نام در موسسه آموزش عالی حقوقی "چتر دانش" هستید.
نام داوطلب: ${name}
گرایش آزمونی: ${field}
سطح اشتیاق و حرارت لید: ${temp}
یادداشت‌های پرونده: ${notes || "ثبت‌نام اولیه در فرم دیجیتال"}

لطفاً یک بسته پیگیری مشورتی و متقاعدسازی ثبت‌نام بسیار اثربخش به زبان فارسی روان شامل موارد زیر بنویسید و به صورت فرمت JSON برای ما بفرستید:
۱. sms: یک متن پیامک صمیمانه، فصیح، جذاب و الهام‌بخش کوتاه (حداکثر ۱۰۰ کلمه) جهت ارسال به داوطلب برای هماهنگی تماس مشاور ارشد. شامل اموجی‌های حقوقی متناسب.
۲. callScript: یک سناریوی مکالمه تلفنی مشاوره تحصیلی و متقاعدسازی کامل (به صورت دیالوگ رفت و برگشتی) برای صحبت مشاور با متقاضی، متناسب با آزمون ${field}. لحن بسیار دلسوزانه و الهام‌بخش باشد.
۳. followUpTip: یک توصیه علمی-روانشناختی درباره چگونگی به سرانجام رساندن این لید با توجه به میزان اشتیاق او (${temp}).

قالب پاسخ دقیقاً با کلیدهای زیر در فرمت JSON باشد:
{
  "sms": "متن پیامک ارسالی",
  "callScript": "سناریوی گپ تلفنی مشاور با داوطلب",
  "followUpTip": "توصیه روانشناسی برای متقاعدسازی ثبت‌نام"
}
پاسخ را بدون تگ‌های کدی مارک‌داون (مانند \`\`\`json) به صورت JSON معتبر خام بفرستید.`;

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
    console.warn("Error in CRM AI generator:", error);
    return res.json({
      sms: `سلام ${name} عزیز، همکار آینده حقوقی ما! 🌸\nمشاورین ارشد چتر دانش منتظر شما هستند تا نقشه راه اختصاصی قبولی در آزمون ${field} را تقدیمتان کنند. برای یک گام محکم در راه وکالت آماده‌اید؟ تلفنتان را پاسخگو باشید.\nتلفن دفتر: ۰۲۱-۶۶۱۲۳۴۵۶`,
      callScript: `دیالوگ پیشنهادی تماس تلفنی با ${name}:\nمشاور: سلام وقت بخیر ${name} عزیز، از موسسه چتر دانش همکارتان تماس می‌گیرم.\nمتقاضی: سلام وقت شما هم بخیر.\nمشاور: تبریک می‌گویم پرونده شما به بخش مشاوره ارشد رسیده. بفرمایید برای قبولی در ${field} رنکینگ شما در دروس پایه چطور است؟ آیا در حوزه حقوق تجارت یا متون فقه ابهامی دارید تا با کتاب‌های ساده‌ساز چتر دانش شروع کنیم؟`,
      followUpTip: `پیشنهاد مشاوره پیگیری:\nسطح اشتیاق داوطلب [${temp}] ارزیابی شده است. برای تسهیل ورود فرد جدید، هدیه‌ای از ویدیوهای وبینار جمع‌بندی چتر نجات برایشان پیامک کنید.`
    });
  }
});

// Endpoint for Legal News and Exam Updates / اخبار و اطلاعیه‌های آزمون تخصصی حقوقی
app.get("/api/legal-news", (req, res) => {
  const articles = [
    {
      id: "1",
      title: "زمان دقیق اعلام نتایج نهایی آزمون سردفتری اسناد رسمی سال گذشته مشخص شد",
      source: "روابط عمومی کانون سردفتران و دفتریاران",
      date: "امروز",
      summary: "بر اساس اطلاعیه سازمان سنجش و کانون سردفتران، نتایج پذیرفته‌شدگان چندبرابر ظرفیت مصاحبه علمی آزمون سردفتری اسناد رسمی تا روز دوشنبه هفته آینده اعلام خواهد شد. داوطلبان چتر دانش جهت دریافت کارنامه می‌توانند به پنل خود مراجعه نمایند.",
      category: "سردفتری",
      readTime: "۳ دقیقه"
    },
    {
      id: "2",
      title: "شرایط تازه ثبت‌نام و تاریخ برگزاری آزمون کارشناسی ارشد حقوق سراسری اعلام شد",
      source: "سازمان ملی سنجش و ارزشیابی",
      date: "دیروز",
      summary: "دفترچه راهنمای ثبت‌نام کارشناسی ارشد حقوق منتشر گردید. ضرایب حقوق مدنی، آیین دادرسی مدنی و حقوق تجارت در گرایش‌های حقوق خصوصی بدون تغییر مانده است. المپیادهای دانشجویی نیز همزمان در اردیبهشت‌ماه سال جاری برگزار خواهند شد.",
      category: "ارشد حقوق",
      readTime: "۴ دقیقه"
    },
    {
      id: "3",
      title: "آغاز ثبت‌نام دوره چتر نجات (آمادگی فوق‌سریع) آزمون وکالت در شعب چتر دانش سراسر کشور",
      source: "آموزش چتر دانش",
      date: "۲ روز پیش",
      summary: "دوره فشرده چتر نجات چتر دانش شامل کپسول تست حقوق کارگاهی، تحلیل بیش از ۲۵۰۰ تست طلایی و جزوات قوانین نموداری از تاریخ ۱۰ خردادماه به صورت همزمان حضوری و آنلاین آغاز گشته و تا روز آزمون کانون ادامه خواهد داشت.",
      category: "چتر دانش",
      readTime: "۵ دقیقه"
    },
    {
      id: "4",
      title: "آخرین وضعیت اصلاحیه قانون تسهیل صدور مجوزها و حد نصاب قبولی آزمون وکالت کانون",
      source: "پایگاه خبری حقوقی اختبار",
      date: "۳ روز پیش",
      summary: "عضو کمیسیون قضایی مجلس از تایید نهایی نحوه محاسبه نمره قبولی بر اساس فرمول تراز آزمون خبر داد. این قانون همچنان رقابت داוطلبان را بر اساس تراز نهایی آزمون چتر دانش پایه‌گذاری می‌کند که نیاز منسجمی به رفع اشکال دارد.",
      category: "قوانین و اخبار",
      readTime: "۶ دقیقه"
    },
    {
      id: "5",
      title: "دفترچه پاسخ تشریحی آزمون آزمایشی مرحله پنجم چتر دانش منتشر شد",
      source: "دپارتمان آزمون چتر دانش",
      date: "۴ روز پیش",
      summary: "پاسخنامه مستدل و تشریحی آزمون آزمایشی وکالت (مرحله پنجم) شامل ارجاعات دقیق به مواد قانون مدنی، جزا و آرای وحدت رویه دیوان عالی کشور بر روی سامانه بارگذاری گردید. هم‌اکنون می‌توانید پکیج را دانلود کنید.",
      category: "آزمون‌ها",
      readTime: "۲ دقیقه"
    }
  ];
  return res.json({ status: "success", articles });
});

// Start express server configuration
async function startServer() {
  // Setup Vite middleware for development if not in production
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
    console.log(`Chatr-e-Danesh smart full-stack law server running on port ${PORT}`);
  });
}

startServer();
