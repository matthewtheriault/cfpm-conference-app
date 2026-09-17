import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "cfpm.deviceId";

let cached: string | null = null;
let pending: Promise<string> | null = null;

function randomId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * A random id persisted on-device, used only to let the app remember "this
 * device already answered this poll" — there's no real per-user account to
 * key on.
 *
 * Concurrent callers (name save, check-in, exhibitor scan can all fire close
 * together) must share one in-flight lookup/creation, not race independent
 * AsyncStorage reads - otherwise each sees no cached/stored value yet and
 * mints its own id, splitting one device across several ids.
 */
export async function getDeviceId(): Promise<string> {
  if (cached) return cached;
  if (!pending) {
    pending = (async () => {
      const existing = await AsyncStorage.getItem(STORAGE_KEY);
      if (existing) {
        cached = existing;
        return existing;
      }
      const created = randomId();
      await AsyncStorage.setItem(STORAGE_KEY, created);
      cached = created;
      return created;
    })();
  }
  return pending;
}
