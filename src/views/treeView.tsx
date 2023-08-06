import { useAtomValue, useSetAtom } from "jotai";
import { FC, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useLocation, useNavigate } from "react-router-dom";
import { useAsync } from "react-use";
import RecursiveFolder from "../components/recursiveFolder";
import { folderDataAtom, showGalleryAtom, showHiddenAtom } from "../store/atoms";
import { generate_slides, get_dir_items } from "../utils/tauri";

const TreeView: FC = () => {
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
  return <RecursiveFolder items={items.value!} />;
};

export default TreeView;
