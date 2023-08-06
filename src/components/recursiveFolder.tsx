import { FC, PropsWithChildren, memo, useCallback, useState } from "react";
import { ReactComponent as Chevron } from "../assets/chevron.svg";
import { TEntry } from "../utils/types";

const RecursiveFolder: FC<PropsWithChildren & { items: TEntry[] }> = ({ children, items }) => {
  const [showNested, setShowNested] = useState({});

  const toggleNested = useCallback(
    (path: string) => {
      setShowNested((prev) => ({ ...prev, [path]: !prev[path] }));
    },
    [setShowNested]
  );

  return items?.map((item) => {
    if (!item.is_dir) {
      return <div key={item.path}>{item.name}</div>;
    }
    return (
      <div key={item.path} className="flex flex-row gap-1 items-center">
        <Chevron
          className="w-4 h-4"
          onClick={() => {
            toggleNested(item.path);
          }}
        />
        {item.name}
        {showNested[item.path] && <RecursiveFolder items={item.items} />}
      </div>
    );
  });
};

export default memo(RecursiveFolder);
