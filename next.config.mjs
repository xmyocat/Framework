/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static generation for pages that use authentication
  output: 'standalone',
  // Skip static optimization for auth-dependent routes
  experimental: {
    // This prevents prerendering of client components that use useSession
    disableOptimizedLoading: true,
  },
};

export default nextConfig;
