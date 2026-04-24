import type { ReactNode } from "react";
import { RoleShell } from "./role-shell";

interface LegacyWorkbenchPageProps {
  role: "supervisor" | "system";
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function LegacyWorkbenchPage({ role, title, subtitle, children }: LegacyWorkbenchPageProps) {
  return (
    <RoleShell role={role} title={title} subtitle={subtitle}>
      <div className="overflow-hidden rounded-[8px] border border-[#e6edf4] bg-white">
        <div className="max-h-[calc(100dvh-190px)] overflow-auto bg-[#f8fafc]">
          {children}
        </div>
      </div>
    </RoleShell>
  );
}
