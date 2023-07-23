import clsx from "clsx";
import { useAtomValue, useSetAtom } from "jotai";
import { FC, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useLocation, useNavigate } from "react-router-dom";
import { useAsync } from "react-use";
import { ReactComponent as File } from "../assets/file.svg";
import { ReactComponent as FolderIcon } from "../assets/folder.svg";
import Gallery from "../components/gallery";
import { folderDataAtom, showGalleryAtom, showHiddenAtom } from "../utils/atoms";
import { bytesToSize, checkImage, checkVideo } from "../utils/helpers";
import { generate_slides, get_dir_items } from "../utils/tauri";

const Folder: FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const showHidden = useAtomValue(showHiddenAtom);
  const setShowGallery = useSetAtom(showGalleryAtom);
  const [index, setIndex] = useState(0);
  const setFolderData = useSetAtom(folderDataAtom);
  const items = useAsync(async () => {
    const data = await get_dir_items(state.path, showHidden);

    setFolderData({
      total_size: data.total_size,
      files_count: data.files_count,
      folders_count: data.folders_count,
    });

    return data.items;
  }, [state.path, showHidden]);
  const [page, setPage] = useState(1);
  const paginatedItems = useMemo(() => {
    const end = 0 + (page * 50 || 50);

    return items.value?.slice(0, end) ?? [];
  }, [items, page]);
  const slides = useAsync(async () => await generate_slides(), [items.value]);
  const slidesStartIndex = useMemo(() => slides.value?.findIndex((slide) => slide.index === index), [slides, index]);
  const { ref, inView } = useInView({
    threshold: 1,
    onChange: (inView) => {
      if (inView) {
        setPage((prev) => prev + 1);
      }
    },
  });

  return (
    <>
      <Gallery slides={slides.value!} index={slidesStartIndex!} />
      <table className="table-fixed w-full text-xs">
        <thead>
          <tr>
            <th className="text-left">Name</th>
            <th className="text-center">Size</th>
            <th className="text-center">Date Modified</th>
            <th className="text-center">Type</th>
          </tr>
        </thead>
        <tbody>
          {paginatedItems?.map((item, idx) => (
            <tr key={idx}>
              <td className="text-left overflow-hidden">
                <button
                  onClick={async () => {
                    if (item.is_dir) {
                      navigate(item.path.replace("/", "") + "/", {
                        state: { path: "/" + item.path.replace("/", "") + "/" },
                      });
                    }

                    if (checkImage(item.extension) || checkVideo(item.extension)) {
                      setIndex(idx);
                      setShowGallery(true);
                    }
                  }}
                  className="flex flex-row items-center hover:bg-gray-100 p-1 rounded-md gap-1"
                >
                  <div
                    className={clsx("text-right flex gap-2 flex-row items-center", item.is_hidden && "text-gray-400")}
                  >
                    {item.is_dir ? <FolderIcon className="h-4 w-4" /> : <File className="h-4 w-4" />}
                    <p className="truncate">{item.name}</p>
                  </div>
                </button>
              </td>
              <td className="text-center">{item.is_dir ? "--" : bytesToSize(item.size)}</td>
              <td className="text-center">{item.modified}</td>
              <td className="text-center">{item.is_dir ? "Folder" : item.extension}</td>
            </tr>
          ))}
          <tr ref={ref}>
            <td colSpan={4} className="text-center">
              {inView && items.value?.length === page * 25 && <p>Loading...</p>}
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default Folder;
