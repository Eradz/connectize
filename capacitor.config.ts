import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.connectize.app",
  appName: "connectize",
  webDir: "build",
  android: {
    buildOptions: {
      keystorePath: "android/app/my-release-key.jks",
      keystorePassword: "t_11BPPOWTA0Fhcv7oyPE5ix_pzdDU9EJMygnRosw0MKJtPg6Qqf",
      // keystoreAlias: "my-key-alias",

      keystoreAliasPassword:
        "t_11BPPOWTA0Fhcv7oyPE5ix_pzdDU9EJMygnRosw0MKJtPg6Qqf",
    },

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
