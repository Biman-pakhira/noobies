import VideoCard from './components/VideoCard';
import CategoryNav from './components/CategoryNav';
import Header from './components/Header';

const MOCK_VIDEOS = [
  { id: '1', title: 'Amazing Nature Documentary', views: 1200000, duration: '45:23', uploader: 'NatureChannel', thumbnail: 'https://picsum.photos/seed/1/320/180' },
  { id: '2', title: 'Learn TypeScript in 2 Hours', views: 850000, duration: '2:03:11', uploader: 'CodeMaster', thumbnail: 'https://picsum.photos/seed/2/320/180' },
  { id: '3', title: 'Top 10 Travel Destinations 2025', views: 3400000, duration: '18:45', uploader: 'TravelWorld', thumbnail: 'https://picsum.photos/seed/3/320/180' },
  { id: '4', title: 'Cooking Italian Pasta from Scratch', views: 670000, duration: '22:10', uploader: 'ChefMario', thumbnail: 'https://picsum.photos/seed/4/320/180' },
  { id: '5', title: 'Full Body Workout - No Equipment', views: 2100000, duration: '35:00', uploader: 'FitLife', thumbnail: 'https://picsum.photos/seed/5/320/180' },
  { id: '6', title: 'Building a React App from Scratch', views: 980000, duration: '1:15:30', uploader: 'DevTalks', thumbnail: 'https://picsum.photos/seed/6/320/180' },
  { id: '7', title: 'Jazz Piano Improvisation Basics', views: 430000, duration: '28:55', uploader: 'MusicSchool', thumbnail: 'https://picsum.photos/seed/7/320/180' },
  { id: '8', title: 'History of Ancient Rome', views: 1750000, duration: '52:40', uploader: 'HistoryVault', thumbnail: 'https://picsum.photos/seed/8/320/180' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />
      <CategoryNav />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">Trending Videos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {MOCK_VIDEOS.map(video => (
            <VideoCard key={video.id} {...video} />
          ))}
        </div>
      </main>
    </div>
  );
}
