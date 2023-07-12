import { useAtom } from "jotai";
import { FC, PropsWithChildren } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ReactComponent as Back } from "../assets/back.svg";
import { showHiddenAtom } from "../utils/atoms";

const Layout: FC<PropsWithChildren> = ({ children }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [showHidden, setShowHidden] = useAtom(showHiddenAtom);

  return (
    <div className="p-4 font-poppins">
      <div className="flex flex-row items-center gap-4 mb-4 justify-between text-xs">
        <div className="flex w-1/2 flex-row items-center justify-start gap-1 relative truncate">
          <button onClick={() => navigate(-1)} className="hover:bg-gray-200 rounded-full p-1">
            <Back className="h-4 w-4" />
          </button>
          <p className="text-gray-400 truncate text">{pathname}</p>
        </div>
        <div className="flex flex-row items-center justify-center gap-1">
          <p className="text-gray-400">Show hidden files</p>
          <input type="checkbox" checked={showHidden} onChange={() => setShowHidden(!showHidden)} />
        </div>
      </div>
      {children}
    </div>
  );
};

export default Layout;
