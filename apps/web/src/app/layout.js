import { Providers } from './providers';
import { Navigation } from '@/components/Navigation';
import { Toaster } from 'react-hot-toast';
import './globals.css';
export const metadata = {
    title: 'noobies - Video Streaming Platform',
    description: 'Watch and share videos on noobies',
};
export default function RootLayout({ children, }) {
    return (<html lang="en">
      <body className="bg-gray-950 text-white">
        <Providers>
          <Navigation />
          <main>{children}</main>
          <Toaster position="bottom-right"/>
        </Providers>
      </body>
    </html>);
}
//# sourceMappingURL=layout.js.map