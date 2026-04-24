import type { ClientErrorDto, UiEventDto } from "@shared/telemetry/events";
import type { AuditEventInput } from "../../shared/telemetry/audit-writer";
import { env } from "../../shared/config/env";

export interface StoredUiEvent extends UiEventDto {
  receivedAt: string;
  userId?: string;
  role?: string;
  facilityKey?: string;
  sessionIdHash?: string;
}

export interface StoredClientError extends ClientErrorDto {
  receivedAt: string;
  userId?: string;
  role?: string;
  facilityKey?: string;
}

export interface TelemetryOverview {
  totalEvents: number;
  totalClientErrors: number;
  latestEvents: StoredUiEvent[];
  latestErrors: StoredClientError[];
}

export interface TelemetryRepository {
  recordUiEvent(event: StoredUiEvent): Promise<void>;
  recordClientError(error: StoredClientError): Promise<void>;
  recordAudit(event: AuditEventInput): Promise<void>;
  getUiEventOverview(): Promise<TelemetryOverview>;
}

const uiEventMemory: StoredUiEvent[] = [];
const clientErrorMemory: StoredClientError[] = [];
const auditMemory: AuditEventInput[] = [];

export const createMemoryTelemetryRepository = (): TelemetryRepository => ({
  async recordUiEvent(event) {
    uiEventMemory.push(event);
  },

  async recordClientError(error) {
    clientErrorMemory.push(error);
  },

  async recordAudit(event) {
    auditMemory.push(event);
    console.info("[audit:memory]", JSON.stringify({ ...event, timestamp: new Date().toISOString() }));
  },

  async getUiEventOverview() {
    return {
      totalEvents: uiEventMemory.length,
      totalClientErrors: clientErrorMemory.length,
      latestEvents: uiEventMemory.slice(-20).reverse(),
      latestErrors: clientErrorMemory.slice(-20).reverse(),
    };
  },
});

export const createTelemetryRepository = (): TelemetryRepository => {
  if (env.databaseProfile === "mock" || env.dataSourceMode === "mock") {
    return createMemoryTelemetryRepository();
  }

  // DB-backed repository is intentionally reserved until migrations are applied on Replit.
  // Keeping the same interface lets the reconnect phase swap this implementation without route changes.
  return createMemoryTelemetryRepository();
};
