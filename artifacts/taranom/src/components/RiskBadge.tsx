interface RiskBadgeProps {
  level: string | null | undefined;
  size?: "sm" | "md" | "lg";
}

const RISK_CONFIG = {
  green: { label: "سبز - وضعیت خوب", bg: "bg-green-100", text: "text-green-800", dot: "bg-green-500" },
  yellow: { label: "زرد - نیاز به توجه", bg: "bg-yellow-100", text: "text-yellow-800", dot: "bg-yellow-500" },
  orange: { label: "نارنجی - هشدار", bg: "bg-orange-100", text: "text-orange-800", dot: "bg-orange-500" },
  red: { label: "قرمز - خطر", bg: "bg-red-100", text: "text-red-800", dot: "bg-red-500" },
};

export default function RiskBadge({ level, size = "md" }: RiskBadgeProps) {
  const config = RISK_CONFIG[(level as keyof typeof RISK_CONFIG) ?? "green"] ?? RISK_CONFIG.green;
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : size === "lg" ? "text-base px-4 py-2" : "text-sm px-3 py-1";

  return (
    <span
      data-testid="risk-badge"
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bg} ${config.text} ${sizeClass}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
