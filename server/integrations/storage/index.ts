import { createLocalStorageAdapter } from "./local-storage-adapter";
import type { StorageAdapter } from "./adapter";

export const createStorageAdapter = (): StorageAdapter => createLocalStorageAdapter();
