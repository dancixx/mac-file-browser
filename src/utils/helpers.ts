import { terminal } from "virtual:terminal";
import { TImage, TVideo } from "./types";

export const bytesToSize = (bytes: number): string => {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (!bytes) return "0 Byte";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`;
};

export const checkImage = (extension: string): extension is TImage => {
  const images = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "tiff", "ico", "avif"] as const;
  return images.includes(extension as TImage);
};
export const checkVideo = (extension: string): extension is TVideo => {
  const videos = ["mp4", "ogg", "ogv", "webm"] as const;
  return videos.includes(extension as TVideo);
};

export const terminalConsole = (message: any) => terminal.log(JSON.stringify(message));
