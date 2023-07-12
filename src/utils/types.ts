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
