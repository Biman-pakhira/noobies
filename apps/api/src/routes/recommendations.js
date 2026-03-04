import axios from 'axios';
const RECOMMENDER_URL = process.env.RECOMMENDER_URL || 'http://localhost:3002';
/**
 * Get personalized recommendations for a user
 * Proxies to Python recommendation service
 */
async function getRecommendations(request, reply) {
    try {
        const { user_id } = request.params;
        if (!user_id) {
            return reply.status(400).send({
                success: false,
                error: 'user_id is required',
                code: 'MISSING_USER_ID',
            });
        }
        const limit = Math.min(parseInt(request.query.limit || '10', 10), 100);
        const exclude_watched = request.query.exclude_watched !== 'false';
        const categories = request.query.categories;
        try {
            const response = await axios.get(`${RECOMMENDER_URL}/api/recommendations/${user_id}`, {
                params: {
                    limit,
                    exclude_watched,
                    ...(categories && { categories }),
                },
                timeout: 10000,
            });
            return reply.send({
                success: true,
                data: response.data,
                timestamp: Date.now(),
            });
        }
        catch (error) {
            // Log error but don't fail - return empty array
            console.warn('Recommendation service error:', error.message);
            return reply.send({
                success: true,
                data: [],
                timestamp: Date.now(),
            });
        }
    }
    catch (error) {
        throw error;
    }
}
/**
 * Get trending videos from recommendation service
 */
async function getTrendingRecommendations(request, reply) {
    try {
        const limit = Math.min(parseInt(request.query.limit || '20', 10), 100);
        try {
            const response = await axios.get(`${RECOMMENDER_URL}/api/recommendations/trending`, {
                params: { limit },
                timeout: 10000,
            });
            return reply.send({
                success: true,
                data: response.data,
                timestamp: Date.now(),
            });
        }
        catch (error) {
            console.warn('Trending recommendations error:', error.message);
            return reply.send({
                success: true,
                data: [],
                timestamp: Date.now(),
            });
        }
    }
    catch (error) {
        throw error;
    }
}
/**
 * Trigger model training/update
 */
async function trainRecommendations(_request, reply) {
    try {
        // Verify admin auth if needed
        // await request.jwtVerify();
        try {
            const response = await axios.post(`${RECOMMENDER_URL}/api/recommendations/train`, {}, {
                timeout: 30000,
            });
            return reply.send({
                success: true,
                data: response.data,
                timestamp: Date.now(),
            });
        }
        catch (error) {
            console.warn('Training error:', error.message);
            return reply.status(503).send({
                success: false,
                error: 'Recommendation service unavailable',
                code: 'SERVICE_UNAVAILABLE',
            });
        }
    }
    catch (error) {
        throw error;
    }
}
/**
 * Get recommendation service stats
 */
async function getRecommendationStats(_request, reply) {
    try {
        try {
            const response = await axios.get(`${RECOMMENDER_URL}/api/recommendations/stats`, {
                timeout: 5000,
            });
            return reply.send({
                success: true,
                data: response.data,
                timestamp: Date.now(),
            });
        }
        catch (error) {
            console.warn('Stats error:', error.message);
            return reply.status(503).send({
                success: false,
                error: 'Recommendation service unavailable',
                code: 'SERVICE_UNAVAILABLE',
            });
        }
    }
    catch (error) {
        throw error;
    }
}
/**
 * Register recommendation routes
 */
export async function registerRecommendationRoutes(fastify) {
    fastify.get('/api/recommendations/:user_id', getRecommendations);
    fastify.get('/api/recommendations/trending', getTrendingRecommendations);
    fastify.post('/api/recommendations/train', trainRecommendations);
    fastify.get('/api/recommendations/stats', getRecommendationStats);
}
//# sourceMappingURL=recommendations.js.map