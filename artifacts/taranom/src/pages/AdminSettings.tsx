import { useEffect } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Settings } from "lucide-react";

const settingsSchema = z.object({
  aiModel: z.string().min(1),
  minResponseLength: z.number().min(500).max(5000),
  adminPassword: z.string().optional(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export default function AdminSettings() {
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      aiModel: "gemini-2.5-flash",
      minResponseLength: 1200,
      adminPassword: "",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        aiModel: settings.aiModel,
        minResponseLength: settings.minResponseLength,
        adminPassword: "",
      });
    }
  }, [settings]);

  function onSubmit(data: SettingsForm) {
    updateSettings.mutate(
      {
        data: {
          aiModel: data.aiModel,
          minResponseLength: data.minResponseLength,
          adminPassword: data.adminPassword || null,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
          toast({ title: "تنظیمات ذخیره شد" });
        },
        onError: () => toast({ title: "خطا در ذخیره", variant: "destructive" }),
      }
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-card-border px-6 py-4 flex items-center gap-3">
        <Link href="/admin/dashboard">
          <a className="text-muted-foreground hover:text-foreground">
            <ArrowRight className="w-5 h-5" />
          </a>
        </Link>
        <h1 className="text-lg font-bold text-foreground">تنظیمات سیستم</h1>
      </div>

      <div className="max-w-lg mx-auto p-6">
        <div className="bg-card rounded-2xl border border-card-border p-6">
          <div className="flex items-center gap-2 mb-5">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">تنظیمات هوش مصنوعی</h2>
          </div>

          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />)}</div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="aiModel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>مدل هوش مصنوعی</FormLabel>
                    <FormControl>
                      <select {...field} className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background" data-testid="select-ai-model">
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                        <option value="gpt-4o">GPT-4o</option>
                        <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                      </select>
                    </FormControl>
                  </FormItem>
                )} />

                <FormField control={form.control} name="minResponseLength" render={({ field }) => (
                  <FormItem>
                    <FormLabel>حداقل طول پاسخ هوش مصنوعی</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={500}
                        max={5000}
                        data-testid="input-min-response-length"
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">اگر پاسخ کوتاه‌تر باشد، تا ۳ بار تلاش مجدد می‌کند</p>
                  </FormItem>
                )} />

                <FormField control={form.control} name="adminPassword" render={({ field }) => (
                  <FormItem>
                    <FormLabel>رمز عبور جدید مدیر (اختیاری)</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} placeholder="خالی بگذارید برای عدم تغییر" data-testid="input-new-admin-password" />
                    </FormControl>
                  </FormItem>
                )} />

                <Button type="submit" className="w-full" disabled={updateSettings.isPending} data-testid="button-save-settings">
                  {updateSettings.isPending ? "در حال ذخیره..." : "ذخیره تنظیمات"}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
