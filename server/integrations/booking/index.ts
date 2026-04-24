import { env } from "../../shared/config/env";
import type { BookingAdapter } from "./adapter";
import { mockBookingAdapter } from "./mock-adapter";
import { realBookingAdapter } from "./real-adapter";

export const createBookingAdapter = (): BookingAdapter =>
  env.bookingAdapterMode === "real" ? realBookingAdapter : mockBookingAdapter;
