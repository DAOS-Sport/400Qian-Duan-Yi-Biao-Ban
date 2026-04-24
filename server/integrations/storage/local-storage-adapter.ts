import { promises as fs } from "fs";
import path from "path";
import type { PutObjectInput, StorageAdapter, StoredObject } from "./adapter";

export const createLocalStorageAdapter = (rootDir = path.join(process.cwd(), ".storage")): StorageAdapter => ({
  async put(input: PutObjectInput): Promise<StoredObject> {
    const targetPath = path.join(rootDir, input.objectKey);
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, input.body);

    return {
      objectKey: input.objectKey,
      objectUrl: `/.storage/${input.objectKey}`,
      contentType: input.contentType,
      size: input.body.byteLength,
    };
  },

  async getUrl(objectKey: string): Promise<string> {
    return `/.storage/${objectKey}`;
  },

  async delete(objectKey: string): Promise<void> {
    await fs.rm(path.join(rootDir, objectKey), { force: true });
  },
});
