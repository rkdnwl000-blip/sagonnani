/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@sagonnani/shared'],
  output: 'standalone',
};

module.exports = nextConfig;
