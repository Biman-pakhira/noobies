import db from '../lib/db';
/**
 * Get dashboard statistics
 */
async function getDashboardStats(request, reply) {
    try {
        await request.jwtVerify();
        if (request.user?.role !== 'ADMIN' && request.user?.role !== 'MODERATOR') {
            return reply.status(403).send({
                success: false,
                error: 'Forbidden',
                code: 'INSUFFICIENT_PERMISSIONS',
            });
        }
        // Get stats
        const [totalUsers, totalVideos, totalReports, pendingVideos, activeUsers] = await Promise.all([
            db.user.count(),
            db.video.count({ where: { status: 'READY' } }),
            db.report.count({ where: { status: 'OPEN' } }),
            db.video.count({ where: { status: 'PROCESSING' } }),
            db.user.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
                    },
                },
            }),
        ]);
        // Get recent videos
        const recentVideos = await db.video.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                uploader: { select: { id: true, username: true } },
            },
        });
        // Get recent reports
        const recentReports = await db.report.findMany({
            where: { status: 'OPEN' },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                video: { select: { id: true, title: true } },
                reporter: { select: { id: true, username: true } },
            },
        });
        return reply.send({
            success: true,
            data: {
                stats: {
                    totalUsers,
                    totalVideos,
                    totalReports,
                    pendingVideos,
                    active24h: activeUsers,
                },
                recentVideos,
                recentReports,
                timestamp: Date.now(),
            },
        });
    }
    catch (error) {
        throw error;
    }
}
/**
 * Get moderation queue (pending videos)
 */
