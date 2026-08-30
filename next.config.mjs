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
            // PENTING: Menambahkan blob: dan data: di dalam connect-src
            value: "default-src 'self'; frame-src 'self' https://www.youtube.com https://youtube.com https://drive.google.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://s.ytimg.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; connect-src 'self' blob: data: https://backend.mejatika.com https://www.youtube.com;",
          },
        ],
      },
    ]
  },
}

export default nextConfig
