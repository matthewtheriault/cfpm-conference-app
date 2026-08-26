import { Alert, Platform } from "react-native";

type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
};

/**
 * react-native-web's Alert.alert is a no-op stub (browsers have no native
 * equivalent), so plain Alert.alert silently does nothing when running on
 * web — including confirm dialogs, which meant "Delete" buttons never
 * actually deleted anything there. This wraps it: native platforms get the
 * real Alert UI, web falls back to window.confirm/alert.
 */
export function showAlert(title: string, message?: string, buttons?: AlertButton[]) {
  if (Platform.OS !== "web") {
    Alert.alert(title, message, buttons);
    return;
  }

  const fullMessage = message ? `${title}\n\n${message}` : title;

  if (!buttons || buttons.length <= 1) {
    window.alert(fullMessage);
    buttons?.[0]?.onPress?.();
    return;
  }

  const confirmButton = buttons.find((b) => b.style !== "cancel") ?? buttons[buttons.length - 1];
  const cancelButton = buttons.find((b) => b.style === "cancel");

  if (window.confirm(fullMessage)) {
    confirmButton?.onPress?.();
  } else {
    cancelButton?.onPress?.();
  }
}
