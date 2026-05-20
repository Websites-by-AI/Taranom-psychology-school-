import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "@workspace/api-client-react";
import { setStoredStudent } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  nationalCode: z.string().length(10, "کد ملی باید ۱۰ رقم باشد").regex(/^\d+$/, "فقط عدد وارد کنید"),
  fullName: z.string().min(2, "نام کامل الزامی است").optional().or(z.literal("")),
  grade: z.string().optional(),
  schoolName: z.string().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const [isNew, setIsNew] = useState(false);
  const [checkedCode, setCheckedCode] = useState("");
  const { toast } = useToast();

  const loginMutation = useLogin();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { nationalCode: "", fullName: "", grade: "", schoolName: "" },
  });

  async function onSubmit(data: LoginForm) {
    loginMutation.mutate(
      {
        data: {
          nationalCode: data.nationalCode,
          fullName: data.fullName || null,
          grade: data.grade || null,
          schoolName: data.schoolName || null,
        },
      },
      {
        onSuccess: (result) => {
          if (result.isNew && !data.fullName) {
            setIsNew(true);
            setCheckedCode(data.nationalCode);
            return;
          }
          setStoredStudent({
            id: result.student.id,
            nationalCode: result.student.nationalCode,
            fullName: result.student.fullName,
            grade: result.student.grade,
            schoolName: result.student.schoolName,
          });
          toast({ title: "خوش آمدید", description: `${result.student.fullName} عزیز` });
          setLocation("/dashboard");
        },
        onError: () => {
          toast({ title: "خطا", description: "ورود انجام نشد. دوباره تلاش کنید.", variant: "destructive" });
        },
      }
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
            <span className="text-primary-foreground text-2xl font-bold">ت</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">ترنم مهر</h1>
          <p className="text-muted-foreground mt-2 text-sm">سیستم هوشمند پایش سلامت روان و تحصیلی</p>
        </div>

        <div className="bg-card rounded-2xl shadow-md border border-card-border p-8">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            {isNew ? "تکمیل پروفایل" : "ورود به سیستم"}
          </h2>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nationalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>کد ملی</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        data-testid="input-national-code"
                        placeholder="۱۰ رقم کد ملی"
                        maxLength={10}
                        disabled={isNew}
                        className="text-center tracking-widest text-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isNew && (
                <>
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نام و نام خانوادگی</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-full-name" placeholder="نام کامل خود را وارد کنید" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="grade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>پایه تحصیلی (اختیاری)</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-grade" placeholder="مثال: دوازدهم تجربی" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="schoolName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نام مدرسه (اختیاری)</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-school-name" placeholder="نام مدرسه یا موسسه" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </>
              )}

              <Button
                type="submit"
                data-testid="button-login"
                className="w-full mt-2"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "در حال پردازش..." : isNew ? "ثبت و ورود" : "ورود"}
              </Button>

              {isNew && (
                <button
                  type="button"
                  onClick={() => { setIsNew(false); form.reset(); }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  برگشت
                </button>
              )}
            </form>
          </Form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            برای ورود فقط به کد ملی نیاز دارید. رمز عبوری وجود ندارد.
          </p>
        </div>
      </div>
    </div>
  );
}
