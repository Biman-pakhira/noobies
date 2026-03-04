import db from '../lib/db';
// unused
/**
 * Get current user profile
 */
async function getProfile(request, reply) {
    try {
        await request.jwtVerify();
        if (!request.user) {
            return reply.status(401).send({
                success: false,
                error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
            });
        }
        const user = await db.user.findUnique({
            where: { id: request.user.userId },
            select: {
                id: true,
                username: true,
                email: true,
                bio: true,
                avatarUrl: true,
                role: true,
                createdAt: true,
            },
        });
        if (!user) {
            return reply.status(404).send({
                success: false,
                error: { message: 'User not found', code: 'NOT_FOUND' },
            });
        }
        return reply.send({
            success: true,
            data: user,
            timestamp: Date.now(),
        });
    }
    catch (error) {
        throw error;
    }
}
/**
 * Get user watch history
 */
async function getWatchHistory(request, reply) {
    try {
        await request.jwtVerify();
        if (!request.user) {
            return reply.status(401).send({
                success: false,
                error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
            });
        }
        const page = parseInt(request.query.page || '1', 10);
        const pageSize = parseInt(request.query.pageSize || '20', 10);
        const skip = (page - 1) * pageSize;
        const [history, total] = await Promise.all([
            db.watchHistory.findMany({
                where: { userId: request.user.userId },
                include: {
                    video: {
                        select: {
                            id: true,
                            title: true,
                            duration: true,
                            views: true,
                            thumbnails: { take: 1, select: { url: true } },
                        },
                    },
                },
                orderBy: { watchedAt: 'desc' },
                skip,
                take: pageSize,
            }),
            db.watchHistory.count({ where: { userId: request.user.userId } }),
        ]);
        return reply.send({
            success: true,
            data: {
                items: history,
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
 * Get user liked videos
 */
async function getLikedVideos(request, reply) {
    try {
        await request.jwtVerify();
        if (!request.user) {
            return reply.status(401).send({
                success: false,
                error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
            });
        }
        const page = parseInt(request.query.page || '1', 10);
        const pageSize = parseInt(request.query.pageSize || '20', 10);
        const skip = (page - 1) * pageSize;
        const [interactions, total] = await Promise.all([
            db.videoInteraction.findMany({
                where: {
                    userId: request.user.userId,
                    type: 'LIKE',
                },
                include: {
                    video: {
                        select: {
                            id: true,
                            title: true,
                            duration: true,
                            views: true,
                            uploader: { select: { username: true } },
                            thumbnails: { take: 1, select: { url: true } },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: pageSize,
            }),
            db.videoInteraction.count({
                where: {
                    userId: request.user.userId,
                    type: 'LIKE',
                },
            }),
        ]);
        return reply.send({
            success: true,
            data: {
                items: interactions.map((i) => i.video),
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
 * Get user playlists
 */
async function getPlaylists(request, reply) {
    try {
        await request.jwtVerify();
        if (!request.user) {
            return reply.status(401).send({
                success: false,
                error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
            });
        }
        const playlists = await db.playlist.findMany({
            where: { userId: request.user.userId },
            include: {
                videos: {
                    select: {
                        video: true,
                        _count: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return reply.send({
            success: true,
            data: playlists,
            timestamp: Date.now(),
        });
    }
    catch (error) {
        throw error;
    }
}
/**
 * Create playlist
 */
async function createPlaylist(request, reply) {
    try {
        await request.jwtVerify();
        if (!request.user) {
            return reply.status(401).send({
                success: false,
                error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
            });
        }
        const { name, description, isPublic } = request.body;
        if (!name || typeof name !== 'string') {
            return reply.status(400).send({
                success: false,
                error: { message: 'Playlist name is required', code: 'INVALID_INPUT' },
            });
        }
        const playlist = await db.playlist.create({
            data: {
                userId: request.user.userId,
                name,
                description,
                isPublic: isPublic ?? false,
            },
        });
        return reply.status(201).send({
            success: true,
            data: playlist,
            timestamp: Date.now(),
        });
    }
    catch (error) {
        throw error;
    }
}
/**
 * Register user routes
 */
export async function registerUserRoutes(fastify) {
    fastify.get('/api/users/me', { onRequest: [fastify.authenticate] }, getProfile);
    fastify.get('/api/users/me/history', { onRequest: [fastify.authenticate] }, getWatchHistory);
    fastify.get('/api/users/me/likes', { onRequest: [fastify.authenticate] }, getLikedVideos);
    fastify.get('/api/users/me/playlists', { onRequest: [fastify.authenticate] }, getPlaylists);
    fastify.post('/api/users/me/playlists', { onRequest: [fastify.authenticate] }, createPlaylist);
}
//# sourceMappingURL=users.js.map