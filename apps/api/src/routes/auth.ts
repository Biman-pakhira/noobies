import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import db from '../lib/db';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { JWT_CONFIG } from '../utils/jwt.js';
import { registerSchema, loginSchema, refreshSchema, RegisterInput, LoginInput, RefreshInput } from '../schemas/auth.js';
// unused

/**
 * Register a new user
 */
async function register(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Validate input
    const data = registerSchema.parse(request.body);

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }],
      },
    });

    if (existingUser) {
      return reply.status(409).send({
        success: false,
        error: {
          message:
            existingUser.email === data.email ? 'Email already registered' : 'Username already taken',
          code: 'CONFLICT',
        },
      });
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await db.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash,
        role: 'USER',
      },
    });

    // Generate tokens
    const accessToken = request.server.jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      { expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = request.server.jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      { expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRY }
    );

    // Store refresh token in DB
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await db.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt,
      },
    });

    return reply.status(201).send({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return reply.status(400).send({
        success: false,
        error: {
          message: 'Validation error',
          code: 'INVALID_INPUT',
        },
      });
    }

    throw error;
  }
}

/**
 * Login user
 */
async function login(request: FastifyRequest, reply: FastifyReply) {
  try {
    const data = loginSchema.parse(request.body);

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return reply.status(401).send({
        success: false,
        error: {
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
        },
      });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(data.password, user.passwordHash);

    if (!isPasswordValid) {
      return reply.status(401).send({
        success: false,
        error: {
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
        },
      });
    }

    // Generate tokens
    const accessToken = request.server.jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      { expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = request.server.jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      { expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRY }
    );

    // Store refresh token in DB
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt,
      },
    });

    return reply.status(200).send({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return reply.status(400).send({
        success: false,
        error: {
          message: 'Validation error',
          code: 'INVALID_INPUT',
        },
      });
    }

    throw error;
  }
}

/**
 * Refresh access token
 */
async function refresh(request: FastifyRequest, reply: FastifyReply) {
  try {
    const data = refreshSchema.parse(request.body);

    // Verify refresh token
    try {
      const decoded = request.server.jwt.verify(data.refreshToken) as any;

      // Check if token exists in DB
      const tokenRecord = await db.refreshToken.findUnique({
        where: { token: data.refreshToken },
      });

      if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
        return reply.status(401).send({
          success: false,
          error: {
            message: 'Invalid or expired refresh token',
            code: 'INVALID_REFRESH_TOKEN',
          },
        });
      }

      // Generate new access token
      const accessToken = request.server.jwt.sign(
        {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
        },
        { expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY }
      );

      return reply.status(200).send({
        success: true,
        data: {
          accessToken,
        },
        timestamp: Date.now(),
      });
    } catch (error) {
      return reply.status(401).send({
        success: false,
        error: {
          message: 'Invalid refresh token',
          code: 'INVALID_REFRESH_TOKEN',
        },
      });
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return reply.status(400).send({
        success: false,
        error: {
          message: 'Validation error',
          code: 'INVALID_INPUT',
        },
      });
    }

    throw error;
  }
}

/**
 * Logout user (invalidate refresh token)
 */
async function logout(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();

    if (!request.user) {
      return reply.status(401).send({
        success: false,
        error: {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        },
      });
    }

    // Delete all refresh tokens for this user
    await db.refreshToken.deleteMany({
      where: { userId: request.user.userId },
    });

    return reply.status(200).send({
      success: true,
      data: null,
      timestamp: Date.now(),
    });
  } catch (error) {
    return reply.status(401).send({
      success: false,
      error: {
        message: 'Unauthorized',
        code: 'UNAUTHORIZED',
      },
    });
  }
}

/**
 * Register auth routes
 */
export async function registerAuthRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: RegisterInput }>('/api/auth/register', register);
  fastify.post<{ Body: LoginInput }>('/api/auth/login', login);
  fastify.post<{ Body: RefreshInput }>('/api/auth/refresh', refresh);
  fastify.post('/api/auth/logout', { onRequest: [fastify.authenticate] }, logout);
}
