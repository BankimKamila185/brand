const BACKEND_URL = process.env["BACKEND_URL"] || "http://localhost:4000";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Redirects for admin dashboard
  async redirects() {
    return [
      {
        source: "/admin/dashboard",
        destination: "/admin/dashboard/default",
        permanent: false,
      },
    ];
  },

  // Proxy /api/* requests to the backend service
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },

  // Allow Cloudinary images to be optimized via next/image
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
