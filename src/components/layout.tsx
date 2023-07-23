import clsx from "clsx";
import { useAtom } from "jotai";
import { FC, PropsWithChildren } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ReactComponent as Back } from "../assets/back.svg";
import { ReactComponent as HiddenFiles } from "../assets/hiddenFiles.svg";
import { showHiddenAtom } from "../utils/atoms";

const Layout: FC<PropsWithChildren> = ({ children }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [showHidden, setShowHidden] = useAtom(showHiddenAtom);

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
      <div className="flex h-10 flex-row items-center justify-end gap-1 mt-4 px-2 bg-gray-200">
        <button onClick={() => setShowHidden(!showHidden)} className="hover:bg-gray-300 rounded-full p-1">
          <HiddenFiles className={clsx("h-4 w-4", !showHidden && "opacity-40")} />
        </button>
      </div>
    </div>
  );
};

export default Layout;
