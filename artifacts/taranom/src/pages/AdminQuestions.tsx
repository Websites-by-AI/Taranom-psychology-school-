import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useListQuestions, useCreateQuestion, useDeleteQuestion, getListQuestionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Plus, Trash2, BookOpen } from "lucide-react";

const questionSchema = z.object({
  subject: z.string().min(1, "درس الزامی است"),
  topic: z.string().optional(),
  difficulty: z.number().min(1).max(5).optional(),
  text: z.string().min(5, "متن سوال الزامی است"),
  optionA: z.string().min(1, "گزینه الف الزامی است"),
  optionB: z.string().min(1, "گزینه ب الزامی است"),
  optionC: z.string().min(1, "گزینه ج الزامی است"),
  optionD: z.string().min(1, "گزینه د الزامی است"),
  correctAnswer: z.enum(["A", "B", "C", "D"], { message: "گزینه صحیح را انتخاب کنید" }),
  explanation: z.string().optional(),
});

type QuestionForm = z.infer<typeof questionSchema>;

export default function AdminQuestions() {
  const { data: questions, isLoading } = useListQuestions();
  const createQuestion = useCreateQuestion();
  const deleteQuestion = useDeleteQuestion();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);

  const form = useForm<QuestionForm>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      subject: "",
      topic: "",
      difficulty: 2,
      text: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "A",
      explanation: "",
    },
  });

  function onSubmit(data: QuestionForm) {
    createQuestion.mutate(
      {
        data: {
          subject: data.subject,
          topic: data.topic || null,
          difficulty: data.difficulty ?? null,
          text: data.text,
          optionA: data.optionA,
          optionB: data.optionB,
          optionC: data.optionC,
          optionD: data.optionD,
          correctAnswer: data.correctAnswer,
          explanation: data.explanation || null,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListQuestionsQueryKey() });
          toast({ title: "سوال اضافه شد" });
          form.reset();
          setShowForm(false);
        },
        onError: () => toast({ title: "خطا در ذخیره سوال", variant: "destructive" }),
      }
    );
  }

  function handleDelete(id: number) {
    deleteQuestion.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListQuestionsQueryKey() });
          toast({ title: "سوال حذف شد" });
        },
        onError: () => toast({ title: "خطا در حذف", variant: "destructive" }),
      }
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-card-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard">
            <a className="text-muted-foreground hover:text-foreground">
              <ArrowRight className="w-5 h-5" />
            </a>
          </Link>
          <h1 className="text-lg font-bold text-foreground">بانک سوالات</h1>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          سوال جدید
        </Button>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-5">
        {showForm && (
          <div className="bg-card rounded-2xl border border-card-border p-5">
            <h2 className="font-semibold text-foreground mb-4">افزودن سوال جدید</h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="subject" render={({ field }) => (
                    <FormItem>
                      <FormLabel>درس</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="ریاضی / فیزیک / شیمی / زیست" data-testid="input-question-subject" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="topic" render={({ field }) => (
                    <FormItem>
                      <FormLabel>موضوع (اختیاری)</FormLabel>
                      <FormControl><Input {...field} placeholder="مثال: مشتق" /></FormControl>
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="text" render={({ field }) => (
                  <FormItem>
                    <FormLabel>متن سوال</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="سوال را اینجا بنویسید..." rows={3} data-testid="textarea-question-text" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-3">
                  {(["A", "B", "C", "D"] as const).map((opt) => (
                    <FormField key={opt} control={form.control} name={`option${opt}` as `optionA`} render={({ field }) => (
                      <FormItem>
                        <FormLabel>گزینه {opt}</FormLabel>
                        <FormControl><Input {...field} placeholder={`گزینه ${opt}`} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  ))}
                </div>
                <FormField control={form.control} name="correctAnswer" render={({ field }) => (
                  <FormItem>
                    <FormLabel>پاسخ صحیح</FormLabel>
                    <FormControl>
                      <select {...field} className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background" data-testid="select-correct-answer">
                        {["A", "B", "C", "D"].map((o) => <option key={o} value={o}>گزینه {o}</option>)}
                      </select>
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="explanation" render={({ field }) => (
                  <FormItem>
                    <FormLabel>توضیح (اختیاری)</FormLabel>
                    <FormControl><Textarea {...field} rows={2} placeholder="توضیح پاسخ صحیح" /></FormControl>
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="submit" disabled={createQuestion.isPending} data-testid="button-save-question">
                    {createQuestion.isPending ? "در حال ذخیره..." : "ذخیره سوال"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>انصراف</Button>
                </div>
              </form>
            </Form>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}</div>
        ) : !questions || questions.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">بانک سوالات خالی است</p>
          </div>
        ) : (
          <div className="space-y-2">
            {questions.map((q) => (
              <div key={q.id} data-testid={`card-question-${q.id}`} className="bg-card rounded-xl border border-card-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{q.subject}</span>
                      {q.topic && <span className="text-xs text-muted-foreground">{q.topic}</span>}
                    </div>
                    <p className="text-sm font-medium text-foreground line-clamp-2">{q.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">پاسخ: گزینه {q.correctAnswer}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(q.id)}
                    data-testid={`button-delete-question-${q.id}`}
                    className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
