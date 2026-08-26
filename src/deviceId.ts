import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "cfpm.deviceId";

let cached: string | null = null;

function randomId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * A random id persisted on-device, used only to let the app remember "this
 * device already answered this poll" — there's no real per-user account to
 * key on.
 */
export async function getDeviceId(): Promise<string> {
  if (cached) return cached;
  const existing = await AsyncStorage.getItem(STORAGE_KEY);
  if (existing) {
    cached = existing;
    return existing;
  }
  const created = randomId();
  await AsyncStorage.setItem(STORAGE_KEY, created);
  cached = created;
  return created;
}
