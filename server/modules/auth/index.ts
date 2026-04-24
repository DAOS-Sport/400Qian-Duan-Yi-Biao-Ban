import { reservedModule } from "../_shared/module";

export const authModule = reservedModule(
  "auth",
  "Session, login/logout, /api/auth/me, role/facility scope, CSRF and authorization guards",
);
