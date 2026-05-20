import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateRecord, useExtractFromText } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";

const recordSchema = z.object({
  recordDate: z.string().min(1, "تاریخ الزامی است"),
  mathScore: z.number().min(0).max(20).nullable().optional(),
  physicsScore: z.number().min(0).max(20).nullable().optional(),
  chemistryScore: z.number().min(0).max(20).nullable().optional(),
  biologyScore: z.number().min(0).max(20).nullable().optional(),
  anxietyLevel: z.number().min(1).max(10).nullable().optional(),
  sleepHours: z.number().min(0).max(12).nullable().optional(),
  focusDrop: z.boolean().nullable().optional(),
  socialInteraction: z.number().min(1).max(5).nullable().optional(),
  examDaysLeft: z.number().min(0).nullable().optional(),
  freeText: z.string().nullable().optional(),
});

type RecordForm = z.infer<typeof recordSchema>;

function ScoreInput({ label, field }: { label: string; field: { value: number | null | undefined; onChange: (v: number | null) => void } }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-1.5 block">{label}</label>
      <div className="flex items-center gap-3">
        <Slider
          min={0} max={20} step={0.5}
          value={[field.value ?? 10]}
          onValueChange={([v]) => field.onChange(v)}
          className="flex-1"
        />
        <span className="text-sm font-bold text-foreground w-8 text-center">{field.value ?? "—"}</span>
      </div>
    </div>
  );
}

export default function NewRecord() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [freeTextForExtract, setFreeTextForExtract] = useState("");
  const createRecord = useCreateRecord();
  const extractText = useExtractFromText();

  const today = new Date().toISOString().split("T")[0];

  const form = useForm<RecordForm>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
      recordDate: today,
      mathScore: null,
      physicsScore: null,
      chemistryScore: null,
      biologyScore: null,
      anxietyLevel: 5,
      sleepHours: 7,
      focusDrop: false,
      socialInteraction: 3,
      examDaysLeft: null,
      freeText: "",
    },
  });

  async function onExtract() {
    const text = form.getValues("freeText") || freeTextForExtract;
    if (!text) {
      toast({ title: "متنی وارد نشده", description: "ابتدا در کادر متن آزاد بنویسید.", variant: "destructive" });
      return;
    }
    extractText.mutate(
      { data: { text } },
      {
        onSuccess: (result) => {
          if (result.anxietyLevel != null) form.setValue("anxietyLevel", result.anxietyLevel);
          if (result.sleepHours != null) form.setValue("sleepHours", result.sleepHours);
          if (result.mathScore != null) form.setValue("mathScore", result.mathScore);
          if (result.physicsScore != null) form.setValue("physicsScore", result.physicsScore);
          if (result.chemistryScore != null) form.setValue("chemistryScore", result.chemistryScore);
          if (result.biologyScore != null) form.setValue("biologyScore", result.biologyScore);
          if (result.examDaysLeft != null) form.setValue("examDaysLeft", result.examDaysLeft);
          toast({ title: "استخراج موفق", description: result.summary });
        },
        onError: () => {
          toast({ title: "خطا در استخراج", variant: "destructive" });
        },
      }
    );
  }

  function onSubmit(data: RecordForm) {
    createRecord.mutate(
      { data: { ...data, recordDate: data.recordDate } },
      {
        onSuccess: (record) => {
          toast({ title: "وضعیت ثبت شد" });
          setLocation(`/record/${record.id}`);
        },
        onError: () => {
          toast({ title: "خطا در ثبت", variant: "destructive" });
        },
      }
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">ثبت وضعیت روزانه</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-card rounded-2xl border border-card-border p-5">
              <h2 className="font-semibold text-foreground mb-4">تاریخ</h2>
              <FormField
                control={form.control}
                name="recordDate"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} type="date" data-testid="input-record-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-card rounded-2xl border border-card-border p-5 space-y-4">
              <h2 className="font-semibold text-foreground">نمرات دروس (از ۲۰)</h2>
              <FormField control={form.control} name="mathScore" render={({ field }) => (
                <ScoreInput label="ریاضی" field={field as { value: number | null | undefined; onChange: (v: number | null) => void }} />
              )} />
              <FormField control={form.control} name="physicsScore" render={({ field }) => (
                <ScoreInput label="فیزیک" field={field as { value: number | null | undefined; onChange: (v: number | null) => void }} />
              )} />
              <FormField control={form.control} name="chemistryScore" render={({ field }) => (
                <ScoreInput label="شیمی" field={field as { value: number | null | undefined; onChange: (v: number | null) => void }} />
              )} />
              <FormField control={form.control} name="biologyScore" render={({ field }) => (
                <ScoreInput label="زیست" field={field as { value: number | null | undefined; onChange: (v: number | null) => void }} />
              )} />
            </div>

            <div className="bg-card rounded-2xl border border-card-border p-5 space-y-4">
              <h2 className="font-semibold text-foreground">سلامت روان</h2>
              <FormField control={form.control} name="anxietyLevel" render={({ field }) => (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">سطح اضطراب: {field.value ?? 5}/۱۰</label>
                  <Slider min={1} max={10} step={1} value={[field.value ?? 5]} onValueChange={([v]) => field.onChange(v)} />
                </div>
              )} />
              <FormField control={form.control} name="sleepHours" render={({ field }) => (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">ساعت خواب: {field.value ?? 7} ساعت</label>
                  <Slider min={0} max={12} step={0.5} value={[field.value ?? 7]} onValueChange={([v]) => field.onChange(v)} />
                </div>
              )} />
              <FormField control={form.control} name="socialInteraction" render={({ field }) => (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">تعامل اجتماعی: {field.value ?? 3}/۵</label>
                  <Slider min={1} max={5} step={1} value={[field.value ?? 3]} onValueChange={([v]) => field.onChange(v)} />
                </div>
              )} />
              <FormField control={form.control} name="focusDrop" render={({ field }) => (
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">افت تمرکز داشتم</label>
                  <Switch checked={field.value ?? false} onCheckedChange={field.onChange} data-testid="switch-focus-drop" />
                </div>
              )} />
              <FormField control={form.control} name="examDaysLeft" render={({ field }) => (
                <FormItem>
                  <FormLabel>روزهای مانده به کنکور</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      data-testid="input-exam-days"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                      placeholder="اختیاری"
                    />
                  </FormControl>
                </FormItem>
              )} />
            </div>

            <div className="bg-card rounded-2xl border border-card-border p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-foreground">متن آزاد</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onExtract}
                  disabled={extractText.isPending}
                  data-testid="button-extract-text"
                  className="gap-2 text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {extractText.isPending ? "در حال استخراج..." : "استخراج از متن"}
                </Button>
              </div>
              <FormField control={form.control} name="freeText" render={({ field }) => (
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    data-testid="textarea-free-text"
                    placeholder="هر چیزی که در ذهن دارید بنویسید. هوش مصنوعی می‌تواند مقادیر را از متن شما استخراج کند..."
                    rows={4}
                  />
                </FormControl>
              )} />
              <p className="text-xs text-muted-foreground">پس از نوشتن، دکمه «استخراج از متن» را بزنید تا فیلدها خودکار پر شوند.</p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={createRecord.isPending}
              data-testid="button-submit-record"
            >
              {createRecord.isPending ? "در حال ثبت..." : "ثبت وضعیت"}
            </Button>
          </form>
        </Form>
      </div>
    </Layout>
  );
}
