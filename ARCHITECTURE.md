# Video Streaming Platform Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Frontend (Next.js)                          │
│  • Video player with HLS.js                                         │
│  • Upload form                                                       │
│  • User dashboard                                                    │
└────────────────┬──────────────────────────────────────────────────────┘
                 │ HTTP/REST
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API Server (Fastify)                           │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ Routes                                                      │    │
│  │ • /api/auth/*         (register, login, refresh, logout)   │    │
│  │ • /api/videos/*       (list, get, trending, stream)        │    │
│  │ • /api/videos/upload  (multipart video upload)             │    │
│  │ • /api/comments/*     (CRUD)                               │    │
│  │ • /api/interactions/* (like/dislike)                       │    │
│  │ • /api/users/*        (profile, history, playlists)        │    │
│  └────────────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ Middleware & Services                                       │    │
│  │ • JWT Authentication                                        │    │
│  │ • Error Handling                                            │    │
│  │ • Request Logging                                           │    │
│  └────────────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ Transcoding Pipeline                                        │    │
│  │ • Upload handler (multipart parsing)                       │    │
│  │ • Storage provider (S3/R2)                                 │    │
│  │ • FFmpeg transcoder                                         │    │
│  │ • BullMQ queue manager                                      │    │
│  └────────────────────────────────────────────────────────────┘    │
└────────────┬─────────────────────────────────────────────────────────┘
             │
    ┌────────┴────────┬──────────────────┬──────────────┐
    ▼                 ▼                  ▼              ▼
┌─────────────┐ ┌──────────────┐  ┌──────────────┐ ┌──────────────┐
│  MongoDB    │ │    Redis     │  │ Storage (S3) │ │ Elasticsearch│
│             │ │              │  │  or R2       │ │              │
│ • Users     │ │ • Sessions   │  │              │ │ • Full-text  │
│ • Videos    │ │ • Cache      │  │ • Video HLS  │ │   search     │
│ • Comments  │ │ • Job Queue  │  │ • Thumbnails │ │ • Analytics  │
│ • History   │ │ • Rate limit │  │ • Metadata   │ │              │
└─────────────┘ └──────────────┘  └──────────────┘ └──────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Background Workers (Standalone or In-Process)             │
│  ┌────────────────────────────────────────────────────────┐│
│  │ Transcoding Worker (BullMQ)                            ││
│  │ • Listen for upload jobs                              ││
│  │ • Extract metadata with FFmpeg                        ││
│  │ • Transcode to 4 quality levels (HLS)                ││
│  │ • Generate thumbnails                                ││
│  │ • Upload results to S3/R2                            ││
│  │ • Update database with file references               ││
│  │ • Process status: queued → active → completed        ││
│  └────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. API Server (Fastify)
**Location**: `/apps/api/src/`

**Responsibilities**:
- Handle HTTP requests
- Validate and parse input data
- Manage user authentication
- Coordinate with database and services
- Return structured responses

**Key Features**:
- CORS and security headers
- Helmet for security
- Request logging with Pino
- JWT-based authentication
- Error handling middleware

### 2. Video Upload & Transcoding Pipeline

#### Upload Handler (`routes/upload.ts`)
- Receives multipart video uploads
- Validates file type (mp4, quicktime, avi, mkv)
- Creates temporary file
- Creates Video record in database
- Queues transcoding job
- Returns 202 Accepted response

**Response Flow**:
```
POST /api/videos/upload
  ↓
Parse multipart form
  ↓
Validate file type & size
  ↓
Save to temporary location
  ↓
Create Video record (status: UPLOADED)
  ↓
Create/connect tags
  ↓
Queue BullMQ job
  ↓
Return 202 Accepted with job ID
```

#### Storage Provider (`services/storage.ts`)
Abstracts storage backend (S3 or Cloudflare R2)

**Interface**:
```typescript
interface StorageProvider {
  uploadFile(filePath: string, key: string): Promise<url>
  deleteFile(key: string): Promise<void>
  getUrl(key: string): Promise<url>
}
```

**Key Features**:
- Auto-detects R2 vs S3 based on credentials
- Handles multipart uploads
- Returns CDN-ready URLs
- Error handling and retries

#### FFmpeg Service (`services/ffmpeg.ts`)
Video transcoding operations

**Functions**:
- `getVideoMetadata()`: Extract duration, resolution, bitrate
- `transcodeToHLS()`: Multi-quality HLS transcoding
- `generateThumbnail()`: Extract thumbnail at timestamp

**Quality Levels**:
| Resolution | Bitrate | Dimensions | 
|-----------|---------|-----------|
| 360p | 800 kbps | 640×360 |
| 480p | 1500 kbps | 854×480 |
| 720p | 2500 kbps | 1280×720 |
| 1080p | 5000 kbps | 1920×1080 |

#### Transcoding Queue (`services/transcoding.ts`)
BullMQ-based background job processing

**Architecture**:
```
API Server
    ↓
Queue.addJob(videoId, uploadPath, resolutions)
    ↓
Job stored in Redis Queue
    ↓
Worker picks up job
    ↓
Process job (extract metadata, transcode, upload)
    ↓
Update database with results
    ↓
Job marked as completed
```

**Worker Process**:
1. **Metadata Extraction** (10%)
   - Use FFmpeg to get video info
   - Extract duration, resolution, bitrate

2. **Transcoding** (30-90%)
   - Transcode to each quality level
   - Output HLS format with .m3u8 playlist
   - 10-second segments for adaptive playback

3. **Thumbnail Generation** (90%)
   - Extract frame at 25% of duration
   - Save as JPEG

4. **Storage Upload** (90-95%)
   - Upload all HLS files to S3/R2
   - Upload thumbnail
   - Organize in bucket: `videos/{videoId}/{resolution}/`

5. **Database Update** (95-99%)
   - Create VideoFile records for each resolution
   - Create Thumbnail record
   - Update Video status to 'READY'

6. **Cleanup** (100%)
   - Delete temporary files
   - Mark job as completed

**Configuration**:
- Concurrent workers: 2 max
- Retry attempts: 3
- Exponential backoff: 2s → 4s → 8s
- Job timeout: None (long-running operations)

#### Worker Management (`worker.ts`)
Standalone worker process

**Usage**:
```bash
# In-process (automatic with API server)
npm run dev

# Separate process
npm run worker

# Multiple workers for parallel processing
npm run worker &  # background 1
npm run worker &  # background 2
npm run worker &  # background 3
```

### 3. Database (MongoDB)

**Models**:
- **User**: Profile, authentication, role
- **Video**: Metadata, status, views
- **VideoFile**: HLS files per resolution
- **Thumbnail**: Video preview images
- **Comment**: Nested under videos
- **WatchHistory**: Playback tracking
- **Playlist**: User video collections
- **VideoInteraction**: Likes/dislikes
- **RefreshToken**: Valid tokens for rotation
- **Report**: Content moderation
- **VideoAnalytics**: Performance metrics
- **UserAnalytics**: User engagement metrics

**Relationships**:
```typescript
User
  ├── hasMany Videos (authorId)
  ├── hasMany Comments (authorId)
  ├── hasMany Playlists (userId)
  ├── hasMany WatchHistory (userId)
  ├── hasMany VideoInteractions (userId)
  └── hasMany RefreshTokens (userId)

Video
  ├── hasOne User (author)
  ├── hasMany VideoFiles (resolutions)
  ├── hasOne Thumbnail
  ├── hasMany Comments
  ├── hasMany VideoInteractions
  ├── hasMany PlaylistVideos
  ├── hasMany WatchHistory
  ├── hasMany Reports
  └── hasOne VideoAnalytics
```

### 4. Redis
**Purposes**:
- **Session Storage**: JWT refresh tokens
- **Cache**: Frequently accessed data
- **Job Queue**: BullMQ transcoding jobs
- **Rate Limiting**: API request throttling

### 5. Search (Elasticsearch)
**Purposes**:
- Full-text search on video titles/descriptions
- Autocomplete suggestions
- Advanced filtering (category, date, duration)
- Analytics aggregation

### 6. Analytics (ClickHouse)
**Purposes**:
- High-performance event logging
- Watch time analytics
- User behavior tracking
- Performance metrics

### 7. AI Recommendations (Python Service)
**Purpose**: Personalized video recommendations

**Algorithms**:
- Collaborative filtering (watch history + likes)
- Content-based filtering (tags, categories)
- Trending fallback for new users

## Data Flow Examples

### Video Upload Flow
```
1. User selects video file
   ↓ (multipart form)
2. API validates and saves file
   ↓
3. Creates Video record (status: UPLOADED)
   ↓
4. Queues transcoding job to BullMQ
   ↓
5. Returns 202 Accepted with job ID
   
--- Async Processing (Background Worker) ---

6. Worker receives job from queue
   ↓
7. Extracts video metadata (duration, resolution)
   ↓
8. Starts FFmpeg transcoding to 4 qualities
   ├─ 360p (800 kbps)
   ├─ 480p (1500 kbps)
   ├─ 720p (2500 kbps)
   └─ 1080p (5000 kbps)
   ↓
9. Generates thumbnail at 25% mark
   ↓
10. Uploads all files to S3/R2
    └─ videos/{videoId}/360p/playlist.m3u8
    └─ videos/{videoId}/480p/playlist.m3u8
    └─ videos/{videoId}/720p/playlist.m3u8
    └─ videos/{videoId}/1080p/playlist.m3u8
    └─ videos/{videoId}/thumbnail.jpg
   ↓
11. Creates VideoFile + Thumbnail records in MongoDB
   ↓
12. Updates Video status to READY
   ↓
13. Cleans up temporary files
   ↓
14. User can now stream video
```

### Video Streaming Flow
```
1. Client requests GET /api/videos/{videoId}
   ↓
2. API returns video metadata + file URLs
   ↓
3. Client initializes HLS.js with master playlist URL
   └─ https://cdn.example.com/videos/{videoId}/360p/playlist.m3u8
   ↓
4. HLS.js fetches playlist and detects quality options
   ↓
5. Client selects quality (auto-detects based on bandwidth)
   ↓
6. HLS.js requests .ts segment files sequentially
   ↓
7. Video player plays segments in real-time
   ↓
8. Client pauses/resumes → records to WatchHistory
   ↓
9. Playback complete → updates analytics
```

### User Authentication Flow
```
1. Client POST /api/auth/register with email/password
   ↓
2. API validates input with Zod
   ↓
3. API hashes password with PBKDF2
   ↓
4. API creates User record in MongoDB
   ↓
5. API generates JWT tokens:
   - Access token (15 min expiry)
   - Refresh token (7 day expiry)
   ↓
6. API stores refresh token in RefreshToken collection
   ↓
7. API returns tokens to client
   ↓
8. Client stores tokens in httpOnly cookies or localStorage
   ↓
9. Client includes access token in Authorization header for subsequent requests
   ↓
(When access token expires)
10. Client calls POST /api/auth/refresh with refresh token
    ↓
11. API validates refresh token in RefreshToken collection
    ↓
12. API issues new access token (revokes old session)
    ↓
13. Client resumes with new token
```

## Deployment Strategies

### Development (Single Machine)
```
┌──────────────────────────────────────┐
│         Docker Compose               │
├──────────────────────────────────────┤
│ • MongoDB                            │
│ • Redis                              │
│ • Fastify API (with worker)          │
│ • MinIO (local S3 simulation)        │
│ • Elasticsearch                      │
│ • ClickHouse                         │
└──────────────────────────────────────┘
```

**Command**: `docker-compose up`

### Staging/Production (Multiple Machines)

#### API Tier (Load Balanced)
```
┌─────────────────────────────────────────┐
│          Load Balancer (Nginx)          │
├─────────────────────────────────────────┤
│  ├─ API Server 1 (Fastify)              │
│  ├─ API Server 2 (Fastify)              │
│  └─ API Server 3 (Fastify)              │
└─────────────────────────────────────────┘
```

#### Worker Tier (Auto-scaling)
```
┌──────────────────────────────────────────────┐
│    Worker Pool (Kubernetes/Docker Swarm)     │
├──────────────────────────────────────────────┤
│  ├─ Transcoding Worker 1                     │
│  ├─ Transcoding Worker 2                     │
│  ├─ Transcoding Worker 3                     │
│  └─ [Auto-scale based on queue depth]        │
└──────────────────────────────────────────────┘
     ↓
  Shared Redis Queue (High Availability)
```

#### Data Tier (Managed Services)
```
MongoDB Atlas (or self-hosted replica set)
Redis Cloud (or Redis Sentinel)
S3/Cloudflare R2
Elasticsearch Cloud
ClickHouse Cloud
```

## Performance Considerations

### Video Transcoding
- **Time**: 
  - 1 hour video @ 1080p: ~60 minutes
  - 2 hour video @ 4K downscaled: ~120 minutes
- **CPU**: Heavy (95%+ CPU usage per worker)
- **Storage**: 
  - Input: 500 MB - 5GB
  - Output (all 4 qualities): 2-3x input size
  - Temporary: Input size × 2 (working files)

### Streaming
- **Bitrate**: 800 kbps - 5000 kbps (HLS adaptive)
- **Latency**: 10-30 seconds (HLS standard)
- **Buffering**: 3-4 segments ahead (pre-loading)

### Database
- **Indexes**:
  - User: email (unique), username
  - Video: userId, status, createdAt, trending score
  - Comment: videoId, userId, createdAt
  - WatchHistory: userId, videoId, createdAt

### Scaling Bottlenecks
1. **CPU** (Transcoding): Add more workers
2. **Disk I/O** (Temp files): Use NVMe storage
3. **Bandwidth** (Uploads): Increase API timeout, use multipart chunks
4. **Database** (Queries): Add read replicas, use caching
5. **Storage** (S3): Use CloudFront CDN for distribution

## Security Architecture

### Authentication
- JWT tokens with HS256 signing
- Refresh token rotation
- Token blacklisting on logout
- Secure httpOnly cookies (frontend)

### Authorization
- Role-based access control (User/Moderator/Admin)
- Ownership checks (user can only delete own videos)
- Admin-only endpoints protected

### Data Protection
- HTTPS/TLS for all communications
- Password hashing with PBKDF2 (100k iterations)
- Rate limiting on auth endpoints
- Input validation with Zod schemas

### Storage Security
- S3 bucket policies (private by default)
- CDN caching with signed URLs
- File integrity checks
- Virus scanning on uploads (optional)

## Monitoring & Observability

### Logging
- Structured logs with Pino
- Log levels: debug, info, warn, error
- ELK stack or CloudWatch for aggregation

### Metrics
- Queue depth (pending jobs)
- Worker utilization (% busy)
- Transcoding success rate
- Average transcoding time
- API response times
- Error rates by endpoint

### Alerting
- High queue depth (>1000 jobs)
- Worker failures (retries exhausted)
- API error rate (>5%)
- Database connection failures
- Storage quota exceeded

## Configuration Management

### Environment Variables
See `.env.example` for all variables

### Secrets
- JWT secrets
- Database credentials
- S3/R2 API keys
- API keys for third-party services

**Storage**:
- Development: `.env` file
- Production: Environment variables / Secrets Manager
- Never commit secrets to git

## Next Steps

1. **Frontend**: Build Next.js app with video player
2. **Search**: Implement Elasticsearch integration
3. **Recommendations**: Deploy Python ML service
4. **Analytics**: ClickHouse event tracking
5. **Admin**: Moderation dashboard
6. **CDN**: CloudFlare distribution
