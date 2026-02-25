# Quick Start Guide

Get the video streaming platform up and running in 5 minutes.

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- FFmpeg (for transcoding)
- Git

## Installation

### 1. Clone & Install Dependencies

```bash
# Clone repository
git clone <repo-url>
cd noobies

# Install all dependencies
npm install

# Build packages
npm run build
```

### 2. Start Services with Docker

```bash
# Start MongoDB, Redis, MinIO (S3 simulation)
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 3. Configure Environment

```bash
# Copy example config
cp .env.example .env

# Edit .env with your settings (optional for local development)
# The defaults use Docker services which are now running
```

### 4. Initialize Database

```bash
# Run migrations
cd packages/db
npx prisma migrate dev

# Or seed with sample data
npx prisma db seed
```

### 5. Start API Server

```bash
cd apps/api

# This starts Fastify with in-process transcoding worker
npm run dev
```

Server will be running at: **http://localhost:3001**

**Health check:**
```bash
curl http://localhost:3001/api/health
```

## Using the API

### Register a User

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "testuser",
    "password": "SecurePass123!"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "user@example.com" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

Save the `accessToken` for subsequent requests.

### Upload a Video

```bash
TOKEN="your-access-token-from-above"

curl -X POST http://localhost:3001/api/videos/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "video=@/path/to/video.mp4" \
  -F "title=My First Video" \
  -F "description=Video description" \
  -F "categoryId=507f1f77bcf86cd799439011"
```

Response:
```json
{
  "success": true,
  "data": {
    "video": {
      "id": "507f...",
      "title": "My First Video",
      "status": "UPLOADED"
    },
    "job": {
      "id": "507f...",
      "status": "queued"
    }
  }
}
```

### Check Transcoding Progress

```bash
JOB_ID="job-id-from-above"
TOKEN="your-access-token"

curl http://localhost:3001/api/videos/upload/$JOB_ID \
  -H "Authorization: Bearer $TOKEN"
```

Response (while processing):
```json
{
  "success": true,
  "data": {
    "job": {
      "id": "507f...",
      "status": "active",
      "progress": 45  // 45% complete
    },
    "video": {
      "id": "507f...",
      "status": "PROCESSING"
    }
  }
}
```

Once complete (progress = 100), video status becomes "READY".

### Get List of Videos

```bash
curl http://localhost:3001/api/videos
```

### Get Single Video with Stream URL

```bash
VIDEO_ID="video-id-from-upload"

curl http://localhost:3001/api/videos/$VIDEO_ID
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "507f...",
    "title": "My First Video",
    "status": "READY",
    "views": 0,
    "videoFiles": [
      {
        "resolution": "360p",
        "url": "http://localhost:9000/videos/507f.../360p/playlist.m3u8"
      },
      {
        "resolution": "480p",
        "url": "http://localhost:9000/videos/507f.../480p/playlist.m3u8"
      },
      // ... 720p, 1080p
    ],
    "thumbnail": {
      "url": "http://localhost:9000/videos/507f.../thumbnail.jpg"
    }
  }
}
```

## Running Separate Workers

For better performance, run transcoding workers as separate processes:

### Terminal 1: Start API Server
```bash
cd apps/api
npm run dev
```

### Terminal 2+: Start Workers
```bash
cd apps/api
npm run worker
```

You can start multiple workers to process videos in parallel:
```bash
npm run worker &  # Worker 1 (background)
npm run worker &  # Worker 2 (background)
npm run worker &  # Worker 3 (background)
```

Monitor queue depth in API logs to see active jobs.

## Testing Video Playback

### Create Test Video

If you don't have a video file, create a simple test video:

```bash
# Generate 10-second test video with ffmpeg
ffmpeg -f lavfi -i testsrc=duration=10:size=320x240:rate=30 \
  -f lavfi -i sine=frequency=1000:duration=10 \
  -pix_fmt yuv420p test-video.mp4
```

### Upload and Stream

```bash
# Upload (replace TOKEN with your access token)
curl -X POST http://localhost:3001/api/videos/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "video=@test-video.mp4" \
  -F "title=Test Video"

# Note the video ID from response
# Wait a few minutes for transcoding...

