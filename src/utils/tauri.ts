import { invoke } from "@tauri-apps/api";
import { Slide } from "yet-another-react-lightbox";
import { TDisk, TFolderData } from "./types";

export const get_disks = async () => await invoke<TDisk[]>("disks");
export const get_dir_items = async (path: string, showHidden: boolean = false) =>
  // TODO: frontend camelCase, backend snake_case
  await invoke<TFolderData>("get_dir_items", { path, showHidden });
export const generate_slides = async () => await invoke<(Slide & { index: number })[]>("generate_slides");
export const seach_in_dir = async (keyword: string) => await invoke<TFolderData>("seach_in_dir", { keyword });
