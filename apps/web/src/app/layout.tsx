import type { Metadata } from 'next';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { Navigation } from '@/components/Navigation';
import './globals.css';

export const metadata: Metadata = {
  title: 'VideoHub - Video Streaming Platform',
  description: 'Watch and share videos with AI-powered recommendations',
};

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white">
        <QueryClientProvider client={queryClient}>
          <Navigation />
          <main>{children}</main>
          <Toaster position="bottom-right" />
        </QueryClientProvider>
      </body>
    </html>
  );
}
