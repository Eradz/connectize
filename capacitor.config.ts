import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "co.connectize.app",
  appName: "Connectize",
  webDir: "build/client",

  android: {
    buildOptions: {
      keystorePath: "app/mykeystore.jks",
      keystorePassword: "t11BPPOWTA0Fhcv7oyPE5ixpzdDU9EJMygnRosw0MKJtPg6Qqf",
      // keystoreAlias: "my-key-alias",
      keystoreAlias: "connectize",
      keystoreAliasPassword:
        "t11BPPOWTA0Fhcv7oyPE5ixpzdDU9EJMygnRosw0MKJtPg6Qqf",
      // releaseType: "APK",
    },
  },

  ios: {
    contentInset: "automatic",
    scrollEnabled: true,
  },

  server: {
    cleartext: true,
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      showSpinner: false,
    },
    StatusBar: {
      style: "light", // Light status bar for dark text
    },
    Keyboard: {
      resize: "body",
      style: "light",
      resizeOnFullScreen: true,
    },
  },
};

export default config;