async function getModerationQueue(request, reply) {
    try {
        await request.jwtVerify();
        if (request.user?.role !== 'ADMIN' && request.user?.role !== 'MODERATOR') {
            return reply.status(403).send({
                success: false,
                error: 'Forbidden',
                code: 'INSUFFICIENT_PERMISSIONS',
            });
        }
        const page = parseInt(request.query.page || '1', 10);
        const pageSize = parseInt(request.query.pageSize || '20', 10);
        const skip = (page - 1) * pageSize;
        const [videos, total] = await Promise.all([
            db.video.findMany({
                where: {
                    status: { in: ['PROCESSING', 'FLAGGED'] },
                },
                include: {
                    uploader: { select: { id: true, username: true, email: true } },
                    thumbnails: { take: 1 },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: pageSize,
            }),
            db.video.count({
                where: { status: { in: ['PROCESSING', 'FLAGGED'] } },
            }),
        ]);
        return reply.send({
            success: true,
            data: {
                videos,
                total,
                page,
                pageSize,
                hasMore: skip + pageSize < total,
            },
        });
    }
    catch (error) {
        throw error;
    }
}
/**
 * Approve or reject a video
 */
async function approveVideo(request, reply) {
    try {
        await request.jwtVerify();
        if (request.user?.role !== 'ADMIN' && request.user?.role !== 'MODERATOR') {
            return reply.status(403).send({
                success: false,
                error: 'Forbidden',
                code: 'INSUFFICIENT_PERMISSIONS',
            });
        }
        const { videoId } = request.params;
        const { approved, reason } = request.body;
        const video = await db.video.findUnique({
            where: { id: videoId },
        });
        if (!video) {
            return reply.status(404).send({
                success: false,
                error: 'Video not found',
                code: 'NOT_FOUND',
            });
        }
        // Update video status
        const updated = await db.video.update({
            where: { id: videoId },
            data: {
                status: approved ? 'READY' : 'REJECTED',
                rejectionReason: !approved ? reason : null,
            },
        });
        return reply.send({
            success: true,
            data: {
                video: updated,
                action: approved ? 'approved' : 'rejected',
            },
        });
    }
    catch (error) {
        throw error;
    }
}
/**
 * Get reports
 */
async function getReports(request, reply) {
    try {
        await request.jwtVerify();
        if (request.user?.role !== 'ADMIN' && request.user?.role !== 'MODERATOR') {
            return reply.status(403).send({
                success: false,
                error: 'Forbidden',
                code: 'INSUFFICIENT_PERMISSIONS',
            });
        }
        const page = parseInt(request.query.page || '1', 10);
        const pageSize = parseInt(request.query.pageSize || '20', 10);
        const status = request.query.status || 'OPEN';
        const skip = (page - 1) * pageSize;
        const [reports, total] = await Promise.all([
            db.report.findMany({
                where: { status: status === 'all' ? undefined : status },
                include: {
                    video: true,
                    reporter: { select: { id: true, username: true, email: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: pageSize,
            }),
            db.report.count({
                where: { status: status === 'all' ? undefined : status },
            }),
        ]);
        return reply.send({
            success: true,
            data: {
                reports,
                total,
                page,
                pageSize,
                hasMore: skip + pageSize < total,
            },
        });
    }
    catch (error) {
        throw error;
    }
}
/**
 * Handle report (resolve, reject, or delete video)
 */
async function handleReport(request, reply) {
    try {
        await request.jwtVerify();
        if (request.user?.role !== 'ADMIN' && request.user?.role !== 'MODERATOR') {
            return reply.status(403).send({
                success: false,
                error: 'Forbidden',
                code: 'INSUFFICIENT_PERMISSIONS',
            });
        }
        const { reportId } = request.params;
        const { action, notes } = request.body;
        const report = await db.report.findUnique({
            where: { id: reportId },
        });
        if (!report) {
            return reply.status(404).send({
                success: false,
                error: 'Report not found',
                code: 'NOT_FOUND',
            });
        }
        // Update report status
        const updated = await db.report.update({
            where: { id: reportId },
            data: {
                status: action === 'dismiss' ? 'DISMISSED' : 'RESOLVED',
                notes,
                resolvedAt: new Date(),
            },
        });
        // If deleting video, update its status
        if (action === 'delete_video') {
            await db.video.update({
                where: { id: report.videoId },
                data: { status: 'REMOVED' },
            });
        }
        return reply.send({
            success: true,
            data: {
                report: updated,
                action,
            },
        });
    }
    catch (error) {
        throw error;
    }
}
/**
 * Get user analytics
 */
async function getUserAnalytics(request, reply) {
    try {
        await request.jwtVerify();
        if (request.user?.role !== 'ADMIN') {
            return reply.status(403).send({
                success: false,
                error: 'Forbidden',
                code: 'INSUFFICIENT_PERMISSIONS',
            });
        }
        // Get user growth over last 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const usersByDay = await db.user.groupBy({
            by: ['createdAt'],
            where: {
                createdAt: { gte: thirtyDaysAgo },
            },
            _count: true,
            orderBy: { createdAt: 'asc' },
        });
        // Get top uploaders
        const topUploaders = await db.video.groupBy({
            by: ['uploaderId'],
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 10,
        });
        return reply.send({
            success: true,
            data: {
                userGrowth: usersByDay,
                topUploaders,
            },
        });
    }
    catch (error) {
        throw error;
    }
}
/**
 * Get platform analytics
 */
async function getPlatformAnalytics(request, reply) {
    try {
        await request.jwtVerify();
        if (request.user?.role !== 'ADMIN') {
            return reply.status(403).send({
                success: false,
                error: 'Forbidden',
                code: 'INSUFFICIENT_PERMISSIONS',
            });
        }
        // Get stats by video status
        const videoStats = await db.video.groupBy({
            by: ['status'],
            _count: true,
        });
        // Get total stats
        const totalViews = await db.video.aggregate({
            _sum: { views: true },
        });
        const totalLikes = await db.video.aggregate({
            _sum: { likes: true },
        });
        return reply.send({
            success: true,
            data: {
                videoStatus: videoStats,
                totalViews: totalViews._sum.views || 0,
                totalLikes: totalLikes._sum.likes || 0,
            },
        });
    }
    catch (error) {
        throw error;
    }
}
/**
 * Register admin routes
 */
export async function registerAdminRoutes(fastify) {
    fastify.get('/api/admin/dashboard', getDashboardStats);
    fastify.get('/api/admin/moderation', getModerationQueue);
    fastify.post('/api/admin/moderation/:videoId', approveVideo);
    fastify.get('/api/admin/reports', getReports);
    fastify.post('/api/admin/reports/:reportId', handleReport);
    fastify.get('/api/admin/analytics/users', getUserAnalytics);
    fastify.get('/api/admin/analytics/platform', getPlatformAnalytics);
}
//# sourceMappingURL=admin.js.map