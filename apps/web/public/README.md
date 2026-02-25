# VideoHub Frontend

Modern video streaming frontend built with Next.js 14, TypeScript, and Tailwind CSS.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## Features

- 📹 **Video Player**: HLS.js with adaptive bitrate streaming
- 📤 **Video Upload**: Drag-and-drop with transcoding progress
- 🔐 **Authentication**: JWT tokens with refresh
- 🎨 **Responsive Design**: Mobile-first UI
- 🔍 **Video Discovery**: Home feed + trending
- ❤️ **Interactions**: Like videos, watch history

## Pages

| Page | Route | Purpose |
|------|-------|---------|
| Home | `/` | Video feed & discovery |
| Watch | `/watch/:id` | Video player |
| Upload | `/upload` | Upload new video |
| Login | `/login` | User authentication |
| Register | `/register` | Account creation |

## Configuration

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CDN_URL=http://localhost:9000
```

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type check
npm run type-check
```

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Data**: React Query + Axios
- **Video**: HLS.js
- **Notifications**: React Hot Toast

## File Structure

```
src/
├── app/              # Next.js pages
├── components/       # React components
├── hooks/           # Custom hooks
├── lib/             # Utilities
└── public/          # Static assets
```

See [README.md](./README.md) for complete documentation.
