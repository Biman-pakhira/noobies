import db from '../lib/db';
/**
 * Get all videos (with pagination and filtering)
 */
async function getVideos(request, reply) {
    try {
        const page = parseInt(request.query.page || '1', 10);
        const pageSize = parseInt(request.query.pageSize || '20', 10);
        const sort = request.query.sort || 'newest'; // newest, mostViewed, topRated
        const categoryId = request.query.categoryId;
        const skip = (page - 1) * pageSize;
        // Build where clause
        const where = { status: 'READY', isPublic: true };
        if (categoryId)
            where.categoryId = categoryId;
        // Build order by
        const orderBy = {};
        switch (sort) {
            case 'mostViewed':
                orderBy.views = 'desc';
                break;
            case 'topRated':
                orderBy.likes = 'desc';
                break;
            case 'newest':
            default:
                orderBy.createdAt = 'desc';
        }
        const [videos, total] = await Promise.all([
            db.video.findMany({
                where,
                include: {
                    uploader: { select: { id: true, username: true, avatarUrl: true } },
                    thumbnails: { take: 1, select: { url: true } },
                    category: { select: { id: true, name: true, slug: true } },
                },
                orderBy,
                skip,
                take: pageSize,
            }),
            db.video.count({ where }),
        ]);
        // Map thumbnails and uploader for the frontend
        const mappedVideos = videos.map(video => ({
            ...video,
            author: video.uploader,
            thumbnail: video.thumbnails[0] || null,
        }));
        return reply.send({
            success: true,
            data: {
                videos: mappedVideos,
                total,
                page,
                pageSize,
                hasMore: skip + pageSize < total,
            },
            timestamp: Date.now(),
        });
    }
    catch (error) {
        throw error;
    }
}
/**
 * Get single video by ID
 */
async function getVideoById(request, reply) {
    try {
        const { id } = request.params;
        const video = await db.video.findUnique({
            where: { id },
            include: {
                uploader: { select: { id: true, username: true, avatarUrl: true, bio: true } },
                videoFiles: true,
                thumbnails: true,
                category: true,
                comments: {
                    take: 10,
                    include: {
                        user: { select: { id: true, username: true, avatarUrl: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!video) {
            return reply.status(404).send({
                success: false,
                error: { message: 'Video not found', code: 'NOT_FOUND' },
            });
        }
        // Update view count
        await db.video.update({
            where: { id },
            data: { views: { increment: 1 } },
        });
        // Map thumbnails and uploader for the frontend
        const mappedVideo = {
            ...video,
            author: video.uploader,
            thumbnail: video.thumbnails[0] || null,
        };
        return reply.send({
            success: true,
            data: mappedVideo,
            timestamp: Date.now(),
        });
    }
    catch (error) {
        throw error;
    }
}
/**
 * Get trending videos
 */
async function getTrendingVideos(request, reply) {
    try {
        const limit = parseInt(request.query.limit || '20', 10);
        const days = parseInt(request.query.days || '7', 10);
        const dateThreshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const videos = await db.video.findMany({
            where: {
                status: 'READY',
                isPublic: true,
                createdAt: { gte: dateThreshold },
            },
            include: {
                uploader: { select: { id: true, username: true } },
                thumbnails: { take: 1, select: { url: true } },
            },
            orderBy: [{ views: 'desc' }, { likes: 'desc' }],
            take: limit,
        });
        const mappedVideos = videos.map(video => ({
            ...video,
            author: video.uploader,
            thumbnail: video.thumbnails[0] || null,
        }));
        return reply.send({
            success: true,
            data: mappedVideos,
            timestamp: Date.now(),
        });
    }
    catch (error) {
        throw error;
    }
}
/**
 * Get HLS stream URL for a video
 */
async function getVideoStream(request, reply) {
    try {
        const { id } = request.params;
        const video = await db.video.findUnique({
            where: { id },
            include: { videoFiles: true },
        });
        if (!video) {
            return reply.status(404).send({
                success: false,
                error: { message: 'Video not found', code: 'NOT_FOUND' },
            });
        }
        if (video.status !== 'READY') {
            return reply.status(400).send({
                success: false,
                error: { message: 'Video is not ready for streaming', code: 'INVALID_STATE' },
            });
        }
        const resolution = request.query.resolution || '720p';
        const hlsFile = video.videoFiles.find((f) => f.resolution === `RES_${resolution.toUpperCase()}`);
        if (!hlsFile) {
            return reply.status(404).send({
                success: false,
                error: { message: 'Resolution not available', code: 'NOT_FOUND' },
            });
        }
        // Redirect to CDN or return URL
        return reply.redirect(hlsFile.fileUrl);
    }
    catch (error) {
        throw error;
    }
}
/**
 * Register video routes
 */
export async function registerVideoRoutes(fastify) {
    fastify.get('/api/videos', getVideos);
    fastify.get('/api/videos/trending', getTrendingVideos);
    fastify.get('/api/videos/:id', getVideoById);
    fastify.get('/api/videos/:id/stream', getVideoStream);
}
//# sourceMappingURL=videos.js.map