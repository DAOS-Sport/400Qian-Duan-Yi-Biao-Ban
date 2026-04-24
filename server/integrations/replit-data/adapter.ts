import type { EmployeeHomeDto } from "@shared/domain/workbench";
import type { SourceResult } from "../../shared/integrations/source-status";

/**
 * Replit-hosted data is treated as an external source during migration.
 * The adapter boundary lets Replit provide test/real projections without
 * coupling frontend or BFF routes to Replit-specific data shapes.
 */
export interface ReplitDataAdapter {
  getEmployeeHomeProjection(facilityKey: string): Promise<SourceResult<EmployeeHomeDto>>;
}
