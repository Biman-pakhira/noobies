import { Client } from '@elastic/elasticsearch';

const VIDEOS_INDEX = 'videos';

/**
 * Elasticsearch client for search functionality
 */
class ElasticsearchService {
  private client: Client;
  private isConnected = false;

  constructor() {
    this.client = new Client({
      node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
      requestTimeout: 30000,
    });
  }

  /**
   * Initialize Elasticsearch and create indexes
   */
  async initialize() {
    try {
      // Check connection
      const health = await this.client.cluster.health();
      console.log(`✅ Elasticsearch connected - Status: ${health.status}`);
      this.isConnected = true;

      await this.createIndexes();
    } catch (error) {
      console.error('❌ Elasticsearch connection failed:', error);
      console.warn('Search features will be unavailable until Elasticsearch is running');
      this.isConnected = false;
    }
  }

  /**
   * Create indexes if they don't exist
   */
  private async createIndexes() {
    try {
      // Check if index exists
      const exists = await this.client.indices.exists({ index: VIDEOS_INDEX });

      if (!exists) {
        console.log(`Creating index: ${VIDEOS_INDEX}`);
        await this.client.indices.create({
          index: VIDEOS_INDEX,
          body: {
            settings: {
              number_of_shards: 1,
              number_of_replicas: 0,
              analysis: {
                analyzer: {
                  default: {
                    type: 'standard',
                    stopwords: '_english_',
                  },
                  autocomplete_analyzer: {
                    type: 'custom',
                    tokenizer: 'standard',
                    filter: ['lowercase', 'stop', 'snowball'],
                  },
                },
              },
            },
            mappings: {
              properties: {
                id: { type: 'keyword' },
                title: {
                  type: 'text',
                  fields: {
                    keyword: { type: 'keyword' },
                  },
                  analyzer: 'standard',
                },
                description: {
                  type: 'text',
                  analyzer: 'standard',
                },
                tags: {
                  type: 'keyword',
                },
                category: {
                  type: 'keyword',
                },
                uploaderUsername: {
                  type: 'keyword',
                },
                uploaderId: {
                  type: 'keyword',
                },
                views: {
                  type: 'long',
                },
                likes: {
                  type: 'long',
                },
                duration: {
                  type: 'integer',
                },
                createdAt: {
                  type: 'date',
                },
                thumbnail: {
                  type: 'keyword',
                },
                status: {
                  type: 'keyword',
                },
              },
            },
          },
        });
        console.log(`✅ Index created: ${VIDEOS_INDEX}`);
      } else {
        console.log(`✅ Index exists: ${VIDEOS_INDEX}`);
      }
    } catch (error) {
      console.error('Error creating indexes:', error);
    }
  }

  /**
   * Index a video document
   */
  async indexVideo(video: any) {
    if (!this.isConnected) return;

    try {
      await this.client.index({
        index: VIDEOS_INDEX,
        id: video.id,
        body: {
          id: video.id,
          title: video.title,
          description: video.description,
          tags: video.tags?.map((t: any) => t.name) || [],
          category: video.category?.name || '',
          uploaderUsername: video.uploader?.username || '',
          uploaderId: video.uploader?.id || '',
          views: video.views || 0,
          likes: video.likes || 0,
          duration: video.duration || 0,
          createdAt: video.createdAt,
          thumbnail: video.thumbnails?.[0]?.url || '',
          status: video.status,
        },
      });
    } catch (error) {
      console.error('Error indexing video:', error);
    }
  }

  /**
   * Update a video document
   */
  async updateVideo(videoId: string, updates: any) {
    if (!this.isConnected) return;

    try {
      await this.client.update({
        index: VIDEOS_INDEX,
        id: videoId,
        body: {
          doc: updates,
        },
      });
    } catch (error) {
      console.error('Error updating video:', error);
    }
  }

