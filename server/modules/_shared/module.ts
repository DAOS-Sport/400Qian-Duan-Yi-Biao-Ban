import type { AppContainer } from "../../app/container";

export interface BackendModule {
  name: string;
  responsibility: string;
  register?: (container: AppContainer) => void;
}

export const reservedModule = (name: string, responsibility: string): BackendModule => ({
  name,
  responsibility,
});
