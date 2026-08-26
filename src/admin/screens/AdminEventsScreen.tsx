import React from "react";
import { CollectionEditorScreen } from "../CollectionEditorScreen";
import { eventFields } from "../fieldConfigs";

export default function AdminEventsScreen() {
  return (
    <CollectionEditorScreen
      collectionPath="events"
      fields={eventFields}
      titleField="title"
      subtitleField="date"
      storageFolder="events"
      emptyLabel="No events yet. Tap Add new to create the first one."
    />
  );
}
