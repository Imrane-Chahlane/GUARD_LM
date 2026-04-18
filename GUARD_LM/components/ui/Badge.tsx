import { cn } from "@/utils/cn";

const variants = {
  safe: "border-mint/40 bg-mint/10 text-mint",
  malicious: "border-ember/50 bg-ember/10 text-ember",
  sanitized: "border-amber/50 bg-amber/10 text-amber",
  neutral: "border-line bg-field text-cloud/80"
};

export function Badge({
  children,
  variant = "neutral"
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold uppercase",
        variants[variant]
      )}
    >
      {children}
    </span>
  );
}
