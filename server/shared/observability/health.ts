export interface HealthCheckResult {
  name: string;
  status: "ok" | "degraded" | "down";
  checkedAt: string;
  detail?: string;
}

export const healthOk = (name: string, detail?: string): HealthCheckResult => ({
  name,
  status: "ok",
  checkedAt: new Date().toISOString(),
  detail,
});
