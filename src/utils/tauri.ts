import { invoke } from "@tauri-apps/api";
import { Slide } from "yet-another-react-lightbox";
import { TDisk, TEntry } from "./types";

export const get_disks = async () => await invoke<TDisk[]>("disks");
export const get_folder_items = async (path: string, showHidden: boolean = false) =>
  // TODO: frontend camelCase, backend snake_case
  await invoke<TEntry[]>("get_folder_items", { path, showHidden });
export const generate_slides = async () => await invoke<(Slide & { index: number })[]>("generate_slides");
