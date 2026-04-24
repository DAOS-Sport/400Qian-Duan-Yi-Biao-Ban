import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface WorkbenchCardProps {
  children: ReactNode;
  className?: string;
  tone?: "light" | "navy";
}

export function WorkbenchCard({ children, className, tone = "light" }: WorkbenchCardProps) {
  return (
    <section
      className={cn(
        "rounded-[8px] border shadow-[0_24px_48px_-28px_rgba(15,34,58,0.22)]",
        tone === "navy"
          ? "border-[#28456b] bg-[#18345b] text-white"
          : "border-[#e6edf4] bg-white text-[#10233f]",
        className,
      )}
    >
      {children}
    </section>
  );
}
