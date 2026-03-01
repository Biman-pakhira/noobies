import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getElasticsearchService } from '../services/elasticsearch.js';

/**
 * Search videos with full-text search
 */
async function searchVideos(request: FastifyRequest, reply: FastifyReply) {
  try {
    const esService = getElasticsearchService();

    if (!esService.isHealthy()) {
      return reply.status(503).send({
        success: false,
        error: 'Search service is unavailable',
        code: 'SEARCH_UNAVAILABLE',
      });
    }

    const query = (request.query as any).q || '';
    const page = parseInt((request.query as any).page || '1', 10);
    const pageSize = parseInt((request.query as any).pageSize || '20', 10);
    const category = (request.query as any).category;
    const uploaderId = (request.query as any).uploaderId;
    const minDuration = (request.query as any).minDuration ? parseInt((request.query as any).minDuration, 10) : null;
    const maxDuration = (request.query as any).maxDuration ? parseInt((request.query as any).maxDuration, 10) : null;
    const dateRange = (request.query as any).dateRange; // last_week, last_month, last_year
    const sortBy = (request.query as any).sort || 'relevance'; // relevance, newest, mostViewed, trending

    if (!query || query.trim().length === 0) {
      return reply.status(400).send({
        success: false,
        error: 'Search query is required',
        code: 'EMPTY_QUERY',
      });
    }

    if (pageSize > 100) {
      return reply.status(400).send({
        success: false,
        error: 'Page size cannot exceed 100',
        code: 'INVALID_PAGE_SIZE',
      });
    }

    const results = await esService.search(query, {
      page,
      pageSize,
      categoryId: category,
      uploaderId,
      minDuration,
      maxDuration,
      sortBy,
      dateRange,
    });

    return reply.send({
      success: true,
      data: results,
      timestamp: Date.now(),
    });
  } catch (error) {
    request.log.error(error);
    throw error;
  }
}

/**
 * Get autocomplete suggestions
 */
async function getAutocompleteSuggestions(request: FastifyRequest, reply: FastifyReply) {
  try {
    const esService = getElasticsearchService();

    if (!esService.isHealthy()) {
      return reply.status(503).send({
        success: false,
        error: 'Search service is unavailable',
        code: 'SEARCH_UNAVAILABLE',
      });
    }

    const prefix = (request.query as any).q || '';
    const limit = Math.min(parseInt((request.query as any).limit || '10', 10), 50);

    if (!prefix || prefix.trim().length === 0) {
      return reply.status(400).send({
        success: false,
        error: 'Query prefix is required',
        code: 'EMPTY_PREFIX',
      });
    }

    const suggestions = await esService.autocomplete(prefix, limit);

    return reply.send({
      success: true,
      data: suggestions,
      timestamp: Date.now(),
    });
  } catch (error) {
    request.log.error(error);
    throw error;
  }
}

/**
 * Get trending searches
 */
async function getTrendingSearches(request: FastifyRequest, reply: FastifyReply) {
  try {
    const esService = getElasticsearchService();

    if (!esService.isHealthy()) {
      return reply.status(503).send({
        success: false,
        error: 'Search service is unavailable',
        code: 'SEARCH_UNAVAILABLE',
      });
    }

    const limit = Math.min(parseInt((request.query as any).limit || '10', 10), 50);

    const trending = await esService.getTrendingSearches(limit);

    return reply.send({
      success: true,
      data: trending,
      timestamp: Date.now(),
    });
  } catch (error) {
    request.log.error(error);
    throw error;
  }
}

/**
 * Get available categories
 */
async function getCategories(request: FastifyRequest, reply: FastifyReply) {
  try {
    const esService = getElasticsearchService();

    if (!esService.isHealthy()) {
      return reply.status(503).send({
        success: false,
        error: 'Search service is unavailable',
        code: 'SEARCH_UNAVAILABLE',
      });
    }

    const categories = await esService.getCategories();

    return reply.send({
      success: true,
      data: categories,
      timestamp: Date.now(),
    });
  } catch (error) {
    request.log.error(error);
    throw error;
  }
}

/**
 * Register search routes
 */
export async function registerSearchRoutes(fastify: FastifyInstance) {
  fastify.get('/api/search', searchVideos);
  fastify.get('/api/search/autocomplete', getAutocompleteSuggestions);
  fastify.get('/api/search/trending', getTrendingSearches);
  fastify.get('/api/search/categories', getCategories);
}
