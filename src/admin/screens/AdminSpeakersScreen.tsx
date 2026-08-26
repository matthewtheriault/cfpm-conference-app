import React from "react";
import { CollectionEditorScreen } from "../CollectionEditorScreen";
import { speakerFields } from "../fieldConfigs";

export default function AdminSpeakersScreen() {
  return (
    <CollectionEditorScreen
      collectionPath="speakers"
      fields={speakerFields}
      titleField="name"
      subtitleField="title"
      storageFolder="speakers"
      emptyLabel="No speakers yet. Tap Add new to create the first one."
    />
  );
}
