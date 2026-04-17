import type { ReactNode } from "react";

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  testId?: string;
  variant?: "white" | "glass" | "navy";
  padded?: boolean;
}

export default function BentoCard({
  children,
  className = "",
  testId,
  variant = "white",
  padded = true,
}: BentoCardProps) {
  const base = padded ? "p-6 md:p-7" : "";
  const styles = variant === "glass"
    ? "portal-glass"
    : variant === "navy"
      ? "rounded-3xl text-white"
      : "portal-bento";
  const inline = variant === "navy"
    ? { background: "linear-gradient(135deg, #001d42, #19335a)" }
    : undefined;
  return (
    <div className={`${styles} ${base} ${className}`} style={inline} data-testid={testId}>
      {children}
    </div>
  );
}
