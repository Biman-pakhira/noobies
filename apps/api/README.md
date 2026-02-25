# Fastify API

Backend API built with Fastify, MongoDB, and TypeScript.

## Features

- ✅ JWT-based authentication (access + refresh tokens)
- ✅ User registration and login
- ✅ User profiles and preferences
- ✅ Watch history tracking
- ✅ Video listing and search
- ✅ **Video upload with FFmpeg transcoding**
- ✅ **HLS multi-quality streaming (360p, 480p, 720p, 1080p)**
- ✅ **CloudFlare R2 and AWS S3 storage**
- ✅ **BullMQ async job queue for transcoding**
- ✅ Comments system
- ✅ Like/dislike videos
- ✅ Playlists management
- ✅ Error handling and validation
- ✅ Request logging

## Project Structure

```
src/
  ├── config/           # Configuration files
  │   └── aws.ts        # AWS SDK setup
  ├── routes/           # API route handlers
  │   ├── auth.ts       # Authentication routes
  │   ├── users.ts      # User profile routes
  │   ├── videos.ts     # Video listing routes
  │   ├── comments.ts   # Comments routes
  │   ├── interactions.ts # Like/dislike routes
  │   ├── upload.ts     # Video upload & transcoding routes
  │   └── recommendations.ts # Recommendation routes
  ├── services/         # Business logic services
  │   ├── storage.ts    # S3/R2 storage provider
  │   ├── ffmpeg.ts     # FFmpeg transcoding operations
  │   └── transcoding.ts # BullMQ job queue management
  ├── middleware/       # Fastify middleware
  │   └── auth.ts       # JWT verification
  ├── schemas/          # Zod validation schemas
  │   └── auth.ts       # Auth input validation
  ├── utils/            # Utility functions
  │   ├── password.ts   # Password hashing
  │   ├── jwt.ts        # JWT utilities
  │   ├── error.ts      # Error handling
  │   └── helpers.ts    # Helper functions
  ├── worker.ts         # Standalone transcoding worker
  ├── index.ts          # App factory
  └── server.ts         # Server startup
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/me` - Get current user profile (requires auth)
- `GET /api/users/me/history` - Get watch history (requires auth)
- `GET /api/users/me/likes` - Get liked videos (requires auth)
- `GET /api/users/me/playlists` - Get user playlists (requires auth)
- `POST /api/users/me/playlists` - Create playlist (requires auth)
Video Upload & Transcoding
- `POST /api/videos/upload` - Upload video for transcoding (requires auth)
- `GET /api/videos/upload/:jobId` - Check upload/transcoding status (requires auth)
- `DELETE /api/videos/:id` - Delete video (requires auth)

### Comments
- `GET /api/videos/:id/comments` - Get video comments
- `POST /api/videos/:id/comments` - Create comment (requires auth)
- `DELETE /api/comments/:commentId` - Delete comment (requires auth)

### Interactions
- `POST /api/videos/:id/like` - Like video (requires auth)
- `POST /api/videos/:id/dislike` - Dislike video (requires auth)

### Recommendations
- `GET /api/recommendations` - Get personalized recommendations
- `GET /api/videos/:id/stream` - Get video stream URL
- `GET /api/videos/trending` - Get trending videos

### Comments
- `GET /api/videos/:id/comments` - Get video comments
- `POST /api/videos/:id/comments` - Create comment (requires auth)
- `DELETE /api/comments/:commentId` - Delete comment (requires auth)

## Authentication

The API uses JWT (JSON Web Tokens) with:
- **Access tokens**: 15 minutes expiry
- **Refresh tokens**: 7 days expiry

Include the access token in the `Authorization` header:
```
Authorization: Bearer <access_token>
```

## Error Handling

All errors follow a consistent format:
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
  },
  "timestamp": 1234567890
}
```

## Environment Variables

See `.env.example` for required variables:

### Core Variables
- `DATABASE_URL` - MongoDB connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - Refresh token signing secret
- `API_PORT` - API port (default: 3001)
- `API_HOST` - API host (default: 0.0.0.0)
- `LOG_LEVEL` - Logging level (default: info)

### Video Processing Variables
- `FFMPEG_PATH` - Path to ffmpeg binary (default: ffmpeg)
- `FFMPEG_OUTPUT_DIR` - Temporary directory for transcoding output (default: /tmp/video-processing)
- `MAX_VIDEO_SIZE` - Maximum upload size in bytes (default: 10GB)

### Storage Variables (Choose one)

**AWS S3:**
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_S3_BUCKET` - S3 bucket name
- `AWS_REGION` - AWS region

**Cloudflare R2:**
- `R2_ACCOUNT_ID` - Cloudflare account ID
- `R2_ACCESS_KEY_ID` - R2 access key
- `R2_SECRET_ACCESS_KEY` - R2 secret key
- `R2_BUCKET_NAME` - R2 bucket name
- `R2_REGION` - R2 region (default: auto)

**CDN:**
- `CDN_URL` - CDN base URL for serving videos

## Development

### Start API Server
```bash
# Install dependencies
npm install

# Start development server (includes in-process transcoding worker)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Run Separate Transcoding Workers
For✅ Video upload and transcoding routes
2. Frontend (Next.js with video player)
3. Search with Elasticsearch
4. Admin dashboard routes
5. Analytics tracking
6pm run dev

# Terminal 2+: Start additional workers
npm run worker
npm run worker
npm run worker
```

All workers share the same BullMQ queue via Redis and process jobs concurrently.

## Video Upload Pipeline

### Upload a Video
```bash
curl -X POST http://localhost:3001/api/videos/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "video=@video.mp4" \
  -F "title=My Video" \
  -F "description=Video description" \
  -F "categoryId=507f1f77bcf86cd799439011" \
  -F "tags=tutorial,javascript"
```

### Response (202 Accepted)
```json
{
  "success": true,
  "data": {
    "video": {
      "id": "507f1f77bcf86cd799439011",
      "title": "My Video",
      "status": "UPLOADED"
    },
    "job": {
      "id": "507f1f77bcf86cd799439011",
      "status": "queued"
    }
  }
}
```

### Check Upload Status
```bash
curl http://localhost:3001/api/videos/upload/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer $TOKEN"
```

### Processing Pipeline
1. User uploads video file (multipart form)
2. File validated and saved temporarily
3. Transcoding job queued to BullMQ
4. Returns 202 Accepted with job ID
5. **Background Worker:**
   - Extracts video metadata (duration, resolution)
   - Transcodes to 4 quality levels (360p, 480p, 720p, 1080p)
   - Generates thumbnail image
   - Uploads all files to S3/R2 storage
   - Saves file references to MongoDB
   - Updates video status to 'READY'
   - Cleans up temporary files
6. Client polls status endpoint to track progress

For detailed documentation, see [UPLOAD_PIPELINE.md](./UPLOAD_PIPELINE.md)

## Next Steps

1. Video upload and transcoding routes
2. Search with Elasticsearch
3. Admin dashboard routes
4. Analytics tracking
5. Recommendation system integration
