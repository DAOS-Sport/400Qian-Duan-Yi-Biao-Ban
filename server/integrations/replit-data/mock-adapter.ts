import { getEmployeeHomeMock } from "../../modules/bff/employee-home";
import { sourceOk } from "../../shared/integrations/source-status";
import type { ReplitDataAdapter } from "./adapter";

export const mockReplitDataAdapter: ReplitDataAdapter = {
  async getEmployeeHomeProjection() {
    return sourceOk("mock-replit-data", getEmployeeHomeMock());
  },
};
