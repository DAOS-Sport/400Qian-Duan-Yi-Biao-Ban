import { useState } from "react";
import { useLocation } from "wouter";
import { Building2, ChevronRight, MapPin } from "lucide-react";
import { getAllActiveFacilities } from "@/config/facility-configs";
import { useSwitchFacility } from "@/shared/auth/session";

export default function PortalSetup() {
  const [, navigate] = useLocation();
  const facilities = getAllActiveFacilities();
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const switchFacility = useSwitchFacility();

  const handleSelect = (key: string) => {
    switchFacility.mutate(key, {
      onSuccess: () => navigate(`/portal/${key}`),
    });
  };

  return (
    <div
      className="portal min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #001d42 0%, #19335a 50%, #006b60 100%)" }}
    >
      <div className="w-full max-w-md" data-testid="section-portal-setup">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #1CB4A3, #8DC63F)" }}
          >
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1
            className="text-2xl font-bold text-white tracking-tight"
            data-testid="text-portal-setup-title"
          >
            此設備尚未設定館別
          </h1>
          <p className="text-slate-300 text-sm mt-2">
            請選擇您的值班場館以繼續
          </p>
        </div>

        <div
          className="rounded-2xl p-6 space-y-3"
          style={{
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 30px 40px -20px rgba(0,0,0,0.3)",
          }}
        >
          {facilities.map((f) => (
            <button
              key={f.facilityKey}
              type="button"
              onClick={() => handleSelect(f.facilityKey)}
              disabled={switchFacility.isPending}
              onMouseEnter={() => setHoveredKey(f.facilityKey)}
              onMouseLeave={() => setHoveredKey(null)}
              className="w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 text-left"
              style={{
                background: hoveredKey === f.facilityKey ? "rgba(28,180,163,0.15)" : "rgba(255,255,255,0.05)",
                border: hoveredKey === f.facilityKey ? "1px solid rgba(28,180,163,0.4)" : "1px solid rgba(255,255,255,0.08)",
              }}
              data-testid={`button-facility-${f.facilityKey}`}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: hoveredKey === f.facilityKey
                    ? "linear-gradient(135deg, #1CB4A3, #8DC63F)"
                    : "rgba(255,255,255,0.1)",
                }}
              >
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{f.facilityName}</p>
                <p className="text-slate-400 text-[10px] uppercase tracking-widest font-medium">{f.shortName}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
