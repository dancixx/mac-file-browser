import { appWindow } from "@tauri-apps/api/window";
import { useAtom } from "jotai";
import { useCallback, useEffect } from "react";
import { showHiddenAtom } from "../utils/atoms";

const useHiddenFiles = () => {
  const [showHidden, setShowHidden] = useAtom(showHiddenAtom);
  const updateHiddenFiles = useCallback(async () => {
    const unsubscribe = await appWindow.onMenuClicked(() => {
      setShowHidden(showHidden);
    });

    return unsubscribe;
  }, [showHidden, setShowHidden]);

  useEffect(() => {
    updateHiddenFiles();
  }, [updateHiddenFiles]);
};

export { useHiddenFiles };
