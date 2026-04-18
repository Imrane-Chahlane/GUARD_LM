import Link from "next/link";
import { cn } from "@/utils/cn";

const variants = {
  primary: "border-mint bg-mint text-ink hover:bg-leaf hover:border-leaf",
  secondary: "border-line bg-field text-cloud hover:border-mint/60 hover:text-mint",
  danger: "border-ember bg-ember text-ink hover:bg-ember/90",
  ghost: "border-transparent bg-transparent text-cloud/70 hover:text-mint"
};

export function buttonClasses(variant: keyof typeof variants = "primary", className?: string) {
  return cn(
    "inline-flex min-h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold transition focus-ring disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant],
    className
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className
}: {
  href: string;
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <Link href={href} className={buttonClasses(variant, className)}>
      {children}
    </Link>
  );
}
