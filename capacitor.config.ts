import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.connectize.app",
  appName: "connectize",
  webDir: "build",
  android: {
    // signing: {
    //   keystorePath: "android/app/my-release-key.jks",
    //   keystorePassword: "ConnectizeSecret!",
    //   keyAlias: "my-key-alias",
    //   keyPassword: "ConnectizeSecret!",
    // },
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: "#fff",
    },
  },
};

export default config;
