import React from "react";
import { CollectionEditorScreen } from "../CollectionEditorScreen";
import { sponsorFields } from "../fieldConfigs";

export default function AdminSponsorsScreen() {
  return (
    <CollectionEditorScreen
      collectionPath="sponsors"
      fields={sponsorFields}
      titleField="name"
      subtitleField="tier"
      storageFolder="sponsors"
      emptyLabel="No sponsors yet. Tap Add new to create the first one."
    />
  );
}
