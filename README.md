# Video Streaming Platform

A full-stack video streaming and discovery platform with AI-powered recommendations and admin dashboard, built with modern technologies.

**Status**: 8 of 8 phases complete! ✅✅✅ | Monorepo • Database • API • Upload • Frontend • Search • Recommendations • Admin

## Quick Links

- [Quick Start Guide](./QUICKSTART.md) - Get running in 5 minutes
- [Architecture Guide](./ARCHITECTURE.md) - System design and data flows
- [Frontend Guide](./FRONTEND.md) - Next.js frontend development
- [Search Guide](./SEARCH_GUIDE.md) - Full-text search with Elasticsearch
- [Recommender Guide](./apps/recommender/README.md) - AI recommendations
- [Project Status](./PROJECT_STATUS.md) - Completion tracking
- [API Documentation](./apps/api/README.md) - All endpoints
- [Upload Pipeline](./apps/api/UPLOAD_PIPELINE.md) - Video transcoding details

## Project Structure

```
noobies/
├── apps/
│   ├── api/         → Fastify backend API ✅
│   ├── web/         → Next.js 14 frontend (coming next)
│   ├── worker/      → FFmpeg transcoding workers (optional)
│   └── recommender/ → Python FastAPI recommendations (phase 7)
├── packages/
│   ├── db/          → Prisma schema with MongoDB
│   └── types/       → Shared TypeScript types
├── docker-compose.yml
├── QUICKSTART.md
├── ARCHITECTURE.md
├── PROJECT_STATUS.md
└── README.md
```

## Features Completed ✅

### Phase 1: Monorepo Infrastructure
- [x] Turbo monorepo with /apps and /packages
- [x] Docker Compose with all services
- [x] TypeScript configuration
- [x] Environment setup (.env.example)

### Phase 2: Database Layer
- [x] MongoDB with Prisma ORM
- [x] 14 data models with relationships
- [x] User roles (USER, MODERATOR, ADMIN)
- [x] Watch history tracking
- [x] Playlist management
- [x] Comment system

### Phase 3: Authentication & Core API
- [x] JWT authentication (15-min access, 7-day refresh)
- [x] User registration and login
- [x] Refresh token rotation
- [x] User profiles and settings
- [x] PBKDF2 password hashing

### Phase 4: Video Upload & Transcoding
- [x] **Multipart video upload handler**
- [x] **FFmpeg transcoding service**
  - Extracts metadata (duration, resolution, bitrate)
  - Converts to HLS with 4 quality levels
  - Generates thumbnail images
- [x] **BullMQ job queue for async processing**
  - Background worker with progress tracking
  - Retry logic with exponential backoff
  - Can run as separate process
- [x] **Storage abstraction**
  - AWS S3 support
  - Cloudflare R2 support (recommended for cost)
  - Automatic CDN URL generation
- [x] **Database integration**
  - Video status tracking (UPLOADED → PROCESSING → READY)
  - File metadata storage per resolution
  - Thumbnail references

### Phase 5: Next.js Frontend ⭐ NEW
- [x] **Next.js 14 with App Router**
- [x] **Video Player**
  - HLS.js with adaptive bitrate
  - Quality selector (360p-1080p)
  - Full controls (play, seek, volume, fullscreen)
- [x] **Pages**
  - Home feed (pagination + trending)
  - Watch page with player
  - Upload page with progress tracking
  - Login/register pages
- [x] **Components**
  - VideoPlayer (HLS with native controls)
  - VideoCard (grid thumbnails)
  - Navigation (header with auth)
- [x] **State Management**
  - Zustand for auth
  - React Query for API data
  - Automatic token refresh
- [x] **Styling**
  - Tailwind CSS with dark theme
  - Responsive grid layouts
  - Red accent color theme

### Phase 6: Elasticsearch Search ✨ NEW
- [x] **Full-Text Search Engine**
  - Search videos by title, description, tags
  - Fuzzy matching for typos
  - Multi-field relevance scoring
- [x] **Advanced Filtering**
  - Sort: relevance, newest, most viewed, trending
  - Date range: all time, last week/month/year
  - Duration range: min/max seconds
  - Category filtering
  - Uploader filter
- [x] **Search API Endpoints** (4 new)
  - `GET /api/search?q=query` - Main search
  - `GET /api/search/autocomplete` - Suggestions
  - `GET /api/search/trending` - Popular searches
  - `GET /api/search/categories` - Available categories
