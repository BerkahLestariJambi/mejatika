/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            // DITAMBAHKAN: media-src 'self' blob: data: dan worker-src 'self' blob:
            value: "default-src 'self'; media-src 'self' blob: data:; worker-src 'self' blob:; frame-src 'self' https://www.youtube.com https://youtube.com https://drive.google.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://s.ytimg.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; connect-src 'self' https://backend.mejatika.com https://www.youtube.com;",
          },
        ],
      },
    ]
  },
}

export default nextConfig
