import { Event } from "@tauri-apps/api/event";
import { appWindow } from "@tauri-apps/api/window";
import { useEffect } from "react";

// TODO: https://github.com/tauri-apps/tauri/issues/4630
const useWindowEvent = (name: string, callback: (event: Event<any>) => void) => {
  return useEffect(() => {
    let removeListener: any;

    const setUpListener = async () => {
      removeListener = await appWindow.listen(name, (event) => {
        callback(event as Event<any>);
      });
    };

    setUpListener().catch((error) => {
      console.error(`Could not set up window event listener. ${error}`);
    });

    return () => {
      removeListener?.();
    };
  }, [name, callback]);
};

export { useWindowEvent };
