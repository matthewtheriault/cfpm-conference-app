import React from "react";
import { CollectionEditorScreen } from "../CollectionEditorScreen";
import { exhibitorFields } from "../fieldConfigs";

export default function AdminExhibitorsScreen() {
  return (
    <CollectionEditorScreen
      collectionPath="exhibitors"
      fields={exhibitorFields}
      titleField="name"
      subtitleField="boothNumber"
      storageFolder="exhibitors"
      emptyLabel="No exhibitors yet. Tap Add new to create the first one."
    />
  );
}
