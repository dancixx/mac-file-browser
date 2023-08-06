import { useAtomValue } from "jotai";
import { FC, useCallback, useState } from "react";
import { ReactComponent as Chevron } from "../assets/chevron.svg";
import { showHiddenAtom } from "../store/atoms";
import { get_dir_items } from "../utils/tauri";
import { TEntry } from "../utils/types";

const RecursiveFolder: FC<{ items: TEntry[] }> = ({ items }) => {
  const showHidden = useAtomValue(showHiddenAtom);
  const [nestedItems, setNestedItems] = useState<Record<string, TEntry[]>>(
    items.reduce((acc, item) => ({ ...acc, [item.path]: [] }), {})
  );
  console.log(nestedItems);
  const [showNested, setShowNested] = useState<Record<string, boolean>>({});
  const toggleNested = useCallback(
    (path: string) => {
      setShowNested((prev) => ({ ...prev, [path]: !prev[path] }));
    },
    [setShowNested]
  );

  return items?.map((item, _, array) => {
    const dirs = array.filter((item) => item.is_dir);
    if (!item.is_dir)
      return (
        <div key={item.path} className={"cursor-pointer" + (!!dirs.length ? " ml-5" : " ml-1")}>
          {item.name}
        </div>
      );
    return (
      <div key={item.path} className="flex flex-col">
        <button
          onClick={async () => {
            const data = await get_dir_items(item.path, showHidden);
            setNestedItems((prev) => ({ ...prev, [item.path]: data.items }));

            toggleNested(item.path);
          }}
          className="flex flex-row gap-1 items-center"
        >
          <Chevron className={"w-4 h-4 transition-all" + (showNested[item.path] ? " transform rotate-90" : "")} />
          {item.name}
        </button>
        {showNested[item.path] && (
          <div className="ml-4">
            <RecursiveFolder items={nestedItems[item.path]} />
          </div>
        )}
      </div>
    );
  });
};

export default RecursiveFolder;
