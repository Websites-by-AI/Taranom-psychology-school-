import { Link } from "wouter";
import { useListRecords, useGetStatsSummary } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import RiskBadge from "@/components/RiskBadge";
import { getStoredStudent } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ClipboardList, BookOpen, BarChart2, Calendar, Moon, Brain } from "lucide-react";

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number | null; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-card rounded-xl border border-card-border p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-foreground">{value ?? "—"}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const student = getStoredStudent();
  const { data: records, isLoading: recordsLoading } = useListRecords({ limit: 5 });
  const { data: stats } = useGetStatsSummary();

  const today = new Date().toLocaleDateString("fa-IR");

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">سلام، {student?.fullName ?? "دانش‌آموز"}</h1>
            <p className="text-muted-foreground text-sm mt-1">{today}</p>
          </div>
          {stats?.lastRiskLevel && (
            <RiskBadge level={stats.lastRiskLevel} size="md" />
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="میانگین ریاضی" value={stats?.avgMath != null ? stats.avgMath.toFixed(1) : null} icon={Brain} color="bg-primary" />
          <StatCard label="میانگین خواب" value={stats?.avgSleep != null ? `${stats.avgSleep.toFixed(1)} ساعت` : null} icon={Moon} color="bg-secondary" />
          <StatCard label="میانگین اضطراب" value={stats?.avgAnxiety != null ? stats.avgAnxiety.toFixed(1) : null} icon={BarChart2} color="bg-chart-3" />
          <StatCard label="تعداد ثبت‌ها" value={stats?.totalRecords ?? 0} icon={Calendar} color="bg-chart-2" />
        </div>

        {stats?.weakestSubject && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-amber-800 text-sm font-medium">
              درس نیازمند توجه: <span className="font-bold">{stats.weakestSubject}</span>
            </p>
            <p className="text-amber-700 text-xs mt-1">بر اساس میانگین نمرات اخیر شما</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link href="/record/new">
            <a data-testid="button-new-record">
              <Button className="w-full h-14 text-base gap-2">
                <ClipboardList className="w-5 h-5" />
                ثبت وضعیت امروز
              </Button>
            </a>
          </Link>
          <Link href="/exam">
            <a data-testid="button-start-exam">
              <Button variant="outline" className="w-full h-14 text-base gap-2">
                <BookOpen className="w-5 h-5" />
                شروع آزمون تطبیقی
              </Button>
            </a>
          </Link>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">وضعیت‌های اخیر</h2>
          {recordsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : !records || records.length === 0 ? (
            <div className="bg-card rounded-xl border border-card-border p-8 text-center">
              <ClipboardList className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">هنوز وضعیتی ثبت نشده است</p>
              <Link href="/record/new">
                <a>
                  <Button variant="outline" className="mt-4 text-sm">اولین وضعیت را ثبت کنید</Button>
                </a>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {records.map((r) => (
                <Link key={r.id} href={`/record/${r.id}`}>
                  <a
                    data-testid={`card-record-${r.id}`}
                    className="block bg-card rounded-xl border border-card-border p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium text-foreground">{r.recordDate}</div>
                        {r.anxietyLevel && (
                          <span className="text-xs text-muted-foreground">اضطراب: {r.anxietyLevel}/۱۰</span>
                        )}
                        {r.sleepHours && (
                          <span className="text-xs text-muted-foreground">خواب: {r.sleepHours}h</span>
                        )}
                      </div>
                      <RiskBadge level={r.riskLevel} size="sm" />
                    </div>
                    {r.freeText && (
                      <p className="text-xs text-muted-foreground mt-2 truncate">{r.freeText}</p>
                    )}
                  </a>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
