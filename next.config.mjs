/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.frag/,
      type: "asset/source",
    });
    config.module.rules.push({
      test: /\.vert/,
      type: "asset/source",
    });
    return config;
  },
};

export default nextConfig;
