/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow .md and .mdx in pages if we want it later; for now we read MDX manually
  experimental: {
    mdxRs: false,
  },
};

export default nextConfig;
