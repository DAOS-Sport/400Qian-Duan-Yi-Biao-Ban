import type { BookingAdapter } from "./adapter";
import { sourceOk } from "../../shared/integrations/source-status";

export const mockBookingAdapter: BookingAdapter = {
  async listTodayBookings(facilityKey) {
    return sourceOk("mock-booking", [
      {
        id: "booking-1",
        facilityKey,
        title: "兒童游泳團體課",
        startsAt: "2026-04-23T10:00:00+08:00",
        status: "scheduled",
      },
      {
        id: "booking-2",
        facilityKey,
        title: "成人自由式班",
        startsAt: "2026-04-23T19:00:00+08:00",
        status: "scheduled",
      },
    ]);
  },
};
