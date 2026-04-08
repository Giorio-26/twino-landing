import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  images: {
    qualities: [100],
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
