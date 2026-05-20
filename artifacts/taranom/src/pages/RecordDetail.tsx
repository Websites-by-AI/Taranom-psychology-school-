import { useParams } from "wouter";
import { useGetRecord, useGetAnalysis, useRunAnalysis, getGetAnalysisQueryKey } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import RiskBadge from "@/components/RiskBadge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Brain, Moon, Target, Users, BookOpen } from "lucide-react";

function InfoRow({ label, value }: { label: string; value: string | number | boolean | null | undefined }) {
  if (value == null) return null;
  const displayVal = typeof value === "boolean" ? (value ? "بله" : "خیر") : String(value);
  return (
    <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{displayVal}</span>
    </div>
  );
}

function AnalysisSection({ title, content, color }: { title: string; content: string | null | undefined; color: string }) {
  if (!content) return null;
  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <h3 className="font-semibold text-foreground mb-2 text-sm">{title}</h3>
      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{content}</p>
    </div>
  );
}

export default function RecordDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0", 10);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: record, isLoading: recordLoading } = useGetRecord(id, {
    query: { enabled: !!id, queryKey: getGetAnalysisQueryKey(id) },
  });

  const { data: analysis, isLoading: analysisLoading } = useGetAnalysis(id, {
    query: { enabled: !!id, queryKey: getGetAnalysisQueryKey(id) },
  });

  const runAnalysis = useRunAnalysis();

  function handleRunAnalysis() {
    runAnalysis.mutate(
      { data: { recordId: id } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetAnalysisQueryKey(id) });
          toast({ title: "تحلیل انجام شد" });
        },
        onError: () => {
          toast({ title: "خطا در تحلیل", variant: "destructive" });
        },
      }
    );
  }

  if (recordLoading) {
    return (
      <Layout>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}
        </div>
      </Layout>
    );
  }

  if (!record) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">وضعیت یافت نشد</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">جزئیات وضعیت</h1>
            <p className="text-muted-foreground text-sm mt-1">{record.recordDate}</p>
          </div>
          <RiskBadge level={record.riskLevel} size="md" />
        </div>

        <div className="bg-card rounded-2xl border border-card-border p-5">
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            نمرات دروس
          </h2>
          <InfoRow label="ریاضی" value={record.mathScore != null ? `${record.mathScore}/۲۰` : null} />
          <InfoRow label="فیزیک" value={record.physicsScore != null ? `${record.physicsScore}/۲۰` : null} />
          <InfoRow label="شیمی" value={record.chemistryScore != null ? `${record.chemistryScore}/۲۰` : null} />
          <InfoRow label="زیست" value={record.biologyScore != null ? `${record.biologyScore}/۲۰` : null} />
        </div>

        <div className="bg-card rounded-2xl border border-card-border p-5">
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Brain className="w-4 h-4 text-secondary" />
            سلامت روان
          </h2>
          <InfoRow label="سطح اضطراب" value={record.anxietyLevel != null ? `${record.anxietyLevel}/۱۰` : null} />
          <InfoRow label="ساعت خواب" value={record.sleepHours != null ? `${record.sleepHours} ساعت` : null} />
          <InfoRow label="افت تمرکز" value={record.focusDrop} />
          <InfoRow label="تعامل اجتماعی" value={record.socialInteraction != null ? `${record.socialInteraction}/۵` : null} />
          <InfoRow label="روزهای مانده به کنکور" value={record.examDaysLeft} />
        </div>

        {record.freeText && (
          <div className="bg-card rounded-2xl border border-card-border p-5">
            <h2 className="font-semibold text-foreground mb-2">متن آزاد</h2>
            <p className="text-sm text-foreground leading-relaxed">{record.freeText}</p>
          </div>
        )}

        <div className="bg-card rounded-2xl border border-card-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              تحلیل هوشمند
            </h2>
            {!analysis && (
              <Button
                onClick={handleRunAnalysis}
                disabled={runAnalysis.isPending}
                size="sm"
                data-testid="button-run-analysis"
              >
                {runAnalysis.isPending ? "در حال تحلیل..." : "تحلیل هوشمند"}
              </Button>
            )}
          </div>

          {analysisLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}
            </div>
          ) : analysis ? (
            <div className="space-y-3">
              <AnalysisSection
                title="قوانین بالینی تشخیص داده‌شده"
                content={analysis.ruleEngineOutput}
                color="bg-blue-50 border-blue-200"
              />
              <AnalysisSection
                title="مداخلات پیشنهادی"
                content={analysis.interventionOutput}
                color="bg-green-50 border-green-200"
              />
              <AnalysisSection
                title="گزارش جامع"
                content={analysis.reportOutput}
                color="bg-amber-50 border-amber-200"
              />
              <AnalysisSection
                title="تحلیل متن آزاد"
                content={analysis.nlpOutput}
                color="bg-purple-50 border-purple-200"
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              برای دریافت تحلیل هوشمند، دکمه بالا را بزنید
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}
