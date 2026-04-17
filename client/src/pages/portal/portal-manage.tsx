import { useState } from "react";
import { Redirect } from "wouter";
import PortalShell from "@/components/portal/PortalShell";
import BentoCard from "@/components/portal/BentoCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { usePortalAuth } from "@/hooks/use-bound-facility";
import {
  useQuickLinks, useUpsertQuickLink, useDeleteQuickLink,
  useSystemAnnouncements, useUpsertSystemAnnouncement, useDeleteSystemAnnouncement,
} from "@/hooks/usePortalData";
import type { QuickLinkDTO, SystemAnnouncementDTO } from "@/types/portal";

function MaterialIcon({ name, className = "" }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`} aria-hidden>{name}</span>;
}

interface Props { facilityKey: string }

export default function PortalManage({ facilityKey }: Props) {
  const { auth } = usePortalAuth();
  const { toast } = useToast();
  const linksQ = useQuickLinks(facilityKey, true);
  const sysQ = useSystemAnnouncements(facilityKey, true);
  const upsertLink = useUpsertQuickLink();
  const delLink = useDeleteQuickLink();
  const upsertSys = useUpsertSystemAnnouncement();
  const delSys = useDeleteSystemAnnouncement();

  const [linkForm, setLinkForm] = useState<{ id?: number; title: string; url: string; icon: string; description: string; sortOrder: number; isActive: boolean }>({
    title: "", url: "", icon: "link", description: "", sortOrder: 0, isActive: true,
  });
  const [sysForm, setSysForm] = useState<{ id?: number; title: string; content: string; severity: "info" | "warning" | "critical"; isActive: boolean }>({
    title: "", content: "", severity: "info", isActive: true,
  });

  const resetLink = () => setLinkForm({ title: "", url: "", icon: "link", description: "", sortOrder: 0, isActive: true });
  const resetSys = () => setSysForm({ title: "", content: "", severity: "info", isActive: true });

  const submitLink = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await upsertLink.mutateAsync({ ...linkForm, facilityKey });
      toast({ title: linkForm.id ? "已更新" : "已新增", description: linkForm.title });
      resetLink();
    } catch (err) {
      toast({ title: "失敗", description: err instanceof Error ? err.message : "請重試", variant: "destructive" });
    }
  };

  const submitSys = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await upsertSys.mutateAsync({ ...sysForm, facilityKey });
      toast({ title: sysForm.id ? "已更新" : "已發布", description: sysForm.title });
      resetSys();
    } catch (err) {
      toast({ title: "失敗", description: err instanceof Error ? err.message : "請重試", variant: "destructive" });
    }
  };

  const editLink = (l: QuickLinkDTO) => setLinkForm({
    id: l.id, title: l.title, url: l.url, icon: l.icon || "link",
    description: l.description || "", sortOrder: l.sortOrder, isActive: l.isActive,
  });

  const editSys = (s: SystemAnnouncementDTO) => setSysForm({
    id: s.id, title: s.title, content: s.content,
    severity: s.severity, isActive: s.isActive,
  });

  if (auth && !auth.isSupervisor) {
    return <Redirect to={`/portal/${facilityKey}`} />;
  }

  return (
    <PortalShell facilityKey={facilityKey} pageTitle="後台管理">
      {() => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Quick Links */}
          <BentoCard testId="section-manage-links" variant="white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-stitch-secondary" style={{ background: "rgba(0,107,96,0.1)" }}>
                <MaterialIcon name="link" />
              </div>
              <div>
                <p className="portal-label text-stitch-secondary">SHORTCUTS</p>
                <h2 className="font-headline text-xl font-bold text-stitch-primary">常用網址</h2>
              </div>
            </div>

            <form onSubmit={submitLink} className="space-y-3 bg-stitch-surface-low rounded-xl p-4 mb-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">標題</Label>
                  <Input value={linkForm.title} onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })} required data-testid="input-link-title" />
                </div>
                <div>
                  <Label className="text-xs">圖示 (Material Symbol)</Label>
                  <Input value={linkForm.icon} onChange={(e) => setLinkForm({ ...linkForm, icon: e.target.value })} placeholder="link" data-testid="input-link-icon" />
                </div>
              </div>
              <div>
                <Label className="text-xs">網址</Label>
                <Input type="url" value={linkForm.url} onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })} required placeholder="https://..." data-testid="input-link-url" />
              </div>
              <div>
                <Label className="text-xs">描述（選填）</Label>
                <Input value={linkForm.description} onChange={(e) => setLinkForm({ ...linkForm, description: e.target.value })} data-testid="input-link-desc" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch checked={linkForm.isActive} onCheckedChange={(v) => setLinkForm({ ...linkForm, isActive: v })} data-testid="switch-link-active" />
                  <Label className="text-xs">啟用</Label>
                </div>
                <div className="flex gap-2">
                  {linkForm.id && (
                    <Button type="button" variant="outline" size="sm" onClick={resetLink} data-testid="button-cancel-link">取消</Button>
                  )}
                  <Button type="submit" size="sm" disabled={upsertLink.isPending} data-testid="button-submit-link">
                    {linkForm.id ? "更新" : "新增"}
                  </Button>
                </div>
              </div>
            </form>

            <ul className="space-y-2" data-testid="list-quick-links">
              {(linksQ.data?.items || []).map((l) => (
                <li key={l.id} className="flex items-center gap-3 bg-stitch-surface-low rounded-xl p-3" data-testid={`mgmt-link-${l.id}`}>
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: l.isActive ? "linear-gradient(135deg,#006b60,#9dd84f)" : "#cbd5e1" }}>
                    <MaterialIcon name={l.icon || "link"} className="text-white text-[16px]" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stitch-primary truncate">{l.title}</p>
                    <p className="text-[11px] text-slate-500 truncate">{l.url}</p>
                  </div>
                  <button onClick={() => editLink(l)} className="text-stitch-secondary p-1" data-testid={`button-edit-link-${l.id}`}><MaterialIcon name="edit" className="text-[18px]" /></button>
                  <button onClick={() => { if (confirm("刪除？")) delLink.mutate(l.id); }} className="text-red-500 p-1" data-testid={`button-delete-link-${l.id}`}><MaterialIcon name="delete" className="text-[18px]" /></button>
                </li>
              ))}
              {(linksQ.data?.items || []).length === 0 && (
                <li className="text-center text-sm text-slate-400 py-6" data-testid="state-links-mgmt-empty">尚未新增常用網址</li>
              )}
            </ul>
          </BentoCard>

          {/* System Announcements */}
          <BentoCard testId="section-manage-sysann" variant="white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-stitch-secondary" style={{ background: "rgba(0,107,96,0.1)" }}>
                <MaterialIcon name="campaign" />
              </div>
              <div>
                <p className="portal-label text-stitch-secondary">SYSTEM</p>
                <h2 className="font-headline text-xl font-bold text-stitch-primary">系統公告</h2>
              </div>
            </div>

            <form onSubmit={submitSys} className="space-y-3 bg-stitch-surface-low rounded-xl p-4 mb-4">
              <div>
                <Label className="text-xs">標題</Label>
                <Input value={sysForm.title} onChange={(e) => setSysForm({ ...sysForm, title: e.target.value })} required data-testid="input-sys-title" />
              </div>
              <div>
                <Label className="text-xs">內容</Label>
                <Textarea value={sysForm.content} onChange={(e) => setSysForm({ ...sysForm, content: e.target.value })} rows={3} required data-testid="textarea-sys-content" />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Label className="text-xs">嚴重等級</Label>
                  <Select value={sysForm.severity} onValueChange={(v: "info" | "warning" | "critical") => setSysForm({ ...sysForm, severity: v })}>
                    <SelectTrigger data-testid="select-sys-severity"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">資訊</SelectItem>
                      <SelectItem value="warning">警告</SelectItem>
                      <SelectItem value="critical">緊急</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <Switch checked={sysForm.isActive} onCheckedChange={(v) => setSysForm({ ...sysForm, isActive: v })} data-testid="switch-sys-active" />
                  <Label className="text-xs">啟用</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                {sysForm.id && (
                  <Button type="button" variant="outline" size="sm" onClick={resetSys} data-testid="button-cancel-sys">取消</Button>
                )}
                <Button type="submit" size="sm" disabled={upsertSys.isPending} data-testid="button-submit-sys">
                  {sysForm.id ? "更新" : "發布"}
                </Button>
              </div>
            </form>

            <ul className="space-y-2" data-testid="list-system-announcements">
              {(sysQ.data?.items || []).map((s) => {
                const sevColor = s.severity === "critical" ? "text-red-600 bg-red-50" : s.severity === "warning" ? "text-amber-600 bg-amber-50" : "text-stitch-secondary bg-stitch-surface-low";
                return (
                  <li key={s.id} className={`rounded-xl p-3 ${sevColor}`} data-testid={`mgmt-sys-${s.id}`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-stitch-primary truncate">
                          {s.title} {!s.isActive && <span className="text-xs text-slate-400">（已停用）</span>}
                        </p>
                        <p className="text-xs text-slate-600 line-clamp-2 mt-1">{s.content}</p>
                      </div>
                      <button onClick={() => editSys(s)} className="text-stitch-secondary p-1" data-testid={`button-edit-sys-${s.id}`}><MaterialIcon name="edit" className="text-[18px]" /></button>
                      <button onClick={() => { if (confirm("刪除？")) delSys.mutate(s.id); }} className="text-red-500 p-1" data-testid={`button-delete-sys-${s.id}`}><MaterialIcon name="delete" className="text-[18px]" /></button>
                    </div>
                  </li>
                );
              })}
              {(sysQ.data?.items || []).length === 0 && (
                <li className="text-center text-sm text-slate-400 py-6" data-testid="state-sys-mgmt-empty">尚未發布系統公告</li>
              )}
            </ul>
          </BentoCard>
        </div>
      )}
    </PortalShell>
  );
}
