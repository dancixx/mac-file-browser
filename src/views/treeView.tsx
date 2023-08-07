import { useAtomValue } from "jotai";
import { FC } from "react";
import { useLocation } from "react-router-dom";
import { useAsync } from "react-use";
import RecursiveFolder from "../components/recursiveFolder";
import { showHiddenAtom } from "../store/atoms";
import { get_dir_items } from "../utils/tauri";

const TreeView: FC = () => {
  const { state } = useLocation();
  const showHidden = useAtomValue(showHiddenAtom);
  const items = useAsync(async () => {
    const data = await get_dir_items(state.path, showHidden);
    return data.items;
  }, [state.path, showHidden]);

  return <RecursiveFolder items={items.value!} />;
};

export default TreeView;
