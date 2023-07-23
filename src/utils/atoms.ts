import { atom } from "jotai";
import { TFolderData } from "./types";

export const showHiddenAtom = atom(false);
export const folderDataAtom = atom<null | Partial<TFolderData>>(null);
export const showGalleryAtom = atom(false);
