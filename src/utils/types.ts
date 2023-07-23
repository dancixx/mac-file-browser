export type TDisk = {
  name: string;
  file_system: string;
  kind: string;
  mount_point: string;
  total_space: number;
  available_space: number;
};

export type TFolderData = {
  folders_count: number;
  files_count: number;
  total_size: number;
  items: TEntry[];
};

export type TEntry = {
  extension: string;
  is_dir: boolean;
  is_hidden: boolean;
  modified: string;
  name: string;
  path: string;
  request_url: string;
  size: number;
};

export type TImage = "jpg" | "jpeg" | "png" | "gif" | "webp" | "bmp" | "tiff" | "ico" | "avif";
export type TVideo = "mp4" | "ogg" | "ogv" | "webm";
