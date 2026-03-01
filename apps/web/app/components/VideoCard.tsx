function formatViews(views: number): string {
  if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
  if (views >= 1000) return (views / 1000).toFixed(0) + 'K';
  return views.toString();
}

interface VideoCardProps {
  id: string;
  title: string;
  views: number;
  duration: string;
  uploader: string;
  thumbnail: string;
}

export default function VideoCard({ title, views, duration, uploader, thumbnail }: VideoCardProps) {
  return (
    <div className="group cursor-pointer">
      <div className="relative rounded-lg overflow-hidden bg-gray-800 aspect-video">
        <img src={thumbnail} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
          {duration}
        </span>
      </div>
      <div className="mt-2 px-1">
        <h3 className="text-sm font-medium text-gray-100 line-clamp-2 group-hover:text-white">{title}</h3>
        <p className="text-xs text-gray-400 mt-1">{uploader}</p>
        <p className="text-xs text-gray-500">{formatViews(views)} views</p>
      </div>
    </div>
  );
}
