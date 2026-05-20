import { useState } from "react";
import { useGenerateExam, useSubmitExam } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, CheckCircle, XCircle } from "lucide-react";
type Question = {
  id: number;
  subject: string;
  topic?: string | null;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
};

type ExamResult = {
  sessionId: string;
  totalQuestions: number;
  correctCount: number;
  score: number;
  subjectBreakdown: { subject: string; total: number; correct: number }[];
};

function generateSessionId(): string {
  const random = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);
  return `session-${Date.now()}-${random}`;
}

export default function Exam() {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [sessionId] = useState(generateSessionId());
  const [result, setResult] = useState<ExamResult | null>(null);
  const [started, setStarted] = useState(false);

  const generateExam = useGenerateExam();
  const submitExam = useSubmitExam();

  function handleStart() {
    generateExam.mutate(
      { data: {} },
      {
        onSuccess: (qs) => {
          if (qs.length === 0) {
            toast({ title: "بانک سوالی موجود نیست", description: "ادمین باید سوالات اضافه کند.", variant: "destructive" });
            return;
          }
          setQuestions(qs);
          setStarted(true);
          setCurrentIdx(0);
          setAnswers({});
        },
        onError: () => toast({ title: "خطا در دریافت سوالات", variant: "destructive" }),
      }
    );
  }

  function handleAnswer(option: string) {
    const q = questions[currentIdx];
    setAnswers((prev) => ({ ...prev, [q.id]: option }));
  }

  function handleNext() {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
    }
  }

  function handlePrev() {
    if (currentIdx > 0) setCurrentIdx((i) => i - 1);
  }

  function handleSubmit() {
    const answerList = Object.entries(answers).map(([qid, chosen]) => ({
      questionId: parseInt(qid, 10),
      chosen,
    }));

    submitExam.mutate(
      { data: { sessionId, answers: answerList } },
      {
        onSuccess: (res) => setResult(res),
        onError: () => toast({ title: "خطا در ثبت آزمون", variant: "destructive" }),
      }
    );
  }

  const currentQ = questions[currentIdx];
  const options: { key: string; text: string }[] = currentQ
    ? [
        { key: "A", text: currentQ.optionA },
        { key: "B", text: currentQ.optionB },
        { key: "C", text: currentQ.optionC },
        { key: "D", text: currentQ.optionD },
      ]
    : [];

  if (result) {
    return (
      <Layout>
        <div className="max-w-xl space-y-5">
          <div className="bg-card rounded-2xl border border-card-border p-8 text-center">
            <div className="text-5xl font-bold text-primary mb-2">{result.score.toFixed(0)}٪</div>
            <p className="text-lg font-semibold text-foreground">{result.correctCount} از {result.totalQuestions} سوال درست</p>
            <p className="text-sm text-muted-foreground mt-1">آزمون تطبیقی</p>
          </div>

          <div className="bg-card rounded-2xl border border-card-border p-5">
            <h2 className="font-semibold text-foreground mb-3">نتیجه به تفکیک درس</h2>
            <div className="space-y-2">
              {result.subjectBreakdown.map((s) => (
                <div key={s.subject} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{s.subject}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{s.correct}/{s.total}</span>
                    {s.correct === s.total ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={() => { setResult(null); setStarted(false); setQuestions([]); }}>
            آزمون جدید
          </Button>
        </div>
      </Layout>
    );
  }

  if (!started) {
    return (
      <Layout>
        <div className="max-w-md text-center space-y-5">
          <div className="bg-card rounded-2xl border border-card-border p-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">آزمون تطبیقی</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              ۱۰ سوال بر اساس نقاط ضعف تحصیلی شما انتخاب می‌شود. دروسی که نمره کمتری دارید اولویت بالاتری خواهند داشت.
            </p>
            <Button
              className="w-full mt-6 h-12 text-base"
              onClick={handleStart}
              disabled={generateExam.isPending}
              data-testid="button-start-exam"
            >
              {generateExam.isPending ? "در حال آماده‌سازی..." : "شروع آزمون"}
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-xl space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">
            سوال {currentIdx + 1} از {questions.length}
          </h1>
          <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
            {currentQ?.subject}
          </span>
        </div>

        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          />
        </div>

        <div className="bg-card rounded-2xl border border-card-border p-6">
          <p className="text-base font-medium text-foreground leading-relaxed mb-5">{currentQ?.text}</p>

          <div className="space-y-2">
            {options.map(({ key, text }) => {
              const selected = answers[currentQ?.id] === key;
              return (
                <button
                  key={key}
                  onClick={() => handleAnswer(key)}
                  data-testid={`option-${key}`}
                  className={`w-full text-right px-4 py-3 rounded-xl border text-sm transition-all ${
                    selected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  <span className="font-bold ml-2">{key})</span> {text}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={handlePrev} disabled={currentIdx === 0} className="flex-1">
            قبلی
          </Button>
          {currentIdx < questions.length - 1 ? (
            <Button onClick={handleNext} disabled={!answers[currentQ?.id]} className="flex-1">
              بعدی
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitExam.isPending || Object.keys(answers).length < questions.length}
              className="flex-1"
              data-testid="button-submit-exam"
            >
              {submitExam.isPending ? "در حال ثبت..." : "پایان و مشاهده نتیجه"}
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          {Object.keys(answers).length} از {questions.length} سوال پاسخ داده شده
        </p>
      </div>
    </Layout>
  );
}
