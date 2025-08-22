import type { Config } from "@react-router/dev/config";

export default {
  appDirectory: "src/app",
  buildDirectory: "build",
  ssr: false,
  serverModuleFormat: "esm",

  // serverModuleFormat: "cjs",

  //   prerender: ["/", "/about"],
} satisfies Config;
