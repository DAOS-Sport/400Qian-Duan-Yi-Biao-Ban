import type { BookingAdapter } from "./adapter";
import { sourceUnavailable } from "../../shared/integrations/source-status";

export const realBookingAdapter: BookingAdapter = {
  async listTodayBookings() {
    return sourceUnavailable(
      "booking",
      "Real booking adapter is reserved for Replit reconnect",
      "BOOKING_REAL_ADAPTER_NOT_CONNECTED",
    );
  },
};
