export function getElasticsearchService() {
    return {
        initialize: async () => {
            console.log('⚠️  Elasticsearch disabled in development');
        },
        indexVideo: async (video) => { },
        searchVideos: async (query) => [],
        deleteVideo: async (id) => { },
        isHealthy: () => false,
        search: async (query, options) => ({ hits: { hits: [], total: { value: 0 } } }),
        autocomplete: async (prefix, limit) => [],
        getTrendingSearches: async (limit) => [],
        getCategories: async () => [],
    };
}
//# sourceMappingURL=elasticsearch.js.map