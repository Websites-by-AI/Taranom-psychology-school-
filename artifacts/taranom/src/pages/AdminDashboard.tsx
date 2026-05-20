import { useLocation } from "wouter";
import { useGetAdminOverview } from "@workspace/api-client-react";
import { clearAdminToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Users, ClipboardList, BookOpen, Settings, LogOut, Shield } from "lucide-react";

function RiskDot({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <div className="flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${color}`} />
        <span className="text-sm text-foreground">{label}</span>
      </div>
      <span className="text-sm font-bold text-foreground">{count}</span>
    </div>
  );
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { data: overview, isLoading } = useGetAdminOverview();

  function handleLogout() {
    clearAdminToken();
    setLocation("/admin");
  }

  const navItems = [
    { href: "/admin/students", label: "مدیریت دانش‌آموزان", icon: Users },
    { href: "/admin/questions", label: "بانک سوالات", icon: BookOpen },
    { href: "/admin/settings", label: "تنظیمات", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-card-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">پنل مدیریت ترنم مهر</h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
          data-testid="button-admin-logout"
        >
          <LogOut className="w-4 h-4" />
          خروج
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h2 className="text-xl font-bold text-foreground">نمای کلی</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "کل دانش‌آموزان", value: overview?.totalStudents ?? 0, icon: Users, color: "bg-primary" },
            { label: "کل ثبت‌ها", value: overview?.totalRecords ?? 0, icon: ClipboardList, color: "bg-secondary" },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-xl border border-card-border p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {overview?.riskBreakdown && (
          <div className="bg-card rounded-2xl border border-card-border p-5">
            <h3 className="font-semibold text-foreground mb-3">توزیع سطح خطر</h3>
            <RiskDot color="bg-green-500" label="سبز" count={overview.riskBreakdown.green} />
            <RiskDot color="bg-yellow-400" label="زرد" count={overview.riskBreakdown.yellow} />
            <RiskDot color="bg-orange-400" label="نارنجی" count={overview.riskBreakdown.orange} />
            <RiskDot color="bg-red-500" label="قرمز" count={overview.riskBreakdown.red} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <a className="block bg-card rounded-xl border border-card-border p-5 hover:shadow-sm hover:border-primary/30 transition-all">
                <Icon className="w-6 h-6 text-primary mb-2" />
                <p className="font-medium text-foreground text-sm">{label}</p>
              </a>
            </Link>
          ))}
        </div>

        {overview && overview.recentStudents.length > 0 && (
          <div className="bg-card rounded-2xl border border-card-border p-5">
            <h3 className="font-semibold text-foreground mb-3">آخرین دانش‌آموزان</h3>
            <div className="space-y-2">
              {overview.recentStudents.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.fullName}</p>
                    <p className="text-xs text-muted-foreground">{s.nationalCode} {s.grade ? `· ${s.grade}` : ""}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleDateString("fa-IR")}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
