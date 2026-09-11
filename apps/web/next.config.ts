import path from "node:path";
import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  // Monorepo: tell Next where the workspace root is so its tracing,
  // module resolution, and built-in webpack loaders work under pnpm's
  // hoisted layout. Without this, the internal `next-flight-client-entry-loader`
  // can fail to resolve after certain rebuilds.
  outputFileTracingRoot: path.join(__dirname, "../.."),
};

export default config;
