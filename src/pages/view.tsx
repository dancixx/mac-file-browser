import { useAtomValue } from "jotai";
import { FC } from "react";
import { viewModeAtom } from "../store/atoms";
import ListView from "../views/listView";
import TreeView from "../views/treeView";

const View: FC = () => {
  const viewMode = useAtomValue(viewModeAtom);

  if (viewMode === "tree") return <TreeView />;
  return <ListView />;
};

export default View;
