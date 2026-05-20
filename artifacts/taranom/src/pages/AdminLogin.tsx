import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAdminLogin } from "@workspace/api-client-react";
import { setAdminToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";

const adminSchema = z.object({
  password: z.string().min(1, "رمز عبور الزامی است"),
});

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const adminLogin = useAdminLogin();

  const form = useForm({
    resolver: zodResolver(adminSchema),
    defaultValues: { password: "" },
  });

  function onSubmit(data: { password: string }) {
    adminLogin.mutate(
      { data: { password: data.password } },
      {
        onSuccess: (result) => {
          if (result.success) {
            setAdminToken(result.token);
            setLocation("/admin/dashboard");
          }
        },
        onError: () => {
          toast({ title: "رمز عبور اشتباه است", variant: "destructive" });
        },
      }
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-foreground rounded-2xl mb-4">
            <Shield className="w-7 h-7 text-background" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">پنل مدیریت</h1>
          <p className="text-muted-foreground text-sm mt-1">ترنم مهر</p>
        </div>

        <div className="bg-card rounded-2xl shadow-md border border-card-border p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رمز عبور مدیر</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" data-testid="input-admin-password" placeholder="رمز عبور را وارد کنید" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={adminLogin.isPending} data-testid="button-admin-login">
                {adminLogin.isPending ? "در حال ورود..." : "ورود به پنل"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
