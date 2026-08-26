import type { Persistence, ReactNativeAsyncStorage } from "firebase/auth";

// `getReactNativePersistence` genuinely exists at runtime (Metro resolves it
// through the "firebase" wrapper package's re-export of @firebase/auth's
// React Native build), but the wrapper package's own `exports` map doesn't
// expose a "react-native" condition, so plain `tsc` resolution can't see the
// type. See src/firebase.ts for the actual usage.
declare module "firebase/auth" {
  export function getReactNativePersistence(storage: ReactNativeAsyncStorage): Persistence;
}
