/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    BACKEND_URL: process.env.BACKEND_URL,
  },
  images: {
    domains: ['mzgreh7dxqq3s7mix2pfwkco3beetb6upgzxkonr3suk55phikxa.arweave.net'],
  },
};

export default nextConfig;
