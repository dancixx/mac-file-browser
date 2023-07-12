import { invoke } from "@tauri-apps/api";
import { TDisk, TEntry } from "./types";

export const get_disks = async () => await invoke<TDisk[]>("disks");
export const get_folder_items = async (path: string) => await invoke<TEntry[]>("get_folder_items", { path });
