import type { SourceResult } from "../../shared/integrations/source-status";

/**
 * Booking data is external source data. The first version is read-only and
 * should enter the workbench through snapshot/projection contracts.
 */
export interface BookingSnapshotItem {
  id: string;
  facilityKey: string;
  title: string;
  startsAt: string;
  status: "scheduled" | "checked_in" | "cancelled";
}

export interface BookingAdapter {
  listTodayBookings(facilityKey: string): Promise<SourceResult<BookingSnapshotItem[]>>;
}
