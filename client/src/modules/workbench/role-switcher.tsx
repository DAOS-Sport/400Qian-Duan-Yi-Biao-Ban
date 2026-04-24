import { useLocation } from "wouter";
import { LogOut } from "lucide-react";
import type { WorkbenchRole } from "@shared/auth/me";
import { roleHomePath, roleLabels } from "@shared/auth/me";
import { cn } from "@/lib/utils";
import { useAuthMe, useLogout, useSwitchRole } from "@/shared/auth/session";

const roleOrder: readonly WorkbenchRole[] = ["employee", "supervisor", "system"];

export function RoleSwitcher({ compact = false }: { compact?: boolean }) {
  const [, setLocation] = useLocation();
  const { data: session } = useAuthMe();
  const switchRole = useSwitchRole();
  const logout = useLogout();

  if (!session) return null;

  const goRole = (role: WorkbenchRole) => {
    if (role === session.activeRole) {
      setLocation(roleHomePath[role]);
      return;
    }

    switchRole.mutate(role, {
      onSuccess: () => setLocation(roleHomePath[role]),
    });
  };

  return (
    <div className={cn("flex items-center gap-2", compact ? "max-w-full overflow-x-auto" : "flex-wrap justify-end")}>
      <div className="flex rounded-[8px] border border-[#dfe7ef] bg-white p-1 shadow-sm">
        {roleOrder
          .filter((role) => session.grantedRoles.includes(role))
          .map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => goRole(role)}
              disabled={switchRole.isPending}
              className={cn(
                "min-h-8 whitespace-nowrap rounded-[6px] px-3 text-[12px] font-black transition",
                session.activeRole === role ? "bg-[#0d2a50] text-white" : "text-[#536175] hover:bg-[#f2f6fa]",
              )}
            >
              /{role.toUpperCase()}
            </button>
          ))}
      </div>
      {!compact ? (
        <button
          type="button"
          onClick={() => logout.mutate(undefined, { onSuccess: () => setLocation("/login") })}
          className="grid h-9 w-9 place-items-center rounded-[8px] border border-[#dfe7ef] bg-white text-[#637185] hover:text-[#10233f]"
          aria-label="登出"
        >
          <LogOut className="h-4 w-4" />
        </button>
      ) : null}
      <span className="hidden text-[11px] font-bold text-[#8b9aae] xl:inline">
        {session.displayName} · {roleLabels[session.activeRole]}
      </span>
    </div>
  );
}
