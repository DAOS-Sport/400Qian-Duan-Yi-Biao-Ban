import type { SourceResult } from "../../shared/integrations/source-status";

/**
 * Ragic is an external source, not this system's database.
 * This adapter may verify identity or read external records, but it must not
 * become the session store, permission store, or primary data repository.
 */
export interface RagicAuthUser {
  userId: string;
  displayName: string;
  employeeNumber: string;
}

export interface RagicAuthAdapter {
  verifyCredentials(username: string, password: string): Promise<SourceResult<RagicAuthUser>>;
}
