import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { folderDataAtom } from "../utils/atoms";

const useClearFolderData = () => {
  const location = useLocation();
  const setFolderData = useSetAtom(folderDataAtom);

  useEffect(() => {
    if (location.pathname === "/") {
      setFolderData(null);
    }
  }, [location]);
};

export { useClearFolderData };
