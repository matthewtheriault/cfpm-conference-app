import AsyncStorage from "@react-native-async-storage/async-storage";

const keyFor = (pollId: string) => `cfpm.pollAnswered.${pollId}`;

export async function hasAnsweredPoll(pollId: string): Promise<boolean> {
  return (await AsyncStorage.getItem(keyFor(pollId))) === "true";
}

export async function markPollAnswered(pollId: string): Promise<void> {
  await AsyncStorage.setItem(keyFor(pollId), "true");
}
