import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fastifyMultipart from '@fastify/multipart';
import db from '../lib/db.js';
import { getTranscodingQueue } from '../services/transcoding.js';
// unused
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Register multipart plugin
 */
export async function registerMultipartPlugin(fastify: FastifyInstance) {
  await fastify.register(fastifyMultipart, {
    limits: {
      fileSize: 10 * 1024 * 1024 * 1024, // 10GB
    },
  });
}

/**
 * Upload video
 */
async function uploadVideo(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();

    if (!request.user) {
      return reply.status(401).send({
        success: false,
        error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
      });
    }

    // Create temporary file
    const uploadDir = process.env.FFMPEG_OUTPUT_DIR || '/tmp/video-processing';
    await fs.mkdir(uploadDir, { recursive: true });

    let videoFile: { filename: string, mimetype: string } | null = null;
    let title = '';
    let description = '';
    let categoryId = '';
    let tagNames: string[] = [];
    let tempPath = '';
    let fileName = '';

    const allowedMimeTypes = [
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-matroska',
    ];

    const parts = request.parts();
    for await (const part of parts) {
      if (part.type === 'file' && part.fieldname === 'video') {
        if (!allowedMimeTypes.includes(part.mimetype)) {
          return reply.status(400).send({
            success: false,
            error: {
              message: `Invalid video format. Allowed: ${allowedMimeTypes.join(', ')}`,
              code: 'INVALID_FORMAT',
            },
          });
        }

        fileName = `${Date.now()}-${part.filename}`;
        tempPath = path.join(uploadDir, fileName);

        const fileHandle = await fs.open(tempPath, 'w');
        const writeStream = fileHandle.createWriteStream();

        await new Promise((resolve, reject) => {
          part.file.pipe(writeStream);
          writeStream.on('finish', () => resolve(true));
          writeStream.on('error', reject);
        });

        await fileHandle.close();
        videoFile = { filename: part.filename, mimetype: part.mimetype };
      } else if (part.type === 'field') {
        if (part.fieldname === 'title') {
          title = part.value as string;
        } else if (part.fieldname === 'description') {
          description = part.value as string;
        } else if (part.fieldname === 'categoryId') {
          categoryId = part.value as string;
        } else if (part.fieldname === 'tags') {
          tagNames = (part.value as string).split(',').map((t) => t.trim());
        }
      }
    }

    // Validate input after parsing all parts
    if (!tempPath || !title) {
      return reply.status(400).send({
        success: false,
        error: {
          message: 'Video file and title are required',
          code: 'INVALID_INPUT',
        },
      });
    }

    // ── Step 1: Create video record in DB (always, regardless of queue state) ──
    const video = await db.video.create({
      data: {
        title,
        description,
        uploaderId: request.user.userId,
        status: 'UPLOADED',
        isPublic: true,
        ...(categoryId && { categoryId }),
      },
    });

    // Connect tags
    if (tagNames.length > 0) {
      const connectedTags = await Promise.all(
        tagNames.map(async (tagName) => {
          let tag = await db.tag.findFirst({
            where: { name: { equals: tagName, mode: 'insensitive' } },
          });

          if (!tag) {
            tag = await db.tag.create({
              data: {
                name: tagName,
                slug: tagName.toLowerCase().replace(/\s+/g, '-'),
              },
            });
          }

          return tag;
        })
      );

      await db.video.update({
        where: { id: video.id },
        data: {
          tagIds: connectedTags.map((t) => t.id),
        },
      });
    }

    // ── Step 2: Queue transcoding job (best-effort — graceful if Redis is down) ──
    let jobId: string | undefined;
    try {
      const transcodingQueue = getTranscodingQueue();
      jobId = await transcodingQueue.addJob({
        videoId: video.id,
        uploadPath: tempPath,
        resolutions: ['360p', '480p', '720p', '1080p'],
      }) as string | undefined;
    } catch (queueErr: any) {
      // Redis unavailable — the DB record is already saved, log and continue.
      console.warn(
        `⚠️  Could not queue transcoding job for video ${video.id}: ${queueErr.message}`,
      );
      jobId = `local-${video.id}`;
    }

    return reply.status(202).send({
      success: true,
      data: {
        video: {
          id: video.id,
          title: video.title,
          status: video.status,
          createdAt: video.createdAt,
        },
        job: {
          id: jobId ?? `local-${video.id}`,
          status: 'queued',
        },
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

/**
 * Get upload status
 */
async function getUploadStatus(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { jobId } = request.params as { jobId: string };

    // Basic ObjectID validation for MongoDB
    if (!jobId || !/^[0-9a-fA-F]{24}$/.test(jobId)) {
      return reply.status(400).send({
        success: false,
        error: { message: 'Invalid job or video ID format', code: 'INVALID_ID' },
      });
    }

    const transcodingQueue = getTranscodingQueue();
    const jobStatus = await transcodingQueue.getJobStatus(jobId);

    if (!jobStatus) {
      return reply.status(404).send({
        success: false,
        error: { message: 'Job not found', code: 'NOT_FOUND' },
      });
    }

    // Also get video status
    const video = await db.video.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        title: true,
        status: true,
        duration: true,
        videoFiles: { select: { resolution: true } },
      },
    });

    return reply.send({
      success: true,
      data: {
        job: jobStatus,
        video,
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Delete video
 */
async function deleteVideo(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();

    if (!request.user) {
      return reply.status(401).send({
        success: false,
        error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
      });
    }

    const { id } = request.params as { id: string };

    const video = await db.video.findUnique({ where: { id } });

    if (!video) {
      return reply.status(404).send({
        success: false,
        error: { message: 'Video not found', code: 'NOT_FOUND' },
      });
    }

    // Check ownership or admin role
    if (video.uploaderId !== request.user.userId && request.user.role !== 'ADMIN') {
      return reply.status(403).send({
        success: false,
        error: { message: 'Forbidden', code: 'FORBIDDEN' },
      });
    }

    // Delete video and related records
    await db.video.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    return reply.status(204).send();
  } catch (error) {
    throw error;
  }
}

/**
 * Register video upload routes
 */
export async function registerVideoUploadRoutes(fastify: FastifyInstance) {
  await registerMultipartPlugin(fastify);

  fastify.post('/api/videos/upload', { onRequest: [fastify.authenticate] }, uploadVideo);
  fastify.get<{ Params: { jobId: string } }>('/api/videos/upload/:jobId', getUploadStatus);
  fastify.delete<{ Params: { id: string } }>('/api/videos/:id', deleteVideo);
}
