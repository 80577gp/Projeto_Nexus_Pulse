/** @type {import('next').NextConfig} */
const nextConfig = {
  // Public environment variables exposed to the browser.
  env: {
    NEXT_PUBLIC_API_BASE_URL:
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api",
  },

  // Allow optimized images from local development and a cloud storage domain.
  images: {
    domains: ["localhost", "res.cloudinary.com"],
  },
};

module.exports = nextConfig;

