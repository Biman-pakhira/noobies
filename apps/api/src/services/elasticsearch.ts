export function getElasticsearchService() {
  return {
    initialize: async () => {
      console.log('⚠️  Elasticsearch disabled in development')
    },
    indexVideo: async (video: any) => {},
    searchVideos: async (query: string) => [],
    deleteVideo: async (id: string) => {},
    isHealthy: () => false,
    search: async (query: string, options?: any) => ({ hits: { hits: [], total: { value: 0 } } }),
    autocomplete: async (prefix: string, limit?: number) => [],
    getTrendingSearches: async (limit?: number) => [],
    getCategories: async () => [],
  }
}
