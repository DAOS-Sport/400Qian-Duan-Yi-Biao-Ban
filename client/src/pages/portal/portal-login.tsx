import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Loader2, LogIn, Building2, User, Phone } from "lucide-react";
import { usePortalAuth } from "@/hooks/use-bound-facility";
import { getAllActiveFacilities } from "@/config/facility-configs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface RagicLoginResponse {
  employeeNumber: string;
  name: string;
  role?: string;
  facility?: string;
}

export default function PortalLogin() {
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedFacility, setSelectedFacility] = useState("");
  const { login } = usePortalAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const facilities = getAllActiveFacilities();

  const loginMut = useMutation({
    mutationFn: async (): Promise<RagicLoginResponse> => {
      const res = await apiRequest("POST", "/api/auth/ragic-login", {
        employeeNumber: employeeNumber.trim(),
        phone: phone.trim(),
      });
      return res.json() as Promise<RagicLoginResponse>;
    },
    onSuccess: (data: RagicLoginResponse) => {
      login({
        employeeNumber: data.employeeNumber || employeeNumber.trim(),
        name: data.name || employeeNumber.trim(),
        role: data.role,
        loggedInAt: new Date().toISOString(),
      });

      if (selectedFacility) {
        localStorage.setItem("facilityKey", selectedFacility);
      }

      const target = selectedFacility
        ? `/portal/${selectedFacility}`
        : "/portal";
      navigate(target);
    },
    onError: (err: Error) => {
      toast({
        title: "登入失敗",
        description: err.message || "員工編號或手機號碼不正確",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeNumber.trim() || !phone.trim()) {
      toast({
        title: "請填寫完整",
        description: "員工編號和手機號碼為必填",
        variant: "destructive",
      });
      return;
    }
    loginMut.mutate();
  };

  return (
    <div className="portal min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #001d42 0%, #19335a 50%, #006b60 100%)" }}>
      <div className="w-full max-w-md" data-testid="section-portal-login">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #1CB4A3, #8DC63F)" }}>
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight"
            data-testid="text-portal-login-title">
            員工值班入口
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            駿斯運動事業 — 員工專屬系統
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-8 space-y-5"
          style={{
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 30px 40px -20px rgba(0,0,0,0.3)",
          }}
        >
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-widest">
              員工編號
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={employeeNumber}
                onChange={(e) => setEmployeeNumber(e.target.value)}
                placeholder="請輸入員工編號"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1CB4A3]"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
                data-testid="input-employee-number"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-widest">
              手機號碼（密碼）
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="請輸入手機號碼"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1CB4A3]"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
                data-testid="input-phone"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-widest">
              選擇場館
            </label>
            <select
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#1CB4A3] appearance-none"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
              data-testid="select-facility"
            >
              <option value="" style={{ background: "#19335a" }}>請選擇場館...</option>
              {facilities.map((f) => (
                <option key={f.facilityKey} value={f.facilityKey} style={{ background: "#19335a" }}>
                  {f.facilityName}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loginMut.isPending}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #1CB4A3, #8DC63F)",
              boxShadow: "0 4px 16px rgba(28,180,163,0.3)",
            }}
            data-testid="button-login"
          >
            {loginMut.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            {loginMut.isPending ? "驗證中..." : "登入"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          如有登入問題，請聯繫您的場館主管
        </p>
      </div>
    </div>
  );
}