  /**
   * Delete a video document
   */
  async deleteVideo(videoId: string) {
    if (!this.isConnected) return;

    try {
      await this.client.delete({
        index: VIDEOS_INDEX,
        id: videoId,
      });
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  }

  /**
   * Search videos with full-text search and filtering
   */
  async search(query: string, options: any = {}) {
    if (!this.isConnected) {
      throw new Error('Elasticsearch is not connected');
    }

    const {
      page = 1,
      pageSize = 20,
      categoryId = null,
      minDuration = null,
      maxDuration = null,
      uploaderId = null,
      sortBy = 'relevance', // relevance, newest, mostViewed, trending
      dateRange = null, // last_week, last_month, last_year
    } = options;

    const skip = (page - 1) * pageSize;

    // Build must clauses
    const must: any[] = [];
    const filter: any[] = [];

    // Full-text search
    if (query && query.trim()) {
      must.push({
        multi_match: {
          query: query.trim(),
          fields: ['title^3', 'description^2', 'tags', 'uploaderUsername'],
          fuzziness: 'AUTO',
          operator: 'or',
        },
      });
    }

    // Status filter
    filter.push({
      term: { status: 'READY' },
    });

    // Category filter
    if (categoryId) {
      filter.push({
        term: { category: categoryId },
      });
    }

    // Uploader filter
    if (uploaderId) {
      filter.push({
        term: { uploaderId },
      });
    }

    // Duration filters
    if (minDuration !== null) {
      filter.push({
        range: { duration: { gte: minDuration } },
      });
    }
    if (maxDuration !== null) {
      filter.push({
        range: { duration: { lte: maxDuration } },
      });
    }

    // Date range filters
    if (dateRange) {
      const now = new Date();
      let startDate: Date;

      switch (dateRange) {
        case 'last_week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'last_month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'last_year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }

      filter.push({
        range: { createdAt: { gte: startDate.toISOString() } },
      });
    }

    // Build sort
    const sort: any = [];
    switch (sortBy) {
      case 'newest':
        sort.push({ createdAt: 'desc' });
        break;
      case 'mostViewed':
        sort.push({ views: 'desc' });
        break;
      case 'trending':
        sort.push({ likes: 'desc' });
        sort.push({ views: 'desc' });
        break;
      case 'relevance':
      default:
        sort.push({ _score: 'desc' });
        break;
    }

    try {
      const result = await this.client.search({
        index: VIDEOS_INDEX,
        body: {
          query: {
            bool: {
              must: must.length > 0 ? must : [{ match_all: {} }],
              filter,
            },
          },
          sort,
          from: skip,
          size: pageSize,
          highlight: {
            fields: {
              title: {},
              description: {},
            },
            pre_tags: ['<em>'],
            post_tags: ['</em>'],
          },
        },
      });

      const hits = result.hits;
      return {
        items: hits.hits.map((hit: any) => ({
          id: hit._id,
          score: hit._score,
          highlight: hit.highlight,
          ...hit._source,
        })),
        total: typeof hits.total === 'number' ? hits.total : hits.total?.value || 0,
        page,
        pageSize,
        hasMore: skip + pageSize < (typeof hits.total === 'number' ? hits.total : hits.total?.value || 0),
      };
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  /**
   * Get autocomplete suggestions
   */
  async autocomplete(prefix: string, limit = 10) {
    if (!this.isConnected || !prefix || prefix.trim().length === 0) {
      return [];
    }

    try {
      const result = await this.client.search({
        index: VIDEOS_INDEX,
        body: {
          query: {
            bool: {
              must: [
                {
                  match_phrase_prefix: {
                    title: {
                      query: prefix.trim(),
                      boost: 2,
                    },
                  },
                },
                {
                  term: { status: 'READY' },
                },
              ],
            },
          },
          size: limit,
          _source: ['id', 'title', 'thumbnail'],
          collapse: {
            field: 'title.keyword',
          },
        },
      });

      const hits = result.hits;
      return hits.hits.map((hit: any) => ({
        id: hit._id,
        title: hit._source.title,
        thumbnail: hit._source.thumbnail,
      }));
    } catch (error) {
      console.error('Autocomplete error:', error);
      return [];
    }
  }

  /**
   * Get trending searches (most searched terms - for mockup, uses ES aggregations)
   */
  async getTrendingSearches(limit = 10) {
    if (!this.isConnected) {
      return [];
    }

    try {
      const result = await this.client.search({
        index: VIDEOS_INDEX,
        body: {
          size: 0,
          aggs: {
            titles: {
              terms: {
                field: 'title.keyword',
                size: limit,
                order: { _count: 'desc' },
              },
            },
          },
        },
      });

      return (result.aggregations as any).titles.buckets.map((bucket: any) => ({
        term: bucket.key,
        count: bucket.doc_count,
      }));
    } catch (error) {
      console.error('Trending searches error:', error);
      return [];
    }
  }

  /**
   * Get available categories from indexed videos
   */
  async getCategories() {
    if (!this.isConnected) {
      return [];
    }

    try {
      const result = await this.client.search({
        index: VIDEOS_INDEX,
        body: {
          size: 0,
          aggs: {
            categories: {
              terms: {
                field: 'category',
                size: 100,
              },
            },
          },
          query: {
            term: { status: 'READY' },
          },
        },
      });

      return (result.aggregations as any).categories.buckets.map((bucket: any) => ({
        name: bucket.key,
        count: bucket.doc_count,
      }));
    } catch (error) {
      console.error('Categories error:', error);
      return [];
    }
  }

  /**
   * Clear all indexes (for testing)
   */
  async clearIndexes() {
    if (!this.isConnected) return;

    try {
      await this.client.indices.delete({ index: VIDEOS_INDEX });
      await this.createIndexes();
    } catch (error) {
      console.error('Error clearing indexes:', error);
    }
  }

  /**
   * Get index statistics
   */
  async getStats() {
    if (!this.isConnected) {
      return null;
    }

    try {
      const stats = await this.client.indices.stats({
        index: VIDEOS_INDEX,
      });
      return stats.indices[VIDEOS_INDEX];
    } catch (error) {
      console.error('Error getting stats:', error);
      return null;
    }
  }

  /**
   * Check if connected
   */
  isHealthy() {
    return this.isConnected;
  }

  /**
   * Close client
   */
  async close() {
    await this.client.close();
  }
}

// Singleton instance
let elasticsearchService: ElasticsearchService;

export function getElasticsearchService() {
  if (!elasticsearchService) {
    elasticsearchService = new ElasticsearchService();
  }
  return elasticsearchService;
}
