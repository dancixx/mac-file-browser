import clsx from "clsx";
import { useAtom, useAtomValue } from "jotai";
import { FC, PropsWithChildren } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ReactComponent as Back } from "../assets/back.svg";
import { ReactComponent as File } from "../assets/file.svg";
import { ReactComponent as FolderIcon } from "../assets/folder.svg";
import { ReactComponent as HiddenFiles } from "../assets/hiddenFiles.svg";
import { ReactComponent as SSD } from "../assets/ssd.svg";
import { folderDataAtom, showHiddenAtom, viewModeAtom } from "../store/atoms";
import { bytesToSize } from "../utils/helpers";
import { seach_in_dir } from "../utils/tauri";

const Layout: FC<PropsWithChildren> = ({ children }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [showHidden, setShowHidden] = useAtom(showHiddenAtom);
  const folderData = useAtomValue(folderDataAtom);
  const [viewMode, setViewMode] = useAtom(viewModeAtom);

  return (
    <div className="font-poppins flex justify-between flex-col h-screen">
      <div className="flex flex-col gap-4 mb-4 text-xs p-4">
        <div className="flex flex-row justify-between">
          <div className="flex w-1/2 flex-row items-center justify-start gap-1 truncate">
            <button onClick={() => navigate(-1)} className="hover:bg-gray-200 rounded-full p-1">
              <Back className="h-4 w-4" />
            </button>
            <p className="text-gray-400 truncate text">{pathname}</p>
          </div>
          <input
            type="text"
            onChange={(event) => seach_in_dir(event.target.value)}
            placeholder="Search"
            className="w-1/3 rounded-md p-2 border-2"
          />
        </div>
        {children}
      </div>
      <div className="flex min-h-[40px] flex-row items-center sticky justify-end gap-1 mt-4 p-2 bg-gray-200 bottom-0 text-xs">
        <button
          onClick={() => {
            if (viewMode === "list") {
              setViewMode("tree");
            }

            if (viewMode === "tree") {
              setViewMode("list");
            }
          }}
          className="text-gray-400 mr-2 hover:bg-white py-1 px-2 rounded-lg transition-all"
        >
          {viewMode === "list" ? "Tree" : "List"}
        </button>
        {viewMode === "list" && folderData && (
          <div className="flex flex-row text-xs gap-3">
            {!!folderData.folders_count && (
              <div className="flex flex-row gap-1">
                <FolderIcon className="w-4 h-4" />
                <span className="text-gray-400">{folderData.folders_count}</span>
              </div>
            )}
            {!!folderData.files_count && (
              <div className="flex flex-row gap-1">
                <File className="w-4 h-4" />
                <span className="text-gray-400">{folderData.files_count}</span>
              </div>
            )}
            {!!folderData.total_size && (
              <div className="flex flex-row gap-1">
                <SSD className="w-4 h-4" />
                <span className="text-gray-400">{bytesToSize(folderData.total_size)}</span>
              </div>
            )}
          </div>
        )}
        <button onClick={() => setShowHidden(!showHidden)} className="hover:bg-gray-300 rounded-full p-1">
          <HiddenFiles className={clsx("h-4 w-4", !showHidden && "opacity-40")} />
        </button>
      </div>
    </div>
  );
};

export default Layout;
