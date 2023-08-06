import { atom } from "jotai";
import { TFolderData } from "../utils/types";

export const viewModeAtom = atom<"list" | "tree">("list");
export const showHiddenAtom = atom(false);
export const folderDataAtom = atom<null | Partial<TFolderData>>(null);
export const showGalleryAtom = atom(false);
