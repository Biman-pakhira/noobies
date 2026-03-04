export declare function getTranscodingQueue(): {
    startWorker: () => void;
    stopWorker: () => Promise<void>;
    addJob: (data: {
        videoId: string;
        uploadPath: string;
        resolutions: string[];
    }) => Promise<string | undefined>;
    getJobStatus: (jobId: string) => Promise<{
        id: string | undefined;
        status: import("bullmq").JobState | "unknown";
        progress: import("bullmq").JobProgress;
    } | null>;
};
//# sourceMappingURL=transcoding.d.ts.map