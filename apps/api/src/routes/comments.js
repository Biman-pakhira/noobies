import db from '../lib/db';
/**
 * Get comments for a video
 */
async function getComments(request, reply) {
    try {
        const { id } = request.params;
        const page = parseInt(request.query.page || '1', 10);
        const pageSize = parseInt(request.query.pageSize || '20', 10);
        const skip = (page - 1) * pageSize;
        const [comments, total] = await Promise.all([
            db.comment.findMany({
                where: { videoId: id },
                include: {
                    user: { select: { id: true, username: true, avatarUrl: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: pageSize,
            }),
            db.comment.count({ where: { videoId: id } }),
        ]);
        return reply.send({
            success: true,
            data: {
                items: comments,
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
 * Create a comment
 */
async function createComment(request, reply) {
    try {
        await request.jwtVerify();
        if (!request.user) {
            return reply.status(401).send({
                success: false,
                error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
            });
        }
        const { id } = request.params;
        const { content } = request.body;
        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            return reply.status(400).send({
                success: false,
                error: { message: 'Comment content is required', code: 'INVALID_INPUT' },
            });
        }
        // Verify video exists
        const video = await db.video.findUnique({ where: { id } });
        if (!video) {
            return reply.status(404).send({
                success: false,
                error: { message: 'Video not found', code: 'NOT_FOUND' },
            });
        }
        const comment = await db.comment.create({
            data: {
                videoId: id,
                userId: request.user.userId,
                content: content.trim(),
            },
            include: {
                user: { select: { id: true, username: true, avatarUrl: true } },
            },
        });
        return reply.status(201).send({
            success: true,
            data: comment,
            timestamp: Date.now(),
        });
    }
    catch (error) {
        throw error;
    }
}
/**
 * Delete a comment
 */
async function deleteComment(request, reply) {
    try {
        await request.jwtVerify();
        if (!request.user) {
            return reply.status(401).send({
                success: false,
                error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
            });
        }
        const { commentId } = request.params;
        const comment = await db.comment.findUnique({ where: { id: commentId } });
        if (!comment) {
            return reply.status(404).send({
                success: false,
                error: { message: 'Comment not found', code: 'NOT_FOUND' },
            });
        }
        // Check ownership or admin role
        if (comment.userId !== request.user.userId && request.user.role !== 'ADMIN') {
            return reply.status(403).send({
                success: false,
                error: { message: 'Forbidden', code: 'FORBIDDEN' },
            });
        }
        await db.comment.delete({ where: { id: commentId } });
        return reply.status(204).send();
    }
    catch (error) {
        throw error;
    }
}
/**
 * Register comment routes
 */
export async function registerCommentRoutes(fastify) {
    fastify.get('/api/videos/:id/comments', getComments);
    fastify.post('/api/videos/:id/comments', createComment);
    fastify.delete('/api/comments/:commentId', deleteComment);
}
//# sourceMappingURL=comments.js.map