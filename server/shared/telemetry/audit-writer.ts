export interface AuditEventInput {
  actorId?: string;
  role?: string;
  facilityKey?: string;
  action: string;
  resource: string;
  resourceId?: string;
  payload?: unknown;
  correlationId?: string;
  resultStatus?: "success" | "failure";
}

export interface AuditWriter {
  write(event: AuditEventInput): Promise<void>;
}

export const createAuditWriter = (write: (event: AuditEventInput) => Promise<void>): AuditWriter => ({
  write,
});

export const writeAudit = async (event: AuditEventInput): Promise<void> => {
  console.info("[audit:reserved]", JSON.stringify({
    ...event,
    timestamp: new Date().toISOString(),
  }));
};
