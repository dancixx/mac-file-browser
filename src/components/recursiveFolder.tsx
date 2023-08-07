import { useAtom, useAtomValue } from "jotai";
import { FC, useCallback, useEffect, useState } from "react";
import { ReactComponent as Chevron } from "../assets/chevron.svg";
import { ReactComponent as File } from "../assets/file.svg";
import { ReactComponent as FolderIcon } from "../assets/folder.svg";
import { showHiddenAtom, treeViewLastSelectedAtom } from "../store/atoms";
import { get_dir_items } from "../utils/tauri";
import { TEntry } from "../utils/types";

const RecursiveFolder: FC<{ items: TEntry[] }> = ({ items }) => {
  const showHidden = useAtomValue(showHiddenAtom);
  const [lastPath, setLastPath] = useAtom(treeViewLastSelectedAtom);
  const [nestedItems, setNestedItems] = useState<Record<string, TEntry[]>>({});
  useEffect(() => {
    setNestedItems((prev) => items?.reduce((acc, item) => ({ ...acc, [item.path]: prev ? prev[item.path] : [] }), {}));
  }, [items]);
  const [showNested, setShowNested] = useState<Record<string, boolean>>({});
  const toggleNested = useCallback(
    (path: string) => {
      setShowNested((prev) => ({ ...prev, [path]: !prev[path] }));
    },
    [setShowNested]
  );

  return (
    <div className="flex flex-col">
      {items?.map((item, _, array) => {
        const dirs = array.filter((item) => item.is_dir);

        return (
          <div>
            {!item.is_dir ? (
              <div
                key={item.path}
                className={
                  "cursor-pointer flex flex-row hover:bg-gray-100 rounded-md py-1 gap-1" +
                  (!!dirs.length ? " ml-5" : " ml-1")
                }
              >
                <File className="h-4 w-4" />
                {item.name}
              </div>
            ) : (
              <div key={item.path} className="flex flex-col">
                <button
                  onClick={async () => {
                    const data = await get_dir_items(item.path, showHidden);
                    setNestedItems((prev) => ({ ...prev, [item.path]: data.items }));
                    setLastPath(item.path);
                    toggleNested(item.path);
                  }}
                  className={
                    "flex flex-row gap-1 items-center py-1 rounded-md" +
                    (lastPath === item.path ? " bg-gray-300 font-bold" : " hover:bg-gray-100 rounded-md")
                  }
                >
                  <Chevron
                    className={"w-4 h-4 transition-all" + (showNested[item.path] ? " transform rotate-90" : "")}
                  />
                  <FolderIcon className="h-4 w-4" />
                  {item.name}
                </button>
                {showNested[item.path] && (
                  <div className="ml-4">
                    <RecursiveFolder items={nestedItems[item.path]} />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RecursiveFolder;
