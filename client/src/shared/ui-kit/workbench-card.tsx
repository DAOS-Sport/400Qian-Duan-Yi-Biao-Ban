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
        "workbench-card",
        tone === "navy"
          ? "workbench-card--navy text-white"
          : "text-[#10233f]",
        className,
      )}
    >
      {children}
    </section>
  );
}
