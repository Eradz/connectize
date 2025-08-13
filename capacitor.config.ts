import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.connectize.app",
  appName: "Connectize",
  webDir: "build",
  android: {
    buildOptions: {
      keystorePath: "app/mykeystore.jks",
      keystorePassword: "t11BPPOWTA0Fhcv7oyPE5ixpzdDU9EJMygnRosw0MKJtPg6Qqf",
      // keystoreAlias: "my-key-alias",
      keystoreAlias: "connectize",
      keystoreAliasPassword:
        "t11BPPOWTA0Fhcv7oyPE5ixpzdDU9EJMygnRosw0MKJtPg6Qqf",
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
