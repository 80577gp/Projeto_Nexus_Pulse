/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    ppr: "incremental",
  },

  // Public environment variables exposed to the browser.
  env: {
    NEXT_PUBLIC_API_BASE_URL:
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api",
  },

  crossOrigin: "anonymous",

  // Allow optimized images from local development and a cloud storage domain.
  images: {
    domains: ["localhost", "res.cloudinary.com"],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' http://localhost:8000 https:; frame-ancestors 'none'; base-uri 'self';",
          },
          {
            key: "X-KORU-SRI-Mode",
            value: "turbopack-fallback-csp",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

