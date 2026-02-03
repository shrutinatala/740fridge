import type { NextConfig } from "next";
import * as path from "node:path";

const nextConfig: NextConfig = {
  // Helps Next infer the correct workspace root when there are
  // other lockfiles elsewhere on your machine.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
