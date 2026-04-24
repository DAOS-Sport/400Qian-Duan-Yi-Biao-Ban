import type { EmployeeHomeDto } from "@shared/domain/workbench";
import { apiGet } from "@/shared/api/client";

export const fetchEmployeeHome = () => apiGet<EmployeeHomeDto>("/api/bff/employee/home");
