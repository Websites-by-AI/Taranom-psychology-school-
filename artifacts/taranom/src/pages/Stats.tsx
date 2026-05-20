import { useGetStatsSummary, useGetRiskTrend } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import RiskBadge from "@/components/RiskBadge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend
} from "recharts";

export default function Stats() {
  const { data: stats, isLoading: statsLoading } = useGetStatsSummary();
  const { data: trend, isLoading: trendLoading } = useGetRiskTrend();

  const subjectData = [
    { name: "ریاضی", avg: stats?.avgMath ?? 0 },
    { name: "فیزیک", avg: stats?.avgPhysics ?? 0 },
    { name: "شیمی", avg: stats?.avgChemistry ?? 0 },
    { name: "زیست", avg: stats?.avgBiology ?? 0 },
  ].filter((d) => d.avg > 0);

  const riskMap: Record<string, number> = { green: 1, yellow: 2, orange: 3, red: 4 };
  const trendData = (trend ?? []).slice().reverse().map((p) => ({
    date: p.date,
    رتبه_خطر: riskMap[p.riskLevel] ?? 1,
    اضطراب: p.anxietyLevel ?? 0,
  }));

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">آمار و تحلیل</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "کل ثبت‌ها", value: stats?.totalRecords ?? 0 },
            { label: "میانگین اضطراب", value: stats?.avgAnxiety != null ? stats.avgAnxiety.toFixed(1) : "—" },
            { label: "میانگین خواب", value: stats?.avgSleep != null ? `${stats.avgSleep.toFixed(1)}h` : "—" },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-xl border border-card-border p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-primary">{String(s.value)}</p>
            </div>
          ))}
        </div>

        {stats?.lastRiskLevel && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">آخرین سطح خطر:</span>
            <RiskBadge level={stats.lastRiskLevel} size="md" />
          </div>
        )}

        {stats?.weakestSubject && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-amber-800 text-sm font-medium">
              ضعیف‌ترین درس: <span className="font-bold">{stats.weakestSubject}</span>
            </p>
          </div>
        )}

        {subjectData.length > 0 && (
          <div className="bg-card rounded-2xl border border-card-border p-5">
            <h2 className="font-semibold text-foreground mb-4">میانگین نمرات دروس</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={subjectData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: "Vazirmatn" }} />
                <YAxis domain={[0, 20]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ fontFamily: "Vazirmatn", fontSize: 12 }}
                  formatter={(v) => [`${v}/۲۰`, "میانگین"]}
                />
                <Bar dataKey="avg" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {trendData.length > 0 && (
          <div className="bg-card rounded-2xl border border-card-border p-5">
            <h2 className="font-semibold text-foreground mb-4">روند ۱۴ روزه اضطراب</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: "Vazirmatn" }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontFamily: "Vazirmatn", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontFamily: "Vazirmatn", fontSize: 12 }} />
                <Line type="monotone" dataKey="اضطراب" stroke="hsl(var(--secondary))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {subjectData.length === 0 && trendData.length === 0 && !statsLoading && !trendLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">هنوز داده‌ای برای نمایش وجود ندارد. ابتدا وضعیت‌های روزانه ثبت کنید.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
