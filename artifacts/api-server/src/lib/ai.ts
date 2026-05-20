import { logger } from "./logger";

const AI_API_URL = "https://api.gapgpt.app/v1/chat/completions";
const AI_API_KEY = process.env.AI_API_KEY ?? "";
const MODELS = ["gemini-2.5-flash", "gpt-4o"];

async function callAI(
  systemPrompt: string,
  userMessage: string,
  minLength = 1200,
  maxRetries = 3
): Promise<string> {
  for (const model of MODELS) {
    let text = "";
    let attempts = 0;

    while (attempts < maxRetries) {
      const messages: { role: string; content: string }[] = [
        { role: "system", content: systemPrompt },
      ];

      if (text) {
        messages.push({ role: "user", content: userMessage });
        messages.push({ role: "assistant", content: text });
        messages.push({ role: "user", content: "لطفاً ادامه بده. پاسخ را کامل کن." });
      } else {
        messages.push({ role: "user", content: userMessage });
      }

      try {
        const response = await fetch(AI_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AI_API_KEY}`,
          },
          body: JSON.stringify({
            model,
            messages,
            max_tokens: 2000,
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          logger.warn({ model, status: response.status, errText }, "AI API error");
          break;
        }

        const data = (await response.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const chunk = data?.choices?.[0]?.message?.content ?? "";
        text += chunk;

        if (text.length >= minLength) {
          return cleanMarkdown(text);
        }

        attempts++;
      } catch (err) {
        logger.warn({ model, err }, "AI fetch error");
        break;
      }
    }

    if (text.length > 0) {
      return cleanMarkdown(text);
    }
  }

  return "تحلیل در حال حاضر در دسترس نیست. لطفاً دوباره تلاش کنید.";
}

function cleanMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/#{1,6}\s*/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}

export interface DailyData {
  mathScore?: number | null;
  physicsScore?: number | null;
  chemistryScore?: number | null;
  biologyScore?: number | null;
  anxietyLevel?: number | null;
  sleepHours?: number | null;
  focusDrop?: boolean | null;
  socialInteraction?: number | null;
  examDaysLeft?: number | null;
  freeText?: string | null;
}

function computeRiskLevel(data: DailyData): string {
  let score = 0;

  if (data.anxietyLevel != null) {
    if (data.anxietyLevel >= 8) score += 3;
    else if (data.anxietyLevel >= 6) score += 2;
    else if (data.anxietyLevel >= 4) score += 1;
  }

  if (data.sleepHours != null) {
    if (data.sleepHours < 4) score += 3;
    else if (data.sleepHours < 6) score += 2;
    else if (data.sleepHours < 7) score += 1;
  }

  if (data.focusDrop) score += 2;

  if (data.socialInteraction != null && data.socialInteraction <= 2) score += 1;

  const scores = [data.mathScore, data.physicsScore, data.chemistryScore, data.biologyScore].filter(
    (s): s is number => s != null
  );
  if (scores.length > 0) {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avg < 8) score += 2;
    else if (avg < 12) score += 1;
  }

  if (score >= 8) return "red";
  if (score >= 5) return "orange";
  if (score >= 3) return "yellow";
  return "green";
}

function runRuleEngine(data: DailyData): string {
  const rules: string[] = [];

  if (data.anxietyLevel != null && data.anxietyLevel >= 7) {
    rules.push("اضطراب امتحان بالا: سطح اضطراب بیش از حد مجاز است.");
  }
  if (data.sleepHours != null && data.sleepHours < 6) {
    rules.push("کمبود خواب: ساعت خواب کمتر از حد لازم برای تمرکز تحصیلی است.");
  }
  if (data.focusDrop) {
    rules.push("افت تمرکز: کاهش توانایی تمرکز گزارش شده است.");
  }
  if (data.socialInteraction != null && data.socialInteraction <= 2) {
    rules.push("انزوای اجتماعی: تعاملات اجتماعی در سطح پایینی قرار دارد.");
  }

  const scores: { name: string; val: number }[] = [];
  if (data.mathScore != null) scores.push({ name: "ریاضی", val: data.mathScore });
  if (data.physicsScore != null) scores.push({ name: "فیزیک", val: data.physicsScore });
  if (data.chemistryScore != null) scores.push({ name: "شیمی", val: data.chemistryScore });
  if (data.biologyScore != null) scores.push({ name: "زیست", val: data.biologyScore });

  const weak = scores.filter((s) => s.val < 10);
  if (weak.length > 0) {
    rules.push(`افت تحصیلی در دروس: ${weak.map((s) => s.name).join("، ")}`);
  }

  if (data.examDaysLeft != null && data.examDaysLeft < 30 && data.anxietyLevel != null && data.anxietyLevel >= 6) {
    rules.push("فشار زمانی کنکور: نزدیکی امتحان همراه با اضطراب بالا.");
  }

  return rules.length > 0 ? rules.join("\n") : "وضعیت عمومی در محدوده طبیعی است.";
}

export async function analyzeRecord(data: DailyData): Promise<{
  ruleEngineOutput: string;
  interventionOutput: string;
  reportOutput: string;
  nlpOutput: string;
  riskLevel: string;
}> {
  const riskLevel = computeRiskLevel(data);
  const ruleEngineOutput = runRuleEngine(data);

  const dataStr = JSON.stringify({
    نمره_ریاضی: data.mathScore,
    نمره_فیزیک: data.physicsScore,
    نمره_شیمی: data.chemistryScore,
    نمره_زیست: data.biologyScore,
    سطح_اضطراب: data.anxietyLevel,
    ساعت_خواب: data.sleepHours,
    افت_تمرکز: data.focusDrop,
    تعامل_اجتماعی: data.socialInteraction,
    روزهای_مانده_به_کنکور: data.examDaysLeft,
    متن_آزاد: data.freeText,
    سطح_خطر: riskLevel,
    قوانین_تشخیص: ruleEngineOutput,
  });

  const [interventionOutput, reportOutput, nlpOutput] = await Promise.all([
    callAI(
      "تو یک روانشناس تحصیلی متخصص هستی. با لحن مهربان و علمی، مداخلات درمانی پیشنهاد بده.",
      `داده‌های دانش‌آموز:\n${dataStr}\n\nلطفاً ۵ تا ۷ مداخله عملی و مشخص برای بهبود وضعیت این دانش‌آموز پیشنهاد بده. هر مداخله باید قابل اجرا در زندگی روزمره باشد.`,
      1200
    ),
    callAI(
      "تو یک گزارش‌نویس تخصصی سلامت روان دانش‌آموزان هستی. گزارش‌های کامل و ساختاریافته می‌نویسی.",
      `داده‌های دانش‌آموز:\n${dataStr}\n\nیک گزارش ۵ بخشی کامل بنویس:\n1. خلاصه وضعیت\n2. تحلیل تحصیلی\n3. سلامت روان\n4. عوامل خطر\n5. توصیه‌های کلی`,
      1500
    ),
    data.freeText
      ? callAI(
          "تو یک متخصص پردازش زبان طبیعی فارسی هستی. متن را تحلیل کن.",
          `متن زیر از یک دانش‌آموز است:\n"${data.freeText}"\n\nاحساسات اصلی، نگرانی‌ها و وضعیت روانی را از این متن استخراج کن. به صورت ساختاریافته بنویس.`,
          800
        )
      : Promise.resolve("متن آزادی وارد نشده است."),
  ]);

  return {
    ruleEngineOutput,
    interventionOutput,
    reportOutput,
    nlpOutput,
    riskLevel,
  };
}

export async function extractFromText(text: string): Promise<{
  anxietyLevel?: number | null;
  sleepHours?: number | null;
  mathScore?: number | null;
  physicsScore?: number | null;
  chemistryScore?: number | null;
  biologyScore?: number | null;
  examDaysLeft?: number | null;
  summary: string;
}> {
  const prompt = `از متن زیر مقادیر عددی را استخراج کن و به صورت JSON خالص (بدون markdown) برگردان:
متن: "${text}"

فرمت JSON دقیق:
{
  "anxietyLevel": عدد 1-10 یا null,
  "sleepHours": عدد ساعت خواب یا null,
  "mathScore": نمره ریاضی 0-20 یا null,
  "physicsScore": نمره فیزیک 0-20 یا null,
  "chemistryScore": نمره شیمی 0-20 یا null,
  "biologyScore": نمره زیست 0-20 یا null,
  "examDaysLeft": روزهای مانده به کنکور یا null,
  "summary": "خلاصه یک جمله‌ای از متن"
}

فقط JSON را برگردان، بدون توضیح اضافه.`;

  const result = await callAI(
    "تو یک سیستم استخراج اطلاعات هستی. فقط JSON خالص برمی‌گردانی.",
    prompt,
    100,
    2
  );

  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as {
        anxietyLevel?: number | null;
        sleepHours?: number | null;
        mathScore?: number | null;
        physicsScore?: number | null;
        chemistryScore?: number | null;
        biologyScore?: number | null;
        examDaysLeft?: number | null;
        summary?: string;
      };
      return {
        anxietyLevel: parsed.anxietyLevel ?? null,
        sleepHours: parsed.sleepHours ?? null,
        mathScore: parsed.mathScore ?? null,
        physicsScore: parsed.physicsScore ?? null,
        chemistryScore: parsed.chemistryScore ?? null,
        biologyScore: parsed.biologyScore ?? null,
        examDaysLeft: parsed.examDaysLeft ?? null,
        summary: parsed.summary ?? "اطلاعات استخراج شد.",
      };
    }
  } catch (err) {
    logger.warn({ err }, "Failed to parse AI extraction response");
  }

  return { summary: "استخراج موفق نبود. لطفاً مقادیر را دستی وارد کنید." };
}
