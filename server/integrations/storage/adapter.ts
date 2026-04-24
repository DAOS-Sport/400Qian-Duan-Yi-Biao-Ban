export interface StoredObject {
  objectKey: string;
  objectUrl: string;
  contentType: string;
  size: number;
}

export interface PutObjectInput {
  objectKey: string;
  body: Buffer;
  contentType: string;
}

export interface StorageAdapter {
  put(input: PutObjectInput): Promise<StoredObject>;
  getUrl(objectKey: string): Promise<string>;
  delete(objectKey: string): Promise<void>;
}
