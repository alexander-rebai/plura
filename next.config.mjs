/** @type {import('next').NextConfig} */
const nextConfig = {
  crossOrigin: 'anonymous',
  images: {
    domains: [
      'uploadthing.com',
      'utfs.io',
      'subdomain',
      'img.clerk.com',
      'files.stripe.com',
    ],
  },
  reactStrictMode: false
};

export default nextConfig;
