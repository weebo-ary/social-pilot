/** @type {import('next').NextConfig} */
const nextConfig = {
      compiler: {
    jsx: true
  },
   eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
