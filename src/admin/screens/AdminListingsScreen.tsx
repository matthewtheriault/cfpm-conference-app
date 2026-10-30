import React from "react";
import { CollectionEditorScreen } from "../CollectionEditorScreen";
import { listingFields } from "../fieldConfigs";

export default function AdminListingsScreen() {
  return (
    <CollectionEditorScreen
      collectionPath="listings"
      fields={listingFields}
      titleField="title"
      subtitleField="kind"
      storageFolder="listings"
      stampCreatedAt
      emptyLabel="No practices for sale or job postings yet. Tap Add new to create the first one."
    />
  );
}
