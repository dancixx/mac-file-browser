import { useAtomValue, useSetAtom } from "jotai";
import { FC, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAsync } from "react-use";
import { ReactComponent as File } from "../assets/file.svg";
import { ReactComponent as FolderIcon } from "../assets/folder.svg";
import Gallery from "../components/gallery";
import { showGalleryAtom, showHiddenAtom } from "../utils/atoms";
import { bytesToSize, checkImage, checkVideo } from "../utils/helpers";
import { generate_slides, get_folder_items } from "../utils/tauri";

const Folder: FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const showHidden = useAtomValue(showHiddenAtom);
  console.log(showHidden);
  const setShowGallery = useSetAtom(showGalleryAtom);
  const [index, setIndex] = useState(0);
  const items = useAsync(async () => await get_folder_items(state.path, showHidden), [state.path, showHidden]);
  const slides = useAsync(async () => await generate_slides(), [items.value]);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

  return (
    <>
      <Gallery slides={slides.value!} index={index} />
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
          {items.value
            ?.filter((item) => (showHidden ? true : !item.is_hidden))
            .map((item, idx) => (
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

                      if (item.extension === "pdf") {
                        setSelectedPdf(item.request_url);
                      }
                    }}
                    className="flex flex-row items-center hover:bg-gray-100 p-1 rounded-md gap-1"
                  >
                    <div className="text-right flex gap-2 flex-row items-center">
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
        </tbody>
      </table>
    </>
  );
};

export default Folder;
