import './globals.css'

export const metadata = {
  title: 'StreamX - Video Platform',
  description: 'Watch and share videos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white">{children}</body>
    </html>
  )
}
