import React from "react";
import { CollectionEditorScreen } from "../CollectionEditorScreen";
import { boardMemberFields } from "../fieldConfigs";

export default function AdminBoardScreen() {
  return (
    <CollectionEditorScreen
      collectionPath="boardMembers"
      fields={boardMemberFields}
      titleField="name"
      subtitleField="role"
      storageFolder="board"
      emptyLabel="No board members or staff yet. Tap Add new to create the first one."
    />
  );
}
