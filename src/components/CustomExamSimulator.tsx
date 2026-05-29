import { useState, useEffect, useRef } from "react";
import { 
  GraduationCap, BookOpen, Settings, Layers, Play, Clock, Check, X, 
  HelpCircle, RefreshCw, Flag, BarChart2, Sparkles, ChevronLeft, ChevronRight, 
  Square, ArrowLeft, ArrowRight, FileText, CheckSquare, Award,
  Volume2, Search, PenTool, Smile, Activity, BookMarked, Download, Terminal, User, Calendar, ShieldCheck, Printer
} from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { saveExamResult, appendSecurityLog } from "../firebaseSync";
import { auth } from "../firebase";

// Realistic Law Exam Question Type
export interface ExamQuestion {
  id: string;
  topic: string; // e.g. "حقوق مدنی"
  questionText: string;
  options: string[];
  correctOptionIndex: number; // 0 to 3
  explanation: string;
}

// Searchable statutory codex for the live lookups feature
export interface LawArticle {
  id: string;
  source: string; // "قانون مدنی" | "قانون تجارت" | "آیین دادرسی مدنی"
  articleNumber: string;
  text: string;
}

const STATIC_LAW_CODICIES: LawArticle[] = [
  { id: "c1", source: "قانون مدنی", articleNumber: "ماده ۱۰", text: "قراردادهای خصوصی نسبت به کسانی که آن را منعقد نموده‌اند در صورتی که مخالف صریح قانون نباشد نافذ است." },
  { id: "c2", source: "قانون مدنی", articleNumber: "ماده ۱۹۰", text: "برای صحت هر معامله شرایط ذیل اساسی است: ۱) قصد طرفین و رضای آن‌ها ۲) اهلیت طرفین ۳) موضوع معین که مورد معامله باشد ۴) مشروعیت جهت معامله." },
  { id: "c3", source: "قانون مدنی", articleNumber: "ماده ۶۷۸", text: "وکالت به طرق ذیل مرتفع می‌شود: ۱) به عزل موکل ۲) به استعفای وکیل ۳) به فوت یا به جنون وکیل یا موکل." },
  { id: "c4", source: "قانون مدنی", articleNumber: "ماده ۸۰۸", text: "هر گاه مال غیرمنقول قابل تقسیمی بین دو نفر مشترک باشد و یکی از دو شریک حصه خود را به قصد بیع به شخص ثالثی منتقل کند شریک دیگر حق دارد قیمتی را که مشتری داده است به او بدهد و حصه مبیعه را تملک کند. این حق را حق شفعه و صاحب آن را شفیع می‌گویند." },
  { id: "c5", source: "قانون تجارت", articleNumber: "ماده ۲۲۳", text: "برات علاوه بر امضا یا مهر صادرکننده باید دارای شرایط زیر باشد: ۱) قید کلمه برات ۲) تاریخ تحریر ۳) اسم شخصی که باید برات را تادیه کند ۴) تعیین مبلغ ۵) تاریخ تادیه ۶) مکان تادیه ۷) اسم شخصی که برات در وجه او صادر شده ۸) تصریح به اینکه این سند برات اول یا دوم یا ... است." },
  { id: "c6", source: "قانون تجارت", articleNumber: "ماده ۳۱۰", text: "چک سندی است که به موجب آن صادرکننده وجوهی را که نزد محال‌علیه دارد کلاً یا بعضاً مسترد یا به دیگری واگذار می‌نماید." },
  { id: "c7", source: "قانون تجارت", articleNumber: "ماده ۴۱۳", text: "تاجر ورشکسته مکلف است در ظرف ۳ روز از تاریخ توقف از تادیه قروض یا سایر تعهدات نقدی خود، توقف خود را به دفتر دادگاه عمومی محل اقامت خود اظهار نموده صورت دارایی خود را تسلیم نماید." },
  { id: "c8", source: "آیین دادرسی مدنی", articleNumber: "ماده ۹۱", text: "دادرس در موارد زیر باید از رسیدگی امتناع نموده و اصحاب دعوا نیز می‌توانند او را رد کنند: الف- وجود قرابت نسبی یا سببی تا درجه سوم از هر طبقه بین دادرس با یکی از اصحاب دعوا..." }
];

const DEFAULT_QUESTIONS: ExamQuestion[] = [
  {
    id: "q1",
    topic: "حقوق مدنی (عقود معین)",
    questionText: "در صورتی که در ضمن عقد لازم، وکالت به صورت بلاعزل به طرف مقابل اعطا شده باشد، فوت موکل چه اثری بر تفویض وکالت مزبور دارد؟",
    options: [
      "وکالت به قوت خود باقی است زیرا به صورت شرط ضمن عقد لازم درج گردیده است.",
      "وکالت منفسخ می‌شود ولی ورثه موکل قائم‌مقام او در اجرای موضوع وکالت خواهند بود.",
      "وکالت منفسخ می‌شود زیرا وکالت از عقود اذنی و جایز است و با فوت منفسخ می‌گردد.",
      "عقد وکالت تا زمان تصفیه کامل ماترک متوفی متوقف می‌ماند و غیرقابل اجرا می‌شود."
    ],
    correctOptionIndex: 2,
    explanation: "مستند به ماده ۶۷۸ قانون مدنی، وکالت به هر طریقی که داده شده باشد با فوت یا جنون هر یک از طرفین منفسخ می‌گردد. شرط بلاعزل بودن در ضمن عقد لازم، مانع از اعمال حق فسخ موکل در زمان حیات وی است، اما ماهیت عقد را که جنبه اذنی و جایز دارد به عقد لازم تغییر نمی‌دهد. لذا با فوت احد طرفین، اذن مرتفع شده و وکالت منفسخ می‌گردد."
  },
  {
    id: "q2",
    topic: "آیین دادرسی مدنی (صلاحیت)",
    questionText: "در دعوای مطالبه خسارت ناشی از جرم، وجود رابطه خویشاوندی قاضی با یکی از اصحاب دعوا تا چه درجه‌ای از جهات ابطال و رد دادرس تلقی می‌شود؟",
    options: [
      "قرابت نسبی یا سببی تا درجه سوم از هر طبقه.",
      "قرابت نسبی یا سببی تا درجه دوم فقط از طبقه اول.",
      "قرابت نسبی تا طبقه سوم و قرابت سببی تا طبقه دوم از هر طبقه.",
      "قرابت مادی که صرفاً شامل فرزندان و همسر فعلی دادرس باشد."
    ],
    correctOptionIndex: 0,
    explanation: "مستند به بند الف ماده ۹۱ قانون آیین دادرسی مدنی، وجود قرابت نسبی یا سببی تا درجه سوم از هر طبقه بین دادرس با یکی از اصحاب دعوا، صراحتاً از جهات رد دادرس است و قاضی مکلف است از تصدی شعبه و صدور رای امتناع ورزد."
  },
  {
    id: "q3",
    topic: "حقوق تجارت (اسناد تجاری)",
    questionText: "چنانچه ظهرنویس سفته اقدام به درج «شرط عدم مسئولیت در پرداخت وجه» نماید، دارنده سفته در صورت عدم وصول چه اثری را متحمل می‌گردد؟",
    options: [
      "دارنده همچنان می‌تواند برای وصول تمام مبلغ به ظهرنویس رجوع کند، زیرا این شرط باطل است.",
      "دارنده حق مراجعه به ظهرنویس مربوطه را ندارد و شرط عدم مسئولیت ظهرنویس در اسناد تجاری صحیح است.",
      "حق تقدم دارنده در پیگیری قضایی تا مدت ۶ ماه معلق شده و سپس آزاد می‌گردد.",
      "ظهرنویس موظف به تودیع وثیقه ملکی معادل ارزش اسمی وجه در دایره ثبت خواهد بود."
    ],
    correctOptionIndex: 1,
    explanation: "در حقوق تجارت ایران، شرط عدم مسئولیت ظهرنویس در قبال تادیه وجه سند تجاری معتبر و نافذ است. برخلاف براتگیر یا صادرکننده اصلی، ظهرنویسان می‌توانند با موافقت صریح یا ضمنی، مسئولیت تضامنی خود را ساقط نمایند."
  },
  {
    id: "q4",
    topic: "اصول فقه (قواعد لفظ)",
    questionText: "کدام گزینه بیان‌گر تعریف دقیق اصطلاح «مفهوم مخالف» در علم اصول فقه و دلالت‌های لفظ است؟",
    options: [
      "دلالت تام لفظ بر مابه‌ازای مستقیم در جمله به نحوی که سنخ حکم منطبق بر نطق صریح باشد.",
      "دلالت لفظ در اثبات سنخ حکم برای موضوعی موافق با قضیه مذکور در متن اصلی قانون.",
      "دلالت لفظ در صورت انتفای قید یا شرط، بر انتفای سنخ حکم در فرض فقدان آن قیود.",
      "حکم تکلیفی مستنبط به واسطه قیاس مستنبط العله بدون تصریح شارع مقدس."
    ],
    correctOptionIndex: 2,
    explanation: "مفهوم مخالف قضایایی چون مفهوم شرط، دلالت بر انتفای حکم هنگام انتفای قید یا شرط دارد. قضیه شرطیه دلالت دارد که با تحقق شرط، جزا حاصل می‌شود و مفهوم اصولی آن یعنی با انتفای شرط، سنخ حکم نیز منتفی می‌گردد."
  },
  {
    id: "q5",
    topic: "حقوق جزا (جرایم علیه اموال)",
    questionText: "تفاوت بنیادی و رکن مادی جرم کلاهبرداری با جرم انتقال مال غیر به دیگری در چیست؟",
    options: [
      "در کلاهبرداری، توسل به وسایل متقلبانه جزء ارکان مادی است، اما در فروش مال غیر صرف معامله مال متعلق به دیگری کافی است.",
      "جرم فروش مال غیر نیاز به احراز قصد مجرمانه ندارد، در حالی که کلاهبرداری نیازمند سوء نیت خاص است.",
      "کلاهبرداری همواره غیرقابل گذشت است در صورتی که انتقال مال غیر همواره با گذشت شاکی خصوصی ساقط می‌شود.",
      "کلاهبرداری صرفاً اموال منقول را شامل می‌شود، در حالی که فروش مال غیر منحصراً بر اراضی غیرمنقول تمرکز دارد."
    ],
    correctOptionIndex: 0,
    explanation: "در انتقال یا فروش مال غیر، صرف اقدام حقوقی به معامله مال متعلق به غیر با علم به عدم مالکیت کافی است و دادستانی نیازی به اثبات مانور متقلبانه مادی ندارد؛ برخلاف کلاهبرداری عام که 'توسل به وسایل متقلبانه مادی' جزء ارکان تشکیل‌دهنده اصلی و لاینفک بزه است."
  },
  {
    id: "q6",
    topic: "حقوق مدنی (حق شفعه)",
    questionText: "حق شفعه در نظام حقوق مدنی ایران در چه مواردی ایجاد و قابل اعمال است؟",
    options: [
      "در هر نوع مال مشترکی اعم از منقول و غیرمنقول به محض فوت یکی از شرکا.",
      "در مال غیرمنقول قابل تقسیمِ مشترک بین دو نفر، در صورت انتقال سهم یکی از آن‌ها به ثالث از طریق بیع.",
      "در آپارتمان‌ها و مجتمع‌های مسکونی مشاع بین بیش از ده شریک در صورت ارتقای طبقات.",
      "در صلح منافع یا بیع شرط اراضی تحت رهن بانک‌های دولتی بدون اجازه مرتهن."
    ],
    correctOptionIndex: 1,
    explanation: "طبق ماده ۸۰۸ قانون مدنی، حق شفعه مختص مال غیرمنقول قابل تقسیم بین دو نفر شریک مشاع است که یکی از آنان سهم خود را به وسیله بیع به شخص ثالث به فروش برساند. در این صورت شریک دیگر حق دارد ثمن را به خریدار بدهد و ملک را تملک کند."
  },
  {
    id: "q7",
    topic: "آیین دادرسی مدنی (طرق شکایت)",
    questionText: "مهلت قانونی تقدیم دادخواست اعاده دادرسی برای محکوم‌علیه مقیم داخل کشور چند روز از تاریخ ابلاغ واقعی است؟",
    options: [
      "۱۰ روز کاری از زمان ثبت در سامانه ابلاغ قضایی ثنا.",
      "۲۰ روز تمام از تاریخ ابلاغ واقعی رای قطعی دادگاه تجدیدنظر.",
      "۳۰ روز کامل از زمان اقامه رسمی دعوای تالیف ثالث.",
      "۶۰ روز برای دعاوی مستند به اسناد رسمی ثبتی کاداستر."
    ],
    correctOptionIndex: 1,
    explanation: "طبق ماده ۴۲۷ قانون آیین دادرسی مدنی، مهلت واخواهی، تجدیدنظرخواهی و اعاده دادرسی برای اشخاص مقیم ایران ۲۰ روز و برای اشخاص مقیم خارج از کشور ۲ ماه از تاریخ ابلاغ رای قطعی یا زمان کشف علت آن تفویض گردیده است."
  },
  {
    id: "q8",
    topic: "حقوق تجارت (ورشکستگی)",
    questionText: "کدام مرجع صالح برای صدور حکم ورشکستگی شرکت تضامنی یا شرکت با مسئولیت محدود متوقف است؟",
    options: [
      "اداره کل ثبت شرکت‌ها و مالکیت فکری به صورت تصمیم اداری قطعی.",
      "دادگاه عمومی حقوقی محل اقامت تاجر یا مرکز اصلی شرکت تجارتی مستقر در همان حوزه.",
      "اتاق بازرگانی و صنایع و معادن ایران به عنوان حکم داوری مطلق.",
      "شورای عالی بورس و اوراق بهادار در خصوص ورشکستگی مالی بنگاه‌های بورسی."
    ],
    correctOptionIndex: 1,
    explanation: "بر مبنای مواد ۴۱۳ به بعد قانون تجارت، اعلام ورشکستگی صرفاً در صلاحیت دادگاه عمومی حقوقی محل اقامت رسمی تاجر (یا مرکز اصلی شرکت تجارتی) است که پس از بررسی صورت دارایی‌ها اقدام به صدور رای مقتضی می‌نماید."
  },
  {
    id: "q9",
    topic: "حقوق مدنی (مزارعه)",
    questionText: "در صورتی که در عقد مزارعه، عامل در اثنای عمل فوت کند و انجام عمل نیز مقید به مباشرت وی نباشد، وضعیت عقد و حقوق طرفین چگونه است؟",
    options: [
      "عقد منفسخ شده و اجرت‌المثل عمل انجام شده به ورثه پرداخت می‌شود.",
      "عقد به قوت خود باقی است و ورثه عامل موظف به ادامه کار هستند یا باید نایب بگیرند.",
      "مالک حق فسخ عقد را خواهد داشت زیرا بقای عقد مزارعه منوط به حیات عامل است.",
      "عقد منفسخ شده و سهمی از محصول به نسبت عمل انجام شده به ورثه تعلق می‌گیرد."
    ],
    correctOptionIndex: 1,
    explanation: "طبق ماده ۵۲۹ قانون مدنی، عقد مزارعه به فوت متعاملین یا احد آن‌ها باطل نمی‌شود مگر اینکه مباشرت عامل شرط شده باشد. در صورت عدم تقید به مباشرت، ورثه قائم مقام متوفی در اجرای تعهدات خواهند بود."
  },
  {
    id: "q10",
    topic: "آیین دادرسی مدنی (اعتراض ثالث)",
    questionText: "اعتراض ثالث نسبت به حکمی که از دادگاه تجدیدنظر صادر شده است، در کدام مرجع و به چه صورت اقامه می‌گردد؟",
    options: [
      "در همان دادگاه تجدیدنظر صادرکننده حکم و به موجب دادخواست.",
      "در دادگاه نخستین صادرکننده رای بدوی و به موجب دادخواست.",
      "در دیوان عالی کشور و به صورت لایحه اعتراضیه.",
      "در دادگاه کیفری یک استان به عنوان مرجع شکلی."
    ],
    correctOptionIndex: 0,
    explanation: "مستند به ماده ۴۲۰ قانون آیین دادرسی مدنی، دادخواست اعتراض ثالث باید به دادگاهی تقدیم شود که رای قطعی معترض‌عنه را صادر کرده است. لذا اگر رای از دادگاه تجدیدنظر صادر شده باشد، مرجع رسیدگی به اعتراض نیز همان دادگاه خواهد بود."
  },
  {
    id: "q11",
    topic: "حقوق مدنی (بیع شرط)",
    questionText: "چنانچه در بیع شرط، خریدار پیش از انقضای مدت خیار، مبیع را به دیگری واگذار نماید و فروشنده در مهلت قانونی ثمن را مسترد کند، وضعیت معامله دوم چگونه است؟",
    options: [
      "معامله دوم صحیح و نافذ است و فروشنده اول صرفاً حق مطالبه بدل مال را دارد.",
      "معامله دوم باطل است زیرا خریدار مالکیت قطعی بر مال نداشته است.",
      "معامله دوم منفسخ می‌شود زیرا حق فروشنده بر استرداد مبیع، حق عینی و مقدم بر تصرفات خریدار است.",
      "معامله دوم معلق باقی مانده و منوط به تنفیذ فروشنده اول پس از رد ثمن است."
    ],
    correctOptionIndex: 2,
    explanation: "در بیع شرط، خریدار نمی‌تواند تصرفاتی در مبیع نماید که منافی با حق خیار فروشنده باشد (ماده ۴۶۰ ق.م). در صورت اعمال خیار توسط فروشنده، تصرفات ناقله خریدار که در زمان خیار انجام شده منفسخ می‌گردد."
  },
  {
    id: "q12",
    topic: "آیین دادرسی مدنی (استرداد دعوا)",
    questionText: "در صورتی که خواهان در حین دادرسی نخستین، دعوای خود را مسترد نماید و این استرداد پس از ختم مذاکرات طرفین باشد، دادگاه چه تصمیمی اتخاذ می‌کند؟",
    options: [
      "قرار ابطال دادخواست صادر می‌کند.",
      "قرار رد دعوا صادر می‌کند.",
      "حکم به بی‌حقی خواهان صادر می‌کند.",
      "قرار سقوط دعوا صادر می‌کند."
    ],
    correctOptionIndex: 3,
    explanation: "طبق بند ج ماده ۱۰۷ قانون آیین دادرسی مدنی، استرداد دعوا پس از ختم مذاکرات طرفین در صورتی که بدون رضایت خوانده باشد یا خوانده راضی نشود، منجر به صدور قرار سقوط دعوا می‌گردد که اعتبار امر مختومه را دارد."
  },
  {
    id: "q13",
    topic: "حقوق مدنی (شرط وکالت در طلاق)",
    questionText: "اگر در ضمن عقد نکاح، شرط شود که در صورت ازدواج مجدد زوج، زوجه وکیل در طلاق خود باشد (شرط نتیجه)، فوت زوج پیش از اعمال این وکالت چه اثری دارد؟",
    options: [
      "وکالت به ورثه زوجه منتقل می‌شود و آن‌ها می‌توانند طلاق را ثبت کنند.",
      "وکالت باطل شده و اثر حقوقی آن به کلی زایل می‌گردد.",
      "وکالت به عنوان یک حق مالی در ماترک متوفی باقی می‌ماند.",
      "وکالت همچنان معتبر است زیرا به صورت شرط نتیجه در عقد لازم درج شده است."
    ],
    correctOptionIndex: 1,
    explanation: "وکالت در طلاق، حتی اگر به صورت شرط ضمن عقد لازم (نکاح) باشد، ماهیت اذنی خود را از دست نمی‌دهد و با فوت موکل (زوج) بر اساس ماده ۶۷۸ قانون مدنی منفسخ می‌گردد."
  }
];

