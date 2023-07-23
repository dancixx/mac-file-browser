import clsx from "clsx";
import { useAtom, useAtomValue } from "jotai";
import { FC, PropsWithChildren } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ReactComponent as Back } from "../assets/back.svg";
import { ReactComponent as File } from "../assets/file.svg";
import { ReactComponent as FolderIcon } from "../assets/folder.svg";
import { ReactComponent as HiddenFiles } from "../assets/hiddenFiles.svg";
import { ReactComponent as SSD } from "../assets/ssd.svg";
import { folderDataAtom, showHiddenAtom } from "../utils/atoms";
import { bytesToSize } from "../utils/helpers";

const Layout: FC<PropsWithChildren> = ({ children }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [showHidden, setShowHidden] = useAtom(showHiddenAtom);
  const folderData = useAtomValue(folderDataAtom);

  return (
    <div className="font-poppins flex justify-between flex-col h-screen">
      <div className="flex flex-col gap-4 mb-4 text-xs p-4">
        <div className="flex w-1/2 flex-row items-center justify-start gap-1 relative truncate">
          <button onClick={() => navigate(-1)} className="hover:bg-gray-200 rounded-full p-1">
            <Back className="h-4 w-4" />
          </button>
          <p className="text-gray-400 truncate text">{pathname}</p>
        </div>
        {children}
      </div>
      <div className="flex min-h-[40px] flex-row items-center sticky justify-end gap-1 mt-4 p-2 bg-gray-200 bottom-0">
        {folderData && (
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
