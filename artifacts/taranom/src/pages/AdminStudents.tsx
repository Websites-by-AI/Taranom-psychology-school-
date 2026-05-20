import { useState } from "react";
import { Link } from "wouter";
import { useListStudents } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { ArrowRight, Users } from "lucide-react";

export default function AdminStudents() {
  const { data: students, isLoading } = useListStudents();
  const [search, setSearch] = useState("");

  const filtered = (students ?? []).filter(
    (s) =>
      s.fullName.includes(search) ||
      s.nationalCode.includes(search) ||
      (s.grade ?? "").includes(search)
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-card-border px-6 py-4 flex items-center gap-3">
        <Link href="/admin/dashboard">
          <a className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowRight className="w-5 h-5" />
          </a>
        </Link>
        <h1 className="text-lg font-bold text-foreground">مدیریت دانش‌آموزان</h1>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <Input
          placeholder="جستجو بر اساس نام، کد ملی یا پایه..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-testid="input-search-students"
        />

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">دانش‌آموزی یافت نشد</p>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-card-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-right py-3 px-4 font-medium text-foreground">نام</th>
                  <th className="text-right py-3 px-4 font-medium text-foreground">کد ملی</th>
                  <th className="text-right py-3 px-4 font-medium text-foreground">پایه</th>
                  <th className="text-right py-3 px-4 font-medium text-foreground">مدرسه</th>
                  <th className="text-right py-3 px-4 font-medium text-foreground">تاریخ ثبت</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} data-testid={`row-student-${s.id}`} className="border-t border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground">{s.fullName}</td>
                    <td className="py-3 px-4 text-muted-foreground">{s.nationalCode}</td>
                    <td className="py-3 px-4 text-muted-foreground">{s.grade ?? "—"}</td>
                    <td className="py-3 px-4 text-muted-foreground">{s.schoolName ?? "—"}</td>
                    <td className="py-3 px-4 text-muted-foreground">{new Date(s.createdAt).toLocaleDateString("fa-IR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
