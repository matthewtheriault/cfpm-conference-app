import "dotenv/config";
import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "CFPM Conference",
  slug: "cfpm-conference",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  scheme: "cfpmconference",
  userInterfaceStyle: "light",
  ios: {
    // Not tested/optimized for iPad layouts yet - keeps App Review scoped to
    // iPhone. Flip to true (and add iPad screenshots) once it's been tried.
    supportsTablet: false,
    bundleIdentifier: "org.cfpm.conference",
    infoPlist: {
      UIBackgroundModes: ["remote-notification"],
      NSPhotoLibraryUsageDescription:
        "Admin mode uses your photo library to upload speaker headshots, logos, and map images.",
      // Only standard HTTPS/TLS is used (Firebase, Cloudinary, Expo's push
      // service) - this skips the export-compliance prompt on every build.
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: "org.cfpm.conference",
    adaptiveIcon: {
      backgroundColor: "#EE3A43",
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
    permissions: ["NOTIFICATIONS"],
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    [
      "expo-splash-screen",
      {
        image: "./assets/splash-icon.png",
        imageWidth: 220,
        resizeMode: "contain",
        backgroundColor: "#EE3A43",
      },
    ],
    [
      "expo-notifications",
      {
        icon: "./assets/android-icon-foreground.png",
        color: "#EE3A43",
      },
    ],
    "@react-native-community/datetimepicker",
  ],
  extra: {
    firebase: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
    },
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
    },
    eas: {
      projectId: process.env.EAS_PROJECT_ID,
    },
  },
};

export default config;
