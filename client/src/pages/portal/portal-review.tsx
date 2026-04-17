import { Redirect } from "wouter";
import PortalShell from "@/components/portal/PortalShell";
import { usePortalAuth } from "@/hooks/use-bound-facility";
import Announcements from "@/pages/announcements";

interface Props {
  facilityKey: string;
}

export default function PortalReview({ facilityKey }: Props) {
  const { auth } = usePortalAuth();

  if (!auth) return <Redirect to="/portal/login" />;
  if (!auth.isSupervisor) return <Redirect to={`/portal/${facilityKey}`} />;

  return (
    <PortalShell facilityKey={facilityKey} pageTitle="公告審核">
      {() => (
        <div data-testid="portal-review-wrapper" className="rounded-3xl bg-white ambient overflow-hidden">
          <Announcements />
        </div>
      )}
    </PortalShell>
  );
}
