'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Video } from '@/hooks/useVideos';

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const videoDate = new Date(date);
    const diff = now.getTime() - videoDate.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  return (
    <Link href={`/watch/${video.id}`}>
      <div className="group cursor-pointer">
        <div className="relative overflow-hidden rounded-lg bg-gray-900 aspect-video">
          <Image
            src={video.thumbnail?.url || '/placeholder.jpg'}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {video.status !== 'READY' && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-500 mx-auto mb-2" />
                <p className="text-white text-sm">{video.status}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-3">
          <h3 className="font-semibold text-white truncate group-hover:text-red-500 transition">
            {video.title}
          </h3>
          <p className="text-sm text-gray-400 truncate">{video.author.username}</p>
          <div className="flex gap-2 text-xs text-gray-500 mt-1">
            <span>{formatViews(video.views)} views</span>
            <span>•</span>
            <span>{formatDate(video.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