- [x] **Frontend Search**
  - Search page with pagination
  - Search bar in navigation
  - Filters panel
  - Relevance score display
- [x] **Automatic Indexing**
  - Videos indexed when transcoding completes
  - Automatic sync with MongoDB
  - Health checks for ES connection

### Phase 7: Python Recommendation Service ✨ NEW
- [x] **FastAPI microservice** (Python)
  - Collaborative filtering algorithm
  - Content-based recommendations
  - Trending videos fallback
  - Cold-start strategy for new users
- [x] **4 API endpoints**
  - Personalized recommendations
  - Trending videos
  - Model training trigger
  - Service statistics
- [x] **Frontend integration**
  - "For You" recommendations tab
  - Smart fallback to trending
  - Sign-in prompt for non-users
  - Integrated into home page
- [x] **Docker containerization**
  - Multi-service orchestration
  - Health checks
  - Auto-restart on failure

### Phase 8: Admin Dashboard ✨ NEW
- [x] **Admin authentication and access control**
  - Admin/Moderator role verification
  - Protected routes with automatic redirect
- [x] **Dashboard overview**
  - Real-time statistics (users, videos, reports, active users)
  - Recent videos and reports display
  - Processing status notification
- [x] **Moderation queue**
  - Approve/reject pending videos
  - Rejection reason tracking
  - Status filtering and pagination
- [x] **Report management**
  - View submitted reports with context
  - Dismiss reports or delete flagged videos
  - Status tracking (open, resolved, dismissed)
  - Notes and audit trail
- [x] **Analytics section**
  - Video status distribution
  - Total views and likes
  - Top uploaders ranking
- [x] **Admin API endpoints** (7 new)
  - `GET /api/admin/dashboard` - Dashboard statistics
  - `GET /api/admin/moderation` - Pending videos queue
  - `POST /api/admin/moderation/:videoId` - Approve/reject video
  - `GET /api/admin/reports` - Get reports
  - `POST /api/admin/reports/:reportId` - Handle report
  - `GET /api/admin/analytics/users` - User analytics
  - `GET /api/admin/analytics/platform` - Platform analytics
- [x] **Frontend components**
  - Sidebar navigation with role-based menu
  - Header with notifications and user menu
  - Dashboard cards with metrics
  - Moderation grid with video preview cards
  - Reports table with filtering
  - Analytics charts and statistics

### Phase 8: Complete! 🎉

## Tech Stack

### Backend Ready ✅
- **Framework**: Fastify 4.25
- **Database**: MongoDB 7.0
- **ORM**: Prisma 5.7
- **Cache/Queue**: Redis + BullMQ
- **Video Processing**: FFmpeg + HLS
- **Storage**: AWS S3 / Cloudflare R2
- **Authentication**: JWT with PBKDF2
- **Validation**: Zod schemas
- **Logging**: Pino

### Frontend Coming Soon
- Next.js 14 (App Router)
- Tailwind CSS
- HLS.js for streaming
- React Query for data fetching

### AI & Recommendations ✅
- **Python FastAPI** microservice
- **Collaborative filtering** algorithm
- **Content-based filtering** with tags
- **Trending fallback** for cold-start

## Getting Started

### 1. Install Dependencies

```bash
# Install all workspace dependencies
npm install
```

### 2. Start Services

```bash
# Start MongoDB, Redis, MinIO, Elasticsearch, ClickHouse
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 3. Initialize Database

```bash
# Run migrations
cd packages/db
npx prisma migrate dev

# Seed with sample data (optional)
npx prisma db seed
```

### 4. Run Entire Stack

**Option A: Separate Terminals (Recommended)**

```bash
# Terminal 1: API Server
cd apps/api && npm run dev
# API running at http://localhost:3001

# Terminal 2: Frontend
cd apps/web && npm run dev
# Frontend running at http://localhost:3000

