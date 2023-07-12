import { useAtomValue } from "jotai";
import { FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAsync } from "react-use";
import { ReactComponent as File } from "../assets/file.svg";
import { ReactComponent as FolderIcon } from "../assets/folder.svg";
import { showHiddenAtom } from "../utils/atoms";
import { get_folder_items } from "../utils/tauri";

const Folder: FC = () => {
  const navigate = useNavigate();
  const { state, pathname } = useLocation();
  const items = useAsync(async () => await get_folder_items(state.path), [state.path]);
  const showHidden = useAtomValue(showHiddenAtom);

  return items.value
    ?.filter((item) => (showHidden ? true : !item.is_hidden))
    .map((item, idx) => (
      <button
        disabled={!item.is_dir}
        key={idx}
        onClick={() =>
          navigate(pathname + item.path.replace("/", "") + "/", {
            state: { path: "/" + item.path.replace("/", "") + "/" },
          })
        }
        className="flex flex-row items-center text-sm hover:bg-gray-100 p-1 rounded-md gap-1"
      >
        <div className="text-right flex gap-2 flex-row items-center">
          {item.is_dir ? <FolderIcon className="h-4 w-4" /> : <File className="h-4 w-4" />}
          <p>{item.path.replace(state.path, "")}</p>
        </div>
      </button>
    ));
};

export default Folder;
