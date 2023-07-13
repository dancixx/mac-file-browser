export type TDisk = {
  name: string;
  file_system: string;
  kind: string;
  mount_point: string;
  total_space: number;
  available_space: number;
};

export type TEntry = {
  path: string;
  is_dir: boolean;
  is_hidden: boolean;
  extension: string;
  size: number;
  modified: string;
  name: string;
};

export type TImage = "jpg" | "jpeg" | "png" | "gif" | "webp" | "svg" | "bmp" | "tiff" | "ico" | "avif";
export type TVideo =
  | "mp4"
  | "webm"
  | "ogg"
  | "mov"
  | "avi"
  | "wmv"
  | "flv"
  | "mkv"
  | "m4v"
  | "m4p"
  | "mpg"
  | "mpeg"
  | "3gp"
  | "3g2";