# Terminal 3: Transcoding Workers (optional)
cd apps/api && npm run worker
```

**Option B: Run All with Turbo**

```bash
npm run dev    # Starts all apps in parallel
```

### 5. Access the Application

- **Frontend**: http://localhost:3000 (video player, upload, home feed)
- **API**: http://localhost:3001 (backend API)
- **MinIO Console**: http://localhost:9001 (storage UI)
- **Elasticsearch**: http://localhost:9200 (search)

## Quick Test

### 1. Register Account

Visit **http://localhost:3000/register** and create an account

### 2. Upload Video

- Go to **http://localhost:3000/upload**
- Select a video file(or create test video with FFmpeg)
- Enter title and description
- Click upload
- Watch transcoding progress in real-time

### 3. Watch Video

Once transcoding completes:
- Click "Watch Video" button
- Enjoy adaptive bitrate streaming!
- Try different qualities (360p, 480p, 720p, 1080p)

See [QUICKSTART.md](./QUICKSTART.md) for complete API examples.

## Services Available

| Service | URL | Purpose |
|---------|-----|---------|
| API | http://localhost:3001 | Backend API |
| MongoDB | localhost:27017 | Database |
| Redis | localhost:6379 | Cache & Queue |
| MinIO (S3) | http://localhost:9000 | Storage |
| MinIO Console | http://localhost:9001 | Storage Web UI |
| Elasticsearch | http://localhost:9200 | Search |
| ClickHouse | http://localhost:8123 | Analytics |

## Environment Configuration

See [.env.example](./.env.example) for all variables:

**Essential Variables**:
- `DATABASE_URL` - MongoDB connection
- `REDIS_URL` - Redis connection
- `JWT_SECRET` - JWT signing key
- `AWS_ACCESS_KEY_ID` - S3/R2 credentials
- `AWS_SECRET_ACCESS_KEY` - S3/R2 credentials
- `AWS_S3_BUCKET` - Storage bucket

**Optional (for production)**:
- `CDN_URL` - Content delivery URL
- `ELASTICSEARCH_URL` - Search service
- `CLICKHOUSE_HOST` - Analytics database

## Video Upload & Transcoding Pipeline

The platform now includes a **complete video processing pipeline**:

```
Upload Video File
    ↓
Validate & Save Temporarily
    ↓
Create Database Record (status: UPLOADED)
    ↓
Queue Transcoding Job
    ↓ (async, background processing)
Extract Video Metadata
    ↓
Transcode to 4 Quality Levels (HLS)
├─ 360p (800 kbps)
├─ 480p (1500 kbps)
├─ 720p (2500 kbps)
└─ 1080p (5000 kbps)
    ↓
Generate Thumbnail
    ↓
Upload to S3/Cloudflare R2
    ↓
Update Database with File References
    ↓
Video Status → READY
    ↓
Ready for Streaming
```

**Key Features**:
- Progress tracking (0-100%)
- Parallel transcoding (multiple quality levels)
- Concurrent job processing (configurable workers)
- Automatic retries on failure
- Graceful error recovery
- Temporary file cleanup

**Running Workers**:
```bash
# In-process (automatic with API)
npm run dev

# Or separate processes
npm run worker    # Worker 1
npm run worker    # Worker 2
npm run worker    # Worker 3
```

Multiple workers process jobs concurrently for faster throughput.

## Building Steps Progress

| Step | Description | Status |
|------|-------------|--------|
| 1 | Monorepo structure | ✅ Complete |
| 2 | Database schema (MongoDB) | ✅ Complete |
| 3 | Fastify API with auth | ✅ Complete |
| 4 | Video upload & transcoding | ✅ Complete |
| 5 | Next.js frontend & player | ✅ Complete |
| 6 | Elasticsearch search | ✅ Complete |
| 7 | Python recommendations | ✅ Complete |
| 8 | Admin dashboard | ✅ Complete |

**All 8 phases complete!** 🎉

## API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Create user account
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/refresh` - Get new access token
- `POST /api/auth/logout` - Invalidate session

### Videos
- `GET /api/videos` - List all videos (paginated)
- `GET /api/videos/:id` - Get single video
- `GET /api/videos/trending` - Get trending videos
- `POST /api/videos/upload` - Upload video for transcoding
- `GET /api/videos/upload/:jobId` - Check transcoding status
- `DELETE /api/videos/:id` - Delete video (owner/admin)

### Users
- `GET /api/users/me` - Get current user
- `GET /api/users/me/history` - Watch history
- `GET /api/users/me/likes` - Liked videos
- `GET /api/users/me/playlists` - User playlists

### Comments
- `GET /api/videos/:id/comments` - Get comments
- `POST /api/videos/:id/comments` - Add comment
- `DELETE /api/comments/:id` - Delete comment

### Interactions
- `POST /api/videos/:id/like` - Like video
- `POST /api/videos/:id/dislike` - Dislike video

