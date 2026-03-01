import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import db from '@video-platform/db';

/**
 * Like or dislike a video
 */
async function createInteraction(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();

    if (!request.user) {
      return reply.status(401).send({
        success: false,
        error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
      });
    }

    const { id } = request.params as { id: string };
    const { type } = request.body as { type: 'LIKE' | 'DISLIKE' };

    if (!type || !['LIKE', 'DISLIKE'].includes(type)) {
      return reply.status(400).send({
        success: false,
        error: { message: 'Type must be LIKE or DISLIKE', code: 'INVALID_INPUT' },
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

    // Check if interaction already exists
    const existingInteraction = await db.videoInteraction.findUnique({
      where: {
        userId_videoId: {
          userId: request.user.userId,
          videoId: id,
        },
      },
    });

    let interaction;
    if (existingInteraction) {
      // Update if different type, delete if same type (toggle)
      if (existingInteraction.type === type) {
        await db.videoInteraction.delete({
          where: { id: existingInteraction.id },
        });

        // Update video counts
        if (type === 'LIKE') {
          await db.video.update({
            where: { id },
            data: { likes: { decrement: 1 } },
          });
        } else {
          await db.video.update({
            where: { id },
            data: { dislikes: { decrement: 1 } },
          });
        }

        return reply.send({
          success: true,
          data: { action: 'removed' },
          timestamp: Date.now(),
        });
      } else {
        // Change from like to dislike or vice versa
        interaction = await db.videoInteraction.update({
          where: { id: existingInteraction.id },
          data: { type },
        });

        // Update video counts
        if (existingInteraction.type === 'LIKE') {
          await db.video.update({
            where: { id },
            data: { likes: { decrement: 1 }, dislikes: { increment: 1 } },
          });
        } else {
          await db.video.update({
            where: { id },
            data: { dislikes: { decrement: 1 }, likes: { increment: 1 } },
          });
        }
      }
    } else {
      // Create new interaction
      interaction = await db.videoInteraction.create({
        data: {
          userId: request.user.userId,
          videoId: id,
          type,
        },
      });

      // Update video counts
      if (type === 'LIKE') {
        await db.video.update({
          where: { id },
          data: { likes: { increment: 1 } },
        });
      } else {
        await db.video.update({
          where: { id },
          data: { dislikes: { increment: 1 } },
        });
      }
    }

    return reply.status(201).send({
      success: true,
      data: interaction,
      timestamp: Date.now(),
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Remove interaction (like/dislike)
 */
async function removeInteraction(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();

    if (!request.user) {
      return reply.status(401).send({
        success: false,
        error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
      });
    }

    const { id } = request.params as { id: string };

    const interaction = await db.videoInteraction.findFirst({
      where: {
        userId: request.user.userId,
        videoId: id,
      },
    });

    if (!interaction) {
      return reply.status(404).send({
        success: false,
        error: { message: 'Interaction not found', code: 'NOT_FOUND' },
      });
    }

    // Remove interaction
    await db.videoInteraction.delete({ where: { id: interaction.id } });

    // Update video counts
    if (interaction.type === 'LIKE') {
      await db.video.update({
        where: { id },
        data: { likes: { decrement: 1 } },
      });
    } else {
      await db.video.update({
        where: { id },
        data: { dislikes: { decrement: 1 } },
      });
    }

    return reply.status(204).send();
  } catch (error) {
    throw error;
  }
}

/**
 * Register interaction routes
 */
export async function registerInteractionRoutes(fastify: FastifyInstance) {
  fastify.post<{ Params: { id: string } }>('/api/videos/:id/interact', createInteraction);
  fastify.delete<{ Params: { id: string } }>('/api/videos/:id/interact', removeInteraction);
}
