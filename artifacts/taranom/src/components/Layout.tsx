import { Link, useLocation } from "wouter";
import { BarChart2, BookOpen, ClipboardList, Home, LogOut, Settings } from "lucide-react";
import { clearStoredStudent, getStoredStudent } from "@/lib/auth";

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/dashboard", label: "داشبورد", icon: Home },
  { href: "/record/new", label: "ثبت وضعیت", icon: ClipboardList },
  { href: "/exam", label: "آزمون", icon: BookOpen },
  { href: "/stats", label: "آمار", icon: BarChart2 },
];

export default function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const student = getStoredStudent();

  function handleLogout() {
    clearStoredStudent();
    setLocation("/");
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-60 bg-sidebar border-l border-sidebar-border flex flex-col fixed h-full z-10 shadow-sm">
        <div className="p-5 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-primary">ترنم مهر</h1>
          <p className="text-xs text-muted-foreground mt-0.5">سیستم پایش سلامت تحصیلی</p>
        </div>

        {student && (
          <div className="px-5 py-3 border-b border-sidebar-border">
            <p className="text-sm font-medium text-foreground truncate">{student.fullName}</p>
            <p className="text-xs text-muted-foreground">{student.nationalCode}</p>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = location === href || location.startsWith(href + "/");
            return (
              <Link key={href} href={href}>
                <a
                  data-testid={`nav-${href.replace("/", "")}`}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </a>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-1">
          <Link href="/admin">
            <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors">
              <Settings className="w-4 h-4" />
              پنل ادمین
            </a>
          </Link>
          <button
            onClick={handleLogout}
            data-testid="button-logout"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-sidebar-accent transition-colors"
          >
            <LogOut className="w-4 h-4" />
            خروج
          </button>
        </div>
      </aside>

      <main className="flex-1 mr-60 min-h-screen">
        <div className="max-w-4xl mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
