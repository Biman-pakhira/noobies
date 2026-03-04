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
export declare class S3StorageProvider implements StorageProvider {
    private s3Client;
    private bucket;
    private region;
    private cdnUrl;
    constructor();
    uploadFile(filePath: string, key: string, contentType: string): Promise<string>;
    deleteFile(key: string): Promise<void>;
    getUrl(key: string): Promise<string>;
    private getFileUrl;
}
export declare function getStorageProvider(): StorageProvider;
export declare function setStorageProvider(provider: StorageProvider): void;
//# sourceMappingURL=storage.d.ts.map