export declare function getElasticsearchService(): {
    initialize: () => Promise<void>;
    indexVideo: (video: any) => Promise<void>;
    searchVideos: (query: string) => Promise<never[]>;
    deleteVideo: (id: string) => Promise<void>;
    isHealthy: () => boolean;
    search: (query: string, options?: any) => Promise<{
        hits: {
            hits: never[];
            total: {
                value: number;
            };
        };
    }>;
    autocomplete: (prefix: string, limit?: number) => Promise<never[]>;
    getTrendingSearches: (limit?: number) => Promise<never[]>;
    getCategories: () => Promise<never[]>;
};
//# sourceMappingURL=elasticsearch.d.ts.map