import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from '@video-platform/db';

/**
 * Get all videos (with pagination and filtering)
 */
async function getVideos(request: FastifyRequest, reply: FastifyReply) {
  try {
    const page = parseInt((request.query as any).page || '1', 10);
    const pageSize = parseInt((request.query as any).pageSize || '20', 10);
    const sort = (request.query as any).sort || 'newest'; // newest, mostViewed, topRated
    const categoryId = (request.query as any).categoryId;

    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: any = { status: 'READY', isPublic: true };
    if (categoryId) where.categoryId = categoryId;

    // Build order by
    const orderBy: any = {};
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
          tags: { select: { name: true, slug: true } },
          category: { select: { id: true, name: true, slug: true } },
        },
        orderBy,
        skip,
        take: pageSize,
      }),
      db.video.count({ where }),
    ]);

    return reply.send({
      success: true,
      data: {
        items: videos,
        total,
        page,
        pageSize,
        hasMore: skip + pageSize < total,
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Get single video by ID
 */
async function getVideoById(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };

    const video = await db.video.findUnique({
      where: { id },
      include: {
        uploader: { select: { id: true, username: true, avatarUrl: true, bio: true } },
        videoFiles: true,
        thumbnails: true,
        tags: true,
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

    return reply.send({
      success: true,
      data: video,
      timestamp: Date.now(),
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Get trending videos
 */
async function getTrendingVideos(request: FastifyRequest, reply: FastifyReply) {
  try {
    const limit = parseInt((request.query as any).limit || '20', 10);
    const days = parseInt((request.query as any).days || '7', 10);

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

    return reply.send({
      success: true,
      data: videos,
      timestamp: Date.now(),
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Get HLS stream URL for a video
 */
async function getVideoStream(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };

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

    // Return HLS master playlist URL or redirect to CDN
    const resolution = (request.query as any).resolution || '720p';
    const hlsFile = video.videoFiles.find((f) => f.resolution === `RES_${resolution.toUpperCase()}`);

    if (!hlsFile) {
      return reply.status(404).send({
        success: false,
        error: { message: 'Resolution not available', code: 'NOT_FOUND' },
      });
    }

    // Redirect to CDN or return URL
    return reply.redirect(hlsFile.fileUrl);
  } catch (error) {
    throw error;
  }
}

/**
 * Register video routes
 */
export async function registerVideoRoutes(fastify: FastifyInstance) {
  fastify.get('/api/videos', getVideos);
  fastify.get('/api/videos/trending', getTrendingVideos);
  fastify.get<{ Params: { id: string } }>('/api/videos/:id', getVideoById);
  fastify.get<{ Params: { id: string } }>('/api/videos/:id/stream', getVideoStream);
}
