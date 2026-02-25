# Video Upload & FFmpeg Transcoding Pipeline

Complete video uploading and transcoding system backed by BullMQ and FFmpeg.

## Features

- ✅ Video file upload handling with multipart streams
- ✅ Automatic FFmpeg transcoding to multiple qualities (360p, 480p, 720p, 1080p)
- ✅ HLS (HTTP Live Streaming) format for adaptive bitrate playback
- ✅ Automatic thumbnail generation
- ✅ BullMQ job queue for async processing
- ✅ CloudFlare R2 and AWS S3 support
- ✅ Progress tracking and job status
- ✅ Graceful error handling and retries
- ✅ Concurrent transcoding with configurable workers

## Architecture

### Services

#### Storage Service (`services/storage.ts`)
Abstract storage provider supporting:
- **AWS S3**: Full S3 API support
- **Cloudflare R2**: S3-compatible endpoint
- File upload/download/deletion with CDN URLs

#### FFmpeg Service (`services/ffmpeg.ts`)
Transcoding utilities:
- Video metadata extraction (duration, resolution, bitrate)
- HLS transcoding to multiple resolutions
- Adaptive bitrate encoding (800kbps - 5000kbps)
- Thumbnail generation at specific timestamps
- Frame extraction

#### Transcoding Queue (`services/transcoding.ts`)
BullMQ-based job queue:
- Queue management with Redis
- Worker process for async transcoding
- Job progress tracking
- Automatic retries with exponential backoff
- Job persistence and recovery

### Routes

#### Upload Routes (`routes/upload.ts`)
- `POST /api/videos/upload` - Upload new video
- `GET /api/videos/upload/:jobId` - Get upload status
- `DELETE /api/videos/:id` - Delete video (owner/admin only)

## Video Upload Flow

```
1. User uploads video file (multipart form)
   ↓
2. Validate file (type, size)
   ↓
3. Save to temporary location
   ↓
4. Create video record (status: UPLOADED)
   ↓
5. Queue transcoding job
   ↓
6. Return 202 Accepted with job ID
   
--- Async Processing ---

7. Worker picks up job
   ↓
8. Extract metadata (duration, resolution)
   ↓
9. Transcode to 4 quality levels (HLS)
   ↓ (each level: 2-5 minutes depending on size)
10. Generate thumbnail from keyframe
   ↓
11. Upload all files to S3/R2
   ↓
12. Save file metadata to database
   ↓
13. Update video status to READY
   ↓
14. Cleanup temporary files
```

## Upload Request Example

```bash
curl -X POST http://localhost:3001/api/videos/upload \
  -H "Authorization: Bearer <token>" \
  -F "video=@video.mp4" \
  -F "title=My Video" \
  -F "description=Video description" \
  -F "categoryId=507f1f77bcf86cd799439011" \
  -F "tags=tutorial,javascript,react"
```

Response (202 Accepted):
```json
{
  "success": true,
  "data": {
    "video": {
      "id": "507f1f77bcf86cd799439011",
      "title": "My Video",
      "status": "UPLOADED",
      "createdAt": "2026-02-25T10:30:00Z"
    },
    "job": {
      "id": "507f1f77bcf86cd799439011",
      "status": "queued"
    }
  }
}
```

## Check Upload Status

```bash
curl http://localhost:3001/api/videos/upload/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <token>"
```

Response:
```json
{
  "success": true,
  "data": {
    "job": {
      "id": "507f1f77bcf86cd799439011",
      "status": "active",
      "progress": 45,
      "data": {...}
    },
    "video": {
      "id": "507f1f77bcf86cd799439011",
      "title": "My Video",
      "status": "PROCESSING",
      "duration": null,
      "videoFiles": []
    }
  }
}
```

## Configuration

### Environment Variables

```env
# Video Processing
FFMPEG_PATH=/usr/bin/ffmpeg
FFMPEG_OUTPUT_DIR=/tmp/video-processing

# Storage - AWS S3
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=video-platform-videos
AWS_REGION=us-east-1

# Storage - Cloudflare R2
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=video-platform-videos
R2_REGION=us-east-1

# CDN
CDN_URL=https://cdn.example.com

# Queue
REDIS_URL=redis://localhost:6379
```

## Worker Setup

### In-Process Worker
The worker starts automatically with the API server. To run separately:

```bash
npm run worker
```

### Distributed Worker Setup
For production with multiple workers:

```bash
# Terminal 1: Start API server
npm run dev

# Terminal 2+: Start additional workers
npm run worker
npm run worker
npm run worker
```

All workers connect to the same Redis queue and process jobs concurrently.

## Quality Settings

| Resolution | Bitrate | Dimensions | Use Case |
|-----------|---------|-----------|----------|
| 360p | 800 kbps | 640×360 | Mobile, Low Bandwidth |
| 480p | 1500 kbps | 854×480 | Mobile, Standard |
| 720p | 2500 kbps | 1280×720 | Desktop, HD |
| 1080p | 5000 kbps | 1920×1080 | Desktop, Full HD |

Each quality includes:
- H.264 video codec
- AAC audio at 128 kbps
- 10-second HLS segments
- Individual .ts segment files
- Master .m3u8 playlist

## Storage

### File Organization

```
s3://bucket/
├── videos/
│   ├── {videoId}/
│   │   ├── 360p/
│   │   │   ├── playlist.m3u8
│   │   │   ├── segment-0.ts
│   │   │   ├── segment-1.ts
│   │   │   └── ...
│   │   ├── 480p/
│   │   ├── 720p/
│   │   ├── 1080p/
│   │   └── thumbnail.jpg
```

### CDN Delivery

Files are accessed through CDN with URL pattern:
```
https://cdn.example.com/videos/{videoId}/{resolution}/playlist.m3u8
https://cdn.example.com/videos/{videoId}/thumbnail.jpg
```

## Transcoding Performance

Typical transcoding times (for 1 hour video):
- **360p**: 15-20 minutes
- **480p**: 20-25 minutes
- **720p**: 30-40 minutes
- **1080p**: 40-60 minutes
- **Total**: ~2 hours (sequential) or ~60 minutes (parallel)

With 2 concurrent workers, expect ~1 hour for full transcoding.

## Error Handling

### Automatic Retries
Failed jobs automatically retry with exponential backoff:
- Attempt 1: Immediate
- Attempt 2: 2 seconds later
- Attempt 3: 4 seconds later

Maximum 3 attempts before marking as failed.

### Failed Status
If transcoding fails after retries:
1. Video status set to `FAILED`
2. Error logged with job ID
3. User can view error and re-upload
4. All temporary files cleaned up

## Best Practices

1. **File Size**: Keep under 10GB for stable processing
2. **Formats**: Use MP4 or MOV for best compatibility
3. **Bitrate**: 5-20 Mbps input bitrate recommended
4. **Worker Pool**: Run 2-4 workers per CPU core
5. **Storage**: Use S3/R2 for reliability and CDN integration
6. **Monitoring**: Track queue depth and job progress

## Troubleshooting

### Transcoding Stuck
Check queue status:
```bash
curl http://localhost:6379
KEYS *
LLEN bull:video-transcoding:active
```

### FFmpeg Not Found
Ensure FFmpeg is installed:
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Verify
ffmpeg -version
```

### Out of Disk Space
Increase temp storage or clean old files:
```bash
rm -rf /tmp/video-processing/*
```

### S3 Authentication
Verify AWS credentials:
```bash
aws s3 ls
```

## Next Steps

1. Frontend video player with HLS.js
2. User watch history tracking
3. Video analytics and metrics
4. Content moderation pipeline
5. CDN prefetching for popular videos
