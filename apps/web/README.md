# Next.js Frontend

Modern video streaming frontend built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- ✅ Video player with HLS.js support
- ✅ Multi-quality adaptive streaming (360p-1080p)
- ✅ Video upload with progress tracking
- ✅ User authentication (register/login)
- ✅ Video discovery and trending
- ✅ Responsive design
- ✅ Real-time job status updates

## Project Structure

```
src/
  ├── app/              # Next.js app router pages
  │   ├── layout.tsx    # Root layout with providers
  │   ├── page.tsx      # Home page (video feed)
  │   ├── watch/[id]/   # Video player page
  │   ├── upload/       # Video upload page
  │   ├── login/        # Login page
  │   ├── register/     # Registration page
  │   └── globals.css   # Global styles
  ├── components/       # React components
  │   ├── Navigation.tsx    # Header navigation
  │   ├── VideoPlayer.tsx   # HLS video player
  │   ├── VideoCard.tsx     # Video thumbnail card
  │   └── ...
  ├── hooks/            # Custom React hooks
  │   ├── useApi.ts     # API request hooks
  │   └── useVideos.ts  # Video-specific hooks
  ├── lib/              # Utility functions
  │   ├── api.ts        # Axios instance
  │   └── auth.ts       # Auth store (Zustand)
  └── public/           # Static assets
```

## Technologies

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: React Query + Axios
- **Video Player**: HLS.js
- **Notifications**: React Hot Toast

## Getting Started

### Install Dependencies

```bash
npm install
```

### Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Update API URL
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CDN_URL=http://localhost:9000
```

### Start Development Server

```bash
npm run dev
```

Application will be available at: **http://localhost:3000**

### Build for Production

```bash
npm run build
npm start
```

## Pages

### Home Page (`/`)
- Video feed with pagination
- Hot trending videos
- Grid layout with video cards
- Quick video previews

### Watch Page (`/watch/[id]`)
- Full-screen video player
- HLS adaptive streaming with quality selector
- Video metadata (title, description, views)
- Like button
- Channel information
- Automatic watch history recording

### Upload Page (`/upload`)
- Drag-and-drop file upload
- Video metadata form (title, description)
- Real-time transcoding progress
- Status tracking with progress bar
- Redirect to watch page when complete

### Login Page (`/login`)
- Email/password authentication
- Link to registration
- Form validation
- Session management

### Register Page (`/register`)
- User account creation
- Email unique validation
- Password strength validation
- Auto-login after registration

## Components

### VideoPlayer
HLS video player with native controls
- Play/pause
- Seek bar
- Volume control
- Fullscreen mode
- Time display
- Quality auto-detection

### VideoCard
Thumbnail component for video listings
- Poster image
- Title and uploader
- View count and upload date
- Hover effects
- Processing status indicator

### Navigation
Header with navigation links
- Logo
- Home, Upload links (authenticated)
- Authentication buttons (login/register/logout)
- User profile display (when logged in)

## Hooks

### useVideos()
Get paginated video list

```typescript
const { data, isLoading } = useVideos(page, limit);
```

### useVideo(id)
Get single video with streaming URLs

```typescript
const { data: video } = useVideo(videoId);
```

### useTrendingVideos()
Get trending videos

```typescript
const { data: trending } = useTrendingVideos();
```

### useUploadVideo()
Upload video with transcoding

```typescript
const mutation = useUploadVideo();
mutation.mutate(formData);
```

### useUploadStatus(jobId)
Poll transcoding job status

```typescript
const { data, isLoading } = useUploadStatus(jobId);
```

## Authentication

### Login/Register Flow

1. User enters credentials
2. POST request to API
3. Receive accessToken + refreshToken
4. Store in localStorage
5. Add to Authorization header for subsequent requests
6. Automatic token refresh on 401 response

### Protected Routes

- `/upload` - Requires authentication
- `/watch/:id/comments` (POST) - Requires authentication
- `/api/users/me/*` - Requires authentication

## API Integration

### Axios Instance

Automatically handles:
- JWT token attachment to requests
- Token refresh on expiry
- Error handling and toast notifications
- Base URL configuration

```typescript
import apiClient from '@/lib/api';

const response = await apiClient.get('/api/videos');
```

### Custom Hooks

Simplified API calls with React Query

```typescript
// Auto-retry on failure
const { data, isLoading, error } = useGetQuery(
  'videos',
  '/api/videos'
);
```

## Video Player Features

### HLS Support
- M3U8 playlist parsing
- Adaptive bitrate switching
- Bandwidth-based quality selection
- Seamless quality switching mid-playback

### Controls
- Playback controls (play, pause, seek)
- Volume control
- Full-screen mode
- Time display and seeking
- Responsive on mobile

### Quality Selection
- Auto (recommended)
- 1080p (5000 kbps)
- 720p (2500 kbps)
- 480p (1500 kbps)
- 360p (800 kbps)

## Styling

### Tailwind CSS
- Dark theme (gray-950 background)
- Red accent color (#ef4444)
- Responsive grid layouts
- Hover and transition effects
- Custom scrollbar styling

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Grid: 1 col (mobile) → 2 cols (tablet) → 4 cols (desktop)

## State Management

### Auth Store (Zustand)
Global authentication state

```typescript
const { user, isAuthenticated, logout } = useAuthStore();
```

### React Query
Server state management
- Automatic caching
- Background refetching
- Stale time configuration
- Mutation handling

## Error Handling

All errors show toast notifications:
- Network errors
- Authentication errors
- Validation errors
- Server errors

## Performance Optimizations

- Image lazy loading
- Video player lazy loading
- React Query caching
- Zustand for minimal re-renders
- Code splitting with Next.js

## Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Docker
```bash
docker build -t videohub-web .
docker run -p 3000:3000 videohub-web
```

### Self-hosted
```bash
npm run build
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NEXT_PUBLIC_API_URL | Backend API URL | http://localhost:3001 |
| NEXT_PUBLIC_CDN_URL | CDN/Storage URL | http://localhost:9000 |

## Troubleshooting

### Video Player Not Playing
- Check CDN URL in .env
- Verify HLS stream URL is accessible
- Check browser console for errors

### Upload Failing
- Ensure API server is running
- Check file size (max 10GB)
- Verify CORS is enabled on API

### Authentication Issues
- Clear localStorage
- Check token expiry
- Verify API is returning tokens

## Next Steps

1. Add comment system
2. Implement search functionality
3. Add playlist support
4. Build admin dashboard
5. Add analytics tracking
6. Optimize images with CDN

---

**Ready to stream!** 🎬
