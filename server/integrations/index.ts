import { createBookingAdapter } from "./booking";
import { createRagicAuthAdapter } from "./ragic";
import { createReplitDataAdapter } from "./replit-data";
import { createScheduleAdapter } from "./schedule";
import { createStorageAdapter } from "./storage";

export const createIntegrations = () => ({
  booking: createBookingAdapter(),
  ragicAuth: createRagicAuthAdapter(),
  replitData: createReplitDataAdapter(),
  schedule: createScheduleAdapter(),
  storage: createStorageAdapter(),
});

export type AppIntegrations = ReturnType<typeof createIntegrations>;