### Search
- `GET /api/search` - Full-text search videos
- `GET /api/search/autocomplete` - Autocomplete suggestions
- `GET /api/search/trending` - Trending searches
- `GET /api/search/categories` - Available categories

### Recommendations
- `GET /api/recommendations/{userId}` - Get personalized recommendations
- `GET /api/recommendations/trending` - Get trending videos
- `POST /api/recommendations/train` - Trigger model update
- `GET /api/recommendations/stats` - Get service statistics

### Recommendations
- `GET /api/recommendations/:user_id` - Get personalized recommendations
- `GET /api/recommendations/trending` - Get trending videos
- `POST /api/recommendations/train` - Trigger model training
- `GET /api/recommendations/stats` - Get service statistics

### Admin (New! Phase 8)
- `GET /api/admin/dashboard` - Dashboard statistics and metrics
- `GET /api/admin/moderation` - Get pending videos queue
- `POST /api/admin/moderation/:videoId` - Approve or reject video
- `GET /api/admin/reports` - Get user reports
- `POST /api/admin/reports/:reportId` - Handle report (dismiss/delete)
- `GET /api/admin/analytics/users` - User growth analytics
- `GET /api/admin/analytics/platform` - Platform statistics

Full API docs: [API README](./apps/api/README.md)

## Access the Admin Dashboard

Once logged in as an admin user, navigate to:

```
http://localhost:3000/admin
```

The admin dashboard provides:
- **Overview**: Key metrics and recent activity
- **Moderation**: Approve/reject pending videos
- **Reports**: Handle user-submitted reports
- **Users**: User management (coming soon)
- **Analytics**: Platform statistics and insights
- **Settings**: Configuration (coming soon)

## Development Commands

```bash
# Install all dependencies
npm install

# Start all services (Docker)
docker-compose up -d

# Build all packages
npm run build

# Development mode (API + worker)
cd apps/api && npm run dev

# Production build
npm run build

# Run database migrations
cd packages/db && npx prisma migrate dev

# Seed database with sample data
cd packages/db && npx prisma db seed

# View database in MongoDB Compass
# Connection: mongodb://admin:password@localhost:27017
```

## Documentation

- **[Quick Start](./QUICKSTART.md)** - 5-minute setup guide
- **[Architecture](./ARCHITECTURE.md)** - Complete system design
- **[Phase Status](./PROJECT_STATUS.md)** - Feature tracking
- **[Search Guide](./SEARCH_GUIDE.md)** - Elasticsearch search details
- **[Recommender Guide](./apps/recommender/README.md)** - AI recommendations
- **[API Docs](./apps/api/README.md)** - All endpoint details
- **[Upload Pipeline](./apps/api/UPLOAD_PIPELINE.md)** - Transcoding guide

## Performance Characteristics

**Transcoding**:
- 1-hour video: ~60 minutes (4 qualities)
- 10-minute video: ~10 minutes
- Concurrent workers: 2-4 for optimal CPU usage

**Streaming**:
- Bitrate: Adaptive 800-5000 kbps
- Latency: 10-30 seconds (HLS standard)
- Quality: Automatic based on bandwidth

**Database**:
- MongoDB with indexes on frequently accessed fields
- Read replicas for scaling
- Automatic connection pooling

## Deployment

The platform is production-ready with:
- Docker containerization
- Graceful shutdown handling
- Error recovery and retries
- Logging and monitoring hooks
- Environment-based configuration

See [ARCHITECTURE.md](./ARCHITECTURE.md) for deployment strategies.

## Next Steps

1. **Admin Dashboard**: Build moderation and analytics UI
2. **Analytics**: Integrate ClickHouse for detailed metrics
3. **Comments UI**: Build comment system frontend
4. **Advanced Recommendations**: ML model training and embeddings
5. **Deploy**: Push to production infrastructure

## Contributing

This is a full learning project. Feel free to:
- Explore the codebase
- Modify and experiment
- Build frontend features
- Optimize transcoding
- Add new features

## Support & Documentation

For detailed information:
- **System Design**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Quick Start**: See [QUICKSTART.md](./QUICKSTART.md)
- **API Details**: See [API README](./apps/api/README.md)
- **Status Tracking**: See [PROJECT_STATUS.md](./PROJECT_STATUS.md)
- **Transcoding**: See [UPLOAD_PIPELINE.md](./apps/api/UPLOAD_PIPELINE.md)

---

**Ready to build?** Start with [QUICKSTART.md](./QUICKSTART.md) to get the backend running in 5 minutes! 🚀