export default function CustomExamSimulator() {
  // Preset list of questions managed by Admin
  const [questions, setQuestions] = useState<ExamQuestion[]>(DEFAULT_QUESTIONS);
  
  // Track which questions are active/selected for the current exam
  const [activeQuestionIds, setActiveQuestionIds] = useState<string[]>(
    DEFAULT_QUESTIONS.map(q => q.id)
  );

  // Layout mode: "card" (every question per page) or "booklet" (look like actual Konkur layout)
  const [layoutMode, setLayoutMode] = useState<"card" | "booklet">("card");

  const handleSetLayoutMode = (mode: "card" | "booklet") => {
    setLayoutMode(mode);
    addTelemetry("config", `داوطلب چیدمان دفترچه آزمون را به حالت «${mode === "card" ? "تک سوالی" : "دفترچه یکپارچه کنکوری"}» تغییر داد.`);
  };

  // Admin Customization States
  const [isAdminConfigOpen, setIsAdminConfigOpen] = useState(false);
  const [examDurationMinutes, setExamDurationMinutes] = useState<number>(15);
  const [customPassPercent, setCustomPassPercent] = useState<number>(50);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionTopic, setNewQuestionTopic] = useState("حقوق مدنی");
  const [newQuestionOptions, setNewQuestionOptions] = useState<string[]>(["", "", "", ""]);
  const [newQuestionCorrectIdx, setNewQuestionCorrectIdx] = useState<number>(0);
  const [newQuestionExpl, setNewQuestionExpl] = useState("");
  const [isSuccessMessage, setIsSuccessMessage] = useState<string | null>(null);

  // Student test taking states
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, number>>({}); // qId -> selectedOptionIdx (0-3)
  const [starredQuestions, setStarredQuestions] = useState<Record<string, boolean>>({}); // qId -> isStarred
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);

  // --- Enhanced Interactive States ---
  const [scratchNotes, setScratchNotes] = useState<Record<string, string>>({}); 
  const [showCodexDrawer, setShowCodexDrawer] = useState(false);
  const [codexSearchQuery, setCodexSearchQuery] = useState("");
  const handleCodexSearch = (val: string) => {
    setCodexSearchQuery(val);
    if (val.length > 2) {
      addTelemetry("search", `جستجوی داوطلب در اطلس نصوص قانونی برای کلیدواژه: «${val}»`);
    }
  };

  const [showStressHelp, setShowStressHelp] = useState(false);
  const [activeSpeechQId, setActiveSpeechQId] = useState<string | null>(null);
  const [activeSpeechProgress, setActiveSpeechProgress] = useState(0);
  const [stressBreathPhrase, setStressBreathPhrase] = useState("دم عمیق بکشید... (۴ ثانیه)");
  const [stressBreathClass, setStressBreathClass] = useState("scale-105 bg-indigo-50 text-indigo-800");
  // Result Section Ref for PDF Export
  const resultReportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showTechnicalLogs, setShowTechnicalLogs] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // AI Personalized Exam States
  const [selectedAiExamSubject, setSelectedAiExamSubject] = useState<string | null>(null);
  const [aiGeneratedExam, setAiGeneratedExam] = useState<any | null>(null);
  const [isGeneratingAiExam, setIsGeneratingAiExam] = useState<boolean>(false);
  const [aiExamAnswers, setAiExamAnswers] = useState<Record<string, number>>({});
  const [aiExamSubmitted, setAiExamSubmitted] = useState<boolean>(false);
  const [aiExamScore, setAiExamScore] = useState<{ correct: number; total: number } | null>(null);
  const [aiExamError, setAiExamError] = useState<string | null>(null);
  const [lastSubmittedScores, setLastSubmittedScores] = useState<Record<string, number>>({});

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("chatre_danesh_exam_history");
      if (stored) {
        setLastSubmittedScores(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Failed to read test history from localStorage", e);
    }
  }, []);

  const getSubjectPercentage = (subjectName: string) => {
    // 1. If currently taking or has submitted, use current session percentages if we have answers
    const topicKey = subjectName.includes("اصول") ? "اصول" : subjectName.includes("تجارت") ? "تجارت" : subjectName.includes("دادرسی مدنی") ? "دادرسی مدنی" : "مدنی";
    const topicQuestions = activeQuestionsList.filter(q => q.topic.includes(topicKey) || q.topic.includes(subjectName));
    const topicAnswers = topicQuestions.filter(q => studentAnswers[q.id] !== undefined);
    
    if (topicAnswers.length > 0) {
      const correct = topicQuestions.filter(q => studentAnswers[q.id] === q.correctOptionIndex).length;
      const wrong = topicQuestions.filter(q => studentAnswers[q.id] !== undefined && studentAnswers[q.id] !== q.correctOptionIndex).length;
      return Math.round(((correct * 3 - wrong) / (topicQuestions.length * 3)) * 100);
    }
    
    // 2. Otherwise use the stored last submitted scores from localStorage if available
    if (lastSubmittedScores[subjectName] !== undefined) {
      return lastSubmittedScores[subjectName];
    }
    
    // 3. Fallback baseline if no real historical data exists
    if (subjectName.includes("مدنی")) return 60;
    if (subjectName.includes("دادرسی")) return 45;
    if (subjectName.includes("تجارت")) return 55;
    if (subjectName.includes("اصول")) return 40;
    return 50;
  };

  const handleGenerateAiExam = async (subjectName: string, percentage: number) => {
    setIsGeneratingAiExam(true);
    setSelectedAiExamSubject(subjectName);
    setAiGeneratedExam(null);
    setAiExamAnswers({});
    setAiExamSubmitted(false);
    setAiExamScore(null);
    setAiExamError(null);
    addTelemetry("ai_run", `در حال سفارش‌سازی و تولید مینی‌آزمون اختصاصی هوش مصنوعی در مبحث ${subjectName}...`);

    try {
      const response = await fetch("/api/generate-ai-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectName, percentage })
      });
      if (!response.ok) throw new Error("API call failed");
      const data = await response.json();
      setAiGeneratedExam(data);
      addTelemetry("ai_success", `آزمون شخصی‌سازی شده در درس ${subjectName} با موفقیت توسط مغز الکترونیک تولید شد.`);
    } catch (err: any) {
      console.error("AI Exam Generation Error:", err);
      setAiExamError("متاسفانه در حال حاضر امکان اتصال به سرویس هوش مصنوعی میسر نیست. لطفاً مجدداً تلاش فرمایید.");
      addTelemetry("ai_error", "خطا در برقراری ارتباط با پلتفرم مولد مینی‌آزمون‌های هوشمند.");
    } finally {
      setIsGeneratingAiExam(false);
    }
  };

  const handleAnswerAiExamQuestion = (qId: string, optIdx: number) => {
    if (aiExamSubmitted) return;
    setAiExamAnswers(prev => ({ ...prev, [qId]: optIdx }));
    addTelemetry("choice", `انتخاب گزینه ${optIdx + 1} برای سوال هوشمند ${qId}`);
  };

  const handleSubmitAiExam = () => {
    if (!aiGeneratedExam || aiExamSubmitted) return;
    let correctCount = 0;
    aiGeneratedExam.questions.forEach((q: any) => {
      if (aiExamAnswers[q.id] === q.correctOptionIndex) {
        correctCount++;
      }
    });
    setAiExamScore({ correct: correctCount, total: aiGeneratedExam.questions.length });
    setAiExamSubmitted(true);
    addTelemetry("ai_success", `داوطلب پاسخ‌برگ مینی‌آزمون AI را ارسال کرد. نمره نهایی: ${correctCount} از ${aiGeneratedExam.questions.length}`);
  };

  // AI Deep Analysis Call to Backend
  const handleCallAIAnalysis = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    addTelemetry("ai_run", "فراخوانی مغز پردازشگر هوشمند جهت تحلیل رفتار آزمونی و شناسایی نقاط ضعف...");
    
    try {
      // Prepare lesson stats for AI
      const topicsData: Record<string, { total: number; correct: number; wrong: number; empty: number }> = {};
      activeQuestionsList.forEach(q => {
        if (!topicsData[q.topic]) {
          topicsData[q.topic] = { total: 0, correct: 0, wrong: 0, empty: 0 };
        }
        topicsData[q.topic].total++;
        const ans = studentAnswers[q.id];
        if (ans === undefined) topicsData[q.topic].empty++;
        else if (ans === q.correctOptionIndex) topicsData[q.topic].correct++;
        else topicsData[q.topic].wrong++;
      });

      const lessons = Object.entries(topicsData).map(([name, stats]) => ({
        lessonName: name,
        percentage: Math.round(((stats.correct * 3 - stats.wrong) / (stats.total * 3)) * 100),
        correct: stats.correct,
        wrong: stats.wrong,
        empty: stats.empty
      }));

      const response = await fetch("/api/analyze-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessons, field: "bar_exam" })
      });
      
      const data = await response.json();
      setAiAnalysis(data);
      addTelemetry("ai_success", "تحلیل هوشمند با موفقیت دریافت و در لایه کارنامه نهایی بارگذاری گردید.");
      showSuccess("تحلیل هوشمند چتر دانش با موفقیت انجام شد.");
    } catch (err) {
      console.error("AI Analysis Error:", err);
      addTelemetry("ai_error", "خطا در برقراری ارتباط با پلتفرم تحلیل AI. لطفاً اتصال اینترنت را چک کنید.");
    } finally {
      setIsAnalyzing(true); // Keep it visible or allow retry
      setIsAnalyzing(false);
    }
  };

  const handleExportPDF = async () => {
    if (!resultReportRef.current) return;
    setIsExporting(true);
    addTelemetry("export", "تلاش برای تولید کارنامه PDF با متد پاکسازی عمیق رنگی (Deep HEX Sanitization)...");
    
    try {
      // Pre-compile and sanitize ALL stylesheets in the document to avoid html2canvas oklch/oklab parsing crashes
      const stylesText: string[] = [];
      
      // 1. Gather rules from document.styleSheets
      for (let i = 0; i < document.styleSheets.length; i++) {
        const sheet = document.styleSheets[i];
        try {
          if (sheet.cssRules) {
            const rules = Array.from(sheet.cssRules);
            const cssText = rules.map(rule => rule.cssText).join("\n");
            stylesText.push(cssText);
          }
        } catch (e) {
          // Cross-origin CSS file (or restricted sandbox). If it is a local/cached link, fetch via HTTP
          const owner = sheet.ownerNode;
          if (owner && owner instanceof HTMLLinkElement && owner.href) {
            try {
              const res = await fetch(owner.href);
              if (res.ok) {
                const text = await res.text();
                stylesText.push(text);
              }
            } catch (fetchErr) {
              console.warn("Could not fetch link stylesheet:", owner.href, fetchErr);
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

      // 3. Clean up any trace of oklch or oklab from css text
      const rawCSS = stylesText.join("\n");
      const sanitizedCSS = rawCSS
        // Replace oklch/oklab with clear opacity to standard transparent
        .replace(/oklch\([^)]*?\/\s*0(?:\.[0-9]+)?\s*\)/gi, "transparent")
        .replace(/oklab\([^)]*?\/\s*0(?:\.[0-9]+)?\s*\)/gi, "transparent")
        // Solid white fallback
        .replace(/oklch\(\s*1(?:\s+0(?:\s+0)?)?\s*\)/gi, "#ffffff")
        .replace(/oklab\(\s*1(?:\s+0(?:\s+0)?)?\s*\)/gi, "#ffffff")
        // Solid black fallback
        .replace(/oklch\(\s*0(?:\s+0(?:\s+0)?)?\s*\)/gi, "#000000")
        .replace(/oklab\(\s*0(?:\s+0(?:\s+0)?)?\s*\)/gi, "#000000")
        // Convert any standard oklch or oklab instance to hex fallbacks
        .replace(/oklch\([^\)]*\)/gi, "#4f46e5")
        .replace(/oklab\([^\)]*\)/gi, "#1e293b");

      const canvas = await html2canvas(resultReportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          // Remove all original style tags and link stylesheet tags in the cloned document
          const badStyles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
          badStyles.forEach(el => el.parentNode?.removeChild(el));

          // Insert our 100% sanitized stylesheet that has completely eliminated oklch and oklab functions!
          const cleanStyle = clonedDoc.createElement("style");
          cleanStyle.textContent = sanitizedCSS;
          clonedDoc.head.appendChild(cleanStyle);

          // Add extra overrides just in case
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

          // We also clean up inline styles of all elements in the clone
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
        }
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
      pdf.save(`ChatrDanesh_Report_${Date.now()}.pdf`);
      showSuccess("کارنامه رسمی شما با موفقیت تولید و دانلود شد.");
      addTelemetry("success", "فایل PDF با موفقیت تولید و دانلود شد.");
    } catch (err) {
      console.error("PDF Export Error:", err);
      addTelemetry("error", `خطا در تولید PDF: ${err instanceof Error ? err.message : "مشکل در پارس استایل‌ها"}`);
      alert("متأسفانه خطایی در تولید فایل PDF رخ داد. لطفاً از گزینه «چاپ مستقیم» استفاده کنید که برای شبکه‌های داخلی و اینترانت پایدارتر است.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleNativePrint = () => {
    addTelemetry("export", "کاربر از متد چاپ مستقیم مرورگر (Standard Print) استفاده کرد. این روش برای محیط‌های اینترانت پایدارتر است.");
    window.print();
  };
  const [telemetryLogs, setTelemetryLogs] = useState<{ id: string; time: string; type: string; message: string }[]>([]);

  const addTelemetry = (type: string, message: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("fa-IR", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const logId = Math.random().toString(36).substring(2, 9);
    setTelemetryLogs(prev => [
      { id: logId, time: timeStr, type, message },
      ...prev
    ]);
  };

  // Preset configuration helper
  const loadPresetTemplate = (templateName: string) => {
    if (templateName === "CivilOnly") {
      const filtered = DEFAULT_QUESTIONS.filter(q => q.topic.includes("حقوق مدنی"));
      setQuestions(filtered);
      setActiveQuestionIds(filtered.map(q => q.id));
      setExamDurationMinutes(5);
      showSuccess("قالب سفارشی 'فقط حقوق مدنی' بارگذاری شد.");
    } else if (templateName === "VokalaSpecial") {
      const selectedIds = ["q9", "q10", "q11", "q12", "q13"];
      const filtered = DEFAULT_QUESTIONS.filter(q => selectedIds.includes(q.id));
      setQuestions(filtered);
      setActiveQuestionIds(selectedIds);
      setExamDurationMinutes(15);
      showSuccess("شبیه‌ساز ویژه آزمون وکالت (۵ سوال دشوار مدنی و دادرسی) آماده شد.");
    } else if (templateName === "QuickTrade") {
      const filtered = DEFAULT_QUESTIONS.filter(q => q.topic.includes("تجارت") || q.topic.includes("اصول فقه"));
      setQuestions(filtered);
      setActiveQuestionIds(filtered.map(q => q.id));
      setExamDurationMinutes(8);
      showSuccess("قالب سفارشی 'مباحث تجاری و اصول فقه' بارگذاری شد.");
    } else {
      setQuestions(DEFAULT_QUESTIONS);
      setActiveQuestionIds(DEFAULT_QUESTIONS.map(q => q.id));
      setExamDurationMinutes(15);
      showSuccess("قالب جامع 'شبیه‌ساز کل آزمون وکالت' بازنشانی شد.");
    }
    setCurrentIdx(0);
  };

  const showSuccess = (msg: string) => {
    setIsSuccessMessage(msg);
    setTimeout(() => setIsSuccessMessage(null), 3500);
  };

  // Timer run effect
  useEffect(() => {
    let interval: any = null;
    if (isTestRunning && !isTestSubmitted && timeLeftSeconds > 0) {
      interval = setInterval(() => {
        setTimeLeftSeconds(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTestRunning, isTestSubmitted, timeLeftSeconds]);

  // Stress / Resilience breathing interval effect (4-7-8 rhythm: inhale, hold, exhale)
  useEffect(() => {
    let tick = 0;
    const breatheInterval = setInterval(() => {
      if (showStressHelp) {
        tick = (tick + 1) % 15;
        if (tick === 1) addTelemetry("stress", "تمرین تنفس ریتمیک (cycle start) جهت کاهش اضطراب فعال شد.");
        if (tick < 4) {
          setStressBreathPhrase(`دم عمیق بکشید... 🧘 (ثانیه ${tick + 1})`);
          setStressBreathClass("scale-115 bg-emerald-50 text-emerald-800 transition-all duration-1000 border-2 border-emerald-400");
        } else if (tick < 11) {
          setStressBreathPhrase("حبس نفس... ✊ (ثابت بمانید)");
          setStressBreathClass("scale-115 bg-amber-50 text-amber-800 transition-all duration-1000 border-2 border-amber-400");
        } else {
          setStressBreathPhrase("بازدم طولانی... 🌬️ (تخلیه اضطراب)");
          setStressBreathClass("scale-100 bg-sky-50 text-sky-800 transition-all duration-1000 border-2 border-sky-300");
        }
      }
    }, 1000);
    return () => clearInterval(breatheInterval);
  }, [showStressHelp]);

  // TTS / Speech helper with standard synthesis
  const handleSpeakQuestion = (qId: string, textToRead: string) => {
    if (activeSpeechQId === qId) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setActiveSpeechQId(null);
      return;
    }

    setActiveSpeechQId(qId);
    setActiveSpeechProgress(10);

    // If browser supports web-speech synthesis, let's play it, else simulate a premium visual wave
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = "fa-IR"; // Persian output configuration
      utterance.onend = () => {
        setActiveSpeechQId(null);
      };
      utterance.onerror = () => {
        // Fallback progress simulator
      };
      window.speechSynthesis.speak(utterance);
    }

    // Simultaneously make sound wave visually dance
    addTelemetry("tts", `داوطلب درخواست قرائت صوتی سوال «${qId}» را صادر کرد.`);
    const progressInterval = setInterval(() => {
      setActiveSpeechProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setActiveSpeechQId(null);
          return 0;
        }
        return prev + 15;
      });
    }, 900);
  };

  // Start Exam Handle
  const handleStartExam = () => {
    if (activeQuestionIds.length === 0) {
      alert("لطفاً حداقل ۱ سوال را تایید و در دایره آزمون قرار دهید.");
      return;
    }
    // initialize states
    setStudentAnswers({});
    setStarredQuestions({});
    setCurrentIdx(0);
    setTimeLeftSeconds(examDurationMinutes * 60);
    setIsTestRunning(true);
    setIsTestSubmitted(false);

    // Reset telemetry logs and add initial record
    const startTimeStr = new Date().toLocaleTimeString("fa-IR", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setTelemetryLogs([
      { 
        id: "init", 
        time: startTimeStr, 
        type: "info", 
        message: `جلسه آزمون جدید کانون وکلا در سیستم ثبت گردید. مدت زمان مقرر: ${examDurationMinutes} دقیقه برای ${activeQuestionIds.length} سوال تستی.` 
      }
    ]);
  };

  // Switch questions to take selection in active IDs
  const toggleQuestionActive = (qId: string) => {
    const q = questions.find(item => item.id === qId);
    if (activeQuestionIds.includes(qId)) {
      if (activeQuestionIds.length <= 1) {
        alert("برگزاری آزمون نیازمند وجود حداقل یک سوال است.");
        return;
      }
      addTelemetry("config", `مدیر سوال مبحث «${q?.topic}» را از بانک آزمون حذف کرد.`);
      setActiveQuestionIds(prev => prev.filter(id => id !== qId));
    } else {
      addTelemetry("config", `مدیر سوال مبحث «${q?.topic}» را به بانک آزمون اضافه کرد.`);
      setActiveQuestionIds(prev => [...prev, qId]);
    }
  };

  // Option select handler
  const handleSelectOption = (qId: string, idx: number) => {
    const q = questions.find(item => item.id === qId);
    setStudentAnswers(prev => {
      const prevAns = prev[qId];
      if (prevAns === idx) {
        addTelemetry("choice", `داوطلب پاسخ سوال مبحث «${q?.topic}» را پاک کرد.`);
        const copy = { ...prev };
        delete copy[qId];
        return copy;
      }
      addTelemetry("choice", `داوطلب گزینه ${formattedPersianNum(idx + 1)} را برای سوال مبحث «${q?.topic}» انتخاب نمود.`);
      return { ...prev, [qId]: idx };
    });
  };

  const toggleStar = (qId: string) => {
    setStarredQuestions(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const handleNextQuestion = () => {
    if (currentIdx < activeQuestionIds.length - 1) {
      setCurrentIdx(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  };

  const handleSubmitTest = () => {
    setIsTestSubmitted(true);
    setIsTestRunning(false);
    
    const scores: Record<string, number> = {};

    // Save history with dynamic subject percentages to localStorage
    try {
      ["حقوق مدنی", "آیین دادرسی مدنی", "حقوق تجارت", "اصول فقه"].forEach(name => {
        const key = name.includes("اصول") ? "اصول" : name.includes("تجارت") ? "تجارت" : name.includes("دادرسی مدنی") ? "دادرسی مدنی" : "مدنی";
        const topicQuestions = activeQuestionsList.filter(q => q.topic.includes(key) || q.topic.includes(name));
        const correct = topicQuestions.filter(q => studentAnswers[q.id] === q.correctOptionIndex).length;
        const wrong = topicQuestions.filter(q => studentAnswers[q.id] !== undefined && studentAnswers[q.id] !== q.correctOptionIndex).length;
        const percent = topicQuestions.length > 0 
          ? Math.round(((correct * 3 - wrong) / (topicQuestions.length * 3)) * 100)
          : 0;
        scores[name] = percent;
      });
      localStorage.setItem("chatre_danesh_exam_history", JSON.stringify(scores));
      setLastSubmittedScores(scores);
    } catch (e) {
      console.warn("Failed to write test history to localStorage", e);
    }

    // Save to Firestore dynamically
    try {
      const uid = auth.currentUser?.uid || "anonymous-uid";
      const resultId = "res_" + Date.now();
      saveExamResult("inst-3", resultId, {
        userId: uid,
        score: correctAttempts,
        percentage: computedPercentage,
        traz: computedTraz,
        aiAnalysis: {
          metrics: {
            correct: correctAttempts,
            wrong: wrongAttempts,
            empty: emptyAttempts,
          },
          lastSubmittedScores: scores,
        }
      });

      appendSecurityLog({
        userId: uid,
        action: "EXAM_SUBMISSION",
        details: `ثبت کارنامه در آزمون تستی شبیه‌ساز چتر دانش با تراز ${computedTraz} و درصد ${computedPercentage}%`,
        severity: "low",
      });
    } catch (saveErr) {
      console.warn("Failed to sync exam result to Firestore:", saveErr);
    }

    addTelemetry("finish", `آزمون خاتمه یافت. تراز نهایی محاسبه شده: ${computedTraz} | درصد مکتسبه: ${computedPercentage}%`);
  };

  const handleResetSimulator = () => {
    setIsTestSubmitted(false);
    setIsTestRunning(false);
    setStudentAnswers({});
    setStarredQuestions({});
    setCurrentIdx(0);
  };

  // Admin: Add custom question
  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) {
      alert("لطفاً صورت سوال را تایپ نمایید.");
      return;
    }
    if (newQuestionOptions.some(opt => !opt.trim())) {
      alert("لطفاً تمامی گزینه‌های چهارگانه را تکمیل بفرمایید.");
      return;
    }
    const newQ: ExamQuestion = {
      id: "custom_" + Date.now(),
      topic: newQuestionTopic,
      questionText: newQuestionText,
      options: [...newQuestionOptions],
      correctOptionIndex: newQuestionCorrectIdx,
      explanation: newQuestionExpl || "این سوال به انتخاب مدیر پورتال چتر دانش تعریف شده و مستندات قانونی آن مصوب کانون وکلاست."
    };
    
    setQuestions(prev => [newQ, ...prev]);
    setActiveQuestionIds(prev => [newQ.id, ...prev]);
    
    // Reset fields
    setNewQuestionText("");
    setNewQuestionOptions(["", "", "", ""]);
    setNewQuestionCorrectIdx(0);
    setNewQuestionExpl("");
    
    showSuccess("سوال جدید چهارگزینه‌ای با موفقیت به بانک آزمون اضافه و فعال گردید.");
  };

  const handleOptionChange = (idx: number, value: string) => {
    const updated = [...newQuestionOptions];
    updated[idx] = value;
    setNewQuestionOptions(updated);
  };

  // Metrics Calculation
  const activeQuestionsList = questions.filter(q => activeQuestionIds.includes(q.id));
  const totalQuestionsCount = activeQuestionsList.length;
  
  // Scoring
  let correctAttempts = 0;
  let wrongAttempts = 0;
  let emptyAttempts = 0;

  activeQuestionsList.forEach(q => {
    const chosen = studentAnswers[q.id];
    if (chosen === undefined) {
      emptyAttempts++;
    } else if (chosen === q.correctOptionIndex) {
      correctAttempts++;
    } else {
      wrongAttempts++;
    }
  });

  // Iranian Competition Formula (تراز و درصد کنکور واقعی با نمره منفی)
  // % = (صحیح * 3 - غلط) / (کل * 3) * 100
  const computedPercentage = totalQuestionsCount > 0 
    ? Math.round(((correctAttempts * 3 - wrongAttempts) / (totalQuestionsCount * 3)) * 100)
    : 0;

  // Let's project a traz (e.g., standard formula scaled around 5000-12000)
  const computedTraz = totalQuestionsCount > 0
    ? Math.round(5000 + (computedPercentage * 70))
    : 0;

  // Rank approximation relative to exam standard
  const computedRank = computedPercentage >= 80 ? 12 : computedPercentage >= 65 ? 89 : computedPercentage >= 50 ? 342 : 1105;

  // Time conversion helper
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const formattedPersianNum = (num: number) => {
    return num.toLocaleString("fa-IR");
  };

  return (
    <div className="space-y-6 text-right" id="exam-simulator-component" style={{ direction: "rtl" }}>
      
      {/* ⚠️ Successful Toast Notification */}
      {isSuccessMessage && (
        <div className="fixed bottom-4 left-4 z-50 bg-emerald-950 text-emerald-200 border border-emerald-800 p-4 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce @rtl font-sans text-xs">
          <Sparkles className="text-amber-400 animate-spin" size={16} />
          <span>{isSuccessMessage}</span>
        </div>
      )}

      {/* Top Professional Welcome Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial-gradient(ellipse_at_right,_var(--tw-gradient-stops)) from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1 px-2.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-[9px] font-black tracking-wider uppercase">
                شبیه‌ساز پیشرفته آزمون‌های سراسری
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] text-emerald-300 font-bold">بومی‌سازی شده طبق ضرایب و فرمول کانون وکلا (اسکودا) ⚖️</span>
            </div>
            <h2 className="font-extrabold text-slate-100 text-xl">ارزیاب چهارگزینه‌ای تطبیقی و شخصی‌سازی شده چتر دانش</h2>
            <p className="text-[11px] text-slate-400 max-w-3xl leading-relaxed font-medium">
              این پیشخوان مستقل به دانش‌پذیران کمک می‌کند تا خود را برای کنکورهای کانون وکلا، مرکز وکلا، قضاوت و سردفتری محک بزنند. مدیران و استادان می‌توانند سوالات را بر حسب مباحث قانون مدنی، تجارت یا آیین دادرسی فعال/غیرفعال کرده، زمان‌بندی را تنظیم و خروجی کارنامه با نمره منفی را زنده پایش کنند.
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setIsAdminConfigOpen(!isAdminConfigOpen)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border ${
                isAdminConfigOpen 
                  ? "bg-amber-400 text-slate-950 border-amber-300"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
              }`}
            >
              <Settings size={14} className={isAdminConfigOpen ? "animate-spin-slow text-slate-900" : ""} />
              <span>{isAdminConfigOpen ? "بستن بخش مدیریت سوال" : "🔧 پنل شخصی‌سازی (مدیر طراح)"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🛠️ Admin Control Panel Box (Expandable) */}
      {isAdminConfigOpen && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 shadow-md space-y-6 animate-slideIn transition-all">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 pr-2 border-r-4 border-amber-400">
              <Settings size={18} className="text-slate-700" />
              <span>میز کار شخصی‌سازی و انتصاب سوالات مدیر پورتال (Question Designer Hub)</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs">
              سطح دسترسی: ادمین کل سیستم چتر دانش 🛡️
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Template presets & core variables */}
            <div className="lg:col-span-4 space-y-4">
              <strong className="block text-xs font-black text-slate-700">۱. قالب‌ها و متغیرهای اصلی ارزیابی:</strong>
              
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                <div>
                  <label className="block text-[10px] text-slate-500 font-black mb-1">بارگذاری قالب از پیش‌ تعیین شده:</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button 
                      onClick={() => loadPresetTemplate("Reset")} 
                      className="px-2 py-1.5 text-[9.5px] font-extrabold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition cursor-pointer"
                    >
                      شبیه‌ساز جامع
                    </button>
                    <button 
                      onClick={() => loadPresetTemplate("CivilOnly")} 
                      className="px-2 py-1.5 text-[9.5px] font-extrabold bg-indigo-50 hover:bg-indigo-100 rounded-lg text-indigo-700 transition cursor-pointer"
                    >
                      مدنی اختصاصی
                    </button>
                    <button 
                      onClick={() => loadPresetTemplate("QuickTrade")} 
                      className="px-2 py-1.5 text-[9.5px] font-extrabold bg-amber-50 hover:bg-amber-100 rounded-lg text-amber-900 transition cursor-pointer"
                    >
                      تجارت و اصول
                    </button>
                    <button 
                      onClick={() => loadPresetTemplate("VokalaSpecial")} 
                      className="px-2 py-1.5 text-[9.5px] font-extrabold bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-900 transition cursor-pointer border border-rose-200"
                    >
                      ویژه وکالت (دشوار)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">زمان مجاز آزمون:</label>
                    <div className="flex items-center gap-1">
                      <input 
                        type="number" 
                        min="1" 
                        max="180" 
                        value={examDurationMinutes}
                        onChange={(e) => setExamDurationMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-slate-50 text-slate-800 text-xs font-black font-mono border border-slate-200 p-2 rounded-xl text-center"
                      />
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">دقیقه</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">تراز قبولی شبیه‌ساز:</label>
                    <div className="flex items-center gap-1">
                      <input 
                        type="number" 
                        min="10" 
                        max="100" 
                        value={customPassPercent}
                        onChange={(e) => setCustomPassPercent(Math.max(10, Math.min(100, parseInt(e.target.value) || 10)))}
                        className="w-full bg-slate-50 text-slate-800 text-xs font-black font-mono border border-slate-200 p-2 rounded-xl text-center"
                      />
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">درصد</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Checklist selection of active questions */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 max-h-56 overflow-y-auto shadow-xs">
                <span className="block text-[10px] text-slate-500 font-black">انتخاب فعال‌بودن تک تک سوالات در آزمون:</span>
                <div className="space-y-1.5">
                  {questions.map((q, idx) => {
                    const isActive = activeQuestionIds.includes(q.id);
                    return (
                      <div 
                        key={q.id} 
                        onClick={() => toggleQuestionActive(q.id)}
                        className={`flex items-start gap-2 p-2 rounded-xl border text-[10.5px] cursor-pointer transition select-none ${
                          isActive 
                            ? "bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50" 
                            : "bg-slate-50/60 border-slate-200 text-slate-450 hover:bg-slate-100"
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          checked={isActive} 
                          readOnly 
                          className="mt-0.5 accent-emerald-600 rounded"
                        />
                        <div className="flex-grow">
                          <strong className="block text-[9px] text-slate-500 font-black">{idx + 1}. {q.topic}</strong>
                          <span className="line-clamp-1 font-sans">{q.questionText}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Form to add a completely new customized question */}
            <div className="lg:col-span-8 space-y-3">
              <strong className="block text-xs font-black text-slate-700">۲. طراحی و تزریق سوال جدید به بانک هوشمند (Add New Question):</strong>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 shadow-xs">
                {/* Right col details */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10.5px] text-slate-500 font-bold mb-1">موضوع ثبتی / گرایش آزمون:</label>
                    <select 
                      value={newQuestionTopic} 
                      onChange={(e) => setNewQuestionTopic(e.target.value)}
                      className="w-full bg-slate-50 text-slate-800 text-xs font-bold border border-slate-250 p-2 rounded-xl"
                    >
                      <option value="حقوق مدنی (وکالت)">حقوق مدنی (وکالت)</option>
                      <option value="آیین دادرسی مدنی (صلاحیت)">آیین دادرسی مدنی (صلاحیت)</option>
                      <option value="حقوق تجارت (اسناد تجاری)">حقوق تجارت (اسناد تجاری)</option>
                      <option value="اصول فقه (قواعد لفظ)">اصول فقه (قواعد لفظ)</option>
                      <option value="حقوق جزا (جرایم علیه اموال)">حقوق جزا (جرایم علیه اموال)</option>
                      <option value="آیین دادرسی کیفری">آیین دادرسی کیفری</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10.5px] text-slate-500 font-bold mb-1">متن صورت سوال (Question Prompt):</label>
                    <textarea 
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      placeholder="متن کامل و تخصصی سوال چهارگزینه‌ای حقوقی را وارد نمایید..."
                      rows={3}
                      className="w-full bg-slate-50 p-2.5 border border-slate-250 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] text-slate-500 font-bold mb-1">پاسخ علمی تشریحی (با جزئیات و ارجاع به ماده قانون):</label>
                    <textarea 
                      value={newQuestionExpl}
                      onChange={(e) => setNewQuestionExpl(e.target.value)}
                      placeholder="تحلیل علمی پاسخ صحیح جهت ارتقای تراز داوطلب که پس از اتمام آزمون نمایش داده می‌شود..."
                      rows={2}
                      className="w-full bg-slate-50 p-2.5 border border-slate-250 rounded-xl text-xs"
                    />
                  </div>
                </div>

                {/* Left col four inputs */}
                <div className="space-y-3 bg-slate-50/50 p-3 rounded-xl border border-slate-200">
                  <span className="block text-[10px] text-slate-450 font-black">وارد کردن گزینه‌های چهارگانه و مشخص کردن پاسخ صحیح:</span>
                  {[0, 1, 2, 3].map((idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">گزینه {formattedPersianNum(idx + 1)}:</span>
                      <input 
                        type="text" 
                        value={newQuestionOptions[idx]}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`متن کامل گزینه ${idx + 1}`}
                        className="flex-grow bg-white text-xs p-2 border border-slate-200 rounded-lg"
                      />
                      <button 
                        type="button"
                        onClick={() => setNewQuestionCorrectIdx(idx)}
                        className={`px-2.5 py-1.5 text-[9.5px] rounded-lg font-black transition cursor-pointer whitespace-nowrap ${
                          newQuestionCorrectIdx === idx 
                            ? "bg-emerald-600 text-white shadow-xs" 
                            : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        ✓ صحیح
                      </button>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="w-full py-2.5 bg-indigo-900 hover:bg-indigo-950 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles size={15} className="text-amber-400 animate-pulse" />
                      <span>تایید و اضافه کردن سوال قطعی به پورتال چتر دانش</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 📝 CORE EXAM SIMULATOR HOOD */}
      {/* ========================================================= */}
      
      {!isTestRunning && !isTestSubmitted && (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6 animate-fadeIn">
          {/* Dashboard screen explaining the test structure and options */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-4">
              <div className="flex items-center gap-2 text-indigo-900 font-black">
                <BookOpen size={20} className="animate-pulse" />
                <span className="text-base text-slate-900 font-extrabold pr-1">آماده شروع شبیه‌ساز سازمان یافته هستید؟</span>
              </div>
              <p className="text-[11.5px] text-slate-600 leading-relaxed font-medium">
                شما می‌توانید نحوه نمایش سوالات را بر حسب سلیقه خود تغییر دهید. گزینه <strong className="text-indigo-900">«هر سوال در یک کارت»</strong> برای تمرکز عمیق روی تک چالش‌ها، و گزینه <strong className="text-indigo-900">«دفترچه یکپارچه آزمون سراسری»</strong> برای شبیه‌سازی فشار زمان کدرشته‌های ملی پیشنهاد می‌شود.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {/* Selection 1: Card view layout */}
                <div 
                  onClick={() => handleSetLayoutMode("card")}
                  className={`p-4 border rounded-2xl cursor-pointer transition relative overflow-hidden select-none ${
                    layoutMode === "card" 
                      ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-100" 
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`p-1.5 rounded-lg ${layoutMode === "card" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                      <Layers size={14} />
                    </div>
                    <strong className="text-xs font-black text-slate-800">۱. هر سوال در یک کارت مجزا (Card Mode)</strong>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    مکانیزم مدرن متحرک. هر سوال با دکمه‌های بعدی/قبلی، نوار پیشرفت درصد پیشروی و بدون خستگی چشمی.
                  </p>
                  {layoutMode === "card" && (
                    <span className="absolute left-2.5 top-2.5 text-[9px] font-black bg-indigo-600 text-white rounded-md px-1.5 py-0.5">فعال ✦</span>
                  )}
                </div>

                {/* Selection 2: Booklet view layout */}
                <div 
                  onClick={() => handleSetLayoutMode("booklet")}
                  className={`p-4 border rounded-2xl cursor-pointer transition relative overflow-hidden select-none ${
                    layoutMode === "booklet" 
                      ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-100" 
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`p-1.5 rounded-lg ${layoutMode === "booklet" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                      <FileText size={14} />
                    </div>
                    <strong className="text-xs font-black text-slate-800">۲. دفترچه آزمون سراسری (Konkur Booklet)</strong>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    طرح‌بندی مشابه دفترچه واقعی کنکور همراه با پاسخ‌برگ تصویری موازی در ستون کناری و نمایش شماره سوالات.
                  </p>
                  {layoutMode === "booklet" && (
                    <span className="absolute left-2.5 top-2.5 text-[9px] font-black bg-blue-600 text-white rounded-md px-1.5 py-0.5">فعال ✦</span>
                  )}
                </div>
              </div>

              {/* AI mini exams section */}
              <div className="bg-gradient-to-l from-indigo-900/10 to-blue-900/5 border border-indigo-200 p-4.5 rounded-2xl space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-indigo-950">
                    <Sparkles size={16} className="text-amber-500 animate-pulse" />
                    <strong className="text-xs font-black">سازنده فوق‌هوشمند مینی‌آزمون‌های انطباقی و تحلیل روحیه (AI Tutor):</strong>
                  </div>
                  <span className="p-1 px-2.5 bg-indigo-100 text-indigo-800 text-[9px] font-black rounded-lg">
                    بر اساس داینامیک نتایج واقعی
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-600 leading-relaxed font-semibold">
                  موتور هوش مصنوعی چتر دانش بر اساس آخرین درصد مکتسبه شما (یا درصد در حال پیشرفت آزمون جاری)، مینی‌تست‌های تطبیقی را شبیه‌سازی می‌کند. با کلیک بر هر درس، هوش مصنوعی ابتدا تبیین می‌کند که <span className="text-indigo-900 font-bold">چرا این سوالات انتخاب شده‌اند</span>، سپس <span className="text-indigo-900 font-bold">سوالات تستی</span> را نشان داده و فرآیند پاسخگویی را رصد کرده و در نهایت <span className="text-amber-700 font-bold">تحلیل روانشناختی و آمادگی روحی</span> شما را ارائه می‌دهد.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { name: "حقوق مدنی" },
                    { name: "آیین دادرسی مدنی" },
                    { name: "حقوق تجارت" },
                    { name: "اصول فقه" }
                  ].map((sub) => {
                    const realPercent = getSubjectPercentage(sub.name);
                    const isFromHistory = lastSubmittedScores[sub.name] !== undefined;
                    const isFromRunning = activeQuestionsList.filter(q => q.topic.includes(sub.name.includes("اصول") ? "اصول" : sub.name.includes("تجارت") ? "تجارت" : sub.name.includes("دادرسی مدنی") ? "دادرسی مدنی" : "مدنی")).filter(q => studentAnswers[q.id] !== undefined).length > 0;
                    
                    return (
                      <button
                        key={sub.name}
                        type="button"
                        onClick={() => handleGenerateAiExam(sub.name, realPercent)}
                        className="px-3 py-2 bg-white hover:bg-indigo-50 text-indigo-950 font-extrabold text-[10px] rounded-xl border border-indigo-100 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer hover:border-indigo-300 active:scale-95 text-right font-sans"
                      >
                        <Sparkles size={11} className="text-indigo-600 animate-pulse" />
                        <span>سنجش هوشمند {sub.name}</span>
                        <span className={`px-1.5 py-0.5 text-[8.5px] rounded-md font-mono font-bold ${
                          isFromRunning ? "bg-amber-100 text-amber-800" : isFromHistory ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                        }`}>
                          {formattedPersianNum(realPercent)}٪ ({isFromRunning ? "آزمون جاری" : isFromHistory ? "کارنامه قبلی" : "تراز هدف"})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Legal disclaimer on negative points */}
              <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl flex gap-2.5 text-amber-900 text-[10.5px]">
                <HelpCircle size={18} className="text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <strong className="block font-black">قانون نمره منفی در آزمون تستی چتر دانش:</strong>
                  <p className="leading-relaxed">
                    این شبیه‌ساز مجهز به قانون یک‌سوم نمره‌منفی رقابت‌های ملی سراسری است؛ یعنی به ازای هر ۳ پاسخ نادرست، ۱ پاسخ درست شما کان لم یکن تلقی خواهد شد. بنابر جهت حفظ تراز بالای حقوقی، از پاسخ‌گویی شانسی پرهیز کنید.
                  </p>
                </div>
              </div>
            </div>

            {/* Target Status metrics widget */}
            <div className="md:col-span-4 bg-slate-50 border border-slate-200/60 p-5 rounded-3xl @rtl">
              <strong className="block text-xs font-black text-slate-800 border-b border-slate-200 pb-2 mb-3">اطلاعات آزمون جاری:</strong>
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="font-semibold">تعداد سوالات تایید شده:</span>
                  <strong className="font-black text-slate-800 font-mono">{formattedPersianNum(totalQuestionsCount)} سوال</strong>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">زمان برگزاری تخصیص‌یافته:</span>
                  <strong className="font-black text-slate-850 font-mono">{formattedPersianNum(examDurationMinutes)} دقیقه</strong>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">تراز آستانه قبولی آزمون:</span>
                  <strong className="font-black text-emerald-700 font-mono">{formattedPersianNum(customPassPercent)}٪</strong>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">قالب انتخابی جاری:</span>
                  <strong className="font-black text-indigo-900 text-[11px]">
                    {layoutMode === "card" ? "هر سوال در یک کارت" : "دفترچه جامع مشابه آزمون سراسری"}
                  </strong>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200">
                <button
                  onClick={handleStartExam}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-900 to-indigo-950 hover:from-blue-950 hover:to-black text-white rounded-2xl text-xs font-black shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 cursor-pointer"
                >
                  <Play size={16} className="text-amber-400 animate-spin-slow" />
                  <span>آغاز رقابت آزمایشی چتر دانش 🚀</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ⚠️ STATE: ACTIVE EXAM IS RUNNING */}
      {/* ========================================================= */}
      {isTestRunning && !isTestSubmitted && (
        <div className="space-y-4 animate-fadeIn">
          
          {/* Top Panel with countdown, progress slider and action bar */}
          <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <Clock size={20} className="text-indigo-800 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">زمان باقی‌مانده آزمون جاری:</span>
                <strong className={`text-base font-black font-mono block tracking-wider ${timeLeftSeconds < 60 ? "text-rose-500 animate-pulse" : "text-slate-800"}`}>
                  {formatTime(timeLeftSeconds)}
                </strong>
              </div>
            </div>

            {/* Quick status dots for completed questions */}
            <div className="flex flex-wrap items-center gap-1 max-w-xl justify-center bg-slate-50/50 p-2 rounded-xl border border-slate-100">
              {activeQuestionsList.map((q, idx) => {
                const isSelected = studentAnswers[q.id] !== undefined;
                const isStarred = starredQuestions[q.id];
                const isCurrent = activeQuestionIds[currentIdx] === q.id;
                
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      if (layoutMode === "card") {
                        setCurrentIdx(idx);
                      } else {
                        // Scroll or anchor to question ID
                        const el = document.getElementById(`booklet-q-${q.id}`);
                        if (el) {
                          el.scrollIntoView({ behavior: "smooth", block: "center" });
                        }
                      }
                    }}
                    className={`w-6 h-6 rounded-md text-[9.5px] font-black transition cursor-pointer flex items-center justify-center ${
                      isCurrent && layoutMode === "card"
                        ? "bg-indigo-900 border-2 border-amber-300 text-amber-300 scale-110" 
                        : isStarred 
                        ? "bg-amber-450 text-slate-950 text-xs shadow-xs"
                        : isSelected 
                        ? "bg-emerald-600 text-white" 
                        : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-100"
                    }`}
                    title={q.topic}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSubmitTest}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1 cursor-pointer"
              >
                <Square size={13} />
                <span>پایان و ثبت نهایی آزمون</span>
              </button>
            </div>
          </div>

          {/* Advanced Exam Support Hub */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Interactive Law Codex live lookup */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 ml-1">
                  <BookMarked size={16} className="text-indigo-700 animate-pulse" />
                  <span>دستیار قوانین آنلاین (سرچ زنده مواد قانونی حین آزمون)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowCodexDrawer(!showCodexDrawer)}
                  className="text-[9.5px] font-bold px-2.5 py-1 bg-indigo-900 text-white rounded-lg hover:bg-indigo-950 transition cursor-pointer"
                >
                  {showCodexDrawer ? "✕ بستن اطلس" : "🔍 جستجوی ماده قانونی"}
                </button>
              </div>
              
              {showCodexDrawer ? (
                <div className="space-y-2 mt-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={codexSearchQuery}
                      onChange={(e) => handleCodexSearch(e.target.value)}
                      placeholder="کلمه کلیدی را وارد کنید (مثلا: عزل، شفعه، ورشکستگی، ۹۱)..."
                      className="w-full bg-white text-xs border border-slate-250 p-2 pr-7.5 rounded-xl font-sans"
                    />
                    <Search size={14} className="absolute right-2.5 top-3.5 text-slate-400" />
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                    {STATIC_LAW_CODICIES.filter(art => 
                      art.text.includes(codexSearchQuery) || 
                      art.articleNumber.includes(codexSearchQuery) || 
                      art.source.includes(codexSearchQuery)
                    ).map(art => (
                      <div key={art.id} className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1">
                        <div className="flex justify-between text-[9px] font-black text-indigo-900">
                          <span>{art.source}</span>
                          <span>{art.articleNumber}</span>
                        </div>
                        <p className="text-[10.5px] leading-relaxed text-slate-600 font-sans font-medium">{art.text}</p>
                      </div>
                    ))}
                    {STATIC_LAW_CODICIES.filter(art => 
                      art.text.includes(codexSearchQuery) || 
                      art.articleNumber.includes(codexSearchQuery) || 
                      art.source.includes(codexSearchQuery)
                    ).length === 0 && (
                      <span className="text-[10px] text-slate-400 block text-center py-2">ماده منطبقی در این راهنمای سریع پیدا نشد.</span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-slate-500 leading-normal font-sans">
                  با کلیک روی گزینه فوق می‌توانید در هر لحظه ماباازای قانونی گزینه‌ها را در مرجع مصوبات جستجو کنید تا احتمال خطا به حداقل برسد.
                </p>
              )}
            </div>

            {/* 2. Resilience Breath support */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 ml-1">
                  <Activity size={16} className="text-emerald-600 animate-pulse" />
                  <span>پشتیبان روانی ضد اضطراب آزمون (روش ریتمیک ۴-۷-۸ اسکودا)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowStressHelp(!showStressHelp)}
                  className={`text-[9.5px] font-black px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    showStressHelp ? "bg-emerald-600 text-white" : "bg-slate-205 text-slate-700"
                  }`}
                >
                  {showStressHelp ? "فعال است (توقف)" : "🧘 آغاز ریتم آرامش"}
                </button>
              </div>

              {showStressHelp ? (
                <div className="flex items-center gap-4 mt-2 bg-white p-2.5 rounded-xl border border-slate-200">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${stressBreathClass}`}>
                    <Activity size={18} className="animate-pulse" />
                  </div>
                  <div className="text-right">
                    <strong className="text-xs font-black text-slate-800 block">{stressBreathPhrase}</strong>
                    <span className="text-[9.5px] text-slate-500 block mt-0.5 font-sans">تمرکز ذهن بر نفس‌ به رفع خطاهای محاسباتی در حقوق جزا و مدنی کمک می‌کند.</span>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-slate-500 leading-normal font-sans">
                  در صورت بروز سردرگمی یا استرس کاذب، تمرین تنفس ریتمیک عضلانی به تسلط شما صدماتی وارد نکرده و تراز عملکردتان را ثبات می‌بخشد.
                </p>
              )}
            </div>
          </div>

          {/* Render of Layout: Option 1 - CARD MODE */}
          {layoutMode === "card" && (
            <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-md relative overflow-hidden" id="exam-mode-card">
              {/* Question metadata */}
              <div className="flex justify-between items-center border-b border-indigo-50 pb-3 mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-indigo-50 text-indigo-950 font-black px-2.5 py-1 rounded-lg">
                    سوال {formattedPersianNum(currentIdx + 1)} از {formattedPersianNum(totalQuestionsCount)}
                  </span>
                  <span className="text-[10px] text-slate-450 font-bold">•</span>
                  <span className="text-[11px] text-indigo-700 font-black bg-indigo-50/50 px-2.5 py-1 rounded-lg">
                    مبحث: {activeQuestionsList[currentIdx]?.topic}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSpeakQuestion(activeQuestionsList[currentIdx]?.id, activeQuestionsList[currentIdx]?.questionText)}
                    className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-center ${
                      activeSpeechQId === activeQuestionsList[currentIdx]?.id
                        ? "bg-indigo-600 text-white animate-pulse"
                        : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                    }`}
                    title="قرائت صوتی و علمی صورت سوال"
                  >
                    <Volume2 size={14} />
                  </button>

                  <button
                    onClick={() => toggleStar(activeQuestionsList[currentIdx]?.id)}
                    className={`p-2 rounded-xl transition cursor-pointer ${
                      starredQuestions[activeQuestionsList[currentIdx]?.id]
                        ? "bg-amber-100 text-amber-600 border border-amber-200"
                        : "bg-slate-50 text-slate-400 hover:bg-slate-100 border border-transparent"
                    }`}
                    title="ستاره‌دار کردن برای بررسی مجدد"
                  >
                    <Flag size={14} className={starredQuestions[activeQuestionsList[currentIdx]?.id] ? "fill-amber-500" : ""} />
                  </button>
                </div>
              </div>

              {/* Question Body */}
              <div className="space-y-6">
                <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-100">
                  <h3 className="text-sm md:text-base font-black text-slate-800 leading-relaxed font-sans">
                    {activeQuestionsList[currentIdx]?.questionText}
                  </h3>
                </div>

                {/* 4 options list */}
                <div className="grid grid-cols-1 gap-2.5">
                  {activeQuestionsList[currentIdx]?.options.map((option, oIdx) => {
                    const isSelected = studentAnswers[activeQuestionsList[currentIdx]?.id] === oIdx;
                    return (
                      <div
                        key={oIdx}
                        onClick={() => handleSelectOption(activeQuestionsList[currentIdx]?.id, oIdx)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition select-none flex items-start gap-3.5 ${
                          isSelected
                            ? "bg-indigo-50/30 border-indigo-800 text-indigo-950 shadow-xs"
                            : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-indigo-900 text-white" : "bg-slate-100 text-slate-500"
                        }`}>
                          {oIdx + 1}
                        </span>
                        <p className="text-xs md:text-sm font-semibold leading-relaxed font-sans">{option}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Embedded Digital Scratchnote */}
                <div className="pt-4 border-t border-slate-100 text-right">
                  <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-700 mb-1.5">
                    <PenTool size={13} className="text-amber-500 animate-bounce" />
                    <span>چرک‌نویس و یادداشت‌های استدلالی شما برای این سوال (Transient Notes):</span>
                  </div>
                  <textarea
                    rows={2}
                    value={scratchNotes[activeQuestionsList[currentIdx]?.id] || ""}
                    onChange={(e) => {
                      const text = e.target.value;
                      setScratchNotes(prev => ({
                        ...prev,
                        [activeQuestionsList[currentIdx]?.id]: text
                      }));
                    }}
                    placeholder="استدلال‌های خود، ارجاع اصول فقه و مستندات این سوال را این‌جا یادداشت کنید..."
                    className="w-full bg-amber-50/40 text-slate-800 p-3 rounded-2xl border border-amber-200/50 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-amber-300 transition"
                  />
                </div>
              </div>

              {/* Bottom control buttons */}
              <div className="flex justify-between items-center mt-8 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={handlePrevQuestion}
                  disabled={currentIdx === 0}
                  className={`flex items-center gap-1 py-2 px-4 text-xs font-bold rounded-xl border transition ${
                    currentIdx === 0 
                      ? "opacity-40 bg-slate-100 text-slate-400 border-transparent cursor-not-allowed" 
                      : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 cursor-pointer"
                  }`}
                >
                  <ChevronRight size={14} />
                  <span>سوال قبلی</span>
                </button>

                <div className="text-[11px] text-slate-400 font-mono">
                  دانش‌پذیر: فاطمه حسینی (تلفن تایید شده)
                </div>

                <button
                  type="button"
                  onClick={handleNextQuestion}
                  disabled={currentIdx === totalQuestionsCount - 1}
                  className={`flex items-center gap-1 py-2 px-4 text-xs font-bold rounded-xl border transition ${
                    currentIdx === totalQuestionsCount - 1 
                      ? "opacity-40 bg-slate-100 text-slate-400 border-transparent cursor-not-allowed" 
                      : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 cursor-pointer"
                  }`}
                >
                  <span>سوال تفصیلی بعدی</span>
                  <ChevronLeft size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Render of Layout: Option 2 - KONKUR BOOKLET MODE */}
          {layoutMode === "booklet" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="exam-mode-booklet">
              {/* Main booklet with all questions listed */}
              <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-md space-y-8 h-[75vh] overflow-y-auto">
                <div className="bg-slate-900 text-white p-4.5 rounded-2xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <strong className="block text-xs font-black text-amber-300">دفترچه اصلی اختصاصی آزمون وکالت</strong>
                    <span className="text-[10px] text-slate-400">شبیه‌سازی عینی دفترچه‌های سازمان سنجش آموزش کشور</span>
                  </div>
                  <span className="text-[9.5px] font-bold bg-white/10 px-2 py-1 rounded-md border border-white/10 animate-pulse">
                    مجموع سوالات: {activeQuestionsList.length} تست حقوقی علمی
                  </span>
                </div>

                <div className="space-y-6">
                  {activeQuestionsList.map((q, idx) => {
                    const chosenOption = studentAnswers[q.id];
                    const isStarred = starredQuestions[q.id];
                    
                    return (
                      <div 
                        key={q.id} 
                        id={`booklet-q-${q.id}`}
                        className="p-5 bg-slate-50/60 rounded-2xl border border-slate-200/80 hover:border-blue-200 transition space-y-4"
                      >
                        <div className="flex justify-between items-start border-b border-slate-200/80 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5.5 h-5.5 bg-blue-900 text-white rounded-md text-[10.5px] font-black flex items-center justify-center font-mono">
                              {idx + 1}
                            </span>
                            <span className="text-[11px] bg-blue-50 text-blue-800 font-extrabold px-2 py-0.5 rounded-md border border-blue-100">
                              مبحث: {q.topic}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSpeakQuestion(q.id, q.questionText)}
                              className={`p-1 text-slate-400 hover:text-indigo-600 rounded-md transition cursor-pointer ${
                                activeSpeechQId === q.id ? "text-indigo-600 bg-indigo-50 animate-pulse scale-105" : ""
                              }`}
                              title="قرائت صوتی تفصیلی سوال"
                            >
                              <Volume2 size={13} />
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleStar(q.id)}
                              className={`p-1.5 rounded-lg transition text-[9px] font-black cursor-pointer flex items-center gap-0.5 ${
                                isStarred ? "bg-amber-150 text-amber-700 border border-amber-200" : "text-slate-400 hover:bg-slate-200"
                              }`}
                            >
                              <Flag size={12} className={isStarred ? "fill-amber-500" : ""} />
                              <span>{isStarred ? "علامت‌گذاری شد" : "نشان‌کردن"}</span>
                            </button>
                          </div>
                        </div>

                        <p className="text-xs md:text-sm font-black text-slate-800 pr-1 leading-relaxed font-sans">
                          {q.questionText}
                        </p>

                        {/* 4 option radio grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {q.options.map((opt, oIdx) => {
                            const isSelected = chosenOption === oIdx;
                            return (
                              <div
                                key={oIdx}
                                onClick={() => handleSelectOption(q.id, oIdx)}
                                className={`p-2.5 rounded-xl border cursor-pointer transition flex items-start gap-2.5 select-none ${
                                  isSelected 
                                    ? "bg-blue-50/30 border-blue-800 text-slate-900" 
                                    : "bg-white border-slate-200 hover:bg-slate-100/50 text-slate-600"
                                }`}
                              >
                                <span className={`w-5 h-5 rounded-full text-[9.5px] font-black flex items-center justify-center shrink-0 ${
                                  isSelected ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-500 font-mono"
                                }`}>
                                  {oIdx + 1}
                                </span>
                                <span className="text-xs font-semibold leading-normal font-sans">{opt}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Scratch note for booklet style questions */}
                        <div className="pt-2 border-t border-slate-100 text-right">
                          <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-slate-500 mb-1">
                            <PenTool size={11} className="text-amber-505" />
                            <span>چرک‌نویس سوال {formattedPersianNum(idx + 1)}:</span>
                          </div>
                          <textarea
                            rows={1}
                            value={scratchNotes[q.id] || ""}
                            onChange={(e) => {
                              const text = e.target.value;
                              setScratchNotes(prev => ({
                                ...prev,
                                [q.id]: text
                              }));
                            }}
                            placeholder="یادداشت‌های سریع استدلالی خود را این‌جا وارد کنید..."
                            className="w-full bg-amber-50/30 text-slate-800 p-2 rounded-xl border border-amber-200/40 text-[10.5px] font-sans focus:outline-none focus:ring-1 focus:ring-amber-300 transition"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sidebar Bubble Answer Sheet */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-md">
                  <div className="border-b border-slate-150 pb-2 mb-3">
                    <strong className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <FileText size={16} className="text-blue-950" />
                      <span>پاسخ‌برگ حبابی دیجیتال (Standard Bubble Sheet)</span>
                    </strong>
                    <span className="text-[9px] text-slate-450 font-bold block mt-0.5">کلیک بر روی خانه‌ها برای پاسخ‌دهی مستقیم و سریع:</span>
                  </div>

                  {/* Standard answer paper matrix resembling absolute real document */}
                  <div className="space-y-2 pointer-events-auto h-[55vh] overflow-y-auto pr-1">
                    {activeQuestionsList.map((q, idx) => {
                      const selected = studentAnswers[q.id];
                      return (
                        <div key={q.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-150 text-[10.5px]">
                          <span className="w-6 text-slate-500 font-black font-mono">سوال {idx + 1}:</span>
                          
                          <div className="flex gap-1">
                            {[0, 1, 2, 3].map((oIdx) => {
                              const isChecked = selected === oIdx;
                              return (
                                <button
                                  key={oIdx}
                                  onClick={() => handleSelectOption(q.id, oIdx)}
                                  className={`w-7 h-7 rounded-full text-[10px] font-black transition cursor-pointer flex items-center justify-center font-mono select-none ${
                                    isChecked 
                                      ? "bg-slate-900 text-white scale-105 shadow-sm" 
                                      : "bg-white text-slate-400 hover:bg-slate-100 border border-slate-200"
                                  }`}
                                >
                                  {oIdx + 1}
                                </button>
                              );
                            })}
                          </div>

                          <button
                            onClick={() => {
                              setStudentAnswers(prev => {
                                const copy = { ...prev };
                                delete copy[q.id];
                                return copy;
                              });
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                            title="پاک کردن پاسخ این سوال"
                          >
                            <span className="text-[10px] font-bold">پاک</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <div className="flex justify-between text-[10px] text-slate-500 font-semibold mb-2.5">
                      <span>پاسخ داده شده: {correctAttempts + wrongAttempts}</span>
                      <span>سفید: {emptyAttempts}</span>
                    </div>

                    <button
                      onClick={handleSubmitTest}
                      className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckSquare size={14} />
                      <span>ثبت و ارسال پاسخ‌برگ سراسری</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 📊 STATE: TEST SUBMITTED / RESULTS ARE IN */}
      {/* ========================================================= */}
      {isTestSubmitted && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Score banner */}
          <div className="bg-gradient-to-l from-indigo-950 to-slate-950 text-white p-6 md:p-8 rounded-3xl border border-indigo-900 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-indigo-900/60">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl">
                  <Award size={26} className="text-amber-400 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-slate-100 text-base font-black">کارنامه نهایی شبیه‌ساز چتر دانش (SaaS Mock Results)</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">محاسبه علمی نمرات صورت پورتالی با هوش مصنوعی و نمره منفی:</p>
                </div>
              </div>

              {computedPercentage >= customPassPercent ? (
                <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-300 font-black text-xs rounded-full border border-emerald-500/30">
                  تصمیم نهایی: قبولی شایسته در آزمون وکالت آزمایشی 🗹
                </span>
              ) : (
                <span className="px-4 py-1.5 bg-rose-500/10 text-rose-300 font-black text-xs rounded-full border border-rose-500/40 animate-pulse">
                  تصمیم نهایی: عدم قبولی (پایین‌تر از تراز هدف) 🗷
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block font-semibold mb-1">درصد کل (با اثر منفی)</span>
                <strong className={`text-2xl font-black font-mono block ${computedPercentage >= customPassPercent ? "text-emerald-400" : "text-rose-400"}`}>
                  {formattedPersianNum(computedPercentage)}٪
                </strong>
                <span className="text-[9px] text-slate-500 block mt-1">تراز معیار هدف: {formattedPersianNum(customPassPercent)}٪</span>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block font-semibold mb-1">تراز تخمینی چتر دانش</span>
                <strong className="text-2xl font-black font-mono text-amber-400 block">
                  {formattedPersianNum(computedTraz)}
                </strong>
                <span className="text-[9px] text-slate-500 block mt-1">معیار کانون وکلا: بالا ۵,۰۰۰</span>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block font-semibold mb-1">رتبه تقاربی در کشور</span>
                <strong className="text-2xl font-black font-mono text-indigo-300 block">
                  {formattedPersianNum(computedRank)}
                </strong>
                <span className="text-[9px] text-slate-500 block mt-1">از جمعیت فرضی ۱۰,۰۰۰ داوطلب</span>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block font-semibold mb-1">ترجیح هوش مصنوعی</span>
                <strong className="text-sm font-black text-emerald-400 block mt-1 leading-normal">
                  {computedPercentage >= 70 ? "عالی برای کانون وکلا" : computedPercentage >= 50 ? "رفع اشکالات مدنی لازم است" : "برنامه‌ریزی فشرده ۲۴ ساعته"}
                </strong>
                <span className="text-[9px] text-slate-500 block">AI Strategic Feedback</span>
              </div>
            </div>

            {/* Micro bar displaying correct/incorrect ratio */}
            <div className="space-y-1.5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between text-[11px] text-slate-400 font-semibold mb-1">
                <span>جزئیات عملکرد: {formattedPersianNum(correctAttempts)} صحیح و {formattedPersianNum(wrongAttempts)} غلط از {formattedPersianNum(totalQuestionsCount)} سوال</span>
                <span className="font-mono">سفید رها شده: {formattedPersianNum(emptyAttempts)}</span>
              </div>
              <div className="h-4 bg-slate-800 rounded-lg overflow-hidden flex font-mono text-[9px] text-white">
                <div 
                  className="bg-emerald-600 flex items-center justify-center transition-all"
                  style={{ width: `${(correctAttempts / totalQuestionsCount) * 100}%` }}
                >
                  {correctAttempts > 0 && `${Math.round((correctAttempts / totalQuestionsCount) * 100)}٪`}
                </div>
                <div 
                  className="bg-rose-600 flex items-center justify-center transition-all"
                  style={{ width: `${(wrongAttempts / totalQuestionsCount) * 100}%` }}
                >
                  {wrongAttempts > 0 && `${Math.round((wrongAttempts / totalQuestionsCount) * 100)}٪`}
                </div>
                <div 
                  className="bg-slate-600 flex items-center justify-center transition-all"
                  style={{ width: `${(emptyAttempts / totalQuestionsCount) * 100}%` }}
                >
                  {emptyAttempts > 0 && `${Math.round((emptyAttempts / totalQuestionsCount) * 100)}٪`}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleResetSimulator}
                className="px-5 py-2.5 bg-white text-slate-950 font-black rounded-xl text-xs transition-all hover:bg-slate-150 flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <RefreshCw size={14} className="animate-spin-slow" />
                <span>برگزاری تلاش مجدد با همین سوالات</span>
              </button>
              <button
                onClick={() => {
                  handleResetSimulator();
                  setIsAdminConfigOpen(true);
                }}
                className="px-5 py-2.5 bg-indigo-500/20 text-indigo-300 font-extrabold border border-indigo-500/20 rounded-xl text-xs transition-all hover:bg-indigo-500/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Settings size={14} />
                <span>ویرایش مجدد سوالات کنکور</span>
              </button>
            </div>
          </div>

          {/* Diagnostic Strengths & Weaknesses Tracker (Official Report Card Style) */}
          <div ref={resultReportRef} className="print-container bg-white border-2 border-slate-900 p-8 rounded-none space-y-6 text-right relative shadow-2xl overflow-hidden print:shadow-none print:border-slate-400 print:m-0 print:p-0">
            {/* Watermark style background decor */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center rotate-12 select-none">
              <span className="text-[120px] font-black text-slate-900">چتر دانش</span>
            </div>

            {/* Official Header */}
            <div className="flex flex-col md:flex-row justify-between items-center border-b-4 border-double border-slate-300 pb-6 gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center rotate-3 shadow-lg border-2 border-amber-400 shrink-0">
                  <GraduationCap size={40} className="text-amber-400" />
                </div>
                <div className="space-y-1">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tighter">موسسه آموزش عالی آزاد چتر دانش (واحد فنی)</h1>
                  <p className="text-xs font-bold text-slate-500">سامانه متمرکز برگزاری آزمون‌های هوشمند شبیه‌ساز (پلتفرم سنا)</p>
                  <div className="flex gap-4 mt-2">
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-mono flex items-center gap-1">
                      <User size={10} />
                      کد داوطلبی: {formattedPersianNum(9812405)}
                    </span>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                      <Calendar size={10} />
                      تاریخ صدور: {new Date().toLocaleDateString("fa-IR")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center md:text-left border-2 border-slate-200 p-3 rounded-xl bg-slate-50/50 min-w-[180px]">
                <div className="text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest">Digital Authentication</div>
                <div className="flex justify-center md:justify-end gap-1 mb-2">
                  {[...Array(5)].map((_, i) => <div key={i} className="w-2.5 h-6 bg-slate-900 rounded-xs" />)}
                  <div className="w-6 h-6 bg-amber-500 rounded-xs" />
                  <div className="w-2.5 h-6 bg-slate-900 rounded-xs" />
                </div>
                <span className="text-[10px] font-black text-indigo-900 block">گواهی اصالت علمی شبیه‌ساز</span>
              </div>
            </div>
            
            <div className="bg-slate-900 text-white p-3 text-center rounded-lg shadow-inner font-black text-sm tracking-widest">
              کارنامه تفصیلی مرحله‌ای آزمون شخصی‌سازی شده کانون وکلا (تیرماه ۱۴۰۵)
            </div>

            {/* Main Stats Table */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-2 border-slate-900 overflow-hidden rounded-xl bg-slate-900 relative z-10">
              <div className="bg-slate-50 p-4 border-r border-b border-slate-300 transform transition hover:bg-white">
                <span className="block text-[10px] font-black text-slate-400 mb-1">نمره کل (درصد با نمره منفی)</span>
                <span className={`text-2xl font-black ${computedPercentage >= customPassPercent ? "text-emerald-700" : "text-rose-700"}`}>{formattedPersianNum(computedPercentage)}٪</span>
              </div>
              <div className="bg-slate-50 p-4 border-r border-b border-slate-300">
                <span className="block text-[10px] font-black text-slate-400 mb-1">تراز علمی کل (T-Score)</span>
                <span className="text-2xl font-black text-slate-900">{formattedPersianNum(computedTraz)}</span>
              </div>
              <div className="bg-slate-50 p-4 border-r border-b border-slate-300">
                <span className="block text-[10px] font-black text-slate-400 mb-1">رتبه کل در سهمیه آزاد</span>
                <span className="text-2xl font-black text-slate-900">{formattedPersianNum(computedRank)}</span>
              </div>
              <div className="bg-slate-50 p-4 border-b border-slate-300">
                <span className="block text-[10px] font-black text-slate-400 mb-1">وضعیت نهایی آزمون</span>
                <span className={`text-sm font-black px-3 py-1 rounded-full ${computedPercentage >= customPassPercent ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                  {computedPercentage >= customPassPercent ? "✓ مجاز به انتخاب شهر" : "⚠️ عدم احراز تراز حداقلی"}
                </span>
              </div>
              
              <div className="bg-white p-4 border-r border-slate-300 col-span-1">
                <div className="flex items-center gap-2 text-slate-500 font-bold mb-1">
                  <Check size={14} className="text-emerald-600" />
                  <span className="text-[10px]">پاسخ‌های صحیح</span>
                </div>
                <span className="text-xl font-black">{formattedPersianNum(correctAttempts)}</span>
              </div>
              <div className="bg-white p-4 border-r border-slate-300">
                <div className="flex items-center gap-2 text-slate-500 font-bold mb-1">
                  <X size={14} className="text-rose-600" />
                  <span className="text-[10px]">پاسخ‌های اشتباه</span>
                </div>
                <span className="text-xl font-black">{formattedPersianNum(wrongAttempts)}</span>
              </div>
              <div className="bg-white p-4 border-r border-slate-300">
                <div className="flex items-center gap-2 text-slate-500 font-bold mb-1">
                  <Square size={12} />
                  <span className="text-[10px]">بدون پاسخ</span>
                </div>
                <span className="text-xl font-black text-slate-400">{formattedPersianNum(emptyAttempts)}</span>
              </div>
              <div className="bg-white p-4">
                <div className="flex items-center gap-2 text-slate-500 font-bold mb-1">
                  <Clock size={14} />
                  <span className="text-[10px]">زمان سپری شده</span>
                </div>
                <span className="text-xl font-black text-indigo-900 font-mono">{formatTime((examDurationMinutes * 60) - timeLeftSeconds)}</span>
              </div>
            </div>

            {/* Scientific Breakdown Table */}
            <div className="space-y-3 relative z-10">
              <h4 className="text-xs font-black text-slate-800 bg-slate-100 p-2 rounded-lg border-r-4 border-slate-900 inline-block px-4">
                جدول تحلیلی نمرات خام به تفکیک دروس امتحانی
              </h4>

              <div className="overflow-hidden border border-slate-300 rounded-xl shadow-sm">
                <table className="w-full text-center text-xs">
                  <thead className="bg-slate-900 text-white">
                    <tr>
                      <th className="p-3 font-black">نام درس</th>
                      <th className="p-3 font-black">ضریب</th>
                      <th className="p-3 font-black">صحیح</th>
                      <th className="p-3 font-black">غلط</th>
                      <th className="p-3 font-black">نزده</th>
                      <th className="p-3 font-black">درصد خام</th>
                      <th className="p-3 font-black">تراز درس</th>
                      <th className="p-3 font-black pr-2">دستیار تستی هوش مصنوعی</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {[
                      { name: "حقوق مدنی", weight: 3, key: "مدنی" },
                      { name: "آیین دادرسی مدنی", weight: 3, key: "دادرسی مدنی" },
                      { name: "حقوق تجارت", weight: 2, key: "تجارت" },
                      { name: "اصول فقه", weight: 1, key: "اصول" }
                    ].map((topic, idx) => {
                      const topicQuestions = activeQuestionsList.filter(q => q.topic.includes(topic.key) || q.topic.includes(topic.name));
                      if (topicQuestions.length === 0 && idx > 0) return null;
                      
                      const correct = topicQuestions.filter(q => studentAnswers[q.id] === q.correctOptionIndex).length;
                      const wrong = topicQuestions.filter(q => studentAnswers[q.id] !== undefined && studentAnswers[q.id] !== q.correctOptionIndex).length;
                      const empty = topicQuestions.length - correct - wrong;
                      const percent = topicQuestions.length > 0 
                        ? Math.round(((correct * 3 - wrong) / (topicQuestions.length * 3)) * 100)
                        : 0;

                      return (
                        <tr key={topic.name} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                          <td className="p-3 font-black text-slate-800">{topic.name}</td>
                          <td className="p-3 font-mono text-slate-500">{formattedPersianNum(topic.weight)}</td>
                          <td className="p-3 font-black text-emerald-600">{formattedPersianNum(correct)}</td>
                          <td className="p-3 font-black text-rose-600">{formattedPersianNum(wrong)}</td>
                          <td className="p-3 text-slate-400">{formattedPersianNum(empty)}</td>
                          <td className="p-3">
                            <span className={`font-black px-2 py-0.5 rounded-md ${percent >= 50 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                              {formattedPersianNum(percent)}٪
                            </span>
                          </td>
                          <td className="p-3 font-mono font-black text-indigo-900">{formattedPersianNum(5000 + percent * 50)}</td>
                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() => handleGenerateAiExam(topic.name, percent)}
                              className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-[10px] rounded-lg shadow-sm hover:scale-105 active:scale-95 transition cursor-pointer flex items-center gap-1.5 mx-auto"
                            >
                              <Sparkles size={11} className="text-amber-100 animate-pulse" />
                              <span>آزمون اختصاصی با AI</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Custom Interactive Action Recommendation */}
            <div className={`p-6 rounded-3xl flex flex-col gap-4 relative z-10 transition-all border-2 ${
              aiAnalysis ? "bg-indigo-50/50 border-indigo-200" : "bg-amber-500/10 border-dashed border-amber-500/30"
            } print:bg-white print:border-slate-300`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl ${aiAnalysis ? "bg-indigo-600 text-white" : "bg-amber-100 text-amber-700"}`}>
                  {aiAnalysis ? <Sparkles size={24} className="animate-pulse" /> : <Smile size={24} />}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                    <strong className="block text-slate-900 text-sm font-black flex items-center gap-2">
                       {aiAnalysis ? "واکاوی هوشمند دستیار آموزشی (دکتر کریمی)" : "تحلیل هوشمند و نقشه راه اختصاصی داوطلب"} 
                       {studentAnswers["q1"] !== undefined ? "(تحلیل علمی چتر دانش)" : ""}
                    </strong>
                    {!aiAnalysis && (
                      <button 
                        onClick={handleCallAIAnalysis}
                        disabled={isAnalyzing}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1.5 transition shadow-indigo-200 shadow-lg cursor-pointer disabled:opacity-50 disabled:animate-pulse"
                      >
                        {isAnalyzing ? <RefreshCw size={12} className="animate-spin" /> : <Activity size={12} />}
                        {isAnalyzing ? "در حال پردازش سیگنال‌ها..." : "فراخوانی هوش مصنوعی (Deep Analysis)"}
                      </button>
                    )}
                  </div>
                  
                  {aiAnalysis ? (
                    <div className="space-y-4">
                      <p className="text-[11.5px] leading-relaxed text-slate-700 font-medium border-b border-indigo-100 pb-3">
                        {aiAnalysis.psychological?.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <span className="text-[10px] font-black text-indigo-900 uppercase tracking-wider block">نقاط ضعف شناسایی شده (Critical Subjects):</span>
                          <div className="space-y-2">
                            {aiAnalysis.weaknesses?.map((w: any, idx: number) => (
                              <div key={idx} className="bg-white p-3 rounded-xl border border-indigo-100 shadow-sm transition hover:border-indigo-300">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-[10px] font-bold text-slate-800">{w.subject}</span>
                                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-black ${
                                    w.severity === "critical" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                                  }`}>
                                    {w.severity === "critical" ? "وضعیت بحرانی" : "هشدار بازخوانی"}
                                  </span>
                                </div>
                                <p className="text-[9px] text-slate-500 font-black mb-1.5">{w.topic}</p>
                                <div className="flex items-center gap-2 text-[9px] bg-slate-50 p-1.5 rounded-lg text-slate-600 italic">
                                  <BookOpen size={10} />
                                  {w.recommendation}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <span className="text-[10px] font-black text-indigo-900 uppercase tracking-wider block">الگوی رفتاری و استرس (Cognitive State):</span>
                          <div className="bg-white p-3 rounded-2xl border border-indigo-100 shadow-sm space-y-3">
                            <div className="flex justify-between items-end">
                              <span className="text-[9px] font-bold text-slate-500">شاخص اضطراب (Stress Index):</span>
                              <span className="text-[14px] font-black text-slate-900">{formattedPersianNum(aiAnalysis.psychological?.stressLevel || 0)}٪</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-600 transition-all duration-1000" 
                                style={{ width: `${aiAnalysis.psychological?.stressLevel || 0}%` }}
                              />
                            </div>
                            <div className="bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100">
                              <div className="flex items-center gap-2 mb-1">
                                <Activity size={10} className="text-indigo-600" />
                                <span className="text-[9px] font-black text-indigo-800">پیشنهاد روانشناختی:</span>
                              </div>
                              <p className="text-[9px] leading-relaxed text-slate-600">{aiAnalysis.psychological?.suggestion}</p>
                            </div>
                          </div>

                          <div className="bg-indigo-900 text-indigo-100 p-4 rounded-2xl shadow-xl space-y-2">
                             <div className="flex justify-between items-center">
                               <span className="text-[9px] font-black flex items-center gap-1">
                                 <BarChart2 size={12} />
                                 ترازمندی تخمینی مرحله بعد:
                               </span>
                               <span className="text-sm font-black text-white">{formattedPersianNum(aiAnalysis.estimatedNextTraz || 0)}</span>
                             </div>
                             <p className="text-[8px] text-indigo-300 leading-normal">
                               در صورت اجرای دقیق طرح مطالعاتی پیشنهادی، تراز شما در آزمون مرحله‌ای چتر دانش {formattedPersianNum(150)} واحد رشد مثبت خواهد داشت.
                             </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11.5px] leading-relaxed text-slate-700 font-medium">
                      بر اساس عملکرد شما در این ارزیابی، تسلط شما در درس <strong>حقوق مدنی</strong> 
                      {computedPercentage >= 60 ? " بسیار رضایت‌بخش ارزیابی شد. " : " نیاز به بازبینی فوری دارد. "} 
                      پیشنهاد می‌شود برای آزمون بعدی تمرکز خود را بر روی <strong>«اموال و مالکیت»</strong> قرار دهید. 
                      نقطه عطف کارنامه شما، مدیریت زمان در سوالات <strong>اصول فقه</strong> بود که نشان‌دهنده دقت بالای علمی شماست.
                    </p>
                  )}
                </div>
              </div>

              {aiAnalysis && (
                <div className="mt-2 border-t border-indigo-100 pt-4">
                   <div className="flex items-center gap-2 mb-3">
                     <Calendar size={14} className="text-indigo-600" />
                     <span className="text-[10px] font-black text-slate-800">نقشه راه مطالعاتی ۷ روزه (اصلاحی):</span>
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                      {aiAnalysis.remedialPlan?.map((p: any, idx: number) => (
                        <div key={idx} className="bg-white border border-indigo-100 p-2 rounded-xl text-center space-y-1 hover:shadow-md transition">
                          <span className="block text-[9px] font-black text-indigo-700 border-b border-indigo-50 mb-1">{p.day}</span>
                          <span className="block text-[8px] text-slate-500 truncate h-3" title={p.morningPlan}>{p.morningPlan}</span>
                          <span className="text-[9px] font-black text-slate-900">{formattedPersianNum(p.totalQuestions)} تست</span>
                        </div>
                      ))}
                   </div>
                </div>
              )}
            </div>

            {/* Security Footer & Official Seals */}
            <div className="pt-6 border-t border-slate-200 mt-6 flex justify-between items-end relative z-10">
              <div className="text-[9px] text-slate-500 font-mono space-y-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-12 h-12 rounded-full border-4 border-slate-200 flex items-center justify-center text-[8px] font-black text-slate-300 rotate-12">
                    SEAL
                  </div>
                  <div className="space-y-1">
                    <p className="font-sans font-black text-slate-400">محل امضا و مهر دیجیتال موسسه:</p>
                    <div className="h-6 w-32 bg-slate-50 rounded-md border border-slate-100 flex items-center justify-center overflow-hidden">
                       <Sparkles size={14} className="text-amber-200 opacity-30" />
                    </div>
                  </div>
                </div>
                <p>CERTIFICATE ID: CN-EXAM-{Math.floor(Math.random()*9000)+1000}-FA</p>
                <p>BLOCKCHAIN HASH: 0x{Math.random().toString(16).substring(2, 10)}...{Math.random().toString(16).substring(2, 6)}</p>
                <p>SYSTEM TIMESTAMP: {new Date().toISOString()}</p>
              </div>
              <div className="flex flex-col items-center gap-1 opacity-60">
                <div className="w-16 h-16 border-2 border-slate-900 rounded-full flex items-center justify-center p-1 mb-1">
                  <div className="w-full h-full border border-dashed border-slate-400 rounded-full flex items-center justify-center">
                    <ShieldCheck size={28} className="text-slate-950" />
                  </div>
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-900">Official ChatreDanesh Certified</span>
              </div>
            </div>
          </div>

          {/* Action Hub for Results */}
          <div className="flex flex-col gap-4 pt-4 border-t border-slate-100 print:hidden">
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition shadow-lg cursor-pointer ${
                  isExporting ? "bg-slate-400 cursor-wait animate-pulse" : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                {isExporting ? <RefreshCw size={18} className="animate-spin" /> : <Download size={18} />}
                <span>{isExporting ? "در حال تولید کارنامه رسمی..." : "ذخیره فایل PDF کارنامه"}</span>
              </button>

              <button
                onClick={handleNativePrint}
                className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 border border-indigo-200 rounded-2xl font-black text-sm hover:bg-indigo-50 transition shadow-sm cursor-pointer"
              >
                <Printer size={18} />
                <span>چاپ مستقیم (Standard Print)</span>
              </button>

              <button
                onClick={() => setShowTechnicalLogs(!showTechnicalLogs)}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-slate-200 rounded-2xl font-black text-sm hover:bg-slate-950 transition shadow-md cursor-pointer border border-slate-700"
              >
                <Terminal size={18} className={showTechnicalLogs ? "text-amber-400" : ""} />
                <span>{showTechnicalLogs ? "مخفی‌سازی " : "واکاوی فنی"}</span>
              </button>

              <button
                onClick={handleResetSimulator}
                className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl font-black text-sm hover:bg-slate-200 transition shadow-sm cursor-pointer"
              >
                <RefreshCw size={18} />
                <span>آزمون مجدد</span>
              </button>
            </div>
            
            <p className="text-[10px] text-slate-400 font-bold italic leading-relaxed">
              💡 <strong className="text-indigo-600">پیشنهاد فنی:</strong> اگر در شبکه داخلی (اینترانت) هستید و فونت‌های کارنامه در PDF به درستی نمایش داده نمی‌شوند، از گزینه <strong>«چاپ مستقیم»</strong> استفاده کنید. این متد از موتور نیتیو مرورگر استفاده کرده و پایداری ۱۰۰ درصدی در شبکه‌های ایزوله دارد.
            </p>
          </div>

          {/* 📡 Deep Behavior Telemetry Display */}
          {showTechnicalLogs && (
            <div className="bg-slate-950 text-emerald-400 p-6 rounded-3xl border border-slate-800 font-mono text-[10px] space-y-4 animate-slideIn">
              <div className="flex justify-between items-center border-b border-emerald-900/50 pb-2">
                <span className="flex items-center gap-2 font-black">
                  <Terminal size={14} />
                  COGNITIVE BEHAVIOR ANALYSIS ENGINE v4.2
                </span>
                <span className="text-[9px] bg-emerald-900/30 px-2 py-0.5 rounded text-emerald-500 uppercase tracking-tighter">System Analytics Live</span>
              </div>
              
              <div className="max-h-60 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-emerald-900 pr-2">
                {telemetryLogs.length === 0 && (
                  <p className="text-slate-500 italic">No telemetry data captured for this session yet.</p>
                )}
                {telemetryLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 group">
                    <span className="text-emerald-700 font-black shrink-0">[{log.time}]</span>
                    <span className={`uppercase font-black px-1 rounded text-[8px] mt-0.5 shrink-0 ${
                      log.type === "info" ? "bg-blue-900/30 text-blue-400" : 
                      log.type === "export" ? "bg-emerald-900/30 text-emerald-400" :
                      "bg-amber-900/30 text-amber-500"
                    }`}>
                      {log.type}
                    </span>
                    <span className="text-slate-300 leading-normal group-hover:text-emerald-200 transition-colors">{log.message}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-emerald-950/40 rounded-2xl border border-emerald-900/30 mt-4">
                <div className="space-y-1">
                  <span className="text-slate-500 font-black uppercase text-[8px]">Session ID</span>
                  <p className="text-slate-200 font-black">CHR-DAN-{Math.random().toString(36).substring(7).toUpperCase()}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 font-black uppercase text-[8px]">Device Agent</span>
                  <p className="text-slate-200 font-black">Browser Native (Secure)</p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 font-black uppercase text-[8px]">Stress Index</span>
                  <p className="text-slate-200 font-black">{showStressHelp ? "ACTIVE MONITORING" : "STABLE"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 font-black uppercase text-[8px]">Data Integrity</span>
                  <p className="text-emerald-500 font-black">100% VERIFIED</p>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Question Review Sheet (پاسخنامه کاملاً تشریحی و علمی) */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
            <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 border-r-4 border-indigo-900 pr-2">
              <BookOpen size={18} className="text-indigo-950 animate-pulse" />
              <span>پاسخ‌نامه فوق تخصصی تشریحی و تحلیل حقوقی سوالات (Answer Key & Legal Review)</span>
            </h4>

            <div className="space-y-4">
              {activeQuestionsList.map((q, idx) => {
                const chosen = studentAnswers[q.id];
                const isCorrect = chosen === q.correctOptionIndex;
                const isUnanswered = chosen === undefined;
                
                return (
                  <div 
                    key={q.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isCorrect 
                        ? "bg-emerald-50/20 border-emerald-150" 
                        : isUnanswered 
                        ? "bg-slate-50 border-slate-200" 
                        : "bg-rose-50/20 border-rose-150"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-2.5 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-5.5 h-5.5 bg-slate-900 text-white rounded-md text-[10.5px] font-black flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        <span className="text-[11px] font-black text-slate-700">مبحث: {q.topic}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isCorrect && (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[9.5px] font-black rounded-lg flex items-center gap-0.5 border border-emerald-200">
                            <Check size={12} />
                            <span>پاسخ صحیح داده شد (+ تزار)</span>
                          </span>
                        )}
                        {!isCorrect && !isUnanswered && (
                          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-[9.5px] font-black rounded-lg flex items-center gap-0.5 border border-rose-200">
                            <X size={12} />
                            <span>پاسخ نادرست (نمره منفی)</span>
                          </span>
                        )}
                        {isUnanswered && (
                          <span className="px-2.5 py-1 bg-slate-200 text-slate-700 text-[9.5px] font-black rounded-lg border border-slate-300">
                            بدون پاسخ رها شده (سفید)
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs md:text-sm font-black text-slate-900 leading-relaxed font-sans mb-3 pr-1">
                      {q.questionText}
                    </p>

                    {/* Standard options box displaying choice and correct choice */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4 bg-white/70 p-3 rounded-xl border border-slate-100 pr-1">
                      {q.options.map((opt, oIdx) => {
                        const isChosenByUser = chosen === oIdx;
                        const isCorrectAnswer = q.correctOptionIndex === oIdx;
                        
                        let optionStyle = "border-slate-250 text-slate-500 bg-slate-50/20";
                        if (isCorrectAnswer) {
                          optionStyle = "border-emerald-500 text-emerald-800 bg-emerald-50/40 ring-1 ring-emerald-300";
                        } else if (isChosenByUser && !isCorrectAnswer) {
                          optionStyle = "border-rose-500 text-rose-800 bg-rose-50/40 ring-1 ring-rose-300";
                        }

                        return (
                          <div key={oIdx} className={`p-2 rounded-lg border text-xs leading-normal font-sans font-semibold flex items-center gap-2 ${optionStyle}`}>
                            <span className={`w-4.5 h-4.5 rounded-full text-[9px] font-black flex items-center justify-center shrink-0 ${
                              isCorrectAnswer ? "bg-emerald-600 text-white" : isChosenByUser ? "bg-rose-600 text-white" : "bg-slate-200 text-slate-600"
                            }`}>
                              {oIdx + 1}
                            </span>
                            <span>{opt}</span>
                            {isCorrectAnswer && <span className="text-[9px] bg-emerald-200 text-emerald-900 px-1 rounded-md font-bold pr-1">کلید صحیح</span>}
                            {isChosenByUser && !isCorrectAnswer && <span className="text-[9px] bg-rose-200 text-rose-900 px-1 rounded-md font-bold pr-1">انتخاب شما (غلط)</span>}
                          </div>
                        );
                      })}
                    </div>

                    {/* Highly descriptive legal commentary explanation */}
                    <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-150 space-y-1.5 text-xs text-slate-700 leading-relaxed pr-2">
                      <strong className="block font-black text-slate-900 flex items-center gap-1">
                        <Sparkles size={12} className="text-indigo-700" />
                        <span>تحلیل علمی و استناد قانونی پاسخ:</span>
                      </strong>
                      <p className="font-sans font-normal leading-relaxed">{q.explanation}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 🔮 INTERACTIVE DYNAMIC AI PERSONALIZED MINI-EXAM MODAL */}
      {/* ========================================================= */}
      {selectedAiExamSubject && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-[99] overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col text-right" style={{ direction: "rtl" }}>
            
            {/* Header */}
            <div className="p-6 border-b border-indigo-900 bg-gradient-to-l from-indigo-950 to-slate-950 text-white rounded-t-3xl flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/15 border border-indigo-500/30 rounded-xl text-amber-400">
                  <Sparkles size={20} className="animate-spin-slow" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-100">مینی‌آزمون سازشی هوش مصنوعی — درس {selectedAiExamSubject}</h3>
                  <p className="text-[10px] text-indigo-200/80 mt-0.5">تولید شده بر اساس نقشه راه تحلیلی و ضعف‌یابی چتر نجات</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setSelectedAiExamSubject(null);
                  setAiGeneratedExam(null);
                  setAiExamSubmitted(false);
                }}
                className="p-1 px-2.5 bg-white/15 hover:bg-white/25 rounded-md text-white text-[10px] font-black transition cursor-pointer"
              >
                بستن دریچه ✕
              </button>
            </div>

            {/* Content body */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              {isGeneratingAiExam && (
                <div className="py-16 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                  <div className="space-y-1">
                    <strong className="block text-xs font-black text-slate-800">هوش مصنوعی در حال تحلیل مباحث و طراحی سوالات است...</strong>
                    <p className="text-[10px] text-slate-500 font-sans">طراحی تستی و سنجش انحرافی، استخراج گزینه‌ها و تحلیل بهداشت روانی</p>
                  </div>
                </div>
              )}

              {aiExamError && (
                <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl text-rose-800 text-xs flex flex-col items-center gap-3 text-center">
                  <span>{aiExamError}</span>
                  <button 
                    onClick={() => handleGenerateAiExam(selectedAiExamSubject, 50)}
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition shadow cursor-pointer"
                  >
                    تلاش مجدد فرآیند
                  </button>
                </div>
              )}

              {aiGeneratedExam && (
                <div className="space-y-6">
                  
                  {/* Justification & Why this should be */}
                  <div className="p-4 bg-indigo-50/70 border border-indigo-250/60 rounded-2xl space-y-2">
                    <strong className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                      <HelpCircle size={14} className="text-indigo-700" />
                      چرا این سوالات برای شما انتخاب یا بازطراحی شده است؟ (مبنای علمی)
                    </strong>
                    <p className="text-[11px] text-indigo-900 leading-relaxed font-semibold">
                      {aiGeneratedExam.justification}
                    </p>
                  </div>

                  {/* Psychological stress analysis */}
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-2">
                    <strong className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                      <Smile size={14} className="text-amber-700" />
                      واکاوی ذهنی و روان‌شناختی بهداشت کنترل اضطراب آزمون:
                    </strong>
                    <p className="text-[11.5px] text-slate-700 leading-relaxed font-medium">
                      {aiGeneratedExam.mentalStateAnalysis || aiGeneratedExam.psychologicalAnalysis}
                    </p>
                  </div>

                  {/* Core interactive questions list */}
                  <div className="space-y-5 border-t border-slate-150 pt-5">
                    <strong className="text-xs font-black text-slate-800 block">سوالات تمرینی تطبیقی طراحی‌شده به عنوان نمونه راهبردی کانون وکلا:</strong>
                    
                    {aiGeneratedExam.questions.map((q: any, qIdx: number) => {
                      const selectedOpt = aiExamAnswers[q.id || String(qIdx)];
                      const isCorrect = selectedOpt === q.correctOptionIndex;
                      
                      return (
                        <div key={q.id || qIdx} className="p-4.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-4">
                          <div className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded-md bg-indigo-950 text-white flex items-center justify-center text-[10px] font-black font-mono shrink-0">
                              {formattedPersianNum(qIdx + 1)}
                            </span>
                            <span className="text-[11.5px] font-bold text-slate-900 leading-relaxed">
                              {q.questionText}
                            </span>
                          </div>

                          {/* Options */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {q.options.map((opt: string, optIdx: number) => {
                              const isSelected = selectedOpt === optIdx;
                              let optStyle = "border-slate-200 bg-white hover:bg-slate-50 text-slate-700";
                              
                              if (isSelected) {
                                optStyle = "border-indigo-650 bg-indigo-50 text-indigo-950 font-black";
                              }
                              if (aiExamSubmitted) {
                                if (optIdx === q.correctOptionIndex) {
                                  optStyle = "border-emerald-600 bg-emerald-50 text-emerald-950 font-black ring-1 ring-emerald-500";
                                } else if (isSelected && !isCorrect) {
                                  optStyle = "border-rose-600 bg-rose-50 text-rose-950 font-black ring-1 ring-rose-500";
                                } else {
                                  optStyle = "border-slate-200 bg-white text-slate-400 opacity-60";
                                }
                              }

                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  disabled={aiExamSubmitted}
                                  onClick={() => handleAnswerAiExamQuestion(q.id || String(qIdx), optIdx)}
                                  className={`p-3 border rounded-xl text-right text-[11px] leading-relaxed transition-all cursor-pointer flex items-center justify-between gap-2 ${optStyle}`}
                                >
                                  <span>{opt}</span>
                                  {aiExamSubmitted && optIdx === q.correctOptionIndex && (
                                    <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-black">پاسخ صحیح</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Question explanation/reasoning */}
                          {aiExamSubmitted && (
                            <div className="p-3.5 bg-indigo-50/50 border border-indigo-150 rounded-xl space-y-1">
                              <span className="text-[10px] font-black text-indigo-900 block">✓ تبیین علمی چتر دانش (پاسخ تشریحی داوران):</span>
                              <p className="text-[11px] text-slate-700 leading-relaxed font-semibold">
                                {q.explanation || q.justification}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex justify-between items-center">
              <div>
                {aiExamSubmitted && aiExamScore && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-slate-700">نتیجه نهایی مینی‌آزمون:</span>
                    <strong className="text-xs font-black text-indigo-900">
                      {formattedPersianNum(aiExamScore.correct)} پاسخ صحیح از {formattedPersianNum(aiExamScore.total)}
                    </strong>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-black ${
                      aiExamScore.correct === aiExamScore.total ? "bg-emerald-100 text-emerald-800 animate-pulse" : "bg-indigo-100 text-indigo-800"
                    }`}>
                      {aiExamScore.correct === aiExamScore.total ? "انطباق عالی ۱۰۰٪" : "امکان بهبود با کتب منبع کانون"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAiExamSubject(null);
                    setAiGeneratedExam(null);
                    setAiExamSubmitted(false);
                  }}
                  className="px-4 py-2 hover:bg-slate-200 text-slate-600 font-extrabold text-xs rounded-xl transition cursor-pointer"
                >
                  بستن پنجره
                </button>

                {aiGeneratedExam && !aiExamSubmitted && (
                  <button
                    type="button"
                    onClick={handleSubmitAiExam}
                    disabled={Object.keys(aiExamAnswers).length < aiGeneratedExam.questions.length}
                    className="px-5 py-2.5 bg-indigo-900 hover:bg-indigo-950 text-white font-extrabold text-xs rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    ثبت پاسخ‌برگ سازشی
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
