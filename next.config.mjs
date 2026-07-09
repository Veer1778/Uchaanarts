/** @type {import('next').NextConfig} */
const wpHost = (() => {
  try {
    return process.env.WP_IMAGE_HOST || new URL(process.env.NEXT_PUBLIC_WP_URL || "").hostname;
  } catch {
    return "";
  }
})();

const remotePatterns = [
  { protocol: "https", hostname: "www.uchaanarts.com" },
  { protocol: "https", hostname: "uchaanarts.com" },
];
if (wpHost) remotePatterns.push({ protocol: "https", hostname: wpHost });

const nextConfig = {
  images: { remotePatterns },
};

export default nextConfig;
