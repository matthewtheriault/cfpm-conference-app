import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// Values come from app.config.ts -> expo.extra.firebase, which reads from
// your .env file (see .env.example). See README.md for full setup steps.
const firebaseConfig = (Constants.expoConfig?.extra?.firebase ?? {}) as {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
};

export const firebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Web persists auth state automatically. On iOS/Android this needs to be set
// up explicitly with AsyncStorage, or admin sign-in only lasts until the app
// is killed (falls back to in-memory-only persistence otherwise).
function createAuth() {
  if (Platform.OS === "web") {
    return getAuth(app);
  }
  try {
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    // Already initialized (e.g. Fast Refresh re-running this module).
    return getAuth(app);
  }
}

export const auth = createAuth();
export const db = getFirestore(app);
export default app;
