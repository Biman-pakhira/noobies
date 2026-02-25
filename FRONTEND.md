# Frontend Development Guide

Complete guide to the Next.js video streaming frontend.

## Overview

The frontend is built with **Next.js 14** using the App Router, providing a modern, fast, and responsive user experience for video streaming, uploading, and discovery.

## Architecture

```
Next.js Frontend (Port 3000)
        ↓
    Axios Client (with JWT)
        ↓
  Fastify API (Port 3001)
        ↓
    MongoDB | Redis | S3
```

## Getting Started

### Installation

```bash
cd apps/web
npm install
```

### Environment Setup

```bash
cp .env.example .env.local
```

**Required Variables**:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CDN_URL=http://localhost:9000
```

### Development

```bash
npm run dev
```

Visit **http://localhost:3000**

### Production Build

```bash
npm run build
npm start
```

## Pages & Routes

### Home Page (`/`)

**Features**:
- Video feed with pagination
- Trending videos tab
- Responsive grid layout
- Video cards with metadata

**Usage**:
- Landing page for all users
- Discover new videos
- Switch between "Home" and "Trending"

### Watch Page (`/watch/[id]`)

**Features**:
- Full HLS video player
- Quality selector (360p-1080p)
- Video metadata and stats
- Author information
- Like button
- Watch history tracking

**Components**:
- `VideoPlayer` - Custom HLS player
- Video metadata display
- Like/dislike system
- Quality information

**Example URL**: `/watch/507f1f77bcf86cd799439011`

### Upload Page (`/upload`)

**Features**:
- Drag-and-drop video upload
- Metadata form (title, description)
- Real-time progress tracking
- Transcoding status monitor

**Process**:
1. Drag video or select file
2. Enter title and description
3. Click upload
4. Monitor transcoding progress
5. Redirect to watch page when done

**Protected Page**: Requires authentication

### Login Page (`/login`)

**Features**:
- Email/password authentication
- Form validation
- Auto-redirect on success
- Link to registration

**Flow**:
1. Enter email and password
2. Submit
3. Receive tokens
4. Store in localStorage
5. Redirect to home

### Register Page (`/register`)

**Features**:
- User account creation
- Email uniqueness validation
- Password strength check
- Auto-login after registration

**Validation**:
- Email format
- Username not empty
- Password ≥ 8 characters
- Password confirmation match

## Components

### VideoPlayer

Custom HLS video player with adaptive streaming.

```typescript
<VideoPlayer
  url="https://cdn.example.com/videos/xxx/360p/playlist.m3u8"
  poster="https://cdn.example.com/videos/xxx/thumbnail.jpg"
  title="Video Title"
/>
```

**Features**:
- Play/pause controls
- Seek bar with time display
- Volume control
- Fullscreen mode
- Responsive design
- Mobile-friendly controls

**Keyboard Shortcuts**:
- Space: Play/Pause
- Arrow Left/Right: Seek
- M: Mute/Unmute
- F: Fullscreen
- T: Theater mode (Future)

### VideoCard

Display video in grid format.

```typescript
<VideoCard video={videoData} />
```

**Shows**:
- Thumbnail with hover effect
- Title
- Uploader name
- View count
- Upload date
- Processing status indicator

### Navigation

Header with site navigation.

**Elements**:
- Logo (clickable home)
- Home, Upload links
- Auth buttons (login/register/logout)
- User profile (when authenticated)

## Hooks

### useVideos(page, limit)

Get paginated video list.

```typescript
const { data, isLoading, error } = useVideos(1, 12);

// Returns
{
  videos: Video[],
  total: number,
  pages: number
}
```

### useVideo(id)

Get single video with all details.

```typescript
const { data: video, isLoading } = useVideo(videoId);

// Returns
{
  id: string,
  title: string,
  videoFiles: [{ resolution, url }],
  thumbnail: { url },
  ...
}
```

### useTrendingVideos()

Get trending videos.

```typescript
const { data: trending } = useTrendingVideos();
// Returns trending Video[]
```

### useUploadVideo()

Upload video with transcoding.

```typescript
const mutation = useUploadVideo();

const formData = new FormData();
formData.append('video', file);
formData.append('title', 'My Video');

mutation.mutate(formData, {
  onSuccess: (data) => {
    console.log(data.job.id); // For status tracking
  }
});
```

### useUploadStatus(jobId)

Poll transcoding job status.

```typescript
const { data, isLoading } = useUploadStatus(jobId);

// Returns
{
  job: { id, status, progress },
  video: { id, status, duration, videoFiles }
}
```

### useGetQuery(key, url, options)

Generic query hook.

```typescript
const { data, isLoading, error, refetch } = useGetQuery(
  'videos',
  '/api/videos'
);
```

### usePostMutation(url, options)

Generic mutation hook.

```typescript
const mutation = usePostMutation('/api/auth/login', {
  onSuccess: () => navigate('/'),
  onError: (error) => toast.error(error.message)
});

