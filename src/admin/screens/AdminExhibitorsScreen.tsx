import React from "react";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { CollectionEditorScreen } from "../CollectionEditorScreen";
import { exhibitorFields } from "../fieldConfigs";
import { colors } from "../../theme";

export default function AdminExhibitorsScreen() {
  const navigation = useNavigation<any>();

  return (
    <CollectionEditorScreen
      collectionPath="exhibitors"
      fields={exhibitorFields}
      titleField="name"
      subtitleField="boothNumber"
      storageFolder="exhibitors"
      emptyLabel="No exhibitors yet. Tap Add new to create the first one."
      renderRowAction={(item) => (
        <Pressable
          hitSlop={12}
          style={{ marginRight: 14 }}
          onPress={() =>
            navigation.navigate("AdminExhibitorQR", {
              exhibitorId: item.id,
              name: item.name,
              boothNumber: item.boothNumber,
            })
          }
        >
          <Ionicons name="qr-code-outline" size={20} color={colors.primary} />
        </Pressable>
      )}
    />
  );
}
