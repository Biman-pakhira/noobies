import AWS from 'aws-sdk';
import { promises as fs } from 'fs';
// unused

/**
 * Abstract storage provider interface
 */
export interface StorageProvider {
  uploadFile(filePath: string, key: string, contentType: string): Promise<string>;
  deleteFile(key: string): Promise<void>;
  getUrl(key: string): Promise<string>;
}

/**
 * S3/CloudFlare R2 storage implementation
 */
export class S3StorageProvider implements StorageProvider {
  private s3Client: AWS.S3;
  private bucket: string;
  private region: string;
  private cdnUrl: string;

  constructor() {
    const useR2 = process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID;

    if (useR2) {
      // Cloudflare R2
      this.s3Client = new AWS.S3({
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        s3ForcePathStyle: true,
        signatureVersion: 'v4',
      });
      this.bucket = process.env.R2_BUCKET_NAME || 'video-platform-videos';
      this.region = process.env.R2_REGION || 'us-east-1';
      this.cdnUrl = process.env.CDN_URL || `https://${this.bucket}.cdn.example.com`;
    } else {
      // AWS S3
      this.s3Client = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1',
      });
      this.bucket = process.env.AWS_S3_BUCKET || 'video-platform-videos';
      this.region = process.env.AWS_REGION || 'us-east-1';
      this.cdnUrl = process.env.CDN_URL || `https://${this.bucket}.s3.${this.region}.amazonaws.com`;
    }
  }

  async uploadFile(filePath: string, key: string, contentType: string): Promise<string> {
    try {
      const fileBuffer = await fs.readFile(filePath);

      await this.s3Client
        .upload({
          Bucket: this.bucket,
          Key: key,
          Body: fileBuffer,
          ContentType: contentType,
          ACL: 'public-read',
        })
        .promise();

      return this.getFileUrl(key);
    } catch (error) {
      console.error(`Failed to upload file to S3: ${filePath}`, error);
      throw error;
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3Client
        .deleteObject({
          Bucket: this.bucket,
          Key: key,
        })
        .promise();
    } catch (error) {
      console.error(`Failed to delete file from S3: ${key}`, error);
      throw error;
    }
  }

  async getUrl(key: string): Promise<string> {
    return this.getFileUrl(key);
  }

  private getFileUrl(key: string): string {
    return `${this.cdnUrl}/${key}`;
  }
}

/**
 * Get storage provider instance
 */
let storageInstance: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (!storageInstance) {
    storageInstance = new S3StorageProvider();
  }
  return storageInstance;
}

export function setStorageProvider(provider: StorageProvider): void {
  storageInstance = provider;
}
