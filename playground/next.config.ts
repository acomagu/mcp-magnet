import type { NextConfig } from "next";

export default {
  webpack: config => ({
    ...config,
    experiments: {
      ...config.experiments,
      syncWebAssembly: true,
    },
  }),
} satisfies NextConfig;