# Get streaming URL
curl http://localhost:3001/api/videos/{VIDEO_ID}

# Stream in VLC or browser with HLS.js
# Use the 360p URL for fastest playback during testing
```

## Accessing Storage

### MinIO Console (S3 Simulation)

URL: **http://localhost:9001**

Default credentials:
- Username: `minioadmin`
- Password: `minioadmin`

Videos are stored in the `videos` bucket with structure:
```
videos/
└── {videoId}/
    ├── 360p/
    │   ├── playlist.m3u8
    │   ├── segment-0.ts
    │   ├── segment-1.ts
    │   └── ...
    ├── 480p/
    ├── 720p/
    ├── 1080p/
    └── thumbnail.jpg
```

## Accessing MongoDB

### VS Code MongoDB Extension

1. Install "MongoDB for VS Code" extension
2. Click MongoDB icon in sidebar
3. Add new connection: `mongodb://admin:password@localhost:27017`
4. Browse collections

### Mongosh CLI

```bash
mongosh "mongodb://admin:password@localhost:27017/video_platform?authSource=admin"

# List videos
db.Video.find().pretty()

# Check transcoding jobs
db.BullQueue.find().pretty()
```

## Troubleshooting

### FFmpeg Not Found
```bash
# Check if FFmpeg is installed
ffmpeg -version

# If not installed:
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Or update .env with correct path
FFMPEG_PATH="/usr/local/bin/ffmpeg"
```

### Docker Services Not Running
```bash
# Check status
docker-compose ps

# View logs
docker-compose logs

# Restart
docker-compose restart
```

### Transcoding Stuck
```bash
# Check queue
redis-cli

> KEYS *bull*
> LLEN bull:video-transcoding:active

# Clear queue (careful!)
> DEL bull:video-transcoding:*
```

### Out of Disk Space
```bash
# Clean temp files
rm -rf /tmp/video-processing/*

# Check available space
df -h
```

### Database Connection Error
```bash
# Verify MongoDB is running
docker-compose logs mongodb

# Ensure .env has correct DATABASE_URL
# Default: mongodb://admin:password@localhost:27017/video_platform?authSource=admin
```

## API Documentation

Full API docs available in:
- [API Readme](./apps/api/README.md)
- [Upload Pipeline](./apps/api/UPLOAD_PIPELINE.md)
- [Architecture](./ARCHITECTURE.md)

## Project Structure

```
noobies/
├── apps/
│   ├── api/           # Fastify backend
│   ├── web/           # Next.js frontend (coming next)
│   ├── worker/        # Standalone workers (optional)
│   └── recommender/   # Python ML service (upcoming)
├── packages/
│   ├── db/            # Prisma schema & migrations
│   └── types/         # Shared TypeScript types
├── docker-compose.yml
├── .env.example
├── .gitignore
│── ARCHITECTURE.md
└── README.md
```

## Next Steps

1. **Frontend**: Build Next.js video player
   ```bash
   cd apps/web
   npm run dev
   ```

2. **Test API**: Use Postman or curl to test endpoints

3. **Deploy**: Follow production setup guide

4. **Scale**: Add more workers for parallel transcoding

## Common Tasks

### Reset Everything
```bash
# Stop all services
docker-compose down -v

# Clear temp files
rm -rf /tmp/video-processing/*

# Reinstall and restart
npm run build
docker-compose up -d
# ... reinitialize DB ...
```

### View Worker Logs
```bash
# Terminal with workers running
npm run worker

# Press Ctrl+C to stop

# Or check Redis queue status
redis-cli
> LLEN bull:video-transcoding:active
> LLEN bull:video-transcoding:waiting
```

### Monitor Performance
```bash
# Watch FFmpeg process
ps aux | grep ffmpeg

# Check CPU/Memory
top
# Press '1' to see per-core CPU
# Press 'q' to quit

# Check disk space
df -h /tmp/video-processing
du -sh /tmp/video-processing/*
```

## Support

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Check Redis queue status
3. Verify FFmpeg is installed and accessible
4. Check disk space and permissions
5. Review API README and ARCHITECTURE docs

---

**Now you're ready!** 🚀

Upload a video and watch it get transcoded in real-time. The entire process should take 1-5 minutes depending on file size.