mutation.mutate({ email, password });
```

## State Management

### Auth Store (Zustand)

Global authentication state.

```typescript
import { useAuthStore } from '@/lib/auth';

const { user, isAuthenticated, logout, checkAuth } = useAuthStore();

// Check if user is logged in
useEffect(() => {
  checkAuth(); // Verify token on app load
}, []);
```

**Methods**:
- `setUser(user)` - Set logged-in user
- `logout()` - Clear session
- `checkAuth()` - Verify token validity
- `setLoading(bool)` - Set loading state

### React Query

Server state management for API data.

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    }
  }
});

<QueryClientProvider client={queryClient}>
  {children}
</QueryClientProvider>
```

## API Integration

### Axios Instance

Automatic JWT token management.

```typescript
import apiClient from '@/lib/api';

// GET request
const response = await apiClient.get('/api/videos');

// POST request
await apiClient.post('/api/auth/login', { email, password });

// DELETE request
await apiClient.delete(`/api/videos/${id}`);
```

**Features**:
- Auto JWT token attachment
- Token refresh on 401
- Base URL configuration
- Error handling with toast

### Request/Response Format

**Request**:
```typescript
// Authentication
Authorization: Bearer <token>

// Body (JSON)
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "username": "..." }
  },
  "timestamp": 1707280200000
}
```

**Errors**:
```json
{
  "success": false,
  "error": {
    "message": "Invalid credentials",
    "code": "AUTH_FAILED"
  }
}
```

## Authentication Flow

### Initial Load
```
App Mounts
    ↓
checkAuth() called
    ↓
Read accessToken from localStorage
    ↓
Verify with API (/api/users/me)
    ↓
Set user or show login page
```

### Login
```
User enters credentials
    ↓
POST /api/auth/login
    ↓
Receive accessToken + refreshToken
    ↓
Store in localStorage
    ↓
Set user in auth store
    ↓
Redirect to home
```

### API Request with Token
```
API request
    ↓
Check Authorization header
    ↓
Add: Bearer <token>
    ↓
Send request
    ↓
If 401 → refresh token
    ↓
Retry request with new token
```

### Logout
```
User clicks logout
    ↓
Clear localStorage
    ↓
Clear auth store
    ↓
POST /api/auth/logout
    ↓
Redirect to login
```

## Styling

### Tailwind CSS

Utility-first CSS framework with custom theme.

**Colors**:
- Primary: Red (#ef4444)
- Secondary: Gray (#1f2937)
- Background: Gray-950 (#030712)
- Text: White (#ffffff)

**Responsive Classes**:
- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px
- `xl:` - 1280px

**Example**:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* 1 col on mobile, 2 on tablet, 4 on desktop */}
</div>
```

### Custom Styles

Global styles in `globals.css`:
- Scrollbar styling
- Animations
- Base element styles
- Font configuration

## Performance

### Optimizations

1. **Image Lazy Loading**
   - Next.js Image component
   - Blurred placeholder previews

2. **Code Splitting**
   - Route-based code splitting
   - Dynamic imports

3. **Caching**
   - React Query client-side cache
   - Browser caching headers

4. **Bundling**
   - Terser minification
   - CSS purging with Tailwind

### Metrics

- **First Contentful Paint (FCP)**: < 2s
- **Largest Contentful Paint (LCP)**: < 4s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Time to Interactive (TTI)**: < 3s

## Troubleshooting

### Common Issues

**Video Won't Play**
- Check CDN_URL is correct
- Verify HLS stream is accessible
- Check browser console for errors
- Ensure CORS is enabled on API

**Upload Fails**
- Check file size (max 10GB)
- Verify API server is running
- Check file format (MP4, AVI, MOV, MKV)
- Check disk space on server

**Auth Not Working**
- Clear localStorage and cookies
- Check API_URL is correct
- Verify JWT_SECRET matches on API
- Check token expiry time

**Blank Page**
- Check browser console for errors
- Verify API is accessible
- Check NEXT_PUBLIC_API_URL
- Try refreshing page

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel deploy

# Connect to git repo
vercel link
```

### Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t videohub-web .
docker run -p 3000:3000 videohub-web
```

### Environment Variables

In deployment platform, set:
```
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_CDN_URL=https://cdn.example.com
```

## Testing

```bash
# Run tests (Jest)
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

## Build Analysis

```bash
# Analyze bundle size
npm run build -- --analyze
```

## Future Enhancements

- [ ] Comment system UI
- [ ] Search functionality
- [ ] Playlist management
- [ ] User dashboard
- [ ] Subscribe to channels
- [ ] Share videos
- [ ] Watch later
- [ ] Notifications
- [ ] Dark/light theme toggle

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Query](https://tanstack.com/query/latest)
- [HLS.js](https://github.com/video-dev/hls.js)
- [Zustand](https://github.com/pmndrs/zustand)
